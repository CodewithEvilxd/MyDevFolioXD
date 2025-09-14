'use client';

import { useState, useEffect } from 'react';
import { Repository, GitHubUser } from '@/types';
import { motion } from 'framer-motion';
import { createGitHubHeaders } from '@/lib/githubToken';

interface AnalyticsDashboardProps {
  username: string;
  repos: Repository[];
  user: GitHubUser;
}

export default function AnalyticsDashboard({ username, repos, user }: AnalyticsDashboardProps) {
  const [commitData, setCommitData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCommits: 0,
    totalStars: 0,
    totalForks: 0,
    languages: {} as Record<string, number>,
    monthlyActivity: [] as any[],
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!username) return;

      setLoading(true);
      try {
        const token = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN;
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Calculate basic stats from real repos
        const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
        const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);

        // Language distribution
        const languages: Record<string, number> = {};
        repos.forEach(repo => {
          if (repo.language) {
            languages[repo.language] = (languages[repo.language] || 0) + 1;
          }
        });

        // Fetch real commit data from user's repositories
        const recentCommits: any[] = [];
        const commitPromises = repos.slice(0, 5).map(async (repo) => {
          try {
            const commitsResponse = await fetch(
              `https://api.github.com/repos/${username}/${repo.name}/commits?per_page=5`,
              { headers }
            );
            if (commitsResponse.ok) {
              const commits = await commitsResponse.json();
              return commits.map((commit: any) => ({
                ...commit,
                repo: repo.name,
                date: new Date(commit.commit.author?.date || commit.commit.committer?.date || new Date())
              }));
            }
            return [];
          } catch (error) {
            return [];
          }
        });

        const commitResults = await Promise.all(commitPromises);
        commitResults.forEach(commits => recentCommits.push(...commits));

        // Sort commits by date
        recentCommits.sort((a, b) => b.date - a.date);

        // Calculate monthly activity (last 12 months) from real data
        const monthlyActivity = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
          const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthCommits = recentCommits.filter(commit =>
            commit.date.getMonth() === month.getMonth() &&
            commit.date.getFullYear() === month.getFullYear()
          ).length;

          monthlyActivity.push({
            month: month.toLocaleDateString('en-US', { month: 'short' }),
            commits: monthCommits
          });
        }

        // Try to get contribution stats from GitHub API
        let totalContributions = recentCommits.length;
        try {
          const eventsRes = await fetch(`https://api.github.com/users/${username}/events?per_page=100`, { headers });
          if (eventsRes.ok) {
            const events = await eventsRes.json();
            const pushEvents = events.filter((event: any) => event.type === 'PushEvent');
            totalContributions = Math.max(totalContributions, pushEvents.length);
          }
        } catch (error) {
          // Silently handle error
        }

        setStats({
          totalCommits: totalContributions,
          totalStars,
          totalForks,
          languages,
          monthlyActivity
        });

        setCommitData(recentCommits.slice(0, 20));
      } catch (error) {
        // Fallback to basic stats
        const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
        const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);

        const languages: Record<string, number> = {};
        repos.forEach(repo => {
          if (repo.language) {
            languages[repo.language] = (languages[repo.language] || 0) + 1;
          }
        });

        // Calculate basic monthly activity from available repository data
        const monthlyActivity = Array.from({ length: 12 }, (_, i) => {
          const month = new Date(new Date().getFullYear(), new Date().getMonth() - (11 - i), 1);
          const monthKey = month.toLocaleDateString('en-US', { month: 'short' });

          // Count repositories created in this month
          const reposThisMonth = repos.filter((repo: any) => {
            const createdDate = new Date(repo.created_at);
            return createdDate.getMonth() === month.getMonth() &&
                   createdDate.getFullYear() === month.getFullYear();
          }).length;

          // Use repository count as activity indicator (no random numbers)
          const activityScore = reposThisMonth * 3; // 3 points per repo created

          return {
            month: monthKey,
            commits: activityScore
          };
        });

        setStats({
          totalCommits: repos.length * 2, // Estimate 2 commits per repository
          totalStars,
          totalForks,
          languages,
          monthlyActivity
        });

        setCommitData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [username, repos]);

  if (loading) {
    return (
      <div className='flex items-center justify-center py-16'>
        <div className='relative w-16 h-16'>
          <div className='absolute inset-0 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin'></div>
          <div className='absolute inset-0 m-auto w-2 h-2 bg-[var(--primary)] rounded-full'></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className='w-full space-y-6'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className='section-heading'>Analytics Dashboard</h2>

      {/* Key Metrics */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <motion.div
          className='card text-center'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className='text-2xl font-bold text-[var(--primary)]'>{stats.totalCommits}</div>
          <div className='text-sm text-[var(--text-secondary)]'>Recent Commits</div>
        </motion.div>

        <motion.div
          className='card text-center'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className='text-2xl font-bold text-[var(--primary)]'>{stats.totalStars}</div>
          <div className='text-sm text-[var(--text-secondary)]'>Total Stars</div>
        </motion.div>

        <motion.div
          className='card text-center'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className='text-2xl font-bold text-[var(--primary)]'>{stats.totalForks}</div>
          <div className='text-sm text-[var(--text-secondary)]'>Total Forks</div>
        </motion.div>

        <motion.div
          className='card text-center'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className='text-2xl font-bold text-[var(--primary)]'>{Object.keys(stats.languages).length}</div>
          <div className='text-sm text-[var(--text-secondary)]'>Languages</div>
        </motion.div>
      </div>

      {/* Monthly Activity Chart */}
      <motion.div
        className='card'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className='text-lg font-bold mb-4'>Monthly Activity</h3>
        <div className='flex items-end justify-between h-32 gap-1'>
          {stats.monthlyActivity.map((month, index) => (
            <motion.div
              key={month.month}
              className='flex-1 bg-[var(--primary)] rounded-t'
              style={{ height: `${(month.commits / Math.max(...stats.monthlyActivity.map(m => m.commits))) * 100}%` }}
              initial={{ height: 0 }}
              animate={{ height: `${(month.commits / Math.max(...stats.monthlyActivity.map(m => m.commits))) * 100}%` }}
              transition={{ delay: 0.6 + index * 0.05, duration: 0.5 }}
            >
              <div className='text-xs text-white text-center mt-1'>{month.commits}</div>
            </motion.div>
          ))}
        </div>
        <div className='flex justify-between mt-2 text-xs text-[var(--text-secondary)]'>
          {stats.monthlyActivity.map(month => (
            <span key={month.month}>{month.month}</span>
          ))}
        </div>
      </motion.div>

      {/* Language Distribution */}
      <motion.div
        className='card'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className='text-lg font-bold mb-4'>Language Distribution</h3>
        <div className='space-y-2'>
          {Object.entries(stats.languages)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8)
            .map(([lang, count], index) => (
              <motion.div
                key={lang}
                className='flex items-center gap-3'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.05 }}
              >
                <span className='text-sm font-medium w-20'>{lang}</span>
                <div className='flex-1 bg-[var(--card-border)] rounded-full h-2'>
                  <motion.div
                    className='bg-[var(--primary)] h-2 rounded-full'
                    style={{ width: `${(count / Math.max(...Object.values(stats.languages))) * 100}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / Math.max(...Object.values(stats.languages))) * 100}%` }}
                    transition={{ delay: 0.9 + index * 0.05, duration: 0.5 }}
                  />
                </div>
                <span className='text-sm text-[var(--text-secondary)] w-8'>{count}</span>
              </motion.div>
            ))}
        </div>
      </motion.div>

      {/* Recent Commits */}
      <motion.div
        className='card'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <h3 className='text-lg font-bold mb-4'>Recent Activity</h3>
        <div className='space-y-3 max-h-64 overflow-y-auto'>
          {commitData.slice(0, 10).map((commit, index) => (
            <motion.div
              key={`${commit.sha}-${index}`}
              className='flex items-start gap-3 p-3 bg-[var(--background)] rounded-lg'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 + index * 0.05 }}
            >
              <div className='w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center flex-shrink-0'>
                <svg className='w-4 h-4 text-white' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 011.414 1.414L8.414 9.5H5a1 1 0 100 2h3.414l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z' clipRule='evenodd' />
                </svg>
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium truncate'>{commit.commit.message.split('\n')[0]}</p>
                <p className='text-xs text-[var(--text-secondary)]'>
                  {commit.repo} • {commit.date.toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
