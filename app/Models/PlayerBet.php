<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlayerBet extends Model
{
    use HasFactory;
    protected $fillable = [
        'id',
        'name',
        'description',
        'goal_odd',
        'card_odd',
        'created_by'
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'playerbet_user', 'id_user', 'id_player_bets')
            ->withPivot(['amount', 'selected_option', 'confirmed', 'id'])
            ->withTimestamps();
    }
}
