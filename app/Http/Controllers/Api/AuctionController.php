<?php

namespace App\Http\Controllers;

use App\Http\Resources\AuctionResource;
use App\Models\Auction;
use Illuminate\Http\Request;
use App\Http\Requests\StoreAuctionRequest;
use App\Http\Requests\UpdateAuctionRequest;

class AuctionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->has("all") && $request->query("all") == true) {

            return AuctionResource::collection(Auction::with(['user', 'player', 'team'])->orderBy("created_at", "desc")->get());
        } else {
            return AuctionResource::collection(Auction::with(['user', 'player', 'team'])->orderBy("created_at", "desc")->paginate(50));
        }
        ;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAuctionRequest $request)
    {
        $data = $request->validated();

        $previousAuction = Auction::where('id_player', $data['id_player'])
            ->orderBy('amount', 'desc')
            ->first();

        if ($previousAuction) {
            if ($data['amount'] < $previousAuction->amount + 1000000) {
                return response()->json(['message' => 'La nueva oferta debe ser al menos un millón más alta que la oferta anterior.']);
            }

            // Notificar a los usuarios que hicieron ofertas anteriores
            $previousBidders = Auction::where('id_player', $data['id_player'])->get();
            foreach ($previousBidders as $bidder) {
                $user = $bidder->user;
            }
        } else {
            $player = Player::find($data['id_player']);
            if ($data['amount'] < $player->value) {
                return response()->json(['message' => 'La oferta inicial debe ser al menos igual al valor del jugador.']);
            }
        }

        $auction = Auction::create($data);

        return response(new AuctionResource($auction, 201));
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

        if ($previousAuction) {
            if ($data['amount'] < $previousAuction->amount + 1000000) {
                return response()->json(['message' => 'La nueva oferta debe ser al menos un millón más alta que la oferta anterior.']);
            }

            // Notificar a los usuarios que hicieron ofertas anteriores
            $previousBidders = Auction::where('id_player', $data['id_player'])->get();
            foreach ($previousBidders as $bidder) {
                $user = $bidder->user;
            }
        } else {
            $player = Player::find($data['id_player']);
            if ($data['amount'] < $player->value) {
                return response()->json(['message' => 'La oferta inicial debe ser al menos igual al valor del jugador.']);
            }
        }

        $auction = Auction::create($data);

        return response(new AuctionResource($auction, 201));
    }
}
