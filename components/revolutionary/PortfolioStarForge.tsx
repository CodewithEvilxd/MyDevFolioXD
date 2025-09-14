'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { githubAPI } from '@/lib/githubService';
import { GitHubUserWithStats } from '@/types';

interface PortfolioStarForgeProps {
  username: string;
}

interface ProgrammingLanguage {
  id: string;
  name: string;
  paradigm: string;
  syntax: Record<string, string>;
  features: string[];
  color: string;
  complexity: number;
  evolution: number;
  creator: string;
  description: string;
}

interface LanguageParticle {
  id: string;
  x: number;
  y: number;
  languageId: string;
  size: number;
  color: string;
  velocity: { x: number; y: number };
  energy: number;
  connections: string[];
}

interface VisitorPattern {
  id: string;
  timestamp: number;
  action: string;
  duration: number;
  complexity: number;
  emotionalState: string;
}

export default function PortfolioStarForge({ username }: PortfolioStarForgeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const languagesRef = useRef<ProgrammingLanguage[]>([]);
  const particlesRef = useRef<LanguageParticle[]>([]);
  const visitorPatternsRef = useRef<VisitorPattern[]>([]);

  const [userData, setUserData] = useState<GitHubUserWithStats | null>(null);
  const [generatedLanguages, setGeneratedLanguages] = useState<ProgrammingLanguage[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage | null>(null);
  const [isForging, setIsForging] = useState(false);
  const [forgeProgress, setForgeProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Language paradigms and their characteristics
  const paradigms = useMemo(() => ({
    functional: {
      keywords: ['lambda', 'map', 'filter', 'reduce', 'compose', 'curry'],
      operators: ['->', '|>', '<|', '>>', '<<'],
      features: ['immutability', 'higher-order functions', 'recursion', 'pattern matching'],
      color: '#3b82f6'
    },
    objectOriented: {
      keywords: ['class', 'object', 'method', 'property', 'inherit', 'polymorph'],
      operators: ['.', '::', '=>', '<=', 'instanceof'],
      features: ['encapsulation', 'inheritance', 'polymorphism', 'abstraction'],
      color: '#10b981'
    },
    procedural: {
      keywords: ['procedure', 'function', 'variable', 'loop', 'condition', 'return'],
      operators: ['=', '==', '!=', '<', '>', '&&', '||'],
      features: ['procedures', 'variables', 'loops', 'conditionals', 'modularity'],
      color: '#f59e0b'
    },
    declarative: {
      keywords: ['define', 'rule', 'constraint', 'query', 'fact', 'inference'],
      operators: ['=>', '<=>', '?', '!', '@'],
      features: ['logic programming', 'constraints', 'queries', 'inference engine'],
      color: '#8b5cf6'
    },
    concurrent: {
      keywords: ['async', 'await', 'spawn', 'channel', 'mutex', 'goroutine'],
      operators: ['<-', '->', '||', '&&', '!!'],
      features: ['concurrency', 'parallelism', 'channels', 'actors', 'futures'],
      color: '#ec4899'
    },
    quantum: {
      keywords: ['qubit', 'superposition', 'entangle', 'measure', 'collapse'],
      operators: ['|>', '<|', '⊗', '⊕', '⟨', '⟩'],
      features: ['quantum computing', 'superposition', 'entanglement', 'measurement'],
      color: '#06b6d4'
    }
  }), []);

  // Generate programming language from visitor patterns
  const generateLanguageFromPatterns = useCallback((patterns: VisitorPattern[]): ProgrammingLanguage => {
    // Analyze patterns to determine language characteristics
    const avgComplexity = patterns.reduce((sum, p) => sum + p.complexity, 0) / patterns.length;
    const emotionalStates = patterns.map(p => p.emotionalState);
    const dominantEmotion = emotionalStates.sort((a, b) =>
      emotionalStates.filter(v => v === a).length - emotionalStates.filter(v => v === b).length
    ).pop() || 'neutral';

    const avgDuration = patterns.reduce((sum, p) => sum + p.duration, 0) / patterns.length;

    // Determine paradigm based on patterns
    let paradigm: keyof typeof paradigms;
    if (avgComplexity > 0.7) {
      paradigm = dominantEmotion === 'focused' ? 'functional' : 'quantum';
    } else if (avgDuration > 5000) {
      paradigm = 'declarative';
    } else if (patterns.length > 20) {
      paradigm = 'concurrent';
    } else {
      paradigm = 'objectOriented';
    }

    const paradigmData = paradigms[paradigm];

    // Generate language name
    const prefixes = ['Neo', 'Quantum', 'Meta', 'Hyper', 'Ultra', 'Cyber', 'Bio', 'Neuro'];
    const suffixes = ['Lang', 'Code', 'Script', 'Byte', 'Bit', 'Flux', 'Wave', 'Stream'];
    const name = `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}`;

    // Generate syntax
    const syntax: Record<string, string> = {};
    paradigmData.keywords.forEach(keyword => {
      syntax[keyword] = keyword.toUpperCase();
    });

    // Add some custom syntax based on patterns
    if (avgComplexity > 0.5) {
      syntax['think'] = 'THINK';
      syntax['evolve'] = 'EVOLVE';
    }

    if (dominantEmotion === 'creative') {
      syntax['imagine'] = 'IMAGINE';
      syntax['create'] = 'CREATE';
    }

    // Generate features
    const features = [...paradigmData.features];
    if (patterns.length > 15) {
      features.push('visitor pattern recognition');
    }
    if (avgComplexity > 0.6) {
      features.push('adaptive compilation');
    }
    if (dominantEmotion === 'curious') {
      features.push('exploratory execution');
    }

    const language: ProgrammingLanguage = {
      id: `lang-${Date.now()}`,
      name,
      paradigm,
      syntax,
      features,
      color: paradigmData.color,
      complexity: avgComplexity,
      evolution: patterns.length / 10,
      creator: `Visitor-${patterns.length}`,
      description: `A ${paradigm} programming language forged from ${patterns.length} visitor interactions, optimized for ${dominantEmotion} coding patterns.`
    };

    return language;
  }, [paradigms]);

  // Create language particles
  const createLanguageParticle = useCallback((language: ProgrammingLanguage, x: number, y: number): LanguageParticle => {
    return {
      id: `particle-${Date.now()}-${Math.random()}`,
      x,
      y,
      languageId: language.id,
      size: 5 + Math.random() * 10,
      color: language.color,
      velocity: {
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4
      },
      energy: 50 + Math.random() * 50,
      connections: []
    };
  }, []);

  // Get language compatibility
  const getLanguageCompatibility = useCallback((langId1: string, langId2: string): number => {
    const lang1 = languagesRef.current.find(l => l.id === langId1);
    const lang2 = languagesRef.current.find(l => l.id === langId2);

    if (!lang1 || !lang2) return 0;

    // Same paradigm = high compatibility
    if (lang1.paradigm === lang2.paradigm) return 0.9;

    // Compatible paradigms
    const compatibilityMatrix: Record<string, string[]> = {
      functional: ['declarative', 'concurrent'],
      objectOriented: ['procedural', 'concurrent'],
      procedural: ['objectOriented', 'concurrent'],
      declarative: ['functional', 'quantum'],
      concurrent: ['functional', 'objectOriented', 'procedural'],
      quantum: ['declarative', 'concurrent']
    };

    const compatibleParadigms = compatibilityMatrix[lang1.paradigm] || [];
    return compatibleParadigms.includes(lang2.paradigm) ? 0.6 : 0.2;
  }, []);

  // Update particle physics
  const updateParticles = useCallback(() => {
    const particles = particlesRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = canvas;

    particles.forEach((particle, index) => {
      // Apply forces based on language compatibility
      particles.forEach((other, otherIndex) => {
        if (index !== otherIndex) {
          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100 && distance > 0) {
            // Language compatibility force
            const compatibility = getLanguageCompatibility(particle.languageId, other.languageId);
            const force = compatibility * 0.5 / (distance * distance);

            particle.velocity.x += (dx / distance) * force;
            particle.velocity.y += (dy / distance) * force;

            // Create connections for compatible languages
            if (compatibility > 0.7 && !particle.connections.includes(other.id)) {
              particle.connections.push(other.id);
            }
          }
        }
      });

      // Apply damping
      particle.velocity.x *= 0.98;
      particle.velocity.y *= 0.98;

      // Update position
      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;

      // Boundary conditions
      if (particle.x < 0 || particle.x > width) {
        particle.velocity.x *= -0.8;
        particle.x = Math.max(0, Math.min(width, particle.x));
      }
      if (particle.y < 0 || particle.y > height) {
        particle.velocity.y *= -0.8;
        particle.y = Math.max(0, Math.min(height, particle.y));
      }

      // Energy decay
      particle.energy -= 0.1;

      // Remove dead particles
      if (particle.energy <= 0) {
        particles.splice(index, 1);
      }
    });
  }, [getLanguageCompatibility]);


  // Render the star forge
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Create starfield background
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
    );
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#000000');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    for (let i = 0; i < 200; i++) {
      const x = (i * 37) % canvas.width;
      const y = (i * 23) % canvas.height;
      const brightness = 0.3 + Math.sin(Date.now() * 0.001 + i) * 0.2;

      ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    const particles = particlesRef.current;

    // Draw connections
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    particles.forEach(particle => {
      particle.connections.forEach(connectionId => {
        const connectedParticle = particles.find(p => p.id === connectionId);
        if (connectedParticle) {
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(connectedParticle.x, connectedParticle.y);
          ctx.stroke();
        }
      });
    });

    // Draw particles
    particles.forEach(particle => {
      const alpha = particle.energy / 100;
      ctx.globalAlpha = alpha;

      // Particle glow
      const glowGradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 2
      );
      glowGradient.addColorStop(0, particle.color);
      glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
      ctx.fill();

      // Particle core
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;
    });

    // Draw language names
    const languages = languagesRef.current;
    languages.forEach((language, index) => {
      const particlesForLang = particles.filter(p => p.languageId === language.id);
      if (particlesForLang.length > 0) {
        const avgX = particlesForLang.reduce((sum, p) => sum + p.x, 0) / particlesForLang.length;
        const avgY = particlesForLang.reduce((sum, p) => sum + p.y, 0) / particlesForLang.length;

        ctx.fillStyle = language.color;
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(language.name, avgX, avgY - 20);
      }
    });
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    updateParticles();
    render();
    animationRef.current = requestAnimationFrame(animate);
  }, [updateParticles, render]);

  // Handle mouse interactions to create visitor patterns
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Create visitor pattern
    const pattern: VisitorPattern = {
      id: `pattern-${Date.now()}`,
      timestamp: Date.now(),
      action: 'mousemove',
      duration: Math.random() * 1000,
      complexity: Math.random(),
      emotionalState: ['curious', 'focused', 'creative', 'exploratory'][Math.floor(Math.random() * 4)]
    };

    visitorPatternsRef.current.push(pattern);

    // Keep only recent patterns
    if (visitorPatternsRef.current.length > 50) {
      visitorPatternsRef.current.shift();
    }

    // Create particles at mouse position
    if (generatedLanguages.length > 0 && !isForging) {
      const randomLang = generatedLanguages[Math.floor(Math.random() * generatedLanguages.length)];
      particlesRef.current.push(createLanguageParticle(randomLang, x, y));
    }
  }, [generatedLanguages, isForging, createLanguageParticle]);

  // Forge new language
  const forgeNewLanguage = useCallback(async () => {
    if (visitorPatternsRef.current.length < 5) return;

    setIsForging(true);
    setForgeProgress(0);

    // Simulate forging process
    for (let i = 0; i <= 100; i += 10) {
      setForgeProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Generate new language
    const newLanguage = generateLanguageFromPatterns(visitorPatternsRef.current);
    setGeneratedLanguages(prev => [...prev, newLanguage]);
    languagesRef.current.push(newLanguage);

    // Create initial particles for the new language
    const canvas = canvasRef.current;
    if (canvas) {
      for (let i = 0; i < 10; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        particlesRef.current.push(createLanguageParticle(newLanguage, x, y));
      }
    }

    setIsForging(false);
    setForgeProgress(0);
  }, [generateLanguageFromPatterns, createLanguageParticle]);

  // Resize canvas
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }
  }, []);

  useEffect(() => {
    const loadStarForgeData = async () => {
      try {
        const user = await githubAPI.getUserProfile(username);
        setUserData(user);

        // Create initial languages based on GitHub data
        const initialLanguages: ProgrammingLanguage[] = [];

        // Language based on repositories
        if (user.repositories && user.repositories.length > 0) {
          const repoLang = generateLanguageFromPatterns([{
            id: 'repo-pattern',
            timestamp: Date.now(),
            action: 'repository',
            duration: user.repositories.length * 1000,
            complexity: Math.min(1, user.repositories.length / 20),
            emotionalState: 'creative'
          }]);
          repoLang.name = 'RepoScript';
          repoLang.creator = 'GitHub Repository Analysis';
          initialLanguages.push(repoLang);
        }

        // Language based on activity
        if (user.stats?.activity) {
          const activityLang = generateLanguageFromPatterns([{
            id: 'activity-pattern',
            timestamp: Date.now(),
            action: 'activity',
            duration: user.stats.activity ?
              Object.values(user.stats.activity.byType).reduce((sum: number, count) => sum + (count as number), 0) * 100 : 1000,
            complexity: 0.8,
            emotionalState: 'focused'
          }]);
          activityLang.name = 'ActivityFlow';
          activityLang.creator = 'GitHub Activity Analysis';
          initialLanguages.push(activityLang);
        }

        setGeneratedLanguages(initialLanguages);
        languagesRef.current = initialLanguages;

        // Create initial particles
        const canvas = canvasRef.current;
        if (canvas) {
          initialLanguages.forEach(language => {
            for (let i = 0; i < 5; i++) {
              const x = Math.random() * canvas.width;
              const y = Math.random() * canvas.height;
              particlesRef.current.push(createLanguageParticle(language, x, y));
            }
          });
        }

        setTimeout(() => {
          animate();
        }, 1000);
      } catch (error) {
        console.error('Error loading star forge:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      loadStarForgeData();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [username, generateLanguageFromPatterns, createLanguageParticle, animate]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Forging programming languages from starlight...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-lg overflow-hidden">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
        onMouseMove={handleMouseMove}
      />

      {/* Forge Controls */}
      <motion.div
        className="absolute top-4 left-4 bg-white/10 backdrop-blur-md rounded-lg p-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="text-white text-sm space-y-2">
          <div className="font-bold">Star Forge</div>
          <div>Languages: {generatedLanguages.length}</div>
          <div>Patterns: {visitorPatternsRef.current.length}</div>
          <button
            onClick={forgeNewLanguage}
            disabled={isForging || visitorPatternsRef.current.length < 5}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-xs transition-colors"
          >
            {isForging ? 'Forging...' : 'Forge Language'}
          </button>
        </div>
      </motion.div>

      {/* Forge Progress */}
      <AnimatePresence>
        {isForging && (
          <motion.div
            className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-lg p-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="text-white text-sm">
              <div className="font-bold">Forging Progress</div>
              <div className="w-32 bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${forgeProgress}%` }}
                ></div>
              </div>
              <div className="text-xs mt-1">{forgeProgress}%</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language List */}
      <motion.div
        className="absolute bottom-20 left-4 bg-white/10 backdrop-blur-md rounded-lg p-3 max-w-xs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-white text-sm">
          <div className="font-bold mb-2">Forged Languages</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {generatedLanguages.map((lang, index) => (
              <button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang)}
                className={`w-full text-left p-2 rounded text-xs transition-colors ${
                  selectedLanguage?.id === lang.id
                    ? 'bg-white/20'
                    : 'hover:bg-white/10'
                }`}
                style={{ color: lang.color }}
              >
                {lang.name} ({lang.paradigm})
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Selected Language Details */}
      <AnimatePresence>
        {selectedLanguage && (
          <motion.div
            className="absolute bottom-20 right-4 bg-white/10 backdrop-blur-md rounded-lg p-4 max-w-sm"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <h3 className="text-white font-bold mb-2" style={{ color: selectedLanguage.color }}>
              {selectedLanguage.name}
            </h3>
            <div className="text-white text-sm space-y-2">
              <div><strong>Paradigm:</strong> {selectedLanguage.paradigm}</div>
              <div><strong>Creator:</strong> {selectedLanguage.creator}</div>
              <div><strong>Complexity:</strong> {Math.round(selectedLanguage.complexity * 100)}%</div>
              <div><strong>Evolution:</strong> {selectedLanguage.evolution.toFixed(1)}</div>
              <div><strong>Features:</strong> {selectedLanguage.features.join(', ')}</div>
              <div className="mt-2">
                <strong>Syntax Sample:</strong>
                <div className="bg-black/30 p-2 rounded mt-1 font-mono text-xs">
                  {Object.entries(selectedLanguage.syntax).slice(0, 3).map(([key, value]) =>
                    `${key}: ${value}`
                  ).join(', ')}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <motion.div
        className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md rounded-lg p-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-white text-sm text-center">
          🌟 Move your mouse to create interaction patterns. The Star Forge analyzes your behavior
          to generate unique programming languages with custom paradigms and syntax.
        </p>
      </motion.div>

      {/* Title */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
          🌟 Portfolio Star Forge
        </h2>
        <p className="text-white/80 text-lg drop-shadow">
          AI-generated programming languages from visitor behavior
        </p>
      </motion.div>

      {/* Particle Counter */}
      <motion.div
        className="absolute bottom-20 right-4 bg-white/10 backdrop-blur-md rounded-lg p-2 text-xs text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div>Language Particles: {particlesRef.current.length}</div>
        <div>Visitor Patterns: {visitorPatternsRef.current.length}</div>
      </motion.div>
    </div>
  );
}