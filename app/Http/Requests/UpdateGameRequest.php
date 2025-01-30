<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGameRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'tournament_id' => 'sometimes|exists:tournaments,id',
            'team_home_id' => 'sometimes|exists:teams,id',
            'team_away_id' => 'sometimes|exists:teams,id',
            'score_home' => 'nullable|integer',
            'score_away' => 'nullable|integer',
            'match_date' => 'sometimes|date',
        ];
    }
}
