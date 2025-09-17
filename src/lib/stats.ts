import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export interface Stats {
  totalGenerated: number;
  agentBreakdown: Record<string, number>;
  dailyStats: Record<string, number>;
  lastUpdated: string;
}

const STATS_KEY = 'startermd_stats';

export async function getStats(): Promise<Stats> {
  try {
    const { data, error } = await supabase
      .from('key_value_store')
      .select('value')
      .eq('key', STATS_KEY)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    if (data?.value) {
      return JSON.parse(data.value);
    }

    // Return default stats if key doesn't exist
    return {
      totalGenerated: 0,
      agentBreakdown: {},
      dailyStats: {},
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching stats from Supabase:', error);
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

    const { error } = await supabase
      .from('key_value_store')
      .upsert({ 
        key: STATS_KEY, 
        value: JSON.stringify(stats) 
      });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error updating stats in Supabase:', error);
    // Don't throw error as this shouldn't break the main functionality
  }
}
