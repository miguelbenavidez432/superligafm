<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStandingRequest extends FormRequest
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
            'point' => 'nullable|integer',
            'played' => 'nullable|integer',
            'won' => 'nullable|integer',
            'drawn' => 'nullable|integer',
            'lost' => 'nullable|integer',
            'goals_for' => 'nullable|integer',
            'goals_against' => 'nullable|integer',
            'goal_difference' => 'nullable|integer',
        ];
    }
}
