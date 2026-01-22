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
  ArrowUpRight,
  TrendingUp,
  Plus,
  Play,
  Pause,
  Square,
  Download,
  Trophy,
  Target,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import {
  getTopBatsmen,
  getTopBowlers,
  getTeamPerformance,
  getMatches,
  TopBatsmanDto,
  TopBowlerDto,
  TeamPerformanceDto,
  PaginatedMatchesDto
} from '@services/api';

const DashboardPage = () => {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [batsmen, setBatsmen] = useState<TopBatsmanDto[] | null>(null);
  const [bowlers, setBowlers] = useState<TopBowlerDto[] | null>(null);
  const [teams, setTeams] = useState<TeamPerformanceDto[] | null>(null);
  const [matches, setMatches] = useState<PaginatedMatchesDto | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMatches = async (page: number) => {
    try {
      const matchPage = await getMatches(page, 5);
      setMatches(matchPage);
      setCurrentPage(page);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load matches');
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [bats, bowl, perf, matchPage] = await Promise.all([
          getTopBatsmen(10),
          getTopBowlers(10),
          getTeamPerformance(),
          getMatches(1, 5)
        ]);
        setBatsmen(bats);
        setBowlers(bowl);
        setTeams(perf);
        setMatches(matchPage);
      } catch (e: any) {
        setError(e.message ?? 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Calculate KPIs from team data
  const totalMatches = teams?.reduce((sum, t) => sum + t.matchesPlayed, 0) || 0;
  const totalWins = teams?.reduce((sum, t) => sum + t.wins, 0) || 0;
  const runningProjects = teams?.filter(t => t.matchesPlayed > 0).length || 0;
  const topTeam = teams?.[0]?.teamName || 'Loading...';

  return (
    <div className="flex h-screen bg-[#f5f6fa]">
      {/* Sidebar */}
      <aside className="w-72 bg-white flex flex-col px-6 py-6">
        {/* Logo */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Boundary</span>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6 text-center mb-8">
          <div className="relative inline-block mb-3">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white shadow-lg">
              BI
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center text-xs font-bold text-gray-900 shadow-md">
              5.0
            </div>
          </div>
          <h3 className="font-bold text-gray-900 text-base mb-1">IPL Analytics</h3>
          <p className="text-xs text-gray-500 mb-3">Cricket Stats Platform</p>
          <div className="flex items-center justify-center gap-0.5">
            {[1,2,3,4,5].map((star) => (
              <svg key={star} className="w-3.5 h-3.5 fill-yellow-400" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
              </svg>
            ))}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1">
          <div className="space-y-1">
            {[
              { icon: LayoutDashboard, label: 'Dashboard' },
              { icon: Users, label: 'Teams' },
              { icon: Trophy, label: 'Players' },
              { icon: BarChart3, label: 'Statistics' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.label === 'Dashboard' ? '/' : `/${item.label.toLowerCase()}`}
                onClick={() => setActiveMenu(item.label)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeMenu === item.label
                    ? 'bg-orange-50 text-orange-600 border-l-4 border-orange-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </a>
            ))}
          </div>
        </nav>

        {/* Bottom Card */}
        <div className="mt-auto bg-gray-900 rounded-2xl p-5 text-white">
          <p className="font-bold text-sm mb-1">{totalMatches} Matches</p>
          <p className="text-xs text-gray-400 mb-4">IPL 2022 Season Data</p>
          <button className="w-full bg-white text-gray-900 text-sm font-semibold py-2.5 px-4 rounded-xl hover:bg-gray-100 transition-colors">
            View Stats
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden px-8">
        {/* Header */}
        <header className="py-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            
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

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto rounded-[15px] mt-2">
          <div className="p-8 bg-[#f1f1f1]  min-h-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">IPL Dashboard</h1>
            <p className="text-gray-600">
              Analyze performance, track statistics, and explore match insights.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              Error: {error}
            </div>
          )}

          {loading ? (
            <>
              {/* Skeleton KPI Cards */}
              <div className="grid grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                    <div className="h-12 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>

              {/* Skeleton Charts */}
              <div className="grid grid-cols-12 gap-6 mb-8">
                <div className="col-span-6 bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                  <div className="h-64 bg-gray-100 rounded"></div>
                </div>
                <div className="col-span-6 bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                  <div className="h-64 bg-gray-100 rounded"></div>
                </div>
              </div>

              {/* Skeleton Team Performance */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-56 mb-6"></div>
                <div className="h-80 bg-gray-100 rounded"></div>
              </div>

              {/* Skeleton Table */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded"></div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* KPI Cards - Healthcare Style */}
              <div className="grid grid-cols-12 gap-6 mb-8">
                {/* Small White Card */}
                <div className="col-span-3 bg-white rounded-3xl p-6 shadow-sm">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-gray-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">{totalMatches}</h2>
                  <p className="text-sm text-gray-500">Total Matches</p>
                </div>

                {/* Large Orange Card */}
                <div className="col-span-4 row-span-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-6 shadow-lg relative overflow-hidden">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-5xl font-bold text-white mb-2">{batsmen?.[0]?.totalRuns || 0}</h2>
                  <p className="text-white/90 text-base font-medium">Top Runs</p>
                  <p className="text-white/70 text-sm mt-1">{batsmen?.[0]?.playerName || 'Loading...'}</p>
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16"></div>
                </div>

                {/* Large Purple Card */}
                <div className="col-span-5 row-span-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-6 shadow-lg relative overflow-hidden">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                    <Trophy className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-5xl font-bold text-white mb-2">{bowlers?.[0]?.wickets || 0}</h2>
                  <p className="text-white/90 text-base font-medium">Top Wickets</p>
                  <p className="text-white/70 text-sm mt-1">{bowlers?.[0]?.playerName || 'Loading...'}</p>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                </div>

                {/* Stats Card */}
                <div className="col-span-3 bg-white rounded-3xl p-6 shadow-sm">
                  <p className="text-sm text-gray-500 mb-2">Total Teams</p>
                  <h2 className="text-3xl font-bold text-gray-900">{teams?.length || 0}</h2>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-12 gap-6 mb-8">
                {/* Top Batsmen - Area Chart */}
                <div className="col-span-8 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">Top Batsmen Overview</h3>
                      <p className="text-sm text-gray-500 mt-1">Run distribution over top players</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        Top 5
                      </button>
                      <button className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-lg">
                        Top 10
                      </button>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart 
                      data={batsmen?.slice(0, 10) || []} 
                      margin={{ top: 10, right: 20, left: 0, bottom: 50 }}
                    >
                      <defs>
                        <linearGradient id="colorBatsmen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.02}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        vertical={false} 
                        stroke="#f0f0f0"
                        strokeWidth={1}
                      />
                      <XAxis 
                        dataKey="playerName" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                        angle={-35}
                        textAnchor="end"
                        height={75}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        label={{ value: 'Runs', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                          padding: '12px 16px'
                        }}
                        labelStyle={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 6 }}
                        itemStyle={{ fontSize: 11, color: '#6b7280' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="totalRuns" 
                        stroke="#60a5fa" 
                        strokeWidth={2.5}
                        fill="url(#colorBatsmen)"
                        dot={{ fill: '#60a5fa', strokeWidth: 0, r: 3 }}
                        activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Bowlers - Segmented Progress */}
                <div className="col-span-4 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-gray-900">Top Bowlers</h3>
                    <p className="text-sm text-gray-500 mt-1">Wicket leaders</p>
                  </div>
                  <div className="space-y-5">
                    {bowlers?.slice(0, 6).map((bowler, index) => {
                      // Use a reasonable fixed scale (e.g., 30 wickets = full bar)
                      const maxWicketsScale = 30;
                      const percentage = Math.min(1, bowler.wickets / maxWicketsScale);
                      const filledSegments = Math.max(1, Math.round(percentage * 6));
                      const totalSegments = 6;
                      const colors = ['#fbbf24', '#fb923c', '#f87171', '#a78bfa', '#60a5fa', '#34d399'];
                      
                      return (
                        <div key={bowler.playerId}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {bowler.playerName}
                            </p>
                            <span className="text-sm font-semibold text-gray-700 ml-2">
                              {bowler.wickets}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {Array.from({ length: totalSegments }).map((_, segIndex) => (
                              <div
                                key={segIndex}
                                className="h-2.5 rounded-full flex-1 transition-all duration-500"
                                style={{
                                  backgroundColor: segIndex < filledSegments 
                                    ? colors[index]
                                    : colors[index] + '15' // 15 is hex for ~8% opacity (more transparent)
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Team Performance - Area Chart */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Team Performance Overview</h3>
                    <p className="text-sm text-gray-500 mt-1">Wins and matches played over teams</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      Wins
                    </button>
                    <button className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-lg">
                      All
                    </button>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart 
                    data={teams || []} 
                    margin={{ top: 10, right: 20, left: 0, bottom: 50 }}
                  >
                    <defs>
                      <linearGradient id="colorTeamWins" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      vertical={false} 
                      stroke="#f0f0f0"
                      strokeWidth={1}
                    />
                    <XAxis 
                      dataKey="teamName" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      angle={-35}
                      textAnchor="end"
                      height={75}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        padding: '12px 16px'
                      }}
                      labelStyle={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 6 }}
                      itemStyle={{ fontSize: 11, color: '#6b7280' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="wins" 
                      stroke="#60a5fa" 
                      strokeWidth={2.5}
                      fill="url(#colorTeamWins)"
                      dot={{ fill: '#60a5fa', strokeWidth: 0, r: 3 }}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Matches */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-semibold text-gray-900">Recent Matches</h3>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    View All
                  </button>
                </div>
                {matches && matches.items.length > 0 ? (
                  <div className="overflow-hidden">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Match
                          </th>
                          <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Venue
                          </th>
                          <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Winner
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {matches.items.slice(0, 5).map((m) => (
                          <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                  {m.homeTeam.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {m.homeTeam}
                                  </p>
                                  <p className="text-xs text-gray-500">vs {m.awayTeam}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-sm text-gray-600">
                              {m.venue || 'TBD'}
                            </td>
                            <td className="py-4 text-sm text-gray-600">
                              {new Date(m.matchDate).toLocaleDateString('en-US', { 
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="py-4 text-sm">
                              {m.winnerTeam ? (
                                <span className="font-medium text-gray-900">{m.winnerTeam}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500">
                        Showing <span className="font-medium text-gray-700">{((currentPage - 1) * 5) + 1}</span> to{' '}
                        <span className="font-medium text-gray-700">
                          {Math.min(currentPage * 5, matches.total)}
                        </span> of{' '}
                        <span className="font-medium text-gray-700">{matches.total}</span> matches
                      </p>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={() => loadMatches(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        
                        {Array.from({ length: Math.min(5, Math.ceil(matches.total / 5)) }).map((_, i) => {
                          const pageNum = i + 1;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => loadMatches(pageNum)}
                              className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => loadMatches(currentPage + 1)}
                          disabled={currentPage >= Math.ceil(matches.total / 5)}
                          className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">No matches found</p>
                )}
              </div>
            </>
          )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
