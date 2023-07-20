<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RescissionResource extends JsonResource
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
            'id_player' =>$this->id_player,
            'name' => $this->name,
            'id_team' => $this->id_team,
            'value' => $this->value,
            'extra_value' => $this->extra_value,
            'created_by' => $this->created_by,
            'total_value' => $this->total_value,
            'other_players' => $this->other_players,
            'confirmed' => $this->confirmed,
        ];
    }
}
