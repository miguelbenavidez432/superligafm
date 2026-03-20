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
        Schema::create('penalty_cancellations', function (Blueprint $table) {
        $table->id();
        $table->foreignId('team_id')->constrained();
        $table->foreignId('player_id')->constrained();
        $table->foreignId('penalty_cost_id')->constrained();
        $table->decimal('amount_paid', 15, 2);
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penalty_cancellations');
    }
};
