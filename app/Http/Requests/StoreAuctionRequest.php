<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Season;

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

    protected function prepareForValidation()
    {
        $activeSeason = Season::where('active', 'yes')->first() ?? Season::latest()->first();

        // El método merge() sobrescribe el dato que envió React
        // o lo crea si React no lo envió.
        $this->merge([
            'id_season' => $activeSeason->id,
        ]);
    }
}
