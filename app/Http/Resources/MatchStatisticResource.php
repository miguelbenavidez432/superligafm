<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MatchStatisticResource extends JsonResource
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
            'player_id' => new PlayerResource($this->whenLoaded('player')),
            'tournament_id' => new TournamentResource($this->whenLoaded('tournament')),
            'user_id' => new TeamResource($this->whenLoaded('user')),
            'match_id' => new GameResource($this->whenLoaded('match')),
            'goals' => $this->goals,
            'assists' => $this->assists,
            'yellow_cards' => $this->yellow_cards,
            'red_cards' => $this->red_cards,
            'simple_injuries' => $this->simple_injuries,
            'serious_injuries' => $this->serious_injuries,
            'mvp' => $this->mvp,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
