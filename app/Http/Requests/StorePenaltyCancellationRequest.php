<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePenaltyCancellationRequest extends FormRequest
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
            'team_id' => 'required|exists:teams,id',
            'rival_team_id' => 'required|exists:teams,id|different:team_id',
            'player_id' => 'required|exists:players,id',
            'penalty_cost_id' => 'required|exists:penalty_costs,id'
        ];
    }
}
