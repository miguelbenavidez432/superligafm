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
        'id_season'
    ];

    public function player()
    {
        return $this->belongsTo(Player::class, 'id_player');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Relación con el usuario que hizo la oferta
    public function auctioneer()
    {
        return $this->belongsTo(User::class, 'auctioned_by');
    }

    public function season()
    {
        return $this->belongsTo(User::class, 'id_season');
    }
}
