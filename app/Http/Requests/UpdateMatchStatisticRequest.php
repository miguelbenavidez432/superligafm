<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMatchStatisticRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'player_id' => 'sometimes|exists:players,id',
            'tournament_id' => 'sometimes|exists:tournaments,id',
            'user_id' => 'sometimes|exists:users,id',
            'goal' => 'nullable|integer',
            'assists' => 'nullable|integer',
            'yellow_cards' => 'nullable|integer',
            'red_cards' => 'nullable|integer',
            'simple_injuries' => 'nullable|integer',
            'serious_injuries' => 'nullable|integer',
            'mvp' => 'nullable|boolean',
        ];
    }
}
