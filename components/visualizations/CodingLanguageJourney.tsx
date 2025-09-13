'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';

interface LanguageUsage {
  language: string;
  usage: number;
  color: string;
  category: 'primary' | 'secondary' | 'learning' | 'deprecated';
  firstUsed: string;
  lastUsed: string;
  totalCommits: number;
  repositories: number;
}

interface LanguageMilestone {
  language: string;
  milestone: string;
  date: string;
  description: string;
  icon: string;
}

interface CodingLanguageJourneyProps {
  username: string;
  repos: any[];
}

export default function CodingLanguageJourney({ username, repos }: CodingLanguageJourneyProps) {
  const [languageData, setLanguageData] = useState<LanguageUsage[]>([]);
  const [milestones, setMilestones] = useState<LanguageMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'6months' | '1year' | '2years' | 'all'>('1year');

  useEffect(() => {
    const analyzeLanguageJourney = () => {
      // Mock language usage data
      const mockLanguages: LanguageUsage[] = [
        {
          language: 'JavaScript',
          usage: 85,
          color: '#F7DF1E',
          category: 'primary',
          firstUsed: '2020-01-15',
          lastUsed: '2024-12-10',
          totalCommits: 1250,
          repositories: 15
        },
        {
          language: 'TypeScript',
          usage: 75,
          color: '#3178C6',
          category: 'primary',
          firstUsed: '2021-03-20',
          lastUsed: '2024-12-10',
          totalCommits: 890,
          repositories: 12
        },
        {
          language: 'Python',
          usage: 60,
          color: '#3776AB',
          category: 'secondary',
          firstUsed: '2020-06-10',
          lastUsed: '2024-11-25',
          totalCommits: 450,
          repositories: 8
        },
        {
          language: 'Go',
          usage: 45,
          color: '#00ADD8',
          category: 'learning',
          firstUsed: '2022-08-15',
          lastUsed: '2024-10-30',
          totalCommits: 320,
          repositories: 5
        },
        {
          language: 'Rust',
          usage: 25,
          color: '#000000',
          category: 'learning',
          firstUsed: '2023-01-10',
          lastUsed: '2024-09-15',
          totalCommits: 180,
          repositories: 3
        },
        {
          language: 'Java',
          usage: 15,
          color: '#ED8B00',
          category: 'deprecated',
          firstUsed: '2019-05-20',
          lastUsed: '2021-12-31',
          totalCommits: 95,
          repositories: 2
        }
      ];

      const mockMilestones: LanguageMilestone[] = [
        {
          language: 'JavaScript',
          milestone: 'First Project',
          date: '2020-01-15',
          description: 'Created first JavaScript web application',
          icon: '🚀'
        },
        {
          language: 'TypeScript',
          milestone: 'Type Safety',
          date: '2021-03-20',
          description: 'Started using TypeScript for better code quality',
          icon: '🛡️'
        },
        {
          language: 'Python',
          milestone: 'Data Science',
          date: '2020-06-10',
          description: 'Built first machine learning project',
          icon: '🧠'
        },
        {
          language: 'Go',
          milestone: 'Backend Services',
          date: '2022-08-15',
          description: 'Developed first microservice in Go',
          icon: '⚡'
        },
        {
          language: 'Rust',
          milestone: 'Systems Programming',
          date: '2023-01-10',
          description: 'Started learning systems programming with Rust',
          icon: '🔧'
        }
      ];

      setLanguageData(mockLanguages);
      setMilestones(mockMilestones);
      setLoading(false);
    };

    analyzeLanguageJourney();
  }, [username, repos]);

  const getLanguageEvolutionData = () => [
    { month: 'Jan 2023', JavaScript: 80, TypeScript: 60, Python: 55, Go: 30, Rust: 10 },
    { month: 'Feb 2023', JavaScript: 82, TypeScript: 65, Python: 58, Go: 35, Rust: 15 },
    { month: 'Mar 2023', JavaScript: 85, TypeScript: 70, Python: 60, Go: 40, Rust: 20 },
    { month: 'Apr 2023', JavaScript: 83, TypeScript: 75, Python: 62, Go: 45, Rust: 25 },
    { month: 'May 2023', JavaScript: 86, TypeScript: 78, Python: 58, Go: 48, Rust: 22 },
    { month: 'Jun 2023', JavaScript: 88, TypeScript: 80, Python: 60, Go: 50, Rust: 28 },
    { month: 'Jul 2023', JavaScript: 85, TypeScript: 82, Python: 55, Go: 52, Rust: 30 },
    { month: 'Aug 2023', JavaScript: 87, TypeScript: 85, Python: 58, Go: 55, Rust: 32 },
    { month: 'Sep 2023', JavaScript: 84, TypeScript: 80, Python: 60, Go: 50, Rust: 28 },
    { month: 'Oct 2023', JavaScript: 86, TypeScript: 78, Python: 62, Go: 48, Rust: 25 },
    { month: 'Nov 2023', JavaScript: 88, TypeScript: 82, Python: 58, Go: 52, Rust: 30 },
    { month: 'Dec 2023', JavaScript: 85, TypeScript: 75, Python: 60, Go: 45, Rust: 25 }
  ];

  const getLanguageCategoryData = () => [
    { name: 'Primary', value: languageData.filter(l => l.category === 'primary').length, color: '#10B981' },
    { name: 'Secondary', value: languageData.filter(l => l.category === 'secondary').length, color: '#3B82F6' },
    { name: 'Learning', value: languageData.filter(l => l.category === 'learning').length, color: '#F59E0B' },
    { name: 'Deprecated', value: languageData.filter(l => l.category === 'deprecated').length, color: '#EF4444' }
  ];

  const getLanguageStatsData = () => {
    return languageData.map(lang => ({
      language: lang.language,
      commits: lang.totalCommits,
      repositories: lang.repositories,
      usage: lang.usage
    }));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'primary': return 'text-green-500 bg-green-500/20';
      case 'secondary': return 'text-blue-500 bg-blue-500/20';
      case 'learning': return 'text-yellow-500 bg-yellow-500/20';
      case 'deprecated': return 'text-red-500 bg-red-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'primary': return '⭐';
      case 'secondary': return '🔵';
      case 'learning': return '📚';
      case 'deprecated': return '🗂️';
      default: return '⚪';
    }
  };

  const getSelectedLanguageData = () => {
    return languageData.find(lang => lang.language === selectedLanguage);
  };

  const getLanguageJourneyInsights = () => [
    {
      title: 'Language Diversity',
      value: languageData.length,
      description: 'Total programming languages used',
      icon: '🌈',
      trend: 'stable'
    },
    {
      title: 'Primary Languages',
      value: languageData.filter(l => l.category === 'primary').length,
      description: 'Languages you use regularly',
      icon: '⭐',
      trend: 'stable'
    },
    {
      title: 'Learning Phase',
      value: languageData.filter(l => l.category === 'learning').length,
      description: 'Languages currently learning',
      icon: '📚',
      trend: 'increasing'
    },
    {
      title: 'Experience Years',
      value: '4+',
      description: 'Years of programming experience',
      icon: '⏰',
      trend: 'increasing'
    }
  ];

  if (loading) {
    return (
      <div className='card'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold'>Coding Language Journey</h2>
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

  const selectedLangData = getSelectedLanguageData();

  return (
    <motion.div
      className='card'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-bold'>Coding Language Journey</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Track your programming language evolution and learning path
          </p>
        </div>

        {/* Time Range Selector */}
        <div className='flex bg-[var(--background)] rounded-lg p-1'>
          {[
            { id: '6months', label: '6M' },
            { id: '1year', label: '1Y' },
            { id: '2years', label: '2Y' },
            { id: 'all', label: 'All' }
          ].map((range) => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range.id
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Language Journey Insights */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        {getLanguageJourneyInsights().map((insight, index) => (
          <motion.div
            key={insight.title}
            className='text-center p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <div className='text-2xl mb-2'>{insight.icon}</div>
            <p className='text-2xl font-bold text-blue-500 mb-1'>{insight.value}</p>
            <p className='text-sm font-medium mb-1'>{insight.title}</p>
            <p className='text-xs text-[var(--text-secondary)]'>{insight.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Language Evolution Chart */}
      <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)] mb-6'>
        <h3 className='text-lg font-semibold mb-4'>Language Usage Evolution</h3>
        <ResponsiveContainer width='100%' height={300}>
          <AreaChart data={getLanguageEvolutionData()}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='month' />
            <YAxis />
            <Tooltip />
            <Area type='monotone' dataKey='JavaScript' stackId='1' stroke='#F7DF1E' fill='#F7DF1E' fillOpacity={0.6} />
            <Area type='monotone' dataKey='TypeScript' stackId='1' stroke='#3178C6' fill='#3178C6' fillOpacity={0.6} />
            <Area type='monotone' dataKey='Python' stackId='1' stroke='#3776AB' fill='#3776AB' fillOpacity={0.6} />
            <Area type='monotone' dataKey='Go' stackId='1' stroke='#00ADD8' fill='#00ADD8' fillOpacity={0.6} />
            <Area type='monotone' dataKey='Rust' stackId='1' stroke='#000000' fill='#000000' fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Language Categories */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
        <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
          <h3 className='text-lg font-semibold mb-4'>Language Categories</h3>
          <ResponsiveContainer width='100%' height={200}>
            <PieChart>
              <Pie
                data={getLanguageCategoryData()}
                cx='50%'
                cy='50%'
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey='value'
              >
                {getLanguageCategoryData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
          <h3 className='text-lg font-semibold mb-4'>Language Statistics</h3>
          <ResponsiveContainer width='100%' height={200}>
            <BarChart data={getLanguageStatsData()}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='language' />
              <YAxis />
              <Tooltip />
              <Bar dataKey='commits' fill='#8976EA' name='Total Commits' />
              <Bar dataKey='repositories' fill='#10B981' name='Repositories' />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Language List */}
      <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)] mb-6'>
        <h3 className='text-lg font-semibold mb-4'>Programming Languages</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {languageData.map((language, index) => (
            <motion.div
              key={language.language}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedLanguage === language.language
                  ? 'border-[var(--primary)] bg-[var(--primary)] bg-opacity-5'
                  : 'border-[var(--card-border)] hover:border-[var(--primary)] hover:border-opacity-50'
              }`}
              onClick={() => setSelectedLanguage(language.language)}
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-3'>
                  <div
                    className='w-4 h-4 rounded-full'
                    style={{ backgroundColor: language.color }}
                  ></div>
                  <h4 className='font-semibold'>{language.language}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getCategoryColor(language.category)}`}>
                    {getCategoryIcon(language.category)} {language.category}
                  </span>
                </div>

                <div className='text-right'>
                  <p className='text-lg font-bold'>{language.usage}%</p>
                  <p className='text-xs text-[var(--text-secondary)]'>Usage</p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <p className='text-[var(--text-secondary)]'>First Used</p>
                  <p className='font-medium'>{new Date(language.firstUsed).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className='text-[var(--text-secondary)]'>Last Used</p>
                  <p className='font-medium'>{new Date(language.lastUsed).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className='text-[var(--text-secondary)]'>Total Commits</p>
                  <p className='font-medium'>{language.totalCommits.toLocaleString()}</p>
                </div>
                <div>
                  <p className='text-[var(--text-secondary)]'>Repositories</p>
                  <p className='font-medium'>{language.repositories}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className='mt-3'>
                <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                  <div
                    className='h-2 rounded-full transition-all duration-1000'
                    style={{
                      width: `${language.usage}%`,
                      backgroundColor: language.color
                    }}
                  ></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Language Milestones */}
      <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)] mb-6'>
        <h3 className='text-lg font-semibold mb-4'>Language Milestones</h3>
        <div className='space-y-4'>
          {milestones.map((milestone, index) => (
            <motion.div
              key={`${milestone.language}-${milestone.milestone}`}
              className='flex items-start gap-4 p-4 bg-[var(--card-bg)] rounded-lg'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className='text-2xl'>{milestone.icon}</div>
              <div className='flex-1'>
                <div className='flex items-center gap-2 mb-1'>
                  <h4 className='font-semibold'>{milestone.language}</h4>
                  <span className='text-sm text-[var(--text-secondary)]'>•</span>
                  <span className='text-sm font-medium text-[var(--primary)]'>{milestone.milestone}</span>
                </div>
                <p className='text-sm text-[var(--text-secondary)] mb-2'>{milestone.description}</p>
                <p className='text-xs text-[var(--text-secondary)]'>
                  {new Date(milestone.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Learning Recommendations */}
      <div className='bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-6'>
        <h3 className='text-lg font-semibold mb-4'>Learning Recommendations</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <h4 className='font-medium text-green-500 mb-3'>✅ Continue Mastering</h4>
            <ul className='text-sm text-[var(--text-secondary)] space-y-2'>
              <li>• Deepen TypeScript advanced patterns</li>
              <li>• Explore JavaScript performance optimization</li>
              <li>• Master Python data science libraries</li>
              <li>• Build more complex Go microservices</li>
            </ul>
          </div>

          <div>
            <h4 className='font-medium text-blue-500 mb-3'>🎯 Next Learning Goals</h4>
            <ul className='text-sm text-[var(--text-secondary)] space-y-2'>
              <li>• Complete Rust ownership and borrowing concepts</li>
              <li>• Learn advanced Go concurrency patterns</li>
              <li>• Explore functional programming in JavaScript</li>
              <li>• Study distributed systems with Python</li>
            </ul>
          </div>
        </div>

        <div className='mt-4 p-3 bg-white/5 rounded-lg'>
          <p className='text-sm text-[var(--text-secondary)]'>
            <strong>Insight:</strong> Your language journey shows a healthy progression from general-purpose languages
            to specialized technologies. Consider focusing on one new language every 6 months while maintaining
            proficiency in your primary languages.
          </p>
        </div>
      </div>
    </motion.div>
  );
}