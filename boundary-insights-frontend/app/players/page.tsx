'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Users,
  Settings,
  Search,
  Bell,
  Trophy,
  Target,
  Award,
} from 'lucide-react';
import {
  getTopBatsmen,
  getTopBowlers,
  TopBatsmanDto,
  TopBowlerDto,
  getTeamPerformance,
} from '@services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const PlayersPage = () => {
  const pathname = usePathname();
  const [batsmen, setBatsmen] = useState<TopBatsmanDto[] | null>(null);
  const [bowlers, setBowlers] = useState<TopBowlerDto[] | null>(null);
  const [teams, setTeams] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [bats, bowl, teamsData] = await Promise.all([
          getTopBatsmen(20),
          getTopBowlers(20),
          getTeamPerformance(),
        ]);
        setBatsmen(bats);
        setBowlers(bowl);
        setTeams(teamsData);
      } catch (e: any) {
        setError(e.message ?? 'Failed to load players');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalPlayers = (batsmen?.length || 0) + (bowlers?.length || 0);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white flex flex-col px-6 py-6 border-r border-gray-200">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">Boundary Insights_</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6 text-center mb-8">
          <div className="relative inline-block mb-3">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white shadow-lg">
              BI
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center text-xs font-bold text-gray-900 shadow-md">
              {totalPlayers}
            </div>
          </div>
          <h3 className="font-bold text-gray-900 text-base mb-1">IPL Analytics</h3>
          <p className="text-xs text-gray-500 mb-3">Season 2022</p>
          <div className="flex items-center justify-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className="w-3.5 h-3.5 fill-amber-400" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1">
          <div className="space-y-1">
            {[
              { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
              { icon: Users, label: 'Teams', href: '/teams' },
              { icon: Trophy, label: 'Players', href: '/players' },
              { icon: BarChart3, label: 'Statistics', href: '#' },
              { icon: Settings, label: 'Settings', href: '#' },
            ].map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-red-50 text-red-600 border-l-4 border-red-500'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Card */}
        <div className="mt-auto bg-gray-900 rounded-2xl p-5 text-white">
          <p className="font-bold text-sm mb-1">{totalPlayers} Players</p>
          <p className="text-xs text-gray-400 mb-4">IPL 2022 Season</p>
          <button className="w-full bg-white text-gray-900 text-sm font-semibold py-2.5 px-4 rounded-xl hover:bg-gray-100 transition-colors">
            View Details
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="py-6 px-8 flex-shrink-0 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Players</h1>

            <div className="flex items-center gap-3">
              <button className="p-2.5 bg-white rounded-xl hover:bg-gray-50 transition-colors shadow-sm border border-gray-200">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2.5 bg-white rounded-xl hover:bg-gray-50 transition-colors shadow-sm border border-gray-200">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        {/* Players Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 bg-gray-50 min-h-full">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                Error: {error}
              </div>
            )}

            {loading ? (
              <>
                {/* Skeleton Stats Cards */}
                <div className="grid grid-cols-12 gap-6 mb-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="col-span-3 bg-white rounded-3xl p-6 border border-gray-200 animate-pulse">
                      <div className="h-12 w-12 bg-gray-200 rounded-2xl mb-4"></div>
                      <div className="h-12 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-12 gap-6 mb-8">
                  {/* Top Scorer Card */}
                  <div className="col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                      <Trophy className="w-6 h-6 text-gray-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-1">{batsmen?.[0]?.totalRuns || 0}</h2>
                    <p className="text-sm text-gray-500 truncate">{batsmen?.[0]?.playerName || 'N/A'}</p>
                  </div>

                  {/* Top Bowler Card */}
                  <div className="col-span-4 row-span-2 bg-gradient-to-br from-red-400 to-red-500 rounded-3xl p-6 shadow-lg relative overflow-hidden">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                      <Target className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-5xl font-bold text-white mb-2">{bowlers?.[0]?.wickets || 0}</h2>
                    <p className="text-white/90 text-base font-medium">Top Bowler: {bowlers?.[0]?.playerName || 'N/A'}</p>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16"></div>
                  </div>

                  {/* Total Players Card */}
                  <div className="col-span-5 row-span-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-6 shadow-lg relative overflow-hidden">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-5xl font-bold text-white mb-2">{totalPlayers}</h2>
                    <p className="text-white/90 text-base font-medium">Total Players</p>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-12 gap-6 mb-8">
                  {/* Top Batsmen Chart */}
                  <div className="col-span-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="mb-6">
                      <h3 className="text-base font-semibold text-gray-900">Top 10 Batsmen</h3>
                      <p className="text-sm text-gray-500 mt-1">Highest run scorers</p>
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={batsmen?.slice(0, 10) || []} layout="vertical" margin={{ left: 10 }}>
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          horizontal={true}
                          vertical={false} 
                          stroke="#f0f0f0"
                          strokeWidth={1}
                        />
                        <XAxis 
                          type="number" 
                          axisLine={false} 
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#9ca3af' }}
                        />
                        <YAxis
                          type="category"
                          dataKey="playerName"
                          axisLine={false}
                          tickLine={false}
                          width={130}
                          tick={{ fontSize: 11, fill: '#6b7280' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                            padding: '12px'
                          }}
                          labelStyle={{ fontSize: 13, fontWeight: 600, color: '#111827' }}
                          itemStyle={{ fontSize: 12, color: '#6b7280' }}
                        />
                        <Bar 
                          dataKey="totalRuns" 
                          fill="#a78bfa" 
                          radius={[0, 8, 8, 0]}
                          maxBarSize={32}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Top Bowlers Chart */}
                  <div className="col-span-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="mb-6">
                      <h3 className="text-base font-semibold text-gray-900">Top 10 Bowlers</h3>
                      <p className="text-sm text-gray-500 mt-1">Most wickets taken</p>
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={bowlers?.slice(0, 10) || []} layout="vertical" margin={{ left: 10 }}>
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          horizontal={true}
                          vertical={false} 
                          stroke="#f0f0f0"
                          strokeWidth={1}
                        />
                        <XAxis 
                          type="number" 
                          axisLine={false} 
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#9ca3af' }}
                        />
                        <YAxis
                          type="category"
                          dataKey="playerName"
                          axisLine={false}
                          tickLine={false}
                          width={130}
                          tick={{ fontSize: 11, fill: '#6b7280' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                            padding: '12px'
                          }}
                          labelStyle={{ fontSize: 13, fontWeight: 600, color: '#111827' }}
                          itemStyle={{ fontSize: 12, color: '#6b7280' }}
                        />
                        <Bar 
                          dataKey="wickets" 
                          fill="#fbbf24" 
                          radius={[0, 8, 8, 0]}
                          maxBarSize={32}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Players Tables */}
                <div className="grid grid-cols-12 gap-6">
                  {/* Batsmen Table */}
                  <div className="col-span-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-base font-semibold text-gray-900">Leading Run Scorers</h3>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                    </div>
                    <div className="space-y-3">
                      {batsmen?.slice(0, 10).map((player, idx) => (
                        <div
                          key={player.playerId}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white text-xs font-bold">
                            #{idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{player.playerName}</p>
                            <p className="text-xs text-gray-500">ID: {player.playerId}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">{player.totalRuns}</p>
                            <p className="text-xs text-gray-500">runs</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bowlers Table */}
                  <div className="col-span-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-base font-semibold text-gray-900">Leading Wicket Takers</h3>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                    </div>
                    <div className="space-y-3">
                      {bowlers?.slice(0, 10).map((player, idx) => (
                        <div
                          key={player.playerId}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white text-xs font-bold">
                            #{idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{player.playerName}</p>
                            <p className="text-xs text-gray-500">ID: {player.playerId}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">{player.wickets}</p>
                            <p className="text-xs text-gray-500">wickets</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlayersPage;
