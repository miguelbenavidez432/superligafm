<?php

namespace App\Http\Controllers\Api;

use App\Events\NewAuctionEvent;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAuctionRequest;
use App\Http\Requests\UpdateAuctionRequest;
use App\Http\Resources\AuctionResource;
use App\Models\Auction;
use App\Models\Player;
use App\Models\Team;
use App\Models\User;
use App\Models\UserAuction;
use Auth;
use Carbon\Carbon;
use DB;
use Illuminate\Http\Request;
use Spatie\WebhookServer\WebhookCall;

class AuctionController extends Controller
{

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->query("all") == 'true') {

            return AuctionResource::collection(Auction::with(['creator', 'auctioneer', 'player', 'team', 'season'])->orderBy("id", "desc")->get());
        } else {
            return AuctionResource::collection(Auction::with(['creator', 'auctioneer', 'player', 'team', 'season'])->orderBy("id", "desc")->paginate(50));
        }
        ;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAuctionRequest $request)
    {
        $data = $request->validated();
        $player = Player::find($data['id_player']);

        $previousAuction = Auction::where('id_player', $data['id_player'])
            ->orderBy('amount', 'desc')
            ->first();

        $highestAuctions = Auction::select('id_player', DB::raw('MAX(amount) as highestAmount'))
            ->groupBy('id_player')
            ->get();

        $leadingUsers = [];
        foreach ($highestAuctions as $auction) {
            $highestAuction = Auction::where('id_player', $auction->id_player)
                ->where('amount', $auction->highestAmount)
                ->first();
            if ($highestAuction) {
                $leadingUsers[] = $highestAuction->auctioned_by;
            }
        }

        $leadingUsers = array_unique($leadingUsers);

        foreach ($leadingUsers as $userId) {
            $userAuctions = Auction::where('auctioned_by', $userId)
            ->where('id_season' , $data['id_season'])
            ->get();

            $totalAuctions = $userAuctions->count();
            $over20Auctions = $userAuctions->filter(function ($auction) {
                return $auction->player->age > 20;
            })->count();

            if ($totalAuctions >= 4 || $over20Auctions >= 2) {
                return response()->json(['error' => 'Has alcanzado el límite de subastas permitidas.'], 403);
            }

            if ($over20Auctions >= 2) {
                return response()->json(['error' => 'Has alcanzado el límite de ofertas por jugadores mayores de 20 años.'], 403);
            }
        }


        if ($previousAuction) {
            if ($data['amount'] < $previousAuction->amount + 1000000) {
                return response()->json([
                    'message' => 'La nueva oferta debe ser al menos un millón más alta que la oferta anterior.'
                ], 422);
            }

            $previousBidders = Auction::where('id_player', $data['id_player'])->get();
            foreach ($previousBidders as $bidder) {
                $user = $bidder->user;
            }
        } else {

            if ($data['amount'] < $player->value) { // agregar /2 para que sea la mitad del valor del jugador en las subastas extras
                return response()->json([
                    'message' => 'La oferta inicial debe ser al menos igual al valor del jugador.'
                ], 422);
            }
        }

        $data['close'] = Carbon::now()->addHours(12);

        $auction = Auction::create($data);
        $team = Team::find($data['id_team']);
        $user = User::find($data['auctioned_by']);

        $webhookUrl = env('DISCORD_WEBHOOK_AUCTIONS');
        $webhookSecret = env('DISCORD_WEBHOOK_SECRET');

        WebhookCall::create()
            ->url($webhookUrl)
            ->payload([
                'content' => "La oferta por {$player->name} ha sido realizada por un total de $ {$data['amount']}.
                \nEl jugador pertenece al equipo {$team->name} y fue realizada por {$user->name}.\n",
            ])
            ->useSecret($webhookSecret)
            ->dispatch();

        return response()->json(['message' => 'Success'], 200)
            ->header('Content-Type', 'application/json');

    }

    /**
     * Display the specified resource.
     */
    public function show(Auction $auction)
    {
        return new AuctionResource($auction);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAuctionRequest $request, Auction $auction)
    {
        $data = $request->validated();
        $auction->update($data);
        return new AuctionResource($auction);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Auction $auction)
    {
        $auction->delete();
        return response("", 204);

    }

    public function addAuction(StoreAuctionRequest $request)
    {
        $data = $request->validated();

        $previousAuction = Auction::where('id_player', $data['id_player'])
            ->orderBy('amount', 'desc')
            ->first();

        $highestAuctions = Auction::select('id_player', DB::raw('MAX(amount) as highestAmount'))
            ->groupBy('id_player')
            ->get();

        $leadingUsers = [];
        foreach ($highestAuctions as $auction) {
            $highestAuction = Auction::where('id_player', $auction->id_player)
                ->where('amount', $auction->highestAmount)
                ->first();
            if ($highestAuction) {
                $leadingUsers[] = $highestAuction->id_auctioned;
            }
        }

        $leadingUsers = array_unique($leadingUsers);

        foreach ($leadingUsers as $userId) {
            $userAuctions = Auction::where('id_auctioned', $userId)->get();

            $totalAuctions = $userAuctions->count();
            $over20Auctions = $userAuctions->filter(function ($auction) {
                return $auction->player->age > 20;
            })->count();

            if ($totalAuctions >= 4 || $over20Auctions >= 2) {
                return response()->json(['error' => 'Has alcanzado el límite de subastas permitidas.'], 403);
            }

            if ($over20Auctions >= 2) {
                return response()->json(['error' => 'Has alcanzado el límite de ofertas por jugadores mayores de 20 años.'], 403);
            }
        }


        if ($previousAuction) {
            if ($data['amount'] < $previousAuction->amount + 1000000) {
                return response()->json([
                    'message' => 'La nueva oferta debe ser al menos un millón más alta que la oferta anterior.'
                ], 422);
            }


            $previousBidders = Auction::where('id_player', $data['id_player'])->get();
            foreach ($previousBidders as $bidder) {
                $user = $bidder->user;
            }
        } else {
            $player = Player::find($data['id_player']);

            if ($data['amount'] < $player->value) { // agregar /2 para que sea la mitad del valor del jugador en las subastas extras
                return response()->json([
                    'message' => 'La oferta inicial debe ser al menos igual al valor del jugador.'
                ], 422);
            }
        }

        $data['close'] = Carbon::now()->addHours(12);

        $auction = Auction::create($data);

        return response(new AuctionResource($auction, 201));
    }

    public function filteredAuctions($playerId)
    {
        $auctions = Auction::where('id_player', $playerId)
            ->with(['creator', 'auctioneer', 'player', 'team', 'season'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($auctions, 200);
    }

    public function getLastAuctions()
    {
        $seasonId = request()->query('id_season');

        $lastAuctions = Auction::select('id_player', DB::raw('MAX(id) as lastAuctionID'))
            ->groupBy('id_player')
            ->with(['creator', 'auctioneer', 'player', 'team', 'season'])
            ->when($seasonId, function ($query, $seasonId) {
                return $query->where('id_season', $seasonId);
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (Auction $auction) {
                return Auction::with(['creator', 'auctioneer', 'player', 'team', 'season'])->find($auction->lastAuctionID);
            });

        return response()->json($lastAuctions, 200);
    }

    public function placeBid(Request $request, Auction $auction)
    {
        $user = Auth::user();
        $playerId = $request->input('player_id');
        $bidAmount = $request->input('bid_amount');

        $countOver20 = UserAuction::where('user_id', $user->id)
            ->whereHas('player', function ($query) {
                $query->where('age', '>', 20);
            })
            ->count();

        if ($countOver20 >= 2) {
            return response()->json(['error' => 'Has alcanzado el límite de ofertas por jugadores mayores de 20 años.'], 403);
        }

        // Validación 2: Limitar a 4 jugadores en total
        $countTotalBids = UserAuction::where('user_id', $user->id)->count();

        if ($countTotalBids >= 4) {
            return response()->json(['error' => 'Has alcanzado el límite total de ofertas.'], 403);
        }

        // Validación 3: Evitar que el usuario vuelva a ofertar por el mismo jugador si fue el último en hacerlo
        $lastBid = UserAuction::where('user_id', $user->id)
            ->where('player_id', $playerId)
            ->where('is_last_bid', true)
            ->first();

        if ($lastBid) {
            return response()->json(['error' => 'No puedes volver a ofertar por el mismo jugador.'], 403);
        }

        // Si pasa todas las validaciones, registrar la oferta
        UserAuction::where('player_id', $playerId)->update(['is_last_bid' => false]);

        UserAuction::create([
            'user_id' => $user->id,
            'auction_id' => $auction->id,
            'player_id' => $playerId,
            'bid_amount' => $bidAmount,
            'is_last_bid' => true,
        ]);

        return response()->json(['success' => 'Oferta registrada exitosamente.']);
    }

    public function confirmAuction(Request $request, $auctionId)
    {

        $auction = Auction::find($auctionId);

        if (!$auction) {
            return response()->json(['error' => 'Subasta no encontrada.'], 404);
        }

        $player = Player::find($request->input('id_player'));
        $winner = User::find($request->input('id_auctioned'));

        if (!$player || !$winner) {
            return response()->json(['error' => 'Datos del jugador o usuario no válidos.'], 400);
        }

        $winner->profits -= $auction->amount;
        $winner->save();

        $player->id_team = $request->input('id_team');
        $player->save();

        $auction->confirmed = 'yes';
        $auction->active = 'no';
        $auction->save();

        $teamTo = Team::find($auction->id_team);

        $webhookUrl = env('DISCORD_WEBHOOK_AUCTIONS');
        $webhookSecret = env('DISCORD_WEBHOOK_SECRET');

        WebhookCall::create()
            ->url($webhookUrl)
            ->payload([
                'content' => "HERE WE GO (? \nLa oferta por {$player->name} ha sido confirmada.\nEl jugador va a ser transferido al equipo de {$teamTo->name}.
                \nEl monto de la transferencia es de $ {$auction->amount} y fue pagado por {$winner->name}.\n",
            ])
            ->useSecret($webhookSecret)
            ->dispatch();

        return response()->json(['success' => 'Subasta confirmada y jugador transferido.'], 200);
    }

}
