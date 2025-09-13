'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Repository } from '@/types';

interface TasteBudCodeTasteProfilingProps {
  username: string;
  repos: Repository[];
}

interface TasteReceptor {
  language: string;
  primaryTaste: string;
  tasteProfile: {
    sweet: number;
    sour: number;
    salty: number;
    bitter: number;
    umami: number;
  };
  flavorNotes: string[];
  mouthfeel: string;
  aftertaste: string;
  pairing: string[];
  intensity: number;
}

interface TasteAnalysis {
  receptors: TasteReceptor[];
  dominantProfile: string;
  flavorHarmony: number;
  tasteEvolution: string[];
  recommendedPairings: string[];
}

export default function TasteBudCodeTasteProfiling({ username, repos }: TasteBudCodeTasteProfilingProps) {
  const [tasteAnalysis, setTasteAnalysis] = useState<TasteAnalysis | null>(null);
  const [selectedReceptor, setSelectedReceptor] = useState<TasteReceptor | null>(null);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    // Check for token
    const token = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN ||
                 localStorage.getItem('github_token') || '';
    setHasToken(!!token);

    // Generate taste receptor analysis based on real GitHub data
    const generateTasteAnalysis = () => {
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

          // Activity based on recent updates
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

          // Repository age in months
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

      // Taste receptor mapping based on language characteristics
      const tasteReceptors: TasteReceptor[] = Object.entries(languageStats)
        .map(([lang, stats]) => {
          const intensity = Math.min(100, (stats.avgComplexity * 10) + (stats.activity * 5) + (stats.diversity * 2));

          let primaryTaste: string, tasteProfile: any, flavorNotes: string[], mouthfeel: string, aftertaste: string, pairing: string[];

          switch (lang) {
            case 'JavaScript':
              primaryTaste = 'Sweet';
              tasteProfile = {
                sweet: 85,
                sour: 15,
                salty: 20,
                bitter: 10,
                umami: 25
              };
              flavorNotes = ['Vanilla', 'Caramel', 'Honey'];
              mouthfeel = 'Smooth and syrupy';
              aftertaste = 'Lingering sweetness';
              pairing = ['TypeScript', 'HTML', 'CSS'];
              break;
            case 'TypeScript':
              primaryTaste = 'Umami';
              tasteProfile = {
                sweet: 20,
                sour: 25,
                salty: 15,
                bitter: 30,
                umami: 80
              };
              flavorNotes = ['Soy sauce', 'Miso', 'Seaweed'];
              mouthfeel = 'Rich and savory';
              aftertaste = 'Complex depth';
              pairing = ['JavaScript', 'Node.js', 'React'];
              break;
            case 'Python':
              primaryTaste = 'Sweet';
              tasteProfile = {
                sweet: 75,
                sour: 10,
                salty: 15,
                bitter: 5,
                umami: 35
              };
              flavorNotes = ['Cream', 'Butter', 'Vanilla'];
              mouthfeel = 'Creamy and smooth';
              aftertaste = 'Clean sweetness';
              pairing = ['Django', 'Flask', 'Data Science'];
              break;
            case 'Java':
              primaryTaste = 'Salty';
              tasteProfile = {
                sweet: 15,
                sour: 20,
                salty: 80,
                bitter: 25,
                umami: 40
              };
              flavorNotes = ['Sea salt', 'Soy', 'Mineral'];
              mouthfeel = 'Crisp and structured';
              aftertaste = 'Salty mineral finish';
              pairing = ['Spring', 'Hibernate', 'Android'];
              break;
            case 'C++':
              primaryTaste = 'Bitter';
              tasteProfile = {
                sweet: 5,
                sour: 35,
                salty: 25,
                bitter: 85,
                umami: 15
              };
              flavorNotes = ['Dark chocolate', 'Coffee', 'Walnut'];
              mouthfeel = 'Tannic and structured';
              aftertaste = 'Long bitter finish';
              pairing = ['Game Development', 'Systems', 'Performance'];
              break;
            case 'C#':
              primaryTaste = 'Umami';
              tasteProfile = {
                sweet: 25,
                sour: 15,
                salty: 30,
                bitter: 20,
                umami: 70
              };
              flavorNotes = ['Beef broth', 'Mushroom', 'Truffle'];
              mouthfeel = 'Rich and meaty';
              aftertaste = 'Savory depth';
              pairing = ['.NET', 'Unity', 'Azure'];
              break;
            case 'Go':
              primaryTaste = 'Sour';
              tasteProfile = {
                sweet: 10,
                sour: 75,
                salty: 20,
                bitter: 15,
                umami: 30
              };
              flavorNotes = ['Citrus', 'Green apple', 'Vinegar'];
              mouthfeel = 'Crisp and refreshing';
              aftertaste = 'Bright acidity';
              pairing = ['Docker', 'Kubernetes', 'Cloud'];
              break;
            case 'Rust':
              primaryTaste = 'Bitter';
              tasteProfile = {
                sweet: 5,
                sour: 40,
                salty: 20,
                bitter: 80,
                umami: 10
              };
              flavorNotes = ['Dark chocolate', 'Espresso', 'Tobacco'];
              mouthfeel = 'Astringent and firm';
              aftertaste = 'Intense bitterness';
              pairing = ['Systems', 'Performance', 'Safety'];
              break;
            default:
              primaryTaste = 'Balanced';
              tasteProfile = {
                sweet: 30,
                sour: 25,
                salty: 25,
                bitter: 20,
                umami: 30
              };
              flavorNotes = ['Herbal', 'Earthy', 'Balanced'];
              mouthfeel = 'Well-rounded';
              aftertaste = 'Harmonious finish';
              pairing = ['General purpose', 'Utilities'];
          }

          return {
            language: lang,
            primaryTaste,
            tasteProfile,
            flavorNotes,
            mouthfeel,
            aftertaste,
            pairing,
            intensity
          };
        })
        .sort((a, b) => b.intensity - a.intensity);

      // Calculate overall taste analysis
      const dominantProfile = tasteReceptors.length > 0
        ? tasteReceptors[0].primaryTaste
        : 'Balanced';

      const flavorHarmony = tasteReceptors.length > 0
        ? Math.round(tasteReceptors.reduce((sum, r) => sum + r.intensity, 0) / tasteReceptors.length)
        : 0;

      const tasteEvolution = tasteReceptors.map(r => r.primaryTaste);
      const recommendedPairings = Array.from(new Set(tasteReceptors.flatMap(r => r.pairing)));

      setTasteAnalysis({
        receptors: tasteReceptors,
        dominantProfile,
        flavorHarmony,
        tasteEvolution,
        recommendedPairings
      });
    };

    generateTasteAnalysis();
  }, [username, repos]);

  const getTasteInsights = () => {
    if (!tasteAnalysis) return [];

    const dominantReceptor = tasteAnalysis.receptors[0];
    const harmonyLevel = tasteAnalysis.flavorHarmony;

    return [
      {
        title: 'Taste Harmony',
        value: `${harmonyLevel}%`,
        description: 'Overall flavor balance of your coding taste profile',
        icon: '👅',
        color: 'text-purple-500'
      },
      {
        title: 'Dominant Taste',
        value: tasteAnalysis.dominantProfile,
        description: `Your primary flavor profile: ${dominantReceptor?.primaryTaste || 'Balanced'}`,
        icon: '🎨',
        color: 'text-blue-500'
      },
      {
        title: 'Flavor Receptors',
        value: `${tasteAnalysis.receptors.length} active`,
        description: 'Number of taste receptors mapped to your coding languages',
        icon: '🧪',
        color: 'text-green-500'
      },
      {
        title: 'Taste Evolution',
        value: `${tasteAnalysis.tasteEvolution.length} profiles`,
        description: 'Diversity of taste experiences in your coding journey',
        icon: '📈',
        color: 'text-yellow-500'
      }
    ];
  };

  const getTasteColor = (taste: string): string => {
    switch (taste) {
      case 'Sweet': return '#FFD700';
      case 'Sour': return '#FF6B35';
      case 'Salty': return '#4A90E2';
      case 'Bitter': return '#8B4513';
      case 'Umami': return '#9B59B6';
      default: return '#95A5A6';
    }
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
          <h2 className='text-2xl font-bold'>Taste Bud Code Taste Profiling</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Discover your coding flavor profile through taste receptor analysis
          </p>
          {hasToken && (
            <div className='flex items-center gap-2 mt-2'>
              <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
              <span className='text-xs text-green-400'>Real GitHub data taste analysis active</span>
            </div>
          )}
        </div>
      </div>

      {/* Taste Analysis Overview */}
      {tasteAnalysis && (
        <div className='mb-6 p-6 rounded-lg border border-[var(--card-border)] bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <span className='text-4xl'>👅</span>
              <div>
                <h3 className='text-xl font-bold'>Your Taste Receptor Profile</h3>
                <p className='text-[var(--text-secondary)]'>Flavor analysis from your coding patterns</p>
              </div>
            </div>
            <div className='text-right'>
              <div className='text-2xl font-bold text-orange-400'>{tasteAnalysis.flavorHarmony}%</div>
              <div className='text-sm text-[var(--text-secondary)]'>Harmony</div>
            </div>
          </div>

          {/* Taste Stats */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-blue-400'>{tasteAnalysis.receptors.length}</div>
              <div className='text-xs text-[var(--text-secondary)]'>Receptors</div>
            </div>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-pink-400'>{tasteAnalysis.dominantProfile}</div>
              <div className='text-xs text-[var(--text-secondary)]'>Dominant</div>
            </div>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-green-400'>{tasteAnalysis.tasteEvolution.length}</div>
              <div className='text-xs text-[var(--text-secondary)]'>Evolution</div>
            </div>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-yellow-400'>{tasteAnalysis.recommendedPairings.length}</div>
              <div className='text-xs text-[var(--text-secondary)]'>Pairings</div>
            </div>
          </div>
        </div>
      )}

      {/* Taste Receptors Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
        {tasteAnalysis?.receptors.map((receptor, index) => (
          <motion.div
            key={receptor.language}
            className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)] cursor-pointer hover:border-[var(--primary)] transition-colors'
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedReceptor(receptor)}
          >
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center gap-2'>
                <span className='text-2xl'>👅</span>
                <span className='font-semibold'>{receptor.language}</span>
              </div>
              <div
                className='px-2 py-1 rounded-full text-xs font-medium'
                style={{
                  backgroundColor: getTasteColor(receptor.primaryTaste),
                  color: 'white'
                }}
              >
                {receptor.primaryTaste}
              </div>
            </div>

            <div className='mb-3'>
              <div className='text-sm font-medium mb-1'>Taste Profile</div>
              <div className='grid grid-cols-5 gap-1 text-xs'>
                {Object.entries(receptor.tasteProfile).map(([taste, value]) => (
                  <div key={taste} className='text-center'>
                    <div className='font-medium' style={{ color: getTasteColor(taste) }}>
                      {taste.charAt(0).toUpperCase()}
                    </div>
                    <div className='text-[var(--text-secondary)]'>{value}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className='mb-3'>
              <h5 className='text-xs font-medium mb-1'>Flavor Notes:</h5>
              <div className='flex flex-wrap gap-1'>
                {receptor.flavorNotes.slice(0, 2).map((note, idx) => (
                  <span
                    key={idx}
                    className='px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs'
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>

            <div className='text-xs text-[var(--text-secondary)]'>
              Intensity: {receptor.intensity}%
            </div>
          </motion.div>
        ))}
      </div>

      {/* Taste Insights */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6'>
        {getTasteInsights().map((insight, index) => (
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

      {/* Selected Receptor Details */}
      {selectedReceptor && (
        <motion.div
          className='bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 border border-orange-500/20 rounded-lg p-6'
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <span className='text-4xl'>👅</span>
              <div>
                <h3 className='text-xl font-bold'>{selectedReceptor.language} Taste Receptor</h3>
                <p className='text-[var(--text-secondary)]'>Primary Taste: {selectedReceptor.primaryTaste}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedReceptor(null)}
              className='text-[var(--text-secondary)] hover:text-white p-2'
            >
              ✕
            </button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <div>
              <h4 className='font-semibold mb-2'>Detailed Taste Profile</h4>
              <div className='space-y-2'>
                {Object.entries(selectedReceptor.tasteProfile).map(([taste, value]) => (
                  <div key={taste} className='flex items-center justify-between'>
                    <span className='text-sm' style={{ color: getTasteColor(taste) }}>
                      {taste.charAt(0).toUpperCase() + taste.slice(1)}
                    </span>
                    <div className='flex items-center gap-2'>
                      <div className='w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                        <div
                          className='h-2 rounded-full transition-all duration-1000'
                          style={{
                            width: `${value}%`,
                            backgroundColor: getTasteColor(taste)
                          }}
                        />
                      </div>
                      <span className='text-xs w-8 text-right'>{value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className='font-semibold mb-2'>Sensory Experience</h4>
              <div className='space-y-3'>
                <div>
                  <div className='text-sm font-medium text-orange-400'>Mouthfeel</div>
                  <div className='text-sm text-[var(--text-secondary)]'>{selectedReceptor.mouthfeel}</div>
                </div>
                <div>
                  <div className='text-sm font-medium text-blue-400'>Aftertaste</div>
                  <div className='text-sm text-[var(--text-secondary)]'>{selectedReceptor.aftertaste}</div>
                </div>
                <div>
                  <div className='text-sm font-medium text-green-400'>Flavor Intensity</div>
                  <div className='text-sm text-[var(--text-secondary)]'>{selectedReceptor.intensity}%</div>
                </div>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <h4 className='font-semibold mb-2'>Flavor Notes</h4>
              <div className='flex flex-wrap gap-2'>
                {selectedReceptor.flavorNotes.map((note, index) => (
                  <span
                    key={index}
                    className='px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm'
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className='font-semibold mb-2'>Recommended Pairings</h4>
              <div className='flex flex-wrap gap-2'>
                {selectedReceptor.pairing.map((pair, index) => (
                  <span
                    key={index}
                    className='px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm'
                  >
                    {pair}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Taste Bud Education */}
      <div className='bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border border-yellow-500/20 rounded-lg p-4'>
        <h3 className='font-semibold mb-2'>Understanding Taste Receptors</h3>
        <div className='text-sm text-[var(--text-secondary)] space-y-2'>
          <p>• <strong>Sweet Receptors:</strong> Associated with creativity and joyful coding experiences</p>
          <p>• <strong>Sour Receptors:</strong> Linked to analytical thinking and problem-solving</p>
          <p>• <strong>Salty Receptors:</strong> Connected to structured thinking and system design</p>
          <p>• <strong>Bitter Receptors:</strong> Related to deep technical challenges and optimization</p>
          <p>• <strong>Umami Receptors:</strong> Tied to sophisticated solutions and elegant code</p>
        </div>
        <p className='text-xs text-[var(--text-secondary)] mt-3'>
          Your taste receptor profile is calculated from real GitHub activity patterns, creating a personalized flavor map that reflects your unique coding palate and development preferences.
        </p>
      </div>
    </motion.div>
  );
}