'use client';

import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Bell,
  Trophy,
  Download,
  TrendingUp,
  Target,
  Award,
  Info,
  X,
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
  Legend,
} from 'recharts';

const PlayersPage = () => {
  const [activeMenu, setActiveMenu] = useState('Players');
  const [batsmen, setBatsmen] = useState<TopBatsmanDto[] | null>(null);
  const [bowlers, setBowlers] = useState<TopBowlerDto[] | null>(null);
  const [teams, setTeams] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

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
        setShowNotification(false);
      } catch (e: any) {
        setError(e.message ?? 'Failed to load players');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex h-screen bg-[#ffffff] p-4 gap-2">
      {/* Backend Startup Notification */}
      {showNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-md">
            <div className="flex-shrink-0">
              <Info className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Backend Starting Up</p>
              <p className="text-xs text-blue-100 mt-1">
                Data will be displayed shortly. This may take a moment on first load.
              </p>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="flex-shrink-0 hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-[#f1f1f1] rounded-[15px] flex flex-col">
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#0F6D4E] rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Boundary</span>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4">
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-3">
              MENU
            </p>
            {[
              { icon: LayoutDashboard, label: 'Dashboard', badge: null, href: '/' },
              { icon: Users, label: 'Teams', badge: teams?.length.toString() || '0', href: '/teams' },
              { icon: Trophy, label: 'Players', badge: null, href: '/players' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setActiveMenu(item.label)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${
                  activeMenu === item.label
                    ? 'bg-[#0F6D4E] text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1 text-left font-medium">{item.label}</span>
                {item.badge && (
                  <span className="bg-gray-900 text-white text-xs font-bold px-2 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
          </div>
        </nav>

        {/* API Status */}
        <div className="p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold mb-1">IPL 2022 Data</h3>
              <p className="text-sm text-gray-300 mb-4">
                {loading ? 'Loading...' : `${(batsmen?.length || 0) + (bowlers?.length || 0)} players`}
              </p>
              <a
                href="http://localhost:4000/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#0F6D4E] hover:bg-[#145C44] text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                API Docs
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#f1f1f1] rounded-[15px] px-8 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search players..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F6D4E] focus:border-transparent"
                />
                <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-white px-2 py-1 rounded border border-gray-200">
                  ⌘ F
                </kbd>
              </div>
            </div>

            <div className="flex items-center gap-4 ml-8">
              <button className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  BI
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Boundary Insights</p>
                  <p className="text-xs text-gray-500">IPL Analytics</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Players Content */}
        <div className="flex-1 overflow-y-auto mt-2">
          <div className="p-8 bg-[#f1f1f1] rounded-[15px] min-h-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Players Statistics</h1>
            <p className="text-gray-600">
              Top performers and detailed statistics for batsmen and bowlers.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              Error: {error}
            </div>
          )}

          {loading ? (
            <>
              {/* Skeleton Stats Cards */}
              <div className="grid grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
                    <div className="h-8 w-8 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>

              {/* Skeleton Charts */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
                    <div className="h-96 bg-gray-100 rounded"></div>
                  </div>
                ))}
              </div>

              {/* Skeleton Tables */}
              <div className="grid grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                        <div key={j} className="h-16 bg-gray-100 rounded"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-[#0F6D4E] to-[#145C44] rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <Trophy className="w-8 h-8 opacity-80" />
                  </div>
                  <p className="text-sm font-medium text-white/80 mb-1">Top Scorer</p>
                  <h2 className="text-xl font-bold truncate">{batsmen?.[0]?.playerName || 'N/A'}</h2>
                  <p className="text-sm text-white/70">{batsmen?.[0]?.totalRuns || 0} runs</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <Target className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Top Bowler</p>
                  <h2 className="text-xl font-bold text-gray-900 truncate">
                    {bowlers?.[0]?.playerName || 'N/A'}
                  </h2>
                  <p className="text-sm text-gray-500">{bowlers?.[0]?.wickets || 0} wickets</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <Award className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Batsmen</p>
                  <h2 className="text-4xl font-bold text-gray-900">{batsmen?.length || 0}</h2>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-purple-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Bowlers</p>
                  <h2 className="text-4xl font-bold text-gray-900">{bowlers?.length || 0}</h2>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                {/* Top Batsmen Chart */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-gray-900">Top 10 Batsmen</h3>
                    <p className="text-sm text-gray-500 mt-1">Highest run scorers</p>
                  </div>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={batsmen?.slice(0, 10) || []} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid 
                        strokeDasharray="0" 
                        horizontal={true}
                        vertical={false} 
                        stroke="#f3f4f6"
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
                        cursor={{ fill: '#f9fafb' }}
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          padding: '12px'
                        }}
                        labelStyle={{ fontSize: 13, fontWeight: 600, color: '#111827' }}
                        itemStyle={{ fontSize: 12, color: '#6b7280' }}
                      />
                      <Bar 
                        dataKey="totalRuns" 
                        fill="#a78bfa" 
                        radius={[0, 6, 6, 0]}
                        maxBarSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Bowlers Chart */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-gray-900">Top 10 Bowlers</h3>
                    <p className="text-sm text-gray-500 mt-1">Most wickets taken</p>
                  </div>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={bowlers?.slice(0, 10) || []} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid 
                        strokeDasharray="0" 
                        horizontal={true}
                        vertical={false} 
                        stroke="#f3f4f6"
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
                        cursor={{ fill: '#f9fafb' }}
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          padding: '12px'
                        }}
                        labelStyle={{ fontSize: 13, fontWeight: 600, color: '#111827' }}
                        itemStyle={{ fontSize: 12, color: '#6b7280' }}
                      />
                      <Bar 
                        dataKey="wickets" 
                        fill="#fbbf24" 
                        radius={[0, 6, 6, 0]}
                        maxBarSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Players Tables */}
              <div className="grid grid-cols-2 gap-6">
                {/* Batsmen Table */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Leading Run Scorers</h3>
                  <div className="space-y-3">
                    {batsmen?.slice(0, 10).map((player, idx) => (
                      <div
                        key={player.playerId}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                          #{idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{player.playerName}</p>
                          <p className="text-sm text-gray-500">Player ID: {player.playerId}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{player.totalRuns}</p>
                          <p className="text-xs text-gray-500">runs</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bowlers Table */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Leading Wicket Takers</h3>
                  <div className="space-y-3">
                    {bowlers?.slice(0, 10).map((player, idx) => (
                      <div
                        key={player.playerId}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                          #{idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{player.playerName}</p>
                          <p className="text-sm text-gray-500">Player ID: {player.playerId}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{player.wickets}</p>
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
