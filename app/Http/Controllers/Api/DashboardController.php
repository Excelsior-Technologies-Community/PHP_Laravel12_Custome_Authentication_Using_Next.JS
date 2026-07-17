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
}