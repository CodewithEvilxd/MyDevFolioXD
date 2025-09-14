'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Repository } from '@/types';

interface DreamJournalPortfolioIntegrationProps {
  username: string;
  repos: Repository[];
}

interface DreamPattern {
  language: string;
  dreamType: string;
  symbolism: string;
  color: string;
  emoji: string;
  intensity: number;
  insights: string[];
  creativePotential: number;
}

interface DreamAnalysis {
  patterns: DreamPattern[];
  overallCreativity: number;
  dreamHarmony: number;
  subconsciousInsights: string[];
}

export default function DreamJournalPortfolioIntegration({ username, repos }: DreamJournalPortfolioIntegrationProps) {
  const [dreamAnalysis, setDreamAnalysis] = useState<DreamAnalysis | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<DreamPattern | null>(null);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    // Check for token
    const token = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN ||
                 localStorage.getItem('github_token') || '';
    setHasToken(!!token);

    // Generate dream analysis based on real GitHub data
    const generateDreamAnalysis = () => {
      const languageStats: Record<string, {
        count: number;
        totalStars: number;
        avgComplexity: number;
        recentActivity: number;
        diversity: number;
      }> = {};

      repos.forEach(repo => {
        if (repo.language) {
          if (!languageStats[repo.language]) {
            languageStats[repo.language] = {
              count: 0,
              totalStars: 0,
              avgComplexity: 0,
              recentActivity: 0,
              diversity: 0
            };
          }
          languageStats[repo.language].count++;
          languageStats[repo.language].totalStars += repo.stargazers_count;

          // Calculate complexity based on repo metrics
          const complexity = Math.min(10, (
            (repo.size / 10000) +
            (repo.forks_count / 50) +
            (repo.stargazers_count / 100) +
            (repo.topics?.length || 0) / 5
          ));
          languageStats[repo.language].avgComplexity += complexity;

          // Recent activity (last 90 days)
          const ninetyDaysAgo = new Date();
          ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
          const lastPush = new Date(repo.pushed_at);
          if (lastPush > ninetyDaysAgo) {
            languageStats[repo.language].recentActivity++;
          }

          // Topic diversity
          languageStats[repo.language].diversity += repo.topics?.length || 0;
        }
      });

      // Calculate averages
      Object.keys(languageStats).forEach(lang => {
        const stat = languageStats[lang];
        stat.avgComplexity /= stat.count;
        stat.diversity /= stat.count;
      });

      // Dream pattern mapping based on language characteristics
      const dreamPatterns: DreamPattern[] = Object.entries(languageStats)
        .map(([lang, stats]) => {
          const baseIntensity = Math.min(10, stats.count + (stats.recentActivity * 1.5));
          const creativity = Math.min(100, (stats.avgComplexity * 10) + (stats.diversity * 5));

          let dreamType: string, symbolism: string, color: string, emoji: string, insights: string[];

          switch (lang) {
            case 'JavaScript':
              dreamType = 'Flying Dreams';
              symbolism = 'Freedom and versatility in problem-solving';
              color = '#F7DF1E';
              emoji = '🦅';
              insights = ['Creative problem-solving', 'Adaptability', 'Quick learning'];
              break;
            case 'TypeScript':
              dreamType = 'Architectural Dreams';
              symbolism = 'Building strong foundations and structures';
              color = '#3178C6';
              emoji = '🏗️';
              insights = ['Systematic thinking', 'Reliability', 'Long-term planning'];
              break;
            case 'Python':
              dreamType = 'Ocean Dreams';
              symbolism = 'Deep exploration and elegant solutions';
              color = '#3776AB';
              emoji = '🌊';
              insights = ['Deep analysis', 'Elegant solutions', 'Exploratory thinking'];
              break;
            case 'Java':
              dreamType = 'Mountain Climbing Dreams';
              symbolism = 'Overcoming challenges and reaching peaks';
              color = '#ED8B00';
              emoji = '🏔️';
              insights = ['Perseverance', 'Scalability', 'Enterprise thinking'];
              break;
            case 'C++':
              dreamType = 'Labyrinth Dreams';
              symbolism = 'Complex problem navigation and optimization';
              color = '#00599C';
              emoji = '🌀';
              insights = ['Complex problem-solving', 'Performance optimization', 'Technical depth'];
              break;
            case 'C#':
              dreamType = 'Garden Dreams';
              symbolism = 'Nurturing growth and professional development';
              color = '#239120';
              emoji = '🌸';
              insights = ['Professional growth', 'Balanced development', 'Quality focus'];
              break;
            case 'Go':
              dreamType = 'River Dreams';
              symbolism = 'Smooth flow and efficient progress';
              color = '#00ADD8';
              emoji = '🌊';
              insights = ['Efficiency', 'Clean design', 'Progressive development'];
              break;
            case 'Rust':
              dreamType = 'Forge Dreams';
              symbolism = 'Crafting durable and reliable solutions';
              color = '#000000';
              emoji = '🔥';
              insights = ['Reliability', 'Performance', 'Safety consciousness'];
              break;
            default:
              dreamType = 'Abstract Dreams';
              symbolism = 'Unique and innovative thinking patterns';
              color = '#888888';
              emoji = '💭';
              insights = ['Innovation', 'Unique perspectives', 'Creative coding'];
          }

          return {
            language: lang,
            dreamType,
            symbolism,
            color,
            emoji,
            intensity: baseIntensity,
            insights,
            creativePotential: creativity
          };
        })
        .sort((a, b) => b.creativePotential - a.creativePotential);

      // Calculate overall analysis
      const overallCreativity = dreamPatterns.length > 0
        ? Math.round(dreamPatterns.reduce((sum, p) => sum + p.creativePotential, 0) / dreamPatterns.length)
        : 0;

      const dreamHarmony = Math.min(100, dreamPatterns.length * 12); // Based on dream diversity

      const subconsciousInsights = [
        `Your coding journey shows ${dreamPatterns.length} distinct creative patterns`,
        `Primary creative focus: ${dreamPatterns[0]?.dreamType || 'Diverse exploration'}`,
        `Dream harmony indicates ${dreamHarmony}% subconscious alignment`,
        `Overall creativity potential: ${overallCreativity}% of maximum capacity`
      ];

      setDreamAnalysis({
        patterns: dreamPatterns,
        overallCreativity,
        dreamHarmony,
        subconsciousInsights
      });
    };

    generateDreamAnalysis();
  }, [username, repos]);

  const getDreamInsights = () => {
    if (!dreamAnalysis) return [];

    const primaryPattern = dreamAnalysis.patterns[0];
    const totalPatterns = dreamAnalysis.patterns.length;

    return [
      {
        title: 'Dream Creativity',
        value: `${dreamAnalysis.overallCreativity}%`,
        description: 'Overall creative potential based on your coding patterns and dream symbolism',
        icon: '🎨',
        color: 'text-purple-500'
      },
      {
        title: 'Dream Harmony',
        value: `${dreamAnalysis.dreamHarmony}%`,
        description: 'How well your different coding styles work together in your subconscious',
        icon: '🌈',
        color: 'text-pink-500'
      },
      {
        title: 'Primary Dream Pattern',
        value: primaryPattern?.dreamType || 'Exploring',
        description: `Your dominant creative archetype: ${primaryPattern?.symbolism || 'Diverse exploration'}`,
        icon: primaryPattern?.emoji || '💭',
        color: 'text-blue-500'
      },
      {
        title: 'Subconscious Diversity',
        value: `${totalPatterns} patterns`,
        description: 'Number of distinct creative patterns in your coding subconscious',
        icon: '🧠',
        color: 'text-green-500'
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
          <h2 className='text-2xl font-bold'>Dream Journal Portfolio Integration</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Explore your coding creativity through dream analysis and subconscious patterns
          </p>
          {hasToken && (
            <div className='flex items-center gap-2 mt-2'>
              <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
              <span className='text-xs text-green-400'>Real GitHub data dream analysis active</span>
            </div>
          )}
        </div>
      </div>

      {/* Dream Analysis Overview */}
      {dreamAnalysis && (
        <div className='mb-6 p-6 rounded-lg border border-[var(--card-border)] bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <span className='text-4xl'>💭</span>
              <div>
                <h3 className='text-xl font-bold'>Your Coding Dreamscape</h3>
                <p className='text-[var(--text-secondary)]'>Subconscious creative patterns revealed</p>
              </div>
            </div>
            <div className='text-right'>
              <div className='text-2xl font-bold text-purple-400'>{dreamAnalysis.overallCreativity}%</div>
              <div className='text-sm text-[var(--text-secondary)]'>Creativity</div>
            </div>
          </div>

          {/* Dream Stats */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-blue-400'>{dreamAnalysis.patterns.length}</div>
              <div className='text-xs text-[var(--text-secondary)]'>Dream Patterns</div>
            </div>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-pink-400'>{dreamAnalysis.dreamHarmony}%</div>
              <div className='text-xs text-[var(--text-secondary)]'>Dream Harmony</div>
            </div>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-green-400'>
                {dreamAnalysis.patterns[0]?.creativePotential || 0}%
              </div>
              <div className='text-xs text-[var(--text-secondary)]'>Top Potential</div>
            </div>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-yellow-400'>
                {Math.round(dreamAnalysis.patterns.reduce((sum, p) => sum + p.intensity, 0) / dreamAnalysis.patterns.length) || 0}
              </div>
              <div className='text-xs text-[var(--text-secondary)]'>Avg Intensity</div>
            </div>
          </div>
        </div>
      )}

      {/* Dream Patterns Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
        {dreamAnalysis?.patterns.map((pattern, index) => (
          <motion.div
            key={pattern.language}
            className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)] cursor-pointer hover:border-[var(--primary)] transition-colors'
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedPattern(pattern)}
          >
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center gap-2'>
                <span className='text-2xl'>{pattern.emoji}</span>
                <span className='font-semibold'>{pattern.language}</span>
              </div>
              <div
                className='w-3 h-3 rounded-full'
                style={{ backgroundColor: pattern.color }}
              />
            </div>

            <div className='mb-3'>
              <div className='text-sm font-medium mb-1'>{pattern.dreamType}</div>
              <div className='flex justify-between text-xs mb-1'>
                <span className='text-[var(--text-secondary)]'>Dream Intensity</span>
                <span className='font-medium'>{pattern.intensity}/10</span>
              </div>
              <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                <div
                  className='h-2 rounded-full transition-all duration-1000'
                  style={{
                    width: `${(pattern.intensity / 10) * 100}%`,
                    backgroundColor: pattern.color
                  }}
                />
              </div>
            </div>

            <div className='mb-3'>
              <div className='text-xs font-medium mb-1'>Creative Potential</div>
              <div className='flex justify-between text-xs mb-1'>
                <span className='text-[var(--text-secondary)]'>Potential</span>
                <span className='font-medium'>{pattern.creativePotential}%</span>
              </div>
              <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1'>
                <div
                  className='h-1 rounded-full transition-all duration-1000'
                  style={{
                    width: `${pattern.creativePotential}%`,
                    backgroundColor: pattern.color
                  }}
                />
              </div>
            </div>

            <p className='text-xs text-[var(--text-secondary)] line-clamp-2'>
              {pattern.symbolism}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Dream Insights */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6'>
        {getDreamInsights().map((insight, index) => (
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

      {/* Selected Pattern Details */}
      {selectedPattern && (
        <motion.div
          className='bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 border border-purple-500/20 rounded-lg p-6'
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <span className='text-4xl'>{selectedPattern.emoji}</span>
              <div>
                <h3 className='text-xl font-bold'>{selectedPattern.language} Dream Pattern</h3>
                <p className='text-[var(--text-secondary)]'>{selectedPattern.dreamType}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedPattern(null)}
              className='text-[var(--text-secondary)] hover:text-white p-2'
            >
              ✕
            </button>
          </div>

          <p className='text-[var(--text-secondary)] mb-4'>
            <strong>Symbolism:</strong> {selectedPattern.symbolism}
          </p>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <div>
              <h4 className='font-semibold mb-2'>Subconscious Insights</h4>
              <div className='space-y-2'>
                {selectedPattern.insights.map((insight, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <span className='text-green-400'>💡</span>
                    <span className='text-sm'>{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className='font-semibold mb-2'>Dream Pattern Stats</h4>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span>Dream Intensity:</span>
                  <span className='font-medium'>{selectedPattern.intensity}/10</span>
                </div>
                <div className='flex justify-between'>
                  <span>Creative Potential:</span>
                  <span className='font-medium'>{selectedPattern.creativePotential}%</span>
                </div>
                <div className='flex justify-between'>
                  <span>Pattern Type:</span>
                  <span className='font-medium'>{selectedPattern.dreamType}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Dream Journal Guide */}
      <div className='bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-indigo-500/10 border border-purple-500/20 rounded-lg p-4'>
        <h3 className='font-semibold mb-2'>Dream Journal Integration</h3>
        <div className='text-sm text-[var(--text-secondary)] space-y-2'>
          <p>• <strong>Flying Dreams:</strong> Represent creative freedom and problem-solving versatility</p>
          <p>• <strong>Architectural Dreams:</strong> Symbolize structured thinking and reliable foundations</p>
          <p>• <strong>Ocean Dreams:</strong> Indicate deep exploration and elegant solution discovery</p>
          <p>• <strong>Mountain Dreams:</strong> Show perseverance and overcoming technical challenges</p>
          <p>• <strong>Labyrinth Dreams:</strong> Represent complex problem navigation and optimization</p>
        </div>
        <p className='text-xs text-[var(--text-secondary)] mt-3'>
          Your coding patterns create unique dream signatures that reveal your subconscious creative processes and problem-solving approaches.
        </p>
      </div>
    </motion.div>
  );
}
