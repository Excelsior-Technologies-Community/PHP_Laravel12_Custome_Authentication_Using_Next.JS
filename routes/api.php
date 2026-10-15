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
Route::post('/forgot-password', [CustomerAuthController::class, 'forgotPassword']);
Route::post('/reset-password', [CustomerAuthController::class, 'resetPassword']);

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:customer', 'check.revoked'])->group(function () {

    // Profile
    Route::get('/profile', [CustomerAuthController::class, 'profile']);

    // Update Profile
    Route::put('/profile/update', [CustomerAuthController::class, 'updateProfile']);

    // Change Password
    Route::post('/change-password', [CustomerAuthController::class, 'changePassword']);

    // Refresh Token
    Route::post('/refresh-token', [CustomerAuthController::class, 'refreshToken']);

    // Active Sessions & Remote Logout
    Route::get('/active-sessions', [CustomerAuthController::class, 'activeSessions']);
    Route::post('/revoke-session/{id}', [CustomerAuthController::class, 'revokeSession']);
    Route::post('/revoke-all-other-sessions', [CustomerAuthController::class, 'revokeAllOtherSessions']);

    // Logout
    Route::post('/logout', [CustomerAuthController::class, 'logout']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Login History
    Route::get('/login-history', [DashboardController::class, 'loginHistory']);

    // Security Dashboard
    Route::get('/security-dashboard', [DashboardController::class, 'security']);

    // Analytics & Charts
    Route::get('/analytics', [DashboardController::class, 'analytics']);
});
