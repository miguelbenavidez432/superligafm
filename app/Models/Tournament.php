<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tournament extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'season_id',
        'format'
    ];

    public function matches()
    {
        return $this->hasMany(Game::class);
    }
    public function season()
    {
        return $this->belongsTo(Season::class, 'season_id');
    }

    public function standings()
    {
        return $this->hasMany(Standing::class);
    }

    public function matchStatistics()
    {
        return $this->hasMany(MatchStatistic::class);
    }
}
