<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\TournamentResource;
use App\Models\Tournament;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTournamentRequest;
use App\Http\Requests\UpdateTournamentRequest;
use Illuminate\Http\Request;

class TournamentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->query('all') == 'true') {
            return TournamentResource::collection(Tournament::with(['matches', 'season', 'standings'])
            ->orderBy('created_at', 'desc')
            ->where('staus', '=', 'active')
            ->get());
        } else {
            return TournamentResource::collection(Tournament::with(['matches', 'season', 'standings'])
            ->orderBy('created_at', 'desc')
            ->where('staus', '=', 'active')
            ->paginate(100));
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTournamentRequest $request)
    {
        $data = $request->validated();
        $tournament = Tournament::create($data);
        return response(new TournamentResource($tournament), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Tournament $tournament)
    {
        return new TournamentResource($tournament->load(['matches', 'season', 'standings']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTournamentRequest $request, Tournament $tournament)
    {
        $data = $request->validated();
        $tournament->update($data);
        return new TournamentResource($tournament);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tournament $tournament)
    {
        $tournament->delete();
        return response(null, 204);
    }
}
