'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getGitHubToken } from '@/lib/githubToken';

interface GitHubStreakCounterProps {
  username: string;
}

export default function GitHubStreakCounter({ username }: GitHubStreakCounterProps) {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateStreaks = async () => {
      try {
        // Get GitHub token
        const token = getGitHubToken();

        // GraphQL query to get contribution calendar
        const query = `
          query($username: String!) {
            user(login: $username) {
              contributionsCollection {
                contributionCalendar {
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

        const headers: any = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
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
          throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.errors) {
          throw new Error(data.errors[0].message);
        }

        const calendar = data.data?.user?.contributionsCollection?.contributionCalendar;

        if (!calendar) {
          throw new Error('No contribution data found');
        }

        // Flatten all contribution days
        const allDays: { date: string; count: number }[] = [];
        calendar.weeks.forEach((week: any) => {
          week.contributionDays.forEach((day: any) => {
            allDays.push({
              date: day.date,
              count: day.contributionCount
            });
          });
        });

        // Sort by date (most recent first)
        allDays.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Calculate streaks
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        // Check if today or yesterday has contributions for current streak
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const todayContribution = allDays.find(day => day.date === today);
        const yesterdayContribution = allDays.find(day => day.date === yesterday);

        // Current streak calculation
        if (todayContribution && todayContribution.count > 0) {
          currentStreak = 1;
          let checkDate = new Date(today);
          while (true) {
            checkDate.setDate(checkDate.getDate() - 1);
            const checkDateStr = checkDate.toISOString().split('T')[0];
            const dayData = allDays.find(day => day.date === checkDateStr);

            if (dayData && dayData.count > 0) {
              currentStreak++;
            } else {
              break;
            }
          }
        } else if (yesterdayContribution && yesterdayContribution.count > 0) {
          currentStreak = 1;
          let checkDate = new Date(yesterday);
          while (true) {
            checkDate.setDate(checkDate.getDate() - 1);
            const checkDateStr = checkDate.toISOString().split('T')[0];
            const dayData = allDays.find(day => day.date === checkDateStr);

            if (dayData && dayData.count > 0) {
              currentStreak++;
            } else {
              break;
            }
          }
        }

        // Longest streak calculation
        for (let i = 0; i < allDays.length; i++) {
          if (allDays[i].count > 0) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
          } else {
            tempStreak = 0;
          }
        }

        setCurrentStreak(currentStreak);
        setLongestStreak(longestStreak);

      } catch (error) {
        console.error('Failed to calculate streaks:', error);
        // Fallback to 0 if API fails
        setCurrentStreak(0);
        setLongestStreak(0);
      } finally {
        setLoading(false);
      }
    };

    calculateStreaks();
  }, [username]);

  if (loading) {
    return (
      <div className='card'>
        <div className='animate-pulse'>
          <div className='h-4 bg-[var(--card-border)] rounded w-3/4 mb-4'></div>
          <div className='flex gap-4'>
            <div className='h-16 bg-[var(--card-border)] rounded w-1/2'></div>
            <div className='h-16 bg-[var(--card-border)] rounded w-1/2'></div>
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
      transition={{ duration: 0.6 }}
    >
      <div className='flex items-center gap-2 mb-4'>
        <span className='text-2xl'>🔥</span>
        <h3 className='text-lg font-bold'>GitHub Streaks</h3>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <motion.div
          className='text-center p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg text-white'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className='text-3xl font-bold mb-1'>{currentStreak}</div>
          <div className='text-sm opacity-90'>Current Streak</div>
          <div className='text-xs opacity-75'>days</div>
        </motion.div>

        <motion.div
          className='text-center p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg text-white'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className='text-3xl font-bold mb-1'>{longestStreak}</div>
          <div className='text-sm opacity-90'>Longest Streak</div>
          <div className='text-xs opacity-75'>days</div>
        </motion.div>
      </div>

      <motion.div
        className='mt-4 p-3 bg-[var(--background)] rounded-lg'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className='flex items-center justify-between text-sm'>
          <span className='text-[var(--text-secondary)]'>Keep it up!</span>
          <div className='flex items-center gap-1'>
            {Array.from({ length: Math.min(currentStreak, 5) }).map((_, i) => (
              <motion.span
                key={i}
                className='text-orange-500'
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                🔥
              </motion.span>
            ))}
            {currentStreak > 5 && (
              <span className='text-xs text-[var(--text-secondary)] ml-1'>
                +{currentStreak - 5}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}