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
        Schema::create('playerbet_user', function (Blueprint $table) {
            $table->id();

            $table->foreignId('id_user');
            $table->foreign('id_user')->references('id')->on('users');

            $table->foreignId('id_player_bets');
            $table->foreign('id_player_bets')->references('id')->on('player_bets');

            $table->integer('amount')->default(0);
            $table->decimal('selected_option')->nullable();

            $table->string('confirmed')->default('no');

            $table->foreignId('id_season')->nullable();
            $table->foreign('id_season')->on('seasons')->references('id');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('playerbet_user');
    }
};
