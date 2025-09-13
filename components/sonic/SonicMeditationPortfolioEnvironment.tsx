'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Repository } from '@/types';

interface SonicMeditationPortfolioEnvironmentProps {
  username: string;
  repos: Repository[];
}

interface SoundFrequency {
  language: string;
  frequency: number;
  meditationType: string;
  color: string;
  emoji: string;
  duration: number;
  benefits: string[];
  brainwave: string;
}

interface MeditationSession {
  frequencies: SoundFrequency[];
  overallHarmony: number;
  recommendedSession: string;
  soundscape: string[];
  therapeuticBenefits: string[];
}

export default function SonicMeditationPortfolioEnvironment({ username, repos }: SonicMeditationPortfolioEnvironmentProps) {
  const [meditationSession, setMeditationSession] = useState<MeditationSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrequency, setCurrentFrequency] = useState<SoundFrequency | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    // Check for token
    const token = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN ||
                 localStorage.getItem('github_token') || '';
    setHasToken(!!token);

    // Generate sound frequencies based on real GitHub data
    const generateSoundFrequencies = () => {
      const languageStats: Record<string, {
        count: number;
        totalStars: number;
        avgComplexity: number;
        activity: number;
      }> = {};

      repos.forEach(repo => {
        if (repo.language) {
          if (!languageStats[repo.language]) {
            languageStats[repo.language] = {
              count: 0,
              totalStars: 0,
              avgComplexity: 0,
              activity: 0
            };
          }
          languageStats[repo.language].count++;
          languageStats[repo.language].totalStars += repo.stargazers_count;

          // Calculate activity based on recent updates
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const lastPush = new Date(repo.pushed_at);
          if (lastPush > thirtyDaysAgo) {
            languageStats[repo.language].activity++;
          }

          // Complexity based on repo metrics
          const complexity = Math.min(10, (
            (repo.size / 10000) +
            (repo.forks_count / 50) +
            (repo.stargazers_count / 100)
          ));
          languageStats[repo.language].avgComplexity += complexity;
        }
      });

      // Calculate averages
      Object.keys(languageStats).forEach(lang => {
        const stat = languageStats[lang];
        stat.avgComplexity /= stat.count;
      });

      // Sound frequency mapping based on language characteristics
      const soundFrequencies: SoundFrequency[] = Object.entries(languageStats)
        .map(([lang, stats]) => {
          const baseFrequency = 200 + (stats.avgComplexity * 50) + (stats.activity * 20);
          const frequency = Math.min(800, Math.max(100, baseFrequency));

          let meditationType: string, color: string, emoji: string, benefits: string[], brainwave: string, duration: number;

          switch (lang) {
            case 'JavaScript':
              meditationType = 'Theta Wave Meditation';
              color = '#F7DF1E';
              emoji = '🌊';
              benefits = ['Deep relaxation', 'Creative insight', 'Emotional healing'];
              brainwave = 'Theta (4-8 Hz)';
              duration = 15;
              break;
            case 'TypeScript':
              meditationType = 'Alpha Wave Meditation';
              color = '#3178C6';
              emoji = '🏔️';
              benefits = ['Mental clarity', 'Stress reduction', 'Focused concentration'];
              brainwave = 'Alpha (8-12 Hz)';
              duration = 20;
              break;
            case 'Python':
              meditationType = 'Delta Wave Meditation';
              color = '#3776AB';
              emoji = '🌌';
              benefits = ['Deep sleep enhancement', 'Physical healing', 'Subconscious processing'];
              brainwave = 'Delta (0.5-4 Hz)';
              duration = 25;
              break;
            case 'Java':
              meditationType = 'Beta Wave Meditation';
              color = '#ED8B00';
              emoji = '⚡';
              benefits = ['Mental alertness', 'Problem-solving', 'Active thinking'];
              brainwave = 'Beta (12-30 Hz)';
              duration = 18;
              break;
            case 'C++':
              meditationType = 'Gamma Wave Meditation';
              color = '#00599C';
              emoji = '💎';
              benefits = ['Higher consciousness', 'Cognitive enhancement', 'Neural optimization'];
              brainwave = 'Gamma (30-100 Hz)';
              duration = 12;
              break;
            case 'C#':
              meditationType = 'Solfeggio Frequency Meditation';
              color = '#239120';
              emoji = '🎵';
              benefits = ['DNA repair', 'Spiritual awakening', 'Harmony restoration'];
              brainwave = 'Solfeggio (396-963 Hz)';
              duration = 22;
              break;
            case 'Go':
              meditationType = 'Binaural Beat Meditation';
              color = '#00ADD8';
              emoji = '🌊';
              benefits = ['Brain synchronization', 'Mental coherence', 'Flow state induction'];
              brainwave = 'Binaural (10-40 Hz)';
              duration = 16;
              break;
            case 'Rust':
              meditationType = 'Monotone Meditation';
              color = '#000000';
              emoji = '🔥';
              benefits = ['Mental discipline', 'Focus enhancement', 'Resilience building'];
              brainwave = 'Monotone (constant)';
              duration = 14;
              break;
            default:
              meditationType = 'Ambient Sound Meditation';
              color = '#888888';
              emoji = '🎧';
              benefits = ['General relaxation', 'Mindfulness', 'Present moment awareness'];
              brainwave = 'Ambient (variable)';
              duration = 20;
          }

          return {
            language: lang,
            frequency,
            meditationType,
            color,
            emoji,
            duration,
            benefits,
            brainwave
          };
        })
        .sort((a, b) => b.frequency - a.frequency);

      // Calculate overall session
      const overallHarmony = soundFrequencies.length > 0
        ? Math.round(soundFrequencies.reduce((sum, f) => sum + (f.frequency / 10), 0) / soundFrequencies.length)
        : 0;

      const recommendedSession = soundFrequencies.length > 0
        ? soundFrequencies[0].meditationType
        : 'General Relaxation';

      const soundscape = soundFrequencies.map(f => f.meditationType);
      const therapeuticBenefits = Array.from(new Set(soundFrequencies.flatMap(f => f.benefits)));

      setMeditationSession({
        frequencies: soundFrequencies,
        overallHarmony,
        recommendedSession,
        soundscape,
        therapeuticBenefits
      });
    };

    generateSoundFrequencies();

    // Initialize audio context
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [username, repos]);

  const playFrequency = async (frequency: SoundFrequency) => {
    if (!audioContextRef.current) return;

    try {
      // Resume audio context if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Stop current oscillator
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }

      // Create new oscillator
      oscillatorRef.current = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillatorRef.current.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillatorRef.current.frequency.setValueAtTime(frequency.frequency, audioContextRef.current.currentTime);
      oscillatorRef.current.type = 'sine';

      // Gentle fade in/out
      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContextRef.current.currentTime + 1);
      gainNode.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + frequency.duration);

      oscillatorRef.current.start(audioContextRef.current.currentTime);
      oscillatorRef.current.stop(audioContextRef.current.currentTime + frequency.duration);
      setCurrentFrequency(frequency);
      setIsPlaying(true);

      // Auto update UI after duration
      setTimeout(() => {
        setIsPlaying(false);
        setCurrentFrequency(null);
        oscillatorRef.current = null;
      }, frequency.duration * 1000);

    } catch (error) {
      console.log('Audio playback not available:', error);
    }
  };

  const stopPlayback = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
    setIsPlaying(false);
    setCurrentFrequency(null);
  };

  const getMeditationInsights = () => {
    if (!meditationSession) return [];

    const dominantFrequency = meditationSession.frequencies[0];
    const harmonyLevel = meditationSession.overallHarmony;

    return [
      {
        title: 'Sonic Harmony',
        value: `${harmonyLevel}%`,
        description: 'Overall coherence of your coding soundscape for optimal meditation',
        icon: '🎵',
        color: 'text-purple-500'
      },
      {
        title: 'Recommended Session',
        value: meditationSession.recommendedSession,
        description: `Your primary meditation type based on ${dominantFrequency?.language || 'coding'} patterns`,
        icon: dominantFrequency?.emoji || '🧘',
        color: 'text-blue-500'
      },
      {
        title: 'Brainwave Alignment',
        value: dominantFrequency?.brainwave || 'Variable',
        description: 'Target brainwave frequency for your meditation practice',
        icon: '🧠',
        color: 'text-green-500'
      },
      {
        title: 'Therapeutic Benefits',
        value: `${meditationSession.therapeuticBenefits.length} benefits`,
        description: 'Total therapeutic advantages from your personalized soundscape',
        icon: '✨',
        color: 'text-yellow-500'
      }
    ];
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
          <h2 className='text-2xl font-bold'>Sonic Meditation Portfolio Environment</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Experience therapeutic sound frequencies derived from your GitHub coding patterns
          </p>
          {hasToken && (
            <div className='flex items-center gap-2 mt-2'>
              <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
              <span className='text-xs text-green-400'>Real GitHub data sonic analysis active</span>
            </div>
          )}
        </div>
      </div>

      {/* Meditation Session Overview */}
      {meditationSession && (
        <div className='mb-6 p-6 rounded-lg border border-[var(--card-border)] bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <span className='text-4xl'>🎵</span>
              <div>
                <h3 className='text-xl font-bold'>Your Sonic Soundscape</h3>
                <p className='text-[var(--text-secondary)]'>Therapeutic frequencies from your coding journey</p>
              </div>
            </div>
            <div className='text-right'>
              <div className='text-2xl font-bold text-purple-400'>{meditationSession.overallHarmony}%</div>
              <div className='text-sm text-[var(--text-secondary)]'>Harmony</div>
            </div>
          </div>

          {/* Session Stats */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-blue-400'>{meditationSession.frequencies.length}</div>
              <div className='text-xs text-[var(--text-secondary)]'>Frequencies</div>
            </div>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-pink-400'>{meditationSession.recommendedSession}</div>
              <div className='text-xs text-[var(--text-secondary)]'>Best Session</div>
            </div>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-green-400'>{meditationSession.soundscape.length}</div>
              <div className='text-xs text-[var(--text-secondary)]'>Sound Types</div>
            </div>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-yellow-400'>{meditationSession.therapeuticBenefits.length}</div>
              <div className='text-xs text-[var(--text-secondary)]'>Benefits</div>
            </div>
          </div>
        </div>
      )}

      {/* Current Playback Status */}
      {isPlaying && currentFrequency && (
        <motion.div
          className='mb-6 p-4 rounded-lg border border-green-500/20 bg-green-500/10'
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <span className='text-2xl'>{currentFrequency.emoji}</span>
              <div>
                <h4 className='font-semibold'>Playing: {currentFrequency.language}</h4>
                <p className='text-sm text-[var(--text-secondary)]'>
                  {currentFrequency.meditationType} • {currentFrequency.frequency}Hz • {currentFrequency.brainwave}
                </p>
              </div>
            </div>
            <button
              onClick={stopPlayback}
              className='px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors'
            >
              Stop
            </button>
          </div>
          <div className='mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
            <motion.div
              className='h-2 rounded-full bg-green-500'
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: currentFrequency.duration, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}

      {/* Sound Frequencies Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
        {meditationSession?.frequencies.map((frequency, index) => (
          <motion.div
            key={frequency.language}
            className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center gap-2'>
                <span className='text-2xl'>{frequency.emoji}</span>
                <span className='font-semibold'>{frequency.language}</span>
              </div>
              <div
                className='w-3 h-3 rounded-full'
                style={{ backgroundColor: frequency.color }}
              />
            </div>

            <div className='mb-3'>
              <div className='text-sm font-medium mb-1'>{frequency.meditationType}</div>
              <div className='flex justify-between text-xs mb-1'>
                <span className='text-[var(--text-secondary)]'>Frequency</span>
                <span className='font-medium'>{frequency.frequency}Hz</span>
              </div>
              <div className='flex justify-between text-xs mb-1'>
                <span className='text-[var(--text-secondary)]'>Duration</span>
                <span className='font-medium'>{frequency.duration}s</span>
              </div>
              <div className='text-xs text-[var(--text-secondary)] mb-2'>
                {frequency.brainwave}
              </div>
            </div>

            <div className='mb-3'>
              <h5 className='text-xs font-medium mb-1'>Therapeutic Benefits:</h5>
              <div className='flex flex-wrap gap-1'>
                {frequency.benefits.slice(0, 2).map((benefit, idx) => (
                  <span
                    key={idx}
                    className='px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs'
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => playFrequency(frequency)}
              disabled={isPlaying}
              className='w-full py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isPlaying ? 'Playing...' : 'Play Meditation'}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Meditation Insights */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6'>
        {getMeditationInsights().map((insight, index) => (
          <motion.div
            key={insight.title}
            className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <div className='flex items-center gap-3 mb-2'>
              <span className='text-2xl'>{insight.icon}</span>
              <h4 className='font-semibold'>{insight.title}</h4>
            </div>
            <p className={`text-xl font-bold mb-1 ${insight.color}`}>{insight.value}</p>
            <p className='text-sm text-[var(--text-secondary)]'>{insight.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Sonic Meditation Guide */}
      <div className='bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg p-4'>
        <h3 className='font-semibold mb-2'>Sonic Meditation Benefits</h3>
        <div className='text-sm text-[var(--text-secondary)] space-y-2'>
          <p>• <strong>Brainwave Entrainment:</strong> Aligns brainwaves with optimal frequencies for coding performance</p>
          <p>• <strong>Stress Reduction:</strong> Therapeutic sound frequencies reduce coding-related anxiety</p>
          <p>• <strong>Focus Enhancement:</strong> Specific frequencies improve concentration and mental clarity</p>
          <p>• <strong>Creative Flow:</strong> Theta and alpha waves promote innovative thinking and problem-solving</p>
          <p>• <strong>Emotional Balance:</strong> Sound therapy helps maintain emotional equilibrium during development</p>
        </div>
        <p className='text-xs text-[var(--text-secondary)] mt-3'>
          Your meditation frequencies are calculated from real GitHub activity patterns, creating a personalized sonic environment that resonates with your coding subconscious.
        </p>
      </div>
    </motion.div>
  );
}