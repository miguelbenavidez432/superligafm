<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rule;
use Illuminate\Http\Request;

class RuleController extends Controller
{
    // Obtener todas las reglas
    public function index()
    {
        return response()->json(Rule::orderBy('order_index', 'asc')->get());
    }

    // Actualizar las reglas enviadas desde React
    public function updateAll(Request $request)
    {
        $rulesData = $request->validate([
            'rules' => 'required|array',
            'rules.*.id' => 'sometimes|exists:rules,id',
            'rules.*.title' => 'required|string',
            'rules.*.icon' => 'nullable|string',
            'rules.*.content' => 'required|string',
        ]);

        foreach ($rulesData['rules'] as $ruleData) {
            Rule::where('id', $ruleData['id'])->update([
                'title' => $ruleData['title'],
                'icon' => $ruleData['icon'],
                'content' => $ruleData['content'],
            ]);
        }

        return response()->json(['message' => 'Reglamento actualizado correctamente']);
    }
}
