<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rescission;
use App\Http\Requests\StoreRescissionRequest;
use App\Http\Requests\UpdateRescissionRequest;
use App\Http\Resources\RescissionResource;

class RescissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return RescissionResource::collection(
            Rescission::query()->orderBy('created_at', 'asc')->paginate(50)
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRescissionRequest $request)
    {
        $data = $request->validated();
        $player = Rescission::create($data);
        return response(new RescissionResource($player), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Rescission $rescission)
    {
        return new RescissionResource($rescission);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRescissionRequest $request, Rescission $rescission)
    {
        $data = $request->validated();

        $rescission->update($data);

        return new RescissionResource($rescission);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Rescission $rescission)
    {
        $rescission->delete();
        return response("", 204);
    }
}
