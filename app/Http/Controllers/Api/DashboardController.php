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
            ->oldest()
            ->first();

        return response()->json([
            'success' => true,

            'statistics' => [
                'total_customers' => $totalCustomers,
                'today_registered' => $todayCustomers,
                'total_logins' => $totalLogins,
                'my_logins' => $myLogins,
                'last_login' => optional($lastLogin)->login_at,
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
            ->oldest()
            ->paginate(3);

        return response()->json([
            'success' => true,
            'history' => $history
        ]);
    }
}