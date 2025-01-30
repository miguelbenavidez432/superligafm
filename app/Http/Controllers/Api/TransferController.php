<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Player;
use App\Models\Team;
use App\Models\Transfer;
use App\Http\Requests\StoreTransferRequest;
use App\Http\Requests\UpdateTransferRequest;
use App\Http\Resources\TransferResource;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\WebhookServer\WebhookCall;

class TransferController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Transfer::with(['teamFrom', 'teamTo', 'creator', 'buyer', 'seller', 'confirmer', 'season'])
            ->orderBy("created_at", "desc");

        if ($request->has('season')) {
            $query->where('id_season', $request->query('season'));
        }

        if ($request->query('all') == 'true') {
            return TransferResource::collection($query->get());
        } else {
            return TransferResource::collection($query->paginate(250));
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTransferRequest $request)
    {
        $data = $request->validated();
        $player = Transfer::create($data);
        return response(new TransferResource($player), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Transfer $transfer)
    {
        return new TransferResource($transfer);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTransferRequest $request, Transfer $transfer)
    {
        $data = $request->validated();

        $transfer->update($data);

        return new TransferResource($transfer);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Transfer $transfer)
    {
        $transfer->delete();
        return response("", 204);
    }

    public function transfer(Request $request)
    {

        // $datosActualizados = $request->all();

        // if (!$datosActualizados || !isset($datosActualizados['transferred_players'])) {
        //     return response()->json(['message' => 'Datos de transferencia no encontrados'], 400);
        // }

        // $buyUser = User::find($datosActualizados['buy_by']);
        // $sellUser = User::find($datosActualizados['sold_by']);
        // $transferValue = $datosActualizados['budget'];

        // if ($buyUser) {
        //     $buyUser->profits -= $transferValue;
        //     $buyUser->save();
        // }

        // if ($sellUser) {
        //     $sellUser->profits += $transferValue;
        //     $sellUser->save();
        // }


        // Transfer::upsert($upsertData, 'id', ['transferred_players']);

        // return response()->json(['message' => 'Datos actualizados correctamente']);

        $transferData = $request->input('data');
        $transfer = new Transfer();

        $transferredPlayers = explode(',', $transferData['transferred_players']);

        $transfer->transferred_players = $transferData['transferred_players'];
        $transfer->id_team_from = $transferData['id_team_from'];
        $transfer->id_team_to = $transferData['id_team_to'];
        $transfer->budget = $transferData['budget'];
        $transfer->created_by = $transferData['created_by'];
        $transfer->buy_by = $transferData['buy_by'];
        $transfer->sold_by = $transferData['sold_by'];
        $transfer->id_season = $transferData['id_season'];
        $transfer->confirmed = 'no';
        $transfer->save();

        $teamFrom = Team::find($transferData['id_team_from']);
        $teamTo = Team::find($transferData['id_team_to']);

        $webhookUrl = env('DISCORD_WEBHOOK_TRANSFERS');
        $webhookSecret = env('DISCORD_WEBHOOK_SECRET');

        if (count($transferredPlayers) == 1) {
            WebhookCall::create()
                ->url($webhookUrl)
                ->payload([
                    'content' => "----NEGOCIANDO----
                    \nLa oferta por {$transferredPlayers[0]} ha sido realizada
                    \nEl traspaso de {$teamFrom->name} a {$teamTo->name} está esperando confirmación.
                    \nEl monto de la transferencia es de $ {$transfer->budget}\n",
                ])
                ->useSecret($webhookSecret)
                ->dispatch();
        } else if (count($transferredPlayers) > 1) {
            WebhookCall::create()
                ->url($webhookUrl)
                ->payload([
                    'content' => "----NEGOCIANDO----
                    \nLas ofertas por los jugadores {$transferData['transferred_players']} han sido realizadas
                    \nEl traspaso entre {$teamFrom->name} y {$teamTo->name} está esperando confirmación
                    \nEl monto de la transferencia es de $ {$transfer->budget}\n",
                ])
                ->useSecret($webhookSecret)
                ->dispatch();
        }


        return response()->json(['message' => 'Transferencia creada correctamente, esperando confirmación']);
    }

    public function confirmTransfer(Request $request, $id)
    {
        $transfer = Transfer::find($id);

        if (!$transfer) {
            return response()->json(['message' => 'Transferencia no encontrada'], 404);
        }

        $user = auth()->user();
        if ($user->id !== $transfer->buy_by && $user->id !== $transfer->sold_by) {
            return response()->json(['message' => 'No autorizado para confirmar esta transferencia'], 403);
        }

        if ($transfer->created_by === $user->id) {
            return response()->json(['message' => 'No puedes confirmar tu propia transferencia'], 403);
        }

        $buyUser = User::find($transfer->buy_by);
        $sellUser = User::find($transfer->sold_by);
        $transferValue = $transfer->budget;

        if ($buyUser) {
            $buyUser->profits -= $transferValue;
            $buyUser->save();
        }

        if ($sellUser) {
            $sellUser->profits += $transferValue;
            $sellUser->save();
        }

        $transfer->confirmed = 'si';
        $transfer->confirmed_by = $user->id;
        $transfer->save();

        $transferredPlayers = explode(',', $transfer['transferred_players']);
        foreach ($transferredPlayers as $player) {
            $upsertData[] = [
                'transferred_players' => $player,
                'id_team_from' => $transfer['id_team_from'],
                'id_team_to' => $transfer['id_team_to'],
                'budget' => $transfer['budget'],
                'created_by' => $transfer['created_by'],
                'buy_by' => $transfer['buy_by'],
                'sold_by' => $transfer['sold_by'],
            ];
            $players = Player::whereIn('name', $transferredPlayers)->get();

            foreach ($players as $player) {
                if ($player->id_team === $transfer->id_team_from) {
                    $player->id_team = $transfer->id_team_to;
                    $player->save();
                }
            }
        }

        $teamFrom = Team::find($transfer->id_team_from);
        $teamTo = Team::find($transfer->id_team_to);

        $webhookUrl = env('DISCORD_WEBHOOK_TRANSFERS');
        $webhookSecret = env('DISCORD_WEBHOOK_SECRET');

        if (count($transferredPlayers) == 1) {
            WebhookCall::create()
                ->url($webhookUrl)
                ->payload([
                    'content' => "----TRATO HECHO----
                    \nLa oferta por {$transferredPlayers[0]} ha sido confirmada
                    \nEl traspaso de {$teamFrom->name} a {$teamTo->name} ha sido completado
                    \nEl monto de la transferencia es de $ {$transfer->budget} y pagado por {$buyUser->name}\n",
                ])
                ->useSecret($webhookSecret)
                ->dispatch();
        } else if ($transferredPlayers > 1) {
            WebhookCall::create()
                ->url($webhookUrl)
                ->payload([
                    'content' => "----TRATO HECHO----
                    \nLas ofertas por los jugadores {$transfer['transferred_players']} han sido confirmadas
                    \nEl traspaso entre {$teamFrom->name} y {$teamTo->name} ha sido completado
                    \nEl monto de la transferencia es de $ {$transfer->budget} y pagado por {$buyUser->name}\n",
                ])
                ->useSecret($webhookSecret)
                ->dispatch();
        }

        Transfer::upsert($upsertData, 'id', ['transferred_players']);

        return response()->json(['message' => 'Transferencia confirmada correctamente']);
    }

    public function getPendingTransfers()
    {
        $user = auth()->user(); // auth()->user() siempre estará definido si el middleware lo permite

        try {
            // Depurar el usuario
            \Log::info('Usuario autenticado: ', ['id' => $user->id]);

            $transfers = Transfer::where('confirmed', 'no')
                ->where(function ($query) use ($user) {
                    $query->where('buy_by', $user->id)
                        ->orWhere('sold_by', $user->id);
                })
                ->where('confirmed_by', null)
                ->where('created_by', '!=', $user->id)
                ->get();

            \Log::info('Transferencias pendientes: ', ['transfers' => $transfers]);

            return response()->json($transfers);
        } catch (\Exception $e) {
            \Log::error('Error en getPendingTransfers: ' . $e->getMessage());
            return response()->json(['error' => 'Ocurrió un error: ' . $e->getMessage()], 500);
        }
    }


}
