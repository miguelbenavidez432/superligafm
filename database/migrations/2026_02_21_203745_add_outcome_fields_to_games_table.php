<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->enum('outcome_type', ['normal', 'penalties', 'administrative', 'unplayed'])->default('normal')->after('status');
            $table->integer('penalties_home')->nullable()->after('score_away');
            $table->integer('penalties_away')->nullable()->after('penalties_home');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->dropColumn(['outcome_type', 'penalties_home', 'penalties_away']);
        });
    }
};
