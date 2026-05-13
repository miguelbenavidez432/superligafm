<?php

namespace App\Console\Commands;

use App\Models\Player;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class SendTransferiblesListToDiscord extends Command
{
    protected $signature = 'transferibles:send-discord';
    protected $description = 'Envía la lista de todos los jugadores transferibles a un canal de Discord cada 3 horas';

    public function handle()
    {
        try {
            $transferibles = Player::where('status', 'transferible')
                ->with('team')
                ->orderBy('value', 'desc')
                ->get();

            if ($transferibles->isEmpty()) {
                $this->info('No hay jugadores transferibles en este momento');
                return;
            }

            $jugadoresPorEquipo = $transferibles->groupBy(function ($jugador) {
                return $jugador->team?->name ?? 'Sin equipo';
            });

            $ahora = now('America/Argentina/Buenos_Aires')->format('d/m/Y H:i');

            // Mensaje de cabecera
            $cabecera  = "📋 **LISTA DE JUGADORES TRANSFERIBLES** 📋\n";
            $cabecera .= "🕐 Actualizado: **{$ahora}**\n";
            $cabecera .= "👥 Total: **{$transferibles->count()} jugadores**";
            $this->enviarDiscord($cabecera);

            $posicion = 1;

            // Un mensaje por equipo
            foreach ($jugadoresPorEquipo as $equipo => $jugadores) {
                $bloque  = "⚽ **{$equipo}**\n";
                $bloque .= "```\n";

                foreach ($jugadores as $jugador) {
                    $valor  = $this->formatearValor($jugador->value);
                    $nombre = substr($jugador->name, 0, 25);
                    $linea  = sprintf(
                        "%2d. %-25s | CA:%2d | PA:%2d | $%s\n",
                        $posicion++,
                        $nombre,
                        $jugador->ca,
                        $jugador->pa,
                        $valor
                    );
                    $bloque .= $linea;
                }

                $bloque .= "```";

                // Si el bloque supera 2000 chars, lo parte en chunks
                foreach ($this->chunkMensaje($bloque) as $chunk) {
                    $this->enviarDiscord($chunk);
                }
            }

            $this->info('✅ Lista de transferibles enviada a Discord correctamente');
            $this->info('Total de jugadores: ' . $transferibles->count());

        } catch (\Exception $e) {
            $this->error('❌ Error: ' . $e->getMessage());
        }
    }

    /**
     * Divide un mensaje largo en partes de máx 1900 chars (margen de seguridad)
     */
    private function chunkMensaje(string $mensaje, int $limite = 1900): array
    {
        if (mb_strlen($mensaje) <= $limite) {
            return [$mensaje];
        }

        $chunks = [];
        $lineas = explode("\n", $mensaje);
        $actual = '';

        foreach ($lineas as $linea) {
            $candidato = $actual === '' ? $linea : $actual . "\n" . $linea;

            if (mb_strlen($candidato) > $limite) {
                if ($actual !== '') {
                    $chunks[] = $actual . "\n```"; // cerrar bloque de código
                }
                $actual = "```\n" . $linea;        // abrir nuevo bloque
            } else {
                $actual = $candidato;
            }
        }

        if ($actual !== '') {
            $chunks[] = $actual;
        }

        return $chunks;
    }

    private function formatearValor($valor): string
    {
        if ($valor >= 1000000) {
            return number_format($valor / 1000000, 1, ',', '.') . 'M';
        }
        return number_format($valor, 0, ',', '.');
    }

    private function enviarDiscord(string $mensaje): void
    {
        $webhookUrl = env('DISCORD_WEBHOOK_TRANSFERIBLES');

        if (!$webhookUrl) {
            throw new \Exception('No está configurada la variable DISCORD_WEBHOOK_TRANSFERIBLES');
        }

        $response = Http::post($webhookUrl, [
            'content' => $mensaje,
        ]);

        if (!$response->successful()) {
            throw new \Exception('Discord error: ' . $response->status() . ' - ' . $response->body());
        }

        // Pequeña pausa para no saturar el webhook de Discord
        usleep(500000); // 0.5 segundos entre mensajes
    }
}
