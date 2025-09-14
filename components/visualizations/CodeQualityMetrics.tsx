'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface QualityMetric {
  name: string;
  score: number;
  maxScore: number;
  description: string;
  trend: 'improving' | 'declining' | 'stable';
}

interface RepositoryQuality {
  name: string;
  overall: number;
  maintainability: number;
  testCoverage: number;
  documentation: number;
  complexity: number;
  security: number;
  language: string;
}

interface CodeQualityMetricsProps {
  username: string;
  repos: any[];
}

export default function CodeQualityMetrics({ username, repos }: CodeQualityMetricsProps) {
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>([]);
  const [repoQuality, setRepoQuality] = useState<RepositoryQuality[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'repositories' | 'trends' | 'recommendations'>('overview');

  useEffect(() => {
    const analyzeCodeQuality = () => {
      // Generate mock quality metrics
      const mockMetrics: QualityMetric[] = [
        {
          name: 'Code Coverage',
          score: 78,
          maxScore: 100,
          description: 'Percentage of code covered by tests',
          trend: 'improving'
        },
        {
          name: 'Maintainability Index',
          score: 82,
          maxScore: 100,
          description: 'Ease of maintaining and modifying code',
          trend: 'stable'
        },
        {
          name: 'Cyclomatic Complexity',
          score: 65,
          maxScore: 100,
          description: 'Measure of code complexity (lower is better)',
          trend: 'improving'
        },
        {
          name: 'Documentation Quality',
          score: 71,
          maxScore: 100,
          description: 'Quality and completeness of documentation',
          trend: 'declining'
        },
        {
          name: 'Security Score',
          score: 89,
          maxScore: 100,
          description: 'Security vulnerabilities and best practices',
          trend: 'improving'
        },
        {
          name: 'Performance Score',
          score: 76,
          maxScore: 100,
          description: 'Code performance and optimization',
          trend: 'stable'
        }
      ];

      const mockRepoQuality: RepositoryQuality[] = [
        { name: 'awesome-react-components', overall: 88, maintainability: 85, testCoverage: 82, documentation: 78, complexity: 72, security: 91, language: 'TypeScript' },
        { name: 'nextjs-portfolio-template', overall: 92, maintainability: 89, testCoverage: 88, documentation: 85, complexity: 78, security: 95, language: 'JavaScript' },
        { name: 'api-rate-limiter', overall: 85, maintainability: 82, testCoverage: 75, documentation: 72, complexity: 68, security: 88, language: 'Go' },
        { name: 'css-animations-library', overall: 79, maintainability: 76, testCoverage: 65, documentation: 68, complexity: 82, security: 85, language: 'CSS' },
        { name: 'data-visualization-tool', overall: 86, maintainability: 84, testCoverage: 78, documentation: 75, complexity: 71, security: 89, language: 'Python' }
      ];

      setQualityMetrics(mockMetrics);
      setRepoQuality(mockRepoQuality);
      setLoading(false);
    };

    analyzeCodeQuality();
  }, [username, repos]);

  const getQualityColor = (score: number): string => {
    if (score >= 90) return 'text-green-500 bg-green-500/20';
    if (score >= 80) return 'text-blue-500 bg-blue-500/20';
    if (score >= 70) return 'text-yellow-500 bg-yellow-500/20';
    if (score >= 60) return 'text-orange-500 bg-orange-500/20';
    return 'text-red-500 bg-red-500/20';
  };

  const getTrendIcon = (trend: string): string => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case 'improving': return 'text-green-500';
      case 'declining': return 'text-red-500';
      case 'stable': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getRadarData = () => {
    const repo = repoQuality.find(r => r.name === selectedRepo);
    if (!repo) return [];

    return [
      { subject: 'Maintainability', A: repo.maintainability, fullMark: 100 },
      { subject: 'Test Coverage', A: repo.testCoverage, fullMark: 100 },
      { subject: 'Documentation', A: repo.documentation, fullMark: 100 },
      { subject: 'Complexity', A: repo.complexity, fullMark: 100 },
      { subject: 'Security', A: repo.security, fullMark: 100 }
    ];
  };

  const getQualityTrendData = () => [
    { month: 'Jan', coverage: 72, maintainability: 78, complexity: 68, security: 85 },
    { month: 'Feb', coverage: 74, maintainability: 79, complexity: 67, security: 86 },
    { month: 'Mar', coverage: 76, maintainability: 80, complexity: 66, security: 87 },
    { month: 'Apr', coverage: 75, maintainability: 81, complexity: 65, security: 88 },
    { month: 'May', coverage: 77, maintainability: 82, complexity: 64, security: 89 },
    { month: 'Jun', coverage: 78, maintainability: 82, complexity: 65, security: 89 }
  ];

  const getQualityDistribution = () => [
    { range: '90-100', count: 2, color: '#10B981' },
    { range: '80-89', count: 3, color: '#3B82F6' },
    { range: '70-79', count: 4, color: '#F59E0B' },
    { range: '60-69', count: 1, color: '#F97316' },
    { range: '0-59', count: 0, color: '#EF4444' }
  ];

  const getRecommendations = () => [
    {
      category: 'Testing',
      priority: 'High',
      items: [
        'Increase test coverage for CSS animations library',
        'Add integration tests for API endpoints',
        'Implement automated testing pipeline'
      ]
    },
    {
      category: 'Documentation',
      priority: 'Medium',
      items: [
        'Add API documentation for rate limiter',
        'Create contribution guidelines',
        'Document deployment procedures'
      ]
    },
    {
      category: 'Security',
      priority: 'High',
      items: [
        'Update dependencies to latest versions',
        'Implement input validation',
        'Add security headers'
      ]
    },
    {
      category: 'Performance',
      priority: 'Medium',
      items: [
        'Optimize bundle size',
        'Implement code splitting',
        'Add performance monitoring'
      ]
    }
  ];

  if (loading) {
    return (
      <div className='card'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold'>Code Quality Metrics</h2>
          <div className='w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin'></div>
        </div>
        <div className='animate-pulse space-y-4'>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='h-24 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
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
          <h2 className='text-2xl font-bold'>Code Quality Metrics</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Analyze and improve code quality across your repositories
          </p>
        </div>

        {/* Tab Navigation */}
        <div className='flex bg-[var(--background)] rounded-lg p-1'>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'repositories', label: 'Repositories' },
            { id: 'trends', label: 'Trends' },
            { id: 'recommendations', label: 'Recommendations' }
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
      </div>

      {activeTab === 'overview' && (
        <div className='space-y-6'>
          {/* Overall Quality Score */}
          <div className='text-center p-6 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 border border-blue-500/20 rounded-lg'>
            <h3 className='text-lg font-semibold mb-2'>Overall Code Quality Score</h3>
            <div className='text-5xl font-bold text-blue-500 mb-2'>
              {Math.round(qualityMetrics.reduce((sum, metric) => sum + metric.score, 0) / qualityMetrics.length)}
              <span className='text-2xl'>/100</span>
            </div>
            <p className='text-[var(--text-secondary)]'>Based on 6 quality metrics across all repositories</p>
          </div>

          {/* Quality Metrics Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {qualityMetrics.map((metric, index) => (
              <motion.div
                key={metric.name}
                className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className='flex items-center justify-between mb-2'>
                  <h4 className='font-semibold text-sm'>{metric.name}</h4>
                  <span className={`text-lg ${getTrendColor(metric.trend)}`}>
                    {getTrendIcon(metric.trend)}
                  </span>
                </div>

                <div className='flex items-end gap-2 mb-2'>
                  <span className='text-2xl font-bold'>{metric.score}</span>
                  <span className='text-sm text-[var(--text-secondary)]'>/{metric.maxScore}</span>
                </div>

                <p className='text-xs text-[var(--text-secondary)] mb-3'>{metric.description}</p>

                {/* Progress bar */}
                <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      metric.score >= 90 ? 'bg-green-500' :
                      metric.score >= 80 ? 'bg-blue-500' :
                      metric.score >= 70 ? 'bg-yellow-500' :
                      metric.score >= 60 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(metric.score / metric.maxScore) * 100}%` }}
                  ></div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quality Distribution */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
              <h3 className='text-lg font-semibold mb-4'>Quality Score Distribution</h3>
              <ResponsiveContainer width='100%' height={200}>
                <PieChart>
                  <Pie
                    data={getQualityDistribution()}
                    cx='50%'
                    cy='50%'
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey='count'
                  >
                    {getQualityDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
              <h3 className='text-lg font-semibold mb-4'>Quality Ranges</h3>
              <div className='space-y-3'>
                {getQualityDistribution().map((range) => (
                  <div key={range.range} className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div
                        className='w-4 h-4 rounded'
                        style={{ backgroundColor: range.color }}
                      ></div>
                      <span className='text-sm font-medium'>{range.range}</span>
                    </div>
                    <span className='text-sm text-[var(--text-secondary)]'>
                      {range.count} repos
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'repositories' && (
        <div className='space-y-6'>
          {/* Repository Quality Table */}
          <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
            <h3 className='text-lg font-semibold mb-4'>Repository Quality Scores</h3>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-[var(--card-border)]'>
                    <th className='text-left py-2 px-4'>Repository</th>
                    <th className='text-center py-2 px-4'>Overall</th>
                    <th className='text-center py-2 px-4'>Maintainability</th>
                    <th className='text-center py-2 px-4'>Test Coverage</th>
                    <th className='text-center py-2 px-4'>Documentation</th>
                    <th className='text-center py-2 px-4'>Security</th>
                  </tr>
                </thead>
                <tbody>
                  {repoQuality.map((repo, index) => (
                    <tr
                      key={repo.name}
                      className={`border-b border-[var(--card-border)] cursor-pointer hover:bg-[var(--card-bg)] ${
                        selectedRepo === repo.name ? 'bg-[var(--primary)] bg-opacity-5' : ''
                      }`}
                      onClick={() => setSelectedRepo(repo.name)}
                    >
                      <td className='py-3 px-4'>
                        <div>
                          <p className='font-medium'>{repo.name}</p>
                          <p className='text-xs text-[var(--text-secondary)]'>{repo.language}</p>
                        </div>
                      </td>
                      <td className='py-3 px-4 text-center'>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getQualityColor(repo.overall)}`}>
                          {repo.overall}
                        </span>
                      </td>
                      <td className='py-3 px-4 text-center'>
                        <div className='flex items-center justify-center gap-2'>
                          <div className='w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                            <div className='bg-blue-500 h-2 rounded-full' style={{ width: `${repo.maintainability}%` }}></div>
                          </div>
                          <span className='text-xs'>{repo.maintainability}</span>
                        </div>
                      </td>
                      <td className='py-3 px-4 text-center'>
                        <div className='flex items-center justify-center gap-2'>
                          <div className='w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                            <div className='bg-green-500 h-2 rounded-full' style={{ width: `${repo.testCoverage}%` }}></div>
                          </div>
                          <span className='text-xs'>{repo.testCoverage}</span>
                        </div>
                      </td>
                      <td className='py-3 px-4 text-center'>
                        <div className='flex items-center justify-center gap-2'>
                          <div className='w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                            <div className='bg-purple-500 h-2 rounded-full' style={{ width: `${repo.documentation}%` }}></div>
                          </div>
                          <span className='text-xs'>{repo.documentation}</span>
                        </div>
                      </td>
                      <td className='py-3 px-4 text-center'>
                        <div className='flex items-center justify-center gap-2'>
                          <div className='w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                            <div className='bg-red-500 h-2 rounded-full' style={{ width: `${repo.security}%` }}></div>
                          </div>
                          <span className='text-xs'>{repo.security}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Repository Details */}
          {selectedRepo && (
            <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
              <h3 className='text-lg font-semibold mb-4'>Quality Breakdown: {selectedRepo}</h3>
              <ResponsiveContainer width='100%' height={300}>
                <RadarChart data={getRadarData()}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey='subject' />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name={selectedRepo}
                    dataKey='A'
                    stroke='#8976EA'
                    fill='#8976EA'
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {activeTab === 'trends' && (
        <div className='space-y-6'>
          {/* Quality Trends Over Time */}
          <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
            <h3 className='text-lg font-semibold mb-4'>Quality Metrics Trends</h3>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={getQualityTrendData()}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='month' />
                <YAxis />
                <Tooltip />
                <Line type='monotone' dataKey='coverage' stroke='#10B981' strokeWidth={2} name='Test Coverage' />
                <Line type='monotone' dataKey='maintainability' stroke='#3B82F6' strokeWidth={2} name='Maintainability' />
                <Line type='monotone' dataKey='complexity' stroke='#F59E0B' strokeWidth={2} name='Complexity' />
                <Line type='monotone' dataKey='security' stroke='#EF4444' strokeWidth={2} name='Security' />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Quality Improvements */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
              <h4 className='font-semibold text-green-500 mb-3'>📈 Improving Metrics</h4>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>Test Coverage</span>
                  <span className='text-green-500'>+6%</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Security Score</span>
                  <span className='text-green-500'>+4%</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Cyclomatic Complexity</span>
                  <span className='text-green-500'>-3%</span>
                </div>
              </div>
            </div>

            <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
              <h4 className='font-semibold text-yellow-500 mb-3'>⚠️ Areas for Improvement</h4>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>Documentation Quality</span>
                  <span className='text-red-500'>-2%</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Performance Score</span>
                  <span className='text-yellow-500'>0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className='space-y-6'>
          {getRecommendations().map((category, index) => (
            <motion.div
              key={category.category}
              className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className='flex items-center gap-3 mb-3'>
                <h4 className='font-semibold'>{category.category}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  category.priority === 'High' ? 'bg-red-500/20 text-red-500' :
                  category.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
                  'bg-green-500/20 text-green-500'
                }`}>
                  {category.priority}
                </span>
              </div>

              <ul className='space-y-2'>
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex} className='flex items-start gap-2 text-sm'>
                    <span className='text-[var(--primary)] mt-1'>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Action Items Summary */}
          <div className='bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 border border-blue-500/20 rounded-lg p-6'>
            <h3 className='text-lg font-semibold mb-4'>Quality Improvement Roadmap</h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-red-500 mb-1'>5</div>
                <p className='text-sm text-[var(--text-secondary)]'>High Priority</p>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-yellow-500 mb-1'>4</div>
                <p className='text-sm text-[var(--text-secondary)]'>Medium Priority</p>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-500 mb-1'>2</div>
                <p className='text-sm text-[var(--text-secondary)]'>Completed</p>
              </div>
            </div>

            <div className='mt-4 p-4 bg-white/5 rounded-lg'>
              <p className='text-sm text-[var(--text-secondary)]'>
                <strong>Next Steps:</strong> Focus on increasing test coverage and improving documentation quality.
                Implementing these recommendations will boost your overall code quality score by approximately 15-20 points.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
