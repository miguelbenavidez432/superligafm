<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BetController;
use App\Http\Controllers\Api\OcrController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PrizeController;
use App\Http\Controllers\Api\PlayerController;
use App\Http\Controllers\Api\SeasonController;
use App\Http\Controllers\Api\AuctionController;
use App\Http\Controllers\Api\ChatbotController;
use App\Http\Controllers\Api\StandingController;
use App\Http\Controllers\Api\TransferController;
use App\Http\Controllers\Api\PlayerBetController;
use App\Http\Controllers\Api\GoogleAuthController;
use App\Http\Controllers\Api\RescissionController;

use App\Http\Controllers\Api\TournamentController;
use App\Http\Controllers\Api\DiscordUserController;
use App\Http\Controllers\Api\MatchStatisticController;

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

Route::get('discord/callback', [DiscordUserController::class, 'handleCallback']);
Route::get('discord/redirect', [DiscordUserController::class, 'redirectToDiscord']);
Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('auth/google', [GoogleAuthController::class, 'redirectToGoogle']);
Route::get('auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);
// Solo index (GET) de recursos públicos
Route::get('/teams/public', [TeamController::class, 'index']);
Route::get('/players/public', [PlayerController::class, 'index']);
Route::get('/standings/public', [StandingController::class, 'index']);
Route::get('/match-statistics/public', [MatchStatisticController::class, 'index']);
Route::get('/tournaments/public', [TournamentController::class, 'index']);
Route::get('/season/public', [SeasonController::class, 'index']);
Route::get('/games/public', [GameController::class, 'index']);
Route::get('/traspasos/public', [TransferController::class, 'index']);
Route::get('/clausula_rescision/public', [RescissionController::class, 'index']);
Route::get('/auctions/public', [AuctionController::class, 'index']);
Route::get('/bets/public', [BetController::class, 'index']);



// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/clausulas/{id}', [PlayerController::class, 'playerOffers']);
    Route::post('/bloquear_jugador', [PlayerController::class, 'bloquearJugador']);
    Route::post('/liberar_jugador', [PlayerController::class, 'releasePlayer']);
    Route::post('/registrar_jugador', [PlayerController::class, 'listPlayer']);
    Route::get('playername', [PlayerController::class, 'searchPlayers']);
    Route::get('/playerstatus', [PlayerController::class, 'filteredStatusPlayers']);
    Route::get('/plantel', [PlayerController::class, 'filteredPlayers']);
    Route::post('/apuesta/jugador', [PlayerBetController::class, 'attach']);
    Route::get('/players/filter', [PlayerController::class, 'filter']);
    Route::get('/players/filter-by-division', [PlayerController::class, 'filterPlayersByTeamDivision']);
    Route::apiResource('/players', PlayerController::class);
    Route::get('/players-teams', [PlayerController::class, 'getPlayersByTeams']);

    Route::apiResource('/users', UserController::class);
    Route::apiResource('/teams', TeamController::class);
    Route::post('/transfer', [TransferController::class, 'transfer']);
    Route::apiResource('/traspasos', TransferController::class);
    Route::apiResource('/bets', BetController::class);

    Route::post('/rescission/reverse', [RescissionController::class, 'reverseOffer']);
    Route::apiResource('/clausula_rescision', RescissionController::class);
    Route::post('/confirm-offer', [RescissionController::class, 'confirmOffer']);
    Route::put('/cerrar-oferta/{id}', [RescissionController::class, 'closeOffer']);
    Route::apiResource('/singlebet', PlayerBetController::class);

    Route::apiResource('/season', SeasonController::class);
    Route::get('/seasons/start', [SeasonController::class, 'getSeasonStart']);
    Route::apiResource('/auctions', AuctionController::class);
    Route::get('/auction/last', [AuctionController::class, 'getLastAuctions']);
    Route::post('/auctions/{auction}/bid', [AuctionController::class, 'placeBid']);
    Route::get('/auctions/player/{playerId}', [AuctionController::class, 'filteredAuctions']);
    Route::post('/add_auctions', [AuctionController::class, 'addAuction']);
    Route::post('/auction/confirm/{id}', [AuctionController::class, 'confirmAuction']);

    Route::get('/bet_user', [BetController::class, 'getAllBetUserRows']);
    Route::post('/apuesta/usuario', [BetController::class, 'attach']);
    Route::put('/apuesta/usuario/{betId}/{userId}', [BetController::class, 'updateBetUserConfirmed']);
    Route::put('/apuesta/jugador/{betId}/{userId}', [PlayerBetController::class, 'updateConfirmed']);
    Route::get('/transferencia_pendiente', [TransferController::class, 'getPendingTransfers']);
    Route::post('/transferencia_confirmada/{id}', [TransferController::class, 'confirmTransfer']);

    Route::apiResource('tournaments', TournamentController::class);
    Route::apiResource('/matches', GameController::class);
    Route::get('/games/{id}', [GameController::class, 'getGameById']);
    Route::put('/game-update/{id}', [GameController::class, 'update']);


    Route::post('/chat', [ChatbotController::class, 'handleMessage']);
    Route::post('/chatbot', [ChatbotController::class, 'chat']);

    Route::apiResource('prizes', PrizeController::class);
    Route::apiResource('standings', StandingController::class);
    Route::apiResource('match-statistics', MatchStatisticController::class);
    Route::get('/match-statistics/team/{id_team}', [MatchStatisticController::class, 'getStatistics']);
    Route::get('/yellow-statistics/team/{id_team}', [MatchStatisticController::class, 'getTotalYellowCard']);

    Route::get('/user/notifications', function () {
        return auth()->user()->unreadNotifications;
    });
    Route::post('/ocr/process', [OcrController::class, 'processImage']);
    Route::post('/ocr/process-multiple', [OcrController::class, 'processMultipleImages']);
    Route::put('/games/{id}/enable-edit', [GameController::class, 'enableEdit']);
    Route::post('/games/store-from-ocr', [GameController::class, 'storeFromOcr']);

});



