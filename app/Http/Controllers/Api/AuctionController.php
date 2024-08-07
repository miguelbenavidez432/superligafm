<?php

namespace App\Http\Controllers;

use App\Http\Resources\AuctionResource;
use App\Models\Auction;
use App\Models\Player;
use App\Models\User;
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

    public function addAuctions(StoreAuctionRequest $request)
    {
        $data = $request->validated();

        $auctions = Auction::where('id_player', $data['id_player'])->get();

        $amount = 0 ;

        foreach($auctions as $auction){
            if($auction['amount'] >= $amount){
                $amount = $auction['$amount'];
            }
        }

        if($amount >= $data['amount']){
            return response()->json(['message' => 'La subasta no supera el valor mínimo']);
        }
        else{

            $this->store($data);
            return response()->json(['message' => 'Subasta agregada correctamente']);
        }

    }
}
