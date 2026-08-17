// examples/redis/04-leaderboard/game-leaderboard.ts
export function leaderboardExample(context: any) {
    const { redis } = context;

    const LEADERBOARD_KEY = 'game:leaderboard';

    // ============ UPDATE SCORE ============
    async function updateScore(playerId: string, score: number) {
        await redis.zadd(LEADERBOARD_KEY, score, playerId);
        // Keep leaderboard size manageable (top 10000)
        await redis.client.zRemRangeByRank(LEADERBOARD_KEY, 0, -10001);
        return { success: true, playerId, score };
    }

    // ============ GET TOP PLAYERS ============
    async function getTopPlayers(limit: number = 10) {
        const players = await redis.zrange(LEADERBOARD_KEY, 0, limit - 1, true);

        // Format result
        const result = [];
        for (let i = 0; i < players.length; i += 2) {
            result.push({
                rank: i / 2 + 1,
                playerId: players[i],
                score: parseFloat(players[i + 1])
            });
        }
        return result;
    }

    // ============ GET PLAYER RANK ============
    async function getPlayerRank(playerId: string) {
        const rank = await redis.zrank(LEADERBOARD_KEY, playerId);
        if (rank === null) return null;

        const score = await redis.zscore(LEADERBOARD_KEY, playerId);
        const totalPlayers = await redis.client.zCard(LEADERBOARD_KEY);

        return {
            rank: rank + 1,
            total: totalPlayers,
            score: parseFloat(score || '0')
        };
    }

    // ============ GET PLAYERS AROUND RANK ============
    async function getPlayersAroundRank(playerId: string, range: number = 5) {
        const rank = await redis.zrank(LEADERBOARD_KEY, playerId);
        if (rank === null) return null;

        const start = Math.max(0, rank - range);
        const end = rank + range;

        const players = await redis.zrange(LEADERBOARD_KEY, start, end, true);

        const result = [];
        for (let i = 0; i < players.length; i += 2) {
            result.push({
                rank: start + i / 2 + 1,
                playerId: players[i],
                score: parseFloat(players[i + 1]),
                isCurrent: players[i] === playerId
            });
        }
        return result;
    }

    // ============ GET LEADERBOARD STATS ============
    async function getStats() {
        const totalPlayers = await redis.client.zCard(LEADERBOARD_KEY);
        const topScore = await redis.zrange(LEADERBOARD_KEY, 0, 0, true);

        return {
            totalPlayers,
            topScore: topScore.length > 0 ? {
                playerId: topScore[0],
                score: parseFloat(topScore[1] || '0')
            } : null
        };
    }

    return {
        updateScore,
        getTopPlayers,
        getPlayerRank,
        getPlayersAroundRank,
        getStats
    };
}