'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { githubAPI } from '@/lib/githubService';
import { GitHubUserWithStats } from '@/types';

interface PortfolioBlackHoleProps {
  username: string;
}

export default function PortfolioBlackHole({ username }: PortfolioBlackHoleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [userData, setUserData] = useState<GitHubUserWithStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Create black hole background
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
    );
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(0.5, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw black hole
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const time = Date.now() * 0.001;

    // Event horizon
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
    ctx.fill();

    // Accretion disk
    for (let i = 0; i < 20; i++) {
      const radius = 60 + i * 8;
      const alpha = (20 - i) / 20 * 0.8;
      ctx.strokeStyle = `rgba(255, 100, 0, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Gravitational lensing effect
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + time;
      const startRadius = 100;
      const endRadius = 200;

      ctx.beginPath();
      ctx.arc(centerX, centerY, startRadius, angle - 0.1, angle + 0.1);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, endRadius, angle - 0.05, angle + 0.05);
      ctx.stroke();
    }
  }, []);

  const animate = useCallback(() => {
    render();
    animationRef.current = requestAnimationFrame(animate);
  }, [render]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await githubAPI.getUserProfile(username);
        setUserData(user);
        setTimeout(() => animate(), 1000);
      } catch (error) {
        console.error('Error loading black hole data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) loadData();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [username, animate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Collapsing into black hole...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-red-900 via-purple-900 to-black rounded-lg overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <motion.div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">🌌 Black Hole Portfolio</h2>
        <p className="text-white/80 text-lg drop-shadow">Time dilation from your GitHub activity</p>
      </motion.div>
    </div>
  );
}