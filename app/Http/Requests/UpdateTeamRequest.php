<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTeamRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'division' => 'nullable|string',
            'id_user' => 'nullable|integer|exists:users,id',
            'title_first_division' => 'nullable|integer',
            'title_second_division' => 'nullable|integer',
            'title_third_division' => 'nullable|integer',
            'title_cup' => 'nullable|integer',
            'title_ucl' => 'nullable|integer',
            'title_uel' => 'nullable|integer',
            'title_league_cup' => 'nullable|integer',
            'title_champions_cup' => 'nullable|integer',
            'title_super_cup' => 'nullable|integer',
        ];
    }
}
