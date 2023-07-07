<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePlayerRequest extends FormRequest
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
            'age' => 'required|integer|max:50',
            'ca' => 'integer|max:200|required',
            'pa' => 'integer|max:200|required',
            'value' => 'integer|required',
            'id_team' => 'required',
            'status' => 'string'
        ];
    }
}
