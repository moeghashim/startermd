import { NextRequest, NextResponse } from 'next/server';
import { getStats, updateStats } from '@/lib/stats';

export async function GET() {
  try {
    console.log('📊 Stats API: GET request received');
    const stats = await getStats();
    console.log('📊 Stats API: Stats fetched successfully:', stats);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('❌ Stats API: Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('📊 Stats API: POST request received');
    const { agent } = await req.json();
    console.log('📊 Stats API: Agent received:', agent);
    
    if (!agent) {
      console.log('❌ Stats API: No agent provided');
      return NextResponse.json({ error: 'Agent name is required' }, { status: 400 });
    }
    
    console.log('📊 Stats API: Updating stats for agent:', agent);
    await updateStats(agent);
    console.log('📊 Stats API: Stats updated successfully');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Stats API: Error updating stats:', error);
    return NextResponse.json(
      { error: 'Failed to update stats' },
      { status: 500 }
    );
  }
}
