<?php

namespace App\Services;

use App\Models\Team;
use App\Models\Player;
use App\Models\PenaltyCost;
use App\Models\PenaltyCancellation;
use App\Models\DiscordUser; // 🔥 Importante importar esto
use Log;
use Spatie\WebhookServer\WebhookCall;
use Exception;

class PenaltyCancellationService
{
    public function processCancellation(array $data)
    {
        $team = Team::findOrFail($data['team_id']);
        $user = $team->user;
        $rivalTeam = Team::findOrFail($data['rival_team_id']);
        $player = Player::findOrFail($data['player_id']);
        $penaltyCost = PenaltyCost::findOrFail($data['penalty_cost_id']);
        Log::info("Procesando cancelación de sanción para el equipo {$team->name} y jugador {$player->name} con costo {$penaltyCost->cost} {$user}");
        if ($user->profits < $penaltyCost->cost) {
            throw new Exception("El equipo no tiene presupuesto suficiente para esta gestión.");
        }

        $user->profits -= $penaltyCost->cost;
        $user->save();

        PenaltyCancellation::create([
            'team_id' => $team->id,
            'player_id' => $player->id,
            'penalty_cost_id' => $penaltyCost->id,
            'amount_paid' => $penaltyCost->cost,
        ]);

        $this->notifyDiscord($team, $rivalTeam, $player, $penaltyCost);

        return true;
    }

    private function notifyDiscord($team, $rivalTeam, $player, $penaltyCost)
    {
        $managerDiscord = DiscordUser::where('user_id', $team->user_id)->first();
        $rivalDiscord = DiscordUser::where('user_id', $rivalTeam->user_id)->first();

        $mentionManager = $managerDiscord ? "<@{$managerDiscord->discord_id}>" : "**{$team->name}**";
        $mentionRival = $rivalDiscord ? "<@{$rivalDiscord->discord_id}>" : "**{$rivalTeam->name}**";

        $costFormatted = number_format($penaltyCost->cost, 0, ',', '.');

        $webhookUrl = env('DISCORD_WEBHOOK_SANCTIONS');
        $webhookSecret = env('DISCORD_WEBHOOK_SECRET');

        $message = "⚖️ **¡APELACIÓN DE SANCIÓN!** ⚖️\n\n";
        $message .= "El manager {$mentionManager} ha abonado **$ {$costFormatted}** para cancelar la suspensión de **{$player->name}**.\n";
        $message .= "Motivo cancelado: *{$penaltyCost->description}*.\n\n";
        $message .= "👀 Atento a esto {$mentionRival}, tu próximo rival acaba de habilitar a su jugador para el partido.";

        WebhookCall::create()
            ->url($webhookUrl)
            ->payload(['content' => $message])
            ->useSecret($webhookSecret)
            ->dispatch();
    }
}
