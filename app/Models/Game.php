<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'tournament_id',
        'team_home_id',
        'team_away_id',
        'score_home',
        'score_away',
        'match_date',
        'status',
        'stage',
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
}
