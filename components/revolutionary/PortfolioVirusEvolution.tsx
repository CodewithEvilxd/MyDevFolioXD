'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { githubAPI } from '@/lib/githubService';
import { GitHubUserWithStats, Repository } from '@/types';

interface PortfolioVirusEvolutionProps {
  username: string;
}

interface Virus {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  energy: number;
  maxEnergy: number;
  generation: number;
  dna: string[]; // Code patterns that define behavior
  color: string;
  type: 'commit' | 'star' | 'fork' | 'issue' | 'pr';
  mutationRate: number;
  lifespan: number;
  age: number;
}

interface InfectionPoint {
  x: number;
  y: number;
  strength: number;
  type: string;
  data: any;
}

export default function PortfolioVirusEvolution({ username }: PortfolioVirusEvolutionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const virusesRef = useRef<Virus[]>([]);
  const infectionPointsRef = useRef<InfectionPoint[]>([]);

  const [userData, setUserData] = useState<GitHubUserWithStats | null>(null);
  const [selectedVirus, setSelectedVirus] = useState<Virus | null>(null);
  const [evolutionStats, setEvolutionStats] = useState({
    totalViruses: 0,
    generations: 0,
    mutations: 0,
    infections: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Create initial viruses based on GitHub activity
  const createInitialViruses = useCallback((user: GitHubUserWithStats): Virus[] => {
    const viruses: Virus[] = [];
    const canvas = canvasRef.current;
    if (!canvas) return viruses;

    const { width, height } = canvas;

    // Create commit viruses
    if (user.stats?.productivity?.commitsPerDay) {
      const commitCount = Math.floor(user.stats.productivity.commitsPerDay * 10);
      for (let i = 0; i < Math.min(commitCount, 5); i++) {
        viruses.push({
          id: `commit-${i}`,
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: 8 + Math.random() * 4,
          energy: 50 + Math.random() * 50,
          maxEnergy: 100,
          generation: 1,
          dna: ['commit', 'replicate', 'mutate'],
          color: '#10b981',
          type: 'commit',
          mutationRate: 0.1,
          lifespan: 300 + Math.random() * 200,
          age: 0
        });
      }
    }

    // Create star viruses
    if (user.stats?.impact?.totalStars) {
      const starCount = Math.floor(user.stats.impact.totalStars / 10);
      for (let i = 0; i < Math.min(starCount, 3); i++) {
        viruses.push({
          id: `star-${i}`,
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          size: 10 + Math.random() * 6,
          energy: 70 + Math.random() * 30,
          maxEnergy: 120,
          generation: 1,
          dna: ['star', 'attract', 'evolve'],
          color: '#ffd700',
          type: 'star',
          mutationRate: 0.15,
          lifespan: 400 + Math.random() * 300,
          age: 0
        });
      }
    }

    // Create issue viruses
    const issueCount = user.repositories?.reduce((sum, repo) => sum + (repo.open_issues_count || 0), 0) || 0;
    if (issueCount > 0) {
      for (let i = 0; i < Math.min(issueCount, 4); i++) {
        viruses.push({
          id: `issue-${i}`,
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          size: 6 + Math.random() * 3,
          energy: 30 + Math.random() * 40,
          maxEnergy: 80,
          generation: 1,
          dna: ['issue', 'disrupt', 'spread'],
          color: '#ef4444',
          type: 'issue',
          mutationRate: 0.2,
          lifespan: 200 + Math.random() * 150,
          age: 0
        });
      }
    }

    return viruses;
  }, []);

  // Create infection points from repositories
  const createInfectionPoints = useCallback((user: GitHubUserWithStats): InfectionPoint[] => {
    const points: InfectionPoint[] = [];
    const canvas = canvasRef.current;
    if (!canvas) return points;

    const { width, height } = canvas;

    user.repositories?.slice(0, 10).forEach((repo, index) => {
      const strength = Math.max(10, repo.stargazers_count + repo.forks_count * 2);
      points.push({
        x: (index % 5) * (width / 5) + width / 10,
        y: Math.floor(index / 5) * (height / 3) + height / 6,
        strength,
        type: 'repository',
        data: repo
      });
    });

    return points;
  }, []);

  // Virus behavior based on DNA
  const executeVirusBehavior = useCallback((virus: Virus) => {
    const behaviors = {
      commit: () => {
        // Commit viruses move in patterns and create energy bursts
        virus.energy = Math.min(virus.maxEnergy, virus.energy + 0.5);
      },
      replicate: () => {
        // Replication behavior - create offspring
        if (virus.energy > virus.maxEnergy * 0.8 && Math.random() < 0.01) {
          return true; // Signal to replicate
        }
      },
      mutate: () => {
        // Mutation behavior - change DNA
        if (Math.random() < virus.mutationRate) {
          const dnaIndex = Math.floor(Math.random() * virus.dna.length);
          const mutations = ['evolve', 'spread', 'attract', 'disrupt', 'heal'];
          virus.dna[dnaIndex] = mutations[Math.floor(Math.random() * mutations.length)];
          virus.color = virus.color === '#10b981' ? '#06b6d4' :
                       virus.color === '#ffd700' ? '#f59e0b' :
                       virus.color === '#ef4444' ? '#dc2626' : virus.color;
        }
      },
      star: () => {
        // Star viruses attract other viruses
        virus.size = Math.min(20, virus.size + 0.1);
      },
      attract: () => {
        // Attraction behavior - pull nearby viruses
        return 'attract';
      },
      evolve: () => {
        // Evolution behavior - increase capabilities
        virus.mutationRate = Math.min(0.5, virus.mutationRate + 0.001);
        virus.maxEnergy = Math.min(200, virus.maxEnergy + 0.1);
      },
      spread: () => {
        // Spread behavior - move faster
        virus.vx *= 1.01;
        virus.vy *= 1.01;
      },
      disrupt: () => {
        // Disruption behavior - create chaos
        virus.vx += (Math.random() - 0.5) * 0.5;
        virus.vy += (Math.random() - 0.5) * 0.5;
      },
      heal: () => {
        // Healing behavior - restore energy
        virus.energy = Math.min(virus.maxEnergy, virus.energy + 1);
      }
    };

    const results: (boolean | string)[] = [];
    virus.dna.forEach(trait => {
      const behavior = behaviors[trait as keyof typeof behaviors];
      if (behavior) {
        const result = behavior();
        if (result) results.push(result);
      }
    });

    return results;
  }, []);

  // Virus replication
  const replicateVirus = useCallback((parent: Virus): Virus => {
    const mutation = Math.random() < parent.mutationRate;
    const newDna = mutation ?
      [...parent.dna, ['evolve', 'spread', 'attract', 'disrupt', 'heal'][Math.floor(Math.random() * 5)]] :
      [...parent.dna];

    return {
      id: `virus-${Date.now()}-${Math.random()}`,
      x: parent.x + (Math.random() - 0.5) * 20,
      y: parent.y + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.max(4, parent.size + (Math.random() - 0.5) * 2),
      energy: parent.energy * 0.6, // Child gets less energy
      maxEnergy: parent.maxEnergy,
      generation: parent.generation + 1,
      dna: newDna.slice(0, 5), // Limit DNA length
      color: mutation ? '#8b5cf6' : parent.color, // Mutated viruses are purple
      type: parent.type,
      mutationRate: parent.mutationRate,
      lifespan: parent.lifespan * 0.8, // Shorter lifespan for offspring
      age: 0
    };
  }, []);

  // Update virus physics and behavior
  const updateViruses = useCallback(() => {
    const viruses = virusesRef.current;
    const infectionPoints = infectionPointsRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = canvas;

    viruses.forEach((virus, index) => {
      // Age the virus
      virus.age += 1;
      virus.energy -= 0.1; // Energy decay

      // Execute virus behavior
      const behaviors = executeVirusBehavior(virus);

      // Handle replication
      if (behaviors.includes(true) && viruses.length < 50) {
        const child = replicateVirus(virus);
        viruses.push(child);
        virus.energy -= 20; // Replication cost
        setEvolutionStats(prev => ({
          ...prev,
          totalViruses: prev.totalViruses + 1,
          mutations: child.color === '#8b5cf6' ? prev.mutations + 1 : prev.mutations
        }));
      }

      // Handle attraction
      if (behaviors.includes('attract')) {
        viruses.forEach((other, otherIndex) => {
          if (index !== otherIndex) {
            const dx = other.x - virus.x;
            const dy = other.y - virus.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 50 && distance > 0) {
              const force = 0.5 / (distance * distance);
              other.vx += (dx / distance) * force;
              other.vy += (dy / distance) * force;
            }
          }
        });
      }

      // Interact with infection points
      infectionPoints.forEach(point => {
        const dx = point.x - virus.x;
        const dy = point.y - virus.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < point.strength / 10) {
          // Infection! Gain energy from repository
          virus.energy = Math.min(virus.maxEnergy, virus.energy + point.strength * 0.1);
          setEvolutionStats(prev => ({ ...prev, infections: prev.infections + 1 }));
        }
      });

      // Update position
      virus.x += virus.vx;
      virus.y += virus.vy;

      // Boundary conditions
      if (virus.x < 0 || virus.x > width) {
        virus.vx *= -0.8;
        virus.x = Math.max(0, Math.min(width, virus.x));
      }
      if (virus.y < 0 || virus.y > height) {
        virus.vy *= -0.8;
        virus.y = Math.max(0, Math.min(height, virus.y));
      }

      // Remove dead viruses
      if (virus.energy <= 0 || virus.age > virus.lifespan) {
        viruses.splice(index, 1);
      }
    });

    setEvolutionStats(prev => ({
      ...prev,
      totalViruses: viruses.length,
      generations: Math.max(prev.generations, ...viruses.map(v => v.generation))
    }));
  }, [executeVirusBehavior, replicateVirus]);

  // Render the virus ecosystem
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Create virus-friendly background
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
    );
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e293b');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const viruses = virusesRef.current;
    const infectionPoints = infectionPointsRef.current;

    // Draw infection points
    infectionPoints.forEach(point => {
      const alpha = point.strength / 100;
      ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 15, 0, Math.PI * 2);
      ctx.fill();

      // Infection point glow
      const glowGradient = ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, 30
      );
      glowGradient.addColorStop(0, `rgba(34, 197, 94, ${alpha * 0.3})`);
      glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 30, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw viruses
    viruses.forEach(virus => {
      const energyRatio = virus.energy / virus.maxEnergy;
      const alpha = Math.max(0.3, energyRatio);

      ctx.globalAlpha = alpha;

      // Virus body
      ctx.fillStyle = virus.color;
      ctx.beginPath();
      ctx.arc(virus.x, virus.y, virus.size, 0, Math.PI * 2);
      ctx.fill();

      // Energy glow
      if (energyRatio > 0.7) {
        const glowGradient = ctx.createRadialGradient(
          virus.x, virus.y, 0,
          virus.x, virus.y, virus.size * 2
        );
        glowGradient.addColorStop(0, virus.color + '80');
        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(virus.x, virus.y, virus.size * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // DNA strands visualization
      ctx.strokeStyle = virus.color;
      ctx.lineWidth = 1;
      virus.dna.forEach((trait, i) => {
        const angle = (i / virus.dna.length) * Math.PI * 2;
        const traitX = virus.x + Math.cos(angle) * (virus.size + 5);
        const traitY = virus.y + Math.sin(angle) * (virus.size + 5);

        ctx.beginPath();
        ctx.arc(traitX, traitY, 2, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Generation indicator
      if (virus.generation > 1) {
        ctx.fillStyle = 'white';
        ctx.font = `${virus.size * 0.4}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(virus.generation.toString(), virus.x, virus.y + 2);
      }

      ctx.globalAlpha = 1;
    });

    // Draw connections between related viruses
    viruses.forEach((virus, i) => {
      viruses.slice(i + 1).forEach(other => {
        const distance = Math.sqrt(
          Math.pow(virus.x - other.x, 2) + Math.pow(virus.y - other.y, 2)
        );

        if (distance < 80) {
          const alpha = (80 - distance) / 80 * 0.3;
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(virus.x, virus.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      });
    });
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    updateViruses();
    render();
    animationRef.current = requestAnimationFrame(animate);
  }, [updateViruses, render]);

  // Handle canvas click
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const viruses = virusesRef.current;
    const clickedVirus = viruses.find(virus => {
      const distance = Math.sqrt(
        Math.pow(virus.x - clickX, 2) + Math.pow(virus.y - clickY, 2)
      );
      return distance < virus.size;
    });

    if (clickedVirus) {
      setSelectedVirus(clickedVirus);
    } else {
      setSelectedVirus(null);
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
    const loadVirusData = async () => {
      try {
        const user = await githubAPI.getUserProfile(username);
        setUserData(user);

        const viruses = createInitialViruses(user);
        const infectionPoints = createInfectionPoints(user);

        virusesRef.current = viruses;
        infectionPointsRef.current = infectionPoints;

        setTimeout(() => {
          animate();
        }, 1000);
      } catch (error) {
        console.error('Error loading virus evolution:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      loadVirusData();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [username, createInitialViruses, createInfectionPoints, animate]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Evolving viral code organisms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 bg-slate-900 rounded-lg overflow-hidden">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-pointer"
        onClick={handleCanvasClick}
      />

      {/* Evolution Stats */}
      <motion.div
        className="absolute top-4 left-4 bg-white/10 backdrop-blur-md rounded-lg p-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="text-white text-sm space-y-1">
          <div className="font-bold">Evolution Stats</div>
          <div>Viruses: {evolutionStats.totalViruses}</div>
          <div>Generations: {evolutionStats.generations}</div>
          <div>Mutations: {evolutionStats.mutations}</div>
          <div>Infections: {evolutionStats.infections}</div>
        </div>
      </motion.div>

      {/* Selected Virus Details */}
      <AnimatePresence>
        {selectedVirus && (
          <motion.div
            className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-lg p-4 max-w-xs"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <h3 className="text-white font-bold mb-2">Virus #{selectedVirus.id.split('-').pop()}</h3>
            <div className="text-white text-sm space-y-1">
              <div>Generation: {selectedVirus.generation}</div>
              <div>Energy: {Math.round(selectedVirus.energy)}/{selectedVirus.maxEnergy}</div>
              <div>Type: {selectedVirus.type}</div>
              <div>DNA: {selectedVirus.dna.join(', ')}</div>
              <div>Age: {Math.round(selectedVirus.age)}/{Math.round(selectedVirus.lifespan)}</div>
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
          🦠 Click on viruses to examine their DNA. Watch as they evolve, replicate, and spread through your GitHub ecosystem.
          Each virus represents different aspects of your coding activity.
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
          🦠 Portfolio Virus Evolution
        </h2>
        <p className="text-white/80 text-lg drop-shadow">
          Living code organisms that evolve based on your GitHub DNA
        </p>
      </motion.div>

      {/* Virus Type Legend */}
      <motion.div
        className="absolute bottom-20 right-4 bg-white/10 backdrop-blur-md rounded-lg p-2 text-xs text-white space-y-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Commits</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span>Stars</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Issues</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span>Mutations</span>
        </div>
      </motion.div>
    </div>
  );
}