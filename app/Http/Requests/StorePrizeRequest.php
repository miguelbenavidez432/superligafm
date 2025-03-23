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
            'prizes' => 'required|array',
            'prizes.*.tournament_id' => 'required|integer|exists:tournaments,id',
            'prizes.*.team_id' => 'required|integer|exists:teams,id',
            'prizes.*.amount' => 'required|numeric',
            'prizes.*.position' => 'required|string',
            'prizes.*.description' => 'nullable|string',
            'prizes.*.status' => 'nullable|string'
        ];
    }
}
