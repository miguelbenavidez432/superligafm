<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bet extends Model
{
    use HasFactory;
    protected $fillable = [
        'id',
        'match',
        'description',
        'created_by',
        'home_odd',
        'away_odd',
        'draw_odd',
        'under',
        'over',
        'created_at',
        'active',
        'id_season',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'bet_user', 'id_bet', 'id_user')
            ->withPivot(['amount', 'selected_option', 'confirmed', 'id'])
            ->withTimestamps();;
    }

    public function season()
    {
        return $this->belongsTo(User::class, 'id_season');
    }
}
