'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { githubFetch, getGitHubToken } from '../../lib/githubService';
import { Repository } from '../../types';

interface PullRequest {
  id: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  created_at: string;
  updated_at: string;
  merged_at?: string;
  additions: number;
  deletions: number;
  changed_files: number;
  comments: number;
  review_comments: number;
  commits: number;
}

interface Issue {
  id: number;
  title: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  closed_at?: string;
  comments: number;
  labels: string[];
}

interface CodeReviewStats {
  totalPRs: number;
  mergedPRs: number;
  openPRs: number;
  closedPRs: number;
  totalIssues: number;
  openIssues: number;
  closedIssues: number;
  averagePRSize: number;
  averageReviewTime: number;
  mostActiveMonth: string;
  reviewEfficiency: number;
}

interface CodeReviewAnalyticsProps {
  username: string;
  repos: Repository[];
}

// Function to fetch PRs from GitHub API with rate limit handling
const fetchPRsForRepo = async (owner: string, repo: string, retryCount = 0): Promise<PullRequest[]> => {
  try {
    const response = await githubFetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=50`,
      {},
      getGitHubToken()
    );

    if (!response.ok) {
      if (response.status === 404) {
        // Repository not found or no access
        return [];
      }
      if (response.status === 429) {
        // Rate limited - wait and retry
        const retryAfter = response.headers.get('retry-after') || '60';
        const waitTime = Math.min(parseInt(retryAfter) * 1000, 60000); // Max 60 seconds

        // Rate limited - wait and retry

        if (retryCount < 3) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return fetchPRsForRepo(owner, repo, retryCount + 1);
        } else {
          // Rate limit exceeded after 3 retries
          return [];
        }
      }
      throw new Error(`Failed to fetch PRs: ${response.status}`);
    }

    const data = await response.json();
    return data.map((pr: any) => ({
      id: pr.id,
      title: pr.title,
      state: pr.state,
      created_at: pr.created_at,
      updated_at: pr.updated_at,
      merged_at: pr.merged_at,
      additions: pr.additions || 0,
      deletions: pr.deletions || 0,
      changed_files: pr.changed_files || 0,
      comments: pr.comments || 0,
      review_comments: pr.review_comments || 0,
      commits: pr.commits || 0
    }));
  } catch (error) {
    // Silently handle error
    return [];
  }
};

// Function to fetch issues from GitHub API (excluding PRs) with rate limit handling
const fetchIssuesForRepo = async (owner: string, repo: string, retryCount = 0): Promise<Issue[]> => {
  try {
    const response = await githubFetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=50`,
      {},
      getGitHubToken()
    );

    if (!response.ok) {
      if (response.status === 404) {
        // Repository not found or no access
        return [];
      }
      if (response.status === 429) {
        // Rate limited - wait and retry
        const retryAfter = response.headers.get('retry-after') || '60';
        const waitTime = Math.min(parseInt(retryAfter) * 1000, 60000); // Max 60 seconds

        // Rate limited - wait and retry

        if (retryCount < 3) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return fetchIssuesForRepo(owner, repo, retryCount + 1);
        } else {
          // Rate limit exceeded after 3 retries
          return [];
        }
      }
      throw new Error(`Failed to fetch issues: ${response.status}`);
    }

    const data = await response.json();
    // Filter out pull requests (they also appear in issues endpoint)
    const issuesOnly = data.filter((item: any) => !item.pull_request);

    return issuesOnly.map((issue: any) => ({
      id: issue.id,
      title: issue.title,
      state: issue.state,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      closed_at: issue.closed_at,
      comments: issue.comments || 0,
      labels: issue.labels?.map((label: any) => label.name) || []
    }));
  } catch (error) {
    // Silently handle error
    return [];
  }
};


