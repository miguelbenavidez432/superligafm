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
        // 1. Armamos la consulta base (DRY)
        $query = Tournament::with(['matches', 'season', 'standings'])
            ->orderBy('created_at', 'desc');

        // 2. Lógica del Filtro de Estado Dinámico
        // Leemos qué estado pide el frontend. Si no pide nada, por defecto es 'active'.
        $requestedStatus = $request->query('status', 'active');

        // Si el frontend nos pide 'all', saltamos el where. Si no, filtramos por el estado pedido.
        if ($requestedStatus !== 'all') {
            $query->where('status', $requestedStatus);
        }

        // 3. Opcional: Si en el futuro quieres filtrar torneos por temporada desde la BD
        if ($request->has('season_id')) {
            $query->where('season_id', $request->query('season_id'));
        }

        // 4. Resolvemos cómo devolver los datos (Paginados o Todos)
        if ($request->query('all') == 'true') {
            return TournamentResource::collection($query->get());
        }

        return TournamentResource::collection($query->paginate(100));
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
