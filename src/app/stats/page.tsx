'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, Calendar, Home, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Stats {
  totalGenerated: number;
  agentBreakdown: Record<string, number>;
  dailyStats: Record<string, number>;
  lastUpdated: string;
}

export default function StatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      console.log('🔍 Stats Page: Fetching stats from /api/stats');
      const response = await fetch('/api/stats');
      console.log('🔍 Stats Page: Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔍 Stats Page: Response error:', errorText);
        throw new Error(`Failed to fetch stats: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('🔍 Stats Page: Data received:', data);
      setStats(data);
    } catch (err) {
      console.error('🔍 Stats Page: Fetch error:', err);
      setError('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const getTopAgent = () => {
    if (!stats || Object.keys(stats.agentBreakdown).length === 0) return 'None yet';
    const [topAgent] = Object.entries(stats.agentBreakdown)
      .sort(([,a], [,b]) => b - a)[0];
    return topAgent;
  };

  const getRecentDaysStats = () => {
    if (!stats) return [];
    const sortedDays = Object.entries(stats.dailyStats)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .slice(0, 7);
    return sortedDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">STARTERMD Stats</h1>
                  <p className="text-sm text-slate-600">Generation statistics and insights</p>
                </div>
              </div>
              <Button onClick={() => router.push('/')} variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">STARTERMD Stats</h1>
                  <p className="text-sm text-slate-600">Generation statistics and insights</p>
                </div>
              </div>
              <Button onClick={() => router.push('/')} variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card className="border-red-200 bg-red-50 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-red-800">Error Loading Stats</CardTitle>
              <CardDescription className="text-red-700">
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={fetchStats} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">STARTERMD Stats</h1>
                <p className="text-sm text-slate-600">Generation statistics and insights</p>
              </div>
            </div>
            <Button onClick={() => router.push('/')} variant="outline" className="gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Generated</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalGenerated || 0}</div>
              <p className="text-xs text-muted-foreground">
                STARTERMD files created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Popular Agent</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTopAgent()}</div>
              <p className="text-xs text-muted-foreground">
                {stats && Object.keys(stats.agentBreakdown).length > 0 
                  ? `${Math.max(...Object.values(stats.agentBreakdown))} generations`
                  : 'No data yet'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today&apos;s Generations</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.dailyStats[new Date().toISOString().split('T')[0]] || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Files created today
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Agent Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Agent Breakdown
            </CardTitle>
            <CardDescription>
              Distribution of STARTERMD generations by agent preference
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats && Object.keys(stats.agentBreakdown).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(stats.agentBreakdown)
                  .sort(([,a], [,b]) => b - a)
                  .map(([agent, count]) => {
                    const percentage = stats.totalGenerated > 0 
                      ? ((count / stats.totalGenerated) * 100).toFixed(1)
                      : '0';
                    
                    return (
                      <div key={agent} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-slate-800 rounded"></div>
                          <span className="font-medium">{agent}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-32 bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-slate-800 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-muted-foreground min-w-12">
                            {count} ({percentage}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No agent data yet</p>
                <p className="text-sm">Generations will appear here once users start creating files</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Daily generation statistics for the past 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats && Object.keys(stats.dailyStats).length > 0 ? (
              <div className="space-y-3">
                {getRecentDaysStats().map(([date, count]) => (
                  <div key={date} className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 rounded-full h-1.5">
                        <div 
                          className="bg-slate-800 h-1.5 rounded-full" 
                          style={{ 
                            width: stats.totalGenerated > 0 
                              ? `${Math.min((count / Math.max(...Object.values(stats.dailyStats))) * 100, 100)}%`
                              : '0%'
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground min-w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No daily data yet</p>
                <p className="text-sm">Activity will appear here once users start generating files</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Last Updated */}
        {stats?.lastUpdated && (
          <div className="text-center text-sm text-muted-foreground mt-8">
            Last updated: {new Date(stats.lastUpdated).toLocaleString()}
          </div>
        )}
      </main>
    </div>
  );
}
