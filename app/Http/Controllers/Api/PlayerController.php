<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Player;
use App\Http\Requests\StorePlayerRequest;
use App\Http\Requests\UpdatePlayerRequest;
use App\Http\Resources\PlayerResource;
use App\Models\Rescission;
use App\Models\Team;
use App\Models\Transfer;
use App\Models\User;
use Illuminate\Http\Request;

class PlayerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->query('all') == 'true') {
            return PlayerResource::collection(Player::with(['team'])->orderBy("ca", "desc")->get());
        } else {
            return PlayerResource::collection(Player::with(['team'])->orderBy("ca", "desc")->paginate(100));
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePlayerRequest $request)
    {
        $data = $request->validated();
        $player = Player::create($data);
        return response(new PlayerResource($player), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Player $player)
    {
        return new PlayerResource($player);
    }


    public function transfer(Request $request)
    {
        $datosActualizados = $request->input('data');
        $datos = $request->input('transfer');

        var_dump($datos);

        $upsertData = [];
        $buyUser = User::find($datosActualizados['buy_by']);
        $sellUser = User::find($datosActualizados['sold_by']);
        $transferValue = $datosActualizados['budget'];

        if ($buyUser) {
            $buyUser->profits -= $transferValue;
            $buyUser->save();
        }

        if ($sellUser) {
            $sellUser->profits += $transferValue;
            $sellUser->save();
        }
        foreach ($datos as $dato) {

            $upsertData[] = [
                'transferred_players' => $dato['name'],
                'id_team_from' => $dato['id_team_from'],
                'id_team_to' => $dato['id_team_to'],
                'budget' => $transferValue,
                'created_by' => $dato['created_by'],
                'buy_by' => $dato['buy_by'],
                'sold_by' => $dato['sold_by'],
            ];
        }

        Transfer::upsert($upsertData, 'id', ['transferred_players']);

        return response()->json(['message' => 'Datos actualizados correctamente']);
    }

    /**
     * Update the specified resource in storage.
     */

    public function update(UpdatePlayerRequest $request, Player $player)
    {
        $data = $request->validated();

        $player->update($data);

        return new PlayerResource($player);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Player $player)
    {
        $player->delete();
        return response('', 204);
    }

    public function playerOffers($id)
    {
        $player = Player::findOrFail($id);
        $offers = Rescission::where('id_player', $id)->get();

        return response()->json([
            'player' => $player,
            'offers' => $offers,
        ]);
    }

    public function searchPlayers(Request $request)
    {
        $name = $request->query('name');

        $players = Player::query()->where('name', 'LIKE', '%' . $name . '%')->get();

        return PlayerResource::collection($players);
    }

    public function filteredPlayers(Request $request)
    {
        $teamId = $request->input('id_team');

        $players = Player::query()
            ->where('id_team', $teamId)
            ->orderBy('ca', 'desc')
            ->get();

        return PlayerResource::collection($players);
    }

    public function calcularCostoBloqueo(Player $player)
    {
        $ca = $player->ca;
        $division = $player->team->division;

        $costo = 0;

        // Determinar el costo según la división y CA
        if ($division == 'Primera') {
            if ($ca >= 180 && $ca <= 200) {
                $costo = 75000000;
            } elseif ($ca >= 155 && $ca <= 179) {
                $costo = 50000000;
            } elseif ($ca < 155) {
                $costo = 40000000;
            }
        } elseif ($division == 'Segunda') {
            if ($ca >= 180 && $ca <= 200) {
                $costo = 105000000;
            } elseif ($ca >= 155 && $ca <= 179) {
                $costo = 75000000;
            } elseif ($ca < 155) {
                $costo = 60000000;
            }
        }

        return $costo;
    }

    public function bloquearJugador(Request $request)
    {
        $usuarioAutenticado = auth()->user(); // Usuario autenticado
        $jugador = Player::find($request->id); // Obtener el jugador que se quiere bloquear

        if (!$jugador) {
            return response()->json(['error' => 'Jugador no encontrado'], 404);
        }

        // Obtener el equipo al que pertenece el jugador
        $team = $jugador->team;

        if (!$team) {
            return response()->json(['error' => 'El equipo no existe'], 404);
        }

        // Contar cuántos jugadores del equipo ya están bloqueados
        $jugadoresBloqueadosEnEquipo = $team->players()->where('status', 'bloqueado')->count();

        // Verificar si ya alcanzó el límite de bloqueos (6 por equipo)
        if ($jugadoresBloqueadosEnEquipo >= 6) {
            return response()->json(['error' => 'El equipo ya ha bloqueado el máximo de 6 jugadores'], 400);
        }

        // Obtener el usuario que maneja el equipo (dueño del equipo)
        $usuarioManejador = $team->user;
        var_dump($jugadoresBloqueadosEnEquipo);


        if (!$usuarioManejador) {
            return response()->json(['error' => 'Usuario que maneja el equipo no encontrado'], 404);
        }

        // Calcular el costo de bloqueo del jugador
        $costoBloqueo = $this->calcularCostoBloqueo($jugador);


        // Descontar el costo de bloqueo del presupuesto (profits)
        $usuarioManejador->profits -= $costoBloqueo;
        $usuarioManejador->save(); // Guardar los cambios en el presupuesto

        // Actualizar el estado del jugador a 'bloqueado'
        $jugador->status = 'bloqueado';
        $jugador->save();

        return response()->json(['success' => 'Jugador bloqueado', 'costo' => $costoBloqueo]);
    }
}
