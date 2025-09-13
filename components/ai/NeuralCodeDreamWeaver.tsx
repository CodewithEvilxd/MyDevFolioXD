'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Repository } from '@/types';
import { callAI } from '@/lib/aiService';

interface DreamPattern {
  id: string;
  title: string;
  description: string;
  visualization: 'spiral' | 'wave' | 'fractal' | 'nebula' | 'matrix';
  colors: string[];
  intensity: number;
  frequency: number;
}

interface NeuralCodeDreamWeaverProps {
  username: string;
  repos: Repository[];
}

export default function NeuralCodeDreamWeaver({ username, repos }: NeuralCodeDreamWeaverProps) {
  const [dreamPatterns, setDreamPatterns] = useState<DreamPattern[]>([]);
  const [currentDream, setCurrentDream] = useState<DreamPattern | null>(null);
  const [isDreaming, setIsDreaming] = useState(false);
  const [dreamSequence, setDreamSequence] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (repos.length > 0) {
      generateDreamPatterns();
    }
  }, [repos]);

  useEffect(() => {
    if (currentDream && canvasRef.current) {
      startDreamVisualization();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentDream]);

  const generateDreamPatterns = async () => {
    setIsDreaming(true);

    try {
      // Analyze user's coding patterns
      const languages = new Set<string>();
      const topics = new Set<string>();
      const commitPatterns: { [key: string]: number } = {};
      const timePatterns: { [key: string]: number } = {};

      repos.forEach(repo => {
        if (repo.language) languages.add(repo.language);
        if (repo.topics) {
          repo.topics.forEach(topic => topics.add(topic));
        }

        // Analyze commit patterns (simplified)
        const createdDate = new Date(repo.created_at);
        const dayOfWeek = createdDate.getDay();
        const hourOfDay = createdDate.getHours();

        commitPatterns[dayOfWeek] = (commitPatterns[dayOfWeek] || 0) + 1;
        timePatterns[Math.floor(hourOfDay / 6)] = (timePatterns[Math.floor(hourOfDay / 6)] || 0) + 1;
      });

      // Generate dream patterns based on coding personality
      const basePatterns: DreamPattern[] = [
        {
          id: 'algorithm-dream',
          title: 'Algorithmic Reverie',
          description: 'Your mind weaves complex algorithmic patterns, dreaming in loops and recursions',
          visualization: 'spiral',
          colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'],
          intensity: languages.has('Python') || languages.has('JavaScript') ? 0.8 : 0.6,
          frequency: 2.5
        },
        {
          id: 'data-flow-dream',
          title: 'Data Stream Consciousness',
          description: 'Rivers of data flow through your neural networks, processing information in endless streams',
          visualization: 'wave',
          colors: ['#a8e6cf', '#dcedc8', '#ffd3b6', '#ffaaa5'],
          intensity: topics.has('data') || topics.has('analytics') ? 0.9 : 0.5,
          frequency: 1.8
        },
        {
          id: 'quantum-code-dream',
          title: 'Quantum Code Entanglement',
          description: 'Your code exists in superposition, multiple states simultaneously dancing in quantum harmony',
          visualization: 'fractal',
          colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
          intensity: topics.has('quantum') || topics.has('ai') ? 0.95 : 0.7,
          frequency: 3.2
        },
        {
          id: 'cosmic-web-dream',
          title: 'Cosmic Web Architecture',
          description: 'Your projects form constellations in the digital cosmos, connected by invisible threads of dependency',
          visualization: 'nebula',
          colors: ['#4facfe', '#00f2fe', '#43e97b', '#38f9d7'],
          intensity: repos.length > 50 ? 0.85 : 0.6,
          frequency: 1.2
        },
        {
          id: 'matrix-mind-dream',
          title: 'Matrix Mind Palace',
          description: 'Your consciousness downloads into a virtual reality where code is the architecture of existence',
          visualization: 'matrix',
          colors: ['#00ff88', '#00ffff', '#0088ff', '#8800ff'],
          intensity: topics.has('virtual') || topics.has('reality') ? 0.9 : 0.7,
          frequency: 4.0
        }
      ];

      // Use AI to enhance dream patterns with real insights
      const prompt = `Based on this developer's GitHub profile, create 3 unique dream patterns that represent their coding subconscious:

Developer: ${username}
Languages: ${Array.from(languages).join(', ')}
Topics: ${Array.from(topics).join(', ')}
Projects: ${repos.length}
Most active day: ${Object.entries(commitPatterns).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown'}

Create dream patterns that metaphorically represent their coding personality, style, and aspirations. Each pattern should have:
- A poetic title
- A description of what their code "dreams" about
- A visualization type (spiral, wave, fractal, nebula, matrix)
- Associated colors
- Intensity based on their coding style
- Frequency representing their coding rhythm

Format as JSON array.`;

      const aiResponse = await callAI({
        prompt,
        maxTokens: 800,
        temperature: 0.8
      });

      if (aiResponse.success) {
        console.log('AI Neural Dream response received, length:', aiResponse.content.length);

        // Validate that the response looks like JSON
        const content = aiResponse.content.trim();
        if (!content.startsWith('[') && !content.startsWith('{')) {
          console.warn('AI neural dream response does not appear to be JSON, using base patterns. Response starts with:', content.substring(0, 100));
          setDreamPatterns(basePatterns);
        } else {
          try {
            const aiDreams = JSON.parse(content);
            console.log('Successfully parsed AI neural dream patterns:', aiDreams.length);

            if (Array.isArray(aiDreams) && aiDreams.length > 0) {
              // Validate the structure of the first dream
              const firstDream = aiDreams[0];
              if (firstDream.title && firstDream.description) {
                const enhancedPatterns = aiDreams.map((dream: any, index: number) => ({
                  id: `ai-dream-${index}`,
                  title: dream.title || `Dream Pattern ${index + 1}`,
                  description: dream.description || 'A mysterious coding dream',
                  visualization: dream.visualization || 'spiral',
                  colors: dream.colors || ['#ff6b6b', '#4ecdc4'],
                  intensity: Math.min(1, Math.max(0.3, dream.intensity || 0.7)),
                  frequency: dream.frequency || 2.0
                }));
                setDreamPatterns([...basePatterns, ...enhancedPatterns]);
              } else {
                console.warn('AI neural dream response structure is invalid, using base patterns');
                setDreamPatterns(basePatterns);
              }
            } else {
              console.warn('AI neural dream response is not a valid array or is empty, using base patterns');
              setDreamPatterns(basePatterns);
            }
          } catch (error) {
            console.warn('AI neural dream parsing failed, using base patterns. Error:', error);
            console.warn('Raw AI neural dream response:', content.substring(0, 500));
            setDreamPatterns(basePatterns);
          }
        }
      } else {
        console.warn('AI neural dream response was not successful:', aiResponse.error);
        setDreamPatterns(basePatterns);
      }

      // Generate dream sequence
      const sequence = [
        "🌙 Entering the coding subconscious...",
        "🧠 Neural pathways activating...",
        "💭 Dreams begin to form...",
        "✨ Code patterns emerge...",
        "🌌 Consciousness expands...",
        "🎭 Reality bends to imagination..."
      ];
      setDreamSequence(sequence);

    } catch (error) {
      console.error('Error generating dream patterns:', error);
      setDreamPatterns([]);
    } finally {
      setIsDreaming(false);
    }
  };

  const startDreamVisualization = () => {
    if (!canvasRef.current || !currentDream) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      switch (currentDream.visualization) {
        case 'spiral':
          drawSpiralDream(ctx, time, currentDream);
          break;
        case 'wave':
          drawWaveDream(ctx, time, currentDream);
          break;
        case 'fractal':
          drawFractalDream(ctx, time, currentDream);
          break;
        case 'nebula':
          drawNebulaDream(ctx, time, currentDream);
          break;
        case 'matrix':
          drawMatrixDream(ctx, time, currentDream);
          break;
      }

      time += 0.02;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const drawSpiralDream = (ctx: CanvasRenderingContext2D, time: number, dream: DreamPattern) => {
    const centerX = ctx.canvas.offsetWidth / 2;
    const centerY = ctx.canvas.offsetHeight / 2;
    const maxRadius = Math.min(centerX, centerY) * 0.8;

    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * Math.PI * 4 + time * dream.frequency;
      const radius = (i / 50) * maxRadius;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      const colorIndex = Math.floor(i / (50 / dream.colors.length));
      ctx.fillStyle = dream.colors[colorIndex % dream.colors.length];
      ctx.globalAlpha = dream.intensity * (1 - i / 50);

      ctx.beginPath();
      ctx.arc(x, y, 3 + Math.sin(time * 2 + i) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawWaveDream = (ctx: CanvasRenderingContext2D, time: number, dream: DreamPattern) => {
    const width = ctx.canvas.offsetWidth;
    const height = ctx.canvas.offsetHeight;

    ctx.strokeStyle = dream.colors[0];
    ctx.lineWidth = 2;
    ctx.globalAlpha = dream.intensity;

    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      for (let x = 0; x < width; x += 5) {
        const waveY = y + Math.sin((x * 0.01 + time * dream.frequency)) * 30;
        if (x === 0) {
          ctx.moveTo(x, waveY);
        } else {
          ctx.lineTo(x, waveY);
        }
      }
      ctx.stroke();
    }
  };

  const drawFractalDream = (ctx: CanvasRenderingContext2D, time: number, dream: DreamPattern) => {
    const drawFractal = (x: number, y: number, size: number, depth: number) => {
      if (depth === 0 || size < 2) return;

      ctx.fillStyle = dream.colors[depth % dream.colors.length];
      ctx.globalAlpha = dream.intensity * (depth / 6);
      ctx.fillRect(x - size/2, y - size/2, size, size);

      const newSize = size * 0.7;
      const offset = size * 0.8;

      drawFractal(x + offset, y, newSize, depth - 1);
      drawFractal(x - offset, y, newSize, depth - 1);
      drawFractal(x, y + offset, newSize, depth - 1);
      drawFractal(x, y - offset, newSize, depth - 1);
    };

    const centerX = ctx.canvas.offsetWidth / 2;
    const centerY = ctx.canvas.offsetHeight / 2;
    drawFractal(centerX + Math.sin(time) * 50, centerY + Math.cos(time) * 50, 100, 6);
  };

  const drawNebulaDream = (ctx: CanvasRenderingContext2D, time: number, dream: DreamPattern) => {
    const width = ctx.canvas.offsetWidth;
    const height = ctx.canvas.offsetHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < 100; i++) {
      const angle = (i / 100) * Math.PI * 2;
      const radius = 50 + Math.sin(time * dream.frequency + i * 0.1) * 100;
      const x = centerX + Math.cos(angle + time) * radius;
      const y = centerY + Math.sin(angle + time) * radius;

      ctx.fillStyle = dream.colors[i % dream.colors.length];
      ctx.globalAlpha = dream.intensity * (0.3 + Math.sin(time * 2 + i) * 0.7);
      ctx.beginPath();
      ctx.arc(x, y, 2 + Math.sin(time * 3 + i) * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawMatrixDream = (ctx: CanvasRenderingContext2D, time: number, dream: DreamPattern) => {
    const width = ctx.canvas.offsetWidth;
    const height = ctx.canvas.offsetHeight;
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = new Array(columns).fill(0);

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = dream.colors[0];
    ctx.font = `${fontSize}px monospace`;
    ctx.globalAlpha = dream.intensity;

    for (let i = 0; i < drops.length; i++) {
      const text = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i] += 0.5 + Math.sin(time + i) * 0.5;
    }
  };

  const enterDream = (dream: DreamPattern) => {
    setCurrentDream(dream);
  };

  const exitDream = () => {
    setCurrentDream(null);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
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
          <h2 className='text-2xl font-bold'>🧠 Neural Code Dream Weaver</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            AI-powered visualization of your coding subconscious mind
          </p>
        </div>
        {isDreaming && (
          <div className='flex items-center gap-2'>
            <div className='w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin'></div>
            <span className='text-sm text-[var(--text-secondary)]'>Weaving dreams...</span>
          </div>
        )}
      </div>

      {/* Dream Sequence */}
      <AnimatePresence>
        {dreamSequence.length > 0 && !currentDream && (
          <motion.div
            className='mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20'
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className='flex items-center gap-3 mb-3'>
              <span className='text-2xl'>🌙</span>
              <h3 className='font-semibold'>Dream Sequence Initiated</h3>
            </div>
            <div className='space-y-2'>
              {dreamSequence.map((step, index) => (
                <motion.div
                  key={index}
                  className='flex items-center gap-3 text-sm text-[var(--text-secondary)]'
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.3 }}
                >
                  <span className='w-2 h-2 bg-purple-500 rounded-full'></span>
                  {step}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dream Patterns Grid */}
      {!currentDream && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {dreamPatterns.map((dream, index) => (
            <motion.div
              key={dream.id}
              className='p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg cursor-pointer hover:border-[var(--primary)] transition-all duration-300'
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => enterDream(dream)}
            >
              <div className='flex items-center gap-3 mb-3'>
                <div className='flex gap-1'>
                  {dream.colors.slice(0, 3).map((color, i) => (
                    <div
                      key={i}
                      className='w-3 h-3 rounded-full'
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className='text-sm font-medium text-[var(--text-secondary)]'>
                  {dream.visualization}
                </span>
              </div>

              <h3 className='font-bold mb-2'>{dream.title}</h3>
              <p className='text-sm text-[var(--text-secondary)] mb-3 line-clamp-3'>
                {dream.description}
              </p>

              <div className='flex items-center justify-between text-xs'>
                <span>Intensity: {Math.round(dream.intensity * 100)}%</span>
                <span>Frequency: {dream.frequency}x</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Dream Visualization */}
      <AnimatePresence>
        {currentDream && (
          <motion.div
            className='relative'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h3 className='text-xl font-bold'>{currentDream.title}</h3>
                <p className='text-[var(--text-secondary)]'>{currentDream.description}</p>
              </div>
              <button
                onClick={exitDream}
                className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors'
              >
                Exit Dream
              </button>
            </div>

            <div className='relative bg-black rounded-lg overflow-hidden' style={{ height: '400px' }}>
              <canvas
                ref={canvasRef}
                className='w-full h-full'
                style={{ width: '100%', height: '400px' }}
              />

              {/* Dream overlay info */}
              <div className='absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3'>
                <div className='text-white text-sm space-y-1'>
                  <div>Visualization: {currentDream.visualization}</div>
                  <div>Intensity: {Math.round(currentDream.intensity * 100)}%</div>
                  <div>Frequency: {currentDream.frequency} Hz</div>
                </div>
              </div>

              {/* Dream stats */}
              <div className='absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3'>
                <div className='text-white text-sm'>
                  <div>Based on {repos.length} repositories</div>
                  <div>Neural pattern analysis complete</div>
                </div>
              </div>
            </div>

            {/* Dream interpretation */}
            <div className='mt-4 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg border border-indigo-500/20'>
              <h4 className='font-semibold mb-2'>Dream Interpretation</h4>
              <p className='text-sm text-[var(--text-secondary)]'>
                This dream pattern represents your {currentDream.visualization === 'spiral' ? 'analytical thinking' :
                currentDream.visualization === 'wave' ? 'fluid creativity' :
                currentDream.visualization === 'fractal' ? 'complex problem-solving' :
                currentDream.visualization === 'nebula' ? 'expansive vision' :
                'systematic approach'} in coding. The colors and movements reflect your unique programming personality.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dream Statistics */}
      {dreamPatterns.length > 0 && !currentDream && (
        <div className='mt-6 grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)]'>
            <p className='text-xl font-bold text-[var(--primary)]'>{dreamPatterns.length}</p>
            <p className='text-sm text-[var(--text-secondary)]'>Dream Patterns</p>
          </div>

          <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)]'>
            <p className='text-xl font-bold text-green-500'>
              {Math.round(dreamPatterns.reduce((sum, dream) => sum + dream.intensity, 0) / dreamPatterns.length * 100)}%
            </p>
            <p className='text-sm text-[var(--text-secondary)]'>Avg Intensity</p>
          </div>

          <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)]'>
            <p className='text-xl font-bold text-blue-500'>
              {Math.round(dreamPatterns.reduce((sum, dream) => sum + dream.frequency, 0) / dreamPatterns.length * 10) / 10}
            </p>
            <p className='text-sm text-[var(--text-secondary)]'>Avg Frequency</p>
          </div>

          <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)]'>
            <p className='text-xl font-bold text-purple-500'>{repos.length}</p>
            <p className='text-sm text-[var(--text-secondary)]'>Data Sources</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}