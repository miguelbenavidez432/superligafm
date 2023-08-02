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
        Schema::create('bet_user', function (Blueprint $table) {
            $table->id();

            $table->foreignId('id_user');
            $table->foreign('id_user')->references('id')->on('users');

            $table->foreignId('id_bet');
            $table->foreign('id_bet')->references('id')->on('bets');

            $table->integer('amount')->default(0);
            $table->decimal('selected_option')->nullable();

            $table->string('confirmed')->default('no');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bet_user');
    }
};
