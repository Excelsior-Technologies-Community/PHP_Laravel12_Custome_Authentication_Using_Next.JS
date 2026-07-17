<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {

            // Number of consecutive failed login attempts
            $table->unsignedInteger('failed_attempts')
                ->default(0)
                ->after('password');

            // Account lock expiry time
            $table->timestamp('locked_until')
                ->nullable()
                ->after('failed_attempts');

            // Last password change date
            $table->timestamp('password_changed_at')
                ->nullable()
                ->after('locked_until');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {

            $table->dropColumn([
                'failed_attempts',
                'locked_until',
                'password_changed_at',
            ]);
        });
    }
};
