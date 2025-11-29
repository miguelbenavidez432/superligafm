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
            'status' => 'required|string',
            'score_home' => 'nullable|integer',
            'score_away' => 'nullable|integer',
            'penalties' => 'nullable|boolean',
            'penalties_home' => 'nullable|integer',
            'penalties_away' => 'nullable|integer',
            'stage' => 'nullable|string',
        ];
    }
}
