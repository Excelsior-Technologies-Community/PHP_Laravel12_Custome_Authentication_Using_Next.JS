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
            'password' => Hash::make($request->password)
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

        $credentials = $request->only('email', 'password');

        if (!$token = auth('customer')->attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid Credentials'
            ], 401);
        }

        $customer = auth('customer')->user();

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
            'customer' => $customer
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
            'password' => 'required|confirmed|min:6'
        ]);

        if (!Hash::check($request->current_password, $customer->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current Password is incorrect.'
            ], 400);
        }

        $customer->password = Hash::make($request->password);
        $customer->save();

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

        // Update latest login history
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
