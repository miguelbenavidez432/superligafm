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
            'match_id' => new GameResource($this->whenLoaded('match')),
            'goals' => $this->goals,
            'assists' => $this->assists,
            'yellow_cards' => $this->yellow_cards,
            'red_cards' => $this->red_cards,
            'simple_injuries' => $this->simple_injuries,
            'serious_injuries' => $this->serious_injuries,
            'mvp' => $this->mvp,
            'total_yellow_cards' => $this->total_yellow_cards,
            'total_red_cards' => $this->total_red_cards,
            'max_stage' => $this->max_stage,
            'stage' => $this->stage,
            'direct_red' => $this->direct_red,
        ];
    }
}
