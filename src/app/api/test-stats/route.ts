import { NextResponse } from 'next/server';
import { updateStats, getStats } from '@/lib/stats';

export async function POST() {
  try {
    console.log('Testing stats update...');
    await updateStats('Test Agent');
    const stats = await getStats();
    console.log('Stats after update:', stats);
    return NextResponse.json({ 
      success: true, 
      stats,
      message: 'Stats updated successfully' 
    });
  } catch (error) {
    console.error('Test stats error:', error);
    return NextResponse.json(
      { error: 'Failed to update stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stats = await getStats();
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
