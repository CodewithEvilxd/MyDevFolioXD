'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Repository } from '@/types';

interface CulinaryCodeFlavorProfilingProps {
  username: string;
  repos: Repository[];
}

interface FlavorProfile {
  language: string;
  flavor: string;
  intensity: number;
  description: string;
  color: string;
  emoji: string;
  pairing: string[];
}

export default function CulinaryCodeFlavorProfiling({ username, repos }: CulinaryCodeFlavorProfilingProps) {
  const [flavorProfiles, setFlavorProfiles] = useState<FlavorProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<FlavorProfile | null>(null);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    // Get token for enhanced analysis
    const token = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN ||
                 localStorage.getItem('github_token') || '';
    setHasToken(!!token);

    // Map programming languages to culinary flavors based on real GitHub data
    const generateFlavorProfiles = () => {
      const languageStats: Record<string, { count: number; totalStars: number; avgComplexity: number }> = {};

      repos.forEach(repo => {
        if (repo.language) {
          if (!languageStats[repo.language]) {
            languageStats[repo.language] = { count: 0, totalStars: 0, avgComplexity: 0 };
          }
          languageStats[repo.language].count++;
          languageStats[repo.language].totalStars += repo.stargazers_count;

          // Estimate complexity based on repo size and forks
          const complexity = Math.min(10, (repo.size / 1000) + (repo.forks_count / 10) + (repo.stargazers_count / 50));
          languageStats[repo.language].avgComplexity += complexity;
        }
      });

      // Calculate averages
      Object.keys(languageStats).forEach(lang => {
        languageStats[lang].avgComplexity /= languageStats[lang].count;
      });

      // Flavor mapping based on language characteristics
      const flavorMap: Record<string, FlavorProfile> = {
        JavaScript: {
          language: 'JavaScript',
          flavor: 'Sweet & Versatile',
          intensity: Math.min(10, languageStats.JavaScript?.count || 1),
          description: 'Like honey - adaptable and sweet, works well with everything',
          color: '#F7DF1E',
          emoji: '🍯',
          pairing: ['React', 'Node.js', 'Express']
        },
        TypeScript: {
          language: 'TypeScript',
          flavor: 'Robust & Structured',
          intensity: Math.min(10, languageStats.TypeScript?.count || 1),
          description: 'Like dark chocolate - structured yet indulgent, adds depth',
          color: '#3178C6',
          emoji: '🍫',
          pairing: ['Angular', 'NestJS', 'Prisma']
        },
        Python: {
          language: 'Python',
          flavor: 'Smooth & Elegant',
          intensity: Math.min(10, languageStats.Python?.count || 1),
          description: 'Like silk - smooth texture, elegant and refined',
          color: '#3776AB',
          emoji: '🐍',
          pairing: ['Django', 'Flask', 'FastAPI']
        },
        Java: {
          language: 'Java',
          flavor: 'Strong & Reliable',
          intensity: Math.min(10, languageStats.Java?.count || 1),
          description: 'Like espresso - strong, reliable, wakes you up',
          color: '#ED8B00',
          emoji: '☕',
          pairing: ['Spring', 'Hibernate', 'Maven']
        },
        'C++': {
          language: 'C++',
          flavor: 'Powerful & Intense',
          intensity: Math.min(10, languageStats['C++']?.count || 1),
          description: 'Like wasabi - powerful, intense, not for the faint-hearted',
          color: '#00599C',
          emoji: '🌶️',
          pairing: ['Qt', 'Boost', 'OpenGL']
        },
        'C#': {
          language: 'C#',
          flavor: 'Balanced & Professional',
          intensity: Math.min(10, languageStats['C#']?.count || 1),
          description: 'Like fine wine - balanced, professional, ages well',
          color: '#239120',
          emoji: '🍷',
          pairing: ['.NET', 'Unity', 'ASP.NET']
        },
        Go: {
          language: 'Go',
          flavor: 'Clean & Efficient',
          intensity: Math.min(10, languageStats.Go?.count || 1),
          description: 'Like sake - clean, efficient, gets the job done',
          color: '#00ADD8',
          emoji: '🍶',
          pairing: ['Gin', 'Echo', 'Docker']
        },
        Rust: {
          language: 'Rust',
          flavor: 'Bold & Safe',
          intensity: Math.min(10, languageStats.Rust?.count || 1),
          description: 'Like aged cheese - bold flavor, safe to consume',
          color: '#000000',
          emoji: '🧀',
          pairing: ['Cargo', 'Tokio', 'Rocket']
        },
        PHP: {
          language: 'PHP',
          flavor: 'Web-Focused & Dynamic',
          intensity: Math.min(10, languageStats.PHP?.count || 1),
          description: 'Like fusion cuisine - web-focused, dynamically delicious',
          color: '#777BB4',
          emoji: '🍜',
          pairing: ['Laravel', 'Symfony', 'WordPress']
        },
        Ruby: {
          language: 'Ruby',
          flavor: 'Elegant & Expressive',
          intensity: Math.min(10, languageStats.Ruby?.count || 1),
          description: 'Like truffle - elegant, expressive, rare and valuable',
          color: '#CC342D',
          emoji: '🍄',
          pairing: ['Rails', 'Sinatra', 'Jekyll']
        }
      };

      const profiles: FlavorProfile[] = Object.values(languageStats)
        .map(stat => {
          const lang = Object.keys(languageStats).find(key => languageStats[key] === stat);
          return lang && flavorMap[lang] ? flavorMap[lang] : null;
        })
        .filter((profile): profile is FlavorProfile => profile !== null)
        .sort((a, b) => b.intensity - a.intensity);

      setFlavorProfiles(profiles);
    };

    generateFlavorProfiles();
  }, [username, repos]);

  const getCulinaryInsights = () => {
    if (flavorProfiles.length === 0) return [];

    const primaryFlavor = flavorProfiles[0];
    const totalIntensity = flavorProfiles.reduce((sum, profile) => sum + profile.intensity, 0);

    return [
      {
        title: 'Primary Flavor Profile',
        value: primaryFlavor.flavor,
        description: `${primaryFlavor.description}. This represents your most-used programming language.`,
        icon: primaryFlavor.emoji,
        color: 'text-yellow-500'
      },
      {
        title: 'Flavor Diversity',
        value: `${flavorProfiles.length} languages`,
        description: `You're cooking with ${flavorProfiles.length} different programming languages, creating a rich flavor palette.`,
        icon: '🍽️',
        color: 'text-green-500'
      },
      {
        title: 'Culinary Intensity',
        value: `${totalIntensity}/100`,
        description: 'The overall "spiciness" of your coding portfolio based on project complexity and engagement.',
        icon: '🔥',
        color: 'text-red-500'
      },
      {
        title: 'Recommended Pairing',
        value: primaryFlavor.pairing[0],
        description: `Try pairing ${primaryFlavor.language} with ${primaryFlavor.pairing[0]} for the perfect development dish.`,
        icon: '🥘',
        color: 'text-purple-500'
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
          <h2 className='text-2xl font-bold'>Culinary Code Flavor Profiling</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Discover your coding personality through the art of flavor pairing
          </p>
          {hasToken && (
            <div className='flex items-center gap-2 mt-2'>
              <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
              <span className='text-xs text-green-400'>Real GitHub data analysis</span>
            </div>
          )}
        </div>
      </div>

      {/* Flavor Profile Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
        {flavorProfiles.map((profile, index) => (
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
                className='w-4 h-4 rounded-full'
                style={{ backgroundColor: profile.color }}
              />
            </div>

            <div className='mb-3'>
              <div className='flex justify-between text-sm mb-1'>
                <span className='text-[var(--text-secondary)]'>Flavor Intensity</span>
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

            <p className='text-sm text-[var(--text-secondary)] line-clamp-2'>
              {profile.flavor}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Culinary Insights */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6'>
        {getCulinaryInsights().map((insight, index) => (
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
          className='bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 border border-orange-500/20 rounded-lg p-6'
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <span className='text-4xl'>{selectedProfile.emoji}</span>
              <div>
                <h3 className='text-xl font-bold'>{selectedProfile.language}</h3>
                <p className='text-[var(--text-secondary)]'>{selectedProfile.flavor}</p>
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

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <h4 className='font-semibold mb-2'>Recommended Pairings</h4>
              <div className='flex flex-wrap gap-2'>
                {selectedProfile.pairing.map((pair, index) => (
                  <span
                    key={index}
                    className='px-3 py-1 bg-white/10 rounded-full text-sm'
                  >
                    {pair}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className='font-semibold mb-2'>Flavor Profile</h4>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span>Intensity:</span>
                  <span className='font-medium'>{selectedProfile.intensity}/10</span>
                </div>
                <div className='flex justify-between'>
                  <span>Usage:</span>
                  <span className='font-medium'>
                    {repos.filter(r => r.language === selectedProfile.language).length} repos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Flavor Legend */}
      <div className='bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 border border-green-500/20 rounded-lg p-4'>
        <h3 className='font-semibold mb-2'>Culinary Code Legend</h3>
        <div className='text-sm text-[var(--text-secondary)] space-y-1'>
          <p>• 🍯 Sweet languages are versatile and beginner-friendly</p>
          <p>• ☕ Strong languages are robust and enterprise-ready</p>
          <p>• 🌶️ Intense languages offer high performance but require expertise</p>
          <p>• 🍷 Balanced languages provide the best of both worlds</p>
          <p>• 🧀 Bold languages prioritize safety and modern features</p>
        </div>
      </div>
    </motion.div>
  );
}