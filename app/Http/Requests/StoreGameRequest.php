<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreGameRequest extends FormRequest
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
            'tournament_id' => 'required|exists:tournaments,id',
            'team_home_id' => 'required|exists:teams,id',
            'team_away_id' => 'required|exists:teams,id',
            'score_home' => 'nullable|integer',
            'score_away' => 'nullable|integer',
            'match_date' => 'date|nullable',
            'status' => 'string|nullable',
            'stage' => 'string|nullable',
        ];
    }
}
