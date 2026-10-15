<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;
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

        $sessionId = (string) Str::uuid();

        // Generate JWT Token with session_id claim
        if (!$token = auth('customer')->claims(['session_id' => $sessionId])->attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Unable to login'
            ], 401);
        }

        // Reset failed attempts
        $customer->resetFailedAttempts();

        // Store Login History with session_id
        LoginHistory::create([
            'customer_id' => $customer->id,
            'session_id' => $sessionId,
            'ip_address' => $request->ip(),
            'browser' => $request->userAgent(),
            'login_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Login Successful',
            'token' => $token,
            'session_id' => $sessionId,
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
     * Forgot Password - Send 6-digit OTP
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:customers,email',
        ], [
            'email.exists' => 'No customer account found with this email address.'
        ]);

        $otp = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => Hash::make($otp),
                'created_at' => now()
            ]
        );

        Log::info("Password Reset OTP for {$request->email}: {$otp}");

        return response()->json([
            'success' => true,
            'message' => 'A 6-digit password reset OTP has been sent to your email.',
            'otp' => $otp // Included for convenient local demo/testing
        ]);
    }

    /**
     * Reset Password using OTP
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:customers,email',
            'otp' => 'required|string|size:6',
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

        $resetRecord = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$resetRecord) {
            return response()->json([
                'success' => false,
                'message' => 'No password reset request found for this email. Please request a new OTP.'
            ], 400);
        }

        // Check if OTP has expired (15 minutes validity)
        if (Carbon::parse($resetRecord->created_at)->addMinutes(15)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'success' => false,
                'message' => 'OTP has expired. Please request a new code.'
            ], 400);
        }

        if (!Hash::check($request->otp, $resetRecord->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid OTP code. Please enter the correct 6-digit code.'
            ], 400);
        }

        $customer = Customer::where('email', $request->email)->first();
        $customer->update([
            'password' => Hash::make($request->password),
            'password_changed_at' => now(),
            'failed_attempts' => 0,
            'locked_until' => null,
        ]);

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password has been reset successfully. You can now login with your new password.'
        ]);
    }

    /**
     * Refresh JWT Token
     */
    public function refreshToken()
    {
        try {
            $newToken = auth('customer')->refresh();

            return response()->json([
                'success' => true,
                'token' => $newToken,
                'message' => 'Token refreshed successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unable to refresh token. Please login again.'
            ], 401);
        }
    }

    /**
     * Active Devices / Sessions List
     */
    public function activeSessions(Request $request)
    {
        $customer = auth('customer')->user();
        $currentSessionId = null;

        try {
            $currentSessionId = auth('customer')->payload()->get('session_id');
        } catch (\Exception $e) {}

        $sessions = LoginHistory::where('customer_id', $customer->id)
            ->whereNull('logout_at')
            ->where('login_at', '>=', now()->subDays(30))
            ->latest('login_at')
            ->get()
            ->map(function ($item) use ($currentSessionId, $request) {
                $isCurrent = false;
                if ($currentSessionId && $item->session_id === $currentSessionId) {
                    $isCurrent = true;
                } elseif (!$currentSessionId && $item->ip_address === $request->ip()) {
                    $isCurrent = true;
                }
                $item->is_current = $isCurrent;
                return $item;
            });

        return response()->json([
            'success' => true,
            'sessions' => $sessions
        ]);
    }

    /**
     * Revoke Specific Session
     */
    public function revokeSession($id)
    {
        $customer = auth('customer')->user();

        $session = LoginHistory::where('customer_id', $customer->id)->where('id', $id)->first();

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Device session not found.'
            ], 404);
        }

        $session->update([
            'logout_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Device session revoked successfully.'
        ]);
    }

    /**
     * Revoke All Other Devices
     */
    public function revokeAllOtherSessions(Request $request)
    {
        $customer = auth('customer')->user();
        $currentSessionId = null;

        try {
            $currentSessionId = auth('customer')->payload()->get('session_id');
        } catch (\Exception $e) {}

        $query = LoginHistory::where('customer_id', $customer->id)->whereNull('logout_at');

        if ($currentSessionId) {
            $query->where('session_id', '!=', $currentSessionId);
        } else {
            $latestId = LoginHistory::where('customer_id', $customer->id)->latest('login_at')->value('id');
            if ($latestId) {
                $query->where('id', '!=', $latestId);
            }
        }

        $revokedCount = $query->update([
            'logout_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => "Logged out from {$revokedCount} other device(s) successfully."
        ]);
    }

    /**
     * Logout
     */
    public function logout()
    {
        $customer = auth('customer')->user();

        $sessionId = null;
        try {
            $sessionId = auth('customer')->payload()->get('session_id');
        } catch (\Exception $e) {}

        if ($sessionId) {
            LoginHistory::where('session_id', $sessionId)
                ->whereNull('logout_at')
                ->update(['logout_at' => now()]);
        } else {
            $history = LoginHistory::where('customer_id', $customer->id)
                ->whereNull('logout_at')
                ->latest()
                ->first();

            if ($history) {
                $history->update([
                    'logout_at' => now()
                ]);
            }
        }

        auth('customer')->logout();

        return response()->json([
            'success' => true,
            'message' => 'Logged Out Successfully'
        ]);
    }
}