<?php
namespace App\Services\PlayerActions;

use App\Models\User;
use Illuminate\Support\Collection;

interface PlayerMassiveActionInterface
{
    public function execute(User $manager, Collection $players, $team): array;
}
