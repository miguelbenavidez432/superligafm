<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rescission;
use App\Http\Requests\StoreRescissionRequest;
use App\Http\Requests\UpdateRescissionRequest;
use App\Http\Resources\RescissionResource;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;

class RescissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        /**
         * if ($request->query("all") == true) {
         *    return RescissionResource::collection(Team::with(['user', 'team', 'player'])->orderBy("id", "desc")->get());
         *} else {
         *   return RescissionResource::collection(Team::with(['user', 'team', 'player'])->orderBy("id", "desc")->paginate(200));
         *}
         *;

         */
        return RescissionResource::collection(
            Rescission::query()->orderBy('created_at', 'desc')->paginate(100)
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

    public function confirmOffer(Request $request)
    {
        // Validar la oferta y obtener los datos necesarios
        $offer = $request->input('offer');
        $value = $offer['total_value'];
        $id_team = $offer['id_team'];

        // Obtener el equipo y el usuario que recibe el dinero
        $team = Team::findOrFail($id_team);
        $receiver = User::findOrFail($team->id_user);

        // Obtener el usuario que hizo la oferta
        $user = User::findOrFail($offer['created_by']);

        // Actualizar el presupuesto del usuario que hizo la oferta
        $user->profits -= $value;
        $user->save();

        // Sumar el valor de la oferta al presupuesto del usuario que recibe el dinero
        $receiver->profits += $value;
        $receiver->save();

        // Aquí puedes realizar otras acciones, como marcar la oferta como confirmada, enviar notificaciones, etc.

        return response()->json(['message' => 'Oferta confirmada exitosamente']);
    }
}
