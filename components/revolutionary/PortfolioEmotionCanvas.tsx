'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { githubAPI } from '@/lib/githubService';
import { GitHubUserWithStats } from '@/types';

interface PortfolioEmotionCanvasProps {
  username: string;
}

interface EmotionParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  emotion: 'joy' | 'sadness' | 'anger' | 'fear' | 'surprise' | 'trust' | 'anticipation' | 'love';
  intensity: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  connections: string[]; // IDs of connected particles
  emotionalCharge: number;
}

interface EmotionalState {
  dominantEmotion: string;
  intensity: number;
  valence: number; // Positive/negative (-1 to 1)
  arousal: number; // Calm/excited (0 to 1)
  confidence: number;
  description: string;
}

interface MouseInteraction {
  x: number;
  y: number;
  velocity: number;
  pressure: number;
  emotion: string;
  timestamp: number;
}

export default function PortfolioEmotionCanvas({ username }: PortfolioEmotionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<EmotionParticle[]>([]);
  const mouseInteractionsRef = useRef<MouseInteraction[]>([]);

  const [userData, setUserData] = useState<GitHubUserWithStats | null>(null);
  const [emotionalState, setEmotionalState] = useState<EmotionalState>({
    dominantEmotion: 'joy',
    intensity: 0.5,
    valence: 0.5,
    arousal: 0.5,
    confidence: 0.5,
    description: 'Neutral emotional state'
  });
  const [isPainting, setIsPainting] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [isLoading, setIsLoading] = useState(true);

  // Emotion color mapping
  const emotionColors = useMemo(() => ({
    joy: '#FFD700',
    sadness: '#4169E1',
    anger: '#DC143C',
    fear: '#800080',
    surprise: '#FFA500',
    trust: '#32CD32',
    anticipation: '#FF6347',
    love: '#FF69B4'
  }), []);

  // Analyze GitHub data for baseline emotional state
  const analyzeGitHubEmotions = useCallback((user: GitHubUserWithStats): EmotionalState => {
    const stats = user.stats;
    if (!stats) return {
      dominantEmotion: 'joy',
      intensity: 0.5,
      valence: 0.5,
      arousal: 0.5,
      confidence: 0.5,
      description: 'Neutral emotional state'
    };

    // Calculate emotional metrics from GitHub data
    const totalStars = stats.impact?.totalStars || 0;
    const totalCommits = stats.productivity?.commitsPerDay || 0;
    const totalIssues = user.repositories?.reduce((sum, repo) => sum + (repo.open_issues_count || 0), 0) || 0;
    const followers = stats.social?.followers || 0;
    const streak = stats.streak?.current || 0;

    // Joy from stars and followers (social validation)
    const joyScore = Math.min(1, (totalStars + followers * 2) / 1000);

    // Trust from consistent activity and resolved issues
    const trustScore = Math.min(1, (streak + (totalCommits * 30)) / 365);

    // Anticipation from growing repositories and activity
    const anticipationScore = Math.min(1, (user.repositories?.length || 0) / 50);

    // Love from collaborative projects (forks)
    const totalForks = stats.impact?.totalForks || 0;
    const loveScore = Math.min(1, totalForks / 500);

    // Fear from unresolved issues
    const fearScore = Math.min(1, totalIssues / 100);

    // Anger from failed projects or low activity
    const angerScore = Math.min(1, (totalIssues > totalCommits * 10 ? 1 : 0));

    // Surprise from rapid growth
    const surpriseScore = Math.min(1, (totalStars > totalCommits * 50 ? 1 : 0));

    // Sadness from inactivity
    const sadnessScore = Math.min(1, (totalCommits < 1 ? 1 : 0));

    // Find dominant emotion
    const emotions = {
      joy: joyScore,
      trust: trustScore,
      anticipation: anticipationScore,
      love: loveScore,
      fear: fearScore,
      anger: angerScore,
      surprise: surpriseScore,
      sadness: sadnessScore
    };

    const dominantEmotion = Object.entries(emotions).reduce((a, b) => emotions[a[0] as keyof typeof emotions] > emotions[b[0] as keyof typeof emotions] ? a : b)[0];

    // Calculate overall valence and arousal
    const positiveEmotions = joyScore + trustScore + anticipationScore + loveScore;
    const negativeEmotions = fearScore + angerScore + surpriseScore + sadnessScore;
    const valence = (positiveEmotions - negativeEmotions) / (positiveEmotions + negativeEmotions + 0.1);

    const highArousalEmotions = angerScore + fearScore + surpriseScore + joyScore;
    const lowArousalEmotions = sadnessScore + trustScore;
    const arousal = highArousalEmotions / (highArousalEmotions + lowArousalEmotions + 0.1);

    const intensity = Math.max(...Object.values(emotions));
    const confidence = intensity > 0.7 ? 0.9 : intensity > 0.4 ? 0.6 : 0.3;

    const descriptions = {
      joy: 'Celebrating coding achievements and social validation',
      trust: 'Building reliable patterns through consistent activity',
      anticipation: 'Excited about future projects and growth',
      love: 'Sharing knowledge through collaborative development',
      fear: 'Concerned about unresolved issues and challenges',
      anger: 'Frustrated with obstacles and setbacks',
      surprise: 'Amazed by rapid growth and unexpected success',
      sadness: 'Reflecting on periods of low activity'
    };

    return {
      dominantEmotion,
      intensity,
      valence: isNaN(valence) ? 0 : valence,
      arousal: isNaN(arousal) ? 0.5 : arousal,
      confidence,
      description: descriptions[dominantEmotion as keyof typeof descriptions] || 'Complex emotional state'
    };
  }, []);

  // Create emotion particles
  const createEmotionParticle = useCallback((
    x: number,
    y: number,
    emotion: EmotionParticle['emotion'],
    intensity: number = 1
  ): EmotionParticle => {
    return {
      id: `emotion-${Date.now()}-${Math.random()}`,
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      emotion,
      intensity,
      color: emotionColors[emotion],
      size: 5 + Math.random() * 15,
      life: 1,
      maxLife: 200 + Math.random() * 100,
      connections: [],
      emotionalCharge: intensity
    };
  }, [emotionColors]);

  // Analyze mouse interactions for emotional patterns
  const analyzeMouseInteractions = useCallback(() => {
    const interactions = mouseInteractionsRef.current;
    if (interactions.length < 3) return;

    // Analyze movement patterns
    const recentInteractions = interactions.slice(-10);
    const velocities = recentInteractions.map(i => i.velocity);
    const avgVelocity = velocities.reduce((sum, v) => sum + v, 0) / velocities.length;

    // Analyze pressure patterns
    const pressures = recentInteractions.map(i => i.pressure);
    const avgPressure = pressures.reduce((sum, p) => sum + p, 0) / pressures.length;

    // Determine emotional state from interaction patterns
    let detectedEmotion: EmotionParticle['emotion'] = 'joy';
    let intensity = 0.5;

    if (avgVelocity > 100 && avgPressure > 0.7) {
      detectedEmotion = 'anger';
      intensity = Math.min(1, avgVelocity / 200);
    } else if (avgVelocity < 20 && avgPressure < 0.3) {
      detectedEmotion = 'sadness';
      intensity = Math.min(1, (1 - avgVelocity / 20) * 0.8);
    } else if (avgVelocity > 80 && avgPressure > 0.5) {
      detectedEmotion = 'surprise';
      intensity = Math.min(1, avgVelocity / 150);
    } else if (avgVelocity > 60 && avgPressure > 0.4) {
      detectedEmotion = 'joy';
      intensity = Math.min(1, avgVelocity / 120);
    } else if (avgVelocity < 40 && avgPressure > 0.6) {
      detectedEmotion = 'fear';
      intensity = Math.min(1, avgPressure);
    } else if (avgVelocity > 40 && avgPressure < 0.5) {
      detectedEmotion = 'anticipation';
      intensity = Math.min(1, avgVelocity / 80);
    } else if (avgPressure > 0.8) {
      detectedEmotion = 'trust';
      intensity = Math.min(1, avgPressure);
    } else {
      detectedEmotion = 'love';
      intensity = 0.6;
    }

    // Update emotional state
    setEmotionalState(prev => ({
      ...prev,
      dominantEmotion: detectedEmotion,
      intensity: intensity,
      arousal: Math.min(1, avgVelocity / 100),
      valence: detectedEmotion === 'joy' || detectedEmotion === 'love' || detectedEmotion === 'trust' ? 0.8 : -0.5,
      confidence: Math.min(1, interactions.length / 20)
    }));

    return { emotion: detectedEmotion, intensity };
  }, []);

  // Get emotional compatibility between emotions
  const getEmotionalCompatibility = useCallback((emotion1: string, emotion2: string): number => {
    const compatibilityMatrix: Record<string, Record<string, number>> = {
      joy: { joy: 0.8, trust: 0.7, love: 0.9, anticipation: 0.6, sadness: -0.3, anger: -0.5, fear: -0.4, surprise: 0.7 },
      trust: { joy: 0.7, trust: 0.9, love: 0.8, anticipation: 0.5, sadness: -0.2, anger: -0.6, fear: -0.3, surprise: 0.4 },
      love: { joy: 0.9, trust: 0.8, love: 1.0, anticipation: 0.7, sadness: -0.4, anger: -0.6, fear: -0.5, surprise: 0.8 },
      anticipation: { joy: 0.6, trust: 0.5, love: 0.7, anticipation: 0.8, sadness: -0.3, anger: 0.2, fear: 0.3, surprise: 0.9 },
      sadness: { joy: -0.3, trust: -0.2, love: -0.4, anticipation: -0.3, sadness: 0.7, anger: 0.4, fear: 0.6, surprise: -0.2 },
      anger: { joy: -0.5, trust: -0.6, love: -0.6, anticipation: 0.2, sadness: 0.4, anger: 0.8, fear: 0.5, surprise: 0.3 },
      fear: { joy: -0.4, trust: -0.3, love: -0.5, anticipation: 0.3, sadness: 0.6, anger: 0.5, fear: 0.9, surprise: 0.7 },
      surprise: { joy: 0.7, trust: 0.4, love: 0.8, anticipation: 0.9, sadness: -0.2, anger: 0.3, fear: 0.7, surprise: 1.0 }
    };

    const emotion1Compat = compatibilityMatrix[emotion1];
    if (!emotion1Compat) return 0;

    return emotion1Compat[emotion2] || 0;
  }, []);

  // Update particle physics and emotions
  const updateParticles = useCallback(() => {
    const particles = particlesRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = canvas;

    const deadIndices: number[] = [];

    particles.forEach((particle, index) => {
      // Age particle
      particle.life -= 1 / particle.maxLife;

      // Apply emotional forces
      const emotionalForce = particle.emotionalCharge * 0.5;
      particle.vx += (Math.random() - 0.5) * emotionalForce;
      particle.vy += (Math.random() - 0.5) * emotionalForce;

      // Apply damping
      particle.vx *= 0.98;
      particle.vy *= 0.98;

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Boundary conditions with emotional reflection
      if (particle.x < 0 || particle.x > width) {
        particle.vx *= -0.8;
        particle.x = Math.max(0, Math.min(width, particle.x));
        particle.emotion = particle.emotion === 'joy' ? 'surprise' : particle.emotion;
      }
      if (particle.y < 0 || particle.y > height) {
        particle.vy *= -0.8;
        particle.y = Math.max(0, Math.min(height, particle.y));
        // Keep the same emotion for boundary reflection
      }

      // Emotional interactions between particles
      particles.forEach((other, otherIndex) => {
        if (index !== otherIndex) {
          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 50 && distance > 0) {
            // Emotional attraction/repulsion
            const emotionalCompatibility = getEmotionalCompatibility(particle.emotion, other.emotion);
            const force = emotionalCompatibility * particle.emotionalCharge * other.emotionalCharge / (distance * distance);

            particle.vx += (dx / distance) * force * 0.01;
            particle.vy += (dy / distance) * force * 0.01;

            // Create emotional connections
            if (emotionalCompatibility > 0.5 && !particle.connections.includes(other.id)) {
              particle.connections.push(other.id);
            }
          }
        }
      });

      // Mark dead particles for removal
      if (particle.life <= 0) {
        deadIndices.push(index);
      }
    });

    // Remove dead particles in reverse order to maintain indices
    deadIndices.sort((a, b) => b - a);
    deadIndices.forEach(index => {
      particles.splice(index, 1);
    });

    // Clean up old mouse interactions
    mouseInteractionsRef.current = mouseInteractionsRef.current.filter(
      interaction => Date.now() - interaction.timestamp < 5000
    );
  }, [getEmotionalCompatibility]);

  // Render emotional canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Create emotional background gradient
    const bgGradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
    );

    const baseColor = emotionColors[emotionalState.dominantEmotion as keyof typeof emotionColors] || '#6366f1';
    bgGradient.addColorStop(0, baseColor + '20');
    bgGradient.addColorStop(1, '#000000');

    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;

    // Draw emotional connections
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
      const alpha = particle.life * particle.intensity;
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

      // Emotional symbol
      ctx.fillStyle = 'white';
      ctx.font = `${particle.size * 0.8}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const emotionSymbols = {
        joy: '😊',
        sadness: '😢',
        anger: '😠',
        fear: '😨',
        surprise: '😲',
        trust: '🤝',
        anticipation: '🤞',
        love: '❤️'
      };

      ctx.fillText(emotionSymbols[particle.emotion] || '😐', particle.x, particle.y);

      ctx.globalAlpha = 1;
    });

    // Draw emotional field visualization
    if (emotionalState.intensity > 0.3) {
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = 2;
      ctx.globalAlpha = emotionalState.intensity * 0.3;

      for (let i = 0; i < 3; i++) {
        const radius = 100 + i * 50;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    }
  }, [emotionalState, emotionColors]);

  // Animation loop
  const animate = useCallback(() => {
    updateParticles();
    render();
    animationRef.current = requestAnimationFrame(animate);
  }, [updateParticles, render]);

  // Handle mouse interactions
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Calculate mouse velocity and pressure
    const lastInteraction = mouseInteractionsRef.current[mouseInteractionsRef.current.length - 1];
    const velocity = lastInteraction ?
      Math.sqrt(Math.pow(x - lastInteraction.x, 2) + Math.pow(y - lastInteraction.y, 2)) : 0;

    const pressure = Math.min(1, velocity / 100); // Simulate pressure based on velocity

    mouseInteractionsRef.current.push({
      x,
      y,
      velocity,
      pressure,
      emotion: emotionalState.dominantEmotion,
      timestamp: Date.now()
    });

    // Keep only recent interactions
    if (mouseInteractionsRef.current.length > 20) {
      mouseInteractionsRef.current.shift();
    }

    // Analyze interactions for emotional patterns
    if (mouseInteractionsRef.current.length >= 5) {
      const analysis = analyzeMouseInteractions();
      if (analysis && isPainting) {
        // Create emotion particles at mouse position
        for (let i = 0; i < Math.floor(brushSize / 5); i++) {
          const offsetX = (Math.random() - 0.5) * brushSize;
          const offsetY = (Math.random() - 0.5) * brushSize;

          particlesRef.current.push(createEmotionParticle(
            x + offsetX,
            y + offsetY,
            analysis.emotion as EmotionParticle['emotion'],
            analysis.intensity
          ));
        }
      }
    }
  }, [emotionalState, brushSize, isPainting, analyzeMouseInteractions, createEmotionParticle]);

  // Handle mouse down
  const handleMouseDown = useCallback(() => {
    setIsPainting(true);
  }, []);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsPainting(false);
  }, []);

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
    const loadEmotionData = async () => {
      try {
        const user = await githubAPI.getUserProfile(username);
        setUserData(user);

        const baselineEmotion = analyzeGitHubEmotions(user);
        setEmotionalState(baselineEmotion);

        setTimeout(() => {
          animate();
        }, 1000);
      } catch (error) {
        console.error('Error loading emotion canvas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      loadEmotionData();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [username, analyzeGitHubEmotions, animate]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing emotional patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 rounded-lg overflow-hidden">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Emotional State Display */}
      <motion.div
        className="absolute top-4 left-4 bg-white/10 backdrop-blur-md rounded-lg p-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="text-white text-sm">
          <div className="font-bold capitalize">{emotionalState.dominantEmotion}</div>
          <div className="text-lg">{Math.round(emotionalState.intensity * 100)}%</div>
          <div className="text-xs opacity-70 mt-1">
            Valence: {emotionalState.valence > 0 ? '+' : ''}{Math.round(emotionalState.valence * 100)}%
          </div>
          <div className="text-xs opacity-70">
            Arousal: {Math.round(emotionalState.arousal * 100)}%
          </div>
        </div>
      </motion.div>

      {/* Painting Controls */}
      <motion.div
        className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-lg p-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="text-white text-sm space-y-2">
          <div className="font-bold">Emotion Brush</div>
          <div className="flex items-center gap-2">
            <span className="text-xs">Size:</span>
            <input
              type="range"
              min="5"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-16"
            />
            <span className="text-xs">{brushSize}</span>
          </div>
          <div className="text-xs opacity-70">
            {isPainting ? '🎨 Painting...' : 'Click & drag to paint emotions'}
          </div>
        </div>
      </motion.div>

      {/* Emotion Description */}
      <AnimatePresence>
        <motion.div
          className="absolute bottom-20 left-4 right-4 bg-white/10 backdrop-blur-md rounded-lg p-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <p className="text-white text-sm text-center">
            {emotionalState.description}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Instructions */}
      <motion.div
        className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md rounded-lg p-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-white text-sm text-center">
          🎨 Move your mouse to express emotions. Click and drag to paint emotional particles.
          Your interaction patterns reveal your current emotional state through art.
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
          🎨 Portfolio Emotion Canvas
        </h2>
        <p className="text-white/80 text-lg drop-shadow">
          Real-time emotional art from your interactions
        </p>
      </motion.div>

      {/* Particle Counter */}
      <motion.div
        className="absolute bottom-20 right-4 bg-white/10 backdrop-blur-md rounded-lg p-2 text-xs text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div>Emotional Particles: {particlesRef.current.length}</div>
        <div>Interactions: {mouseInteractionsRef.current.length}</div>
      </motion.div>
    </div>
  );
}