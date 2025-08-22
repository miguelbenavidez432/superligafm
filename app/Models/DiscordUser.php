<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DiscordUser extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'discord_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
