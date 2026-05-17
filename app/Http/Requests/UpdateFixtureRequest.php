<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFixtureRequest extends FormRequest
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
            'id_season' => 'sometimes|integer|exists:seasons,id',
            'id_tournament' => 'sometimes|integer|exists:tournaments,id',
            'matchday' => 'sometimes|integer',
            'home_team_id' => 'sometimes|integer|exists:teams,id|different:away_team_id',
            'away_team_id' => 'sometimes|integer|exists:teams,id',
            'due_date' => 'sometimes|date',
            'status' => 'sometimes|in:pendiente,jugado,aplazado',
        ];
    }
}
