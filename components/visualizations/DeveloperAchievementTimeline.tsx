'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'technical' | 'community' | 'career' | 'personal' | 'recognition';
  impact: number;
  icon: string;
  tags: string[];
  metrics?: {
    label: string;
    value: string;
  }[];
  links?: {
    label: string;
    url: string;
  }[];
}

interface TimelineStats {
  totalAchievements: number;
  categories: { [key: string]: number };
  averageImpact: number;
  mostActiveYear: string;
  longestStreak: number;
  totalImpact: number;
}

interface DeveloperAchievementTimelineProps {
  username: string;
  repos: any[];
}

export default function DeveloperAchievementTimeline({ username, repos }: DeveloperAchievementTimelineProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<TimelineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'grid' | 'stats'>('timeline');

  useEffect(() => {
    const loadAchievements = () => {
      // Generate achievements based on real GitHub data
      const realAchievements: Achievement[] = [];

      if (repos && repos.length > 0) {
        const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
        const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
        const languages = new Set(repos.map(repo => repo.language).filter(Boolean));
        const oldestRepo = repos.reduce((oldest, repo) =>
          new Date(repo.created_at) < new Date(oldest.created_at) ? repo : oldest
        );

        // Achievement for first repository
        if (repos.length > 0) {
          realAchievements.push({
            id: 'first-repo',
            title: 'First Repository Created',
            description: `Created first GitHub repository: ${oldestRepo.name}`,
            date: oldestRepo.created_at.split('T')[0],
            category: 'technical',
            impact: 80,
            icon: '🚀',
            tags: ['GitHub', 'First Steps', oldestRepo.language || 'Code'],
            metrics: [
              { label: 'Repository', value: oldestRepo.name },
              { label: 'Language', value: oldestRepo.language || 'Unknown' }
            ]
          });
        }

        // Achievement for stars
        if (totalStars >= 10) {
          realAchievements.push({
            id: 'stars-milestone',
            title: `${totalStars} GitHub Stars Earned`,
            description: `Accumulated ${totalStars} stars across all repositories`,
            date: new Date().toISOString().split('T')[0],
            category: 'recognition',
            impact: Math.min(95, 70 + Math.floor(totalStars / 50)),
            icon: '⭐',
            tags: ['GitHub', 'Community', 'Stars'],
            metrics: [
              { label: 'Total Stars', value: totalStars.toString() },
              { label: 'Repositories', value: repos.length.toString() }
            ]
          });
        }

        // Achievement for languages
        if (languages.size >= 3) {
          realAchievements.push({
            id: 'polyglot',
            title: 'Polyglot Developer',
            description: `Worked with ${languages.size} programming languages`,
            date: new Date().toISOString().split('T')[0],
            category: 'technical',
            impact: 75,
            icon: '🌍',
            tags: Array.from(languages).slice(0, 5),
            metrics: [
              { label: 'Languages', value: languages.size.toString() },
              { label: 'Most Used', value: repos[0]?.language || 'Unknown' }
            ]
          });
        }

        // Achievement for forks
        if (totalForks >= 5) {
          realAchievements.push({
            id: 'community-impact',
            title: 'Community Impact',
            description: `Projects forked ${totalForks} times by the community`,
            date: new Date().toISOString().split('T')[0],
            category: 'community',
            impact: Math.min(90, 60 + Math.floor(totalForks / 10)),
            icon: '🍴',
            tags: ['Community', 'Open Source', 'Collaboration'],
            metrics: [
              { label: 'Total Forks', value: totalForks.toString() },
              { label: 'Forked Repos', value: repos.filter(r => r.forks_count > 0).length.toString() }
            ]
          });
        }

        // Achievement for repository count
        if (repos.length >= 5) {
          realAchievements.push({
            id: 'productive-developer',
            title: 'Productive Developer',
            description: `Created and maintained ${repos.length} repositories`,
            date: new Date().toISOString().split('T')[0],
            category: 'personal',
            impact: Math.min(85, 50 + repos.length * 5),
            icon: '💻',
            tags: ['Productivity', 'Projects', 'Development'],
            metrics: [
              { label: 'Total Repos', value: repos.length.toString() },
              { label: 'Public Repos', value: repos.filter(r => !r.private).length.toString() }
            ]
          });
        }
      }

      const realStats: TimelineStats = {
        totalAchievements: realAchievements.length,
        categories: {
          technical: realAchievements.filter(a => a.category === 'technical').length,
          community: realAchievements.filter(a => a.category === 'community').length,
          career: realAchievements.filter(a => a.category === 'career').length,
          personal: realAchievements.filter(a => a.category === 'personal').length,
          recognition: realAchievements.filter(a => a.category === 'recognition').length
        },
        averageImpact: realAchievements.length > 0 ?
          Math.round(realAchievements.reduce((sum, a) => sum + a.impact, 0) / realAchievements.length) : 0,
        mostActiveYear: new Date().getFullYear().toString(),
        longestStreak: 1,
        totalImpact: realAchievements.reduce((sum, a) => sum + a.impact, 0)
      };

      setAchievements(realAchievements);
      setStats(realStats);
      setLoading(false);
    };

    loadAchievements();
  }, [username, repos]);

  const getFilteredAchievements = () => {
    if (selectedCategory === 'all') return achievements;
    return achievements.filter(achievement => achievement.category === selectedCategory);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'text-blue-500 bg-blue-500/20';
      case 'community': return 'text-green-500 bg-green-500/20';
      case 'career': return 'text-purple-500 bg-purple-500/20';
      case 'personal': return 'text-orange-500 bg-orange-500/20';
      case 'recognition': return 'text-yellow-500 bg-yellow-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return '💻';
      case 'community': return '🤝';
      case 'career': return '💼';
      case 'personal': return '🎯';
      case 'recognition': return '🏆';
      default: return '📌';
    }
  };

  const getImpactColor = (impact: number) => {
    if (impact >= 90) return 'text-green-500 bg-green-500/20';
    if (impact >= 80) return 'text-blue-500 bg-blue-500/20';
    if (impact >= 70) return 'text-yellow-500 bg-yellow-500/20';
    return 'text-red-500 bg-red-500/20';
  };

  const getTimelineData = () => {
    const groupedByYear = achievements.reduce((acc, achievement) => {
      const year = new Date(achievement.date).getFullYear().toString();
      if (!acc[year]) acc[year] = [];
      acc[year].push(achievement);
      return acc;
    }, {} as { [key: string]: Achievement[] });

    return Object.entries(groupedByYear)
      .sort(([a], [b]) => parseInt(b) - parseInt(a))
      .map(([year, yearAchievements]) => ({
        year,
        achievements: yearAchievements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      }));
  };

  const getAchievementStats = () => [
    {
      label: 'Total Achievements',
      value: stats?.totalAchievements || 0,
      icon: '🏆',
      color: 'text-blue-500'
    },
    {
      label: 'Average Impact',
      value: `${stats?.averageImpact || 0}%`,
      icon: '📊',
      color: 'text-green-500'
    },
    {
      label: 'Most Active Year',
      value: stats?.mostActiveYear || 'N/A',
      icon: '📅',
      color: 'text-purple-500'
    },
    {
      label: 'Longest Streak',
      value: `${stats?.longestStreak || 0} months`,
      icon: '🔥',
      color: 'text-orange-500'
    }
  ];

  if (loading) {
    return (
      <div className='card'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold'>Developer Achievement Timeline</h2>
          <div className='w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin'></div>
        </div>
        <div className='animate-pulse space-y-4'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='h-20 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
            ))}
          </div>
          <div className='h-64 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
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
          <h2 className='text-2xl font-bold'>Developer Achievement Timeline</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Your journey through milestones, achievements, and career progression
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className='flex bg-[var(--background)] rounded-lg p-1'>
          {[
            { id: 'timeline', label: 'Timeline' },
            { id: 'grid', label: 'Grid' },
            { id: 'stats', label: 'Stats' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === mode.id
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Achievement Stats Overview */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        {getAchievementStats().map((stat, index) => (
          <motion.div
            key={stat.label}
            className='text-center p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <div className='text-2xl mb-2'>{stat.icon}</div>
            <p className={`text-2xl font-bold mb-1 ${stat.color}`}>{stat.value}</p>
            <p className='text-sm text-[var(--text-secondary)]'>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Category Filter */}
      <div className='flex flex-wrap gap-2 mb-6'>
        {[
          { id: 'all', label: 'All Categories', icon: '📋' },
          { id: 'technical', label: 'Technical', icon: '💻' },
          { id: 'community', label: 'Community', icon: '🤝' },
          { id: 'career', label: 'Career', icon: '💼' },
          { id: 'personal', label: 'Personal', icon: '🎯' },
          { id: 'recognition', label: 'Recognition', icon: '🏆' }
        ].map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              selectedCategory === category.id
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--background)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--card-border)]'
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {viewMode === 'timeline' && (
        <div className='space-y-8'>
          {getTimelineData().map((yearData, yearIndex) => (
            <motion.div
              key={yearData.year}
              className='relative'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: yearIndex * 0.2, duration: 0.5 }}
            >
              {/* Year Header */}
              <div className='flex items-center gap-4 mb-6'>
                <div className='w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg'>
                  {yearData.year.slice(-2)}
                </div>
                <div>
                  <h3 className='text-xl font-bold'>{yearData.year}</h3>
                  <p className='text-[var(--text-secondary)]'>
                    {yearData.achievements.length} achievement{yearData.achievements.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Timeline Line */}
              <div className='absolute left-8 top-16 bottom-0 w-0.5 bg-gradient-to-b from-[var(--primary)] to-transparent'></div>

              {/* Achievements */}
              <div className='space-y-6 ml-16'>
                {yearData.achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    className='relative bg-[var(--background)] p-6 rounded-lg border border-[var(--card-border)]'
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    {/* Timeline Dot */}
                    <div className='absolute -left-20 top-6 w-4 h-4 bg-[var(--primary)] rounded-full border-4 border-[var(--background)]'></div>

                    <div className='flex items-start gap-4'>
                      <div className='text-3xl'>{achievement.icon}</div>
                      <div className='flex-1'>
                        <div className='flex items-center gap-3 mb-2'>
                          <h4 className='text-lg font-semibold'>{achievement.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getCategoryColor(achievement.category)}`}>
                            {getCategoryIcon(achievement.category)} {achievement.category}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getImpactColor(achievement.impact)}`}>
                            {achievement.impact} impact
                          </span>
                        </div>

                        <p className='text-[var(--text-secondary)] mb-3'>{achievement.description}</p>

                        {/* Tags */}
                        <div className='flex flex-wrap gap-2 mb-3'>
                          {achievement.tags.map((tag) => (
                            <span
                              key={tag}
                              className='px-2 py-1 bg-[var(--primary)] bg-opacity-20 text-[var(--primary)] rounded-full text-xs'
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Metrics */}
                        {achievement.metrics && (
                          <div className='grid grid-cols-2 gap-4 mb-3'>
                            {achievement.metrics.map((metric) => (
                              <div key={metric.label} className='text-sm'>
                                <span className='text-[var(--text-secondary)]'>{metric.label}:</span>
                                <span className='font-medium ml-2'>{metric.value}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Links */}
                        {achievement.links && (
                          <div className='flex gap-3'>
                            {achievement.links.map((link) => (
                              <a
                                key={link.label}
                                href={link.url}
                                className='text-[var(--primary)] hover:underline text-sm'
                              >
                                {link.label} →
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Date */}
                        <div className='mt-3 text-xs text-[var(--text-secondary)]'>
                          {new Date(achievement.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {viewMode === 'grid' && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {getFilteredAchievements().map((achievement, index) => (
            <motion.div
              key={achievement.id}
              className='bg-[var(--background)] p-6 rounded-lg border border-[var(--card-border)]'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className='text-center mb-4'>
                <div className='text-4xl mb-2'>{achievement.icon}</div>
                <h4 className='font-semibold mb-1'>{achievement.title}</h4>
                <p className='text-sm text-[var(--text-secondary)] mb-2'>
                  {new Date(achievement.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short'
                  })}
                </p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(achievement.category)}`}>
                  {getCategoryIcon(achievement.category)} {achievement.category}
                </span>
              </div>

              <p className='text-sm text-[var(--text-secondary)] mb-3 line-clamp-3'>
                {achievement.description}
              </p>

              <div className='flex items-center justify-between text-sm'>
                <span className={`font-bold ${getImpactColor(achievement.impact).split(' ')[0]}`}>
                  {achievement.impact}% Impact
                </span>
                <div className='flex gap-1'>
                  {achievement.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className='px-2 py-1 bg-[var(--primary)] bg-opacity-20 text-[var(--primary)] rounded-full text-xs'
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {viewMode === 'stats' && (
        <div className='space-y-6'>
          {/* Category Distribution */}
          <div className='bg-[var(--background)] p-6 rounded-lg border border-[var(--card-border)]'>
            <h3 className='text-lg font-semibold mb-4'>Achievement Categories</h3>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
              {Object.entries(stats?.categories || {}).map(([category, count]) => (
                <div key={category} className='text-center p-4 bg-[var(--card-bg)] rounded-lg'>
                  <div className='text-2xl mb-2'>{getCategoryIcon(category)}</div>
                  <p className='text-2xl font-bold text-[var(--primary)] mb-1'>{count}</p>
                  <p className='text-sm text-[var(--text-secondary)] capitalize'>{category}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Impact Analysis */}
          <div className='bg-[var(--background)] p-6 rounded-lg border border-[var(--card-border)]'>
            <h3 className='text-lg font-semibold mb-4'>Impact Analysis</h3>
            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <span className='text-[var(--text-secondary)]'>Highest Impact Achievement</span>
                <span className='font-bold text-green-500'>
                  {Math.max(...achievements.map(a => a.impact))}%
                </span>
              </div>

              <div className='flex justify-between items-center'>
                <span className='text-[var(--text-secondary)]'>Average Impact</span>
                <span className='font-bold text-blue-500'>
                  {stats?.averageImpact}%
                </span>
              </div>

              <div className='flex justify-between items-center'>
                <span className='text-[var(--text-secondary)]'>Total Impact Score</span>
                <span className='font-bold text-purple-500'>
                  {stats?.totalImpact}
                </span>
              </div>
            </div>
          </div>

          {/* Achievement Insights */}
          <div className='bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 border border-green-500/20 rounded-lg p-6'>
            <h3 className='text-lg font-semibold mb-4'>Achievement Insights</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h4 className='font-medium text-green-500 mb-3'>🎯 Strengths</h4>
                <ul className='text-sm text-[var(--text-secondary)] space-y-2'>
                  <li>• Strong technical foundation with consistent growth</li>
                  <li>• Active community contributor and leader</li>
                  <li>• Recognized expertise in multiple domains</li>
                  <li>• Successful career progression and leadership</li>
                </ul>
              </div>

              <div>
                <h4 className='font-medium text-blue-500 mb-3'>🚀 Growth Opportunities</h4>
                <ul className='text-sm text-[var(--text-secondary)] space-y-2'>
                  <li>• Expand into emerging technologies</li>
                  <li>• Increase speaking engagements</li>
                  <li>• Mentor more junior developers</li>
                  <li>• Start a technical blog or podcast</li>
                </ul>
              </div>
            </div>

            <div className='mt-4 p-3 bg-white/5 rounded-lg'>
              <p className='text-sm text-[var(--text-secondary)]'>
                <strong>Next Milestone:</strong> Consider aiming for industry recognition or starting your own open source project.
                Your current trajectory suggests you're on track for significant achievements in the coming year.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
