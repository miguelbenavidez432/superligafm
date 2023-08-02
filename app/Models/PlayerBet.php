<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlayerBet extends Model
{
    use HasFactory;
    protected $fillable = [
        'id',
        'name',
        'description',
        'goal_odd',
        'card_odd',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'playerbet_user');
    }
}
