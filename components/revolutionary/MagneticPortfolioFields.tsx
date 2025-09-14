'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { githubAPI } from '@/lib/githubService';
import { GitHubUserWithStats, Repository } from '@/types';

interface MagneticPortfolioFieldsProps {
  username: string;
}

interface MagneticParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  charge: number; // Positive = attract, Negative = repel
  mass: number;
  size: number;
  color: string;
  data: any; // Repository or language data
  type: 'repo' | 'language' | 'skill';
}

interface MagneticField {
  centerX: number;
  centerY: number;
  strength: number;
  radius: number;
  type: 'attract' | 'repel';
}

export default function MagneticPortfolioFields({ username }: MagneticPortfolioFieldsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<MagneticParticle[]>([]);
  const fieldsRef = useRef<MagneticField[]>([]);

  const [userData, setUserData] = useState<GitHubUserWithStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fieldStrength, setFieldStrength] = useState(50);
  const [showStats, setShowStats] = useState(false);

  // Initialize particles from GitHub data
  const initializeParticles = useCallback((user: GitHubUserWithStats) => {
    const particles: MagneticParticle[] = [];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = canvas;

    // Create repository particles
    user.repositories?.slice(0, 20).forEach((repo, index) => {
      const charge = repo.stargazers_count > 10 ? 1 : -1; // Popular repos attract, others repel
      const mass = Math.max(1, repo.size / 1000);
      const size = Math.max(5, Math.min(20, repo.stargazers_count / 2));

      particles.push({
        id: `repo-${repo.id}`,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        charge,
        mass,
        size,
        color: charge > 0 ? '#3b82f6' : '#ef4444',
        data: repo,
        type: 'repo'
      });
    });

    // Create language particles
    if (user.stats?.languages) {
      Object.entries(user.stats.languages).slice(0, 10).forEach(([lang, stats], index) => {
        const charge = Math.random() > 0.5 ? 1 : -1;
        const mass = stats.repos * 0.5;
        const size = Math.max(8, Math.min(25, stats.repos * 2));

        particles.push({
          id: `lang-${lang}`,
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          charge,
          mass,
          size,
          color: charge > 0 ? '#10b981' : '#f59e0b',
          data: { language: lang, ...stats },
          type: 'language'
        });
      });
    }

    // Create skill particles based on activity
    if (user.stats?.activity) {
      Object.entries(user.stats.activity.byType).slice(0, 8).forEach(([type, count], index) => {
        const countNum = count as number;
        const charge = countNum > 5 ? 1 : -1;
        const mass = countNum * 0.3;
        const size = Math.max(6, Math.min(18, countNum));

        particles.push({
          id: `skill-${type}`,
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          charge,
          mass,
          size,
          color: charge > 0 ? '#8b5cf6' : '#ec4899',
          data: { skill: type, count },
          type: 'skill'
        });
      });
    }

    particlesRef.current = particles;
  }, []);

  // Update magnetic fields based on mouse position
  const updateMagneticFields = useCallback(() => {
    const mouse = mouseRef.current;
    const fields: MagneticField[] = [];

    // Mouse field
    fields.push({
      centerX: mouse.x,
      centerY: mouse.y,
      strength: fieldStrength,
      radius: 150,
      type: 'attract'
    });

    // Create additional fields based on particle clusters
    const clusters = findParticleClusters();
    clusters.forEach(cluster => {
      fields.push({
        centerX: cluster.x,
        centerY: cluster.y,
        strength: cluster.strength * 0.5,
        radius: cluster.radius,
        type: cluster.type === 'repo' ? 'attract' : 'repel'
      });
    });

    fieldsRef.current = fields;
  }, [fieldStrength]);

  // Find clusters of particles
  const findParticleClusters = () => {
    const particles = particlesRef.current;
    const clusters: Array<{ x: number; y: number; strength: number; radius: number; type: string }> = [];

    // Simple clustering algorithm
    particles.forEach((particle, i) => {
      let clusterX = particle.x;
      let clusterY = particle.y;
      let count = 1;
      let totalStrength = particle.charge;

      particles.forEach((other, j) => {
        if (i !== j) {
          const distance = Math.sqrt(
            Math.pow(particle.x - other.x, 2) + Math.pow(particle.y - other.y, 2)
          );
          if (distance < 100) {
            clusterX += other.x;
            clusterY += other.y;
            count++;
            totalStrength += other.charge;
          }
        }
      });

      if (count > 2) {
        clusters.push({
          x: clusterX / count,
          y: clusterY / count,
          strength: Math.abs(totalStrength),
          radius: Math.sqrt(count) * 20,
          type: particle.type
        });
      }
    });

    return clusters;
  };

  // Physics simulation
  const updatePhysics = useCallback(() => {
    const particles = particlesRef.current;
    const fields = fieldsRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = canvas;

    particles.forEach((particle, index) => {
      let forceX = 0;
      let forceY = 0;

      // Calculate forces from magnetic fields
      fields.forEach(field => {
        const dx = field.centerX - particle.x;
        const dy = field.centerY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0 && distance < field.radius) {
          const force = (field.strength * particle.charge * (field.type === 'attract' ? 1 : -1)) / (distance * distance);
          const normalizedDx = dx / distance;
          const normalizedDy = dy / distance;

          forceX += normalizedDx * force;
          forceY += normalizedDy * force;
        }
      });

      // Calculate forces between particles
      particles.forEach((other, otherIndex) => {
        if (index !== otherIndex) {
          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 0 && distance < 80) {
            const force = (particle.charge * other.charge * 20) / (distance * distance);
            const normalizedDx = dx / distance;
            const normalizedDy = dy / distance;

            forceX += normalizedDx * force;
            forceY += normalizedDy * force;
          }
        }
      });

      // Apply forces to velocity
      particle.vx += forceX / particle.mass * 0.01;
      particle.vy += forceY / particle.mass * 0.01;

      // Apply damping
      particle.vx *= 0.98;
      particle.vy *= 0.98;

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Boundary conditions
      if (particle.x < 0 || particle.x > width) {
        particle.vx *= -0.8;
        particle.x = Math.max(0, Math.min(width, particle.x));
      }
      if (particle.y < 0 || particle.y > height) {
        particle.vy *= -0.8;
        particle.y = Math.max(0, Math.min(height, particle.y));
      }
    });
  }, []);

  // Render particles
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas with fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw magnetic field visualization
    const fields = fieldsRef.current;
    fields.forEach(field => {
      const gradient = ctx.createRadialGradient(
        field.centerX, field.centerY, 0,
        field.centerX, field.centerY, field.radius
      );
      gradient.addColorStop(0, field.type === 'attract' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(field.centerX, field.centerY, field.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw particles
    const particles = particlesRef.current;
    particles.forEach(particle => {
      // Draw particle glow
      const glowGradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 2
      );
      glowGradient.addColorStop(0, particle.color + '40');
      glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw particle core
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();

      // Draw particle type indicator
      ctx.fillStyle = 'white';
      ctx.font = `${particle.size * 0.6}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let symbol = '';
      switch (particle.type) {
        case 'repo': symbol = '📁'; break;
        case 'language': symbol = '💻'; break;
        case 'skill': symbol = '⚡'; break;
      }
      ctx.fillText(symbol, particle.x, particle.y);
    });

    // Draw field lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    fields.forEach(field => {
      ctx.beginPath();
      ctx.arc(field.centerX, field.centerY, field.radius, 0, Math.PI * 2);
      ctx.stroke();
    });
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    updateMagneticFields();
    updatePhysics();
    render();
    animationRef.current = requestAnimationFrame(animate);
  }, [updateMagneticFields, updatePhysics, render]);

  // Mouse tracking
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
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
    const loadData = async () => {
      try {
        const user = await githubAPI.getUserProfile(username);
        setUserData(user);
        setTimeout(() => {
          initializeParticles(user);
          animate();
        }, 1000);
      } catch (error) {
        console.error('Error loading magnetic fields:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      loadData();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [username, initializeParticles, animate]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Magnetic Fields...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 bg-black rounded-lg overflow-hidden">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
        onMouseMove={handleMouseMove}
      />

      {/* Controls */}
      <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md rounded-lg p-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-white text-sm">Field Strength:</label>
            <input
              type="range"
              min="10"
              max="100"
              value={fieldStrength}
              onChange={(e) => setFieldStrength(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-white text-xs">{fieldStrength}</span>
          </div>
          <button
            onClick={() => setShowStats(!showStats)}
            className="px-3 py-1 bg-white/20 text-white text-sm rounded hover:bg-white/30 transition-colors"
          >
            {showStats ? 'Hide' : 'Show'} Stats
          </button>
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && userData && (
        <motion.div
          className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-lg p-4 max-w-xs"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-white font-bold mb-3">Magnetic Field Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/80">Total Particles:</span>
              <span className="text-white">{particlesRef.current.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Active Fields:</span>
              <span className="text-white">{fieldsRef.current.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Repos:</span>
              <span className="text-blue-400">{userData.repositories?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Languages:</span>
              <span className="text-green-400">{Object.keys(userData.stats?.languages || {}).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80">Skills:</span>
              <span className="text-purple-400">{Object.keys(userData.stats?.activity?.byType || {}).length}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md rounded-lg p-3">
        <p className="text-white text-sm text-center">
          🧲 Move your mouse to create magnetic fields. Particles are attracted/repelled based on your GitHub data:
          <span className="text-blue-400"> Repos</span> •
          <span className="text-green-400"> Languages</span> •
          <span className="text-purple-400"> Skills</span>
        </p>
      </div>

      {/* Title */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
          🧲 Magnetic Portfolio Fields
        </h2>
        <p className="text-white/80 text-lg drop-shadow">
          Interactive physics simulation powered by your GitHub activity
        </p>
      </motion.div>
    </div>
  );
}