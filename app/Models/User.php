<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'name',
        'email',
        'password',
        'rol',
        'profits',
        'costs',
        'active',
        'id_team',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function teams()
    {
        return $this->hasOne(Team::class);
    }

    public function bets()
    {
        return $this->belongsToMany(Bet::class, 'bet_user', 'id_bet', 'id_user')
            ->withPivot(['amount', 'selected_option', 'confirmed', 'id'])
            ->withTimestamps();;
    }

    public function playerBets()
    {
        return $this->belongsToMany(PlayerBet::class, 'playerbet_user', 'id_user', 'id_player_bets')
            ->withPivot(['amount', 'selected_option', 'confirmed', 'id'])
            ->withTimestamps();
    }

    public function transfers()
    {
        return $this->belongsToMany(Transfer::class);
    }
}
