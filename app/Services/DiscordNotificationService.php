<?php

namespace App\Services;

use App\Models\Fixture;
use App\Models\Game;
use App\Models\Tournament;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;

class DiscordNotificationService
{
    public function sendFixtureExpiringAlert(Fixture $fixture, int $alertHour): void
    {
        $webhookUrl = $this->resolveWebhookUrl($fixture->tournament, 'notifications');

        if (!$webhookUrl) {
            \Log::warning("No Discord webhook configured for fixture {$fixture->id} (tournament: {$fixture->tournament?->name})");
            return;
        }

        $color = $alertHour <= 6 ? 16711680 : ($alertHour <= 12 ? 16753920 : 65280);

        $homeDiscordId = $fixture->homeTeam->user->discordUser->discord_id ?? null;
        $awayDiscordId = $fixture->awayTeam->user->discordUser->discord_id ?? null;

        $mentions = [];
        if ($homeDiscordId) {
            $mentions[] = "<@{$homeDiscordId}>";
        }
        if ($awayDiscordId) {
            $mentions[] = "<@{$awayDiscordId}>";
        }

        $contentMessage = count($mentions) > 0
            ? implode(" ", $mentions) . " ⏰ ¡Su partido está por vencer en {$alertHour} horas!"
            : "⏰ ¡Un partido está por vencer en {$alertHour} horas!";

        $payload = [
            'content' => $contentMessage,
            'embeds' => [
                [
                    'title' => 'Alerta de Vencimiento',
                    'description' => "**{$fixture->homeTeam->name}** vs **{$fixture->awayTeam->name}**",
                    'color' => $color,
                    'fields' => [
                        ['name' => '🏆 Torneo', 'value' => $fixture->tournament->name, 'inline' => true],
                        ['name' => '📅 Fecha Límite', 'value' => Carbon::parse($fixture->due_date)->format('d/m/Y H:i'), 'inline' => true],
                    ],
                ],
            ],
        ];

        Http::post($webhookUrl, $payload);
    }

    public function sendGameCreatedAlert(Game $game): void
    {
        $game->loadMissing(['tournament', 'teamHome.user.discordUser', 'teamAway.user.discordUser']);

        $webhookUrl = $this->resolveWebhookUrl($game->tournament, 'notifications');

        if (!$webhookUrl) {
            \Log::warning("No Discord webhook configured for game {$game->id} (tournament: {$game->tournament?->name})");
            return;
        }

        $homeDiscordId = $game->teamHome->user->discordUser->discord_id ?? null;
        $awayDiscordId = $game->teamAway->user->discordUser->discord_id ?? null;

        $mentions = [];
        if ($homeDiscordId) {
            $mentions[] = "<@{$homeDiscordId}>";
        }
        if ($awayDiscordId) {
            $mentions[] = "<@{$awayDiscordId}>";
        }

        $score = "{$game->score_home} - {$game->score_away}";

        $contentMessage = count($mentions) > 0
            ? implode(" ", $mentions)
            : '📋';

        $stage = $game->stage ? " • {$game->stage}" : '';

        $payload = [
            'content' => $contentMessage,
            'embeds' => [
                [
                    'title' => '⚽ Nuevo Resultado Registrado',
                    'description' => "**{$game->teamHome->name}** {$score} **{$game->teamAway->name}**",
                    'color' => 3447003,
                    'fields' => [
                        ['name' => '🏆 Torneo', 'value' => $game->tournament->name, 'inline' => true],
                        ['name' => '📅 Fecha', 'value' => Carbon::parse($game->match_date)->format('d/m/Y H:i'), 'inline' => true],
                    ],
                ],
            ],
        ];

        if ($stage) {
            $payload['embeds'][0]['fields'][] = ['name' => '🎯 Etapa', 'value' => trim($stage, ' •'), 'inline' => true];
        }

        Http::post($webhookUrl, $payload);
    }

    public function resolveWebhookUrl(?Tournament $tournament, string $category = 'notifications'): ?string
    {
        $config = config("discord.webhooks.{$category}");

        if (!$config) {
            return null;
        }

        $format = $tournament?->format;

        if ($format && isset($config['formats'][$format]) && $config['formats'][$format]) {
            return $config['formats'][$format];
        }

        return $config['default'] ?? null;
    }
}
