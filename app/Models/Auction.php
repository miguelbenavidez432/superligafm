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
        'auctioned',
        'amount',
        'confirmed',
        'active'
    ];

    public function player()
    {
        return $this->belongsTo(Player::class, 'id_player');
    }
}
