<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BetController;
use App\Http\Controllers\Api\PlayerBetController;
use App\Http\Controllers\Api\PlayerController;
use App\Http\Controllers\Api\RescissionController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\TransferController;
use App\Http\Controllers\Api\UserController;
use App\Models\Rescission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('/players', PlayerController::class);
    Route::post('/transfer', [PlayerController::class, 'transfer']);
    Route::get('/clausulas/{id}', [PlayerController::class, 'playerOffers']);
    Route::apiResource('/users', UserController::class);
    Route::apiResource('/teams', TeamController::class);
    Route::apiResource('/traspasos', TransferController::class);
    Route::apiResource('/bet', BetController::class);
    Route::apiResource('/singlebet', PlayerBetController::class);
    Route::apiResource('/clausula_rescision', RescissionController::class);
});

Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);
