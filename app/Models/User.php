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
        'google_id',
        'avatar',
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
            ->withTimestamps();
        ;
    }

    public function playerBets()
    {
        return $this->belongsToMany(PlayerBet::class, 'playerbet_user', 'id_user', 'id_player_bets')
            ->withPivot(['amount', 'selected_option', 'confirmed', 'id'])
            ->withTimestamps();
    }

    public function createdTransfers()
    {
        return $this->hasMany(Transfer::class, 'created_by');
    }

    // Relación con las transferencias donde el usuario es el comprador
    public function boughtTransfers()
    {
        return $this->hasMany(Transfer::class, 'buy_by');
    }

    // Relación con las transferencias donde el usuario es el vendedor
    public function soldTransfers()
    {
        return $this->hasMany(Transfer::class, 'sold_by');
    }

    // Relación con las transferencias donde el usuario es el confirmador
    public function confirmedTransfers()
    {
        return $this->hasMany(Transfer::class, 'confirmed_by');
    }

    public function auctions()
    {
        return $this->belongsToMany(Auction::class, 'user_auctions')
            ->withPivot('player_id', 'bid_amount', 'is_last_bid')
            ->withTimestamps();
    }

    public function userAuctions()
    {
        return $this->hasMany(UserAuction::class);
    }

    public function rescissions()
    {
        return $this->hasMany(Rescission::class, 'created_by');
    }

    public function matchStatistics()
    {
        return $this->hasMany(MatchStatistic::class);
    }

    public function discordUser()
    {
        return $this->hasOne(DiscordUser::class);
    }
}
