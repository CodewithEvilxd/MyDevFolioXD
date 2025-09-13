'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Repository } from '@/types';

interface CrystalEnergyPortfolioAlignmentProps {
  username: string;
  repos: Repository[];
}

interface CrystalAlignment {
  language: string;
  crystal: string;
  properties: string[];
  color: string;
  chakra: string;
  energy: number;
  alignment: number;
  benefits: string[];
}

interface EnergyField {
  crystals: CrystalAlignment[];
  overallAlignment: number;
  dominantCrystal: string;
  energyFlow: number;
  healingProperties: string[];
}

export default function CrystalEnergyPortfolioAlignment({ username, repos }: CrystalEnergyPortfolioAlignmentProps) {
  const [energyField, setEnergyField] = useState<EnergyField | null>(null);
  const [selectedCrystal, setSelectedCrystal] = useState<CrystalAlignment | null>(null);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    // Check for token
    const token = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN ||
                 localStorage.getItem('github_token') || '';
    setHasToken(!!token);

    // Generate crystal energy alignment based on real GitHub data
    const generateCrystalAlignment = () => {
      const languageStats: Record<string, {
        count: number;
        totalStars: number;
        avgComplexity: number;
        activity: number;
        diversity: number;
      }> = {};

      repos.forEach(repo => {
        if (repo.language) {
          if (!languageStats[repo.language]) {
            languageStats[repo.language] = {
              count: 0,
              totalStars: 0,
              avgComplexity: 0,
              activity: 0,
              diversity: 0
            };
          }
          languageStats[repo.language].count++;
          languageStats[repo.language].totalStars += repo.stargazers_count;

          // Calculate activity
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
        }
      });

      // Calculate averages
      Object.keys(languageStats).forEach(lang => {
        const stat = languageStats[lang];
        stat.avgComplexity /= stat.count;
        stat.diversity /= stat.count;
      });

      // Crystal mapping based on language characteristics
      const crystalAlignments: CrystalAlignment[] = Object.entries(languageStats)
        .map(([lang, stats]) => {
          const energy = Math.min(100, (stats.avgComplexity * 10) + (stats.activity * 5) + (stats.diversity * 2));
          const alignment = Math.min(100, (stats.count * 8) + (stats.totalStars / 10) + energy);

          let crystal: string, properties: string[], color: string, chakra: string, benefits: string[];

          switch (lang) {
            case 'JavaScript':
              crystal = 'Citrine';
              properties = ['Abundance', 'Manifestation', 'Personal power'];
              color = '#FFD700';
              chakra = 'Solar Plexus';
              benefits = ['Confidence boost', 'Creativity enhancement', 'Success attraction'];
              break;
            case 'TypeScript':
              crystal = 'Amethyst';
              properties = ['Spiritual protection', 'Inner peace', 'Intuition'];
              color = '#8A2BE2';
              chakra = 'Third Eye';
              benefits = ['Mental clarity', 'Stress relief', 'Spiritual growth'];
              break;
            case 'Python':
              crystal = 'Aquamarine';
              properties = ['Communication', 'Courage', 'Self-expression'];
              color = '#7FFFD4';
              chakra = 'Throat';
              benefits = ['Clear communication', 'Emotional healing', 'Inner peace'];
              break;
            case 'Java':
              crystal = 'Garnet';
              properties = ['Passion', 'Energy', 'Regeneration'];
              color = '#8B0000';
              chakra = 'Root';
              benefits = ['Grounding', 'Vitality boost', 'Passion ignition'];
              break;
            case 'C++':
              crystal = 'Black Tourmaline';
              properties = ['Protection', 'Grounding', 'Transmutation'];
              color = '#2F2F2F';
              chakra = 'Root';
              benefits = ['Negative energy protection', 'Grounding', 'Stress relief'];
              break;
            case 'C#':
              crystal = 'Rose Quartz';
              properties = ['Love', 'Compassion', 'Emotional healing'];
              color = '#FFB6C1';
              chakra = 'Heart';
              benefits = ['Self-love', 'Emotional balance', 'Relationship harmony'];
              break;
            case 'Go':
              crystal = 'Clear Quartz';
              properties = ['Amplification', 'Clarity', 'Energy direction'];
              color = '#F8F8FF';
              chakra = 'Crown';
              benefits = ['Energy amplification', 'Mental clarity', 'Spiritual connection'];
              break;
            case 'Rust':
              crystal = 'Hematite';
              properties = ['Grounding', 'Protection', 'Courage'];
              color = '#708090';
              chakra = 'Root';
              benefits = ['Grounding', 'Confidence', 'Willpower'];
              break;
            default:
              crystal = 'Moonstone';
              properties = ['Intuition', 'Emotional balance', 'New beginnings'];
              color = '#E6E6FA';
              chakra = 'Sacral';
              benefits = ['Intuition enhancement', 'Emotional balance', 'Inner growth'];
          }

          return {
            language: lang,
            crystal,
            properties,
            color,
            chakra,
            energy,
            alignment,
            benefits
          };
        })
        .sort((a, b) => b.alignment - a.alignment);

      // Calculate overall energy field
      const overallAlignment = crystalAlignments.length > 0
        ? Math.round(crystalAlignments.reduce((sum, c) => sum + c.alignment, 0) / crystalAlignments.length)
        : 0;

      const dominantCrystal = crystalAlignments[0]?.crystal || 'Clear Quartz';
      const energyFlow = Math.min(100, crystalAlignments.length * 15); // Based on crystal diversity
      const healingProperties = Array.from(new Set(crystalAlignments.flatMap(c => c.properties)));

      setEnergyField({
        crystals: crystalAlignments,
        overallAlignment,
        dominantCrystal,
        energyFlow,
        healingProperties
      });
    };

    generateCrystalAlignment();
  }, [username, repos]);

  const getEnergyInsights = () => {
    if (!energyField) return [];

    const dominantCrystal = energyField.crystals[0];
    const alignmentLevel = energyField.overallAlignment;

    return [
      {
        title: 'Crystal Alignment',
        value: `${alignmentLevel}%`,
        description: 'Overall energetic alignment of your coding crystal grid',
        icon: '💎',
        color: 'text-purple-500'
      },
      {
        title: 'Dominant Crystal',
        value: energyField.dominantCrystal,
        description: `Your primary energy crystal: ${dominantCrystal?.properties?.[0] || 'Harmonious energy'}`,
        icon: '🔮',
        color: 'text-blue-500'
      },
      {
        title: 'Energy Flow',
        value: `${energyField.energyFlow}%`,
        description: 'Crystalline energy circulation through your portfolio',
        icon: '✨',
        color: 'text-green-500'
      },
      {
        title: 'Healing Properties',
        value: `${energyField.healingProperties.length} properties`,
        description: 'Total therapeutic benefits from your crystal alignment',
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
          <h2 className='text-2xl font-bold'>Crystal Energy Portfolio Alignment</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Discover your crystal energy alignment derived from GitHub coding patterns
          </p>
          {hasToken && (
            <div className='flex items-center gap-2 mt-2'>
              <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
              <span className='text-xs text-green-400'>Real GitHub data crystal analysis active</span>
            </div>
          )}
        </div>
      </div>

      {/* Energy Field Overview */}
      {energyField && (
        <div className='mb-6 p-6 rounded-lg border border-[var(--card-border)] bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-indigo-500/10'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <span className='text-4xl'>💎</span>
              <div>
                <h3 className='text-xl font-bold'>Your Crystal Energy Grid</h3>
                <p className='text-[var(--text-secondary)]'>Energetic alignment from your coding journey</p>
              </div>
            </div>
            <div className='text-right'>
              <div className='text-2xl font-bold text-purple-400'>{energyField.overallAlignment}%</div>
              <div className='text-sm text-[var(--text-secondary)]'>Alignment</div>
            </div>
          </div>

          {/* Energy Stats */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-blue-400'>{energyField.crystals.length}</div>
              <div className='text-xs text-[var(--text-secondary)]'>Crystals</div>
            </div>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-pink-400'>{energyField.dominantCrystal}</div>
              <div className='text-xs text-[var(--text-secondary)]'>Dominant</div>
            </div>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-green-400'>{energyField.energyFlow}%</div>
              <div className='text-xs text-[var(--text-secondary)]'>Energy Flow</div>
            </div>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-yellow-400'>{energyField.healingProperties.length}</div>
              <div className='text-xs text-[var(--text-secondary)]'>Properties</div>
            </div>
          </div>
        </div>
      )}

      {/* Crystal Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
        {energyField?.crystals.map((crystal, index) => (
          <motion.div
            key={crystal.language}
            className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)] cursor-pointer hover:border-[var(--primary)] transition-colors'
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedCrystal(crystal)}
          >
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center gap-2'>
                <span className='text-2xl'>💎</span>
                <span className='font-semibold'>{crystal.language}</span>
              </div>
              <div
                className='w-4 h-4 rounded-full border-2 border-white/20'
                style={{ backgroundColor: crystal.color }}
              />
            </div>

            <div className='mb-3'>
              <div className='text-sm font-medium mb-1'>{crystal.crystal}</div>
              <div className='text-xs text-[var(--text-secondary)] mb-2'>{crystal.chakra} Chakra</div>
              <div className='flex justify-between text-xs mb-1'>
                <span className='text-[var(--text-secondary)]'>Energy Level</span>
                <span className='font-medium'>{crystal.energy}%</span>
              </div>
              <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                <div
                  className='h-2 rounded-full transition-all duration-1000'
                  style={{
                    width: `${crystal.energy}%`,
                    backgroundColor: crystal.color
                  }}
                />
              </div>
            </div>

            <div className='mb-3'>
              <h5 className='text-xs font-medium mb-1'>Crystal Properties:</h5>
              <div className='flex flex-wrap gap-1'>
                {crystal.properties.slice(0, 2).map((property, idx) => (
                  <span
                    key={idx}
                    className='px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs'
                  >
                    {property}
                  </span>
                ))}
              </div>
            </div>

            <div className='text-xs text-[var(--text-secondary)]'>
              Alignment: {crystal.alignment}%
            </div>
          </motion.div>
        ))}
      </div>

      {/* Energy Insights */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6'>
        {getEnergyInsights().map((insight, index) => (
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

      {/* Selected Crystal Details */}
      {selectedCrystal && (
        <motion.div
          className='bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 border border-purple-500/20 rounded-lg p-6'
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <span className='text-4xl'>💎</span>
              <div>
                <h3 className='text-xl font-bold'>{selectedCrystal.language} Crystal Alignment</h3>
                <p className='text-[var(--text-secondary)]'>{selectedCrystal.crystal} • {selectedCrystal.chakra} Chakra</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedCrystal(null)}
              className='text-[var(--text-secondary)] hover:text-white p-2'
            >
              ✕
            </button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <div>
              <h4 className='font-semibold mb-2'>Crystal Properties</h4>
              <div className='space-y-2'>
                {selectedCrystal.properties.map((property, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <span className='text-purple-400'>✨</span>
                    <span className='text-sm'>{property}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className='font-semibold mb-2'>Healing Benefits</h4>
              <div className='space-y-2'>
                {selectedCrystal.benefits.map((benefit, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <span className='text-green-400'>💚</span>
                    <span className='text-sm'>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-blue-400'>{selectedCrystal.energy}%</div>
              <div className='text-xs text-[var(--text-secondary)]'>Energy</div>
            </div>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-purple-400'>{selectedCrystal.alignment}%</div>
              <div className='text-xs text-[var(--text-secondary)]'>Alignment</div>
            </div>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-green-400'>{selectedCrystal.chakra}</div>
              <div className='text-xs text-[var(--text-secondary)]'>Chakra</div>
            </div>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div
                className='w-8 h-8 rounded-full mx-auto border-2 border-white/20'
                style={{ backgroundColor: selectedCrystal.color }}
              />
              <div className='text-xs text-[var(--text-secondary)]'>Color</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Crystal Healing Guide */}
      <div className='bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 rounded-lg p-4'>
        <h3 className='font-semibold mb-2'>Crystal Energy Healing</h3>
        <div className='text-sm text-[var(--text-secondary)] space-y-2'>
          <p>• <strong>Root Chakra (Red):</strong> Grounding, stability, and physical energy (Java, C++, Rust)</p>
          <p>• <strong>Sacral Chakra (Orange):</strong> Creativity, emotions, and relationships (General purpose)</p>
          <p>• <strong>Solar Plexus Chakra (Yellow):</strong> Personal power, confidence, and will (JavaScript)</p>
          <p>• <strong>Heart Chakra (Green/Pink):</strong> Love, compassion, and healing (C#)</p>
          <p>• <strong>Throat Chakra (Blue):</strong> Communication and self-expression (Python)</p>
          <p>• <strong>Third Eye Chakra (Indigo):</strong> Intuition and spiritual awareness (TypeScript)</p>
          <p>• <strong>Crown Chakra (Violet/Clear):</strong> Spiritual connection and enlightenment (Go)</p>
        </div>
        <p className='text-xs text-[var(--text-secondary)] mt-3'>
          Your crystal alignment is calculated from real GitHub activity patterns, creating a personalized energy grid that resonates with your coding energy field.
        </p>
      </div>
    </motion.div>
  );
}