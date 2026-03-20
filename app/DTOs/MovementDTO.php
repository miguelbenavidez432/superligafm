<?php

namespace App\DTOs;

class MovementDTO
{
    public function __construct(
        public int $id,
        public string $type,
        public string $from_team_name,
        public string $to_team_name,
        public float $value,
        public string $date
    ) {}

    // Metodo para convertirlo a Array para la respuesta JSON
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'from_team_name' => $this->from_team_name,
            'to_team_name' => $this->to_team_name,
            'value' => $this->value,
            'date' => $this->date,
        ];
    }
}
