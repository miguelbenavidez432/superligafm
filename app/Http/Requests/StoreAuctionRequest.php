<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAuctionRequest extends FormRequest
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
            'id_player' => 'required|integer',
            'id_team' => 'required|integer',
            'auctioned_by' => 'required|integer',
            'amount' => 'required|integer',
            'created_by' => 'required|integer',
            'id_season' => 'nullable|integer',
        ];
    }
}
