<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRescissionRequest extends FormRequest
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
            'name' => 'required|string',
            'id_player' => 'required|integer',
            'id_team' => 'required|integer',
            'value' => 'required|integer',
            'extra_value' => 'integer|nullable',
            'created_by' => 'integer|required',
            'total_value' => 'integer|required',
            'other_players' => 'nullable',
            'id_season' => 'required|integer|nullable',
        ];
    }
}
