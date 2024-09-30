<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlayerBetResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'=>$this->id,
            'name'=>$this->name,
            'description'=>$this->description,
            'goal_odd'=>$this->goal_odd,
            'card_odd'=>$this->card_odd,
            'created_by'=>$this->created_by,
            'created_at' => $this->created_at,
            'id_season' => new SeasonResource($this->whenLoaded('season')),
        ];
    }
}
