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
        Schema::create('transfers', function (Blueprint $table) {
            $table->id();
            $table->text('transferred_players');
            $table->foreignId('id_team_from')->nullable();
            $table->foreign('id_team_from')->on('teams')->references('id');
            $table->foreignId('id_team_to')->nullable();
            $table->foreign('id_team_to')->on('teams')->references('id');
            $table->integer('budget')->default(0);
            $table->foreignId('created_by');
            $table->foreign('created_by')->on('users')->references('id');
            $table->foreignId('buy_by')->nullable();
            $table->foreign('buy_by')->on('users')->references('id');
            $table->foreignId('sold_by')->nullable();
            $table->foreign('sold_by')->on('users')->references('id');
            $table->foreignId('confirmed_by')->nullable();
            $table->foreign('confirmed_by')->on('users')->references('id');
            $table->string('confirmed')->default('no');
            $table->foreignId('id_season')->nullable();
            $table->foreign('id_season')->on('teams')->references('id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transfers');
    }
};
