<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('division');
            $table->foreignId('id_user')->nullable();
            $table->foreign('id_user')->on('users')->references('id');
            $table->integer('campeonatos_primera')->nullable();
            $table->integer('campeonatos_segunda')->nullable();
            $table->integer('campeonatos_copa')->nullable();
            $table->integer('campeonatos_champions')->nullable();
            $table->integer('campeonatos_europa')->nullable();
            $table->integer('campeonatos_menores')->nullable();
            $table->timestamps();
            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teams');
    }
};
