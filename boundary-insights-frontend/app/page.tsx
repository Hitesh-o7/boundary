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
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
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
  const pathname = usePathname();
  const [batsmen, setBatsmen] = useState<TopBatsmanDto[] | null>(null);
  const [bowlers, setBowlers] = useState<TopBowlerDto[] | null>(null);
  const [teams, setTeams] = useState<TeamPerformanceDto[] | null>(null);
  const [matches, setMatches] = useState<PaginatedMatchesDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      } catch (e: any) {
        setError(e.message ?? 'Failed to load dashboard');
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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

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
                      <Calendar className="w-6 h-6 text-black" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-1">{totalMatches}</h2>
                    <p className="text-sm text-gray-500">Total Matches</p>
                  </div>

                  <div className="col-span-4 row-span-2 bg-[#fc5a42] rounded-3xl p-6 shadow-lg relative overflow-hidden">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-5xl font-bold text-white mb-2">{teams?.length || 0}</h2>
                    <p className="text-white/90 text-base font-medium">Total Teams</p>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16"></div>
                  </div>

                  <div className="col-span-2 bg-[#9978ee] rounded-3xl p-6 shadow-lg relative overflow-hidden">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">{batsmen?.[0]?.totalRuns || 0}</h2>
                    <p className="text-white/90 text-sm font-medium">Top Scorer: {batsmen?.[0]?.playerName || 'N/A'}</p>
                  </div>

                  <div className="col-span-3 row-span-2 bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Team Win Section</h3>
                    <div className="relative">
                      <div className="relative mb-4">
                        <div className="flex justify-between items-start relative px-1">
                          {[2020, 2021, 2022, 2023, 2024].map((year, index) => (
                            <div key={year} className="flex flex-col items-center relative" style={{ flex: 1 }}>
                              <div className="text-xs font-semibold text-gray-900 mb-2">
                                {year}
                              </div>
                              <div 
                                className="absolute top-6 w-0 h-64 border-l-2 border-dashed border-gray-300"
                                style={{ left: '50%', transform: 'translateX(-50%)' }}
                              ></div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="relative mt-2" style={{ minHeight: '250px', paddingTop: '10px' }}>
                        {[
                          { 
                            id: 1, 
                            teamName: 'Mumbai Indians', 
                            year: 2020, 
                            color: 'bg-red-500',
                            startYear: 2020,
                            endYear: 2020.5,
                            row: 0
                          },
                          { 
                            id: 2, 
                            teamName: 'Chennai Super Kings', 
                            year: 2021, 
                            color: 'bg-purple-500',
                            startYear: 2021,
                            endYear: 2022.8,
                            row: 1
                          },
                          { 
                            id: 3, 
                            teamName: 'Gujarat Titans', 
                            year: 2022, 
                            color: 'bg-gray-400',
                            startYear: 2022.5,
                            endYear: 2024.2,
                            row: 2
                          },
                        ].map((win) => {
                          const totalYears = 4;
                          const startPercent = ((win.startYear - 2020) / totalYears) * 100;
                          
                          return (
                            <div
                              key={win.id}
                              className={`absolute ${win.color} rounded-full px-3 py-2 flex items-center gap-2 text-white text-xs font-medium shadow-lg hover:shadow-xl transition-shadow whitespace-nowrap`}
                              style={{
                                left: `${startPercent}%`,
                                top: `${win.row * 60 + 15}px`,
                              }}
                            >
                              <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                                <Trophy className="w-3 h-3 text-white" />
                              </div>
                              <span className="font-semibold">{win.teamName}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-6 mb-8">
                  <div className="col-span-7 bg-white rounded-2xl p-6 shadow-sm">
                    <div className="mb-6">
                      <h3 className="text-base font-semibold text-gray-900 mb-2">Top Batsmen</h3>
                      <p className="text-3xl font-bold text-gray-900">{batsmen?.[0]?.totalRuns || 0} Runs</p>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={batsmen?.slice(0, 6) || []} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="playerName" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: '#9ca3af' }}
                          angle={-35}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                          cursor={false}
                        />
                        <Bar 
                          dataKey="totalRuns" 
                          fill="#000000" 
                          radius={[8, 8, 0, 0]}
                          activeBar={{ fill: '#fc5b42' }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="col-span-5 bg-white rounded-2xl p-6 shadow-sm">
                    <div className="mb-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-gray-900">Top Bowlers</h3>
                        <button className="text-sm text-gray-600 hover:text-gray-900">View All</button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {bowlers?.slice(0, 6).map((bowler, index) => {
                        const maxWickets = Math.max(...(bowlers?.map(b => b.wickets) || [0]));
                        const colorVariants = [
                          '#fc5b42',
                          '#fc5b42e6',
                          '#fc5b42cc',
                          '#fc5b42b3',
                          '#fc5b4299',
                          '#fc5b4280',
                        ];
                        const segmentColor = colorVariants[index] || '#fc5b42';
                        const numSegments = 20;
                        const filledSegments = Math.round((bowler.wickets / maxWickets) * numSegments);
                        
                        return (
                          <div key={bowler.playerId} className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-900">{bowler.playerName}</span>
                                <span className="text-xs font-semibold text-gray-600">{bowler.wickets} wickets</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2.5 flex gap-0.5 overflow-hidden">
                                {Array.from({ length: numSegments }).map((_, segIndex) => (
                                  <div
                                    key={segIndex}
                                    className="flex-1 h-full rounded-sm transition-all"
                                    style={{
                                      backgroundColor: segIndex < filledSegments ? segmentColor : 'transparent',
                                    }}
                                  ></div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-6 mb-8">
                  <div className="col-span-8 bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-base font-semibold text-gray-900">Recent Matches</h3>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className="text-left text-xs font-semibold text-gray-500 py-3 px-4">Match</th>
                            <th className="text-left text-xs font-semibold text-gray-500 py-3 px-4">Venue</th>
                            <th className="text-left text-xs font-semibold text-gray-500 py-3 px-4">Date</th>
                            <th className="text-left text-xs font-semibold text-gray-500 py-3 px-4">Winner</th>
                          </tr>
                        </thead>
                        <tbody>
                          {matches && matches.items.length > 0 ? (
                            matches.items.slice(0, 5).map((m) => (
                              <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white text-xs font-bold">
                                      {m.homeTeam.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{m.homeTeam} vs {m.awayTeam}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-sm text-gray-600">{m.venue || 'TBD'}</td>
                                <td className="py-4 px-4 text-sm text-gray-600">
                                  {new Date(m.matchDate).toLocaleDateString('en-US', { 
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </td>
                                <td className="py-4 px-4 text-sm text-gray-600">{m.winnerTeam || '-'}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="py-8 text-center text-sm text-gray-500">No matches found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="col-span-4 bg-white rounded-2xl p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="text-base font-semibold text-gray-900">Team Wins</h3>
                      <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                    {teams && teams.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={300}>
                          <RadarChart data={teams.slice(0, 8).map(team => ({
                            team: team.teamName.length > 10 ? team.teamName.substring(0, 10) + '...' : team.teamName,
                            Wins: team.wins,
                            Losses: team.losses,
                          }))}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis 
                              dataKey="team" 
                              tick={{ fontSize: 10, fill: '#6b7280' }}
                              tickLine={false}
                            />
                            <PolarRadiusAxis 
                              angle={90} 
                              domain={[0, 'dataMax']}
                              tick={false}
                              axisLine={false}
                            />
                            <Radar 
                              name="Wins" 
                              dataKey="Wins" 
                              stroke="#22c55e" 
                              fill="#86efac" 
                              fillOpacity={0.6}
                              strokeWidth={2}
                              dot={{ r: 4, fill: '#22c55e' }}
                            />
                            <Radar 
                              name="Losses" 
                              dataKey="Losses" 
                              stroke="#3b82f6" 
                              fill="#93c5fd" 
                              fillOpacity={0.6}
                              strokeWidth={2}
                              dot={{ r: 4, fill: '#3b82f6' }}
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
                              align="center"
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </>
                    ) : (
                      <div className="text-center text-sm text-gray-500 py-8">No team data available</div>
                    )}
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

export default DashboardPage;
