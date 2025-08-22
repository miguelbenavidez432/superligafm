<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DiscordUser;
use App\Models\Player;
use App\Models\Rescission;
use App\Http\Requests\StoreRescissionRequest;
use App\Http\Requests\UpdateRescissionRequest;
use App\Http\Resources\RescissionResource;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\WebhookServer\WebhookCall;

class RescissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        if ($request->query("all") == 'true') {
            return RescissionResource::collection(Rescission::with(['player', 'season', 'team', 'user'])->orderBy("id", "desc")->get());
        } else {
            return RescissionResource::collection(Rescission::with(['player', 'season', 'team', 'user'])->orderBy("id", "desc")->paginate(200));
        }
        ;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRescissionRequest $request)
    {
        $data = $request->validated();

        $teamId = $data['id_team'];

        $team = Team::find($teamId);

        $user = DiscordUser::where('user_id', $team->id_user)->first();

        $userModel = User::find($team->id_user);

        $mentionMessage = '';
        if ($user && $user->discord_id) {
            $mentionMessage .= '<@' . $user->discord_id . '> '; // Mencionar al usuario con su discord_id
        } else {
            $mentionMessage .= $userModel->name;
        }

        if ($team->cdr >= 4) {
            return response()->json(['error' => 'El equipo ya tiene ofertas por 4 jugadores. No se pueden realizar más ofertas.'], 403);
        }

        $offer = Rescission::create($data);

        $existingOffersForPlayer = Rescission::where('id_player', $data['id_player'])->count();
        $player = Player::where('id', $data['id_player'])->get()
            ->first();

        if ($existingOffersForPlayer == 0) {
            $team->cdr += 1;
        }

        $webhookUrl = env('DISCORD_WEBHOOK_URL');
        $webhookSecret = env('DISCORD_WEBHOOK_SECRET');

        WebhookCall::create()
            ->url($webhookUrl)
            ->payload([
                'content' => "{$mentionMessage}\nLa oferta por {$player->name} ha sido realizada. El jugador pertenece al equipo {$team->name}.\n",
            ])
            ->useSecret($webhookSecret)
            ->dispatch();

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
        $playerData = $request->input('player');
        $value = $offer['total_value'];
        $id_team = $offer['id_team'];

        $id = $offer['id'];

        $offerId = Rescission::findOrFail($id);

        if ($offerId->confirmed === 'no') {
            $team = Team::findOrFail($id_team);
            $receiver = User::findOrFail($team->id_user);
            $player = Player::findOrFail($playerData['id']);
            $teamTo = Team::findOrFail($playerData['id_team']);

            $player->update([
                'id_team' => $playerData['id_team'],
                'status' => $playerData['status']
            ]);

            $user = User::findOrFail($offer['created_by']);

            $user->profits -= $value;
            $user->save();

            $userDiscord = DiscordUser::find($teamTo->id_user);
            $mentionMessage = '<@' . $userDiscord->discord_id . '> ';

            $receiver->profits += $value;
            $receiver->save();

            $offerId->confirmed = 'yes';
            $offerId->save();

            $offerId->active = 'no';
            $offerId->save();

            $webhookUrl = env('DISCORD_WEBHOOK_URL');
            $webhookSecret = env('DISCORD_WEBHOOK_SECRET');

            WebhookCall::create()
                ->url($webhookUrl)
                ->payload([
                    'content' => "HERE WE GO (? \nLa oferta por {$player->name} ha sido confirmada.
                    \nEl jugador va a ser transferido al equipo de {$teamTo->name}.
                \nEl monto de la transferencia es de $ {$value} y fue pagado por {$user->name} {$mentionMessage}.\n",
                ])
                ->useSecret($webhookSecret)
                ->dispatch();

            return response()->json(['message' => 'Oferta confirmada exitosamente']);
        } else {
            return response()->json(['message' => 'Oferta ya confirmada'], 403);
        }

    }

    public function closeOffer(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|exists:rescissions,id',
        ]);

        $offer = Rescission::findOrFail($validated['id']);

        $offer->active = 'no';

        if ($offer->save()) {
            return response()->json([
                'message' => 'La oferta ha sido cerrada satisfactoriamente',
                'offer' => new RescissionResource($offer),
            ], 200);
        } else {
            return response()->json([
                'message' => 'Hubo un error al cerrar la oferta.',
            ], 500);
        }
    }

}
