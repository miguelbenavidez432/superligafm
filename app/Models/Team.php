<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'division',
    ];

    public function players()
    {
        return $this->hasMany(Player::class);
    }
    public function users()
    {
        return $this->hasOne(User::class);    
    }
}
