<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'division',
        'id_user',
        'cdr',
        'title_first_division',
        'title_second_division',
        'title_third_division',
        'title_cup',
        'title_ucl',
        'title_uel',
        'title_league_cup',
        'title_champions_cup',
        'title_super_cup',
    ];

    public function players()
    {
        return $this->hasMany(Player::class, 'id_team');
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }
    public function transfers()
    {
        return $this->belongsTo(Transfer::class);
    }

    // public function auctions()
    // {
    //     return $this->belongsToMany(Auction::class, 'user_auctions')
    //                 ->withPivot('player_id', 'bid_amount', 'is_last_bid')
    //                 ->withTimestamps();
    // }

    public function auctions()
    {
        return $this->hasMany(Auction::class, 'id_team'); // 'id_team' es el campo en la tabla 'auctions' que referencia el equipo
    }
    public function gamesHome()
    {
        return $this->hasMany(Game::class, 'team_home_id');
    }
    public function gamesAway()
    {
        return $this->hasMany(Game::class, 'team_away_id');
    }
}
