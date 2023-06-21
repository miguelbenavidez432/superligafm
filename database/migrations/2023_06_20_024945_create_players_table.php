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
        Schema::create('players', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('age');
            $table->integer('ca');
            $table->integer('pa');
            $table->string('nation')->nullable();
            $table->string('team')->nullable();
            $table->integer('value');
            $table->string('status')->nullable();
            $table->integer('goal')->nullable();
            $table->integer('assistance')->nullable();
            $table->integer('yellow_card')->nullable();
            $table->integer('double_yellow_card')->nullable();
            $table->integer('red_card')->nullable();
            $table->integer('injured')->nullable();
            $table->integer('heavy_injured')->nullable();
            $table->integer('mvp')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('players');
    }
};
