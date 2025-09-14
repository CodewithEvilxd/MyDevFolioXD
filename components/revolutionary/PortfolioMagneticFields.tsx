'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { githubAPI } from '@/lib/githubService';
import { GitHubUserWithStats, Repository } from '@/types';

interface PortfolioMagneticFieldsProps {
  username: string;
}

interface MagneticParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  charge: number; // Positive or negative
  mass: number;
  size: number;
  color: string;
  trail: Array<{ x: number; y: number }>;
  repository?: Repository;
}

export default function PortfolioMagneticFields({ username }: PortfolioMagneticFieldsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<MagneticParticle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, charge: 1 });

  const [userData, setUserData] = useState<GitHubUserWithStats | null>(null);
  const [fieldStrength, setFieldStrength] = useState(50);
  const [isLoading, setIsLoading] = useState(true);

  // Create magnetic particles from GitHub data
  const createMagneticParticles = useCallback((user: GitHubUserWithStats): MagneticParticle[] => {
    const particles: MagneticParticle[] = [];
    const canvas = canvasRef.current;
    if (!canvas) return particles;

    // Create particles for repositories
    user.repositories?.slice(0, 10).forEach((repo, index) => {
      const charge = repo.stargazers_count > repo.forks_count ? 1 : -1;
      const mass = Math.max(1, (repo.stargazers_count + repo.forks_count) / 10);

      particles.push({
        id: `repo-${repo.id}`,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        charge,
        mass,
        size: Math.max(5, mass * 2),
        color: charge > 0 ? '#3b82f6' : '#ef4444',
        trail: [],
        repository: repo
      });
    });

    // Create additional particles for activity
    const activityCount = user.stats?.activity ?
      Object.values(user.stats.activity.byType).reduce((sum: number, count) => sum + (count as number), 0) : 0;
    for (let i = 0; i < Math.min(15, activityCount / 5); i++) {
      particles.push({
        id: `activity-${i}`,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        charge: Math.random() > 0.5 ? 1 : -1,
        mass: Math.random() * 2 + 1,
        size: Math.random() * 8 + 3,
        color: Math.random() > 0.5 ? '#10b981' : '#f59e0b',
        trail: []
      });
    }

    return particles;
  }, []);

  // Calculate magnetic force between particles
  const calculateMagneticForce = useCallback((p1: MagneticParticle, p2: MagneticParticle) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) return { fx: 0, fy: 0 };

    // Coulomb's law for magnetic fields
    const force = (fieldStrength / 100) * (p1.charge * p2.charge) / (distance * distance);
    const forceMagnitude = Math.min(5, Math.abs(force));

    const fx = (dx / distance) * forceMagnitude * (force > 0 ? 1 : -1);
    const fy = (dy / distance) * forceMagnitude * (force > 0 ? 1 : -1);

    return { fx, fy };
  }, [fieldStrength]);

  // Update particle physics
  const updateParticles = useCallback(() => {
    const particles = particlesRef.current;
    const mouse = mouseRef.current;

    particles.forEach((particle, index) => {
      let totalFx = 0;
      let totalFy = 0;

      // Calculate forces from other particles
      particles.forEach((other, otherIndex) => {
        if (index !== otherIndex) {
          const force = calculateMagneticForce(particle, other);
          totalFx += force.fx;
          totalFy += force.fy;
        }
      });

      // Mouse interaction
      const mouseDx = mouse.x - particle.x;
      const mouseDy = mouse.y - particle.y;
      const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);

      if (mouseDistance < 100) {
        const mouseForce = (fieldStrength / 100) * (particle.charge * mouse.charge) / (mouseDistance * mouseDistance);
        const mouseForceMagnitude = Math.min(10, Math.abs(mouseForce));

        totalFx += (mouseDx / mouseDistance) * mouseForceMagnitude * (mouseForce > 0 ? 1 : -1);
        totalFy += (mouseDy / mouseDistance) * mouseForceMagnitude * (mouseForce > 0 ? 1 : -1);
      }

      // Apply forces
      particle.vx += totalFx / particle.mass;
      particle.vy += totalFy / particle.mass;

      // Apply damping
      particle.vx *= 0.95;
      particle.vy *= 0.95;

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Boundary conditions
      const canvas = canvasRef.current;
      if (canvas) {
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -0.8;
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -0.8;
          particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        }
      }

      // Update trail
      particle.trail.push({ x: particle.x, y: particle.y });
      if (particle.trail.length > 20) {
        particle.trail.shift();
      }
    });
  }, [calculateMagneticForce, fieldStrength]);

  // Render magnetic field
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;

    // Draw field lines
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.lineWidth = 1;

    for (let i = 0; i < canvas.width; i += 30) {
      for (let j = 0; j < canvas.height; j += 30) {
        let totalFieldX = 0;
        let totalFieldY = 0;

        particles.forEach(particle => {
          const dx = i - particle.x;
          const dy = j - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 0) {
            const fieldStrength = particle.charge / (distance * distance);
            totalFieldX += (dx / distance) * fieldStrength;
            totalFieldY += (dy / distance) * fieldStrength;
          }
        });

        const fieldMagnitude = Math.sqrt(totalFieldX * totalFieldX + totalFieldY * totalFieldY);
        if (fieldMagnitude > 0.1) {
          const lineLength = Math.min(20, fieldMagnitude * 10);
          const endX = i + (totalFieldX / fieldMagnitude) * lineLength;
          const endY = j + (totalFieldY / fieldMagnitude) * lineLength;

          ctx.beginPath();
          ctx.moveTo(i, j);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      }
    }

    // Draw particle trails
    particles.forEach(particle => {
      if (particle.trail.length > 1) {
        ctx.strokeStyle = particle.color + '40';
        ctx.lineWidth = 2;
        ctx.beginPath();

        particle.trail.forEach((point, index) => {
          const alpha = index / particle.trail.length;
          ctx.globalAlpha = alpha * 0.5;

          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });

        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });

    // Draw particles
    particles.forEach(particle => {
      // Skip particles with invalid positions
      if (!isFinite(particle.x) || !isFinite(particle.y) || particle.size <= 0) return;

      // Particle glow
      const glowGradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 3
      );
      glowGradient.addColorStop(0, particle.color);
      glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
      ctx.fill();

      // Particle core
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();

      // Charge indicator
      ctx.fillStyle = 'white';
      ctx.font = `${particle.size}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(particle.charge > 0 ? '+' : '-', particle.x, particle.y);
    });
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    updateParticles();
    render();
    animationRef.current = requestAnimationFrame(animate);
  }, [updateParticles, render]);

  // Handle mouse movement
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      charge: 1
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
    const loadMagneticData = async () => {
      try {
        const user = await githubAPI.getUserProfile(username);
        setUserData(user);

        const particles = createMagneticParticles(user);
        particlesRef.current = particles;

        setTimeout(() => {
          animate();
        }, 1000);
      } catch (error) {
        console.error('Error loading magnetic field data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      loadMagneticData();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [username, createMagneticParticles, animate]);

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
          <p className="text-gray-600">Charging magnetic fields...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 rounded-lg overflow-hidden">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-pointer"
        onMouseMove={handleMouseMove}
      />

      {/* Field Strength Control */}
      <motion.div
        className="absolute top-4 left-4 bg-white/10 backdrop-blur-md rounded-lg p-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="text-white text-sm">
          <div className="font-bold">Field Strength</div>
          <input
            type="range"
            min="0"
            max="100"
            value={fieldStrength}
            onChange={(e) => setFieldStrength(Number(e.target.value))}
            className="w-24 mt-2"
          />
          <div className="text-xs mt-1">{fieldStrength}%</div>
        </div>
      </motion.div>

      {/* Instructions */}
      <motion.div
        className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md rounded-lg p-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-white text-sm text-center">
          🧲 Move your mouse to create magnetic fields. Watch as your GitHub repositories
          and activity create dynamic particle interactions based on stars and forks.
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
          🧲 Magnetic Portfolio Fields
        </h2>
        <p className="text-white/80 text-lg drop-shadow">
          Physics-based particle interactions from your GitHub data
        </p>
      </motion.div>
    </div>
  );
}