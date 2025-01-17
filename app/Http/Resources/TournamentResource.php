<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TournamentResource extends JsonResource
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
            'name' => $this->name,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'season' => new SeasonResource($this->whenLoaded('season')),
            'format' => $this->format,
            'type' => $this->type,
            'status' => $this->status,
            'matches' => GameResource::collection($this->whenLoaded('matches')),
            'standings' => StandingResource::collection($this->whenLoaded('standings')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
