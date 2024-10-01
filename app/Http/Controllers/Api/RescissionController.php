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
         *    return RescissionResource::collection(Team::with(['user', 'team', 'player', 'season'])->orderBy("id", "desc")->get());
         *} else {
         *   return RescissionResource::collection(Team::with(['user', 'team', 'player', 'season'])->orderBy("id", "desc")->paginate(200));
         *}
         *;

         */
        return RescissionResource::collection(
            Rescission::query()->orderBy('created_at', 'desc')->paginate(500)
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRescissionRequest $request)
    {
        // $data = $request->validated();
        // $player = Rescission::create($data);
        // return response(new RescissionResource($player), 201);

        // Obtener los datos validados del request
        $data = $request->validated();

        // Obtener el ID del equipo del jugador
        $teamId = $data['id_team'];

        // Verificar cuántos jugadores del equipo han recibido ofertas (basado en la columna cdr)
        $team = Team::find($teamId);

        if ($team->cdr >= 6) {
            // Si ya hay 6 jugadores del equipo con ofertas, no se puede crear otra oferta
            return response()->json(['error' => 'El equipo ya tiene ofertas por 6 jugadores. No se pueden realizar más ofertas.'], 403);
        }

        // Si no ha alcanzado el límite de jugadores con ofertas, crear la oferta
        $offer = Rescission::create($data);

        // Incrementar el contador de jugadores con ofertas en el equipo si es una nueva oferta para el jugador
        $existingOffersForPlayer = Rescission::where('id_player', $data['id_player'])->count();

        if ($existingOffersForPlayer == 0) {
            // Si no había ofertas anteriores para este jugador, incrementar el contador cdr
            $team->increment('cdr');
        }

        // Devolver la respuesta
        return response(new RescissionResource($offer), 201);
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
        $offer = $request->input('offer');
        $value = $offer['total_value'];
        $id_team = $offer['id_team'];

        //busco el id de la oferta
        $id = $offer['id'];

        $offerId = Rescission::findOrFail($id);

        if ($offerId->confirmed === 'no') {
            $team = Team::findOrFail($id_team);
            $receiver = User::findOrFail($team->id_user);

            $user = User::findOrFail($offer['created_by']);

            $user->profits -= $value;
            $user->save();

            $receiver->profits += $value;
            $receiver->save();

            $offerId->confirmed = 'yes';
            $offerId->save();

            $offerId->active = 'yes';
            $offerId->save();

            return response()->json(['message' => 'Oferta confirmada exitosamente']);
        } else {
            return response()->json(['message' => 'Oferta ya confirmada'], 403);
        }

    }

    public function closeOffer(Request $request)
    {
        $offer = $request->input('id');

        $offerId = Rescission::findOrFail($offer);

    }


}
