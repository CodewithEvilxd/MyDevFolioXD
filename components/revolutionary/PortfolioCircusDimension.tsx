'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { githubAPI } from '@/lib/githubService';
import { GitHubUserWithStats, Repository } from '@/types';

interface PortfolioCircusDimensionProps {
  username: string;
}

interface CircusPerformer {
  id: string;
  x: number;
  y: number;
  type: 'acrobat' | 'clown' | 'juggler' | 'trapeze' | 'tightrope';
  skill: number; // Based on GitHub metrics
  energy: number;
  routine: string[]; // Sequence of moves
  currentMove: number;
  color: string;
  size: number;
  velocity: { x: number; y: number };
  target: { x: number; y: number };
  performance: number; // How well they're doing
}

interface CircusProp {
  id: string;
  x: number;
  y: number;
  type: 'ball' | 'ring' | 'club' | 'trapeze' | 'net';
  color: string;
  size: number;
  velocity: { x: number; y: number };
  owner?: string; // Which performer owns this prop
  trajectory: Array<{ x: number; y: number }>;
}

export default function PortfolioCircusDimension({ username }: PortfolioCircusDimensionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const performersRef = useRef<CircusPerformer[]>([]);
  const propsRef = useRef<CircusProp[]>([]);

  const [userData, setUserData] = useState<GitHubUserWithStats | null>(null);
  const [selectedPerformer, setSelectedPerformer] = useState<CircusPerformer | null>(null);
  const [showtime, setShowtime] = useState(false);
  const [audienceReaction, setAudienceReaction] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Create circus performers based on GitHub data
  const createCircusPerformers = useCallback((user: GitHubUserWithStats): CircusPerformer[] => {
    const performers: CircusPerformer[] = [];
    const canvas = canvasRef.current;
    if (!canvas) return performers;

    const { width, height } = canvas;

    // Create acrobat based on commits
    if (user.stats?.productivity?.commitsPerDay) {
      performers.push({
        id: 'acrobat-commits',
        x: width * 0.2,
        y: height * 0.3,
        type: 'acrobat',
        skill: Math.min(100, user.stats.productivity.commitsPerDay * 10),
        energy: 100,
        routine: ['flip', 'twist', 'somersault', 'balance'],
        currentMove: 0,
        color: '#3b82f6',
        size: 15,
        velocity: { x: 0, y: 0 },
        target: { x: width * 0.2, y: height * 0.3 },
        performance: 50
      });
    }

    // Create juggler based on repositories
    const repoCount = user.repositories?.length || 0;
    if (repoCount > 0) {
      performers.push({
        id: 'juggler-repos',
        x: width * 0.5,
        y: height * 0.4,
        type: 'juggler',
        skill: Math.min(100, repoCount * 5),
        energy: 100,
        routine: ['toss', 'catch', 'spin', 'cascade'],
        currentMove: 0,
        color: '#10b981',
        size: 18,
        velocity: { x: 0, y: 0 },
        target: { x: width * 0.5, y: height * 0.4 },
        performance: 50
      });
    }

    // Create clown based on issues (problem solver)
    const issueCount = user.repositories?.reduce((sum, repo) => sum + (repo.open_issues_count || 0), 0) || 0;
    if (issueCount > 0) {
      performers.push({
        id: 'clown-issues',
        x: width * 0.8,
        y: height * 0.3,
        type: 'clown',
        skill: Math.min(100, issueCount * 2),
        energy: 100,
        routine: ['juggle', 'balance', 'trick', 'laugh'],
        currentMove: 0,
        color: '#f59e0b',
        size: 20,
        velocity: { x: 0, y: 0 },
        target: { x: width * 0.8, y: height * 0.3 },
        performance: 50
      });
    }

    // Create trapeze artist based on stars
    const totalStars = user.stats?.impact?.totalStars || 0;
    if (totalStars > 0) {
      performers.push({
        id: 'trapeze-stars',
        x: width * 0.3,
        y: height * 0.2,
        type: 'trapeze',
        skill: Math.min(100, totalStars / 10),
        energy: 100,
        routine: ['swing', 'release', 'catch', 'twirl'],
        currentMove: 0,
        color: '#8b5cf6',
        size: 12,
        velocity: { x: 0, y: 0 },
        target: { x: width * 0.3, y: height * 0.2 },
        performance: 50
      });
    }

    // Create tightrope walker based on streak
    const currentStreak = user.stats?.streak?.current || 0;
    if (currentStreak > 0) {
      performers.push({
        id: 'tightrope-streak',
        x: width * 0.7,
        y: height * 0.6,
        type: 'tightrope',
        skill: Math.min(100, currentStreak * 2),
        energy: 100,
        routine: ['walk', 'balance', 'twirl', 'pose'],
        currentMove: 0,
        color: '#ec4899',
        size: 10,
        velocity: { x: 0, y: 0 },
        target: { x: width * 0.7, y: height * 0.6 },
        performance: 50
      });
    }

    return performers;
  }, []);

  // Create circus props
  const createCircusProps = useCallback((performers: CircusPerformer[]): CircusProp[] => {
    const props: CircusProp[] = [];

    performers.forEach(performer => {
      switch (performer.type) {
        case 'juggler':
          // Create balls for juggler
          for (let i = 0; i < 3; i++) {
            props.push({
              id: `ball-${performer.id}-${i}`,
              x: performer.x + (Math.random() - 0.5) * 20,
              y: performer.y - 30 - i * 10,
              type: 'ball',
              color: ['#ff6b6b', '#4ecdc4', '#45b7d1'][i % 3],
              size: 6,
              velocity: { x: 0, y: 0 },
              owner: performer.id,
              trajectory: []
            });
          }
          break;

        case 'acrobat':
          // Create rings for acrobat
          for (let i = 0; i < 2; i++) {
            props.push({
              id: `ring-${performer.id}-${i}`,
              x: performer.x + (i === 0 ? -20 : 20),
              y: performer.y - 20,
              type: 'ring',
              color: '#f59e0b',
              size: 8,
              velocity: { x: 0, y: 0 },
              owner: performer.id,
              trajectory: []
            });
          }
          break;

        case 'clown':
          // Create clubs for clown
          for (let i = 0; i < 2; i++) {
            props.push({
              id: `club-${performer.id}-${i}`,
              x: performer.x + (Math.random() - 0.5) * 30,
              y: performer.y - 25,
              type: 'club',
              color: '#8b5cf6',
              size: 4,
              velocity: { x: 0, y: 0 },
              owner: performer.id,
              trajectory: []
            });
          }
          break;
      }
    });

    return props;
  }, []);

  // Execute performer routines
  const executeRoutine = useCallback((performer: CircusPerformer, time: number) => {
    const move = performer.routine[performer.currentMove];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = canvas;

    switch (move) {
      case 'flip':
        // Acrobat flip
        performer.velocity.y = -8;
        performer.velocity.x = Math.sin(time * 0.1) * 3;
        break;

      case 'toss':
        // Juggler toss
        const props = propsRef.current.filter(p => p.owner === performer.id);
        props.forEach((prop, index) => {
          if (prop.type === 'ball') {
            prop.velocity.y = -6 - index;
            prop.velocity.x = Math.sin(time * 0.05 + index) * 2;
          }
        });
        break;

      case 'swing':
        // Trapeze swing
        performer.x = performer.target.x + Math.sin(time * 0.05) * 40;
        performer.y = performer.target.y + Math.cos(time * 0.05) * 20;
        break;

      case 'walk':
        // Tightrope walk
        performer.x += 0.5;
        if (performer.x > width * 0.9) {
          performer.x = width * 0.1;
        }
        break;

      case 'juggle':
        // Clown juggling
        const clownProps = propsRef.current.filter(p => p.owner === performer.id);
        clownProps.forEach((prop, index) => {
          prop.velocity.y = Math.sin(time * 0.1 + index * Math.PI / 2) * 3;
          prop.velocity.x = Math.cos(time * 0.1 + index * Math.PI / 2) * 2;
        });
        break;
    }

    // Advance to next move
    if (Math.random() < 0.02) {
      performer.currentMove = (performer.currentMove + 1) % performer.routine.length;
    }
  }, []);

  // Update physics
  const updatePhysics = useCallback(() => {
    const performers = performersRef.current;
    const props = propsRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = canvas;
    const time = Date.now() * 0.001;

    // Update performers
    performers.forEach(performer => {
      // Execute routine
      executeRoutine(performer, time);

      // Apply gravity
      performer.velocity.y += 0.3;

      // Update position
      performer.x += performer.velocity.x;
      performer.y += performer.velocity.y;

      // Ground collision
      if (performer.y > height - 50) {
        performer.y = height - 50;
        performer.velocity.y *= -0.6;
        performer.velocity.x *= 0.8;
      }

      // Boundary collision
      if (performer.x < 0 || performer.x > width) {
        performer.velocity.x *= -1;
        performer.x = Math.max(0, Math.min(width, performer.x));
      }

      // Energy management
      performer.energy -= 0.1;
      if (performer.energy < 20) {
        performer.energy += 10; // Rest
      }

      // Performance calculation
      const distanceFromTarget = Math.sqrt(
        Math.pow(performer.x - performer.target.x, 2) +
        Math.pow(performer.y - performer.target.y, 2)
      );
      performer.performance = Math.max(0, 100 - distanceFromTarget * 0.5);
    });

    // Update props
    props.forEach(prop => {
      // Apply gravity
      prop.velocity.y += 0.2;

      // Update position
      prop.x += prop.velocity.x;
      prop.y += prop.velocity.y;

      // Ground collision
      if (prop.y > height - 30) {
        prop.y = height - 30;
        prop.velocity.y *= -0.7;
        prop.velocity.x *= 0.8;
      }

      // Boundary collision
      if (prop.x < 0 || prop.x > width) {
        prop.velocity.x *= -1;
        prop.x = Math.max(0, Math.min(width, prop.x));
      }

      // Store trajectory
      prop.trajectory.push({ x: prop.x, y: prop.y });
      if (prop.trajectory.length > 20) {
        prop.trajectory.shift();
      }
    });

    // Calculate audience reaction
    const avgPerformance = performers.reduce((sum, p) => sum + p.performance, 0) / performers.length;
    setAudienceReaction(prev => prev * 0.9 + avgPerformance * 0.1);
  }, [executeRoutine]);

  // Render circus
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Circus tent background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Circus tent stripes
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.fillStyle = i % 40 === 0 ? '#e94560' : '#0f3460';
      ctx.fillRect(0, i, canvas.width, 10);
    }

    const performers = performersRef.current;
    const props = propsRef.current;

    // Draw props trajectories
    props.forEach(prop => {
      if (prop.trajectory.length > 1) {
        ctx.strokeStyle = prop.color + '40';
        ctx.lineWidth = 1;
        ctx.beginPath();

        prop.trajectory.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });

        ctx.stroke();
      }
    });

    // Draw props
    props.forEach(prop => {
      ctx.fillStyle = prop.color;
      ctx.beginPath();

      switch (prop.type) {
        case 'ball':
          ctx.arc(prop.x, prop.y, prop.size, 0, Math.PI * 2);
          break;
        case 'ring':
          ctx.arc(prop.x, prop.y, prop.size, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(prop.x, prop.y, prop.size * 0.7, 0, Math.PI * 2);
          break;
        case 'club':
          ctx.fillRect(prop.x - prop.size / 2, prop.y - prop.size * 2, prop.size, prop.size * 2);
          break;
      }

      ctx.fill();
    });

    // Draw performers
    performers.forEach(performer => {
      // Performance aura
      const auraRadius = performer.size + (performer.performance / 10);
      const auraGradient = ctx.createRadialGradient(
        performer.x, performer.y, 0,
        performer.x, performer.y, auraRadius
      );
      auraGradient.addColorStop(0, performer.color + '60');
      auraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = auraGradient;
      ctx.beginPath();
      ctx.arc(performer.x, performer.y, auraRadius, 0, Math.PI * 2);
      ctx.fill();

      // Performer body
      ctx.fillStyle = performer.color;
      ctx.beginPath();
      ctx.arc(performer.x, performer.y, performer.size, 0, Math.PI * 2);
      ctx.fill();

      // Energy indicator
      const energyHeight = (performer.energy / 100) * performer.size * 2;
      ctx.fillStyle = '#10b981';
      ctx.fillRect(performer.x - 2, performer.y - performer.size - 5, 4, -energyHeight);

      // Skill level indicator
      ctx.fillStyle = 'white';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(performer.skill.toString(), performer.x, performer.y + 3);
    });

    // Draw tightrope for tightrope walker
    const tightropeWalker = performers.find(p => p.type === 'tightrope');
    if (tightropeWalker) {
      ctx.strokeStyle = '#8b4513';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, tightropeWalker.target.y);
      ctx.lineTo(canvas.width, tightropeWalker.target.y);
      ctx.stroke();
    }

    // Draw trapeze for trapeze artist
    const trapezeArtist = performers.find(p => p.type === 'trapeze');
    if (trapezeArtist) {
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(trapezeArtist.target.x - 50, trapezeArtist.target.y - 100);
      ctx.lineTo(trapezeArtist.target.x + 50, trapezeArtist.target.y - 100);
      ctx.stroke();

      // Trapeze bar
      ctx.beginPath();
      ctx.arc(trapezeArtist.x, trapezeArtist.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    updatePhysics();
    render();
    animationRef.current = requestAnimationFrame(animate);
  }, [updatePhysics, render]);

  // Handle canvas click
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const performers = performersRef.current;
    const clickedPerformer = performers.find(performer => {
      const distance = Math.sqrt(
        Math.pow(performer.x - clickX, 2) + Math.pow(performer.y - clickY, 2)
      );
      return distance < performer.size;
    });

    if (clickedPerformer) {
      setSelectedPerformer(clickedPerformer);
    } else {
      setSelectedPerformer(null);
    }
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
    const loadCircusData = async () => {
      try {
        const user = await githubAPI.getUserProfile(username);
        setUserData(user);

        const performers = createCircusPerformers(user);
        const props = createCircusProps(performers);

        performersRef.current = performers;
        propsRef.current = props;

        setTimeout(() => {
          animate();
        }, 1000);
      } catch (error) {
        console.error('Error loading circus dimension:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      loadCircusData();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [username, createCircusPerformers, createCircusProps, animate]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up the big top...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 bg-gradient-to-b from-red-900 via-yellow-900 to-red-900 rounded-lg overflow-hidden">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-pointer"
        onClick={handleCanvasClick}
      />

      {/* Showtime Toggle */}
      <button
        onClick={() => setShowtime(!showtime)}
        className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-bold"
      >
        🎪 {showtime ? 'End Show' : 'Start Show'}
      </button>

      {/* Audience Reaction */}
      <motion.div
        className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-lg p-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="text-white text-sm">
          <div className="font-bold">Audience Reaction</div>
          <div className="text-lg">{Math.round(audienceReaction)}%</div>
          <div className="text-xs opacity-70">
            {audienceReaction > 80 ? '🎉 Standing Ovation!' :
             audienceReaction > 60 ? '👏 Great Performance!' :
             audienceReaction > 40 ? '🙂 Good Show' : '😕 Needs Work'}
          </div>
        </div>
      </motion.div>

      {/* Selected Performer Details */}
      <AnimatePresence>
        {selectedPerformer && (
          <motion.div
            className="absolute bottom-20 left-4 bg-white/10 backdrop-blur-md rounded-lg p-4 max-w-xs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <h3 className="text-white font-bold mb-2 capitalize">
              {selectedPerformer.type} #{selectedPerformer.id.split('-').pop()}
            </h3>
            <div className="text-white text-sm space-y-1">
              <div>Skill: {selectedPerformer.skill}/100</div>
              <div>Energy: {Math.round(selectedPerformer.energy)}%</div>
              <div>Performance: {Math.round(selectedPerformer.performance)}%</div>
              <div>Current Move: {selectedPerformer.routine[selectedPerformer.currentMove]}</div>
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
          🎭 Click on performers to see their stats. Watch as your GitHub activity transforms into
          acrobatic performances and algorithmic storytelling!
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
          🎪 Portfolio Circus Dimension
        </h2>
        <p className="text-white/80 text-lg drop-shadow">
          Code acrobatics and algorithmic performances
        </p>
      </motion.div>

      {/* Performer Legend */}
      <motion.div
        className="absolute bottom-20 right-4 bg-white/10 backdrop-blur-md rounded-lg p-2 text-xs text-white space-y-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Acrobat (Commits)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Juggler (Repos)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span>Clown (Issues)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span>Trapeze (Stars)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
          <span>Tightrope (Streak)</span>
        </div>
      </motion.div>
    </div>
  );
}