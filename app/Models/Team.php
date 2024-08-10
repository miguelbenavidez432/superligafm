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
        'id_user',
    ];

    public function players()
    {
        return $this->hasMany(Player::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }
    public function transfers()
    {
        return $this->hasMany(Transfer::class);
    }
}
