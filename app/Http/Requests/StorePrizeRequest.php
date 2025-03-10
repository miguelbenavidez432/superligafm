<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePrizeRequest extends FormRequest
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
            'tournament_id' => 'required|exists:tournaments,id',
            'team_id' => 'required|exists:teams,id',
            'amount' => 'required|numeric',
            'position' => 'nullable|string',
            'description' => 'nullable|string',
            'status' => 'nullable|string',
        ];
    }
}
