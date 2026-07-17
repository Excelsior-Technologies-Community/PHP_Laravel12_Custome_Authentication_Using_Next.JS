<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Customer;
use App\Models\LoginHistory;

class CustomerAuthController extends Controller
{
    /**
     * Register Customer
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:customers,email',
            'password' => 'required|confirmed|min:6'
        ]);

        $customer = Customer::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'password_changed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Registered Successfully',
            'customer' => $customer
        ], 201);
    }

    /**
     * Login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $customer = Customer::where('email', $request->email)->first();

        // Customer not found
        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid Credentials'
            ], 401);
        }

        // Check account lock
        if ($customer->isLocked()) {
            return response()->json([
                'success' => false,
                'message' => 'Account is locked due to multiple failed login attempts.',
                'locked_until' => $customer->locked_until->format('Y-m-d H:i:s')
            ], 423);
        }

        // Wrong password
        if (!Hash::check($request->password, $customer->password)) {

            $customer->incrementFailedAttempts();

            $remainingAttempts = max(0, 5 - $customer->failed_attempts);

            if ($customer->isLocked()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many failed attempts. Account locked for 10 minutes.',
                    'locked_until' => $customer->locked_until->format('Y-m-d H:i:s')
                ], 423);
            }

            return response()->json([
                'success' => false,
                'message' => 'Invalid Credentials',
                'remaining_attempts' => $remainingAttempts
            ], 401);
        }

        // Generate JWT Token
        if (!$token = auth('customer')->attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Unable to login'
            ], 401);
        }

        // Reset failed attempts
        $customer->resetFailedAttempts();

        // Store Login History
        LoginHistory::create([
            'customer_id' => $customer->id,
            'ip_address' => $request->ip(),
            'browser' => $request->userAgent(),
            'login_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Login Successful',
            'token' => $token,
            'customer' => auth('customer')->user()
        ]);
    }

    /**
     * Profile
     */
    public function profile()
    {
        return response()->json([
            'success' => true,
            'customer' => auth('customer')->user()
        ]);
    }

    /**
     * Update Profile
     */
    public function updateProfile(Request $request)
    {
        $customer = auth('customer')->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:customers,email,' . $customer->id,
        ]);

        $customer->update([
            'name' => $request->name,
            'email' => $request->email
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profile Updated Successfully',
            'customer' => $customer
        ]);
    }

    /**
     * Change Password
     */
    public function changePassword(Request $request)
    {
        $customer = auth('customer')->user();

        $request->validate([
            'current_password' => 'required',
            'password' => [
                'required',
                'confirmed',
                'min:8',
                'regex:/[a-z]/',
                'regex:/[A-Z]/',
                'regex:/[0-9]/',
                'regex:/[@$!%*#?&]/'
            ]
        ], [
            'password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character.'
        ]);

        if (!Hash::check($request->current_password, $customer->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current Password is incorrect.'
            ], 400);
        }

        $customer->update([
            'password' => Hash::make($request->password),
            'password_changed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password Changed Successfully'
        ]);
    }

    /**
     * Logout
     */
    public function logout()
    {
        $customer = auth('customer')->user();

        $history = LoginHistory::where('customer_id', $customer->id)
            ->whereNull('logout_at')
            ->latest()
            ->first();

        if ($history) {
            $history->update([
                'logout_at' => now()
            ]);
        }

        auth('customer')->logout();

        return response()->json([
            'success' => true,
            'message' => 'Logged Out Successfully'
        ]);
    }
}