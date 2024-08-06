<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
            'id'=>$this->id,
            'name'=>$this->name,
            'age'=>$this->age,
            'ca'=>$this->ca,
            'pa'=>$this->pa,
            'nation'=>$this->nation,
            'id_team' =>TeamResource::collection($this->id_team),
            'value'=>$this->value,
            'status'=>$this->status,
            'goal'=>$this->goal,
            'assistance'=>$this->assistance,
            'yellow_card'=>$this->yellow_card,
            'double_yellow_card'=>$this->double_yellow_card,
            'red_card'=>$this->red_card,
            'injured'=>$this->injured,
            'heavy_injured'=>$this->heavy_injured,
            'mvp'=>$this->mvp,
        ];
    }
}
