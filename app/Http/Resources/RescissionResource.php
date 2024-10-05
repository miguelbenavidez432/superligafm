<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RescissionResource extends JsonResource
{
    public static $wrap = false;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return[
            'id' => $this->id,
            //'id_player' => new PlayerResource($this->whenLoaded('player')),
            'id_player' =>$this->id_player,
            'name' => $this->name,
            //'id_team' => new TeamResource($this->whenLoaded('team')),
            'id_team' => $this->id_team,
            'value' => $this->value,
            'extra_value' => $this->extra_value,
            //'created_by' => new UserResource($this->whenLoaded('user')),
            'created_by' => $this->created_by,
            'total_value' => $this->total_value,
            'other_players' => $this->other_players,
            'confirmed' => $this->confirmed,
            'created_at' => $this->created_at,
            //'id_season' => new SeasonResource($this->whenLoaded('season')),
            'id_season' => new SeasonResource($this->whenLoaded('season')),
            'active' => $this->active,
        ];
    }
}
