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
            $table->integer('title_first_division')->nullable();
            $table->integer('title_second_division')->nullable();
            $table->integer('title_third_division')->nullable();
            $table->integer('title_cup')->nullable();
            $table->integer('title_ucl')->nullable();
            $table->integer('title_uel')->nullable();
            $table->integer('title_league_cup')->nullable();
            $table->integer('title_champions_cup')->nullable();
            $table->integer('title_super_cup')->nullable();
            $table->integer('cdr')->nullable();
            $table->string('image_patch')->nullable();
            $table->foreignId('updated_by')->constrained('users')->nullable();
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
