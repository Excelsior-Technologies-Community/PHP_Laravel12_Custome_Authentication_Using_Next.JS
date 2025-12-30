<?php

use App\Http\Controllers\Api\CustomerAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::post('/register', [CustomerAuthController::class, 'register']);
Route::post('/login', [CustomerAuthController::class, 'login']);

Route::middleware('auth:customer')->group(function () {
    Route::get('/profile', [CustomerAuthController::class, 'profile']);
    Route::post('/logout', [CustomerAuthController::class, 'logout']);
});
