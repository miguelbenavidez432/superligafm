<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Auction extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_player',
        'id_team',
        'created_by',
        'auctioned_by',
        'amount',
        'confirmed',
        'active',
        'id_season',
        'close'
    ];

    public function player()
    {
        return $this->belongsTo(Player::class, 'id_player');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function auctioneer()
    {
        return $this->belongsTo(User::class, 'auctioned_by');
    }

    public function season()
    {
        return $this->belongsTo(Season::class, 'id_season');
    }

    public function userAuctions()
    {
        return $this->hasMany(UserAuction::class);
    }

    public function team()
    {
        return $this->belongsTo(Team::class, 'id_team');
    }
}
