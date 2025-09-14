'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createGitHubHeaders } from '@/lib/githubToken';

interface CommitData {
  date: string;
  count: number;
  hour: number;
  day: number;
  month: number;
  year: number;
}

interface TimeCrystal {
  pattern: string;
  strength: number;
  description: string;
  frequency: number;
  timeScale: string;
}

interface TimeCrystalCommitAnalysisProps {
  username: string;
}

export default function TimeCrystalCommitAnalysis({ username }: TimeCrystalCommitAnalysisProps) {
  const [commitData, setCommitData] = useState<CommitData[]>([]);
  const [timeCrystals, setTimeCrystals] = useState<TimeCrystal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrystal, setSelectedCrystal] = useState<TimeCrystal | null>(null);
  const [timeScale, setTimeScale] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    const analyzeTimeCrystals = async () => {
      if (!username) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const headers = createGitHubHeaders();

        // Fetch user events to get all commit activity
        const eventsResponse = await fetch(
          `https://api.github.com/users/${username}/events?per_page=100`,
          { headers }
        );

        if (!eventsResponse.ok) {
          setLoading(false);
          return;
        }

        const events = await eventsResponse.json();

        // Extract commits from PushEvents
        const allCommits: any[] = [];
        events.forEach((event: any) => {
          if (event.type === 'PushEvent' && event.payload.commits) {
            event.payload.commits.forEach((commit: any) => {
              if (commit.author && commit.author.name === username) { // Only commits by the user
                allCommits.push({
                  sha: commit.sha,
                  commit: {
                    author: {
                      date: event.created_at // Use event time as commit time
                    }
                  },
                  repo: event.repo.name
                });
              }
            });
          }
        });

        // Process commit data into time crystals
        const processedCommits: CommitData[] = allCommits.map(commit => {
          const date = new Date(commit.commit.author.date);
          return {
            date: commit.commit.author.date,
            count: 1,
            hour: date.getHours(),
            day: date.getDay(),
            month: date.getMonth(),
            year: date.getFullYear()
          };
        });

        // Group by date
        const dateGroups = processedCommits.reduce((acc, commit) => {
          const dateKey = new Date(commit.date).toDateString();
          acc[dateKey] = (acc[dateKey] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const finalCommitData: CommitData[] = Object.entries(dateGroups).map(([dateStr, count]) => {
          const date = new Date(dateStr);
          return {
            date: dateStr,
            count,
            hour: 12, // Average hour for daily view
            day: date.getDay(),
            month: date.getMonth(),
            year: date.getFullYear()
          };
        });

        setCommitData(finalCommitData);

        // Analyze time crystal patterns
        const crystals = analyzeTimeCrystalPatterns(finalCommitData);
        setTimeCrystals(crystals);

      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    analyzeTimeCrystals();
  }, [username]);

  const analyzeTimeCrystalPatterns = (commits: CommitData[]): TimeCrystal[] => {
    const crystals: TimeCrystal[] = [];

    // Daily patterns
    const hourlyPattern = new Array(24).fill(0);
    commits.forEach(commit => {
      const hour = new Date(commit.date).getHours();
      hourlyPattern[hour] += commit.count;
    });

    const maxHourly = Math.max(...hourlyPattern);
    const peakHour = hourlyPattern.indexOf(maxHourly);

    if (maxHourly > commits.length * 0.1) {
      crystals.push({
        pattern: 'Peak Coding Hour',
        strength: maxHourly / commits.length,
        description: `Most active at ${peakHour}:00`,
        frequency: maxHourly,
        timeScale: 'daily'
      });
    }

    // Weekly patterns
    const weeklyPattern = new Array(7).fill(0);
    commits.forEach(commit => {
      const day = new Date(commit.date).getDay();
      weeklyPattern[day] += commit.count;
    });

    const maxWeekly = Math.max(...weeklyPattern);
    const peakDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][weeklyPattern.indexOf(maxWeekly)];

    if (maxWeekly > commits.length * 0.15) {
      crystals.push({
        pattern: 'Peak Coding Day',
        strength: maxWeekly / commits.length,
        description: `${peakDay} is your most productive day`,
        frequency: maxWeekly,
        timeScale: 'weekly'
      });
    }

    // Monthly patterns
    const monthlyPattern = new Array(12).fill(0);
    commits.forEach(commit => {
      const month = new Date(commit.date).getMonth();
      monthlyPattern[month] += commit.count;
    });

    const maxMonthly = Math.max(...monthlyPattern);
    const peakMonth = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'][monthlyPattern.indexOf(maxMonthly)];

    if (maxMonthly > commits.length * 0.08) {
      crystals.push({
        pattern: 'Peak Coding Month',
        strength: maxMonthly / commits.length,
        description: `${peakMonth} shows highest activity`,
        frequency: maxMonthly,
        timeScale: 'monthly'
      });
    }

    // Consistency patterns
    const recentCommits = commits.slice(-30); // Last 30 days
    const consistentDays = recentCommits.filter(c => c.count > 0).length;
    const consistency = consistentDays / 30;

    if (consistency > 0.7) {
      crystals.push({
        pattern: 'Consistency Crystal',
        strength: consistency,
        description: `${Math.round(consistency * 100)}% consistent coding days`,
        frequency: consistentDays,
        timeScale: 'daily'
      });
    }

    // Burst patterns (high activity periods)
    const bursts = commits.filter(c => c.count >= 5).length;
    if (bursts > commits.length * 0.1) {
      crystals.push({
        pattern: 'Productivity Bursts',
        strength: bursts / commits.length,
        description: 'Frequent high-productivity periods',
        frequency: bursts,
        timeScale: 'daily'
      });
    }

    return crystals.sort((a, b) => b.strength - a.strength);
  };

  const getCrystalColor = (strength: number) => {
    if (strength > 0.8) return '#EC4899'; // Pink for very strong
    if (strength > 0.6) return '#A855F7'; // Purple for strong
    if (strength > 0.4) return '#3B82F6'; // Blue for moderate
    if (strength > 0.2) return '#10B981'; // Green for weak
    return '#6B7280'; // Gray for very weak
  };

  const getCrystalShape = (pattern: string) => {
    switch (pattern) {
      case 'Peak Coding Hour': return 'M12 2L15 8L22 8L17 13L19 20L12 16L5 20L7 13L2 8L9 8Z';
      case 'Peak Coding Day': return 'M12 2L22 8L22 18L12 22L2 18L2 8Z';
      case 'Peak Coding Month': return 'M12 2L20 6L20 16L12 20L4 16L4 6Z';
      case 'Consistency Crystal': return 'M12 2L19 7L19 17L12 22L5 17L5 7Z';
      case 'Productivity Bursts': return 'M12 2L18 6L18 14L12 18L6 14L6 6Z';
      default: return 'M12 2L20 8L16 18L8 18L4 8Z';
    }
  };

  if (loading) {
    return (
      <div className='card'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold'>Time Crystal Commit Analysis</h2>
          <div className='w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin'></div>
        </div>
        <div className='animate-pulse space-y-4'>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='h-24 bg-[var(--card-border)] rounded-lg'></div>
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
          <h2 className='text-2xl font-bold'>Time Crystal Commit Analysis</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Discover temporal patterns in your coding behavior through crystal structures
          </p>
        </div>

        <div className='flex items-center gap-4'>
          <div className='text-sm text-[var(--text-secondary)]'>
            {timeCrystals.length} time crystals found
          </div>
          <select
            value={timeScale}
            onChange={(e) => setTimeScale(e.target.value as any)}
            className='bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] px-3 py-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
          >
            <option value='daily'>Daily View</option>
            <option value='weekly'>Weekly View</option>
            <option value='monthly'>Monthly View</option>
          </select>
        </div>
      </div>

      {/* Time Crystal Grid */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6'>
        {timeCrystals.map((crystal, index) => (
          <motion.div
            key={crystal.pattern}
            className={`relative p-4 rounded-lg border cursor-pointer transition-all ${
              selectedCrystal?.pattern === crystal.pattern
                ? 'border-[var(--primary)] bg-[var(--primary)] bg-opacity-5'
                : 'border-[var(--card-border)] hover:border-[var(--primary)] hover:border-opacity-50'
            }`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            onClick={() => setSelectedCrystal(crystal)}
            whileHover={{ scale: 1.05 }}
          >
            {/* Crystal Shape */}
            <div className='flex justify-center mb-3'>
              <svg
                width='40'
                height='40'
                viewBox='0 0 24 24'
                className='drop-shadow-lg'
                style={{ filter: `drop-shadow(0 0 8px ${getCrystalColor(crystal.strength)})` }}
              >
                <path
                  d={getCrystalShape(crystal.pattern)}
                  fill={getCrystalColor(crystal.strength)}
                  opacity='0.8'
                />
                <path
                  d={getCrystalShape(crystal.pattern)}
                  fill='none'
                  stroke={getCrystalColor(crystal.strength)}
                  strokeWidth='0.5'
                  opacity='0.6'
                />
              </svg>
            </div>

            <h3 className='font-bold text-sm text-center mb-1'>{crystal.pattern}</h3>
            <p className='text-xs text-[var(--text-secondary)] text-center mb-2'>
              {crystal.description}
            </p>

            {/* Strength Indicator */}
            <div className='w-full bg-[var(--card-border)] rounded-full h-1 mb-2'>
              <motion.div
                className='h-1 rounded-full'
                style={{ backgroundColor: getCrystalColor(crystal.strength), width: `${crystal.strength * 100}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${crystal.strength * 100}%` }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
              />
            </div>

            <div className='text-xs text-center text-[var(--text-secondary)]'>
              Strength: {Math.round(crystal.strength * 100)}%
            </div>
          </motion.div>
        ))}
      </div>

      {/* Crystal Detail View */}
      {selectedCrystal && (
        <motion.div
          className='mt-6 p-6 bg-gradient-to-br from-slate-900/50 to-purple-900/50 rounded-lg border border-purple-500/20'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-4'>
              <svg
                width='48'
                height='48'
                viewBox='0 0 24 24'
                className='drop-shadow-lg'
                style={{ filter: `drop-shadow(0 0 12px ${getCrystalColor(selectedCrystal.strength)})` }}
              >
                <path
                  d={getCrystalShape(selectedCrystal.pattern)}
                  fill={getCrystalColor(selectedCrystal.strength)}
                  opacity='0.9'
                />
                <path
                  d={getCrystalShape(selectedCrystal.pattern)}
                  fill='none'
                  stroke={getCrystalColor(selectedCrystal.strength)}
                  strokeWidth='0.5'
                  opacity='0.7'
                />
              </svg>
              <div>
                <h3 className='text-xl font-bold'>{selectedCrystal.pattern}</h3>
                <p className='text-[var(--text-secondary)]'>{selectedCrystal.description}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedCrystal(null)}
              className='text-[var(--text-secondary)] hover:text-white'
            >
              ✕
            </button>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
              <div className='text-2xl font-bold' style={{ color: getCrystalColor(selectedCrystal.strength) }}>
                {Math.round(selectedCrystal.strength * 100)}%
              </div>
              <div className='text-sm text-[var(--text-secondary)]'>Crystal Strength</div>
            </div>

            <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
              <div className='text-2xl font-bold text-[var(--primary)]'>
                {selectedCrystal.frequency}
              </div>
              <div className='text-sm text-[var(--text-secondary)]'>Frequency</div>
            </div>

            <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
              <div className='text-lg font-bold text-[var(--primary)] capitalize'>
                {selectedCrystal.timeScale}
              </div>
              <div className='text-sm text-[var(--text-secondary)]'>Time Scale</div>
            </div>

            <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
              <div className='text-lg font-bold text-green-500'>
                {timeCrystals.indexOf(selectedCrystal) + 1}
              </div>
              <div className='text-sm text-[var(--text-secondary)]'>Rank</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Temporal Visualization */}
      <div className='mt-6 p-4 bg-[var(--background)] rounded-lg border border-[var(--card-border)]'>
        <h3 className='text-lg font-semibold mb-4'>Temporal Activity Patterns</h3>
        <div className='grid grid-cols-7 gap-1'>
          {Array.from({ length: 7 }).map((_, dayIndex) => {
            const dayCommits = commitData.filter(c => new Date(c.date).getDay() === dayIndex);
            const avgCommits = dayCommits.length > 0 ? dayCommits.reduce((sum, c) => sum + c.count, 0) / dayCommits.length : 0;
            const intensity = Math.min(avgCommits / 5, 1); // Normalize

            return (
              <motion.div
                key={dayIndex}
                className='aspect-square rounded'
                style={{
                  backgroundColor: intensity > 0 ? `rgba(168, 85, 247, ${intensity * 0.8})` : 'var(--card-border)',
                  border: intensity > 0.5 ? '1px solid rgba(168, 85, 247, 0.5)' : 'none'
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: dayIndex * 0.05, duration: 0.3 }}
                title={`Day ${dayIndex}: ${avgCommits.toFixed(1)} avg commits`}
              />
            );
          })}
        </div>
        <div className='flex justify-between mt-2 text-xs text-[var(--text-secondary)]'>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </div>
    </motion.div>
  );
}
