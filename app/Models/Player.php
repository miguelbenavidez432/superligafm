<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Player extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'id_team',
        'age',
        'ca',
        'pa',
        'value',
        'status'
    ];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function rescissions()
    {
        return $this->hasMany(Rescission::class, 'id_player');
    }
}
