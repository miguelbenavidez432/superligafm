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
        Schema::table('rescissions', function (Blueprint $table) {
            $table->foreignId('to_team_id')->nullable()->after('id_team');
            $table->foreign('to_team_id')->references('id')->on('teams');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rescissions', function (Blueprint $table) {
            $table->dropForeign(['to_team_id']);
            $table->dropColumn('to_team_id');
        });
    }
};
