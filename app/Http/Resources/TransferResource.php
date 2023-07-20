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
        return[
            'id' => $this->id,
            'transferred_players' => $this->transferred_players,
            'id_team_from' => $this->id_team_from,
            'id_team_to' => $this->id_team_to,
            'budget' => $this->budget,
            'created_by' => $this->created_by,
            'confirmed_by' => $this->confirmed_by,
            'sold_by' => $this->sold_by,
            'buy_by' => $this->buy_by
        ];
    }
}
