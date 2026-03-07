<?php
namespace App\Services;

use App\Models\Player;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Exception;

class PlayerManagementService
{
    public function blockPlayersMassively(User $manager, array $playerIds)
    {
        // Iniciamos transacción: Si algo falla, Laravel deshace todos los cambios automáticamente
        DB::beginTransaction();

        try {
            $players = Player::whereIn('id', $playerIds)->get();

            if ($players->isEmpty()) {
                throw new Exception('No se encontraron los jugadores.');
            }

            $team = $players->first()->team;

            // Validar propiedad del equipo
            if (!$team || $team->id_user !== $manager->id) {
                throw new Exception('No tienes permisos para gestionar estos jugadores.');
            }

            // En tu frontend pusiste límite de 4, así que lo igualamos aquí (antes tenías 3)
            $currentBlockedCount = $team->players()->where('status', 'bloqueado')->count();
            $newBlockedCount = $currentBlockedCount + $players->count();

            if ($newBlockedCount > 3) {
                throw new Exception("El equipo no puede tener más de 3 jugadores bloqueados. Actualmente tienes {$currentBlockedCount}.");
            }

            $totalCost = 0;
            $bloqueadosActuales = $currentBlockedCount;

            // Procesamos cada jugador
            foreach ($players as $jugador) {
                if ($jugador->status === 'bloqueado') {
                    continue; // Si ya estaba bloqueado, lo saltamos
                }

                // Usamos tu función de costo (Asegúrate de tenerla en este servicio o pasarla)
                $costo = $this->calcularCostoBloqueo($jugador, $bloqueadosActuales);
                $totalCost += $costo;
                $bloqueadosActuales++;

                $jugador->status = 'bloqueado';
                $jugador->save();
            }

            // VALIDACIÓN CRÍTICA: ¿Tiene dinero suficiente?
            // if ($manager->profits < $totalCost) {
            //     throw new Exception("Presupuesto insuficiente. El costo total es de \${$totalCost} y solo tienes \${$manager->profits}.");
            // }

            // Cobramos
            $manager->profits -= $totalCost;
            $manager->save();

            DB::commit();

            return [
                'success' => true,
                'message' => count($playerIds) . ' jugadores bloqueados exitosamente.',
                'costo_total' => $totalCost,
                'nuevo_presupuesto' => $manager->profits
            ];

        } catch (Exception $e) {
            DB::rollBack();
            throw $e; // Lanzamos el error hacia el controlador
        }
    }

    // Traemos tu función de costo aquí para encapsular la lógica
    private function calcularCostoBloqueo($player, $cantidad)
    {
        $ca = $player->ca;
        $division = $player->team->division;

        $costo = 0;

        if ($cantidad == 0)
            return $costo;

        if ($division == 'Primera') {
            if ($ca >= 180 && $ca <= 200) {
                $costo = 60000000;
            } elseif ($ca < 180) {
                $costo = 40000000;
            }
        } elseif ($division == 'Segunda') {
            if ($ca >= 180 && $ca <= 200) {
                $costo = 85000000;
            } elseif ($ca < 180) {
                $costo = 60000000;
            }
        }

        return $costo;
    }

    public function releasePlayersMassively(User $manager, array $playerIds)
    {
        DB::beginTransaction();

        try {
            $players = Player::whereIn('id', $playerIds)->get();

            if ($players->isEmpty()) {
                throw new Exception('No se encontraron los jugadores.');
            }

            foreach ($players as $jugador) {
                $team = $players->first()->team;

                if (!$team || $team->id_user !== $manager->id) {
                    throw new Exception("No tienes permisos para liberar a {$jugador->name}.");
                }

                $jugador->id_team = 61;
                $jugador->status = 'liberado';
                $jugador->value *= 0.6; // Pierde el 40% de su valor
                $jugador->save();
            }

            DB::commit();

            return [
                'success' => true,
                'message' => $players->count() . ' jugadores han sido liberados y enviados a Agentes Libres.'
            ];

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * REGISTRAR JUGADORES
     */
    public function registerPlayersMassively(User $manager, array $playerIds)
    {
        DB::beginTransaction();

        try {
            $players = Player::whereIn('id', $playerIds)->get();

            if ($players->isEmpty()) {
                throw new Exception('No se encontraron los jugadores.');
            }

            foreach ($players as $jugador) {
                $team = $jugador->team;

                if (!$team || $team->id_user !== $manager->id) {
                    throw new Exception("No tienes permisos para registrar a {$jugador->name}.");
                }

                // Aplicamos la regla
                $jugador->status = 'registrado';
                $jugador->save();
            }

            DB::commit();

            return [
                'success' => true,
                'message' => $players->count() . ' jugadores registrados exitosamente.'
            ];

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
