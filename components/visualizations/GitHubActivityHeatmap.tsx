'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getGitHubToken } from '@/lib/githubToken';

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface ContributionData {
  totalContributions: number;
  weeks: ContributionWeek[];
}

interface GitHubActivityHeatmapProps {
  username: string;
}

export default function GitHubActivityHeatmap({ username }: GitHubActivityHeatmapProps) {
  const [contributionData, setContributionData] = useState<ContributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState<ContributionDay | null>(null);
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchContributionData = async () => {
      try {
        setLoading(true);

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

        // Get GitHub token using the helper function
        const token = getGitHubToken();

        const headers: any = {
          'Content-Type': 'application/json',
        };

        // Add Authorization header if token exists
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        } else {
          console.warn('No GitHub token found, using public API (limited data)');
        }

        const response = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            query,
            variables: { username }
          })
        });

        if (!response.ok) {
          console.warn('GitHub API failed:', response.status);
          setError('Unable to fetch contribution data. Please ensure you have a valid GitHub token set.');
          return;
        }

        const data = await response.json();

        if (data.errors) {
          console.warn('GraphQL errors:', data.errors);
          setError('Unable to fetch contribution data. Please ensure you have a valid GitHub token set.');
          return;
        }

        const calendar = data.data?.user?.contributionsCollection?.contributionCalendar;

        if (!calendar) {
          console.warn('No contribution data found');
          setError('No contribution data available for this user/year combination.');
          return;
        }

        // Transform the data
        const transformedData: ContributionData = {
          totalContributions: calendar.totalContributions,
          weeks: calendar.weeks.map((week: any) => ({
            contributionDays: week.contributionDays.map((day: any) => ({
              date: day.date,
              count: day.contributionCount,
              level: getContributionLevel(day.contributionCount)
            }))
          }))
        };

        setContributionData(transformedData);
      } catch (err) {
        console.error('Error fetching contribution data:', err);
        setError('Failed to load contribution data. Please check your GitHub token.');
        setContributionData(null);
      } finally {
        setLoading(false);
      }
    };


    fetchContributionData();
  }, [username, selectedYear]);

  const getContributionLevel = (count: number): number => {
    if (count === 0) return 0;
    if (count <= 3) return 1;
    if (count <= 6) return 2;
    if (count <= 9) return 3;
    return 4;
  };

  const getLevelColor = (level: number): string => {
    switch (level) {
      case 0: return 'bg-gray-100 dark:bg-gray-800';
      case 1: return 'bg-green-200 dark:bg-green-900';
      case 2: return 'bg-green-300 dark:bg-green-800';
      case 3: return 'bg-green-400 dark:bg-green-700';
      case 4: return 'bg-green-500 dark:bg-green-600';
      default: return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMonthLabels = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = [];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      // Show current year (2025) data
      const year = today.getFullYear();
      const adjustedDate = new Date(year, date.getMonth(), 1);
      labels.push({
        month: months[adjustedDate.getMonth()],
        weekIndex: Math.floor((adjustedDate.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))
      });
    }

    return labels;
  };

  if (loading) {
    return (
      <div className='card'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold'>GitHub Activity Heatmap</h2>
          <div className='w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin'></div>
        </div>
        <div className='animate-pulse'>
          <div className='grid grid-cols-53 gap-1 mb-4'>
            {Array.from({ length: 371 }).map((_, i) => (
              <div key={i} className='w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-sm'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !contributionData) {
    return (
      <div className='card'>
        <h2 className='text-2xl font-bold mb-4'>GitHub Activity Heatmap</h2>
        <div className='text-center py-8'>
          <div className='w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg className='w-8 h-8 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' />
            </svg>
          </div>
          <p className='text-red-500 mb-2'>Failed to load contribution data</p>
          <p className='text-sm text-[var(--text-secondary)]'>Please try again later</p>
        </div>
      </div>
    );
  }

  const monthLabels = getMonthLabels();

  return (
    <motion.div
      className='card'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-bold'>GitHub Activity Heatmap</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            {contributionData?.totalContributions.toLocaleString()} contributions in {selectedYear}
          </p>
        </div>

        {/* Year Selector */}
        <div className='flex items-center gap-2'>
          <span className='text-sm text-[var(--text-secondary)]'>Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className='bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] px-3 py-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
          >
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
            <option value={2022}>2022</option>
            <option value={2021}>2021</option>
            <option value={2020}>2020</option>
          </select>
        </div>

        {/* Legend */}
        <div className='flex items-center gap-2 text-sm'>
          <span className='text-[var(--text-secondary)]'>Less</span>
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className={`w-3 h-3 rounded-sm ${getLevelColor(level)}`}
            />
          ))}
          <span className='text-[var(--text-secondary)]'>More</span>
        </div>
      </div>

      {/* Month Labels */}
      <div className='flex mb-2'>
        <div className='w-8'></div> {/* Space for day labels */}
        <div className='flex-1 relative'>
          {monthLabels.map((label, index) => (
            <div
              key={index}
              className='absolute text-xs text-[var(--text-secondary)] font-medium'
              style={{
                left: `${(label.weekIndex / 52) * 100}%`,
                transform: 'translateX(-50%)'
              }}
            >
              {label.month}
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className='flex'>
        {/* Day Labels */}
        <div className='flex flex-col gap-1 mr-2'>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className='w-6 h-3 text-xs text-[var(--text-secondary)] leading-3'>
              {day[0]}
            </div>
          ))}
        </div>

        {/* Contribution Grid */}
        <div className='flex gap-1 overflow-x-auto'>
          {contributionData?.weeks.slice(-52).map((week, weekIndex) => (
            <div key={weekIndex} className='flex flex-col gap-1'>
              {week.contributionDays.map((day, dayIndex) => (
                <motion.div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-[var(--primary)] hover:ring-opacity-50 ${getLevelColor(day.level)}`}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  onClick={() => setSelectedDay(day)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  title={`${day.count} contributions on ${formatDate(day.date)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {(hoveredDay || selectedDay) && (
        <motion.div
          className='mt-4 p-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-lg'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <div className='flex items-center gap-3'>
            <div className={`w-4 h-4 rounded-sm ${getLevelColor((hoveredDay || selectedDay)!.level)}`}></div>
            <div>
              <p className='font-medium'>
                {(hoveredDay || selectedDay)!.count} contributions
              </p>
              <p className='text-sm text-[var(--text-secondary)]'>
                {formatDate((hoveredDay || selectedDay)!.date)}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Statistics */}
      <div className='mt-6 grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='text-center'>
          <p className='text-2xl font-bold text-[var(--primary)]'>
            {contributionData?.totalContributions.toLocaleString()}
          </p>
          <p className='text-sm text-[var(--text-secondary)]'>Total Contributions</p>
        </div>

        <div className='text-center'>
          <p className='text-2xl font-bold text-green-500'>
            {Math.floor((contributionData?.totalContributions || 0) / 365)}
          </p>
          <p className='text-sm text-[var(--text-secondary)]'>Daily Average</p>
        </div>

        <div className='text-center'>
          <p className='text-2xl font-bold text-blue-500'>
            {contributionData?.weeks.slice(-4).reduce((total, week) =>
              total + week.contributionDays.reduce((weekTotal, day) => weekTotal + day.count, 0), 0
            )}
          </p>
          <p className='text-sm text-[var(--text-secondary)]'>Last 4 Weeks</p>
        </div>

        <div className='text-center'>
          <p className='text-2xl font-bold text-purple-500'>
            {contributionData?.weeks.reduce((max, week) =>
              Math.max(max, week.contributionDays.reduce((weekMax, day) => Math.max(weekMax, day.count), 0)), 0
            )}
          </p>
          <p className='text-sm text-[var(--text-secondary)]'>Best Day in {selectedYear}</p>
        </div>
      </div>
    </motion.div>
  );
}