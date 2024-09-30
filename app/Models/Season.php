<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Season extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'name',
        'start',
        'end',
        'active',
    ];

    public function getStartAttribute($value)
    {
        return Carbon::parse($value);
    }

    public function getEndAttribute($value)
    {
        return Carbon::parse($value);
    }

}
