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
  Award,
  Target,
  Info,
  X,
} from 'lucide-react';
import { getTeamPerformance, TeamPerformanceDto } from '@services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const TeamsPage = () => {
  const [activeMenu, setActiveMenu] = useState('Teams');
  const [teams, setTeams] = useState<TeamPerformanceDto[] | null>(null);
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
        const perf = await getTeamPerformance();
        setTeams(perf);
        setShowNotification(false);
      } catch (e: any) {
        setError(e.message ?? 'Failed to load teams');
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
                {loading ? 'Loading...' : `${teams?.length || 0} teams`}
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
                  placeholder="Search teams..."
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

        {/* Teams Content */}
        <div className="flex-1 overflow-y-auto mt-2">
          <div className="p-8 bg-[#f1f1f1] rounded-[15px] min-h-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Teams Overview</h1>
            <p className="text-gray-600">
              Comprehensive performance statistics for all IPL 2022 teams.
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
                    <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded w-12 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>

              {/* Skeleton Charts */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                    <div className="h-80 bg-gray-100 rounded"></div>
                  </div>
                ))}
              </div>

              {/* Skeleton Table */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded"></div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-[#0F6D4E] to-[#145C44] rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 opacity-80" />
                  </div>
                  <p className="text-sm font-medium text-white/80 mb-1">Total Teams</p>
                  <h2 className="text-4xl font-bold">{teams?.length || 0}</h2>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <Trophy className="w-8 h-8 text-yellow-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Top Team</p>
                  <h2 className="text-xl font-bold text-gray-900 truncate">
                    {teams?.[0]?.teamName || 'N/A'}
                  </h2>
                  <p className="text-sm text-gray-500">{teams?.[0]?.wins || 0} wins</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <Award className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Matches</p>
                  <h2 className="text-4xl font-bold text-gray-900">
                    {teams?.reduce((sum, t) => sum + t.matchesPlayed, 0) || 0}
                  </h2>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <Target className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Avg Win Rate</p>
                  <h2 className="text-4xl font-bold text-gray-900">
                    {teams && teams.length > 0
                      ? (
                          (teams.reduce(
                            (sum, t) => sum + (t.matchesPlayed > 0 ? (t.wins / t.matchesPlayed) * 100 : 0),
                            0
                          ) / teams.length)
                        ).toFixed(0)
                      : 0}
                    %
                  </h2>
                </div>
              </div>

              {/* Team Performance Chart */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Team Performance Comparison</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={teams || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="teamName" axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={100} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="wins" fill="#0F6D4E" name="Wins" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="losses" fill="#ef4444" name="Losses" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Teams Table */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Detailed Statistics</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Rank</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Team</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Matches</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Wins</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Losses</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Ties</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">No Result</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Win %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teams?.map((team, idx) => {
                        const winPct =
                          team.matchesPlayed > 0
                            ? ((team.wins / team.matchesPlayed) * 100).toFixed(1)
                            : '0.0';
                        return (
                          <tr
                            key={team.teamId}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              #{idx + 1}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {team.teamName.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="font-semibold text-gray-900">{team.teamName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center text-sm text-gray-600">
                              {team.matchesPlayed}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {team.wins}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {team.losses}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                {team.ties}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {team.noResults}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <span className="font-semibold text-gray-900">{winPct}%</span>
                                {parseFloat(winPct) > 50 && (
                                  <TrendingUp className="w-4 h-4 text-green-500" />
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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

export default TeamsPage;
