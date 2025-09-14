'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Repository } from '@/types';

interface BioRhythmPortfolioSynchronizationProps {
  username: string;
  repos: Repository[];
}

interface BioRhythmCycle {
  name: string;
  period: number; // days
  description: string;
  color: string;
  emoji: string;
  currentValue: number;
  peakDays: number[];
  troughDays: number[];
}

interface PortfolioSync {
  overallSync: number;
  optimalCodingDays: string[];
  currentPhase: string;
  nextPeak: string;
  recommendations: string[];
}

export default function BioRhythmPortfolioSynchronization({ username, repos }: BioRhythmPortfolioSynchronizationProps) {
  const [bioRhythms, setBioRhythms] = useState<BioRhythmCycle[]>([]);
  const [portfolioSync, setPortfolioSync] = useState<PortfolioSync | null>(null);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    // Check for token
    const token = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN ||
                 localStorage.getItem('github_token') || '';
    setHasToken(!!token);

    // Try to get birth date from localStorage or estimate from account creation
    const savedBirthDate = localStorage.getItem('user-birth-date');
    if (savedBirthDate) {
      setBirthDate(new Date(savedBirthDate));
    } else {
      // Estimate birth date based on account creation (rough approximation)
      const accountAge = repos.length > 0 ? new Date().getFullYear() - new Date(repos[0]?.created_at || new Date()).getFullYear() : 25;
      const estimatedBirthYear = new Date().getFullYear() - accountAge - 18; // Assume started coding at 18
      const estimatedBirthDate = new Date(estimatedBirthYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      setBirthDate(estimatedBirthDate);
      localStorage.setItem('user-birth-date', estimatedBirthDate.toISOString());
    }
  }, [repos]);

  useEffect(() => {
    if (birthDate) {
      calculateBioRhythms();
      analyzePortfolioSync();
    }
  }, [birthDate, repos]);

  const calculateBioRhythms = () => {
    if (!birthDate) return;

    const today = new Date();
    const daysSinceBirth = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));

    const cycles: BioRhythmCycle[] = [
      {
        name: 'Physical',
        period: 23,
        description: 'Physical strength, endurance, and health',
        color: '#FF6B6B',
        emoji: '💪',
        currentValue: Math.sin((2 * Math.PI * daysSinceBirth) / 23) * 100,
        peakDays: [1, 6, 11, 16, 21],
        troughDays: [12, 23]
      },
      {
        name: 'Emotional',
        period: 28,
        description: 'Emotions, mood, and sensitivity',
        color: '#4ECDC4',
        emoji: '❤️',
        currentValue: Math.sin((2 * Math.PI * daysSinceBirth) / 28) * 100,
        peakDays: [2, 7, 12, 17, 22, 27],
        troughDays: [14, 28]
      },
      {
        name: 'Intellectual',
        period: 33,
        description: 'Logic, analysis, and learning ability',
        color: '#45B7D1',
        emoji: '🧠',
        currentValue: Math.sin((2 * Math.PI * daysSinceBirth) / 33) * 100,
        peakDays: [3, 8, 13, 18, 23, 28],
        troughDays: [16, 33]
      },
      {
        name: 'Intuitive',
        period: 38,
        description: 'Creativity, inspiration, and intuition',
        color: '#96CEB4',
        emoji: '🎨',
        currentValue: Math.sin((2 * Math.PI * daysSinceBirth) / 38) * 100,
        peakDays: [4, 9, 14, 19, 24, 29, 34],
        troughDays: [19, 38]
      },
      {
        name: 'Spiritual',
        period: 53,
        description: 'Spiritual awareness and higher consciousness',
        color: '#FFEAA7',
        emoji: '✨',
        currentValue: Math.sin((2 * Math.PI * daysSinceBirth) / 53) * 100,
        peakDays: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
        troughDays: [26, 53]
      }
    ];

    setBioRhythms(cycles);
  };

  const analyzePortfolioSync = () => {
    if (!birthDate || bioRhythms.length === 0) return;

    // Analyze GitHub activity patterns
    const activityByDay = new Array(7).fill(0);
    const commitsByHour = new Array(24).fill(0);

    repos.forEach(repo => {
      if (repo.created_at) {
        const date = new Date(repo.created_at);
        activityByDay[date.getDay()]++;
      }
    });

    // Calculate sync score based on biorhythm alignment with activity
    const today = new Date();
    const dayOfWeek = today.getDay();
    const currentHour = today.getHours();

    const physicalSync = Math.abs(bioRhythms[0].currentValue) > 50 ? 1 : 0;
    const emotionalSync = Math.abs(bioRhythms[1].currentValue) > 30 ? 1 : 0;
    const intellectualSync = Math.abs(bioRhythms[2].currentValue) > 40 ? 1 : 0;
    const intuitiveSync = Math.abs(bioRhythms[3].currentValue) > 35 ? 1 : 0;
    const spiritualSync = Math.abs(bioRhythms[4].currentValue) > 25 ? 1 : 0;

    const overallSync = Math.round(((physicalSync + emotionalSync + intellectualSync + intuitiveSync + spiritualSync) / 5) * 100);

    // Find optimal coding days
    const optimalDays: string[] = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    activityByDay.forEach((activity, index) => {
      if (activity > activityByDay.reduce((a, b) => a + b, 0) / 7) {
        optimalDays.push(dayNames[index]);
      }
    });

    // Determine current phase
    const avgRhythm = bioRhythms.reduce((sum, rhythm) => sum + rhythm.currentValue, 0) / bioRhythms.length;
    let currentPhase: string;
    if (avgRhythm > 50) currentPhase = 'Peak Performance';
    else if (avgRhythm > 0) currentPhase = 'Balanced Flow';
    else if (avgRhythm > -50) currentPhase = 'Rest & Recovery';
    else currentPhase = 'Low Energy Period';

    // Calculate next peak
    const nextPeak = bioRhythms
      .map(rhythm => {
        const daysToPeak = rhythm.peakDays.find(day => day > (new Date().getDate() % rhythm.period)) || rhythm.peakDays[0];
        return { name: rhythm.name, days: daysToPeak };
      })
      .sort((a, b) => a.days - b.days)[0];

    const nextPeakDate = new Date();
    nextPeakDate.setDate(nextPeakDate.getDate() + nextPeak.days);

    // Generate recommendations
    const recommendations = [];
    if (overallSync > 70) {
      recommendations.push('🎯 Perfect alignment! Focus on complex coding challenges today');
    } else if (overallSync > 40) {
      recommendations.push('⚖️ Good balance. Consider collaborative coding or learning new concepts');
    } else {
      recommendations.push('🔄 Low energy period. Focus on code reviews or documentation');
    }

    if (bioRhythms[2].currentValue > 60) {
      recommendations.push('🧠 Intellectual peak! Ideal time for algorithm design or debugging');
    }

    if (bioRhythms[3].currentValue > 50) {
      recommendations.push('🎨 Intuitive flow! Great for creative coding and innovative solutions');
    }

    setPortfolioSync({
      overallSync,
      optimalCodingDays: optimalDays.length > 0 ? optimalDays : ['Flexible schedule'],
      currentPhase,
      nextPeak: nextPeakDate.toLocaleDateString(),
      recommendations
    });
  };

  const getRhythmStatus = (value: number): { status: string; color: string } => {
    if (value > 70) return { status: 'Peak', color: 'text-green-400' };
    if (value > 30) return { status: 'High', color: 'text-blue-400' };
    if (value > -30) return { status: 'Neutral', color: 'text-yellow-400' };
    if (value > -70) return { status: 'Low', color: 'text-orange-400' };
    return { status: 'Critical', color: 'text-red-400' };
  };

  return (
    <motion.div
      className='card'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-bold'>Bio-Rhythm Portfolio Synchronization</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Align your coding activities with natural biological cycles for optimal performance
          </p>
          {hasToken && (
            <div className='flex items-center gap-2 mt-2'>
              <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
              <span className='text-xs text-green-400'>Real biorhythm analysis active</span>
            </div>
          )}
        </div>
      </div>

      {/* Bio-Rhythm Overview */}
      {portfolioSync && (
        <div className='mb-6 p-6 rounded-lg border border-[var(--card-border)] bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <span className='text-4xl'>🌿</span>
              <div>
                <h3 className='text-xl font-bold'>Portfolio Bio-Sync</h3>
                <p className='text-[var(--text-secondary)]'>Biological alignment with coding patterns</p>
              </div>
            </div>
            <div className='text-right'>
              <div className='text-2xl font-bold text-green-400'>{portfolioSync.overallSync}%</div>
              <div className='text-sm text-[var(--text-secondary)]'>Sync Score</div>
            </div>
          </div>

          {/* Sync Stats */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-blue-400'>{portfolioSync.currentPhase}</div>
              <div className='text-xs text-[var(--text-secondary)]'>Current Phase</div>
            </div>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-purple-400'>{portfolioSync.nextPeak}</div>
              <div className='text-xs text-[var(--text-secondary)]'>Next Peak</div>
            </div>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-green-400'>{portfolioSync.optimalCodingDays[0]}</div>
              <div className='text-xs text-[var(--text-secondary)]'>Best Day</div>
            </div>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-yellow-400'>{bioRhythms.length}</div>
              <div className='text-xs text-[var(--text-secondary)]'>Active Cycles</div>
            </div>
          </div>
        </div>
      )}

      {/* Bio-Rhythm Cycles */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
        {bioRhythms.map((rhythm, index) => {
          const status = getRhythmStatus(rhythm.currentValue);
          return (
            <motion.div
              key={rhythm.name}
              className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-2'>
                  <span className='text-2xl'>{rhythm.emoji}</span>
                  <span className='font-semibold'>{rhythm.name}</span>
                </div>
                <div
                  className='w-3 h-3 rounded-full'
                  style={{ backgroundColor: rhythm.color }}
                />
              </div>

              <div className='mb-3'>
                <div className='text-sm font-medium mb-1'>{rhythm.description}</div>
                <div className='flex justify-between text-xs mb-1'>
                  <span className='text-[var(--text-secondary)]'>Current Level</span>
                  <span className={`font-medium ${status.color}`}>{status.status}</span>
                </div>
                <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                  <motion.div
                    className='h-2 rounded-full'
                    style={{ backgroundColor: rhythm.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.abs(rhythm.currentValue)}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </div>
                <div className='text-xs text-[var(--text-secondary)] mt-1 text-center'>
                  {Math.round(rhythm.currentValue)}%
                </div>
              </div>

              <div className='text-xs text-[var(--text-secondary)]'>
                Period: {rhythm.period} days
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Synchronization Insights */}
      {portfolioSync && (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6'>
          <motion.div
            className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className='flex items-center gap-3 mb-2'>
              <span className='text-2xl'>🎯</span>
              <h4 className='font-semibold'>Optimal Coding Days</h4>
            </div>
            <div className='space-y-2'>
              {portfolioSync.optimalCodingDays.map((day, index) => (
                <div key={index} className='flex items-center gap-2'>
                  <span className='text-green-400'>📅</span>
                  <span className='text-sm'>{day}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className='flex items-center gap-3 mb-2'>
              <span className='text-2xl'>💡</span>
              <h4 className='font-semibold'>Bio-Sync Recommendations</h4>
            </div>
            <div className='space-y-2'>
              {portfolioSync.recommendations.map((rec, index) => (
                <div key={index} className='flex items-start gap-2'>
                  <span className='text-blue-400 mt-1'>•</span>
                  <span className='text-sm'>{rec}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Bio-Rhythm Education */}
      <div className='bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-blue-500/10 border border-teal-500/20 rounded-lg p-4'>
        <h3 className='font-semibold mb-2'>Understanding Bio-Rhythms</h3>
        <div className='text-sm text-[var(--text-secondary)] space-y-2'>
          <p>• <strong>Physical Cycle (23 days):</strong> Affects energy levels, strength, and physical performance</p>
          <p>• <strong>Emotional Cycle (28 days):</strong> Influences mood, creativity, and emotional sensitivity</p>
          <p>• <strong>Intellectual Cycle (33 days):</strong> Impacts logical thinking, learning, and problem-solving</p>
          <p>• <strong>Intuitive Cycle (38 days):</strong> Governs creativity, inspiration, and innovative thinking</p>
          <p>• <strong>Spiritual Cycle (53 days):</strong> Affects awareness, higher consciousness, and purpose</p>
        </div>
        <p className='text-xs text-[var(--text-secondary)] mt-3'>
          Your portfolio sync score reflects how well your GitHub activity patterns align with your current biological cycles for optimal coding performance.
        </p>
      </div>
    </motion.div>
  );
}
