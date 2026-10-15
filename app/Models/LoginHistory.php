<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoginHistory extends Model
{
    protected $fillable = [
        'customer_id',
        'session_id',
        'ip_address',
        'browser',
        'login_at',
        'logout_at'
    ];

    protected $casts = [
        'login_at' => 'datetime',
        'logout_at' => 'datetime',
    ];

    protected $appends = [
        'device_type',
        'platform',
        'browser_name',
    ];

    public function getDeviceTypeAttribute(): string
    {
        $ua = $this->browser ?? '';
        if (preg_match('/(tablet|ipad|playbook)|(android(?!.*(mobi|opera mini)))/i', $ua)) {
            return 'Tablet';
        }
        if (preg_match('/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i', $ua)) {
            return 'Mobile';
        }
        return 'Desktop';
    }

    public function getPlatformAttribute(): string
    {
        $ua = $this->browser ?? '';
        if (stripos($ua, 'windows nt 10') !== false || stripos($ua, 'windows nt 11') !== false) return 'Windows 10/11';
        if (stripos($ua, 'windows') !== false) return 'Windows';
        if (stripos($ua, 'iphone') !== false) return 'iOS';
        if (stripos($ua, 'ipad') !== false) return 'iPadOS';
        if (stripos($ua, 'android') !== false) return 'Android';
        if (stripos($ua, 'macintosh') !== false || stripos($ua, 'mac os x') !== false) return 'macOS';
        if (stripos($ua, 'linux') !== false) return 'Linux';
        return 'Unknown OS';
    }

    public function getBrowserNameAttribute(): string
    {
        $ua = $this->browser ?? '';
        if (stripos($ua, 'edg') !== false) return 'Microsoft Edge';
        if (stripos($ua, 'chrome') !== false && stripos($ua, 'safari') !== false && stripos($ua, 'edg') === false) return 'Google Chrome';
        if (stripos($ua, 'safari') !== false && stripos($ua, 'chrome') === false) return 'Apple Safari';
        if (stripos($ua, 'firefox') !== false) return 'Mozilla Firefox';
        if (stripos($ua, 'opera') !== false || stripos($ua, 'opr') !== false) return 'Opera';
        return 'Web Browser';
    }

    /**
     * Customer Relationship
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
