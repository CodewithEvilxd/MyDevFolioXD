'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getGitHubToken } from '@/lib/githubToken';

interface Contribution {
  date: string;
  count: number;
  repos: string[];
}

interface ContributionTimelineProps {
  username: string;
}

export default function ContributionTimeline({ username }: ContributionTimelineProps) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchContributionData = async () => {
      if (!username) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Get GitHub token using the helper function
        const token = getGitHubToken();

        const headers: any = {
          'Content-Type': 'application/json',
        };

        // Add Authorization header if token exists
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Fetch contribution data from GitHub GraphQL API
        const query = `
          query($username: String!) {
            user(login: $username) {
              contributionsCollection(from: "${selectedYear}-01-01T00:00:00Z", to: "${selectedYear}-12-31T23:59:59Z") {
                contributionCalendar {
                  totalContributions
                  weeks {
                    contributionDays {
                      date
                      contributionCount
                    }
                  }
                }
              }
            }
          }
        `;

        const response = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            query,
            variables: { username }
          })
        });

        if (!response.ok) {
          
          setContributions([]);
          return;
        }

        const data = await response.json();

        if (data.errors) {
          
          setContributions([]);
          return;
        }

        const calendar = data.data?.user?.contributionsCollection?.contributionCalendar;

        if (!calendar) {
          setContributions([]);
          return;
        }

        // Transform the data
        const timeline: Contribution[] = [];
        calendar.weeks.forEach((week: any) => {
          week.contributionDays.forEach((day: any) => {
            timeline.push({
              date: day.date,
              count: day.contributionCount,
              repos: [] // Could be enhanced to include repo info
            });
          });
        });

        setContributions(timeline);
      } catch (error) {
        
        setContributions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContributionData();
  }, [username, selectedYear]);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-[var(--card-border)]';
    if (count <= 2) return 'bg-green-800';
    if (count <= 5) return 'bg-green-600';
    if (count <= 8) return 'bg-green-400';
    return 'bg-green-200';
  };

  const totalContributions = contributions.reduce((sum, day) => sum + day.count, 0);
  const maxContributions = Math.max(...contributions.map(day => day.count));

  if (loading) {
    return (
      <div className='card'>
        <div className='animate-pulse'>
          <div className='h-6 bg-[var(--card-border)] rounded w-1/4 mb-4'></div>
          <div className='grid grid-cols-12 gap-1'>
            {Array.from({ length: 365 }).map((_, i) => (
              <div key={i} className='w-3 h-3 bg-[var(--card-border)] rounded-sm'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className='w-full'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className='flex items-center justify-between mb-6'>
        <h2 className='section-heading'>Contribution Timeline</h2>
        <div className='flex items-center gap-4'>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className='bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] px-3 py-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
          >
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
            <option value={2022}>2022</option>
          </select>
          <div className='text-sm text-[var(--text-secondary)]'>
            {totalContributions} contributions
          </div>
        </div>
      </div>

      {/* Contribution Graph */}
      <div className='card mb-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-bold'>Activity Overview</h3>
          <div className='flex items-center gap-2 text-xs text-[var(--text-secondary)]'>
            <span>Less</span>
            <div className='flex gap-1'>
              <div className='w-3 h-3 bg-[var(--card-border)] rounded-sm'></div>
              <div className='w-3 h-3 bg-green-800 rounded-sm'></div>
              <div className='w-3 h-3 bg-green-600 rounded-sm'></div>
              <div className='w-3 h-3 bg-green-400 rounded-sm'></div>
              <div className='w-3 h-3 bg-green-200 rounded-sm'></div>
            </div>
            <span>More</span>
          </div>
        </div>

        <div className='grid grid-cols-53 gap-1'>
          {contributions.map((day, index) => (
            <motion.div
              key={day.date}
              className={`w-3 h-3 rounded-sm ${getIntensity(day.count)} cursor-pointer hover:ring-2 hover:ring-white hover:ring-opacity-50 transition-all`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.001, duration: 0.3 }}
              title={`${day.date}: ${day.count} contributions`}
            />
          ))}
        </div>

        <div className='flex justify-between mt-2 text-xs text-[var(--text-secondary)]'>
          {months.map(month => (
            <span key={month}>{month}</span>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <motion.div
          className='card text-center'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className='text-2xl font-bold text-[var(--primary)]'>{totalContributions}</div>
          <div className='text-sm text-[var(--text-secondary)]'>Total Contributions</div>
        </motion.div>

        <motion.div
          className='card text-center'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className='text-2xl font-bold text-[var(--primary)]'>
            {contributions.filter(day => day.count > 0).length}
          </div>
          <div className='text-sm text-[var(--text-secondary)]'>Active Days</div>
        </motion.div>

        <motion.div
          className='card text-center'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className='text-2xl font-bold text-[var(--primary)]'>{maxContributions}</div>
          <div className='text-sm text-[var(--text-secondary)]'>Max per Day</div>
        </motion.div>

        <motion.div
          className='card text-center'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className='text-2xl font-bold text-[var(--primary)]'>
            {Math.round((totalContributions / 365) * 10) / 10}
          </div>
          <div className='text-sm text-[var(--text-secondary)]'>Avg per Day</div>
        </motion.div>
      </div>
    </motion.div>
  );
}
