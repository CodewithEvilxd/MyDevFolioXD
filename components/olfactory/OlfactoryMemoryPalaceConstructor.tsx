'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Repository } from '@/types';

interface OlfactoryMemoryPalaceConstructorProps {
  username: string;
  repos: Repository[];
}

interface ScentProfile {
  language: string;
  scent: string;
  memoryTrigger: string;
  color: string;
  emoji: string;
  intensity: number;
  description: string;
  benefits: string[];
}

interface MemoryPalace {
  rooms: MemoryRoom[];
  totalMemories: number;
  scentHarmony: number;
}

interface MemoryRoom {
  name: string;
  scent: string;
  repositories: Repository[];
  memoryStrength: number;
  color: string;
}

export default function OlfactoryMemoryPalaceConstructor({ username, repos }: OlfactoryMemoryPalaceConstructorProps) {
  const [scentProfiles, setScentProfiles] = useState<ScentProfile[]>([]);
  const [memoryPalace, setMemoryPalace] = useState<MemoryPalace | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<ScentProfile | null>(null);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    // Check for token
    const token = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN ||
                 localStorage.getItem('github_token') || '';
    setHasToken(!!token);

    // Generate scent profiles based on real GitHub data
    const generateScentProfiles = () => {
      const languageStats: Record<string, { count: number; totalStars: number; recentActivity: number }> = {};

      repos.forEach(repo => {
        if (repo.language) {
          if (!languageStats[repo.language]) {
            languageStats[repo.language] = { count: 0, totalStars: 0, recentActivity: 0 };
          }
          languageStats[repo.language].count++;
          languageStats[repo.language].totalStars += repo.stargazers_count;

          // Calculate recent activity (last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const lastPush = new Date(repo.pushed_at);
          if (lastPush > thirtyDaysAgo) {
            languageStats[repo.language].recentActivity++;
          }
        }
      });

      // Scent mapping based on language characteristics
      const scentMap: Record<string, Omit<ScentProfile, 'intensity'>> = {
        JavaScript: {
          language: 'JavaScript',
          scent: 'Fresh Citrus & Mint',
          memoryTrigger: 'Energizing and refreshing, perfect for quick recall',
          color: '#F7DF1E',
          emoji: '🍊',
          description: 'Citrus awakens the mind, mint enhances focus and memory retention',
          benefits: ['Improved concentration', 'Enhanced memory recall', 'Mental clarity']
        },
        TypeScript: {
          language: 'TypeScript',
          scent: 'Earthy Sage & Cedar',
          memoryTrigger: 'Grounding and structured, aids in systematic thinking',
          color: '#3178C6',
          emoji: '🌿',
          description: 'Sage promotes wisdom, cedar provides stability and mental structure',
          benefits: ['Logical thinking enhancement', 'Stress reduction', 'Mental stability']
        },
        Python: {
          language: 'Python',
          scent: 'Clean Ocean Breeze',
          memoryTrigger: 'Calming and clear, promotes elegant problem-solving',
          color: '#3776AB',
          emoji: '🌊',
          description: 'Ocean air is pure and expansive, mirroring Python\'s clean syntax',
          benefits: ['Mental clarity', 'Creative problem-solving', 'Emotional balance']
        },
        Java: {
          language: 'Java',
          scent: 'Rich Coffee & Dark Chocolate',
          memoryTrigger: 'Strong and reliable, boosts sustained mental performance',
          color: '#ED8B00',
          emoji: '☕',
          description: 'Coffee stimulates alertness, chocolate provides sustained energy',
          benefits: ['Increased alertness', 'Sustained concentration', 'Mood enhancement']
        },
        'C++': {
          language: 'C++',
          scent: 'Spicy Cinnamon & Clove',
          memoryTrigger: 'Intense and powerful, sharpens mental acuity',
          color: '#00599C',
          emoji: '🌶️',
          description: 'Spices stimulate brain activity and enhance cognitive performance',
          benefits: ['Enhanced cognitive function', 'Improved memory', 'Mental stimulation']
        },
        'C#': {
          language: 'C#',
          scent: 'Balanced Lavender & Chamomile',
          memoryTrigger: 'Harmonious and professional, promotes balanced thinking',
          color: '#239120',
          emoji: '💜',
          description: 'Lavender calms the mind, chamomile promotes balanced focus',
          benefits: ['Reduced anxiety', 'Balanced concentration', 'Professional calm']
        },
        Go: {
          language: 'Go',
          scent: 'Crisp Green Tea & Bamboo',
          memoryTrigger: 'Efficient and clean, optimizes mental processing',
          color: '#00ADD8',
          emoji: '🍵',
          description: 'Green tea enhances mental efficiency, bamboo represents simplicity',
          benefits: ['Mental efficiency', 'Stress relief', 'Cognitive optimization']
        },
        Rust: {
          language: 'Rust',
          scent: 'Robust Leather & Oak',
          memoryTrigger: 'Strong and durable, builds reliable memory foundations',
          color: '#000000',
          emoji: '🛡️',
          description: 'Leather suggests durability, oak represents strength and reliability',
          benefits: ['Mental resilience', 'Reliable memory', 'Confidence building']
        }
      };

      const profiles: ScentProfile[] = Object.values(languageStats)
        .map(stat => {
          const lang = Object.keys(languageStats).find(key => languageStats[key] === stat);
          if (lang && scentMap[lang]) {
            return {
              ...scentMap[lang],
              intensity: Math.min(10, Math.max(1, stat.count + (stat.recentActivity * 2)))
            };
          }
          return null;
        })
        .filter((profile): profile is ScentProfile => profile !== null)
        .sort((a, b) => b.intensity - a.intensity);

      setScentProfiles(profiles);
      generateMemoryPalace(profiles, repos);
    };

    generateScentProfiles();
  }, [username, repos]);

  const generateMemoryPalace = (profiles: ScentProfile[], allRepos: Repository[]) => {
    const rooms: MemoryRoom[] = profiles.map(profile => {
      const roomRepos = allRepos.filter(repo => repo.language === profile.language);
      const memoryStrength = Math.min(100, (roomRepos.length * 10) + (profile.intensity * 5));

      return {
        name: `${profile.language} Chamber`,
        scent: profile.scent,
        repositories: roomRepos,
        memoryStrength,
        color: profile.color
      };
    });

    const totalMemories = rooms.reduce((sum, room) => sum + room.repositories.length, 0);
    const scentHarmony = Math.min(100, profiles.length * 15); // Harmony based on scent diversity

    setMemoryPalace({
      rooms,
      totalMemories,
      scentHarmony
    });
  };

  const getMemoryInsights = () => {
    if (!memoryPalace) return [];

    const strongestRoom = memoryPalace.rooms.reduce((prev, current) =>
      prev.memoryStrength > current.memoryStrength ? prev : current
    );

    return [
      {
        title: 'Memory Palace Strength',
        value: `${memoryPalace.totalMemories} memories`,
        description: 'Total repositories stored in your olfactory memory palace',
        icon: '🏛️',
        color: 'text-purple-500'
      },
      {
        title: 'Scent Harmony',
        value: `${memoryPalace.scentHarmony}%`,
        description: 'How well your coding scents work together for optimal recall',
        icon: '🌸',
        color: 'text-pink-500'
      },
      {
        title: 'Strongest Memory Chamber',
        value: strongestRoom.name,
        description: `Your ${strongestRoom.scent.toLowerCase()} chamber with ${strongestRoom.memoryStrength}% retention`,
        icon: '💪',
        color: 'text-green-500'
      },
      {
        title: 'Olfactory Intelligence',
        value: `${Math.round((scentProfiles.length / 8) * 100)}%`,
        description: 'Diversity of scents enhancing your memory palace effectiveness',
        icon: '🧠',
        color: 'text-blue-500'
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
          <h2 className='text-2xl font-bold'>Olfactory Memory Palace Constructor</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Build mental palaces enhanced by scent associations from your GitHub journey
          </p>
          {hasToken && (
            <div className='flex items-center gap-2 mt-2'>
              <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
              <span className='text-xs text-green-400'>Real GitHub data analysis active</span>
            </div>
          )}
        </div>
      </div>

      {/* Memory Palace Overview */}
      {memoryPalace && (
        <div className='mb-6 p-6 rounded-lg border border-[var(--card-border)] bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <span className='text-4xl'>🏛️</span>
              <div>
                <h3 className='text-xl font-bold'>Your Memory Palace</h3>
                <p className='text-[var(--text-secondary)]'>Olfactory-enhanced mental architecture</p>
              </div>
            </div>
            <div className='text-right'>
              <div className='text-2xl font-bold text-purple-400'>{memoryPalace.rooms.length}</div>
              <div className='text-sm text-[var(--text-secondary)]'>Memory Chambers</div>
            </div>
          </div>

          {/* Palace Stats */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-blue-400'>{memoryPalace.totalMemories}</div>
              <div className='text-xs text-[var(--text-secondary)]'>Total Memories</div>
            </div>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-pink-400'>{memoryPalace.scentHarmony}%</div>
              <div className='text-xs text-[var(--text-secondary)]'>Scent Harmony</div>
            </div>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-green-400'>{scentProfiles.length}</div>
              <div className='text-xs text-[var(--text-secondary)]'>Scent Profiles</div>
            </div>
            <div className='text-center p-3 bg-white/5 rounded-lg'>
              <div className='text-lg font-bold text-yellow-400'>
                {Math.round(scentProfiles.reduce((sum, p) => sum + p.intensity, 0) / scentProfiles.length) || 0}
              </div>
              <div className='text-xs text-[var(--text-secondary)]'>Avg Intensity</div>
            </div>
          </div>
        </div>
      )}

      {/* Scent Profile Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
        {scentProfiles.map((profile, index) => (
          <motion.div
            key={profile.language}
            className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)] cursor-pointer hover:border-[var(--primary)] transition-colors'
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedProfile(profile)}
          >
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center gap-2'>
                <span className='text-2xl'>{profile.emoji}</span>
                <span className='font-semibold'>{profile.language}</span>
              </div>
              <div
                className='w-3 h-3 rounded-full'
                style={{ backgroundColor: profile.color }}
              />
            </div>

            <div className='mb-3'>
              <div className='text-sm font-medium mb-1'>{profile.scent}</div>
              <div className='flex justify-between text-xs mb-1'>
                <span className='text-[var(--text-secondary)]'>Scent Intensity</span>
                <span className='font-medium'>{profile.intensity}/10</span>
              </div>
              <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                <div
                  className='h-2 rounded-full transition-all duration-1000'
                  style={{
                    width: `${(profile.intensity / 10) * 100}%`,
                    backgroundColor: profile.color
                  }}
                />
              </div>
            </div>

            <p className='text-xs text-[var(--text-secondary)] line-clamp-2'>
              {profile.memoryTrigger}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Memory Insights */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6'>
        {getMemoryInsights().map((insight, index) => (
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

      {/* Selected Profile Details */}
      {selectedProfile && (
        <motion.div
          className='bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 rounded-lg p-6'
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <span className='text-4xl'>{selectedProfile.emoji}</span>
              <div>
                <h3 className='text-xl font-bold'>{selectedProfile.language} Memory Chamber</h3>
                <p className='text-[var(--text-secondary)]'>{selectedProfile.scent}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedProfile(null)}
              className='text-[var(--text-secondary)] hover:text-white p-2'
            >
              ✕
            </button>
          </div>

          <p className='text-[var(--text-secondary)] mb-4'>
            {selectedProfile.description}
          </p>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <div>
              <h4 className='font-semibold mb-2'>Memory Benefits</h4>
              <div className='space-y-2'>
                {selectedProfile.benefits.map((benefit, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <span className='text-green-400'>✓</span>
                    <span className='text-sm'>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className='font-semibold mb-2'>Chamber Statistics</h4>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span>Scent Intensity:</span>
                  <span className='font-medium'>{selectedProfile.intensity}/10</span>
                </div>
                <div className='flex justify-between'>
                  <span>Repositories:</span>
                  <span className='font-medium'>
                    {repos.filter(r => r.language === selectedProfile.language).length}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Memory Trigger:</span>
                  <span className='font-medium text-xs'>{selectedProfile.memoryTrigger}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Olfactory Learning Guide */}
      <div className='bg-gradient-to-r from-green-500/10 via-teal-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4'>
        <h3 className='font-semibold mb-2'>Olfactory Memory Enhancement</h3>
        <div className='text-sm text-[var(--text-secondary)] space-y-2'>
          <p>• <strong>Citrus Scents:</strong> Boost alertness and concentration (JavaScript, fresh projects)</p>
          <p>• <strong>Earthy Aromas:</strong> Ground thinking and reduce stress (TypeScript, structured code)</p>
          <p>• <strong>Spicy Notes:</strong> Enhance cognitive function (C++, complex algorithms)</p>
          <p>• <strong>Herbal Blends:</strong> Promote balanced focus (C#, professional development)</p>
          <p>• <strong>Memory Palace:</strong> Associate each programming language with a unique scent for enhanced recall</p>
        </div>
      </div>
    </motion.div>
  );
}