<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rescission extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'id_team',
        'value',
        'other_players',
        'extra_value',
        'created_by',
        'total_value',
        'confirmed',
    ];
}
