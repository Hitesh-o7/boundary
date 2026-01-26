'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Search,
  Bell,
  Trophy,
  TrendingUp,
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
} from 'recharts';

const TeamsPage = () => {
  const pathname = usePathname();
  const [teams, setTeams] = useState<TeamPerformanceDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const perf = await getTeamPerformance();
        setTeams(perf);
      } catch (e: any) {
        setError(e.message ?? 'Failed to load teams');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalMatches = teams?.reduce((sum, t) => sum + t.matchesPlayed, 0) || 0;

  return (
    <div className="flex h-screen bg-gray-50">
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-[#fc5a42] border-t-transparent rounded-full animate-spin mb-4"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Backend is starting up...</h3>
              <p className="text-sm text-gray-600 text-center">Please wait while we load the data</p>
            </div>
          </div>
        </div>
      )}
      <aside className="w-72 bg-white flex flex-col px-6 py-6">
        <div className="mb-8 flex items-center gap-3">
          <Image
            src="/images/logo.svg"
            alt="Boundary Logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <h1 className="text-xl font-bold text-gray-900">Boundary</h1>
        </div>

        <div className="bg-[#f6f6f6] rounded-3xl p-6 text-center mb-8">
          <div className="relative inline-block mb-3">
            <div className="w-24 h-24 mx-auto rounded-full ring-4 ring-white shadow-lg overflow-hidden">
              <Image
                src="/images/me.jpeg"
                alt="Profile"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center text-xs font-bold text-gray-900 shadow-md">
              {teams?.length || 0}
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

        <nav className="flex-1">
          <div className="space-y-1 py-4 rounded-3xl bg-[#f6f6f6] flex flex-col justify-center ">
            {[
              { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
              { icon: Users, label: 'Teams', href: '/teams' },
              { icon: Trophy, label: 'Players', href: '/players' },
            ].map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-all relative ${
                    isActive
                      ? 'text-red-600 text-2xl'
                      : 'text-black  hover:bg-gray-50'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#fc5a42] rounded-r-full"></div>
                  )}
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-[15px]">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="mt-auto bg-[#f6f6f6] rounded-2xl p-5 text-white">
          <p className="font-bold text-[#121212] text-[16px] mb-1">{totalMatches} Matches</p>
          <p className="text-xs text-gray-400 mb-4">IPL 2022 Season</p>
          <button className=" bg-black/50 text-gray-100 text-sm font-semibold py-2.5 px-4 rounded-xl hover:bg-gray-100 transition-colors">
            View Details
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden rounded-xl bg-white">
        <header className="py-8 px-8 flex-shrink-0 rounded-t-[60px] bg-[#f6f6f6]">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Teams</h1>

            <div className="flex items-center gap-3">
              <button className="p-2.5 bg-[#e9e9eb] rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                <Bell className="w-5 h-5 text-black" />
              </button>
              <button className="p-2.5 bg-[#e9e9eb] rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                <Search className="w-5 h-5 text-black" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-8 bg-[#f6f6f6] min-h-full">
            {error && (
              <div className="mb-6 bg-red-50 text-red-700 px-4 py-3 rounded-lg">
                Error: {error}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-12 gap-6 mb-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="col-span-3 bg-white rounded-3xl p-6 animate-pulse">
                      <div className="h-12 w-12 bg-gray-200 rounded-2xl mb-4"></div>
                      <div className="h-12 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                  ))}
                </div>
            ) : (
              <>
                <div className="grid grid-cols-12 gap-6 mb-8">
                  <div className="col-span-3 bg-white rounded-3xl p-6">
                    <div className="w-12 h-12 bg-[#e6e8eb] rounded-2xl flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-black" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-1">{teams?.length || 0}</h2>
                    <p className="text-sm text-gray-500">Total Teams</p>
                  </div>

                  <div className="col-span-4 row-span-2 bg-[#fc5a42] rounded-3xl p-6 shadow-lg relative overflow-hidden">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                      <Trophy className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-5xl font-bold text-white mb-2">{teams?.[0]?.wins || 0}</h2>
                    <p className="text-white/90 text-base font-medium">Top Team: {teams?.[0]?.teamName || 'N/A'}</p>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16"></div>
                  </div>

                  <div className="col-span-5 row-span-2 bg-[#9978ee] rounded-3xl p-6 shadow-lg relative overflow-hidden">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                      <Calendar className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-5xl font-bold text-white mb-2">{totalMatches}</h2>
                    <p className="text-white/90 text-base font-medium">Total Matches</p>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-gray-900">Team Performance</h3>
                    <p className="text-sm text-gray-500 mt-1">Win/loss comparison</p>
                  </div>
                  <ResponsiveContainer width="100%" height={340}>
                    <BarChart data={teams || []} margin={{ bottom: 60 }}>
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
                        angle={-45}
                        textAnchor="end"
                        height={90}
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
                          borderRadius: '8px',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                          padding: '12px'
                        }}
                        labelStyle={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 8 }}
                        itemStyle={{ fontSize: 11, color: '#6b7280' }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '16px', fontSize: '11px' }}
                        iconType="circle"
                        iconSize={8}
                      />
                      <Bar 
                        dataKey="wins" 
                        fill="#86efac" 
                        name="Wins" 
                        radius={[8, 8, 0, 0]}
                        maxBarSize={40}
                      />
                      <Bar 
                        dataKey="losses" 
                        fill="#fca5a5" 
                        name="Losses" 
                        radius={[8, 8, 0, 0]}
                        maxBarSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-semibold text-gray-900">Detailed Statistics</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="text-left text-xs font-semibold text-gray-500 py-3 px-4">Rank</th>
                          <th className="text-left text-xs font-semibold text-gray-500 py-3 px-4">Team</th>
                          <th className="text-left text-xs font-semibold text-gray-500 py-3 px-4">Matches</th>
                          <th className="text-left text-xs font-semibold text-gray-500 py-3 px-4">Wins</th>
                          <th className="text-left text-xs font-semibold text-gray-500 py-3 px-4">Losses</th>
                          <th className="text-left text-xs font-semibold text-gray-500 py-3 px-4">Ties</th>
                          <th className="text-left text-xs font-semibold text-gray-500 py-3 px-4">No Result</th>
                          <th className="text-left text-xs font-semibold text-gray-500 py-3 px-4">Win %</th>
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
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="py-4 px-4 text-sm font-medium text-gray-900">
                                #{idx + 1}
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white text-xs font-bold">
                                    {team.teamName.substring(0, 2).toUpperCase()}
                                  </div>
                                  <span className="text-sm font-medium text-gray-900">{team.teamName}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-600">
                                {team.matchesPlayed}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-600">{team.wins}</td>
                              <td className="py-4 px-4 text-sm text-gray-600">{team.losses}</td>
                              <td className="py-4 px-4 text-sm text-gray-600">{team.ties}</td>
                              <td className="py-4 px-4 text-sm text-gray-600">{team.noResults}</td>
                              <td className="py-4 px-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <span>{winPct}%</span>
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
