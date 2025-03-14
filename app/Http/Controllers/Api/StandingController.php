<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\StandingResource;
use App\Models\Standing;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStandingRequest;
use App\Http\Requests\UpdateStandingRequest;
use Illuminate\Http\Request;

class StandingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Standing::with(['tournament', 'team'])
            ->where('tournament_id', $request->query('tournament_id'))
            ->orderBy('points', 'desc')
            ->orderBy('goal_difference', 'desc')
            ->orderBy('goals_for', 'desc')
            ->orderBy('team_id', 'desc');

        $standings = $query->get();

        if ($standings->isEmpty()) {
            return response()->json(null, 204);
        }

        if ($request->query('all') == 'true') {
            return StandingResource::collection($standings);
        } else {
            return StandingResource::collection($query->paginate(14));
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreStandingRequest $request)
    {
        $data = $request->validated();
        $standing = Standing::create($data);
        return response(new StandingResource($standing), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Standing $standing)
    {
        return new StandingResource($standing->load('tournament', 'team'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStandingRequest $request, Standing $standing)
    {
        $data = $request->validated();
        $standing->update($data);
        return new StandingResource($standing);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Standing $standing)
    {
        $standing->delete();
        return response()->json(null, 204);
    }
}
