<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MatchStatistic extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'player_id',
        'tournament_id',
        'user_id',
        'match_id',
        'goals',
        'assists',
        'yellow_cards',
        'red_cards',
        'simple_injuries',
        'serious_injuries',
        'mvp',
    ];

    public function player()
    {
        return $this->belongsTo(Player::class);
    }

    public function tournament()
    {
        return $this->belongsTo(Tournament::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function match()
    {
        return $this->belongsTo(Game::class, 'match_id');
    }
}
