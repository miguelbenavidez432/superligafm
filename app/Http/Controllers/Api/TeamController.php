<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Http\Requests\StoreTeamRequest;
use App\Http\Requests\UpdateTeamRequest;
use App\Http\Resources\TeamResource;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $isPublic = !auth('sanctum')->check();
        if ($request->query('all') == 'true' || $isPublic) {
            return TeamResource::collection(Team::with(['user'])->orderBy("id", "asc")->get());
        } else {
            return TeamResource::collection(Team::with(['user'])->orderBy("id", "asc")->paginate(280));
        }
        ;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTeamRequest $request)
    {
        $data = $request->validated();
        $team = Team::create($data);

        return response(new TeamResource($team->load('user')), 201);

    }

    /**
     * Display the specified resource.
     */
    public function show(Team $team)
    {
        return new TeamResource($team->load('user'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTeamRequest $request, Team $team)
    {
        $data = $request->validated();
        $team->update($data);
        return new TeamResource($team->load('user'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Team $team)
    {
        $team->delete();
        return response("", 204);
    }


}
