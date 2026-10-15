<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\LoginHistory;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Dashboard Statistics
     */
    public function index()
    {
        $customer = auth('customer')->user();

        $totalCustomers = Customer::count();

        $todayCustomers = Customer::whereDate('created_at', today())->count();

        $totalLogins = LoginHistory::count();

        $myLogins = LoginHistory::where('customer_id', $customer->id)->count();

        $lastLogin = LoginHistory::where('customer_id', $customer->id)
            ->latest('login_at')
            ->first();

        $lastLogout = LoginHistory::where('customer_id', $customer->id)
            ->whereNotNull('logout_at')
            ->latest('logout_at')
            ->first();

        return response()->json([
            'success' => true,

            'statistics' => [

                'total_customers' => $totalCustomers,

                'today_registered' => $todayCustomers,

                'total_logins' => $totalLogins,

                'my_logins' => $myLogins,

                'last_login' => optional($lastLogin)->login_at,

                'last_logout' => optional($lastLogout)->logout_at,

                'failed_attempts' => $customer->failed_attempts,

                'account_locked' => $customer->isLocked(),

                'locked_until' => $customer->locked_until,

                'password_changed_at' => $customer->password_changed_at,

                'account_created' => $customer->created_at,
            ]
        ]);
    }

    /**
     * Login History
     */
    public function loginHistory(Request $request)
    {
        $customer = auth('customer')->user();

        $history = LoginHistory::where('customer_id', $customer->id)

            ->when($request->search, function ($query) use ($request) {
                $query->where(function ($q) use ($request) {
                    $q->where('browser', 'LIKE', '%' . $request->search . '%')
                      ->orWhere('ip_address', 'LIKE', '%' . $request->search . '%');
                });
            })

            ->when($request->from_date, function ($query) use ($request) {
                $query->whereDate('login_at', '>=', $request->from_date);
            })

            ->when($request->to_date, function ($query) use ($request) {
                $query->whereDate('login_at', '<=', $request->to_date);
            })

            ->latest('login_at')

            ->paginate(5);

        return response()->json([
            'success' => true,
            'history' => $history
        ]);
    }

    /**
     * Security Dashboard
     */
    public function security()
    {
        $customer = auth('customer')->user();

        $lastLogin = LoginHistory::where('customer_id', $customer->id)
            ->latest('login_at')
            ->first();

        $lastLogout = LoginHistory::where('customer_id', $customer->id)
            ->whereNotNull('logout_at')
            ->latest('logout_at')
            ->first();

        return response()->json([

            'success' => true,

            'security' => [

                'customer_name' => $customer->name,

                'customer_email' => $customer->email,

                'failed_attempts' => $customer->failed_attempts,

                'account_locked' => $customer->isLocked(),

                'locked_until' => $customer->locked_until,

                'password_changed_at' => $customer->password_changed_at,

                'account_created' => $customer->created_at,

                'last_login' => optional($lastLogin)->login_at,

                'last_logout' => optional($lastLogout)->logout_at,

                'total_logins' => LoginHistory::where('customer_id', $customer->id)->count(),
            ]
        ]);
    }

    /**
     * Security & Activity Analytics
     */
    public function analytics()
    {
        $customer = auth('customer')->user();

        // 1. Last 7 Days Activity (Successful vs Failed)
        $sevenDaysActivity = [];
        for ($i = 6; $i >= 0; $i--) {
            $dateObj = now()->subDays($i);
            $dateString = $dateObj->format('Y-m-d');
            $label = $dateObj->format('d M');

            $successful = LoginHistory::where('customer_id', $customer->id)
                ->whereDate('login_at', $dateString)
                ->count();

            // Check if current day has failed attempts recorded on customer
            $failed = ($i === 0) ? (int)$customer->failed_attempts : 0;

            $sevenDaysActivity[] = [
                'date' => $dateString,
                'label' => $label,
                'successful' => $successful,
                'failed' => $failed,
            ];
        }

        // 2. Device Breakdown
        $allLogins = LoginHistory::where('customer_id', $customer->id)->get();
        $desktopCount = $allLogins->where('device_type', 'Desktop')->count();
        $mobileCount = $allLogins->where('device_type', 'Mobile')->count();
        $tabletCount = $allLogins->where('device_type', 'Tablet')->count();
        $totalDevices = max(1, $allLogins->count());

        $deviceBreakdown = [
            'desktop' => $desktopCount,
            'mobile' => $mobileCount,
            'tablet' => $tabletCount,
            'total' => $allLogins->count(),
            'desktop_percent' => round(($desktopCount / $totalDevices) * 100),
            'mobile_percent' => round(($mobileCount / $totalDevices) * 100),
            'tablet_percent' => round(($tabletCount / $totalDevices) * 100),
        ];

        // 3. Active Sessions Count
        $activeSessionsCount = LoginHistory::where('customer_id', $customer->id)
            ->whereNull('logout_at')
            ->count();

        // 4. Security Health Score Calculation (0-100)
        $score = 40;
        $tips = [];

        // Check password freshness
        if ($customer->password_changed_at && $customer->password_changed_at->diffInDays(now()) < 90) {
            $score += 25;
        } else {
            $tips[] = "Consider changing your password periodically (every 90 days).";
        }

        // Check failed attempts
        if ((int)$customer->failed_attempts === 0) {
            $score += 20;
        } else {
            $tips[] = "You have recent failed login attempts. Verify your account activity.";
        }

        // Check active sessions
        if ($activeSessionsCount <= 2) {
            $score += 15;
        } else {
            $tips[] = "You have multiple active device sessions. Revoke devices you no longer use.";
        }

        $score = min(100, max(20, $score));

        $grade = 'Fair';
        if ($score >= 85) {
            $grade = 'Excellent';
        } elseif ($score >= 65) {
            $grade = 'Good';
        }

        if (empty($tips)) {
            $tips[] = "Your account security posture is strong and up-to-date.";
        }

        return response()->json([
            'success' => true,
            'analytics' => [
                'seven_days_activity' => $sevenDaysActivity,
                'device_breakdown' => $deviceBreakdown,
                'active_sessions_count' => $activeSessionsCount,
                'security_score' => [
                    'score' => $score,
                    'grade' => $grade,
                    'tips' => $tips,
                ],
            ]
        ]);
    }
}