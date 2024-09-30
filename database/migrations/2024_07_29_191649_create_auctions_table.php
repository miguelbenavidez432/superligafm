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
        Schema::create('auctions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_player');
            $table->foreign('id_player')->on('players')->references('id');
            $table->foreignId('id_team')->nullable();
            $table->foreign('id_team')->on('teams')->references('id');
            $table->foreignId('created_by');
            $table->foreign('created_by')->on('users')->references('id');
            $table->foreignId('auctioned_by');
            $table->foreign('auctioned_by')->on('users')->references('id');
            $table->integer('amount');
            $table->foreignId('id_season')->nullable();
            $table->foreign('id_season')->on('seasons')->references('id');
            $table->string('confirmed')->default('no');
            $table->string('active')->default('no');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('auctions');
    }
};
