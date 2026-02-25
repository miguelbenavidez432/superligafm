<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'tournament_id',
        'team_home_id',
        'team_away_id',
        'score_home',
        'score_away',
        'match_date',
        'status',
        'stage',
        'outcome_type',
        'penalties_home',
        'penalties_away'
    ];

    protected $casts = [
        'penalties' => 'boolean',
    ];

    public function tournament()
    {
        return $this->belongsTo(Tournament::class, 'tournament_id');
    }

    public function teamHome()
    {
        return $this->belongsTo(Team::class, 'team_home_id');
    }

    public function teamAway()
    {
        return $this->belongsTo(Team::class, 'team_away_id');
    }

    public function matchStatistics()
    {
        return $this->hasMany(MatchStatistic::class, 'match_id');
    }

    public function images()
    {
        return $this->hasMany(GameImage::class);
    }
}
