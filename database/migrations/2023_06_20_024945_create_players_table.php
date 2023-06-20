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
            $table->string('nation');
            $table->string('team');
            $table->integer('value');
            $table->string('status');
            $table->integer('goal');
            $table->integer('assistance');
            $table->integer('yellow_card');
            $table->integer('double_yellow_card');
            $table->integer('red_card');
            $table->integer('injured');
            $table->integer('heavy_injured');
            $table->integer('mvp');
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
