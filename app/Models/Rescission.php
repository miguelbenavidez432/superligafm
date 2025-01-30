<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rescission extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'name',
        'id_player',
        'id_team',
        'value',
        'other_players',
        'extra_value',
        'created_by',
        'total_value',
        'confirmed',
        'id_season',
        'active'
    ];

    public function player()
    {
        return $this->belongsTo(Player::class, 'id_player');
    }

    public function season()
    {
        return $this->belongsTo(Season::class, 'id_season');
    }

    public function team()
    {
        return $this->belongsTo(Team::class, 'id_team');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

}
