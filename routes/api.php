<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BetController;
use App\Http\Controllers\Api\PlayerBetController;
use App\Http\Controllers\Api\PlayerController;
use App\Http\Controllers\Api\RescissionController;
use App\Http\Controllers\Api\SeasonController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\TransferController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AuctionController;

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


});

    Route::apiResource('/players', PlayerController::class);
    Route::post('/transfer', [PlayerController::class, 'transfer']);
    Route::get('/clausulas/{id}', [PlayerController::class, 'playerOffers']);
    Route::get('playername', [PlayerController::class, 'searchPlayers']);
    Route::apiResource('/users', UserController::class);
    Route::apiResource('/teams', TeamController::class);
    Route::apiResource('/traspasos', TransferController::class);
    Route::apiResource('/bets', BetController::class);

    Route::apiResource('/clausula_rescision', RescissionController::class);
    Route::apiResource('/singlebet', PlayerBetController::class);


    Route::apiResource('/season', SeasonController::class);
    Route::apiResource('/auctions', AuctionController::class);

    Route::post('/confirm-offer', [RescissionController::class, 'confirmOffer']);
    Route::get('/plantel', [PlayerController::class, 'filteredPlayers']);
    Route::get('/bet_user', [BetController::class, 'getAllBetUserRows']);
    Route::post('/apuesta/usuario', [BetController::class, 'attach']);
    Route::post('/apuesta/jugador', [PlayerBetController::class, 'attach']);
    Route::put('/apuesta/usuario/{betId}/{userId}', [BetController::class, 'updateBetUserConfirmed']);
    Route::put('/apuesta/jugador/{betId}/{userId}', [PlayerBetController::class, 'updateConfirmed']);


Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);
