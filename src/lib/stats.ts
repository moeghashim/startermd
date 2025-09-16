import { kv } from '@vercel/kv';

export interface Stats {
  totalGenerated: number;
  agentBreakdown: Record<string, number>;
  dailyStats: Record<string, number>;
  lastUpdated: string;
}

const STATS_KEY = 'startermd:stats';

export async function getStats(): Promise<Stats> {
  try {
    const stats = await kv.get<Stats>(STATS_KEY);
    if (stats) {
      return stats;
    }
    // Return default stats if key doesn't exist
    return {
      totalGenerated: 0,
      agentBreakdown: {},
      dailyStats: {},
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching stats from KV:', error);
    // Return default stats on error
    return {
      totalGenerated: 0,
      agentBreakdown: {},
      dailyStats: {},
      lastUpdated: new Date().toISOString()
    };
  }
}

export async function updateStats(agent: string): Promise<void> {
  try {
    const stats = await getStats();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    stats.totalGenerated += 1;
    stats.agentBreakdown[agent] = (stats.agentBreakdown[agent] || 0) + 1;
    stats.dailyStats[today] = (stats.dailyStats[today] || 0) + 1;
    stats.lastUpdated = new Date().toISOString();

    await kv.set(STATS_KEY, stats);
  } catch (error) {
    console.error('Error updating stats in KV:', error);
    // Don't throw error as this shouldn't break the main functionality
  }
}
