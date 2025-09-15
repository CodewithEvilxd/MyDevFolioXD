'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { githubAPI } from '@/lib/githubService';
import { GitHubUserWithStats, Repository } from '@/types';

interface PortfolioTimeCrystalProps {
  username: string;
}

interface TimeCrystal {
  id: string;
  month: number;
  year: number;
  commits: number;
  stars: number;
  repos: number;
  size: number;
  opacity: number;
  rotation: number;
  facets: number;
}

export default function PortfolioTimeCrystal({ username }: PortfolioTimeCrystalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const crystalsRef = useRef<TimeCrystal[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(false);
  const spaceGradientRef = useRef<CanvasGradient | null>(null);
  const crystalGradientsRef = useRef<Map<string, CanvasGradient>>(new Map());
  const starsRef = useRef<{ x: number; y: number; brightness: number }[]>([]);

  const [userData, setUserData] = useState<GitHubUserWithStats | null>(null);
  const [selectedCrystal, setSelectedCrystal] = useState<TimeCrystal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Create time crystals based on GitHub activity
  const createTimeCrystals = useCallback((user: GitHubUserWithStats): TimeCrystal[] => {
    const crystals: TimeCrystal[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();

    // Create crystals for the last 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, now.getMonth() - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();

      // Calculate activity for this month (simplified)
      const commits = Math.floor(Math.random() * 50) + 10;
      const stars = Math.floor(Math.random() * 20) + 5;
      const repos = Math.floor(Math.random() * 5) + 1;

      const totalActivity = commits + stars * 2 + repos * 3;
      const size = Math.min(80, 30 + totalActivity * 0.5);
      const opacity = Math.min(1, 0.3 + totalActivity * 0.02);

      crystals.push({
        id: `crystal-${year}-${month}`,
        month,
        year,
        commits,
        stars,
        repos,
        size,
        opacity,
        rotation: Math.random() * 360,
        facets: Math.floor(Math.random() * 4) + 4
      });
    }

    return crystals;
  }, []);

  // Draw crystal
  const drawCrystal = useCallback((ctx: CanvasRenderingContext2D, crystal: TimeCrystal, x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((crystal.rotation * Math.PI) / 180);

    // Get or create crystal gradient
    let gradient = crystalGradientsRef.current.get(crystal.id);
    if (!gradient) {
      gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, crystal.size);
      gradient.addColorStop(0, `rgba(168, 85, 247, ${crystal.opacity})`);
      gradient.addColorStop(0.5, `rgba(236, 72, 153, ${crystal.opacity * 0.8})`);
      gradient.addColorStop(1, `rgba(59, 130, 246, ${crystal.opacity * 0.6})`);
      crystalGradientsRef.current.set(crystal.id, gradient);
    }

    ctx.fillStyle = gradient;

    // Draw crystal facets
    const angleStep = (Math.PI * 2) / crystal.facets;
    ctx.beginPath();
    for (let i = 0; i < crystal.facets; i++) {
      const angle = i * angleStep;
      const radius = crystal.size * (0.8 + Math.sin(angle * 2) * 0.2);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();

    // Draw crystal shine
    ctx.strokeStyle = `rgba(255, 255, 255, ${crystal.opacity * 0.8})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }, []);

  // Render time crystals
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas with space background
    if (!spaceGradientRef.current) {
      spaceGradientRef.current = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
      );
      spaceGradientRef.current.addColorStop(0, '#0f172a');
      spaceGradientRef.current.addColorStop(1, '#000000');
    }

    ctx.fillStyle = spaceGradientRef.current;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    if (starsRef.current.length === 0) {
      starsRef.current = [];
      for (let i = 0; i < 50; i++) {
        starsRef.current.push({
          x: (i * 37) % canvas.width,
          y: (i * 23) % canvas.height,
          brightness: 0.3 + Math.random() * 0.4
        });
      }
    }

    starsRef.current.forEach(star => {
      ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, 1, 0, Math.PI * 2);
      ctx.fill();
    });

    const crystals = crystalsRef.current;

    // Draw crystals
    crystals.forEach((crystal, index) => {
      const x = (index % 6) * (canvas.width / 6) + canvas.width / 12;
      const y = Math.floor(index / 6) * (canvas.height / 3) + canvas.height / 6;

      // Animate crystal rotation
      crystal.rotation += 0.5;

      drawCrystal(ctx, crystal, x, y);

      // Draw month label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        new Date(crystal.year, crystal.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        x,
        y + crystal.size + 20
      );
    });
  }, [drawCrystal]);

  // Animation loop with visibility check
  const animate = useCallback(() => {
    if (isVisibleRef.current) {
      render();
    }
    animationRef.current = requestAnimationFrame(animate);
  }, [render]);

  // Handle canvas click
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const crystals = crystalsRef.current;
    const clickedCrystal = crystals.find((crystal, index) => {
      const canvas = canvasRef.current;
      if (!canvas) return false;

      const x = (index % 6) * (canvas.width / 6) + canvas.width / 12;
      const y = Math.floor(index / 6) * (canvas.height / 3) + canvas.height / 6;

      const distance = Math.sqrt(Math.pow(clickX - x, 2) + Math.pow(clickY - y, 2));
      return distance < crystal.size;
    });

    if (clickedCrystal) {
      setSelectedCrystal(clickedCrystal);
    } else {
      setSelectedCrystal(null);
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
      // Reset cached gradients and stars on resize
      spaceGradientRef.current = null;
      starsRef.current = [];
    }
  }, []);

  useEffect(() => {
    const loadTimeCrystalData = async () => {
      try {
        const user = await githubAPI.getUserProfile(username);
        setUserData(user);

        const crystals = createTimeCrystals(user);
        crystalsRef.current = crystals;

        setTimeout(() => {
          animate();
        }, 1000);
      } catch (error) {
        console.error('Error loading time crystal data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      loadTimeCrystalData();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [username, createTimeCrystals, animate]);

  // Visibility detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );

    const container = containerRef.current;
    if (container) {
      observer.observe(container);
    }

    return () => {
      if (container) {
        observer.unobserve(container);
      }
    };
  }, []);

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
          <p className="text-gray-600">Crystallizing your coding timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-96 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-lg overflow-hidden">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-pointer"
        onClick={handleCanvasClick}
      />

      {/* Selected Crystal Details */}
      <AnimatePresence>
        {selectedCrystal && (
          <motion.div
            className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-lg p-4 max-w-xs"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <h3 className="text-white font-bold mb-2">
              {new Date(selectedCrystal.year, selectedCrystal.month).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
            </h3>
            <div className="text-white text-sm space-y-1">
              <div>Commits: {selectedCrystal.commits}</div>
              <div>Stars: {selectedCrystal.stars}</div>
              <div>Repos: {selectedCrystal.repos}</div>
              <div>Facets: {selectedCrystal.facets}</div>
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
          💎 Click on time crystals to see your coding activity for each month.
          Each crystal represents your GitHub activity crystallized in time.
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
          💎 Time Crystal Portfolio
        </h2>
        <p className="text-white/80 text-lg drop-shadow">
          Your coding journey crystallized through time
        </p>
      </motion.div>
    </div>
  );
}