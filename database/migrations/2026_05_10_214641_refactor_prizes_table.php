<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Limpiamos la tabla prizes
        Schema::table('prizes', function (Blueprint $table) {
            // 🔥 LA CORRECCIÓN: Primero soltamos la llave foránea
            $table->dropForeign(['team_id']);

            // Ahora sí, borramos las columnas tranquilamente
            $table->dropColumn(['position', 'team_id', 'status']);
        });

        // 2. Creamos la tabla pivot para las asignaciones
        Schema::create('prize_team', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prize_id')->constrained()->cascadeOnDelete();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();

            $table->enum('status', ['Pendiente', 'Pagado', 'Cancelado'])->default('Pendiente');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prize_team');

        Schema::table('prizes', function (Blueprint $table) {
            $table->integer('position')->nullable();
            $table->foreignId('team_id')->nullable()->constrained();
            $table->string('status')->default('Pendiente');
        });
    }
};
