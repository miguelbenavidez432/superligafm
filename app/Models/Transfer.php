<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'transferred_players',
        'id_team_from',
        'id_team_to',
        'budget',
        'created_by',
        'confirmed_by',
        'sold_by',
        'buy_by'
    ];

    public function teamFrom()
    {
        return $this->belongsTo(Team::class, 'id_team_from'); // Relación con el equipo de origen
    }

    public function teamTo()
    {
        return $this->belongsTo(Team::class, 'id_team_to'); // Relación con el equipo de destino
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Relación con el usuario que compra el jugador
    public function buyer()
    {
        return $this->belongsTo(User::class, 'buy_by');
    }

    // Relación con el usuario que vende el jugador
    public function seller()
    {
        return $this->belongsTo(User::class, 'sold_by');
    }

    // Relación con el usuario que confirma la transferencia
    public function confirmer()
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }
    public function season()
    {
        return $this->belongsTo(User::class, 'id_season');
    }
}
