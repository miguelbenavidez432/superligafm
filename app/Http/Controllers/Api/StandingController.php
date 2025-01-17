<?php

namespace App\Http\Controllers\Api;

use App\Models\Standing;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStandingRequest;
use App\Http\Requests\UpdateStandingRequest;

class StandingController extends Controller
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
    public function store(StoreStandingRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Standing $standing)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateStandingRequest $request, Standing $standing)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Standing $standing)
    {
        //
    }
}
