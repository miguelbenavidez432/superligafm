<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public static $wrap = false;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request)
    {
        return[
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'equipo' => $this->equipo,
            'rol' => $this->rol,
            'gastos' => $this->gastos,
            'ganancias' => $this->ganancias,
            'created_at' => $this->created_at->format('d-m-Y H:i:s'),
        ];
    }
}
