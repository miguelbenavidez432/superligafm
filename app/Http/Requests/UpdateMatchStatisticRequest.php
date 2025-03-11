<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMatchStatisticRequest extends FormRequest
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
            'statistics' => 'required|array',
            'statistics.*.player_id' => 'required|integer',
            'statistics.*.tournament_id' => 'required|integer',
            'statistics.*.user_id' => 'required|integer',
            'statistics.*.goal' => 'nullable|integer',
            'statistics.*.assists' => 'nullable|integer',
            'statistics.*.yellow_cards' => 'nullable|integer',
            'statistics.*.red_cards' => 'nullable|integer',
            'statistics.*.simple_injuries' => 'nullable|integer',
            'statistics.*.serious_injuries' => 'nullable|integer',
            'statistics.*.mvp' => 'nullable|boolean',
            'statistics.*.match_id' => 'required|integer',
        ];
    }
}
