<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\TeamResource;
use App\Http\Resources\UserResource;
use App\Http\Resources\PlayerResource;

class AuctionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'id_player' => new PlayerResource($this->whenLoaded('player')),
            'id_team' => new TeamResource($this->whenLoaded('team')),
            'created_by' => new UserResource($this->whenLoaded('creator')),  // Relación con el creador
            'auctioned_by' => new UserResource($this->whenLoaded('auctioneer')),
            'amount' => $this->amount,
            'confirmed' => $this->confirmed,
            'active' => $this->active,
            'created_at' => $this->created_at->format('d-m-Y H:i:s'),
            'id_season' => new SeasonResource($this->whenLoaded('season')),
        ];
    }
}
