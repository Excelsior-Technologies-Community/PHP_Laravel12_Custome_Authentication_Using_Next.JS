<?php

namespace App\Models;

use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Customer extends Authenticatable implements JWTSubject
{
    /**
     * Mass Assignable Attributes
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'failed_attempts',
        'locked_until',
        'password_changed_at',
    ];

    /**
     * Hidden Attributes
     */
    protected $hidden = [
        'password',
    ];

    /**
     * Attribute Casting
     */
    protected $casts = [
        'locked_until' => 'datetime',
        'password_changed_at' => 'datetime',
    ];

    /**
     * Login History Relationship
     */
    public function loginHistories()
    {
        return $this->hasMany(LoginHistory::class);
    }

    /**
     * Check if account is currently locked
     */
    public function isLocked(): bool
    {
        return $this->locked_until !== null &&
               $this->locked_until->isFuture();
    }

    /**
     * Reset failed login attempts
     */
    public function resetFailedAttempts(): void
    {
        $this->update([
            'failed_attempts' => 0,
            'locked_until' => null,
        ]);
    }

    /**
     * Increase failed login attempts
     */
    public function incrementFailedAttempts(): void
    {
        $attempts = $this->failed_attempts + 1;

        $this->failed_attempts = $attempts;

        if ($attempts >= 5) {
            $this->locked_until = now()->addMinutes(10);
        }

        $this->save();
    }

    /**
     * JWT Identifier
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * JWT Custom Claims
     */
    public function getJWTCustomClaims()
    {
        return [];
    }
}