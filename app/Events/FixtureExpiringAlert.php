<?php

namespace App\Events;

use App\Models\Fixture;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FixtureExpiringAlert implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $fixture;
    private $userId;

    /**
     * @param Fixture $fixture El partido por vencer
     * @param int $userId El ID del mánager que debe recibir la alerta
     */
    public function __construct(Fixture $fixture, int $userId)
    {
        $this->fixture = $fixture;
        $this->userId = $userId;
    }

    public function broadcastOn(): array
    {
        // Emitimos en un canal exclusivo para este usuario
        return [
            new PrivateChannel('user.' . $this->userId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'fixture.expiring';
    }
}