// Function to calculate statistics from PR and issue data
const calculateStats = (allPRs: PullRequest[], allIssues: Issue[]): CodeReviewStats => {
  const totalPRs = allPRs.length;
  const mergedPRs = allPRs.filter(pr => pr.merged_at).length;
  const openPRs = allPRs.filter(pr => pr.state === 'open').length;
  const closedPRs = allPRs.filter(pr => pr.state === 'closed' && !pr.merged_at).length;

  const totalIssues = allIssues.length;
  const openIssues = allIssues.filter(issue => issue.state === 'open').length;
  const closedIssues = allIssues.filter(issue => issue.state === 'closed').length;

  // Calculate average PR size
  const prSizes = allPRs.map(pr => pr.additions + pr.deletions).filter(size => size > 0);
  const averagePRSize = prSizes.length > 0 ? Math.round(prSizes.reduce((a, b) => a + b, 0) / prSizes.length) : 0;

  // Calculate average review time (days between creation and merge/close)
  const reviewTimes = allPRs
    .filter(pr => pr.merged_at || (pr.state === 'closed' && !pr.merged_at))
    .map(pr => {
      const endDate = pr.merged_at ? new Date(pr.merged_at) : new Date(pr.updated_at);
      const startDate = new Date(pr.created_at);
      return (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    })
    .filter(time => time > 0);

  const averageReviewTime = reviewTimes.length > 0 ? Math.round((reviewTimes.reduce((a, b) => a + b, 0) / reviewTimes.length) * 10) / 10 : 0;

  // Find most active month
  const monthlyActivity = allPRs.reduce((acc, pr) => {
    const month = new Date(pr.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostActiveMonth = Object.entries(monthlyActivity).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

  // Calculate review efficiency (merged PRs / total PRs * 100)
  const reviewEfficiency = totalPRs > 0 ? Math.round((mergedPRs / totalPRs) * 100) : 0;

  return {
    totalPRs,
    mergedPRs,
    openPRs,
    closedPRs,
    totalIssues,
    openIssues,
    closedIssues,
    averagePRSize,
    averageReviewTime,
    mostActiveMonth,
    reviewEfficiency
  };
};

export default function CodeReviewAnalytics({ username, repos }: CodeReviewAnalyticsProps) {
  const [stats, setStats] = useState<CodeReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'prs' | 'issues' | 'trends'>('overview');
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // Additional state for detailed analytics
  const [monthlyActivityData, setMonthlyActivityData] = useState<any[]>([]);
  const [prSizeDistribution, setPrSizeDistribution] = useState({ small: 0, medium: 0, large: 0 });
  const [totalReviewComments, setTotalReviewComments] = useState(0);
  const [issueCategories, setIssueCategories] = useState({ bugs: 0, features: 0, enhancements: 0 });
  const [codeReviewVelocity, setCodeReviewVelocity] = useState(0);
  const [issueResolutionRate, setIssueResolutionRate] = useState(0);

  useEffect(() => {
    const fetchCodeReviewData = async () => {
      try {
        setLoading(true);
        setError('');

        if (!repos || repos.length === 0) {
          setStats({
            totalPRs: 0,
            mergedPRs: 0,
            openPRs: 0,
            closedPRs: 0,
            totalIssues: 0,
            openIssues: 0,
            closedIssues: 0,
            averagePRSize: 0,
            averageReviewTime: 0,
            mostActiveMonth: 'N/A',
            reviewEfficiency: 0
          });
          setLoading(false);
          return;
        }

        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 30000); // 30 second timeout
        });

        const fetchPromise = async () => {
          setProgress({ current: 0, total: repos.length });

          // Fetch PRs and issues from all repositories with rate limit protection
          const allPRs: PullRequest[] = [];
          const allIssues: Issue[] = [];

          // Process repositories in optimized batches with better rate limit handling
          const batchSize = 3; // Slightly larger batch for better performance
          const maxRepos = Math.min(repos.length, 15); // Limit to 15 repos for performance

          for (let i = 0; i < maxRepos; i += batchSize) {
            const batch = repos.slice(i, i + batchSize);
            const batchPromises = batch.map(async (repo: Repository) => {
              try {
                const [prs, issues] = await Promise.all([
                  fetchPRsForRepo(username, repo.name),
                  fetchIssuesForRepo(username, repo.name)
                ]);
                return { prs, issues };
              } catch (error) {
                return { prs: [], issues: [] };
              }
            });

            const batchResults = await Promise.all(batchPromises);

            batchResults.forEach(({ prs, issues }) => {
              allPRs.push(...prs);
              allIssues.push(...issues);
            });

            // Update progress
            const processed = Math.min(i + batchSize, maxRepos);
            setProgress({ current: processed, total: maxRepos });

            // Shorter delay between batches for better performance
            if (i + batchSize < maxRepos) {
              await new Promise(resolve => setTimeout(resolve, 800)); // Reduced to 800ms
            }
          }

          // Calculate statistics from real data
          const calculatedStats = calculateStats(allPRs, allIssues);
          setStats(calculatedStats);

          // Calculate additional detailed analytics
          // Calculate monthly activity
          const monthlyData = [
            { month: 'Jan', prs: 0, issues: 0 },
            { month: 'Feb', prs: 0, issues: 0 },
            { month: 'Mar', prs: 0, issues: 0 },
            { month: 'Apr', prs: 0, issues: 0 },
            { month: 'May', prs: 0, issues: 0 },
            { month: 'Jun', prs: 0, issues: 0 },
            { month: 'Jul', prs: 0, issues: 0 },
            { month: 'Aug', prs: 0, issues: 0 },
            { month: 'Sep', prs: 0, issues: 0 },
            { month: 'Oct', prs: 0, issues: 0 },
            { month: 'Nov', prs: 0, issues: 0 },
            { month: 'Dec', prs: 0, issues: 0 }
          ];

          // Count PRs and issues by month
          allPRs.forEach(pr => {
            const month = new Date(pr.created_at).toLocaleDateString('en-US', { month: 'short' });
            const monthIndex = monthlyData.findIndex(m => m.month === month);
            if (monthIndex !== -1) {
              monthlyData[monthIndex].prs++;
            }
          });

          allIssues.forEach(issue => {
            const month = new Date(issue.created_at).toLocaleDateString('en-US', { month: 'short' });
            const monthIndex = monthlyData.findIndex(m => m.month === month);
            if (monthIndex !== -1) {
              monthlyData[monthIndex].issues++;
            }
          });

          setMonthlyActivityData(monthlyData);

          // Calculate PR size distribution
          const smallPRs = allPRs.filter(pr => (pr.additions + pr.deletions) <= 50).length;
          const mediumPRs = allPRs.filter(pr => (pr.additions + pr.deletions) > 50 && (pr.additions + pr.deletions) <= 500).length;
          const largePRs = allPRs.filter(pr => (pr.additions + pr.deletions) > 500).length;
          const totalPRs = allPRs.length;

          setPrSizeDistribution({
            small: totalPRs > 0 ? Math.round((smallPRs / totalPRs) * 100) : 0,
            medium: totalPRs > 0 ? Math.round((mediumPRs / totalPRs) * 100) : 0,
            large: totalPRs > 0 ? Math.round((largePRs / totalPRs) * 100) : 0
          });

          // Calculate total review comments
          const totalComments = allPRs.reduce((sum, pr) => sum + pr.review_comments, 0);
          setTotalReviewComments(totalComments);

          // Calculate issue categories based on labels
          const bugs = allIssues.filter(issue =>
            issue.labels.some(label =>
              label.toLowerCase().includes('bug') ||
              label.toLowerCase().includes('fix') ||
              label.toLowerCase().includes('error')
            )
          ).length;

          const features = allIssues.filter(issue =>
            issue.labels.some(label =>
              label.toLowerCase().includes('feature') ||
              label.toLowerCase().includes('enhancement') ||
              label.toLowerCase().includes('new')
            )
          ).length;

          const enhancements = allIssues.filter(issue =>
            issue.labels.some(label =>
              label.toLowerCase().includes('improvement') ||
              label.toLowerCase().includes('refactor') ||
              label.toLowerCase().includes('optimization')
            )
          ).length;

          setIssueCategories({ bugs, features, enhancements });

          // Calculate code review velocity (PRs merged per month over last 3 months)
          const now = new Date();
          const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          const recentMergedPRs = allPRs.filter(pr =>
            pr.merged_at && new Date(pr.merged_at) >= threeMonthsAgo
          ).length;

          const velocity = Math.round((recentMergedPRs / 3) * 10) / 10; // Average per month
          setCodeReviewVelocity(velocity);

          // Calculate issue resolution rate
          const totalIssues = allIssues.length;
          const resolvedIssues = allIssues.filter(issue => issue.state === 'closed').length;
          const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;
          setIssueResolutionRate(resolutionRate);
        };

        // Race between fetch and timeout
        await Promise.race([fetchPromise(), timeoutPromise]);

      } catch (err) {
        // Set empty state instead of fake data
        setStats({
          totalPRs: 0,
          mergedPRs: 0,
          openPRs: 0,
          closedPRs: 0,
          totalIssues: 0,
          openIssues: 0,
          closedIssues: 0,
          averagePRSize: 0,
          averageReviewTime: 0,
          mostActiveMonth: 'N/A',
          reviewEfficiency: 0
        });

        setMonthlyActivityData([]);
        setPrSizeDistribution({ small: 0, medium: 0, large: 0 });
        setTotalReviewComments(0);
        setIssueCategories({ bugs: 0, features: 0, enhancements: 0 });
        setCodeReviewVelocity(0);
        setIssueResolutionRate(0);

        setError('Unable to load GitHub data. Please check your token and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCodeReviewData();
  }, [username, repos]);

  const getPRStatusData = () => [
    { name: 'Merged', value: stats?.mergedPRs || 0, color: '#10B981' },
    { name: 'Open', value: stats?.openPRs || 0, color: '#3B82F6' },
    { name: 'Closed', value: stats?.closedPRs || 0, color: '#EF4444' }
  ];

  const getIssueStatusData = () => [
    { name: 'Open', value: stats?.openIssues || 0, color: '#F59E0B' },
    { name: 'Closed', value: stats?.closedIssues || 0, color: '#10B981' }
  ];

  const getMonthlyActivityData = () => {
    return monthlyActivityData.length > 0 ? monthlyActivityData : [
      { month: 'Jan', prs: 0, issues: 0 },
      { month: 'Feb', prs: 0, issues: 0 },
      { month: 'Mar', prs: 0, issues: 0 },
      { month: 'Apr', prs: 0, issues: 0 },
      { month: 'May', prs: 0, issues: 0 },
      { month: 'Jun', prs: 0, issues: 0 },
      { month: 'Jul', prs: 0, issues: 0 },
      { month: 'Aug', prs: 0, issues: 0 },
      { month: 'Sep', prs: 0, issues: 0 },
      { month: 'Oct', prs: 0, issues: 0 },
      { month: 'Nov', prs: 0, issues: 0 },
      { month: 'Dec', prs: 0, issues: 0 }
    ];
  };

  if (loading) {
    return (
      <div className='card'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold'>Code Review Analytics</h2>
          <div className='w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin'></div>
        </div>

        {progress.total > 0 && (
          <div className='mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm font-medium text-blue-700 dark:text-blue-300'>
                Fetching repository data...
              </span>
              <span className='text-sm text-blue-600 dark:text-blue-400'>
                {progress.current}/{progress.total}
              </span>
            </div>
            <div className='w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2'>
              <div
                className='bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300'
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              ></div>
            </div>
            <p className='text-xs text-blue-600 dark:text-blue-400 mt-2'>
              Processing repositories to avoid GitHub API rate limits. This may take a moment...
            </p>
          </div>
        )}

        <div className='animate-pulse space-y-4'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {Array.from({ length: 8 }).map((_, i) => (
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
        <h2 className='text-2xl font-bold'>Code Review Analytics</h2>

        {/* Tab Navigation */}
        <div className='flex bg-[var(--background)] rounded-lg p-1'>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'prs', label: 'Pull Requests' },
            { id: 'issues', label: 'Issues' },
            { id: 'trends', label: 'Trends' }
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
          {/* Key Metrics */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
            <div className='text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20'>
              <p className='text-2xl font-bold text-blue-500'>{stats?.totalPRs}</p>
              <p className='text-sm text-[var(--text-secondary)]'>Total PRs</p>
            </div>

            <div className='text-center p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg border border-green-500/20'>
              <p className='text-2xl font-bold text-green-500'>{stats?.mergedPRs}</p>
              <p className='text-sm text-[var(--text-secondary)]'>Merged PRs</p>
            </div>

            <div className='text-center p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-lg border border-yellow-500/20'>
              <p className='text-2xl font-bold text-yellow-500'>{stats?.openIssues}</p>
              <p className='text-sm text-[var(--text-secondary)]'>Open Issues</p>
            </div>

            <div className='text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/20'>
              <p className='text-2xl font-bold text-purple-500'>{stats?.reviewEfficiency}%</p>
              <p className='text-sm text-[var(--text-secondary)]'>Review Efficiency</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
            {/* PR Status Distribution */}
            <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
              <h3 className='text-lg font-semibold mb-4'>PR Status Distribution</h3>
              <div style={{ width: '100%', height: '200px' }}>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={getPRStatusData()}
                      cx='50%'
                      cy='50%'
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey='value'
                    >
                      {getPRStatusData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Issue Status Distribution */}
            <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
              <h3 className='text-lg font-semibold mb-4'>Issue Status Distribution</h3>
              <div style={{ width: '100%', height: '200px' }}>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={getIssueStatusData()}
                      cx='50%'
                      cy='50%'
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey='value'
                    >
                      {getIssueStatusData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
            <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
              <h4 className='font-semibold text-green-500 mb-2'>Average PR Size</h4>
              <p className='text-2xl font-bold'>{stats?.averagePRSize} lines</p>
              <p className='text-sm text-[var(--text-secondary)]'>Code changes per PR</p>
            </div>

            <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
              <h4 className='font-semibold text-blue-500 mb-2'>Review Time</h4>
              <p className='text-2xl font-bold'>{stats?.averageReviewTime} days</p>
              <p className='text-sm text-[var(--text-secondary)]'>Average time to merge</p>
            </div>

            <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
              <h4 className='font-semibold text-purple-500 mb-2'>Most Active</h4>
              <p className='text-2xl font-bold'>{stats?.mostActiveMonth.split(' ')[0]}</p>
              <p className='text-sm text-[var(--text-secondary)]'>Peak contribution month</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'prs' && (
        <div className='space-y-6'>
          <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
            <h3 className='text-lg font-semibold mb-4'>PR Activity Trends</h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={getMonthlyActivityData()}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='month' />
                  <YAxis />
                  <Tooltip />
                  <Line type='monotone' dataKey='prs' stroke='#3B82F6' strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4'>
            <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
              <h4 className='font-semibold mb-3'>PR Size Distribution</h4>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>Small (1-50 lines)</span>
                  <span className='font-medium'>{prSizeDistribution.small}%</span>
                </div>
                <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                  <div className='bg-green-500 h-2 rounded-full' style={{ width: `${prSizeDistribution.small}%` }}></div>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Medium (51-500 lines)</span>
                  <span className='font-medium'>{prSizeDistribution.medium}%</span>
                </div>
                <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                  <div className='bg-yellow-500 h-2 rounded-full' style={{ width: `${prSizeDistribution.medium}%` }}></div>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Large (500+ lines)</span>
                  <span className='font-medium'>{prSizeDistribution.large}%</span>
                </div>
                <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                  <div className='bg-red-500 h-2 rounded-full' style={{ width: `${prSizeDistribution.large}%` }}></div>
                </div>
              </div>
            </div>

            <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
              <h4 className='font-semibold mb-3'>Review Comments</h4>
              <div className='text-center'>
                <p className='text-3xl font-bold text-blue-500'>{totalReviewComments}</p>
                <p className='text-sm text-[var(--text-secondary)]'>Total review comments</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'issues' && (
        <div className='space-y-6'>
          <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
            <h3 className='text-lg font-semibold mb-4'>Issue Resolution Time</h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={getMonthlyActivityData()}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='month' />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey='issues' fill='#F59E0B' />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
            <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
              <h4 className='font-semibold text-yellow-500 mb-2'>Bug Reports</h4>
              <p className='text-2xl font-bold'>{issueCategories.bugs}</p>
              <p className='text-sm text-[var(--text-secondary)]'>Total bug issues</p>
            </div>

            <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
              <h4 className='font-semibold text-green-500 mb-2'>Features</h4>
              <p className='text-2xl font-bold'>{issueCategories.features}</p>
              <p className='text-sm text-[var(--text-secondary)]'>Feature requests</p>
            </div>

            <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
              <h4 className='font-semibold text-blue-500 mb-2'>Enhancements</h4>
              <p className='text-2xl font-bold'>{issueCategories.enhancements}</p>
              <p className='text-sm text-[var(--text-secondary)]'>Improvement suggestions</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className='space-y-6'>
          <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
            <h3 className='text-lg font-semibold mb-4'>Monthly Activity Comparison</h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={getMonthlyActivityData()}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='month' />
                  <YAxis />
                  <Tooltip />
                  <Line type='monotone' dataKey='prs' stroke='#3B82F6' strokeWidth={2} name='PRs' />
                  <Line type='monotone' dataKey='issues' stroke='#F59E0B' strokeWidth={2} name='Issues' />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4'>
            <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
              <h4 className='font-semibold mb-3'>Code Review Velocity</h4>
              <div className='text-center'>
                <p className='text-3xl font-bold text-green-500'>{codeReviewVelocity}/month</p>
                <p className='text-sm text-[var(--text-secondary)]'>PRs merged per month (last 3 months)</p>
              </div>
            </div>

            <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
              <h4 className='font-semibold mb-3'>Issue Resolution Rate</h4>
              <div className='text-center'>
                <p className='text-3xl font-bold text-blue-500'>{issueResolutionRate}%</p>
                <p className='text-sm text-[var(--text-secondary)]'>Issues closed successfully</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
