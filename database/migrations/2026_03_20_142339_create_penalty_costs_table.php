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
        Schema::create('penalty_costs', function (Blueprint $table) {
        $table->id();
        $table->string('penalty_type'); // 'yellows', 'red', 'injury'
        $table->enum('stage_type', ['regular', 'playoff']); // regular (1-13) o playoff (14+)
        $table->string('description');
        $table->decimal('cost', 15, 2); // Para manejar los millones
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penalty_costs');
    }
};
