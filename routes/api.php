<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CustomerAuthController;
use App\Http\Controllers\Api\DashboardController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::post('/register', [CustomerAuthController::class, 'register']);
Route::post('/login', [CustomerAuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:customer')->group(function () {

    // Profile
    Route::get('/profile', [CustomerAuthController::class, 'profile']);

    // Update Profile
    Route::put('/profile/update', [CustomerAuthController::class, 'updateProfile']);

    // Change Password
    Route::post('/change-password', [CustomerAuthController::class, 'changePassword']);

    // Logout
    Route::post('/logout', [CustomerAuthController::class, 'logout']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Login History
    Route::get('/login-history', [DashboardController::class, 'loginHistory']);

    // Security Dashboard
    Route::get('/security-dashboard', [DashboardController::class, 'security']);
});
