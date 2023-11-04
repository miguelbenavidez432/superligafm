<?php

use App\Models\Team;
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
        Schema::create('players', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('age');
            $table->integer('ca');
            $table->integer('pa');
            $table->string('nation')->nullable();
            $table->foreignId('id_team')->nullable();
            $table->foreign('id_team')->on('teams')->references('id');
            $table->integer('value')->default(15000000);
            $table->string('status')->nullable();
            $table->integer('goal')->nullable()->default(0);
            $table->integer('assistance')->nullable()->default(0);
            $table->integer('yellow_card')->nullable()->default(0);
            $table->integer('double_yellow_card')->nullable()->default(0);
            $table->integer('red_card')->nullable()->default(0);
            $table->integer('injured')->nullable()->default(0);
            $table->integer('heavy_injured')->nullable()->default(0);
            $table->integer('mvp')->nullable()->default(0);
            $table->softDeletes();
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
        Schema::dropIfExists('players');
    }
};
