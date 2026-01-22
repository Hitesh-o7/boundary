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
  Info,
  X,
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(true);

  useEffect(() => {
    // Auto-hide notification after 8 seconds
    const timer = setTimeout(() => {
      setShowNotification(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [bats, bowl, perf, matchPage] = await Promise.all([
          getTopBatsmen(10),
          getTopBowlers(10),
          getTeamPerformance(),
          getMatches(1, 10)
        ]);
        setBatsmen(bats);
        setBowlers(bowl);
        setTeams(perf);
        setMatches(matchPage);
        // Hide notification once data loads
        setShowNotification(false);
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
    <div className="flex h-screen bg-[#fafafa]">
      {/* Backend Startup Notification */}
      {showNotification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-white border border-gray-200 px-5 py-3.5 rounded-xl card-shadow-lg flex items-center gap-3 max-w-md">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Info className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm text-gray-900">Loading data...</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Backend is starting up, this may take a moment.
              </p>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="flex-shrink-0 hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900 tracking-tight">Boundary</span>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {[
              { icon: LayoutDashboard, label: 'Dashboard', badge: null },
              { icon: Users, label: 'Teams', badge: teams?.length.toString() || '0' },
              { icon: Trophy, label: 'Players', badge: null },
            ].map((item) => (
              <a
                key={item.label}
                href={item.label === 'Dashboard' ? '/' : `/${item.label.toLowerCase()}`}
                onClick={() => setActiveMenu(item.label)}
                className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  activeMenu === item.label
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className={`w-5 h-5 ${activeMenu === item.label ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className="flex-1 text-sm font-medium">{item.label}</span>
                {item.badge && (
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-md">
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
          </div>
        </nav>

        {/* Data Info */}
        <div className="p-3 border-t border-gray-100">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-900 mb-0.5">IPL 2022</h4>
                <p className="text-xs text-gray-500">
                  {loading ? 'Loading...' : `${totalMatches} matches`}
                </p>
              </div>
            </div>
            <a
              href="/docs"
              className="w-full bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>API Docs</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#fafafa]">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-0.5">IPL 2022 Season Analytics</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              
              <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm">
              <strong className="font-semibold">Error:</strong> {error}
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
              {/* KPI Cards */}
              <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-[#0F6D4E] to-[#145C44] rounded-2xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-white/80 mb-2">Total Matches</p>
                  <h2 className="text-5xl font-bold mb-3">{totalMatches}</h2>
                  <div className="flex items-center gap-1 text-sm">
                    <Trophy className="w-4 h-4" />
                    <span>IPL 2022 Season</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 relative">
                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Teams</p>
                  <h2 className="text-5xl font-bold text-gray-900 mb-3">{teams?.length || 0}</h2>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Active franchises</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 relative">
                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Top Scorer</p>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 truncate">
                    {batsmen?.[0]?.playerName || 'N/A'}
                  </h2>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>{batsmen?.[0]?.totalRuns || 0} runs</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 relative">
                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Top Bowler</p>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 truncate">
                    {bowlers?.[0]?.playerName || 'N/A'}
                  </h2>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Target className="w-4 h-4" />
                    <span>{bowlers?.[0]?.wickets || 0} wickets</span>
                  </div>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-12 gap-6 mb-8">
                {/* Top Batsmen - Gradient Bars */}
                <div className="col-span-8 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Top Batsmen by Runs</h3>
                    <span className="text-sm text-gray-500">IPL 2022</span>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={batsmen?.slice(0, 8) || []} layout="vertical">
                      <defs>
                        <linearGradient id="batsmenGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#0F6D4E" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.9}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis 
                        type="category" 
                        dataKey="playerName" 
                        axisLine={false} 
                        tickLine={false}
                        width={140}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar dataKey="totalRuns" fill="url(#batsmenGradient)" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Bowlers - Pie Chart */}
                <div className="col-span-4 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Top 5 Wicket Takers</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={bowlers?.slice(0, 5) || []}
                        dataKey="wickets"
                        nameKey="playerName"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ playerName, wickets }) => `${wickets}`}
                        labelLine={false}
                      >
                        {bowlers?.slice(0, 5).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4'][index]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Team Performance */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Team Performance Overview</h3>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#0F6D4E]"></div>
                      <span className="text-gray-600">Wins</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                      <span className="text-gray-600">Losses</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart data={teams || []}>
                    <defs>
                      <linearGradient id="winsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0F6D4E" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.7}/>
                      </linearGradient>
                      <linearGradient id="lossesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#fca5a5" stopOpacity={0.7}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="teamName" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="wins" stackId="a" fill="url(#winsGradient)" name="Wins" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="losses" stackId="a" fill="url(#lossesGradient)" name="Losses" />
                    <Bar dataKey="ties" stackId="a" fill="#f97316" name="Ties" />
                    <Bar dataKey="noResults" stackId="a" fill="#64748b" name="No Result" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Matches */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Matches</h3>
                {matches && matches.items.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                            Match
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                            Venue
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                            Winner
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {matches.items.map((m, idx) => (
                          <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(m.matchDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {m.homeTeam} vs {m.awayTeam}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {m.city ? `${m.city}, ` : ''}
                              {m.venue}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {m.winnerTeam ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {m.winnerTeam}
                                </span>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No matches found</p>
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
