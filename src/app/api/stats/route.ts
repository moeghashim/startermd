import { NextRequest, NextResponse } from 'next/server';
import { getStats, updateStats } from '@/lib/stats';

export async function GET() {
  try {
    const stats = await getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { agent } = await req.json();
    
    if (!agent) {
      return NextResponse.json({ error: 'Agent name is required' }, { status: 400 });
    }
    
    await updateStats(agent);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating stats:', error);
    return NextResponse.json(
      { error: 'Failed to update stats' },
      { status: 500 }
    );
  }
}
