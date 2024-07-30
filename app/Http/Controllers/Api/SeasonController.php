<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Season;
use App\Http\Requests\StoreSeasonRequest;
use App\Http\Requests\UpdateSeasonRequest;

class SeasonController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSeasonRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Season $season)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSeasonRequest $request, Season $season)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Season $season)
    {
        //
    }
}
