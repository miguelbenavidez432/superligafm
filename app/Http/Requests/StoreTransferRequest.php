<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransferRequest extends FormRequest
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
            'transferred_players' => 'required|string',
            'id_team_from' => 'required|integer',
            'id_team_to' => 'required|integer',
            'budget' => 'required|integer|nullable',
            'created_by' => 'integer|required',
            'buy_by' => 'integer|required',
            'sold_by' => 'integer|required',
        ];
    }
}
