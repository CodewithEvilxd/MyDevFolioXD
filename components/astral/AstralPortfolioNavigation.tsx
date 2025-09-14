'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Repository } from '../../types';

interface AstralPortfolioNavigationProps {
  username: string;
  repos: Repository[];
}

interface CelestialBody {
  name: string;
  type: 'star' | 'planet' | 'constellation';
  x: number;
  y: number;
  size: number;
  brightness: number;
  color: string;
  represents: string;
}

export default function AstralPortfolioNavigation({ username, repos }: AstralPortfolioNavigationProps) {
  const [celestialBodies, setCelestialBodies] = useState<CelestialBody[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedBody, setSelectedBody] = useState<CelestialBody | null>(null);

  useEffect(() => {
    // Generate celestial bodies based on real GitHub data
    const generateCelestialMap = () => {
      const bodies: CelestialBody[] = [];

      // Map programming languages to planets
      const languageStats: Record<string, number> = {};
      repos.forEach(repo => {
        if (repo.language) {
          languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
        }
      });

      const planetColors: Record<string, string> = {
        JavaScript: '#F7DF1E',
        TypeScript: '#3178C6',
        Python: '#3776AB',
        Java: '#ED8B00',
        'C++': '#00599C',
        'C#': '#239120',
        PHP: '#777BB4',
        Ruby: '#CC342D',
        Go: '#00ADD8',
        Rust: '#000000',
        Swift: '#FA7343',
        Kotlin: '#7F52FF'
      };

      // Create planets from languages
      Object.entries(languageStats).forEach(([lang, count], index) => {
        const angle = (index / Object.keys(languageStats).length) * 2 * Math.PI;
        const distance = 150 + (count * 20);
        bodies.push({
          name: lang,
          type: 'planet',
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          size: Math.max(8, Math.min(25, count * 3)),
          brightness: Math.min(1, count / 10),
          color: planetColors[lang] || '#888888',
          represents: `${count} repositories`
        });
      });

      // Create constellations from repository stars/forks
      const topRepos = repos
        .sort((a, b) => (b.stargazers_count + b.forks_count) - (a.stargazers_count + a.forks_count))
        .slice(0, 7);

      topRepos.forEach((repo, index) => {
        const angle = (index / 7) * 2 * Math.PI;
        const distance = 300;
        const totalEngagement = repo.stargazers_count + repo.forks_count;

        bodies.push({
          name: repo.name.length > 15 ? repo.name.substring(0, 12) + '...' : repo.name,
          type: 'star',
          x: Math.cos(angle) * distance + (Math.random() - 0.5) * 100,
          y: Math.sin(angle) * distance + (Math.random() - 0.5) * 100,
          size: Math.max(3, Math.min(12, totalEngagement / 10)),
          brightness: Math.min(1, totalEngagement / 100),
          color: '#FFD700',
          represents: `${repo.stargazers_count} stars, ${repo.forks_count} forks`
        });
      });

      // Create central sun representing overall profile
      const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
      const accountAge = repos.length > 0 && repos[0].created_at ? new Date(repos[0].created_at).getFullYear() : new Date().getFullYear();
      const accountAgeDiff = new Date().getFullYear() - accountAge;

      bodies.push({
        name: username,
        type: 'star',
        x: 0,
        y: 0,
        size: Math.max(15, Math.min(40, (totalStars + totalForks) / 50)),
        brightness: Math.min(1, (totalStars + totalForks) / 500),
        color: '#FFA500',
        represents: `${totalStars} total stars, ${accountAgeDiff} years active`
      });

      setCelestialBodies(bodies);
    };

    generateCelestialMap();

    // Update time for celestial movement
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [username, repos]);

  const getCurrentMoonPhase = () => {
    // Simple moon phase calculation based on current date
    const date = new Date();
    const moonCycle = 29.53; // days
    const knownNewMoon = new Date('2024-01-01'); // Reference new moon
    const daysSince = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const phase = (daysSince % moonCycle) / moonCycle;

    if (phase < 0.125) return 'New Moon';
    if (phase < 0.375) return 'Waxing Crescent';
    if (phase < 0.625) return 'Full Moon';
    if (phase < 0.875) return 'Waning Crescent';
    return 'New Moon';
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
          <h2 className='text-2xl font-bold'>Astral Portfolio Navigation</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Navigate your portfolio through the celestial patterns of your GitHub universe
          </p>
          <div className='flex items-center gap-4 mt-2'>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'></div>
              <span className='text-xs text-blue-400'>Moon Phase: {getCurrentMoonPhase()}</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 bg-yellow-500 rounded-full animate-pulse'></div>
              <span className='text-xs text-yellow-400'>Real-time celestial alignment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Celestial Map */}
      <div className='relative bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 rounded-lg p-8 mb-6 overflow-hidden' style={{ height: '600px' }}>
        {/* Stars background */}
        <div className='absolute inset-0'>
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className='absolute w-1 h-1 bg-white rounded-full animate-pulse'
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                opacity: Math.random() * 0.8 + 0.2
              }}
            />
          ))}
        </div>

        {/* Celestial bodies */}
        <div className='relative w-full h-full'>
          {celestialBodies.map((body, index) => (
            <motion.div
              key={`${body.name}-${body.type}`}
              className='absolute cursor-pointer'
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                x: body.x,
                y: body.y,
                scale: 1,
                opacity: body.brightness
              }}
              transition={{
                delay: index * 0.1,
                duration: 1,
                type: 'spring',
                stiffness: 100
              }}
              whileHover={{ scale: 1.5 }}
              onClick={() => setSelectedBody(body)}
            >
              <div
                className='rounded-full border-2 border-white/20 flex items-center justify-center text-xs font-bold shadow-lg'
                style={{
                  width: `${body.size * 2}px`,
                  height: `${body.size * 2}px`,
                  backgroundColor: body.color,
                  boxShadow: `0 0 ${body.size * 2}px ${body.color}40`
                }}
              >
                {body.type === 'star' && '⭐'}
                {body.type === 'planet' && '🪐'}
              </div>

              {/* Name label */}
              <div className='absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs text-center whitespace-nowrap'>
                <div className='bg-black/70 text-white px-2 py-1 rounded'>
                  {body.name}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation rings */}
        <div className='absolute inset-0 border border-white/10 rounded-full'></div>
        <div className='absolute inset-8 border border-white/5 rounded-full'></div>
        <div className='absolute inset-16 border border-white/5 rounded-full'></div>
      </div>

      {/* Selected body details */}
      {selectedBody && (
        <motion.div
          className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className='flex items-center justify-between mb-3'>
            <h3 className='font-semibold text-lg'>{selectedBody.name}</h3>
            <button
              onClick={() => setSelectedBody(null)}
              className='text-[var(--text-secondary)] hover:text-white'
            >
              ✕
            </button>
          </div>

          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='text-[var(--text-secondary)]'>Type:</span>
              <span className='ml-2 capitalize'>{selectedBody.type}</span>
            </div>
            <div>
              <span className='text-[var(--text-secondary)]'>Brightness:</span>
              <span className='ml-2'>{Math.round(selectedBody.brightness * 100)}%</span>
            </div>
            <div className='col-span-2'>
              <span className='text-[var(--text-secondary)]'>Represents:</span>
              <span className='ml-2'>{selectedBody.represents}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Celestial navigation guide */}
      <div className='bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 rounded-lg p-4'>
        <h3 className='font-semibold mb-2'>Celestial Navigation Guide</h3>
        <div className='text-sm text-[var(--text-secondary)] space-y-1'>
          <p>• 🪐 Planets represent your programming languages (size = usage frequency)</p>
          <p>• ⭐ Stars represent your top repositories (brightness = community engagement)</p>
          <p>• ☀️ Central sun represents your overall GitHub presence</p>
          <p>• Click any celestial body to learn more about what it represents</p>
        </div>
      </div>
    </motion.div>
  );
}
