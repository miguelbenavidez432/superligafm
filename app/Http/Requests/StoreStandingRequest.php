<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStandingRequest extends FormRequest
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
            'team_id' => 'required|exists:teams,id',
            'tournament_id' => 'required|exists:tournaments,id',
            'played' => 'nullable|integer',
            'won' => 'nullable|integer',
            'drawn' => 'nullable|integer',
            'lost' => 'nullable|integer',
            'goals_for' => 'nullable|integer',
            'goals_against' => 'nullable|integer',
            'goals_difference' => 'nullable|integer',
            'points' => 'required|integer',
        ];
    }
}
