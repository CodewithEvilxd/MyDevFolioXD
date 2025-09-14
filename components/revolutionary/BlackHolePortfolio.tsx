'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { githubAPI } from '@/lib/githubService';
import { GitHubUserWithStats, Repository } from '@/types';

interface BlackHolePortfolioProps {
  username: string;
}

interface TimeZone {
  id: string;
  name: string;
  timeMultiplier: number; // How fast time passes (1 = normal, 2 = twice as fast, 0.5 = half speed)
  mass: number; // Determines gravitational pull
  radius: number;
  x: number;
  y: number;
  color: string;
  data: any; // Repository or activity data
  type: 'repo' | 'activity' | 'skill';
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  maxAge: number;
  color: string;
  size: number;
  timeZoneId: string;
}

export default function BlackHolePortfolio({ username }: BlackHolePortfolioProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeZonesRef = useRef<TimeZone[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const globalTimeRef = useRef<number>(0);

  const [userData, setUserData] = useState<GitHubUserWithStats | null>(null);
  const [selectedTimeZone, setSelectedTimeZone] = useState<TimeZone | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeDilation, setTimeDilation] = useState(1);

  // Create time zones based on GitHub data
  const createTimeZones = useCallback((user: GitHubUserWithStats): TimeZone[] => {
    const timeZones: TimeZone[] = [];
    const canvas = canvasRef.current;
    if (!canvas) return timeZones;

    const { width, height } = canvas;

    // Create repository time zones
    user.repositories?.slice(0, 8).forEach((repo, index) => {
      const mass = Math.max(10, repo.stargazers_count + repo.forks_count);
      const timeMultiplier = 1 + (mass / 100); // More popular repos = faster time
      const radius = Math.max(20, Math.min(60, mass / 5));

      timeZones.push({
        id: `repo-${repo.id}`,
        name: repo.name,
        timeMultiplier,
        mass,
        radius,
        x: (index % 4) * (width / 4) + width / 8,
        y: Math.floor(index / 4) * (height / 3) + height / 6,
        color: mass > 50 ? '#ffd700' : mass > 20 ? '#c0c0c0' : '#8b4513',
        data: repo,
        type: 'repo'
      });
    });

    // Create activity time zones
    if (user.stats?.activity) {
      const activityMass = Object.values(user.stats.activity.byType).reduce((sum: number, count) => sum + (count as number), 0);
      const activityTimeMultiplier = 1 + (activityMass / 200);

      timeZones.push({
        id: 'activity-zone',
        name: 'Activity Black Hole',
        timeMultiplier: activityTimeMultiplier,
        mass: activityMass,
        radius: Math.max(30, Math.min(80, activityMass / 10)),
        x: width * 0.75,
        y: height * 0.75,
        color: '#ff6b6b',
        data: user.stats.activity,
        type: 'activity'
      });
    }

    // Create skill time zones
    if (user.stats?.languages) {
      Object.entries(user.stats.languages).slice(0, 4).forEach(([lang, stats], index) => {
        const skillMass = (stats.repos as number) * 10;
        const skillTimeMultiplier = 1 + ((stats.repos as number) / 20);

        timeZones.push({
          id: `skill-${lang}`,
          name: `${lang} Mastery`,
          timeMultiplier: skillTimeMultiplier,
          mass: skillMass,
          radius: Math.max(15, Math.min(40, skillMass / 5)),
          x: width * (0.2 + index * 0.2),
          y: height * 0.8,
          color: '#4ecdc4',
          data: { language: lang, ...stats },
          type: 'skill'
        });
      });
    }

    return timeZones;
  }, []);

  // Calculate gravitational force between particle and time zone
  const calculateGravitationalForce = useCallback((particle: Particle, timeZone: TimeZone) => {
    const dx = timeZone.x - particle.x;
    const dy = timeZone.y - particle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < timeZone.radius) {
      // Inside event horizon - strong attraction
      const force = (timeZone.mass * 100) / (distance * distance + 1);
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;

      return {
        fx: normalizedDx * force,
        fy: normalizedDy * force,
        timeMultiplier: timeZone.timeMultiplier
      };
    } else if (distance < timeZone.radius * 3) {
      // In gravitational field - weaker attraction
      const force = (timeZone.mass * 20) / (distance * distance + 1);
      const normalizedDx = dx / distance;
      const normalizedDy = dy / distance;

      return {
        fx: normalizedDx * force,
        fy: normalizedDy * force,
        timeMultiplier: timeZone.timeMultiplier * 0.5
      };
    }

    return { fx: 0, fy: 0, timeMultiplier: 1 };
  }, []);

  // Update particle physics
  const updateParticles = useCallback(() => {
    const particles = particlesRef.current;
    const timeZones = timeZonesRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = canvas;

    particles.forEach((particle, index) => {
      let totalFx = 0;
      let totalFy = 0;
      let maxTimeMultiplier = 1;

      // Calculate forces from all time zones
      timeZones.forEach(timeZone => {
        const force = calculateGravitationalForce(particle, timeZone);
        totalFx += force.fx;
        totalFy += force.fy;
        maxTimeMultiplier = Math.max(maxTimeMultiplier, force.timeMultiplier);
      });

      // Apply forces to velocity
      particle.vx += totalFx * 0.001;
      particle.vy += totalFy * 0.001;

      // Apply time dilation to aging
      particle.age += maxTimeMultiplier;

      // Apply damping
      particle.vx *= 0.99;
      particle.vy *= 0.99;

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Boundary conditions with time dilation effect
      if (particle.x < 0 || particle.x > width) {
        particle.vx *= -0.8;
        particle.x = Math.max(0, Math.min(width, particle.x));
      }
      if (particle.y < 0 || particle.y > height) {
        particle.vy *= -0.8;
        particle.y = Math.max(0, Math.min(height, particle.y));
      }

      // Remove old particles
      if (particle.age > particle.maxAge) {
        particles.splice(index, 1);
      }
    });

    // Update global time dilation
    const avgTimeMultiplier = timeZones.reduce((sum, zone) => sum + zone.timeMultiplier, 0) / timeZones.length;
    setTimeDilation(avgTimeMultiplier);

    globalTimeRef.current += avgTimeMultiplier;
  }, [calculateGravitationalForce]);

  // Create new particles
  const createParticle = useCallback((timeZone: TimeZone): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const distance = timeZone.radius + Math.random() * timeZone.radius;

    return {
      id: `particle-${Date.now()}-${Math.random()}`,
      x: timeZone.x + Math.cos(angle) * distance,
      y: timeZone.y + Math.sin(angle) * distance,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      age: 0,
      maxAge: 300 + Math.random() * 200,
      color: timeZone.color,
      size: 2 + Math.random() * 3,
      timeZoneId: timeZone.id
    };
  }, []);

  // Render the black hole system
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Create space-like background with stars
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
    );
    gradient.addColorStop(0, '#0f0f23');
    gradient.addColorStop(1, '#000000');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    for (let i = 0; i < 100; i++) {
      const x = (i * 37) % canvas.width;
      const y = (i * 23) % canvas.height;
      const brightness = Math.sin(globalTimeRef.current * 0.01 + i) * 0.5 + 0.5;

      ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.8})`;
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    const timeZones = timeZonesRef.current;
    const particles = particlesRef.current;

    // Draw gravitational field lines
    timeZones.forEach(timeZone => {
      // Event horizon
      ctx.strokeStyle = timeZone.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(timeZone.x, timeZone.y, timeZone.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Gravitational field
      ctx.strokeStyle = timeZone.color + '40';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(timeZone.x, timeZone.y, timeZone.radius * 3, 0, Math.PI * 2);
      ctx.stroke();

      // Accretion disk effect
      if (timeZone.mass > 30) {
        ctx.fillStyle = timeZone.color + '20';
        ctx.beginPath();
        ctx.arc(timeZone.x, timeZone.y, timeZone.radius * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw particles
    particles.forEach(particle => {
      const alpha = 1 - (particle.age / particle.maxAge);
      ctx.globalAlpha = alpha;

      // Particle trail effect
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();

      // Time dilation glow effect
      const timeZone = timeZones.find(tz => tz.id === particle.timeZoneId);
      if (timeZone && timeZone.timeMultiplier > 1.5) {
        const glowGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        );
        glowGradient.addColorStop(0, particle.color + '60');
        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    });

    // Draw time zone labels
    timeZones.forEach(timeZone => {
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${timeZone.name}`,
        timeZone.x,
        timeZone.y - timeZone.radius - 10
      );

      ctx.fillStyle = timeZone.color;
      ctx.font = '10px Arial';
      ctx.fillText(
        `Time: ${timeZone.timeMultiplier.toFixed(1)}x`,
        timeZone.x,
        timeZone.y - timeZone.radius - 25
      );
    });
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    updateParticles();

    // Create new particles occasionally
    const timeZones = timeZonesRef.current;
    timeZones.forEach(timeZone => {
      if (Math.random() < 0.02) {
        particlesRef.current.push(createParticle(timeZone));
      }
    });

    render();
    animationRef.current = requestAnimationFrame(animate);
  }, [updateParticles, createParticle, render]);

  // Handle canvas click
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const timeZones = timeZonesRef.current;
    const clickedZone = timeZones.find(zone => {
      const distance = Math.sqrt(Math.pow(zone.x - x, 2) + Math.pow(zone.y - y, 2));
      return distance < zone.radius;
    });

    if (clickedZone) {
      setSelectedTimeZone(clickedZone);
    } else {
      setSelectedTimeZone(null);
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
    const loadBlackHoleData = async () => {
      try {
        const user = await githubAPI.getUserProfile(username);
        setUserData(user);

        const timeZones = createTimeZones(user);
        timeZonesRef.current = timeZones;

        setTimeout(() => {
          animate();
        }, 1000);
      } catch (error) {
        console.error('Error loading black hole portfolio:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      loadBlackHoleData();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [username, createTimeZones, animate]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Creating gravitational time fields...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 bg-black rounded-lg overflow-hidden">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-pointer"
        onClick={handleCanvasClick}
      />

      {/* Time Dilation Indicator */}
      <motion.div
        className="absolute top-4 left-4 bg-white/10 backdrop-blur-md rounded-lg p-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="text-white text-sm">
          <div className="font-bold">Global Time Dilation</div>
          <div className="text-lg">{timeDilation.toFixed(2)}x</div>
          <div className="text-xs opacity-70">
            Particles age at different rates
          </div>
        </div>
      </motion.div>

      {/* Selected Time Zone Details */}
      <AnimatePresence>
        {selectedTimeZone && (
          <motion.div
            className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-lg p-4 max-w-xs"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <h3 className="text-white font-bold mb-2">{selectedTimeZone.name}</h3>
            <div className="text-white text-sm space-y-1">
              <div>Mass: {selectedTimeZone.mass}</div>
              <div>Time Multiplier: {selectedTimeZone.timeMultiplier.toFixed(1)}x</div>
              <div>Radius: {selectedTimeZone.radius}px</div>
              {selectedTimeZone.type === 'repo' && selectedTimeZone.data && (
                <div className="mt-2 pt-2 border-t border-white/20">
                  <div>⭐ {selectedTimeZone.data.stargazers_count} stars</div>
                  <div>🍴 {selectedTimeZone.data.forks_count} forks</div>
                  <div>📝 {selectedTimeZone.data.language || 'No language'}</div>
                </div>
              )}
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
          🌌 Click on black holes to explore time dilation zones. Each zone represents a different aspect of your GitHub activity,
          where time passes at different rates based on project popularity and activity levels.
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
          🌌 Black Hole Portfolio
        </h2>
        <p className="text-white/80 text-lg drop-shadow">
          Time dilation zones powered by your GitHub gravity
        </p>
      </motion.div>

      {/* Particle Counter */}
      <motion.div
        className="absolute bottom-20 right-4 bg-white/10 backdrop-blur-md rounded-lg p-2 text-xs text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div>Particles: {particlesRef.current.length}</div>
        <div>Time Zones: {timeZonesRef.current.length}</div>
      </motion.div>
    </div>
  );
}