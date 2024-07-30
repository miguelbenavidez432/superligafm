<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuctionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return[
            'id' => $this->id,
            'id_player' => PlayerResource::collection($this->id_player),
            'id_team' => TeamResource::collection($this->id_team),
            'created_by' => UserResource::collection($this->created_by),
            'auctioned_by' => UserResource::collection($this->auctioned_by),
            'amount' => $this->amount,
            'confirmed' => $this->confirmed,
            'active' => $this->active,
            'created_at' => $this->created_at->format('d-m-Y H:i:s'),
        ];
    }
}
