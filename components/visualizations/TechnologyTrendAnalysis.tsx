'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';

interface LanguageTrend {
  language: string;
  data: { month: string; percentage: number; count: number }[];
  color: string;
  growth: number;
}

interface TechnologyStats {
  totalLanguages: number;
  mostUsedLanguage: string;
  languageDiversity: number;
  trendingUp: string[];
  trendingDown: string[];
  emergingTech: string[];
}

interface TechnologyTrendAnalysisProps {
  username: string;
  repos: any[];
}

export default function TechnologyTrendAnalysis({ username, repos }: TechnologyTrendAnalysisProps) {
  const [trends, setTrends] = useState<LanguageTrend[]>([]);
  const [stats, setStats] = useState<TechnologyStats | null>(null);
  const [languageStats, setLanguageStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  useEffect(() => {
    const analyzeTechnologyTrends = () => {
      if (!repos || repos.length === 0) {
        setTrends([]);
        setStats(null);
        setLoading(false);
        return;
      }

      // Analyze actual language usage from repositories
      const languageCount: { [key: string]: number } = {};
      repos.forEach(repo => {
        if (repo.language) {
          languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
        }
      });

      // Convert to percentages
      const totalRepos = repos.length;
      const calculatedLanguageStats = Object.entries(languageCount)
        .map(([language, count]) => ({
          language,
          percentage: Math.round((count / totalRepos) * 100),
          count
        }))
        .sort((a, b) => b.percentage - a.percentage);

      // Create trend data based on actual usage
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      const trendData: LanguageTrend[] = calculatedLanguageStats.slice(0, 8).map((lang, index) => {
        const data = months.map((month, monthIndex) => ({
          month,
          percentage: lang.percentage,
          count: lang.count
        }));

        return {
          language: lang.language,
          data,
          color: getLanguageColor(lang.language),
          growth: 0 // No historical data available
        };
      });

      const technologyStats: TechnologyStats = {
        totalLanguages: Object.keys(languageCount).length,
        mostUsedLanguage: calculatedLanguageStats[0]?.language || 'None',
        languageDiversity: Math.min(10, Object.keys(languageCount).length * 0.8),
        trendingUp: [], // Would need historical data
        trendingDown: [], // Would need historical data
        emergingTech: [] // Would need market analysis
      };

      setTrends(trendData);
      setStats(technologyStats);
      setLanguageStats(calculatedLanguageStats);
      setLoading(false);
    };

    analyzeTechnologyTrends();
  }, [username, repos]);

  const getLanguageColor = (language: string): string => {
    const colors: { [key: string]: string } = {
      'JavaScript': '#F7DF1E',
      'TypeScript': '#3178C6',
      'Python': '#3776AB',
      'Java': '#ED8B00',
      'C++': '#00599C',
      'C': '#A8B9CC',
      'Go': '#00ADD8',
      'Rust': '#000000',
      'PHP': '#777BB4',
      'Ruby': '#CC342D',
      'Swift': '#FA7343',
      'Kotlin': '#7F52FF',
      'HTML': '#E34F26',
      'CSS': '#1572B6',
      'SCSS': '#CC6699',
      'Less': '#1D365D'
    };
    return colors[language] || '#6B7280';
  };

  const getTopLanguages = () => {
    return languageStats
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);
  };

  const getGrowthData = () => {
    return languageStats.slice(0, 6).map(lang => ({
      language: lang.language,
      growth: 0, // No historical data
      current: lang.percentage,
      color: getLanguageColor(lang.language)
    })).sort((a, b) => b.current - a.current);
  };


  if (loading) {
    return (
      <div className='card'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold'>Technology Trend Analysis</h2>
          <div className='w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin'></div>
        </div>
        <div className='animate-pulse space-y-4'>
          <div className='h-64 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='h-20 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
            ))}
          </div>
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
          <h2 className='text-2xl font-bold'>Technology Stack Analysis</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Analyze your current technology distribution and usage patterns
          </p>
        </div>

      </div>

      {/* Key Metrics */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <div className='text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20'>
          <p className='text-2xl font-bold text-blue-500'>{stats?.totalLanguages}</p>
          <p className='text-sm text-[var(--text-secondary)]'>Technologies Used</p>
        </div>

        <div className='text-center p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg border border-green-500/20'>
          <p className='text-2xl font-bold text-green-500'>{stats?.mostUsedLanguage}</p>
          <p className='text-sm text-[var(--text-secondary)]'>Most Used</p>
        </div>

        <div className='text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/20'>
          <p className='text-2xl font-bold text-purple-500'>{stats?.languageDiversity}</p>
          <p className='text-sm text-[var(--text-secondary)]'>Diversity Score</p>
        </div>

        <div className='text-center p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-lg border border-yellow-500/20'>
          <p className='text-2xl font-bold text-yellow-500'>
            {languageStats.filter(lang => lang.percentage >= 10).length}
          </p>
          <p className='text-sm text-[var(--text-secondary)]'>Major Tech</p>
        </div>
      </div>

      {/* Technology Distribution Chart */}
      <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)] mb-6'>
        <h3 className='text-lg font-semibold mb-4'>Technology Distribution</h3>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={languageStats.slice(0, 8)}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='language' />
            <YAxis />
            <Tooltip />
            <Bar dataKey='percentage' fill='#8976EA' name='Usage %' />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Language Selector and Comparison */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
        <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
          <h3 className='text-lg font-semibold mb-4'>Select Technology</h3>
          <div className='space-y-2'>
            {getTopLanguages().map((lang) => (
              <button
                key={lang.language}
                onClick={() => setSelectedLanguage(lang.language)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedLanguage === lang.language
                    ? 'border-[var(--primary)] bg-[var(--primary)] bg-opacity-10'
                    : 'border-[var(--card-border)] hover:border-[var(--primary)] hover:border-opacity-50'
                }`}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div
                      className='w-4 h-4 rounded-full'
                      style={{ backgroundColor: getLanguageColor(lang.language) }}
                    ></div>
                    <span className='font-medium'>{lang.language}</span>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm font-bold'>
                      {lang.percentage}%
                    </p>
                    <p className='text-xs text-[var(--text-secondary)]'>
                      {lang.count} repos
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
          <h3 className='text-lg font-semibold mb-4'>
            {selectedLanguage ? `${selectedLanguage} Details` : 'Select a Technology'}
          </h3>
          {selectedLanguage ? (
            <div className='space-y-4'>
              <div className='text-center'>
                <p className='text-3xl font-bold' style={{ color: getLanguageColor(selectedLanguage) }}>
                  {languageStats.find(l => l.language === selectedLanguage)?.percentage}%
                </p>
                <p className='text-sm text-[var(--text-secondary)]'>Usage in repositories</p>
              </div>
              <div className='text-center'>
                <p className='text-xl font-semibold'>
                  {languageStats.find(l => l.language === selectedLanguage)?.count} repositories
                </p>
                <p className='text-sm text-[var(--text-secondary)]'>Total projects using this technology</p>
              </div>
            </div>
          ) : (
            <div className='h-48 flex items-center justify-center text-[var(--text-secondary)]'>
              <p>Click on a technology above to see its details</p>
            </div>
          )}
        </div>
      </div>

      {/* Growth Analysis */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
          <h3 className='text-lg font-semibold mb-4'>Technology Usage</h3>
          <ResponsiveContainer width='100%' height={250}>
            <BarChart data={languageStats.slice(0, 6)}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='language' />
              <YAxis />
              <Tooltip />
              <Bar dataKey='percentage' fill='#10B981' name='Usage %' />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
          <h3 className='text-lg font-semibold mb-4'>Technology Insights</h3>
          <div className='space-y-4'>
            <div>
              <h4 className='font-medium text-green-500 mb-2'>🏆 Top Technologies</h4>
              <div className='flex flex-wrap gap-2'>
                {languageStats.slice(0, 3).map(lang => (
                  <span key={lang.language} className='px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs'>
                    {lang.language} ({lang.percentage}%)
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className='font-medium text-blue-500 mb-2'>📊 Usage Distribution</h4>
              <p className='text-sm text-[var(--text-secondary)]'>
                You have {stats?.totalLanguages} different technologies across {repos.length} repositories
              </p>
            </div>

            <div>
              <h4 className='font-medium text-purple-500 mb-2'>🎯 Focus Areas</h4>
              <p className='text-sm text-[var(--text-secondary)]'>
                Your primary focus is on {stats?.mostUsedLanguage} development with good technology diversity
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Diversity Score */}
      <div className='mt-6 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-semibold mb-2'>Technology Diversity Score</h3>
            <p className='text-[var(--text-secondary)] text-sm'>
              Your technology stack diversity indicates adaptability and broad skill set
            </p>
          </div>
          <div className='text-right'>
            <p className='text-3xl font-bold text-purple-500'>{stats?.languageDiversity}/10</p>
            <p className='text-sm text-[var(--text-secondary)]'>Above Average</p>
          </div>
        </div>

        <div className='mt-4'>
          <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
            <div
              className='bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full'
              style={{ width: `${(stats?.languageDiversity || 0) * 10}%` }}
            ></div>
          </div>
          <div className='flex justify-between text-xs text-[var(--text-secondary)] mt-1'>
            <span>Low Diversity</span>
            <span>High Diversity</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}