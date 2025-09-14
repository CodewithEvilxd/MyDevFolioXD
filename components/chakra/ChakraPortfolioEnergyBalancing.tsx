'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Repository } from '@/types';

interface ChakraPortfolioEnergyBalancingProps {
  username: string;
  repos: Repository[];
}

interface ChakraCenter {
  name: string;
  sanskrit: string;
  location: string;
  color: string;
  element: string;
  function: string;
  language: string;
  energy: number;
  balance: number;
  blockages: string[];
  affirmations: string[];
  crystals: string[];
}

interface ChakraSystem {
  chakras: ChakraCenter[];
  overallBalance: number;
  dominantChakra: string;
  energyFlow: number;
  blockages: string[];
  recommendations: string[];
}

export default function ChakraPortfolioEnergyBalancing({ username, repos }: ChakraPortfolioEnergyBalancingProps) {
  const [chakraSystem, setChakraSystem] = useState<ChakraSystem | null>(null);
  const [selectedChakra, setSelectedChakra] = useState<ChakraCenter | null>(null);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    // Check for token
    const token = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN ||
                 localStorage.getItem('github_token') || '';
    setHasToken(!!token);

    // Generate chakra energy balancing based on real GitHub data
    const generateChakraSystem = () => {
      const languageStats: Record<string, {
        count: number;
        totalStars: number;
        avgComplexity: number;
        activity: number;
        diversity: number;
        age: number;
      }> = {};

      repos.forEach(repo => {
        if (repo.language) {
          if (!languageStats[repo.language]) {
            languageStats[repo.language] = {
              count: 0,
              totalStars: 0,
              avgComplexity: 0,
              activity: 0,
              diversity: 0,
              age: 0
            };
          }
          languageStats[repo.language].count++;
          languageStats[repo.language].totalStars += repo.stargazers_count;

          // Activity
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const lastPush = new Date(repo.pushed_at);
          if (lastPush > thirtyDaysAgo) {
            languageStats[repo.language].activity++;
          }

          // Complexity
          const complexity = Math.min(10, (
            (repo.size / 10000) +
            (repo.forks_count / 50) +
            (repo.stargazers_count / 100)
          ));
          languageStats[repo.language].avgComplexity += complexity;

          // Topic diversity
          languageStats[repo.language].diversity += repo.topics?.length || 0;

          // Repository age
          const created = new Date(repo.created_at);
          const now = new Date();
          const ageInMonths = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 30);
          languageStats[repo.language].age += ageInMonths;
        }
      });

      // Calculate averages
      Object.keys(languageStats).forEach(lang => {
        const stat = languageStats[lang];
        stat.avgComplexity /= stat.count;
        stat.diversity /= stat.count;
        stat.age /= stat.count;
      });

      // Chakra mapping based on language characteristics and 7 chakra system
      const chakraCenters: ChakraCenter[] = [
        {
          name: 'Root',
          sanskrit: 'Muladhara',
          location: 'Base of spine',
          color: '#FF0000',
          element: 'Earth',
          function: 'Survival, grounding, stability',
          language: Object.entries(languageStats)
            .filter(([lang, stats]) => stats.avgComplexity < 3)
            .sort(([,a], [,b]) => b.count - a.count)[0]?.[0] || 'C++',
          energy: Math.min(100, Object.values(languageStats).reduce((sum, stats) => sum + (stats.count * 10), 0) / Object.keys(languageStats).length),
          balance: 75,
          blockages: ['Fear of failure', 'Lack of foundation', 'Instability'],
          affirmations: ['I am grounded', 'I am safe', 'I trust the process'],
          crystals: ['Red Jasper', 'Hematite', 'Black Tourmaline']
        },
        {
          name: 'Sacral',
          sanskrit: 'Svadhisthana',
          location: 'Lower abdomen',
          color: '#FFA500',
          element: 'Water',
          function: 'Creativity, emotions, relationships',
          language: Object.entries(languageStats)
            .filter(([lang, stats]) => stats.diversity > 2)
            .sort(([,a], [,b]) => b.diversity - a.diversity)[0]?.[0] || 'JavaScript',
          energy: Math.min(100, Object.values(languageStats).reduce((sum, stats) => sum + (stats.diversity * 15), 0) / Object.keys(languageStats).length),
          balance: 70,
          blockages: ['Creative blocks', 'Emotional instability', 'Guilt'],
          affirmations: ['I am creative', 'I embrace change', 'I feel worthy'],
          crystals: ['Carnelian', 'Orange Calcite', 'Amber']
        },
        {
          name: 'Solar Plexus',
          sanskrit: 'Manipura',
          location: 'Upper abdomen',
          color: '#FFFF00',
          element: 'Fire',
          function: 'Personal power, confidence, will',
          language: Object.entries(languageStats)
            .filter(([lang, stats]) => stats.activity > 1)
            .sort(([,a], [,b]) => b.activity - a.activity)[0]?.[0] || 'JavaScript',
          energy: Math.min(100, Object.values(languageStats).reduce((sum, stats) => sum + (stats.activity * 20), 0) / Object.keys(languageStats).length),
          balance: 80,
          blockages: ['Low self-esteem', 'Lack of confidence', 'Control issues'],
          affirmations: ['I am powerful', 'I am confident', 'I take action'],
          crystals: ['Citrine', 'Tiger Eye', 'Pyrite']
        },
        {
          name: 'Heart',
          sanskrit: 'Anahata',
          location: 'Center of chest',
          color: '#00FF00',
          element: 'Air',
          function: 'Love, compassion, relationships',
          language: Object.entries(languageStats)
            .filter(([lang, stats]) => lang.includes('Script') || lang === 'Python')
            .sort(([,a], [,b]) => b.totalStars - a.totalStars)[0]?.[0] || 'TypeScript',
          energy: Math.min(100, Object.values(languageStats).reduce((sum, stats) => sum + (stats.totalStars / 10), 0) / Object.keys(languageStats).length),
          balance: 85,
          blockages: ['Fear of intimacy', 'Unforgiveness', 'Codependency'],
          affirmations: ['I am loved', 'I am loving', 'I forgive myself'],
          crystals: ['Rose Quartz', 'Green Aventurine', 'Rhodium']
        },
        {
          name: 'Throat',
          sanskrit: 'Vishuddha',
          location: 'Throat',
          color: '#00FFFF',
          element: 'Sound',
          function: 'Communication, self-expression, truth',
          language: Object.entries(languageStats)
            .filter(([lang, stats]) => lang === 'Python' || lang === 'Go')
            .sort(([,a], [,b]) => b.count - a.count)[0]?.[0] || 'Python',
          energy: Math.min(100, Object.values(languageStats).reduce((sum, stats) => sum + (stats.count * 12), 0) / Object.keys(languageStats).length),
          balance: 75,
          blockages: ['Fear of speaking', 'Dishonesty', 'Poor communication'],
          affirmations: ['I speak my truth', 'I express myself', 'I am heard'],
          crystals: ['Aquamarine', 'Blue Lace Agate', 'Turquoise']
        },
        {
          name: 'Third Eye',
          sanskrit: 'Ajna',
          location: 'Between eyebrows',
          color: '#0000FF',
          element: 'Light',
          function: 'Intuition, insight, spiritual awareness',
          language: Object.entries(languageStats)
            .filter(([lang, stats]) => stats.avgComplexity > 6)
            .sort(([,a], [,b]) => b.avgComplexity - a.avgComplexity)[0]?.[0] || 'TypeScript',
          energy: Math.min(100, Object.values(languageStats).reduce((sum, stats) => sum + (stats.avgComplexity * 8), 0) / Object.keys(languageStats).length),
          balance: 70,
          blockages: ['Lack of clarity', 'Overthinking', 'Spiritual disconnection'],
          affirmations: ['I see clearly', 'I trust my intuition', 'I am wise'],
          crystals: ['Amethyst', 'Lapis Lazuli', 'Fluorite']
        },
        {
          name: 'Crown',
          sanskrit: 'Sahasrara',
          location: 'Top of head',
          color: '#800080',
          element: 'Thought',
          function: 'Spiritual connection, enlightenment, consciousness',
          language: Object.entries(languageStats)
            .filter(([lang, stats]) => stats.age > 12)
            .sort(([,a], [,b]) => b.age - a.age)[0]?.[0] || 'Go',
          energy: Math.min(100, Object.values(languageStats).reduce((sum, stats) => sum + (stats.age * 5), 0) / Object.keys(languageStats).length),
          balance: 65,
          blockages: ['Spiritual disconnection', 'Material attachment', 'Limited consciousness'],
          affirmations: ['I am connected', 'I am enlightened', 'I am one with all'],
          crystals: ['Clear Quartz', 'Selenite', 'Amethyst']
        }
      ];

      // Calculate overall system
      const overallBalance = Math.round(chakraCenters.reduce((sum, chakra) => sum + chakra.balance, 0) / chakraCenters.length);
      const dominantChakra = chakraCenters.sort((a, b) => b.energy - a.energy)[0].name;
      const energyFlow = Math.min(100, chakraCenters.length * 12);
      const blockages = Array.from(new Set(chakraCenters.flatMap(c => c.blockages)));
      const recommendations = [
        'Practice daily meditation with your dominant chakra crystal',
        'Use affirmations to clear energetic blockages',
        'Balance your coding activities across different energy centers',
        'Take breaks to realign your spiritual energy',
        'Connect with nature to ground your root chakra'
      ];

      setChakraSystem({
        chakras: chakraCenters,
        overallBalance,
        dominantChakra,
        energyFlow,
        blockages,
        recommendations
      });
    };

    generateChakraSystem();
  }, [username, repos]);

  const getChakraInsights = () => {
    if (!chakraSystem) return [];

    const dominantChakra = chakraSystem.chakras.find(c => c.name === chakraSystem.dominantChakra);
    const balanceLevel = chakraSystem.overallBalance;

    return [
      {
        title: 'Chakra Balance',
        value: `${balanceLevel}%`,
        description: 'Overall alignment of your spiritual energy centers',
        icon: '🕉️',
        color: 'text-purple-500'
      },
      {
        title: 'Dominant Chakra',
        value: chakraSystem.dominantChakra,
        description: `Your primary energy center: ${dominantChakra?.function || 'Spiritual connection'}`,
        icon: '🔮',
        color: 'text-blue-500'
      },
      {
        title: 'Energy Flow',
        value: `${chakraSystem.energyFlow}%`,
        description: 'Circulation of spiritual energy through your chakra system',
        icon: '✨',
        color: 'text-green-500'
      },
      {
        title: 'Active Chakras',
        value: `${chakraSystem.chakras.length} centers`,
        description: 'Number of spiritual energy centers mapped to your coding journey',
        icon: '🌟',
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
          <h2 className='text-2xl font-bold'>Chakra Portfolio Energy Balancing</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Discover your spiritual energy alignment through chakra system analysis
          </p>
          {hasToken && (
            <div className='flex items-center gap-2 mt-2'>
              <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
              <span className='text-xs text-green-400'>Real GitHub data chakra analysis active</span>
            </div>
          )}
        </div>
      </div>

      {/* Chakra System Overview */}
      {chakraSystem && (
        <div className='mb-6 p-6 rounded-lg border border-[var(--card-border)] bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <span className='text-4xl'>🕉️</span>
              <div>
                <h3 className='text-xl font-bold'>Your Chakra Energy System</h3>
                <p className='text-[var(--text-secondary)]'>Spiritual energy centers from your coding journey</p>
              </div>
            </div>
            <div className='text-right'>
              <div className='text-2xl font-bold text-purple-400'>{chakraSystem.overallBalance}%</div>
              <div className='text-sm text-[var(--text-secondary)]'>Balance</div>
            </div>
          </div>

          {/* System Stats */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-blue-400'>{chakraSystem.chakras.length}</div>
              <div className='text-xs text-[var(--text-secondary)]'>Chakras</div>
            </div>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-pink-400'>{chakraSystem.dominantChakra}</div>
              <div className='text-xs text-[var(--text-secondary)]'>Dominant</div>
            </div>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-green-400'>{chakraSystem.energyFlow}%</div>
              <div className='text-xs text-[var(--text-secondary)]'>Energy Flow</div>
            </div>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-yellow-400'>{chakraSystem.blockages.length}</div>
              <div className='text-xs text-[var(--text-secondary)]'>Blockages</div>
            </div>
          </div>
        </div>
      )}

      {/* Chakra Centers Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6'>
        {chakraSystem?.chakras.map((chakra, index) => (
          <motion.div
            key={chakra.name}
            className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)] cursor-pointer hover:border-[var(--primary)] transition-colors'
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedChakra(chakra)}
          >
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center gap-2'>
                <span className='text-2xl'>🕉️</span>
                <span className='font-semibold'>{chakra.name}</span>
              </div>
              <div
                className='w-4 h-4 rounded-full border-2 border-white/20'
                style={{ backgroundColor: chakra.color }}
              />
            </div>

            <div className='mb-3'>
              <div className='text-sm font-medium mb-1'>{chakra.sanskrit}</div>
              <div className='text-xs text-[var(--text-secondary)] mb-2'>{chakra.location} • {chakra.element}</div>
              <div className='text-xs text-[var(--text-secondary)] mb-2'>{chakra.function}</div>
            </div>

            <div className='mb-3'>
              <div className='text-xs font-medium mb-1'>Language: {chakra.language}</div>
              <div className='flex justify-between text-xs mb-1'>
                <span className='text-[var(--text-secondary)]'>Energy Level</span>
                <span className='font-medium'>{chakra.energy}%</span>
              </div>
              <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                <div
                  className='h-2 rounded-full transition-all duration-1000'
                  style={{
                    width: `${chakra.energy}%`,
                    backgroundColor: chakra.color
                  }}
                />
              </div>
            </div>

            <div className='text-xs text-[var(--text-secondary)]'>
              Balance: {chakra.balance}%
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chakra Insights */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6'>
        {getChakraInsights().map((insight, index) => (
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

      {/* Selected Chakra Details */}
      {selectedChakra && (
        <motion.div
          className='bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 rounded-lg p-6'
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <span className='text-4xl'>🕉️</span>
              <div>
                <h3 className='text-xl font-bold'>{selectedChakra.name} Chakra ({selectedChakra.sanskrit})</h3>
                <p className='text-[var(--text-secondary)]'>{selectedChakra.location} • {selectedChakra.element} Element</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedChakra(null)}
              className='text-[var(--text-secondary)] hover:text-white p-2'
            >
              ✕
            </button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <div>
              <h4 className='font-semibold mb-2'>Chakra Function</h4>
              <p className='text-sm text-[var(--text-secondary)] mb-4'>{selectedChakra.function}</p>

              <h4 className='font-semibold mb-2'>Associated Language</h4>
              <p className='text-sm text-[var(--text-secondary)] mb-4'>{selectedChakra.language}</p>

              <h4 className='font-semibold mb-2'>Energy Metrics</h4>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>Energy Level:</span>
                  <span className='font-medium'>{selectedChakra.energy}%</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Balance:</span>
                  <span className='font-medium'>{selectedChakra.balance}%</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className='font-semibold mb-2'>Energetic Blockages</h4>
              <div className='space-y-2 mb-4'>
                {selectedChakra.blockages.map((blockage, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <span className='text-red-400'>⚠️</span>
                    <span className='text-sm text-[var(--text-secondary)]'>{blockage}</span>
                  </div>
                ))}
              </div>

              <h4 className='font-semibold mb-2'>Healing Affirmations</h4>
              <div className='space-y-2'>
                {selectedChakra.affirmations.map((affirmation, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <span className='text-green-400'>💚</span>
                    <span className='text-sm text-[var(--text-secondary)]'>"{affirmation}"</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className='font-semibold mb-2'>Supportive Crystals</h4>
            <div className='flex flex-wrap gap-2'>
              {selectedChakra.crystals.map((crystal, index) => (
                <span
                  key={index}
                  className='px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm'
                >
                  {crystal}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Chakra Balancing Guide */}
      <div className='bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 rounded-lg p-4'>
        <h3 className='font-semibold mb-2'>Understanding the Chakra System</h3>
        <div className='text-sm text-[var(--text-secondary)] space-y-2'>
          <p>• <strong>Root Chakra (Muladhara):</strong> Foundation, survival, grounding - Maps to foundational coding skills</p>
          <p>• <strong>Sacral Chakra (Svadhisthana):</strong> Creativity, emotions, relationships - Maps to creative coding approaches</p>
          <p>• <strong>Solar Plexus Chakra (Manipura):</strong> Personal power, confidence - Maps to active development and deployment</p>
          <p>• <strong>Heart Chakra (Anahata):</strong> Love, compassion - Maps to collaborative and community-focused coding</p>
          <p>• <strong>Throat Chakra (Vishuddha):</strong> Communication, truth - Maps to clear documentation and communication</p>
          <p>• <strong>Third Eye Chakra (Ajna):</strong> Intuition, insight - Maps to complex problem-solving and architecture</p>
          <p>• <strong>Crown Chakra (Sahasrara):</strong> Spiritual connection - Maps to long-term vision and enlightenment in coding</p>
        </div>
        <p className='text-xs text-[var(--text-secondary)] mt-3'>
          Your chakra alignment is calculated from real GitHub activity patterns, creating a personalized spiritual energy map that reflects your coding consciousness and development journey.
        </p>
      </div>
    </motion.div>
  );
}
