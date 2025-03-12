<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\TeamResource;

class PlayerResource extends JsonResource
{
    public static $wrap = false;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'age' => $this->age,
            'ca' => $this->ca,
            'pa' => $this->pa,
            'nation' => $this->nation,
            'id_team' => new TeamResource($this->whenLoaded('team')),
            'value' => $this->value,
            'status' => $this->status,
        ];
    }
}
