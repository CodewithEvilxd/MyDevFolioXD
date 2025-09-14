'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { githubAPI } from '@/lib/githubService';
import { GitHubUserWithStats } from '@/types';

interface PortfolioDreamWeaverProps {
  username: string;
}

interface DreamPattern {
  id: string;
  type: 'memory' | 'desire' | 'fear' | 'aspiration';
  intensity: number;
  color: string;
  shape: 'circle' | 'wave' | 'spiral' | 'fractal';
  message: string;
}

interface TypingPattern {
  keystrokeCount: number;
  averageInterval: number;
  rhythm: number[];
  patterns: string[];
  emotionalState: 'calm' | 'excited' | 'focused' | 'distracted';
}

export default function PortfolioDreamWeaver({ username }: PortfolioDreamWeaverProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const typingRef = useRef<TypingPattern>({
    keystrokeCount: 0,
    averageInterval: 0,
    rhythm: [],
    patterns: [],
    emotionalState: 'calm'
  });
  const dreamPatternsRef = useRef<DreamPattern[]>([]);
  const animationRef = useRef<number>();
  const lastKeyTimeRef = useRef<number>(Date.now());

  const [userData, setUserData] = useState<GitHubUserWithStats | null>(null);
  const [isDreaming, setIsDreaming] = useState(false);
  const [currentDream, setCurrentDream] = useState<DreamPattern | null>(null);
  const [dreamIntensity, setDreamIntensity] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Analyze GitHub data to create dream patterns
  const analyzeGitHubDreams = useCallback((user: GitHubUserWithStats): DreamPattern[] => {
    const dreams: DreamPattern[] = [];
    const stats = user.stats;

    if (!stats) return dreams;

    // Memory dreams - based on repository history
    if (user.repositories && user.repositories.length > 0) {
      const oldestRepo = user.repositories[user.repositories.length - 1];
      const newestRepo = user.repositories[0];
      const repoSpan = new Date(newestRepo.created_at).getTime() - new Date(oldestRepo.created_at).getTime();
      const years = repoSpan / (1000 * 60 * 60 * 24 * 365);

      dreams.push({
        id: 'memory-dream',
        type: 'memory',
        intensity: Math.min(1, years / 5), // More intense with longer history
        color: '#8b5cf6',
        shape: 'spiral',
        message: `Your ${years.toFixed(1)} year coding journey weaves through ${user.repositories.length} dreams`
      });
    }

    // Desire dreams - based on stars and forks (what others want)
    const totalStars = stats.impact?.totalStars || 0;
    const totalForks = stats.impact?.totalForks || 0;
    const desireIntensity = Math.min(1, (totalStars + totalForks) / 1000);

    if (desireIntensity > 0.1) {
      dreams.push({
        id: 'desire-dream',
        type: 'desire',
        intensity: desireIntensity,
        color: '#ec4899',
        shape: 'wave',
        message: `${totalStars} stars and ${totalForks} forks reflect the dreams others have of your code`
      });
    }

    // Fear dreams - based on issues and vulnerabilities
    const totalIssues = user.repositories?.reduce((sum, repo) => sum + (repo.open_issues_count || 0), 0) || 0;
    const fearIntensity = Math.min(1, totalIssues / 50);

    if (fearIntensity > 0.1) {
      dreams.push({
        id: 'fear-dream',
        type: 'fear',
        intensity: fearIntensity,
        color: '#ef4444',
        shape: 'fractal',
        message: `${totalIssues} open issues whisper fears of unfinished dreams`
      });
    }

    // Aspiration dreams - based on languages and growth
    const languageCount = Object.keys(stats.languages || {}).length;
    const aspirationIntensity = Math.min(1, languageCount / 10);

    if (aspirationIntensity > 0.1) {
      dreams.push({
        id: 'aspiration-dream',
        type: 'aspiration',
        intensity: aspirationIntensity,
        color: '#10b981',
        shape: 'circle',
        message: `Mastery of ${languageCount} languages fuels dreams of infinite possibilities`
      });
    }

    return dreams;
  }, []);

  // Analyze typing patterns to determine emotional state
  const analyzeTypingPatterns = useCallback(() => {
    const typing = typingRef.current;

    if (typing.rhythm.length < 5) return;

    // Calculate average interval
    const avgInterval = typing.rhythm.reduce((sum, interval) => sum + interval, 0) / typing.rhythm.length;

    // Calculate rhythm consistency (lower variance = more consistent = more focused)
    const variance = typing.rhythm.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / typing.rhythm.length;
    const consistency = Math.max(0, 1 - variance / 1000); // Normalize to 0-1

    // Determine emotional state based on patterns
    let emotionalState: TypingPattern['emotionalState'] = 'calm';

    if (consistency > 0.8 && avgInterval < 150) {
      emotionalState = 'focused'; // Fast and consistent
    } else if (consistency < 0.3 && avgInterval > 300) {
      emotionalState = 'distracted'; // Slow and inconsistent
    } else if (avgInterval < 100) {
      emotionalState = 'excited'; // Very fast typing
    }

    typing.emotionalState = emotionalState;
    typing.averageInterval = avgInterval;

    // Update dream intensity based on emotional state
    const intensityMap = {
      calm: 0.3,
      focused: 0.7,
      excited: 0.9,
      distracted: 0.1
    };

    setDreamIntensity(intensityMap[emotionalState]);
  }, []);

  // Generate dream visualization
  const generateDreamVisualization = useCallback((pattern: DreamPattern, intensity: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { width, height } = canvas;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear with dream-like fade
    ctx.fillStyle = `rgba(0, 0, 0, ${0.05 + intensity * 0.1})`;
    ctx.fillRect(0, 0, width, height);

    // Draw dream pattern based on type
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.globalAlpha = intensity;

    switch (pattern.shape) {
      case 'spiral':
        drawSpiral(ctx, pattern, intensity);
        break;
      case 'wave':
        drawWave(ctx, pattern, intensity);
        break;
      case 'fractal':
        drawFractal(ctx, pattern, intensity);
        break;
      case 'circle':
        drawCircle(ctx, pattern, intensity);
        break;
    }

    ctx.restore();

    // Add floating particles
    for (let i = 0; i < Math.floor(intensity * 20); i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 3 + 1;

      ctx.fillStyle = pattern.color + Math.floor(intensity * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  const drawSpiral = (ctx: CanvasRenderingContext2D, pattern: DreamPattern, intensity: number) => {
    ctx.strokeStyle = pattern.color;
    ctx.lineWidth = 2 + intensity * 3;
    ctx.beginPath();

    const maxRadius = 100 + intensity * 50;
    const turns = 3 + intensity * 2;

    for (let angle = 0; angle < turns * Math.PI * 2; angle += 0.1) {
      const radius = (angle / (turns * Math.PI * 2)) * maxRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      if (angle === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  };

  const drawWave = (ctx: CanvasRenderingContext2D, pattern: DreamPattern, intensity: number) => {
    ctx.strokeStyle = pattern.color;
    ctx.lineWidth = 2 + intensity * 2;
    ctx.beginPath();

    const amplitude = 30 + intensity * 20;
    const frequency = 0.02 + intensity * 0.01;

    for (let x = -150; x < 150; x += 2) {
      const y = Math.sin(x * frequency) * amplitude * Math.sin(Date.now() * 0.005);
      if (x === -150) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  };

  const drawFractal = (ctx: CanvasRenderingContext2D, pattern: DreamPattern, intensity: number) => {
    const drawBranch = (x: number, y: number, angle: number, length: number, depth: number) => {
      if (depth === 0 || length < 1) return;

      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;

      ctx.strokeStyle = pattern.color;
      ctx.lineWidth = depth * 0.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Branch out
      const branchAngle = Math.PI / 4 + intensity * Math.PI / 8;
      const newLength = length * (0.6 + intensity * 0.2);

      drawBranch(endX, endY, angle - branchAngle, newLength, depth - 1);
      drawBranch(endX, endY, angle + branchAngle, newLength, depth - 1);
    };

    drawBranch(0, 0, -Math.PI / 2, 60 + intensity * 40, Math.floor(4 + intensity * 3));
  };

  const drawCircle = (ctx: CanvasRenderingContext2D, pattern: DreamPattern, intensity: number) => {
    const radius = 50 + intensity * 30;
    const rings = Math.floor(3 + intensity * 4);

    for (let i = 0; i < rings; i++) {
      const ringRadius = radius * (i + 1) / rings;
      const alpha = (1 - i / rings) * intensity;

      ctx.strokeStyle = pattern.color;
      ctx.lineWidth = 1 + intensity * 2;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.globalAlpha = intensity;
  };

  // Handle keyboard events for typing pattern analysis
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const now = Date.now();
      const interval = now - lastKeyTimeRef.current;

      typingRef.current.keystrokeCount++;
      typingRef.current.rhythm.push(interval);

      // Keep only last 20 intervals
      if (typingRef.current.rhythm.length > 20) {
        typingRef.current.rhythm.shift();
      }

      // Add character to patterns
      typingRef.current.patterns.push(event.key);
      if (typingRef.current.patterns.length > 10) {
        typingRef.current.patterns.shift();
      }

      lastKeyTimeRef.current = now;

      // Analyze patterns periodically
      if (typingRef.current.keystrokeCount % 5 === 0) {
        analyzeTypingPatterns();
      }

      // Trigger dream state if enough typing data
      if (typingRef.current.keystrokeCount > 10 && !isDreaming) {
        setIsDreaming(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [analyzeTypingPatterns, isDreaming]);

  // Animation loop
  const animate = useCallback(() => {
    if (isDreaming && currentDream) {
      generateDreamVisualization(currentDream, dreamIntensity);
    }
    animationRef.current = requestAnimationFrame(animate);
  }, [isDreaming, currentDream, dreamIntensity, generateDreamVisualization]);

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
    const loadDreamData = async () => {
      try {
        const user = await githubAPI.getUserProfile(username);
        setUserData(user);

        const dreams = analyzeGitHubDreams(user);
        dreamPatternsRef.current = dreams;

        if (dreams.length > 0) {
          setCurrentDream(dreams[0]);
        }
      } catch (error) {
        console.error('Error loading dream weaver:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      loadDreamData();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [username, analyzeGitHubDreams]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  useEffect(() => {
    if (isDreaming) {
      animate();
    }
  }, [isDreaming, animate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Weaving your coding dreams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-lg overflow-hidden">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Dream State Indicator */}
      <AnimatePresence>
        {isDreaming && (
          <motion.div
            className="absolute top-4 left-4 bg-white/10 backdrop-blur-md rounded-lg p-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                typingRef.current.emotionalState === 'focused' ? 'bg-green-400' :
                typingRef.current.emotionalState === 'excited' ? 'bg-yellow-400' :
                typingRef.current.emotionalState === 'distracted' ? 'bg-red-400' : 'bg-blue-400'
              }`}></div>
              <span className="text-white text-sm capitalize">
                {typingRef.current.emotionalState} Dream State
              </span>
            </div>
            <div className="text-white/70 text-xs mt-1">
              Intensity: {Math.round(dreamIntensity * 100)}%
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dream Message */}
      <AnimatePresence>
        {currentDream && isDreaming && (
          <motion.div
            className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md rounded-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <p className="text-white text-center text-sm">
              {currentDream.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dream Patterns Selector */}
      <div className="absolute top-4 right-4 flex gap-2">
        {dreamPatternsRef.current.map((dream, index) => (
          <button
            key={dream.id}
            onClick={() => setCurrentDream(dream)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              currentDream?.id === dream.id
                ? 'border-white scale-110'
                : 'border-white/30 hover:border-white/60'
            }`}
            style={{ backgroundColor: dream.color + '40' }}
            title={dream.message}
          />
        ))}
      </div>

      {/* Instructions */}
      {!isDreaming && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🧠</div>
            <h2 className="text-2xl font-bold mb-2">Portfolio Dream Weaver</h2>
            <p className="text-white/80 max-w-md">
              Start typing to weave your coding dreams. Your keystrokes will reveal
              the subconscious patterns hidden in your GitHub activity.
            </p>
            <div className="mt-4 text-sm text-white/60">
              Based on your {userData?.repositories?.length || 0} repositories and coding journey
            </div>
          </div>
        </motion.div>
      )}

      {/* Dream Stats */}
      {isDreaming && (
        <motion.div
          className="absolute bottom-20 right-4 bg-white/10 backdrop-blur-md rounded-lg p-3 text-xs text-white"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div>Keystrokes: {typingRef.current.keystrokeCount}</div>
          <div>Avg Interval: {Math.round(typingRef.current.averageInterval)}ms</div>
          <div>Rhythm Points: {typingRef.current.rhythm.length}</div>
        </motion.div>
      )}
    </div>
  );
}