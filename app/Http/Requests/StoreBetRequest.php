<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBetRequest extends FormRequest
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
            'match' => 'required|string',
            'description' => 'required|string',
            'home_odd' => 'required',
            'away_odd' => 'required',
            'draw_odd' => 'required',
            'under' => 'required',
            'over' => 'required',
            'created_by' => 'required|integer'
        ];
    }
}
