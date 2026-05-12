<?php
namespace App\Services\PlayerActions;

use App\Models\User;
use Illuminate\Support\Collection;

class TransferPlayersAction implements PlayerMassiveActionInterface
{
    public function execute(User $manager, Collection $players, $team): array
    {
        foreach ($players as $jugador) {
            $jugador->status = 'transferible';
            $jugador->save();
        }

        return [
            'success' => true,
            'message' => $players->count() . ' jugadores han sido puestos en la lista de transferibles.'
        ];
    }
}
