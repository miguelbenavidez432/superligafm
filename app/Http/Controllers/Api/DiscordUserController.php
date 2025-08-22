<?php

namespace App\Http\Controllers\Api;

use App\Models\DiscordUser;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDiscordUserRequest;
use App\Http\Requests\UpdateDiscordUserRequest;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DiscordUserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreDiscordUserRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(DiscordUser $discordUser)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateDiscordUserRequest $request, DiscordUser $discordUser)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DiscordUser $discordUser)
    {
        //
    }


    public function redirectToDiscord(Request $request)
    {
        $userId = $request->query('userId');

        $discordAuthorizeUrl = 'https://discord.com/oauth2/authorize?client_id=' . env('DISCORD_CLIENT_ID') .
            '&redirect_uri=' . urlencode(env('DISCORD_REDIRECT_URI')) .
            '&response_type=code&scope=identify&state=' . $userId;

        return response()->json(['url' => $discordAuthorizeUrl]);
    }

    // Manejar la redirección de Discord y asociar la cuenta de Discord con el usuario autenticado
    public function handleCallback(Request $request)
    {
        $code = $request->query('code');
        $userId = $request->query('state');
        \Log::info('Código recibido de Discord:', ['code' => $code]);
        if (!$code) {
            return response()->json(['error' => 'No se recibió el código de autorización.'], 400);
        }

        try {
            $client = new Client();
            $response = $client->post('https://discord.com/api/oauth2/token', [
                'form_params' => [
                    'client_id' => env('DISCORD_CLIENT_ID'),
                    'client_secret' => env('DISCORD_CLIENT_SECRET'),
                    'grant_type' => 'authorization_code',
                    'code' => $code,
                    'redirect_uri' => env('DISCORD_REDIRECT_URI'),
                    'scope' => 'identify',
                ],
            ]);
            $data = json_decode($response->getBody(), true);
            \Log::info('Respuesta de Discord token:', ['data' => $data]);
            if (!isset($data['access_token'])) {
                return response()->json(['error' => 'Error al obtener el token de acceso de Discord.'], 400);
            }

            $accessToken = $data['access_token'];

            $userResponse = $client->get('https://discord.com/api/users/@me', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                ],
            ]);
            $userData = json_decode($userResponse->getBody(), true);
            \Log::info('Datos de usuario Discord:', ['userData' => $userData]);
            if (!isset($userData['id'])) {
                return response()->json(['error' => 'No se pudo obtener la información del usuario desde Discord.'], 400);
            }

            $discordId = $userData['id'];
            $discordUsername = $userData['username'];

            $user = \App\Models\User::find($userId);
            \Log::info('Usuario autenticado:', ['user' => $user]);
            if (!$user) {
                return response()->json(['error' => 'Debes iniciar sesión antes de vincular tu cuenta de Discord.'], 401);
            }

            DiscordUser::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'discord_id' => $discordId,
                    'discord_username' => $discordUsername
                ]
            );
            \Log::info('Datos guardados en DiscordUser:', [
                'user_id' => $user->id,
                'discord_id' => $discordId,
                'discord_username' => $discordUsername
            ]);

            return response()->json(['message' => 'Cuenta de Discord vinculada correctamente'], 200);

        } catch (\Exception $e) {
            \Log::error('Error en handleCallback:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Ocurrió un error al vincular la cuenta de Discord: ' . $e->getMessage()], 500);
        }
    }
}
