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
        Schema::create('rules', function (Blueprint $table) {
            $table->id();
            $table->string('section_key')->unique(); // Ej: 'equipos', 'formato'
            $table->string('title');                 // Ej: 'Elección de Equipos'
            $table->string('icon')->nullable();      // Ej: '🏟️'
            $table->longText('content');             // Aquí va el texto/HTML
            $table->integer('order_index')->default(0); // Para ordenarlos
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rules');
    }
};
