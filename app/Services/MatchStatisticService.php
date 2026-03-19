<?php

namespace App\Services;

use App\Models\MatchStatistic;
use App\Models\Game;
use App\Models\Player;
use Illuminate\Support\Facades\DB;

class MatchStatisticService
{
    public function processMatchStatistics(array $statistics)
    {
        DB::beginTransaction();
        try {
            $relevantStats = ['goals', 'assists', 'yellow_cards', 'red_cards', 'simple_injuries', 'serious_injuries', 'mvp'];
            $matchId = null;

            foreach ($statistics as $statistic) {
                $filteredData = array_filter($statistic, function ($value, $key) {
                    return !in_array($value, [0, null, false], true) || in_array($key, ['user_id', 'tournament_id', 'player_id', 'match_id']);
                }, ARRAY_FILTER_USE_BOTH);

                $hasValidStats = collect($filteredData)->only($relevantStats)->filter(fn($val) => !empty($val))->isNotEmpty();

                if ($hasValidStats) {
                    $player = Player::find($filteredData['player_id']);

                    if ($player && $player->id_team) {
                        $filteredData['team_id'] = $player->id_team;
                    }

                    MatchStatistic::create($filteredData);
                }

                if (!$matchId && isset($statistic['match_id'])) {
                    $matchId = $statistic['match_id'];
                }
            }

            if ($matchId) {
                Game::where('id', $matchId)->update(['status' => 'completed']);
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
