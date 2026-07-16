<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoginHistory extends Model
{
    protected $fillable = [
        'customer_id',
        'ip_address',
        'browser',
        'login_at',
        'logout_at'
    ];

    protected $casts = [
        'login_at' => 'datetime',
        'logout_at' => 'datetime',
    ];

    /**
     * Customer Relationship
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
