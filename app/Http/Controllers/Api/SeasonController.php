<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SeasonResource;
use App\Models\Season;
use App\Http\Requests\StoreSeasonRequest;
use App\Http\Requests\UpdateSeasonRequest;

class SeasonController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->has("all") && $request->query("all") == true) {
            return SeasonResource::collection(Season::query()->orderBy("name", "desc")->get());
        } else {
            return SeasonResource::collection(Season::query()->orderBy("name", "desc")->paginate(50));
        }
        ;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSeasonRequest $request)
    {
        $data = $request->validated();
        $season = Season::create($data);

        return response(new SeasonResource($season, 201));
    }

    /**
     * Display the specified resource.
     */
    public function show(Season $season)
    {
        return new SeasonResource($season);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSeasonRequest $request, Season $season)
    {
        $data = $request->validated();
        $season->update($data);
        return new SeasonResource($season);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Season $season)
    {
        $season->delete();
        return response("", 204);
    }
}