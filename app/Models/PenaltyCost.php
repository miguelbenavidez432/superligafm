<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PenaltyCost extends Model
{
    use HasFactory;

    protected $fillable = [
        'penalty_type',
        'stage_type',
        'description',
        'cost'
    ];
}
