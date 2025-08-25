import { promises as fs } from 'fs';
import { join } from 'path';

export interface Stats {
  totalGenerated: number;
  agentBreakdown: Record<string, number>;
  dailyStats: Record<string, number>;
  lastUpdated: string;
}

const STATS_FILE = join(process.cwd(), 'data', 'stats.json');

export async function getStats(): Promise<Stats> {
  try {
    const data = await fs.readFile(STATS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    // Return default stats if file doesn't exist
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
    console.log('Updating stats for agent:', agent);
    
    // Ensure data directory exists
    const dataDir = join(process.cwd(), 'data');
    try {
      await fs.access(dataDir);
      console.log('Data directory exists');
    } catch {
      console.log('Creating data directory');
      await fs.mkdir(dataDir, { recursive: true });
    }

    const stats = await getStats();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    stats.totalGenerated += 1;
    stats.agentBreakdown[agent] = (stats.agentBreakdown[agent] || 0) + 1;
    stats.dailyStats[today] = (stats.dailyStats[today] || 0) + 1;
    stats.lastUpdated = new Date().toISOString();

    console.log('Writing stats:', stats);
    await fs.writeFile(STATS_FILE, JSON.stringify(stats, null, 2));
    console.log('Stats updated successfully');
  } catch (error) {
    console.error('Error updating stats:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    // Don't throw error as this shouldn't break the main functionality
  }
}
