<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\GameResource;
use App\Models\Game;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGameRequest;
use App\Http\Requests\UpdateGameRequest;
use App\Models\Standing;
use App\Models\Tournament;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class GameController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->query('all') == 'true') {
            return GameResource::collection(Game::with(['tournament', 'teamHome', 'teamAway'])->get());
        } else {
            return GameResource::collection(Game::with(['tournament', 'teamHome', 'teamAway'])->paginate(1000));
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGameRequest $request)
    {
        $data = $request->validated();
        $date = new \DateTime(now());
        $data['match_date'] = date('Y-m-d H:i:s', strtotime($date->format('Y-m-d H:i:s')));
        $tournamentId = $data['tournament_id'];

        $tournament = Tournament::find($tournamentId);

        $existingGameExists = Game::where('tournament_id', $tournamentId)
            ->where('team_home_id', $data['team_home_id'])
            ->where('team_away_id', $data['team_away_id'])
            ->where('stage', $data['stage'])
            ->exists();

        if ($existingGameExists) {
            return response()->json([
                'message' => 'Ya existe un partido registrado para este torneo, equipos y fecha.'
            ], 422);
        }

        if ($tournament->type == 'league') {
            $teamHomeId = $data['team_home_id'];
            $teamAwayId = $data['team_away_id'];

            $homeStanding = Standing::firstOrNew([
                'tournament_id' => $tournamentId,
                'team_id' => $teamHomeId,
            ]);

            $awayStanding = Standing::firstOrNew([
                'tournament_id' => $tournamentId,
                'team_id' => $teamAwayId,
            ]);

            switch ($data['score_home'] <=> $data['score_away']) {
                case 1:
                    $data['winner'] = 'home';
                    $homeStanding->played += 1;
                    $homeStanding->won += 1;
                    $homeStanding->points += 3;
                    $homeStanding->goals_for += $data['score_home'];
                    $homeStanding->goals_against += $data['score_away'];
                    $homeStanding->goal_difference = $homeStanding->goals_for - $homeStanding->goals_against;
                    $awayStanding->played += 1;
                    $awayStanding->lost += 1;
                    $awayStanding->goals_for += $data['score_away'];
                    $awayStanding->goals_against += $data['score_home'];
                    $awayStanding->goal_difference = $awayStanding->goals_for - $awayStanding->goals_against;
                    break;
                case -1:
                    $data['winner'] = 'away';
                    $homeStanding->played += 1;
                    $homeStanding->lost += 1;
                    $homeStanding->goals_for += $data['score_home'];
                    $homeStanding->goals_against += $data['score_away'];
                    $homeStanding->goal_difference = $homeStanding->goals_for - $homeStanding->goals_against;
                    $awayStanding->played += 1;
                    $awayStanding->won += 1;
                    $awayStanding->points += 3;
                    $awayStanding->goals_for += $data['score_away'];
                    $awayStanding->goals_against += $data['score_home'];
                    $awayStanding->goal_difference = $awayStanding->goals_for - $awayStanding->goals_against;
                    break;
                default:
                    $data['winner'] = 'draw';
                    $homeStanding->played += 1;
                    $homeStanding->drawn += 1;
                    $homeStanding->points += 1;
                    $homeStanding->goals_for += $data['score_home'];
                    $homeStanding->goals_against += $data['score_away'];
                    $homeStanding->goal_difference = $homeStanding->goals_for - $homeStanding->goals_against;
                    $awayStanding->played += 1;
                    $awayStanding->drawn += 1;
                    $awayStanding->points += 1;
                    $awayStanding->goals_for += $data['score_away'];
                    $awayStanding->goals_against += $data['score_home'];
                    $awayStanding->goal_difference = $awayStanding->goals_for - $awayStanding->goals_against;
                    break;
            }

            $homeStanding->save();
            $awayStanding->save();
        }

        $game = Game::create($data);
        return response(new GameResource($game), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Game $game)
    {
        $game = $game->load(['tournament', 'teamHome', 'teamAway']);
        return new GameResource($game);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateGameRequest $request, Game $game)
    {
        $data = $request->validated();
        $game->update($data);
        return response()->json([
            'message' => 'El juego se actualizó correctamente',
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Game $game)
    {
        $game->delete();
        return response(null, 204);
    }

    private function saveImage($image)
    {
        // Check if image is valid base64 string
        if (preg_match('/^data:image\/(\w+);base64,/', $image, $type)) {
            // Take out the base64 encoded text without mime type
            $image = substr($image, strpos($image, ',') + 1);
            // Get file extension
            $type = strtolower($type[1]); // jpg, png, gif

            // Check if file is an image
            if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png'])) {
                throw new \Exception('invalid image type');
            }
            $image = str_replace(' ', '+', $image);
            $image = base64_decode($image);

            if ($image === false) {
                throw new \Exception('base64_decode failed');
            }
        } else {
            throw new \Exception('did not match data URI with image data');
        }

        $dir = 'images/';
        $file = Str::random() . '.' . $type;
        $absolutePath = public_path($dir);
        $relativePath = $dir . $file;
        if (!File::exists($absolutePath)) {
            File::makeDirectory($absolutePath, 0755, true);
        }
        file_put_contents($relativePath, $image);

        return $relativePath;
    }

    public function getGameById($id)
    {
        $game = Game::with(['tournament', 'teamHome', 'teamAway'])->find($id);

        if (!$game) {
            return response()->json(['message' => 'Partido no encontrado'], 404);
        }

        return new GameResource($game);
    }


    // public function getBySlug(Survey $survey)
    // {
    //     if (!$survey->status) {
    //         return response("", 404);
    //     }

    //     $currentDate = new \DateTime();
    //     $expireDate = new \DateTime($survey->expire_date);
    //     if ($currentDate > $expireDate) {
    //         return response("", 404);
    //     }

    //     return new SurveyResource($survey);
    // }


}
