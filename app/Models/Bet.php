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
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
