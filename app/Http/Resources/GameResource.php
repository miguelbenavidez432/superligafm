<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GameResource extends JsonResource
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
            'tournament' => new TournamentResource($this->whenLoaded('tournament')),
            'team_home' => new TeamResource($this->whenLoaded('teamHome')),
            'team_away' => new TeamResource($this->whenLoaded('teamAway')),
            'score_home' => $this->score_home,
            'score_away' => $this->score_away,
            'match_date' => $this->match_date,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
