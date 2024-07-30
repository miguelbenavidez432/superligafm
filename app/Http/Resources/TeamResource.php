<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;


class TeamResource extends JsonResource
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
            'division' => $this->division,
            'id_user' => UserResource::collection($this->id_user),
            'title_first_division' => $this->title_first_division,
            'title_second_division' => $this->title_second_division,
            'title_third_division' => $this->title_third_division,
            'title_cup' => $this->title_cup,
            'title_ucl' => $this->title_ucl,
            'title_uel' => $this->title_uel,
            'title_league_cup' => $this->title_league_cup,
            'title_champions_cup' => $this->title_champions_cup,
            'title_super_cup' => $this->title_super_cup,
            'cdr' => $this->cdr,
            'image_patch' => $this->image_patch,
        ];
    }
}
