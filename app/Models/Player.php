<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Player extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'id',
        'name',
        'id_team',
        'age',
        'ca',
        'pa',
        'value',
        'status',
        'team'
    ];

    public function team()
    {
        return $this->belongsTo(Team::class, 'id_team');
    }

    public function rescissions()
    {
        return $this->hasMany(Rescission::class, 'id_player');
    }

    public function auctions()
    {
        return $this->hasMany(Auction::class, 'id_player');
    }

    public function matchStatistics()
    {
        return $this->hasMany(MatchStatistic::class);
    }
}
