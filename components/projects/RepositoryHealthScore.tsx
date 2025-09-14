'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter } from 'recharts';

interface HealthFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
}

interface RepositoryHealth {
  name: string;
  overallScore: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  factors: HealthFactor[];
  lastCommit: string;
  issues: number;
  prs: number;
  contributors: number;
  language: string;
  size: number;
}

interface RepositoryHealthScoreProps {
  username: string;
  repos: any[];
}

export default function RepositoryHealthScore({ username, repos }: RepositoryHealthScoreProps) {
  const [repositories, setRepositories] = useState<RepositoryHealth[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'health' | 'activity' | 'size' | 'contributors'>('health');

  useEffect(() => {
    const analyzeRepositoryHealth = () => {
      // Mock repository health data
      const mockRepos: RepositoryHealth[] = [
        {
          name: 'awesome-react-components',
          overallScore: 92,
          grade: 'A+',
          lastCommit: '2024-12-10T00:00:00Z',
          issues: 12,
          prs: 8,
          contributors: 15,
          language: 'TypeScript',
          size: 2500,
          factors: [
            { name: 'Activity', score: 95, weight: 0.25, description: 'Recent commits and updates', status: 'excellent' },
            { name: 'Maintenance', score: 88, weight: 0.20, description: 'Code quality and documentation', status: 'good' },
            { name: 'Community', score: 90, weight: 0.20, description: 'Contributors and engagement', status: 'excellent' },
            { name: 'Issues', score: 85, weight: 0.15, description: 'Open issues and resolution time', status: 'good' },
            { name: 'Security', score: 92, weight: 0.20, description: 'Security vulnerabilities and updates', status: 'excellent' }
          ]
        },
        {
          name: 'nextjs-portfolio-template',
          overallScore: 78,
          grade: 'B+',
          lastCommit: '2024-12-08T00:00:00Z',
          issues: 25,
          prs: 12,
          contributors: 8,
          language: 'JavaScript',
          size: 1800,
          factors: [
            { name: 'Activity', score: 82, weight: 0.25, description: 'Recent commits and updates', status: 'good' },
            { name: 'Maintenance', score: 75, weight: 0.20, description: 'Code quality and documentation', status: 'fair' },
            { name: 'Community', score: 70, weight: 0.20, description: 'Contributors and engagement', status: 'fair' },
            { name: 'Issues', score: 65, weight: 0.15, description: 'Open issues and resolution time', status: 'fair' },
            { name: 'Security', score: 78, weight: 0.20, description: 'Security vulnerabilities and updates', status: 'good' }
          ]
        },
        {
          name: 'api-rate-limiter',
          overallScore: 85,
          grade: 'B+',
          lastCommit: '2024-11-25T00:00:00Z',
          issues: 8,
          prs: 5,
          contributors: 6,
          language: 'Go',
          size: 450,
          factors: [
            { name: 'Activity', score: 75, weight: 0.25, description: 'Recent commits and updates', status: 'fair' },
            { name: 'Maintenance', score: 85, weight: 0.20, description: 'Code quality and documentation', status: 'good' },
            { name: 'Community', score: 80, weight: 0.20, description: 'Contributors and engagement', status: 'good' },
            { name: 'Issues', score: 90, weight: 0.15, description: 'Open issues and resolution time', status: 'excellent' },
            { name: 'Security', score: 88, weight: 0.20, description: 'Security vulnerabilities and updates', status: 'good' }
          ]
        },
        {
          name: 'css-animations-library',
          overallScore: 65,
          grade: 'C',
          lastCommit: '2024-10-15T00:00:00Z',
          issues: 35,
          prs: 3,
          contributors: 4,
          language: 'CSS',
          size: 1200,
          factors: [
            { name: 'Activity', score: 55, weight: 0.25, description: 'Recent commits and updates', status: 'poor' },
            { name: 'Maintenance', score: 60, weight: 0.20, description: 'Code quality and documentation', status: 'poor' },
            { name: 'Community', score: 65, weight: 0.20, description: 'Contributors and engagement', status: 'fair' },
            { name: 'Issues', score: 70, weight: 0.15, description: 'Open issues and resolution time', status: 'fair' },
            { name: 'Security', score: 75, weight: 0.20, description: 'Security vulnerabilities and updates', status: 'fair' }
          ]
        },
        {
          name: 'data-visualization-tool',
          overallScore: 88,
          grade: 'B+',
          lastCommit: '2024-12-01T00:00:00Z',
          issues: 15,
          prs: 10,
          contributors: 12,
          language: 'Python',
          size: 3200,
          factors: [
            { name: 'Activity', score: 85, weight: 0.25, description: 'Recent commits and updates', status: 'good' },
            { name: 'Maintenance', score: 90, weight: 0.20, description: 'Code quality and documentation', status: 'excellent' },
            { name: 'Community', score: 85, weight: 0.20, description: 'Contributors and engagement', status: 'good' },
            { name: 'Issues', score: 80, weight: 0.15, description: 'Open issues and resolution time', status: 'good' },
            { name: 'Security', score: 92, weight: 0.20, description: 'Security vulnerabilities and updates', status: 'excellent' }
          ]
        }
      ];

      setRepositories(mockRepos);
      setLoading(false);
    };

    analyzeRepositoryHealth();
  }, [username, repos]);

  const getSortedRepositories = () => {
    return [...repositories].sort((a, b) => {
      switch (sortBy) {
        case 'health':
          return b.overallScore - a.overallScore;
        case 'activity':
          return new Date(b.lastCommit).getTime() - new Date(a.lastCommit).getTime();
        case 'size':
          return b.size - a.size;
        case 'contributors':
          return b.contributors - a.contributors;
        default:
          return 0;
      }
    });
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'text-green-500 bg-green-500/20';
      case 'A': return 'text-green-400 bg-green-400/20';
      case 'B+': return 'text-blue-500 bg-blue-500/20';
      case 'B': return 'text-blue-400 bg-blue-400/20';
      case 'C+': return 'text-yellow-500 bg-yellow-500/20';
      case 'C': return 'text-yellow-400 bg-yellow-400/20';
      case 'D': return 'text-orange-500 bg-orange-500/20';
      case 'F': return 'text-red-500 bg-red-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-500 bg-green-500/20';
      case 'good': return 'text-blue-500 bg-blue-500/20';
      case 'fair': return 'text-yellow-500 bg-yellow-500/20';
      case 'poor': return 'text-orange-500 bg-orange-500/20';
      case 'critical': return 'text-red-500 bg-red-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return '🟢';
      case 'good': return '🟡';
      case 'fair': return '🟠';
      case 'poor': return '🔴';
      case 'critical': return '❌';
      default: return '⚪';
    }
  };

  const getSelectedRepoData = () => {
    return repositories.find(repo => repo.name === selectedRepo);
  };

  const getRadarData = () => {
    const repo = getSelectedRepoData();
    if (!repo) return [];

    return repo.factors.map(factor => ({
      subject: factor.name,
      score: factor.score,
      fullMark: 100
    }));
  };

  const getHealthDistribution = () => [
    { grade: 'A+', count: repositories.filter(r => r.grade === 'A+').length, color: '#10B981' },
    { grade: 'A', count: repositories.filter(r => r.grade === 'A').length, color: '#34D399' },
    { grade: 'B+', count: repositories.filter(r => r.grade === 'B+').length, color: '#3B82F6' },
    { grade: 'B', count: repositories.filter(r => r.grade === 'B').length, color: '#60A5FA' },
    { grade: 'C+', count: repositories.filter(r => r.grade === 'C+').length, color: '#F59E0B' },
    { grade: 'C', count: repositories.filter(r => r.grade === 'C').length, color: '#FCD34D' },
    { grade: 'D', count: repositories.filter(r => r.grade === 'D').length, color: '#F97316' },
    { grade: 'F', count: repositories.filter(r => r.grade === 'F').length, color: '#EF4444' }
  ].filter(item => item.count > 0);

  const getAverageHealthScore = () => {
    return Math.round(repositories.reduce((sum, repo) => sum + repo.overallScore, 0) / repositories.length);
  };

  const getHealthInsights = () => {
    const excellent = repositories.filter(r => r.overallScore >= 90).length;
    const good = repositories.filter(r => r.overallScore >= 80 && r.overallScore < 90).length;
    const needsAttention = repositories.filter(r => r.overallScore < 70).length;

    return {
      excellent,
      good,
      needsAttention,
      total: repositories.length
    };
  };

  if (loading) {
    return (
      <div className='card'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold'>Repository Health Score</h2>
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

  const insights = getHealthInsights();
  const selectedRepoData = getSelectedRepoData();

  return (
    <motion.div
      className='card'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-bold'>Repository Health Score</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Analyze the health and maintenance status of your repositories
          </p>
        </div>

        {/* Sort Options */}
        <div className='flex bg-[var(--background)] rounded-lg p-1'>
          {[
            { id: 'health', label: 'Health' },
            { id: 'activity', label: 'Activity' },
            { id: 'size', label: 'Size' },
            { id: 'contributors', label: 'Contributors' }
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setSortBy(option.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                sortBy === option.id
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Health Overview */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <div className='text-center p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg border border-green-500/20'>
          <p className='text-2xl font-bold text-green-500'>{insights.excellent}</p>
          <p className='text-sm text-[var(--text-secondary)]'>Excellent Health</p>
        </div>

        <div className='text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20'>
          <p className='text-2xl font-bold text-blue-500'>{insights.good}</p>
          <p className='text-sm text-[var(--text-secondary)]'>Good Health</p>
        </div>

        <div className='text-center p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-lg border border-yellow-500/20'>
          <p className='text-2xl font-bold text-yellow-500'>{insights.needsAttention}</p>
          <p className='text-sm text-[var(--text-secondary)]'>Needs Attention</p>
        </div>

        <div className='text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/20'>
          <p className='text-2xl font-bold text-purple-500'>{getAverageHealthScore()}</p>
          <p className='text-sm text-[var(--text-secondary)]'>Avg Health Score</p>
        </div>
      </div>

      {/* Repository Health List */}
      <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)] mb-6'>
        <h3 className='text-lg font-semibold mb-4'>Repository Health Rankings</h3>
        <div className='space-y-3'>
          {getSortedRepositories().map((repo, index) => (
            <motion.div
              key={repo.name}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedRepo === repo.name
                  ? 'border-[var(--primary)] bg-[var(--primary)] bg-opacity-5'
                  : 'border-[var(--card-border)] hover:border-[var(--primary)] hover:border-opacity-50'
              }`}
              onClick={() => setSelectedRepo(repo.name)}
              whileHover={{ scale: 1.01 }}
            >
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-3'>
                  <div className='flex items-center justify-center w-8 h-8 bg-[var(--primary)] text-white text-sm font-bold rounded-full'>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className='font-semibold'>{repo.name}</h4>
                    <p className='text-sm text-[var(--text-secondary)]'>
                      {repo.language} • {repo.size}KB • {repo.contributors} contributors
                    </p>
                  </div>
                </div>

                <div className='text-right'>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-2 ${getGradeColor(repo.grade)}`}>
                    {repo.grade}
                  </div>
                  <p className='text-sm text-[var(--text-secondary)]'>
                    {repo.overallScore}/100
                  </p>
                </div>
              </div>

              {/* Health Factors */}
              <div className='grid grid-cols-5 gap-2'>
                {repo.factors.map((factor) => (
                  <div key={factor.name} className='text-center'>
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-bold mb-1 ${getStatusColor(factor.status)}`}>
                      {getStatusIcon(factor.status)}
                    </div>
                    <p className='text-xs text-[var(--text-secondary)]'>{factor.name}</p>
                    <p className='text-xs font-medium'>{factor.score}</p>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className='mt-3'>
                <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      repo.overallScore >= 90 ? 'bg-green-500' :
                      repo.overallScore >= 80 ? 'bg-blue-500' :
                      repo.overallScore >= 70 ? 'bg-yellow-500' :
                      repo.overallScore >= 60 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${repo.overallScore}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detailed Analysis */}
      {selectedRepoData && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
          {/* Radar Chart */}
          <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
            <h3 className='text-lg font-semibold mb-4'>Health Factors Breakdown</h3>
            <ResponsiveContainer width='100%' height={250}>
              <RadarChart data={getRadarData()}>
                <PolarGrid />
                <PolarAngleAxis dataKey='subject' />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name={selectedRepo || ''}
                  dataKey='score'
                  stroke='#8976EA'
                  fill='#8976EA'
                  fillOpacity={0.3}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Repository Details */}
          <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
            <h3 className='text-lg font-semibold mb-4'>Repository Details</h3>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-[var(--text-secondary)]'>Last Commit:</span>
                <span className='font-medium'>
                  {new Date(selectedRepoData.lastCommit).toLocaleDateString()}
                </span>
              </div>

              <div className='flex justify-between'>
                <span className='text-[var(--text-secondary)]'>Open Issues:</span>
                <span className='font-medium'>{selectedRepoData.issues}</span>
              </div>

              <div className='flex justify-between'>
                <span className='text-[var(--text-secondary)]'>Pull Requests:</span>
                <span className='font-medium'>{selectedRepoData.prs}</span>
              </div>

              <div className='flex justify-between'>
                <span className='text-[var(--text-secondary)]'>Contributors:</span>
                <span className='font-medium'>{selectedRepoData.contributors}</span>
              </div>

              <div className='flex justify-between'>
                <span className='text-[var(--text-secondary)]'>Language:</span>
                <span className='font-medium'>{selectedRepoData.language}</span>
              </div>

              <div className='flex justify-between'>
                <span className='text-[var(--text-secondary)]'>Size:</span>
                <span className='font-medium'>{selectedRepoData.size} KB</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Health Distribution */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
          <h3 className='text-lg font-semibold mb-4'>Health Grade Distribution</h3>
          <ResponsiveContainer width='100%' height={200}>
            <PieChart>
              <Pie
                data={getHealthDistribution()}
                cx='50%'
                cy='50%'
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey='count'
              >
                {getHealthDistribution().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
          <h3 className='text-lg font-semibold mb-4'>Health Insights</h3>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm'>Excellent Health (90-100)</span>
              <span className='text-sm font-bold text-green-500'>
                {repositories.filter(r => r.overallScore >= 90).length}
              </span>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-sm'>Good Health (80-89)</span>
              <span className='text-sm font-bold text-blue-500'>
                {repositories.filter(r => r.overallScore >= 80 && r.overallScore < 90).length}
              </span>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-sm'>Fair Health (70-79)</span>
              <span className='text-sm font-bold text-yellow-500'>
                {repositories.filter(r => r.overallScore >= 70 && r.overallScore < 80).length}
              </span>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-sm'>Needs Attention (below 70)</span>
              <span className='text-sm font-bold text-red-500'>
                {repositories.filter(r => r.overallScore < 70).length}
              </span>
            </div>
          </div>

          <div className='mt-4 p-3 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 border border-blue-500/20 rounded-lg'>
            <p className='text-sm text-[var(--text-secondary)]'>
              <strong>Recommendation:</strong> Focus on repositories with health scores below 70.
              These need immediate attention for better maintenance and community engagement.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
