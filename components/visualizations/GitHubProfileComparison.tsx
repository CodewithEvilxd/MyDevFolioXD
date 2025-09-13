'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';

interface ProfileData {
  username: string;
  name: string;
  avatar_url: string;
  followers: number;
  following: number;
  public_repos: number;
  total_stars: number;
  total_forks: number;
  languages: { [key: string]: number };
  contributions: number;
  joined_date: string;
  location?: string;
  company?: string;
}

interface ComparisonMetric {
  metric: string;
  user1: number;
  user2: number;
  difference: number;
  percentage: number;
  winner: 'user1' | 'user2' | 'tie';
}

interface GitHubProfileComparisonProps {
  username: string;
  repos: any[];
}

export default function GitHubProfileComparison({ username, repos }: GitHubProfileComparisonProps) {
  const [user1, setUser1] = useState<ProfileData | null>(null);
  const [user2, setUser2] = useState<ProfileData | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [compareUsername, setCompareUsername] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'insights'>('overview');

  // Mock current user data
  useEffect(() => {
    const mockUser1: ProfileData = {
      username,
      name: 'Your Profile',
      avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
      followers: 245,
      following: 180,
      public_repos: 25,
      total_stars: 1250,
      total_forks: 320,
      languages: { JavaScript: 45, TypeScript: 30, Python: 15, Go: 10 },
      contributions: 890,
      joined_date: '2020-03-15',
      location: 'San Francisco, CA',
      company: 'Tech Corp'
    };
    setUser1(mockUser1);
  }, [username]);

  const fetchUserProfile = async (targetUsername: string) => {
    if (!targetUsername.trim()) return;

    setLoading(true);
    try {
      // Mock API call - in real app, this would fetch from GitHub API
      const mockUser2: ProfileData = {
        username: targetUsername,
        name: targetUsername === 'octocat' ? 'The Octocat' :
              targetUsername === 'torvalds' ? 'Linus Torvalds' :
              targetUsername === 'gaearon' ? 'Dan Abramov' : 'Developer',
        avatar_url: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 10000)}?v=4`,
        followers: Math.floor(Math.random() * 500) + 50,
        following: Math.floor(Math.random() * 300) + 20,
        public_repos: Math.floor(Math.random() * 50) + 10,
        total_stars: Math.floor(Math.random() * 2000) + 200,
        total_forks: Math.floor(Math.random() * 500) + 50,
        languages: {
          JavaScript: Math.floor(Math.random() * 50) + 20,
          TypeScript: Math.floor(Math.random() * 40) + 10,
          Python: Math.floor(Math.random() * 30) + 5,
          Go: Math.floor(Math.random() * 20) + 5
        },
        contributions: Math.floor(Math.random() * 1000) + 200,
        joined_date: '2019-01-15',
        location: 'Remote',
        company: 'Tech Company'
      };

      setUser2(mockUser2);
      calculateComparison(user1!, mockUser2);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateComparison = (user1: ProfileData, user2: ProfileData) => {
    const metrics: ComparisonMetric[] = [
      {
        metric: 'Followers',
        user1: user1.followers,
        user2: user2.followers,
        difference: Math.abs(user1.followers - user2.followers),
        percentage: Math.round((Math.abs(user1.followers - user2.followers) / Math.max(user1.followers, user2.followers)) * 100),
        winner: user1.followers > user2.followers ? 'user1' : user1.followers < user2.followers ? 'user2' : 'tie'
      },
      {
        metric: 'Following',
        user1: user1.following,
        user2: user2.following,
        difference: Math.abs(user1.following - user2.following),
        percentage: Math.round((Math.abs(user1.following - user2.following) / Math.max(user1.following, user2.following)) * 100),
        winner: user1.following > user2.following ? 'user1' : user1.following < user2.following ? 'user2' : 'tie'
      },
      {
        metric: 'Public Repos',
        user1: user1.public_repos,
        user2: user2.public_repos,
        difference: Math.abs(user1.public_repos - user2.public_repos),
        percentage: Math.round((Math.abs(user1.public_repos - user2.public_repos) / Math.max(user1.public_repos, user2.public_repos)) * 100),
        winner: user1.public_repos > user2.public_repos ? 'user1' : user1.public_repos < user2.public_repos ? 'user2' : 'tie'
      },
      {
        metric: 'Total Stars',
        user1: user1.total_stars,
        user2: user2.total_stars,
        difference: Math.abs(user1.total_stars - user2.total_stars),
        percentage: Math.round((Math.abs(user1.total_stars - user2.total_stars) / Math.max(user1.total_stars, user2.total_stars)) * 100),
        winner: user1.total_stars > user2.total_stars ? 'user1' : user1.total_stars < user2.total_stars ? 'user2' : 'tie'
      },
      {
        metric: 'Total Forks',
        user1: user1.total_forks,
        user2: user2.total_forks,
        difference: Math.abs(user1.total_forks - user2.total_forks),
        percentage: Math.round((Math.abs(user1.total_forks - user2.total_forks) / Math.max(user1.total_forks, user2.total_forks)) * 100),
        winner: user1.total_forks > user2.total_forks ? 'user1' : user1.total_forks < user2.total_forks ? 'user2' : 'tie'
      },
      {
        metric: 'Contributions',
        user1: user1.contributions,
        user2: user2.contributions,
        difference: Math.abs(user1.contributions - user2.contributions),
        percentage: Math.round((Math.abs(user1.contributions - user2.contributions) / Math.max(user1.contributions, user2.contributions)) * 100),
        winner: user1.contributions > user2.contributions ? 'user1' : user1.contributions < user2.contributions ? 'user2' : 'tie'
      }
    ];

    setComparisonData(metrics);
  };

  const getRadarData = () => {
    if (!user1 || !user2) return [];

    return [
      { subject: 'Followers', user1: user1.followers / 10, user2: user2.followers / 10, fullMark: 50 },
      { subject: 'Repos', user1: user1.public_repos, user2: user2.public_repos, fullMark: 50 },
      { subject: 'Stars', user1: user1.total_stars / 50, user2: user2.total_stars / 50, fullMark: 50 },
      { subject: 'Forks', user1: user1.total_forks / 10, user2: user2.total_forks / 10, fullMark: 50 },
      { subject: 'Contributions', user1: user1.contributions / 20, user2: user2.contributions / 20, fullMark: 50 }
    ];
  };

  const getLanguageComparison = () => {
    if (!user1 || !user2) return [];

    const allLanguages = new Set([...Object.keys(user1.languages), ...Object.keys(user2.languages)]);

    return Array.from(allLanguages).map(lang => ({
      language: lang,
      user1: user1.languages[lang] || 0,
      user2: user2.languages[lang] || 0
    }));
  };

  const getOverallScore = () => {
    if (!user1 || !user2) return { user1: 0, user2: 0 };

    const user1Score = (
      user1.followers * 0.2 +
      user1.public_repos * 0.15 +
      user1.total_stars * 0.25 +
      user1.total_forks * 0.15 +
      user1.contributions * 0.25
    );

    const user2Score = (
      user2.followers * 0.2 +
      user2.public_repos * 0.15 +
      user2.total_stars * 0.25 +
      user2.total_forks * 0.15 +
      user2.contributions * 0.25
    );

    return {
      user1: Math.round(user1Score),
      user2: Math.round(user2Score)
    };
  };

  const getWinnerIcon = (winner: string, metric: string) => {
    if (winner === 'user1') return '🏆';
    if (winner === 'user2') return '🥈';
    return '🤝';
  };

  const getWinnerColor = (winner: string) => {
    if (winner === 'user1') return 'text-green-500';
    if (winner === 'user2') return 'text-blue-500';
    return 'text-yellow-500';
  };

  if (!user1) {
    return (
      <div className='card'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold'>GitHub Profile Comparison</h2>
          <div className='w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin'></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className='card'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-bold'>GitHub Profile Comparison</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Compare your GitHub profile with other developers
          </p>
        </div>
      </div>

      {/* Profile Input */}
      <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)] mb-6'>
        <h3 className='text-lg font-semibold mb-4'>Compare Profiles</h3>
        <div className='flex gap-4'>
          <div className='flex-1'>
            <label className='block text-sm font-medium mb-2'>Your Profile</label>
            <div className='flex items-center gap-3 p-3 bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)]'>
              <img
                src={user1.avatar_url}
                alt={user1.name}
                className='w-10 h-10 rounded-full'
              />
              <div>
                <p className='font-medium'>{user1.name}</p>
                <p className='text-sm text-[var(--text-secondary)]'>@{user1.username}</p>
              </div>
            </div>
          </div>

          <div className='flex items-center justify-center text-2xl text-[var(--text-secondary)]'>
            VS
          </div>

          <div className='flex-1'>
            <label className='block text-sm font-medium mb-2'>Compare With</label>
            <div className='flex gap-2'>
              <input
                type='text'
                value={compareUsername}
                onChange={(e) => setCompareUsername(e.target.value)}
                placeholder='Enter GitHub username'
                className='flex-1 px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg focus:outline-none focus:border-[var(--primary)]'
              />
              <button
                onClick={() => fetchUserProfile(compareUsername)}
                disabled={loading || !compareUsername.trim()}
                className='px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? '...' : 'Compare'}
              </button>
            </div>
          </div>
        </div>

        {/* Suggested Comparisons */}
        <div className='mt-4'>
          <p className='text-sm text-[var(--text-secondary)] mb-2'>Try comparing with:</p>
          <div className='flex gap-2'>
            {['octocat', 'torvalds', 'gaearon'].map((suggestedUser) => (
              <button
                key={suggestedUser}
                onClick={() => {
                  setCompareUsername(suggestedUser);
                  fetchUserProfile(suggestedUser);
                }}
                className='px-3 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-full text-sm hover:border-[var(--primary)] transition-colors'
              >
                @{suggestedUser}
              </button>
            ))}
          </div>
        </div>
      </div>

      {user2 && (
        <>
          {/* Tab Navigation */}
          <div className='flex bg-[var(--background)] rounded-lg p-1 mb-6'>
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'detailed', label: 'Detailed' },
              { id: 'insights', label: 'Insights' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className='space-y-6'>
              {/* Profile Cards */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
                  <div className='flex items-center gap-3 mb-4'>
                    <img
                      src={user1.avatar_url}
                      alt={user1.name}
                      className='w-12 h-12 rounded-full'
                    />
                    <div>
                      <h4 className='font-semibold'>{user1.name}</h4>
                      <p className='text-sm text-[var(--text-secondary)]'>@{user1.username}</p>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <p className='text-[var(--text-secondary)]'>Followers</p>
                      <p className='font-bold text-lg'>{user1.followers.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className='text-[var(--text-secondary)]'>Following</p>
                      <p className='font-bold text-lg'>{user1.following.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className='text-[var(--text-secondary)]'>Repos</p>
                      <p className='font-bold text-lg'>{user1.public_repos}</p>
                    </div>
                    <div>
                      <p className='text-[var(--text-secondary)]'>Stars</p>
                      <p className='font-bold text-lg'>{user1.total_stars.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
                  <div className='flex items-center gap-3 mb-4'>
                    <img
                      src={user2.avatar_url}
                      alt={user2.name}
                      className='w-12 h-12 rounded-full'
                    />
                    <div>
                      <h4 className='font-semibold'>{user2.name}</h4>
                      <p className='text-sm text-[var(--text-secondary)]'>@{user2.username}</p>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <p className='text-[var(--text-secondary)]'>Followers</p>
                      <p className='font-bold text-lg'>{user2.followers.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className='text-[var(--text-secondary)]'>Following</p>
                      <p className='font-bold text-lg'>{user2.following.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className='text-[var(--text-secondary)]'>Repos</p>
                      <p className='font-bold text-lg'>{user2.public_repos}</p>
                    </div>
                    <div>
                      <p className='text-[var(--text-secondary)]'>Stars</p>
                      <p className='font-bold text-lg'>{user2.total_stars.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall Score Comparison */}
              <div className='bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 border border-blue-500/20 rounded-lg p-6'>
                <h3 className='text-lg font-semibold mb-4'>Overall Profile Score</h3>
                <div className='flex items-center justify-center gap-8'>
                  <div className='text-center'>
                    <div className='text-3xl font-bold text-blue-500 mb-2'>
                      {getOverallScore().user1.toLocaleString()}
                    </div>
                    <p className='text-sm text-[var(--text-secondary)]'>Your Score</p>
                  </div>

                  <div className='text-2xl text-[var(--text-secondary)]'>VS</div>

                  <div className='text-center'>
                    <div className='text-3xl font-bold text-green-500 mb-2'>
                      {getOverallScore().user2.toLocaleString()}
                    </div>
                    <p className='text-sm text-[var(--text-secondary)]'>@{user2.username}</p>
                  </div>
                </div>

                <div className='mt-4 text-center'>
                  {getOverallScore().user1 > getOverallScore().user2 && (
                    <p className='text-green-500 font-medium'>🎉 You're leading in overall profile strength!</p>
                  )}
                  {getOverallScore().user1 < getOverallScore().user2 && (
                    <p className='text-blue-500 font-medium'>📈 Great comparison! Keep growing your profile.</p>
                  )}
                  {getOverallScore().user1 === getOverallScore().user2 && (
                    <p className='text-yellow-500 font-medium'>🤝 You're evenly matched! Keep up the great work.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'detailed' && (
            <div className='space-y-6'>
              {/* Radar Chart Comparison */}
              <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
                <h3 className='text-lg font-semibold mb-4'>Profile Comparison Overview</h3>
                <ResponsiveContainer width='100%' height={300}>
                  <RadarChart data={getRadarData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey='subject' />
                    <PolarRadiusAxis />
                    <Radar
                      name={user1.name}
                      dataKey='user1'
                      stroke='#8976EA'
                      fill='#8976EA'
                      fillOpacity={0.3}
                    />
                    <Radar
                      name={user2.name}
                      dataKey='user2'
                      stroke='#10B981'
                      fill='#10B981'
                      fillOpacity={0.3}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Detailed Metrics Comparison */}
              <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
                <h3 className='text-lg font-semibold mb-4'>Detailed Metrics Comparison</h3>
                <div className='space-y-4'>
                  {comparisonData.map((metric, index) => (
                    <motion.div
                      key={metric.metric}
                      className='flex items-center justify-between p-4 bg-[var(--card-bg)] rounded-lg'
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                      <div className='flex items-center gap-4'>
                        <span className={`text-2xl ${getWinnerColor(metric.winner)}`}>
                          {getWinnerIcon(metric.winner, metric.metric)}
                        </span>
                        <div>
                          <h4 className='font-medium'>{metric.metric}</h4>
                          <p className='text-sm text-[var(--text-secondary)]'>
                            Difference: {metric.difference.toLocaleString()} ({metric.percentage}%)
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center gap-6 text-sm'>
                        <div className='text-center'>
                          <p className='font-bold text-blue-500'>{metric.user1.toLocaleString()}</p>
                          <p className='text-[var(--text-secondary)]'>You</p>
                        </div>
                        <div className='text-center'>
                          <p className='font-bold text-green-500'>{metric.user2.toLocaleString()}</p>
                          <p className='text-[var(--text-secondary)]'>@{user2.username}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Language Comparison */}
              <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
                <h3 className='text-lg font-semibold mb-4'>Language Usage Comparison</h3>
                <ResponsiveContainer width='100%' height={250}>
                  <BarChart data={getLanguageComparison()}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='language' />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey='user1' fill='#8976EA' name={user1.name} />
                    <Bar dataKey='user2' fill='#10B981' name={user2.name} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className='space-y-6'>
              {/* Strengths and Weaknesses */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
                  <h4 className='font-semibold text-green-500 mb-3'>💪 Your Strengths</h4>
                  <div className='space-y-2'>
                    {comparisonData
                      .filter(metric => metric.winner === 'user1')
                      .map((metric) => (
                        <div key={metric.metric} className='flex justify-between text-sm'>
                          <span>{metric.metric}</span>
                          <span className='text-green-500 font-medium'>
                            +{metric.percentage}% advantage
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
                  <h4 className='font-semibold text-blue-500 mb-3'>📈 Growth Opportunities</h4>
                  <div className='space-y-2'>
                    {comparisonData
                      .filter(metric => metric.winner === 'user2')
                      .map((metric) => (
                        <div key={metric.metric} className='flex justify-between text-sm'>
                          <span>{metric.metric}</span>
                          <span className='text-blue-500 font-medium'>
                            {metric.percentage}% gap
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className='bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-6'>
                <h3 className='text-lg font-semibold mb-4'>Personalized Recommendations</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <h4 className='font-medium text-green-500 mb-3'>✅ What You\'re Doing Right</h4>
                    <ul className='text-sm text-[var(--text-secondary)] space-y-2'>
                      <li>• Strong repository quality and star count</li>
                      <li>• Good balance of following/followers ratio</li>
                      <li>• Consistent contribution pattern</li>
                      <li>• Diverse technology stack</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className='font-medium text-blue-500 mb-3'>🎯 Areas to Focus On</h4>
                    <ul className='text-sm text-[var(--text-secondary)] space-y-2'>
                      <li>• Increase community engagement</li>
                      <li>• Focus on high-impact project contributions</li>
                      <li>• Build more open source collaborations</li>
                      <li>• Enhance project documentation</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Comparison Summary */}
              <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
                <h3 className='text-lg font-semibold mb-4'>Comparison Summary</h3>
                <div className='flex items-center justify-center gap-8 text-center'>
                  <div>
                    <div className='text-2xl font-bold text-blue-500 mb-1'>
                      {comparisonData.filter(m => m.winner === 'user1').length}
                    </div>
                    <p className='text-sm text-[var(--text-secondary)]'>Categories You Lead</p>
                  </div>

                  <div>
                    <div className='text-2xl font-bold text-yellow-500 mb-1'>
                      {comparisonData.filter(m => m.winner === 'tie').length}
                    </div>
                    <p className='text-sm text-[var(--text-secondary)]'>Tied Categories</p>
                  </div>

                  <div>
                    <div className='text-2xl font-bold text-green-500 mb-1'>
                      {comparisonData.filter(m => m.winner === 'user2').length}
                    </div>
                    <p className='text-sm text-[var(--text-secondary)]'>Areas to Improve</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!user2 && !loading && (
        <div className='text-center py-12'>
          <div className='text-6xl mb-4'>🔍</div>
          <h3 className='text-xl font-semibold mb-2'>Ready to Compare!</h3>
          <p className='text-[var(--text-secondary)] mb-6'>
            Enter a GitHub username above to compare profiles and get insights
          </p>
          <div className='flex justify-center gap-4'>
            <button
              onClick={() => {
                setCompareUsername('octocat');
                fetchUserProfile('octocat');
              }}
              className='px-6 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90'
            >
              Try with @octocat
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}