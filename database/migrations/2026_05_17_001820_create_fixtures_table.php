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
        Schema::create('fixtures', function (Blueprint $table) {
            $table->id();

            $table->foreignId('id_season')->constrained('seasons')->onDelete('cascade');

            $table->foreignId('id_tournament')->constrained('tournaments')->onDelete('cascade');

            $table->integer('matchday');

            $table->foreignId('home_team_id')->constrained('teams')->onDelete('cascade');
            $table->foreignId('away_team_id')->constrained('teams')->onDelete('cascade');

            $table->dateTime('due_date')->nullable();
            $table->enum('status', ['pendiente', 'jugado', 'aplazado'])->default('pendiente');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fixtures');
    }
};
