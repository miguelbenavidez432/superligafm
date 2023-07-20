<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BetResource extends JsonResource
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
            'match' => $this->match,
            'description' => $this->description,
            'home_odd' => $this->home_odd,
            'away_odd' => $this->away_odd,
            'draw_odd' => $this->draw_odd,
            'under' => $this->under,
            'over' => $this->over,
            'created_by' => $this->created_by,
        ];
    }
}
