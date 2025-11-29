<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('players', function (Blueprint $table) {

            $table->dropColumn([
                'goal',
                'assistance',
                'yellow_card',
                'double_yellow_card',
                'red_card',
                'injured',
                'heavy_injured',
                'mvp'
            ]);
            $table->string('image')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('players', function (Blueprint $table) {
            // Restaurar columnas eliminadas
            $table->integer('goal')->nullable()->default(0);
            $table->integer('assistance')->nullable()->default(0);
            $table->integer('yellow_card')->nullable()->default(0);
            $table->integer('double_yellow_card')->nullable()->default(0);
            $table->integer('red_card')->nullable()->default(0);
            $table->integer('injured')->nullable()->default(0);
            $table->integer('heavy_injured')->nullable()->default(0);
            $table->integer('mvp')->nullable()->default(0);

            $table->dropColumn('image');
        });
    }
};
