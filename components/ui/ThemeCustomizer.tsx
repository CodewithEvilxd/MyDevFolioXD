'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

// Add custom CSS animations for Goku transformations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes gokuTransform {
      0%, 12.5% { opacity: 0; transform: scale(0.8); }
      12.5%, 25% { opacity: 1; transform: scale(1); }
      25%, 37.5% { opacity: 1; transform: scale(1.1); }
      37.5%, 50% { opacity: 0; transform: scale(0.8); }
      50%, 100% { opacity: 0; transform: scale(0.8); }
    }
    @keyframes fadeInOut {
      0%, 12.5% { opacity: 1; }
      12.5%, 25% { opacity: 0; }
      25%, 100% { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

const themes = [
  {
    name: 'Default',
    primary: '#8976ea',
    background: '#000000',
    cardBg: '#111111',
    textPrimary: '#ffffff',
    textSecondary: '#a0a0a0'
  },
  {
    name: 'Ocean Blue',
    primary: '#00bcd4',
    background: '#0f1419',
    cardBg: '#1a2332',
    textPrimary: '#ffffff',
    textSecondary: '#b0c4de'
  },
  {
    name: 'Forest Green',
    primary: '#4caf50',
    background: '#0d1117',
    cardBg: '#161b22',
    textPrimary: '#ffffff',
    textSecondary: '#8fbc8f'
  },
  {
    name: 'Sunset Orange',
    primary: '#ff9800',
    background: '#1a0d00',
    cardBg: '#2d1810',
    textPrimary: '#ffffff',
    textSecondary: '#deb887'
  },
  {
    name: 'Royal Purple',
    primary: '#9c27b0',
    background: '#120d1a',
    cardBg: '#1f1629',
    textPrimary: '#ffffff',
    textSecondary: '#dda0dd'
  },
  {
    name: 'Cyber Punk',
    primary: '#ff0080',
    background: '#0a0a0a',
    cardBg: '#1a1a1a',
    textPrimary: '#ffffff',
    textSecondary: '#00ffff'
  },
  {
    name: 'Neon Cyber 3D',
    primary: '#00ffff',
    background: '#000011',
    cardBg: 'rgba(0, 255, 255, 0.1)',
    textPrimary: '#ffffff',
    textSecondary: '#00ffff'
  },
  {
    name: 'Glass Morphism',
    primary: '#6366f1',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    cardBg: 'rgba(255, 255, 255, 0.1)',
    textPrimary: '#ffffff',
    textSecondary: '#e0e7ff'
  },
  {
    name: 'Gradient Flow 3D',
    primary: '#f59e0b',
    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)',
    cardBg: 'rgba(255, 255, 255, 0.15)',
    textPrimary: '#ffffff',
    textSecondary: '#fed7aa'
  },
  {
    name: 'Manga Panels 3D',
    primary: '#000000',
    background: 'linear-gradient(45deg, #ffffff, #f0f0f0, #e0e0e0)',
    cardBg: 'rgba(255, 255, 255, 0.9)',
    textPrimary: '#000000',
    textSecondary: '#666666'
  },
  {
    name: 'Chibi World 3D',
    primary: '#ff69b4',
    background: 'linear-gradient(135deg, #ffb6c1, #ffc0cb, #ffe4e1)',
    cardBg: 'rgba(255, 255, 255, 0.8)',
    textPrimary: '#ff1493',
    textSecondary: '#ffb6c1'
  },
  {
    name: 'Shonen Energy 3D',
    primary: '#ff4500',
    background: 'linear-gradient(45deg, #ff6347, #ff4500, #dc143c)',
    cardBg: 'rgba(255, 255, 255, 0.1)',
    textPrimary: '#ffffff',
    textSecondary: '#ffa500'
  },
  {
    name: 'Shojo Sparkle 3D',
    primary: '#ff1493',
    background: 'linear-gradient(135deg, #ffb6c1, #ffc0cb, #ffe4e1, #fff0f5)',
    cardBg: 'rgba(255, 255, 255, 0.85)',
    textPrimary: '#ff1493',
    textSecondary: '#ffb6c1'
  },
  {
    name: 'Kawaii Pastel 3D',
    primary: '#dda0dd',
    background: 'linear-gradient(135deg, #e6e6fa, #f0e68c, #ffb6c1, #98fb98)',
    cardBg: 'rgba(255, 255, 255, 0.9)',
    textPrimary: '#9370db',
    textSecondary: '#dda0dd'
  },
  {
    name: 'Neon Tokyo 3D',
    primary: '#00ffff',
    background: 'linear-gradient(45deg, #000000, #1a1a2e, #16213e)',
    cardBg: 'rgba(0, 255, 255, 0.1)',
    textPrimary: '#ffffff',
    textSecondary: '#00ffff'
  },
  {
    name: 'Samurai Brush 3D',
    primary: '#8b0000',
    background: 'linear-gradient(135deg, #2f1b14, #8b4513, #daa520)',
    cardBg: 'rgba(218, 165, 32, 0.1)',
    textPrimary: '#ffffff',
    textSecondary: '#daa520'
  },
  {
    name: 'Mecha Grid 3D',
    primary: '#00ff41',
    background: 'linear-gradient(45deg, #000000, #001122, #002244)',
    cardBg: 'rgba(0, 255, 65, 0.1)',
    textPrimary: '#00ff41',
    textSecondary: '#008f11'
  },
  {
    name: 'Fantasy Realm 3D',
    primary: '#9370db',
    background: 'linear-gradient(135deg, #4b0082, #8a2be2, #da70d6)',
    cardBg: 'rgba(255, 255, 255, 0.1)',
    textPrimary: '#ffffff',
    textSecondary: '#dda0dd'
  },
  {
    name: 'Retro VHS Anime 3D',
    primary: '#ff00ff',
    background: 'linear-gradient(45deg, #000000, #2d1b69, #11998e)',
    cardBg: 'rgba(255, 0, 255, 0.1)',
    textPrimary: '#ffffff',
    textSecondary: '#ff00ff'
  },
  {
    name: 'Saiyan Aura 3D',
    primary: '#ffa500',
    background: 'linear-gradient(45deg, #ff4500, #ffa500, #ffff00)',
    cardBg: 'rgba(255, 165, 0, 0.1)',
    textPrimary: '#ffffff',
    textSecondary: '#ffa500'
  },
  {
    name: 'Pirate\'s Horizon 3D',
    primary: '#1e90ff',
    background: 'linear-gradient(135deg, #000080, #1e90ff, #87ceeb)',
    cardBg: 'rgba(30, 144, 255, 0.1)',
    textPrimary: '#ffffff',
    textSecondary: '#1e90ff'
  },
  {
    name: 'Shinobi Legacy 3D',
    primary: '#ff6347',
    background: 'linear-gradient(45deg, #8b0000, #ff6347, #ffa500)',
    cardBg: 'rgba(255, 99, 71, 0.1)',
    textPrimary: '#ffffff',
    textSecondary: '#ff6347'
  },
  {
    name: 'Urban Showdown 3D',
    primary: '#708090',
    background: 'linear-gradient(135deg, #2f2f2f, #708090, #000000)',
    cardBg: 'rgba(112, 128, 144, 0.1)',
    textPrimary: '#ffffff',
    textSecondary: '#708090'
  },
  {
    name: 'Anime Multiverse 3D',
    primary: '#9370db',
    background: 'linear-gradient(45deg, #ff4500, #1e90ff, #ff6347, #708090, #9370db)',
    cardBg: 'rgba(147, 112, 219, 0.1)',
    textPrimary: '#ffffff',
    textSecondary: '#9370db'
  },
  {
    name: 'Ultra Instinct Goku 3D',
    primary: '#00ffff',
    background: 'linear-gradient(45deg, #000000, #000033, #003300, #330000)',
    cardBg: 'rgba(0, 255, 255, 0.1)',
    textPrimary: '#ffffff',
    textSecondary: '#00ffff'
  }
];

export default function ThemeCustomizer() {
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);

  const applyTheme = (theme: typeof themes[0]) => {
    setSelectedTheme(theme);

    // Apply CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--card-bg', theme.cardBg);
    root.style.setProperty('--text-primary', theme.textPrimary);
    root.style.setProperty('--text-secondary', theme.textSecondary);

    // Handle background (gradient or solid color)
    if (theme.background.includes('gradient')) {
      root.style.setProperty('--background', '#000000'); // Fallback
      root.style.background = theme.background;
    } else {
      root.style.setProperty('--background', theme.background);
      root.style.background = '';
    }

    // Calculate derived colors dynamically
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const rgb = hexToRgb(theme.primary);
    const primaryDark = rgb ? `rgb(${Math.max(0, rgb.r - 40)}, ${Math.max(0, rgb.g - 40)}, ${Math.max(0, rgb.b - 40)})` : theme.primary;
    const primaryLight = rgb ? `rgb(${Math.min(255, rgb.r + 40)}, ${Math.min(255, rgb.g + 40)}, ${Math.min(255, rgb.b + 40)})` : theme.primary;

    root.style.setProperty('--primary-dark', primaryDark);
    root.style.setProperty('--primary-light', primaryLight);

    // Save to localStorage
    localStorage.setItem('customTheme', JSON.stringify(theme));
  };

  // Load saved theme on mount
  useState(() => {
    const savedTheme = localStorage.getItem('customTheme');
    if (savedTheme) {
      const theme = JSON.parse(savedTheme);
      applyTheme(theme);
    }
  });

  return (
    <motion.div
      className='w-full'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className='flex items-center justify-between mb-6'>
        <h2 className='section-heading'>Theme Customizer</h2>
        <div className='text-sm text-[var(--text-secondary)]'>
          Current: {selectedTheme.name}
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
        {themes.map((theme, index) => (
          <motion.div
            key={theme.name}
            className={`card cursor-pointer transition-all duration-300 ${
              selectedTheme.name === theme.name
                ? 'ring-2 ring-[var(--primary)] scale-105'
                : 'hover:scale-102'
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            onClick={() => applyTheme(theme)}
          >
            {/* Theme Preview */}
            <div
              className={`h-20 rounded-t-lg mb-3 relative overflow-hidden ${
                theme.name === 'Glass Morphism' ? 'backdrop-blur-md border border-white/20' :
                theme.name === 'Neon Cyber 3D' ? 'shadow-lg shadow-cyan-500/50' :
                theme.name === 'Gradient Flow 3D' ? 'shadow-lg' :
                theme.name === 'Manga Panels 3D' ? 'bg-gradient-to-br from-gray-100 to-gray-300' :
                theme.name === 'Chibi World 3D' ? 'rounded-2xl shadow-lg' :
                theme.name === 'Shonen Energy 3D' ? 'shadow-red-500/50 shadow-lg' :
                theme.name === 'Shojo Sparkle 3D' ? 'shadow-pink-500/50 shadow-lg' :
                theme.name === 'Kawaii Pastel 3D' ? 'rounded-3xl shadow-lg' :
                theme.name === 'Neon Tokyo 3D' ? 'shadow-cyan-500/50 shadow-lg' :
                theme.name === 'Samurai Brush 3D' ? 'shadow-yellow-500/50 shadow-lg' :
                theme.name === 'Mecha Grid 3D' ? 'shadow-green-500/50 shadow-lg' :
                theme.name === 'Fantasy Realm 3D' ? 'shadow-purple-500/50 shadow-lg' :
                theme.name === 'Retro VHS Anime 3D' ? 'shadow-magenta-500/50 shadow-lg' :
                theme.name === 'Saiyan Aura 3D' ? 'shadow-orange-500/50 shadow-lg' :
                theme.name === 'Pirate\'s Horizon 3D' ? 'shadow-blue-500/50 shadow-lg' :
                theme.name === 'Shinobi Legacy 3D' ? 'shadow-red-500/50 shadow-lg' :
                theme.name === 'Urban Showdown 3D' ? 'shadow-gray-500/50 shadow-lg' :
                theme.name === 'Anime Multiverse 3D' ? 'shadow-purple-500/50 shadow-lg' :
                theme.name === 'Ultra Instinct Goku 3D' ? 'shadow-cyan-500/50 shadow-lg' : ''
              }`}
              style={{
                background: theme.background.includes('gradient') ? theme.background : theme.background,
                backgroundColor: !theme.background.includes('gradient') ? theme.background : undefined
              }}
            >
              {/* Theme-specific elements */}
              {theme.name === 'Manga Panels 3D' && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute text-sm animate-bounce" style={{top: '20%', left: '25%', animationDelay: '0s'}}>📖</div>
                  <div className="absolute text-xs animate-pulse" style={{top: '15%', right: '20%', animationDelay: '1s'}}>💬</div>
                  <div className="absolute text-xs animate-pulse" style={{bottom: '20%', left: '60%', animationDelay: '2s'}}>📄</div>
                  <div className="w-1 h-4 bg-black absolute top-6 left-6 animate-pulse"></div>
                  <div className="w-1 h-3 bg-black absolute top-8 left-8 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                </div>
              )}
              {theme.name === 'Chibi World 3D' && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute text-sm animate-bounce" style={{top: '15%', left: '20%', animationDelay: '0s'}}>🐣</div>
                  <div className="absolute text-xs animate-pulse" style={{top: '50%', right: '25%', animationDelay: '1s'}}>🌸</div>
                  <div className="absolute text-xs animate-pulse" style={{bottom: '25%', left: '65%', animationDelay: '2s'}}>🍡</div>
                  <div className="absolute w-2 h-2 bg-pink-300 rounded-full animate-ping" style={{top: '35%', right: '40%'}}></div>
                </div>
              )}
              {theme.name === 'Shonen Energy 3D' && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute text-sm animate-bounce" style={{top: '20%', left: '15%', animationDelay: '0s'}}>⚡</div>
                  <div className="absolute text-sm animate-bounce" style={{top: '55%', right: '20%', animationDelay: '1s'}}>💥</div>
                  <div className="absolute w-1 h-6 bg-red-500 transform rotate-12 animate-pulse" style={{top: '30%', left: '10%'}}></div>
                  <div className="absolute w-1 h-4 bg-orange-500 transform rotate-45 animate-pulse" style={{top: '40%', right: '15%'}}></div>
                  <div className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{bottom: '30%', left: '70%'}}></div>
                </div>
              )}
              {theme.name === 'Shojo Sparkle 3D' && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute text-sm animate-bounce" style={{top: '18%', left: '22%', animationDelay: '0s'}}>💖</div>
                  <div className="absolute text-xs animate-pulse" style={{top: '45%', right: '18%', animationDelay: '1s'}}>✨</div>
                  <div className="absolute text-xs animate-pulse" style={{bottom: '22%', left: '68%', animationDelay: '2s'}}>💕</div>
                  <div className="absolute w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{top: '35%', right: '35%'}}></div>
                  <div className="absolute w-1 h-1 bg-pink-300 rounded-full animate-ping" style={{bottom: '35%', left: '40%'}}></div>
                </div>
              )}
              {theme.name === 'Kawaii Pastel 3D' && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute text-sm animate-bounce" style={{top: '16%', left: '18%', animationDelay: '0s'}}>🍭</div>
                  <div className="absolute text-xs animate-pulse" style={{top: '52%', right: '22%', animationDelay: '1s'}}>🌈</div>
                  <div className="absolute text-xs animate-pulse" style={{bottom: '24%', left: '62%', animationDelay: '2s'}}>🦄</div>
                  <div className="absolute w-2 h-2 bg-purple-300 rounded-full animate-ping" style={{top: '38%', right: '38%'}}></div>
                </div>
              )}
              {theme.name === 'Neon Tokyo 3D' && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute text-sm animate-bounce" style={{top: '22%', left: '16%', animationDelay: '0s'}}>🌆</div>
                  <div className="absolute text-xs animate-pulse" style={{top: '58%', right: '19%', animationDelay: '1s'}}>🏙️</div>
                  <div className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-ping shadow-cyan-400/50 shadow-lg" style={{bottom: '28%', left: '65%'}}></div>
                  <div className="absolute w-1 h-3 bg-cyan-500 animate-pulse" style={{top: '40%', left: '12%'}}></div>
                </div>
              )}
              {theme.name === 'Samurai Brush 3D' && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute text-sm animate-bounce" style={{top: '19%', left: '21%', animationDelay: '0s'}}>🗡️</div>
                  <div className="absolute text-xs animate-pulse" style={{top: '51%', right: '24%', animationDelay: '1s'}}>🎌</div>
                  <div className="absolute w-1 h-5 bg-yellow-600 transform rotate-12 animate-pulse" style={{top: '35%', left: '15%'}}></div>
                  <div className="absolute w-2 h-2 bg-yellow-500 rounded-full animate-ping" style={{bottom: '32%', right: '35%'}}></div>
                </div>
              )}
              {theme.name === 'Mecha Grid 3D' && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute text-sm animate-bounce" style={{top: '17%', left: '19%', animationDelay: '0s'}}>🤖</div>
                  <div className="absolute text-xs animate-pulse" style={{top: '53%', right: '21%', animationDelay: '1s'}}>⚙️</div>
                  <div className="absolute inset-0 opacity-10 animate-pulse">
                    <div className="w-full h-full bg-green-400" style={{backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0,255,65,0.1) 25%, rgba(0,255,65,0.1) 26%, transparent 27%, transparent 74%, rgba(0,255,65,0.1) 75%, rgba(0,255,65,0.1) 76%, transparent 77%, transparent 100%), linear-gradient(90deg, transparent 24%, rgba(0,255,65,0.1) 25%, rgba(0,255,65,0.1) 26%, transparent 27%, transparent 74%, rgba(0,255,65,0.1) 75%, rgba(0,255,65,0.1) 76%, transparent 77%, transparent 100%)'}}></div>
                  </div>
                  <div className="absolute w-1 h-1 bg-green-400 rounded-full animate-ping" style={{bottom: '25%', left: '70%'}}></div>
                </div>
              )}
              {theme.name === 'Fantasy Realm 3D' && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute text-sm animate-bounce" style={{top: '21%', left: '17%', animationDelay: '0s'}}>🔮</div>
                  <div className="absolute text-xs animate-pulse" style={{top: '56%', right: '23%', animationDelay: '1s'}}>✨</div>
                  <div className="absolute text-xs animate-pulse" style={{bottom: '26%', left: '66%', animationDelay: '2s'}}>🪄</div>
                  <div className="absolute w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{top: '37%', right: '37%'}}></div>
                  <div className="absolute w-1 h-4 bg-purple-500 transform rotate-45 animate-pulse" style={{top: '42%', left: '14%'}}></div>
                </div>
              )}
              {theme.name === 'Retro VHS Anime 3D' && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute text-sm animate-bounce" style={{top: '23%', left: '18%', animationDelay: '0s'}}>📼</div>
                  <div className="absolute text-xs animate-pulse" style={{top: '57%', right: '22%', animationDelay: '1s'}}>📺</div>
                  <div className="absolute inset-0 opacity-20 animate-pulse">
                    <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent"></div>
                  </div>
                  <div className="absolute w-1 h-1 bg-magenta-400 rounded-full animate-ping" style={{bottom: '27%', left: '68%'}}></div>
                </div>
              )}
              {theme.name === 'Saiyan Aura 3D' && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute text-lg animate-bounce" style={{top: '10%', left: '20%', animationDelay: '0s'}}>🥋</div>
                  <div className="absolute text-lg animate-bounce" style={{top: '60%', right: '15%', animationDelay: '1s'}}>💥</div>
                  <div className="absolute text-lg animate-pulse" style={{bottom: '20%', left: '70%', animationDelay: '2s'}}>⚡</div>
                  <div className="absolute w-2 h-2 bg-orange-400 rounded-full animate-ping" style={{top: '30%', right: '30%'}}></div>
                  <div className="absolute w-1 h-8 bg-orange-500 transform rotate-12 animate-pulse" style={{top: '40%', left: '10%'}}></div>
                </div>
              )}
              {theme.name === 'Pirate\'s Horizon 3D' && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute text-lg animate-bounce" style={{top: '15%', left: '25%', animationDelay: '0s'}}>🏴‍☠️</div>
                  <div className="absolute text-lg animate-bounce" style={{top: '50%', right: '20%', animationDelay: '1.5s'}}>⚓</div>
                  <div className="absolute text-sm animate-pulse" style={{bottom: '25%', left: '60%', animationDelay: '1s'}}>🌊</div>
                  <div className="absolute text-sm animate-pulse" style={{bottom: '15%', right: '40%', animationDelay: '2.5s'}}>🏝️</div>
                </div>
              )}
              {theme.name === 'Shinobi Legacy 3D' && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute text-lg animate-bounce" style={{top: '20%', left: '15%', animationDelay: '0s'}}>🥷</div>
                  <div className="absolute text-lg animate-bounce" style={{top: '55%', right: '25%', animationDelay: '1s'}}>⚔️</div>
                  <div className="absolute text-sm animate-pulse" style={{bottom: '30%', left: '70%', animationDelay: '2s'}}>🏠</div>
                  <div className="absolute w-3 h-3 bg-red-500 rounded-full animate-ping" style={{top: '35%', right: '35%'}}></div>
                  <div className="absolute w-1 h-6 bg-orange-500 transform rotate-45 animate-pulse" style={{top: '45%', left: '20%'}}></div>
                </div>
              )}
              {theme.name === 'Urban Showdown 3D' && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute text-lg animate-bounce" style={{top: '25%', left: '20%', animationDelay: '0s'}}>👊</div>
                  <div className="absolute text-lg animate-bounce" style={{top: '60%', right: '15%', animationDelay: '1.5s'}}>🥊</div>
                  <div className="absolute text-sm animate-pulse" style={{bottom: '20%', left: '65%', animationDelay: '1s'}}>🏙️</div>
                  <div className="absolute w-2 h-2 bg-gray-400 rounded-full animate-ping" style={{top: '40%', right: '40%'}}></div>
                  <div className="absolute w-1 h-4 bg-gray-600 transform rotate-12 animate-pulse" style={{top: '50%', left: '15%'}}></div>
                </div>
              )}
              {theme.name === 'Anime Multiverse 3D' && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute text-sm animate-bounce" style={{top: '10%', left: '20%', animationDelay: '0s'}}>🥋</div>
                  <div className="absolute text-sm animate-bounce" style={{top: '15%', right: '25%', animationDelay: '0.5s'}}>🏴‍☠️</div>
                  <div className="absolute text-sm animate-bounce" style={{top: '60%', left: '15%', animationDelay: '1s'}}>🥷</div>
                  <div className="absolute text-sm animate-bounce" style={{top: '55%', right: '20%', animationDelay: '1.5s'}}>👊</div>
                  <div className="absolute text-xs animate-pulse" style={{bottom: '25%', left: '70%', animationDelay: '2s'}}>🌌</div>
                  <div className="absolute text-xs animate-pulse" style={{bottom: '20%', right: '30%', animationDelay: '2.5s'}}>⭐</div>
                  <div className="absolute w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{top: '30%', left: '50%'}}></div>
                  <div className="absolute w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{top: '40%', right: '50%'}}></div>
                  <div className="absolute w-1 h-1 bg-red-400 rounded-full animate-ping" style={{bottom: '35%', left: '40%'}}></div>
                  <div className="absolute w-1 h-1 bg-gray-400 rounded-full animate-ping" style={{bottom: '30%', right: '45%'}}></div>
                </div>
              )}
              {theme.name === 'Ultra Instinct Goku 3D' && (
                <div className="absolute inset-0 overflow-hidden">
                  {/* Goku Transformation Sequence */}
                  <div className="absolute text-lg" style={{
                    top: '20%', left: '25%',
                    animation: 'fadeInOut 8s infinite'
                  }}>🥋</div>

                  <div className="absolute text-lg" style={{
                    top: '20%', left: '25%',
                    animation: 'gokuTransform 8s infinite 2s'
                  }}>⚡</div>

                  <div className="absolute text-lg" style={{
                    top: '20%', left: '25%',
                    animation: 'gokuTransform 8s infinite 4s'
                  }}>💙</div>

                  <div className="absolute text-lg" style={{
                    top: '20%', left: '25%',
                    animation: 'gokuTransform 8s infinite 6s'
                  }}>👁️</div>

                  {/* Dynamic Energy Effects */}
                  <div className="absolute w-2 h-2 bg-orange-400 rounded-full animate-ping" style={{top: '15%', left: '20%', animationDelay: '0s'}}></div>
                  <div className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{top: '25%', left: '30%', animationDelay: '2s'}}></div>
                  <div className="absolute w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{top: '15%', left: '30%', animationDelay: '4s'}}></div>
                  <div className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{top: '25%', left: '20%', animationDelay: '6s'}}></div>
                  <div className="absolute w-2 h-2 bg-white rounded-full animate-ping" style={{top: '20%', left: '35%', animationDelay: '1s'}}></div>

                  {/* Speed Lines */}
                  <div className="absolute w-1 h-6 bg-orange-500 transform rotate-12 animate-pulse" style={{top: '10%', left: '15%', animationDelay: '0.5s'}}></div>
                  <div className="absolute w-1 h-4 bg-yellow-500 transform rotate-45 animate-pulse" style={{top: '30%', left: '35%', animationDelay: '2.5s'}}></div>
                  <div className="absolute w-1 h-5 bg-blue-500 transform rotate-78 animate-pulse" style={{top: '5%', left: '35%', animationDelay: '4.5s'}}></div>
                  <div className="absolute w-1 h-7 bg-cyan-500 transform rotate-23 animate-pulse" style={{top: '35%', left: '15%', animationDelay: '6.5s'}}></div>

                  {/* Special Attacks */}
                  <div className="absolute text-sm animate-pulse" style={{bottom: '20%', left: '60%', animationDelay: '1s'}}>💥</div>
                  <div className="absolute text-xs animate-ping" style={{bottom: '15%', left: '65%', animationDelay: '1.5s'}}>⚡</div>
                  <div className="absolute text-xs animate-bounce" style={{bottom: '25%', right: '20%', animationDelay: '3s'}}>🌟</div>
                </div>
              )}

              <div
                className={`absolute top-2 left-2 w-3 h-3 rounded-full ${
                  theme.name === 'Neon Cyber 3D' ? 'shadow-lg shadow-cyan-500/50' :
                  theme.name === 'Neon Tokyo 3D' ? 'shadow-lg shadow-cyan-400/50' :
                  theme.name === 'Retro VHS Anime 3D' ? 'shadow-lg shadow-magenta-500/50' : ''
                }`}
                style={{ backgroundColor: theme.primary }}
              />
              <div
                className={`absolute top-6 left-2 w-8 h-2 rounded ${
                  theme.name === 'Glass Morphism' ? 'backdrop-blur-sm bg-white/20' :
                  theme.name === 'Chibi World 3D' ? 'rounded-full' :
                  theme.name === 'Kawaii Pastel 3D' ? 'rounded-full' : ''
                }`}
                style={{
                  backgroundColor: (theme.name === 'Glass Morphism' || theme.name.includes('3D')) ? undefined : theme.cardBg,
                  background: theme.name === 'Glass Morphism' ? 'rgba(255, 255, 255, 0.1)' : undefined
                }}
              />
              <div
                className='absolute bottom-2 right-2 w-6 h-1 rounded'
                style={{ backgroundColor: theme.textSecondary }}
              />
            </div>

            <div className='px-4 pb-4'>
              <h3 className='font-bold text-sm mb-2'>
                {theme.name}
                {(theme.name.includes('3D') || theme.name === 'Glass Morphism' ||
                  ['Manga Panels', 'Chibi World', 'Shonen Energy', 'Shojo Sparkle', 'Kawaii Pastel',
                   'Neon Tokyo', 'Samurai Brush', 'Mecha Grid', 'Fantasy Realm', 'Retro VHS Anime',
                   'Saiyan Aura', 'Pirate\'s Horizon', 'Shinobi Legacy', 'Urban Showdown', 'Anime Multiverse'].some(name => theme.name.includes(name))) && (
                  <span className='ml-2 text-xs bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent'>
                    3D
                  </span>
                )}
              </h3>

              {/* Color Palette */}
              <div className='flex gap-1 mb-3'>
                <div
                  className='w-4 h-4 rounded-full border border-white/20'
                  style={{ backgroundColor: theme.primary }}
                  title='Primary'
                />
                <div
                  className='w-4 h-4 rounded-full border border-white/20'
                  style={{ backgroundColor: theme.cardBg }}
                  title='Card Background'
                />
                <div
                  className='w-4 h-4 rounded-full border border-white/20'
                  style={{ backgroundColor: theme.textPrimary }}
                  title='Text Primary'
                />
                <div
                  className='w-4 h-4 rounded-full border border-white/20'
                  style={{ backgroundColor: theme.textSecondary }}
                  title='Text Secondary'
                />
              </div>

              {selectedTheme.name === theme.name && (
                <motion.div
                  className='flex items-center justify-center text-xs text-[var(--primary)] font-medium'
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  ✓ Active Theme
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reset to Default */}
      <motion.div
        className='mt-6 text-center'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <button
          onClick={() => applyTheme(themes[0])}
          className='px-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--primary)] text-[var(--text-primary)] rounded-md transition-colors text-sm'
        >
          Reset to Default
        </button>
      </motion.div>
    </motion.div>
  );
}
