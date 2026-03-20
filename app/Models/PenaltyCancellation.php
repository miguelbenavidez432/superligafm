<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PenaltyCancellation extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'player_id',
        'penalty_cost_id',
        'amount_paid'
    ];
}
