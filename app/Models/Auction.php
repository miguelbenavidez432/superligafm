<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Auction extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'id_player',
        'id_team',
        'created_by',
        'auctioned_by',
        'amount',
        'confirmed',
        'active'
    ];

    public function player()
    {
        return $this->belongsTo(Player::class, 'id_player');
    }

    public function team()
    {
        return $this->belongsTo(Team::class, 'id_team');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'auctioned_by');
    }
}
