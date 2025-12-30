<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Hash;
use App\Models\Customer;
use JWTAuth;

class CustomerAuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:customers',
            'password' => 'required|confirmed|min:6'
        ]);

        Customer::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password)
        ]);

        return response()->json(['message' => 'Registered Successfully']);
    }

    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (!$token = auth('customer')->attempt($credentials)) {
            return response()->json(['error' => 'Invalid Credentials'], 401);
        }

        return response()->json(['token' => $token]);
    }

    public function profile()
    {
        return response()->json(auth('customer')->user());
    }

    public function logout()
    {
        auth('customer')->logout();
        return response()->json(['message' => 'Logged out']);
    }
}

