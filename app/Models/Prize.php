<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prize extends Model
{
    use HasFactory;

    protected $fillable = [
        'tournament_id',
        'amount',
        'description',
    ];

    public function tournament()
    {
        return $this->belongsTo(Tournament::class);
    }

    public function teams()
    {
        return $this->belongsToMany(Team::class)->withPivot('status')->withTimestamps();
    }

    public function scopePending($query)
    {
        return $query->whereNull('team_id')->where('status', 'pendiente');
    }
}
