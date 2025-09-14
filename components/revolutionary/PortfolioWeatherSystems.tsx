'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { githubAPI } from '@/lib/githubService';
import { GitHubUserWithStats } from '@/types';

interface PortfolioWeatherSystemsProps {
  username: string;
}

interface WeatherParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  type: 'rain' | 'snow' | 'cloud' | 'lightning' | 'wind';
  color: string;
  life: number;
}

interface WeatherSystem {
  type: 'sunny' | 'rainy' | 'stormy' | 'snowy' | 'windy' | 'cloudy';
  intensity: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  emoji: string;
}

export default function PortfolioWeatherSystems({ username }: PortfolioWeatherSystemsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<WeatherParticle[]>([]);

  const [userData, setUserData] = useState<GitHubUserWithStats | null>(null);
  const [currentWeather, setCurrentWeather] = useState<WeatherSystem>({
    type: 'sunny',
    intensity: 0.5,
    temperature: 22,
    humidity: 60,
    windSpeed: 5,
    description: 'Clear skies',
    emoji: '☀️'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showWeatherStats, setShowWeatherStats] = useState(false);

  // Calculate weather based on GitHub activity
  const calculateWeatherFromActivity = useCallback((user: GitHubUserWithStats): WeatherSystem => {
    const stats = user.stats;
    if (!stats) return currentWeather;

    // Calculate activity intensity (0-1)
    const totalActivity = Object.values(stats.activity.byType).reduce((sum: number, count) => sum + (count as number), 0);
    const activityIntensity = Math.min(1, totalActivity / 100);

    // Calculate productivity score
    const productivityScore = stats.productivity?.commitsPerDay || 0;
    const productivityIntensity = Math.min(1, productivityScore / 10);

    // Calculate social engagement
    const socialScore = (stats.social?.followers || 0) + (stats.social?.following || 0);
    const socialIntensity = Math.min(1, socialScore / 100);

    // Determine weather type based on activity patterns
    let weatherType: WeatherSystem['type'];
    let intensity: number;
    let temperature: number;
    let humidity: number;
    let windSpeed: number;
    let description: string;
    let emoji: string;

    if (activityIntensity > 0.8) {
      // High activity = Stormy weather
      weatherType = 'stormy';
      intensity = activityIntensity;
      temperature = 15 + (activityIntensity * 10);
      humidity = 80 + (activityIntensity * 15);
      windSpeed = 20 + (activityIntensity * 20);
      description = 'Stormy coding session in progress';
      emoji = '⛈️';
    } else if (productivityIntensity > 0.7) {
      // High productivity = Sunny weather
      weatherType = 'sunny';
      intensity = productivityIntensity;
      temperature = 25 + (productivityIntensity * 10);
      humidity = 40 + (productivityIntensity * 20);
      windSpeed = 5 + (productivityIntensity * 5);
      description = 'Productive and sunny coding day';
      emoji = '☀️';
    } else if (socialIntensity > 0.6) {
      // High social activity = Windy weather
      weatherType = 'windy';
      intensity = socialIntensity;
      temperature = 18 + (socialIntensity * 7);
      humidity = 50 + (socialIntensity * 20);
      windSpeed = 15 + (socialIntensity * 15);
      description = 'Social winds blowing through the community';
      emoji = '💨';
    } else if (stats.streak?.current > 7) {
      // Long streak = Snowy weather (accumulation)
      weatherType = 'snowy';
      intensity = Math.min(1, stats.streak.current / 30);
      temperature = 0 + (intensity * 5);
      humidity = 90 + (intensity * 5);
      windSpeed = 3 + (intensity * 3);
      description = 'Snowy streak of consistent coding';
      emoji = '❄️';
    } else {
      // Default = Cloudy weather
      weatherType = 'cloudy';
      intensity = 0.4;
      temperature = 20;
      humidity = 65;
      windSpeed = 8;
      description = 'Cloudy with occasional commits';
      emoji = '☁️';
    }

    return {
      type: weatherType,
      intensity,
      temperature: Math.round(temperature),
      humidity: Math.round(humidity),
      windSpeed: Math.round(windSpeed),
      description,
      emoji
    };
  }, [currentWeather]);

  // Generate weather particles
  const generateWeatherParticles = useCallback((weather: WeatherSystem) => {
    const particles: WeatherParticle[] = [];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = canvas;
    const particleCount = Math.floor(weather.intensity * 50) + 10;

    for (let i = 0; i < particleCount; i++) {
      let particle: WeatherParticle;

      switch (weather.type) {
        case 'rainy':
        case 'stormy':
          particle = {
            id: `rain-${i}`,
            x: Math.random() * width,
            y: Math.random() * height,
            vx: -weather.windSpeed * 0.1 + (Math.random() - 0.5) * 2,
            vy: weather.intensity * 20 + Math.random() * 10,
            size: 2 + Math.random() * 2,
            opacity: 0.6 + Math.random() * 0.4,
            type: 'rain',
            color: '#4fc3f7',
            life: 1
          };
          break;

        case 'snowy':
          particle = {
            id: `snow-${i}`,
            x: Math.random() * width,
            y: Math.random() * height,
            vx: weather.windSpeed * 0.05 + (Math.random() - 0.5) * 1,
            vy: weather.intensity * 5 + Math.random() * 3,
            size: 3 + Math.random() * 4,
            opacity: 0.8 + Math.random() * 0.2,
            type: 'snow',
            color: '#ffffff',
            life: 1
          };
          break;

        case 'windy':
          particle = {
            id: `wind-${i}`,
            x: Math.random() * width,
            y: Math.random() * height,
            vx: weather.windSpeed * 0.3 + (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 2,
            size: 1 + Math.random() * 2,
            opacity: 0.3 + Math.random() * 0.3,
            type: 'wind',
            color: '#e0e0e0',
            life: 1
          };
          break;

        default:
          // Clouds for sunny/cloudy
          if (Math.random() > 0.7) {
            particle = {
              id: `cloud-${i}`,
              x: Math.random() * width,
              y: Math.random() * height * 0.3,
              vx: weather.windSpeed * 0.1,
              vy: 0,
              size: 20 + Math.random() * 30,
              opacity: 0.4 + Math.random() * 0.3,
              type: 'cloud',
              color: '#ffffff',
              life: 1
            };
          } else {
            continue; // Skip creating particle
          }
      }

      particles.push(particle);
    }

    // Add lightning for stormy weather
    if (weather.type === 'stormy' && Math.random() > 0.95) {
      particles.push({
        id: `lightning-${Date.now()}`,
        x: Math.random() * width,
        y: 0,
        vx: 0,
        vy: height / 10, // Fast downward motion
        size: 3,
        opacity: 1,
        type: 'lightning',
        color: '#ffff00',
        life: 0.5
      });
    }

    particlesRef.current = particles;
  }, []);

  // Update particle physics
  const updateParticles = useCallback((weather: WeatherSystem) => {
    const particles = particlesRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = canvas;

    particles.forEach((particle, index) => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Update life and opacity
      if (particle.type === 'lightning') {
        particle.life -= 0.05;
        particle.opacity = particle.life;
      }

      // Boundary conditions
      if (particle.y > height + 50) {
        // Reset particle to top
        particle.y = -50;
        particle.x = Math.random() * width;
        particle.life = 1;
        particle.opacity = 0.6 + Math.random() * 0.4;
      }

      if (particle.x < -50) {
        particle.x = width + 50;
      } else if (particle.x > width + 50) {
        particle.x = -50;
      }

      // Remove dead particles
      if (particle.life <= 0) {
        particles.splice(index, 1);
      }
    });

    // Maintain particle count
    const targetCount = Math.floor(weather.intensity * 50) + 10;
    if (particles.length < targetCount) {
      generateWeatherParticles(weather);
    }
  }, [generateWeatherParticles]);

  // Render weather system
  const render = useCallback((weather: WeatherSystem) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas with weather-appropriate background
    let bgGradient;
    switch (weather.type) {
      case 'sunny':
        bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGradient.addColorStop(0, '#87CEEB');
        bgGradient.addColorStop(1, '#98FB98');
        break;
      case 'rainy':
      case 'stormy':
        bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGradient.addColorStop(0, '#4a5568');
        bgGradient.addColorStop(1, '#2d3748');
        break;
      case 'snowy':
        bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGradient.addColorStop(0, '#e2e8f0');
        bgGradient.addColorStop(1, '#f7fafc');
        break;
      case 'windy':
        bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGradient.addColorStop(0, '#a0aec0');
        bgGradient.addColorStop(1, '#cbd5e0');
        break;
      default: // cloudy
        bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGradient.addColorStop(0, '#cbd5e0');
        bgGradient.addColorStop(1, '#e2e8f0');
    }

    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw sun for sunny weather
    if (weather.type === 'sunny') {
      const sunX = canvas.width * 0.8;
      const sunY = canvas.height * 0.2;
      const sunRadius = 40;

      // Sun glow
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 2);
      sunGlow.addColorStop(0, 'rgba(255, 255, 0, 0.3)');
      sunGlow.addColorStop(1, 'rgba(255, 255, 0, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Sun
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw particles
    const particles = particlesRef.current;
    particles.forEach(particle => {
      ctx.globalAlpha = particle.opacity;

      if (particle.type === 'cloud') {
        // Draw cloud as multiple circles
        ctx.fillStyle = particle.color;
        const cloudParts = 5;
        for (let i = 0; i < cloudParts; i++) {
          const offsetX = (i - 2) * (particle.size / 3);
          ctx.beginPath();
          ctx.arc(particle.x + offsetX, particle.y, particle.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Draw other particles as circles
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    });

    // Draw weather effects overlay
    if (weather.type === 'stormy') {
      // Dark overlay for storms
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    updateParticles(currentWeather);
    render(currentWeather);
    animationRef.current = requestAnimationFrame(animate);
  }, [currentWeather, updateParticles, render]);

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
    const loadWeatherData = async () => {
      try {
        const user = await githubAPI.getUserProfile(username);
        setUserData(user);

        const weather = calculateWeatherFromActivity(user);
        setCurrentWeather(weather);

        setTimeout(() => {
          generateWeatherParticles(weather);
          animate();
        }, 1000);
      } catch (error) {
        console.error('Error loading weather systems:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      loadWeatherData();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [username, calculateWeatherFromActivity, generateWeatherParticles, animate]);

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
          <p className="text-gray-600">Analyzing GitHub weather patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 bg-gradient-to-b from-blue-400 to-green-400 rounded-lg overflow-hidden">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Weather Info Overlay */}
      <motion.div
        className="absolute top-4 left-4 bg-white/20 backdrop-blur-md rounded-lg p-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{currentWeather.emoji}</span>
          <div>
            <h3 className="text-white font-bold text-lg capitalize">{currentWeather.type}</h3>
            <p className="text-white/80 text-sm">{currentWeather.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-white">
            <div className="font-medium">🌡️ {currentWeather.temperature}°C</div>
            <div className="text-white/70">Temperature</div>
          </div>
          <div className="text-white">
            <div className="font-medium">💧 {currentWeather.humidity}%</div>
            <div className="text-white/70">Humidity</div>
          </div>
          <div className="text-white">
            <div className="font-medium">💨 {currentWeather.windSpeed} km/h</div>
            <div className="text-white/70">Wind Speed</div>
          </div>
          <div className="text-white">
            <div className="font-medium">⚡ {Math.round(currentWeather.intensity * 100)}%</div>
            <div className="text-white/70">Intensity</div>
          </div>
        </div>
      </motion.div>

      {/* Weather Stats Toggle */}
      <button
        onClick={() => setShowWeatherStats(!showWeatherStats)}
        className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white px-3 py-2 rounded-lg hover:bg-white/30 transition-colors"
      >
        📊 {showWeatherStats ? 'Hide' : 'Show'} GitHub Stats
      </button>

      {/* GitHub Weather Stats */}
      <AnimatePresence>
        {showWeatherStats && userData?.stats && (
          <motion.div
            className="absolute top-16 right-4 bg-white/20 backdrop-blur-md rounded-lg p-4 max-w-xs"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <h4 className="text-white font-bold mb-3">GitHub Weather Factors</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/80">Daily Commits:</span>
                <span className="text-white">{userData.stats.productivity?.commitsPerDay?.toFixed(1) || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Current Streak:</span>
                <span className="text-white">{userData.stats.streak?.current || 0} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Total Activity:</span>
                <span className="text-white">{Object.values(userData.stats.activity.byType).reduce((sum: number, count) => sum + (count as number), 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Social Score:</span>
                <span className="text-white">{(userData.stats.social?.followers || 0) + (userData.stats.social?.following || 0)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title */}
      <motion.div
        className="absolute bottom-4 left-4 right-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
          🌤️ Portfolio Weather Systems
        </h2>
        <p className="text-white/90 text-sm drop-shadow">
          Living weather patterns generated from your GitHub activity and the global developer community
        </p>
      </motion.div>

      {/* Weather Legend */}
      <motion.div
        className="absolute bottom-4 left-4 bg-white/10 backdrop-blur-md rounded-lg p-2 text-xs text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        Weather driven by: Activity Intensity • Productivity • Social Engagement • Coding Streaks
      </motion.div>
    </div>
  );
}