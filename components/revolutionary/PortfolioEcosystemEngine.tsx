'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { githubAPI } from '@/lib/githubService';
import { GitHubUserWithStats, Repository } from '@/types';

interface PortfolioEcosystemEngineProps {
  username: string;
}

interface EcosystemOrganism {
  id: string;
  x: number;
  y: number;
  species: 'producer' | 'consumer' | 'decomposer' | 'predator';
  energy: number;
  maxEnergy: number;
  age: number;
  generation: number;
  size: number;
  color: string;
  velocity: { x: number; y: number };
  target: { x: number; y: number };
  dna: {
    metabolism: number;
    reproductionRate: number;
    lifespan: number;
    adaptability: number;
  };
  traits: string[];
  health: number;
}

interface EcosystemResource {
  id: string;
  x: number;
  y: number;
  type: 'sunlight' | 'nutrients' | 'water' | 'attention';
  amount: number;
  maxAmount: number;
  regenerationRate: number;
  color: string;
  size: number;
}

interface EcosystemStats {
  totalOrganisms: number;
  speciesCount: Record<string, number>;
  totalEnergy: number;
  biodiversity: number;
  ecosystemHealth: number;
  generation: number;
}

export default function PortfolioEcosystemEngine({ username }: PortfolioEcosystemEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const organismsRef = useRef<EcosystemOrganism[]>([]);
  const resourcesRef = useRef<EcosystemResource[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, attention: 0 });

  const [userData, setUserData] = useState<GitHubUserWithStats | null>(null);
  const [ecosystemStats, setEcosystemStats] = useState<EcosystemStats>({
    totalOrganisms: 0,
    speciesCount: {},
    totalEnergy: 0,
    biodiversity: 0,
    ecosystemHealth: 0,
    generation: 0
  });
  const [selectedOrganism, setSelectedOrganism] = useState<EcosystemOrganism | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Create initial ecosystem based on GitHub data
  const createInitialEcosystem = useCallback((user: GitHubUserWithStats): {
    organisms: EcosystemOrganism[];
    resources: EcosystemResource[];
  } => {
    const organisms: EcosystemOrganism[] = [];
    const resources: EcosystemResource[] = [];
    const canvas = canvasRef.current;
    if (!canvas) return { organisms, resources };

    const { width, height } = canvas;

    // Create producers based on repositories (photosynthesis = code quality)
    user.repositories?.slice(0, 10).forEach((repo, index) => {
      const quality = Math.max(0.1, (repo.stargazers_count + repo.forks_count * 2) / 100);
      organisms.push({
        id: `producer-${repo.id}`,
        x: (index % 5) * (width / 5) + width / 10,
        y: Math.floor(index / 5) * (height / 3) + height / 4,
        species: 'producer',
        energy: 50 + quality * 50,
        maxEnergy: 100 + quality * 50,
        age: 0,
        generation: 1,
        size: 8 + quality * 8,
        color: '#10b981',
        velocity: { x: 0, y: 0 },
        target: { x: 0, y: 0 },
        dna: {
          metabolism: 0.5 + quality * 0.5,
          reproductionRate: 0.1 + quality * 0.2,
          lifespan: 200 + quality * 100,
          adaptability: 0.3 + quality * 0.4
        },
        traits: ['photosynthesis', 'resilience', 'growth'],
        health: 100
      });
    });

    // Create consumers based on activity (feed on attention)
    const activityLevel = user.stats?.activity ?
      Object.values(user.stats.activity.byType).reduce((sum: number, count) => sum + (count as number), 0) : 0;
    const consumerCount = Math.min(8, Math.max(2, activityLevel / 20));

    for (let i = 0; i < consumerCount; i++) {
      organisms.push({
        id: `consumer-${i}`,
        x: Math.random() * width,
        y: Math.random() * height * 0.6,
        species: 'consumer',
        energy: 30 + Math.random() * 40,
        maxEnergy: 80,
        age: 0,
        generation: 1,
        size: 6 + Math.random() * 6,
        color: '#f59e0b',
        velocity: { x: 0, y: 0 },
        target: { x: 0, y: 0 },
        dna: {
          metabolism: 0.8,
          reproductionRate: 0.15,
          lifespan: 150,
          adaptability: 0.6
        },
        traits: ['hunting', 'mobility', 'attention-seeking'],
        health: 100
      });
    }

    // Create decomposers based on issues (clean up problems)
    const issueCount = user.repositories?.reduce((sum, repo) => sum + (repo.open_issues_count || 0), 0) || 0;
    if (issueCount > 0) {
      for (let i = 0; i < Math.min(5, issueCount); i++) {
        organisms.push({
          id: `decomposer-${i}`,
          x: Math.random() * width,
          y: height * 0.8 + Math.random() * height * 0.2,
          species: 'decomposer',
          energy: 20 + Math.random() * 30,
          maxEnergy: 60,
          age: 0,
          generation: 1,
          size: 5 + Math.random() * 4,
          color: '#8b5cf6',
          velocity: { x: 0, y: 0 },
          target: { x: 0, y: 0 },
          dna: {
            metabolism: 0.3,
            reproductionRate: 0.05,
            lifespan: 300,
            adaptability: 0.2
          },
          traits: ['recycling', 'patience', 'cleanup'],
          health: 100
        });
      }
    }

    // Create predators based on stars (top performers)
    const starCount = user.stats?.impact?.totalStars || 0;
    if (starCount > 10) {
      const predatorCount = Math.min(3, Math.floor(starCount / 20));
      for (let i = 0; i < predatorCount; i++) {
        organisms.push({
          id: `predator-${i}`,
          x: Math.random() * width,
          y: Math.random() * height * 0.4,
          species: 'predator',
          energy: 40 + Math.random() * 60,
          maxEnergy: 120,
          age: 0,
          generation: 1,
          size: 10 + Math.random() * 8,
          color: '#ef4444',
          velocity: { x: 0, y: 0 },
          target: { x: 0, y: 0 },
          dna: {
            metabolism: 1.2,
            reproductionRate: 0.08,
            lifespan: 180,
            adaptability: 0.8
          },
          traits: ['hunting', 'strength', 'dominance'],
          health: 100
        });
      }
    }

    // Create resources
    const resourceTypes: EcosystemResource['type'][] = ['sunlight', 'nutrients', 'water', 'attention'];
    const resourceColors = {
      sunlight: '#ffd700',
      nutrients: '#10b981',
      water: '#3b82f6',
      attention: '#ec4899'
    };

    for (let i = 0; i < 15; i++) {
      const type = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
      resources.push({
        id: `resource-${i}`,
        x: Math.random() * width,
        y: Math.random() * height,
        type,
        amount: 50 + Math.random() * 50,
        maxAmount: 100,
        regenerationRate: 0.5 + Math.random() * 0.5,
        color: resourceColors[type],
        size: 6 + Math.random() * 6
      });
    }

    return { organisms, resources };
  }, []);

  // Organism behavior based on species
  const executeOrganismBehavior = useCallback((organism: EcosystemOrganism, time: number) => {
    const behaviors = {
      producer: () => {
        // Producers create energy from sunlight/resources
        const nearbyResources = resourcesRef.current.filter(resource => {
          const distance = Math.sqrt(
            Math.pow(organism.x - resource.x, 2) + Math.pow(organism.y - resource.y, 2)
          );
          return distance < 50 && resource.amount > 0;
        });

        if (nearbyResources.length > 0) {
          const resource = nearbyResources[0];
          const consumption = Math.min(5, resource.amount);
          resource.amount -= consumption;
          organism.energy = Math.min(organism.maxEnergy, organism.energy + consumption * 2);
        }

        // Slow movement
        organism.velocity.x += (Math.random() - 0.5) * 0.1;
        organism.velocity.y += (Math.random() - 0.5) * 0.1;
      },

      consumer: () => {
        // Consumers seek attention and hunt producers
        const mouse = mouseRef.current;
        const mouseDistance = Math.sqrt(
          Math.pow(organism.x - mouse.x, 2) + Math.pow(organism.y - mouse.y, 2)
        );

        if (mouseDistance < 100) {
          // Move toward mouse (attention)
          const force = 0.5 / (mouseDistance + 1);
          organism.velocity.x += (mouse.x - organism.x) / mouseDistance * force;
          organism.velocity.y += (mouse.y - organism.y) / mouseDistance * force;

          // Gain energy from attention
          organism.energy = Math.min(organism.maxEnergy, organism.energy + mouse.attention * 0.1);
        } else {
          // Hunt producers
          const producers = organismsRef.current.filter(o => o.species === 'producer' && o.energy > 20);
          if (producers.length > 0) {
            const target = producers[0];
            const distance = Math.sqrt(
              Math.pow(organism.x - target.x, 2) + Math.pow(organism.y - target.y, 2)
            );

            if (distance < 30) {
              // Consume producer
              const consumption = Math.min(10, target.energy);
              target.energy -= consumption;
              organism.energy = Math.min(organism.maxEnergy, organism.energy + consumption);
            } else {
              // Move toward producer
              const force = 0.3 / (distance + 1);
              organism.velocity.x += (target.x - organism.x) / distance * force;
              organism.velocity.y += (target.y - organism.y) / distance * force;
            }
          }
        }
      },

      decomposer: () => {
        // Decomposers clean up dead organisms and recycle energy
        const deadOrganisms = organismsRef.current.filter(o => o.energy <= 0);
        if (deadOrganisms.length > 0) {
          const target = deadOrganisms[0];
          const distance = Math.sqrt(
            Math.pow(organism.x - target.x, 2) + Math.pow(organism.y - target.y, 2)
          );

          if (distance < 20) {
            // Recycle dead organism
            organism.energy = Math.min(organism.maxEnergy, organism.energy + 15);
            // Remove dead organism
            const index = organismsRef.current.indexOf(target);
            if (index > -1) organismsRef.current.splice(index, 1);
          } else {
            // Move toward dead organism
            const force = 0.2 / (distance + 1);
            organism.velocity.x += (target.x - organism.x) / distance * force;
            organism.velocity.y += (target.y - organism.y) / distance * force;
          }
        } else {
          // Slow random movement
          organism.velocity.x += (Math.random() - 0.5) * 0.05;
          organism.velocity.y += (Math.random() - 0.5) * 0.05;
        }
      },

      predator: () => {
        // Predators hunt consumers and maintain territory
        const prey = organismsRef.current.filter(o =>
          (o.species === 'consumer' || o.species === 'decomposer') && o.energy > 10
        );

        if (prey.length > 0) {
          const target = prey[0];
          const distance = Math.sqrt(
            Math.pow(organism.x - target.x, 2) + Math.pow(organism.y - target.y, 2)
          );

          if (distance < 25) {
            // Attack prey
            const damage = Math.min(20, target.energy);
            target.energy -= damage;
            target.health -= 10;
            organism.energy = Math.min(organism.maxEnergy, organism.energy + damage);
          } else {
            // Chase prey
            const force = 0.4 / (distance + 1);
            organism.velocity.x += (target.x - organism.x) / distance * force;
            organism.velocity.y += (target.y - organism.y) / distance * force;
          }
        } else {
          // Patrol territory
          if (Math.random() < 0.02) {
            organism.target.x = Math.random() * (canvasRef.current?.width || 800);
            organism.target.y = Math.random() * (canvasRef.current?.height || 600);
          }

          const distanceToTarget = Math.sqrt(
            Math.pow(organism.x - organism.target.x, 2) + Math.pow(organism.y - organism.target.y, 2)
          );

          if (distanceToTarget > 10) {
            const force = 0.1 / (distanceToTarget + 1);
            organism.velocity.x += (organism.target.x - organism.x) / distanceToTarget * force;
            organism.velocity.y += (organism.target.y - organism.y) / distanceToTarget * force;
          }
        }
      }
    };

    const behavior = behaviors[organism.species];
    if (behavior) {
      behavior();
    }
  }, []);

  // Reproduction system
  const attemptReproduction = useCallback((organism: EcosystemOrganism): EcosystemOrganism | null => {
    if (organism.energy > organism.maxEnergy * 0.8 &&
        Math.random() < organism.dna.reproductionRate &&
        organismsRef.current.length < 100) {

      // Create offspring with slight mutations
      const mutation = Math.random() < 0.1;
      const offspring: EcosystemOrganism = {
        ...organism,
        id: `${organism.species}-${Date.now()}-${Math.random()}`,
        x: organism.x + (Math.random() - 0.5) * 20,
        y: organism.y + (Math.random() - 0.5) * 20,
        energy: organism.energy * 0.4, // Parent loses energy
        age: 0,
        generation: organism.generation + 1,
        dna: {
          ...organism.dna,
          metabolism: mutation ? organism.dna.metabolism * (0.9 + Math.random() * 0.2) : organism.dna.metabolism,
          reproductionRate: mutation ? organism.dna.reproductionRate * (0.9 + Math.random() * 0.2) : organism.dna.reproductionRate,
          lifespan: mutation ? organism.dna.lifespan * (0.9 + Math.random() * 0.2) : organism.dna.lifespan,
          adaptability: mutation ? organism.dna.adaptability * (0.9 + Math.random() * 0.2) : organism.dna.adaptability
        },
        traits: [...organism.traits],
        health: 100
      };

      // Parent loses energy
      organism.energy -= offspring.energy;

      return offspring;
    }

    return null;
  }, []);

  // Update ecosystem physics
  const updateEcosystem = useCallback(() => {
    const organisms = organismsRef.current;
    const resources = resourcesRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = canvas;
    const time = Date.now() * 0.001;

    // Update organisms
    organisms.forEach((organism, index) => {
      // Age organism
      organism.age += 1;

      // Execute species behavior
      executeOrganismBehavior(organism, time);

      // Apply metabolism
      organism.energy -= organism.dna.metabolism;

      // Apply damping
      organism.velocity.x *= 0.95;
      organism.velocity.y *= 0.95;

      // Update position
      organism.x += organism.velocity.x;
      organism.y += organism.velocity.y;

      // Boundary conditions
      if (organism.x < 0 || organism.x > width) {
        organism.velocity.x *= -0.8;
        organism.x = Math.max(0, Math.min(width, organism.x));
      }
      if (organism.y < 0 || organism.y > height) {
        organism.velocity.y *= -0.8;
        organism.y = Math.max(0, Math.min(height, organism.y));
      }

      // Attempt reproduction
      const offspring = attemptReproduction(organism);
      if (offspring) {
        organisms.push(offspring);
      }

      // Remove dead organisms
      if (organism.energy <= 0 || organism.age > organism.dna.lifespan || organism.health <= 0) {
        organisms.splice(index, 1);
      }
    });

    // Update resources
    resources.forEach(resource => {
      resource.amount = Math.min(resource.maxAmount, resource.amount + resource.regenerationRate);
    });

    // Update mouse attention
    mouseRef.current.attention = Math.max(0, mouseRef.current.attention - 0.1);

    // Update ecosystem stats
    const speciesCount: Record<string, number> = {};
    let totalEnergy = 0;

    organisms.forEach(org => {
      speciesCount[org.species] = (speciesCount[org.species] || 0) + 1;
      totalEnergy += org.energy;
    });

    const biodiversity = Object.keys(speciesCount).length;
    const ecosystemHealth = organisms.length > 0 ? (totalEnergy / organisms.length) / 50 : 0;

    setEcosystemStats({
      totalOrganisms: organisms.length,
      speciesCount,
      totalEnergy,
      biodiversity,
      ecosystemHealth: Math.min(100, ecosystemHealth * 100),
      generation: Math.max(...organisms.map(o => o.generation), 0)
    });
  }, [executeOrganismBehavior, attemptReproduction]);

  // Render ecosystem
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Create ecosystem background
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
    );
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e293b');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw resources
    const resources = resourcesRef.current;
    resources.forEach(resource => {
      const alpha = resource.amount / resource.maxAmount;
      ctx.fillStyle = resource.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.arc(resource.x, resource.y, resource.size, 0, Math.PI * 2);
      ctx.fill();

      // Resource glow
      const glowGradient = ctx.createRadialGradient(
        resource.x, resource.y, 0,
        resource.x, resource.y, resource.size * 2
      );
      glowGradient.addColorStop(0, resource.color + '40');
      glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(resource.x, resource.y, resource.size * 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw organisms
    const organisms = organismsRef.current;
    organisms.forEach(organism => {
      const energyRatio = organism.energy / organism.maxEnergy;
      const alpha = Math.max(0.3, energyRatio);

      ctx.globalAlpha = alpha;

      // Organism body
      ctx.fillStyle = organism.color;
      ctx.beginPath();
      ctx.arc(organism.x, organism.y, organism.size, 0, Math.PI * 2);
      ctx.fill();

      // Health/energy indicator
      const healthHeight = (organism.health / 100) * organism.size * 2;
      ctx.fillStyle = energyRatio > 0.5 ? '#10b981' : energyRatio > 0.25 ? '#f59e0b' : '#ef4444';
      ctx.fillRect(organism.x - 2, organism.y - organism.size - 5, 4, -healthHeight);

      // Generation indicator for evolved organisms
      if (organism.generation > 1) {
        ctx.fillStyle = 'white';
        ctx.font = `${organism.size * 0.4}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(organism.generation.toString(), organism.x, organism.y + 2);
      }

      // Species-specific visual effects
      switch (organism.species) {
        case 'producer':
          // Photosynthesis effect
          if (energyRatio > 0.7) {
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(organism.x, organism.y, organism.size + 5, 0, Math.PI * 2);
            ctx.stroke();
          }
          break;

        case 'consumer':
          // Attention-seeking effect
          if (mouseRef.current.attention > 0) {
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(organism.x, organism.y, organism.size + 3, 0, Math.PI * 2);
            ctx.stroke();
          }
          break;

        case 'predator':
          // Dominance effect
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(organism.x, organism.y, organism.size + 2, 0, Math.PI * 2);
          ctx.stroke();
          break;
      }

      ctx.globalAlpha = 1;
    });

    // Draw connections between related organisms
    organisms.forEach((org, i) => {
      organisms.slice(i + 1).forEach(other => {
        const distance = Math.sqrt(
          Math.pow(org.x - other.x, 2) + Math.pow(org.y - other.y, 2)
        );

        if (distance < 60) {
          const alpha = (60 - distance) / 60 * 0.2;
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(org.x, org.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      });
    });
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    updateEcosystem();
    render();
    animationRef.current = requestAnimationFrame(animate);
  }, [updateEcosystem, render]);

  // Handle mouse movement
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      attention: Math.min(10, mouseRef.current.attention + 0.5)
    };
  }, []);

  // Handle canvas click
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const organisms = organismsRef.current;
    const clickedOrganism = organisms.find(organism => {
      const distance = Math.sqrt(
        Math.pow(organism.x - clickX, 2) + Math.pow(organism.y - clickY, 2)
      );
      return distance < organism.size;
    });

    if (clickedOrganism) {
      setSelectedOrganism(clickedOrganism);
    } else {
      setSelectedOrganism(null);
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
    const loadEcosystemData = async () => {
      try {
        const user = await githubAPI.getUserProfile(username);
        setUserData(user);

        const { organisms, resources } = createInitialEcosystem(user);
        organismsRef.current = organisms;
        resourcesRef.current = resources;

        setTimeout(() => {
          animate();
        }, 1000);
      } catch (error) {
        console.error('Error loading ecosystem engine:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      loadEcosystemData();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [username, createInitialEcosystem, animate]);

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
          <p className="text-gray-600">Initializing digital ecosystem...</p>
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
        onMouseMove={handleMouseMove}
        onClick={handleCanvasClick}
      />

      {/* Ecosystem Stats */}
      <motion.div
        className="absolute top-4 left-4 bg-white/10 backdrop-blur-md rounded-lg p-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="text-white text-sm space-y-1">
          <div className="font-bold">Ecosystem Stats</div>
          <div>Organisms: {ecosystemStats.totalOrganisms}</div>
          <div>Energy: {Math.round(ecosystemStats.totalEnergy)}</div>
          <div>Biodiversity: {ecosystemStats.biodiversity}</div>
          <div>Health: {Math.round(ecosystemStats.ecosystemHealth)}%</div>
          <div>Generation: {ecosystemStats.generation}</div>
        </div>
      </motion.div>

      {/* Species Breakdown */}
      <motion.div
        className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-lg p-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="text-white text-sm space-y-1">
          <div className="font-bold">Species</div>
          {Object.entries(ecosystemStats.speciesCount).map(([species, count]) => (
            <div key={species} className="flex justify-between">
              <span className="capitalize">{species}:</span>
              <span>{count}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Selected Organism Details */}
      <AnimatePresence>
        {selectedOrganism && (
          <motion.div
            className="absolute bottom-20 left-4 bg-white/10 backdrop-blur-md rounded-lg p-4 max-w-xs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <h3 className="text-white font-bold mb-2 capitalize">
              {selectedOrganism.species} #{selectedOrganism.id.split('-').pop()}
            </h3>
            <div className="text-white text-sm space-y-1">
              <div>Generation: {selectedOrganism.generation}</div>
              <div>Energy: {Math.round(selectedOrganism.energy)}/{selectedOrganism.maxEnergy}</div>
              <div>Age: {Math.round(selectedOrganism.age)}/{Math.round(selectedOrganism.dna.lifespan)}</div>
              <div>Health: {selectedOrganism.health}%</div>
              <div>Traits: {selectedOrganism.traits.join(', ')}</div>
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
          🌱 Move your mouse to provide attention energy. Click on organisms to examine their DNA and traits.
          Watch as your GitHub activity creates a living, evolving digital ecosystem!
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
          🌱 Portfolio Ecosystem Engine
        </h2>
        <p className="text-white/80 text-lg drop-shadow">
          Living organisms powered by your GitHub activity
        </p>
      </motion.div>

      {/* Resource Legend */}
      <motion.div
        className="absolute bottom-20 right-4 bg-white/10 backdrop-blur-md rounded-lg p-2 text-xs text-white space-y-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span>Sunlight</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Nutrients</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Water</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
          <span>Attention</span>
        </div>
      </motion.div>
    </div>
  );
}