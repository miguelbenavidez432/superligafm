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
        'created_by',
        'id_season'
    ];

    public function user()
    {
        return $this->belongsToMany(User::class, 'playerbet_user', 'id_user', 'id_player_bets')
            ->withPivot(['amount', 'selected_option', 'confirmed', 'id'])
            ->withTimestamps();
    }

    public function season()
    {
        return $this->belongsTo(User::class, 'id_season');
    }
}
