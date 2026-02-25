<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class GameImage extends Model
{
    use HasFactory;

    protected $fillable = ['game_id', 'image_path'];

    protected $appends = ['url'];

    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    protected function url(): Attribute
    {
        return Attribute::make(
            // La función asset() usa dinámicamente el APP_URL de tu archivo .env
            get: fn () => asset('storage/' . $this->image_path),
        );
    }
}
