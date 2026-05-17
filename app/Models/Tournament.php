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
        'format',
        'type',
        'season_id',
        'status',
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

    public function fixtures()
    {
        return $this->hasMany(Fixture::class);
    }
}
