<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Player;
use App\Http\Requests\StorePlayerRequest;
use App\Http\Requests\UpdatePlayerRequest;
use App\Http\Resources\PlayerResource;
use App\Models\Rescission;
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
        return new PlayerResource($player->load('team'));
    }


    public function transfer(Request $request)
    {
        $datosActualizados = $request->input('data'); //obtengo la info que viene del front
        $datos = $request->input('transfer'); // Acá recibo la información

        $upsertData = []; //creo variable que va a reaizar el upsert
        $buyUser = User::find($datosActualizados['buy_by']); //busco el usuario que compra
        $sellUser = User::find($datosActualizados['sold_by']); // busco el usuario que vende
        $transferValue = $datosActualizados['budget']; // obtengo el valor de la transferencia

        if ($buyUser) {
            $buyUser->profits -= $transferValue; //Descuento el presupuesto al que compra
            $buyUser->save();
        }

        if ($sellUser) {
            $sellUser->profits += $transferValue; //Aumento el presupuesto al que vende
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

        Transfer::upsert($upsertData, 'id', ['transferred_players']); //actualizo los jugadores que vienen en el array

        return response()->json(['message' => 'Datos actualizados correctamente']);
    }

    public function filter(Request $request)
    {
        $query = Player::query();

        if ($request->has('name')) {
            $query->where('name', 'like', '%' . $request->input('name') . '%');
        }

        if ($request->has('min_age') && $request->has('max_age')) {
            $query->whereBetween('age', [$request->input('min_age'), $request->input('max_age')]);
        }

        if ($request->has('id_team')) {
            $query->where('id_team', $request->input('id_team'));
        }

        if ($request->has('no_league')) {
            $query->whereNull('division')->orWhere('division', '');
        }

        if ($request->has('sort_field') && $request->has('sort_order')) {
            $query->orderBy($request->input('sort_field'), $request->input('sort_order'));
        }

        $players = $query->get();

        return response()->json(['data' => $players]);
    }

    /**
     * Update the specified resource in storage.
     */

    public function update(UpdatePlayerRequest $request, Player $player)
    {
        $data = $request->validated();
        $player->update($data);
        $player->load('team');
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

        $players = Player::query()
            ->where('name', 'LIKE', '%' . $name . '%')
            ->with('team')
            ->get();

        return PlayerResource::collection($players);
    }

    public function filteredPlayers(Request $request)
    {
        $teamId = $request->input('team');

        $players = Player::query()
            ->where('id_team', $teamId)
            ->with('team')
            ->orderBy('ca', 'desc')
            ->get();

        return PlayerResource::collection($players);
    }

    // PlayerController.php

    public function filteredStatusPlayers(Request $request)
    {
        $status = $request->query('status');

        $players = Player::where('status', $status)
            ->with('team')
            ->orderBy('ca', 'desc')
            ->get();

        return PlayerResource::collection($players);
    }

    public function calcularCostoBloqueo(Player $player)
    {
        $ca = $player->ca;
        $division = $player->team->division;

        $costo = 0;

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
        $jugador = Player::find($request->id); //busco el usuario

        if (!$jugador) {
            return response()->json(['error' => 'Jugador no encontrado'], 404);
        }

        // Obtengo el equipo al que pertenece el jugador
        $team = $jugador->team;

        if (!$team) {
            return response()->json(['error' => 'El equipo no existe'], 404);
        }

        // Cuento cuántos jugadores del equipo ya están bloqueados
        $jugadoresBloqueadosEnEquipo = $team->players()->where('status', 'bloqueado')->count();

        // Verificó si ya alcanzó el límite de bloqueos de 6
        if ($jugadoresBloqueadosEnEquipo >= 6) {
            return response()->json(['error' => 'El equipo ya ha bloqueado el máximo de 6 jugadores'], 400);
        }

        $usuarioManejador = $team->user;

        if (!$usuarioManejador) {
            return response()->json(['error' => 'Manager no encontrado'], 404);
        }

        $costoBloqueo = $this->calcularCostoBloqueo($jugador);        // Calculo el costo de bloqueo del jugador

        $usuarioManejador->profits -= $costoBloqueo; // Descuento el costo de bloqueo del presupuesto
        $usuarioManejador->save(); // Guardar los cambios en el presupuesto del manager

        $jugador->status = 'bloqueado'; // Actualizar el estado del jugador a 'bloqueado'
        $jugador->save();

        return response()->json(['success' => 'Jugador bloqueado', 'costo' => $costoBloqueo]);
    }

    public function releasePlayer(Request $request)
    {
        $usuarioAutenticado = auth()->user();
        $jugador = Player::find($request->id);

        if (!$jugador) {
            return response()->json(['error' => 'Jugador no encontrado'], 404);
        }

        $team = $jugador->team;

        if (!$team) {
            return response()->json(['error' => 'El equipo no existe'], 404);
        }

        $jugador->id_team = 61;
        $jugador->status = 'liberado';
        $jugador->save();

        return response()->json(['success' => 'Jugador liberado']);
    }

    public function listPlayer(Request $request)
    {
        $usuarioAutenticado = auth()->user();
        $jugador = Player::find($request->id);

        if (!$jugador) {
            return response()->json(['error' => 'Jugador no encontrado'], 404);
        }

        $team = $jugador->team;

        if (!$team) {
            return response()->json(['error' => 'El equipo no existe'], 404);
        }

        //$jugador->team = $jugador->team;
        $jugador->status = 'registrado';
        $jugador->save();

        return response()->json(['success' => 'Jugador liberado']);
    }

    public function filterPlayersByTeamDivision(Request $request)
    {
        $players = Player::whereHas('team', function ($query) {
            $query->whereNotIn('division', ['Primera', 'Segunda']);
        })->orderBy('ca', 'desc')->limit(1000)->get();

        return response()->json($players);
    }

}
