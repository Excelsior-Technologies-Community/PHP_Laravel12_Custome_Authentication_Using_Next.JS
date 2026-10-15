<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\LoginHistory;
use Symfony\Component\HttpFoundation\Response;

class CheckRevokedSession
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            if (auth('customer')->check()) {
                $payload = auth('customer')->payload();
                $sessionId = $payload->get('session_id');

                if ($sessionId) {
                    $session = LoginHistory::where('session_id', $sessionId)->first();
                    if ($session && $session->logout_at !== null) {
                        auth('customer')->logout();

                        return response()->json([
                            'success' => false,
                            'message' => 'This session has been revoked remotely. Please log in again.'
                        ], 401);
                    }
                }
            }
        } catch (\Exception $e) {
            // Ignore token parsing exceptions, auth middleware handles them
        }

        return $next($request);
    }
}
