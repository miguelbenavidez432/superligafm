<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransferResource extends JsonResource
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
            'transferred_players' => $this->transferred_players,
            'team_from' => new TeamResource($this->whenLoaded('teamFrom')),
            'team_to' => new TeamResource($this->whenLoaded('teamTo')),
            'budget' => $this->budget,
            'created_by' => new UserResource($this->whenLoaded('creator')), // Relación 'creator'
            'buy_by' => new UserResource($this->whenLoaded('buyer')), // Relación 'buyer'
            'sold_by' => new UserResource($this->whenLoaded('seller')), // Relación 'seller'
            'confirmed_by' => new UserResource($this->whenLoaded('confirmer')),
            'created_at' => $this->created_at->format('d-m-Y H:i:s'),
            'id_season' => new SeasonResource($this->whenLoaded('season')),
            'confirmed' => $this->confirmed,
        ];
    }
}
