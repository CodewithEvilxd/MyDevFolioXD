'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Repository } from '@/types';

interface WeatherPatternPortfolioAdaptationProps {
  username: string;
  repos: Repository[];
}

interface WeatherCondition {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  mood: 'sunny' | 'rainy' | 'cloudy' | 'stormy' | 'snowy';
}

interface PortfolioMood {
  theme: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  energy: number;
  description: string;
  emoji: string;
}

export default function WeatherPatternPortfolioAdaptation({ username, repos }: WeatherPatternPortfolioAdaptationProps) {
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const [portfolioMood, setPortfolioMood] = useState<PortfolioMood | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          // Default to a major city if geolocation fails
          setLocation({ lat: 40.7128, lon: -74.0060 }); // New York
        }
      );
    } else {
      setLocation({ lat: 40.7128, lon: -74.0060 });
    }
  }, []);
  const fetchWeatherData = useCallback(async () => {
    if (!location) return;

    try {
      // Using OpenWeatherMap API (you would need to add your API key)
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || 'demo';
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=metric`
      );

      if (response.ok) {
        const data = await response.json();
        const condition: WeatherCondition = {
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].main,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind?.speed || 0),
          icon: data.weather[0].icon,
          mood: getWeatherMood(data.weather[0].main, data.main.temp)
        };
        setWeather(condition);
        setPortfolioMood(generatePortfolioMood(condition, repos));
      } else {
        // Fallback weather data based on time of day and season
        const fallbackWeather = generateFallbackWeather();
        setWeather(fallbackWeather);
        setPortfolioMood(generatePortfolioMood(fallbackWeather, repos));
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      const fallbackWeather = generateFallbackWeather();
      setWeather(fallbackWeather);
      setPortfolioMood(generatePortfolioMood(fallbackWeather, repos));
    } finally {
      setLoading(false);
    }
  }, [location, repos]);

  useEffect(() => {
    if (location) {
      fetchWeatherData();
    }
  }, [location, fetchWeatherData]);


  const getWeatherEmoji = (condition: string): string => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('clear')) return '☀️';
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) return '🌧️';
    if (lowerCondition.includes('cloud')) return '☁️';
    if (lowerCondition.includes('thunderstorm') || lowerCondition.includes('storm')) return '⛈️';
    if (lowerCondition.includes('snow')) return '❄️';
    return '🌤️';
  };

  const getWeatherMood = (condition: string, temp: number): WeatherCondition['mood'] => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('clear') && temp > 20) return 'sunny';
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) return 'rainy';
    if (lowerCondition.includes('cloud')) return 'cloudy';
    if (lowerCondition.includes('thunderstorm') || lowerCondition.includes('storm')) return 'stormy';
    if (lowerCondition.includes('snow')) return 'snowy';
    return temp > 15 ? 'sunny' : 'cloudy';
  };

  const generateFallbackWeather = (): WeatherCondition => {
    const hour = new Date().getHours();
    const month = new Date().getMonth();

    // Summer months
    if (month >= 5 && month <= 8) {
      return {
        temperature: 25 + Math.floor(Math.random() * 10),
        condition: hour > 6 && hour < 20 ? 'Clear' : 'Clear',
        humidity: 40 + Math.floor(Math.random() * 30),
        windSpeed: Math.floor(Math.random() * 15),
        icon: '01d',
        mood: 'sunny'
      };
    }

    // Winter months
    if (month >= 11 || month <= 2) {
      return {
        temperature: -5 + Math.floor(Math.random() * 15),
        condition: Math.random() > 0.7 ? 'Snow' : 'Clouds',
        humidity: 60 + Math.floor(Math.random() * 30),
        windSpeed: 5 + Math.floor(Math.random() * 20),
        icon: '13d',
        mood: 'snowy'
      };
    }

    // Other months
    return {
      temperature: 10 + Math.floor(Math.random() * 15),
      condition: Math.random() > 0.5 ? 'Clouds' : 'Clear',
      humidity: 50 + Math.floor(Math.random() * 30),
      windSpeed: Math.floor(Math.random() * 10),
      icon: '02d',
      mood: 'cloudy'
    };
  };

  const generatePortfolioMood = (weather: WeatherCondition, repos: Repository[]): PortfolioMood => {
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
    const activity = totalStars + totalForks;

    const baseEnergy = Math.min(100, Math.max(20, (activity / 10) + (repos.length * 2)));

    switch (weather.mood) {
      case 'sunny':
        return {
          theme: 'Sunny & Energetic',
          colors: {
            primary: '#FFD700',
            secondary: '#FFA500',
            accent: '#FF6B35',
            background: 'linear-gradient(135deg, #FFE5B4, #FFB74D)'
          },
          energy: Math.min(100, baseEnergy + 20),
          description: 'Bright and energetic like a perfect summer day',
          emoji: '☀️'
        };

      case 'rainy':
        return {
          theme: 'Calm & Reflective',
          colors: {
            primary: '#4A90E2',
            secondary: '#5BA0F2',
            accent: '#2E5C8A',
            background: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)'
          },
          energy: Math.max(30, baseEnergy - 15),
          description: 'Calm and introspective, perfect for deep thinking',
          emoji: '🌧️'
        };

      case 'cloudy':
        return {
          theme: 'Balanced & Steady',
          colors: {
            primary: '#90A4AE',
            secondary: '#B0BEC5',
            accent: '#607D8B',
            background: 'linear-gradient(135deg, #F5F5F5, #E0E0E0)'
          },
          energy: baseEnergy,
          description: 'Balanced and steady, reliable like overcast skies',
          emoji: '☁️'
        };

      case 'stormy':
        return {
          theme: 'Intense & Dynamic',
          colors: {
            primary: '#424242',
            secondary: '#616161',
            accent: '#FF5722',
            background: 'linear-gradient(135deg, #263238, #37474F)'
          },
          energy: Math.min(100, baseEnergy + 30),
          description: 'Intense and dynamic, full of creative energy',
          emoji: '⛈️'
        };

      case 'snowy':
        return {
          theme: 'Pure & Minimalist',
          colors: {
            primary: '#E0F7FA',
            secondary: '#B2EBF2',
            accent: '#00BCD4',
            background: 'linear-gradient(135deg, #F8F8F8, #E8F5E8)'
          },
          energy: Math.max(40, baseEnergy - 10),
          description: 'Pure and minimalist, focused on clarity',
          emoji: '❄️'
        };

      default:
        return {
          theme: 'Neutral & Adaptive',
          colors: {
            primary: '#9E9E9E',
            secondary: '#BDBDBD',
            accent: '#757575',
            background: 'linear-gradient(135deg, #FAFAFA, #F5F5F5)'
          },
          energy: baseEnergy,
          description: 'Neutral and adaptive to any situation',
          emoji: '🌤️'
        };
    }
  };

  const getWeatherInsights = () => {
    if (!weather || !portfolioMood) return [];

    const totalRepos = repos.length;
    const avgStars = totalRepos > 0 ? Math.round(repos.reduce((sum, repo) => sum + repo.stargazers_count, 0) / totalRepos) : 0;

    return [
      {
        title: 'Weather Influence',
        value: `${weather.temperature}°C`,
        description: `Current temperature affecting portfolio energy by ${Math.abs(weather.temperature - 20)} points`,
        icon: getWeatherEmoji(weather.condition),
        color: weather.temperature > 20 ? 'text-orange-500' : 'text-blue-500'
      },
      {
        title: 'Portfolio Mood',
        value: portfolioMood.theme,
        description: portfolioMood.description,
        icon: portfolioMood.emoji,
        color: 'text-purple-500'
      },
      {
        title: 'Energy Level',
        value: `${portfolioMood.energy}%`,
        description: `Portfolio vibrancy based on weather and GitHub activity`,
        icon: '⚡',
        color: portfolioMood.energy > 70 ? 'text-green-500' : 'text-yellow-500'
      },
      {
        title: 'Activity Harmony',
        value: `${Math.round((avgStars / 10) + weather.humidity / 10)}%`,
        description: 'How well your coding activity aligns with current weather patterns',
        icon: '🎯',
        color: 'text-indigo-500'
      }
    ];
  };

  if (loading) {
    return (
      <motion.div
        className='card'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
            <p className='text-[var(--text-secondary)]'>Detecting weather patterns...</p>
            <p className='text-sm text-[var(--text-secondary)] mt-2'>Adapting portfolio to local conditions</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className='card'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-bold'>Weather Pattern Portfolio Adaptation</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Your portfolio adapts to real-time weather conditions and local climate
          </p>
          {location && (
            <div className='flex items-center gap-2 mt-2'>
              <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'></div>
              <span className='text-xs text-blue-400'>Location-based adaptation active</span>
            </div>
          )}
        </div>
      </div>

      {/* Current Weather Display */}
      {weather && (
        <div className='mb-6 p-6 rounded-lg border border-[var(--card-border)]' style={{
          background: portfolioMood?.colors.background || 'var(--card-bg)'
        }}>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-4'>
              <div className='text-6xl'>
                {weather.condition === 'Clear' && '☀️'}
                {weather.condition === 'Clouds' && '☁️'}
                {weather.condition === 'Rain' && '🌧️'}
                {weather.condition === 'Snow' && '❄️'}
                {weather.condition === 'Thunderstorm' && '⛈️'}
                {!['Clear', 'Clouds', 'Rain', 'Snow', 'Thunderstorm'].includes(weather.condition) && '🌤️'}
              </div>
              <div>
                <h3 className='text-2xl font-bold'>{weather.temperature}°C</h3>
                <p className='text-[var(--text-secondary)]'>{weather.condition}</p>
                <p className='text-sm text-[var(--text-secondary)]'>
                  Humidity: {weather.humidity}% | Wind: {weather.windSpeed} m/s
                </p>
              </div>
            </div>

            {portfolioMood && (
              <div className='text-right'>
                <div className='text-3xl mb-2'>{portfolioMood.emoji}</div>
                <h4 className='font-semibold'>{portfolioMood.theme}</h4>
                <p className='text-sm text-[var(--text-secondary)]'>Portfolio Mood</p>
              </div>
            )}
          </div>

          {/* Energy Bar */}
          {portfolioMood && (
            <div className='mt-4'>
              <div className='flex justify-between text-sm mb-2'>
                <span>Portfolio Energy</span>
                <span>{portfolioMood.energy}%</span>
              </div>
              <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3'>
                <motion.div
                  className='h-3 rounded-full'
                  style={{ backgroundColor: portfolioMood.colors.primary }}
                  initial={{ width: 0 }}
                  animate={{ width: `${portfolioMood.energy}%` }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Weather Insights Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
        {getWeatherInsights().map((insight, index) => (
          <motion.div
            key={insight.title}
            className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <div className='flex items-center gap-3 mb-2'>
              <span className='text-2xl'>{insight.icon}</span>
              <h4 className='font-semibold'>{insight.title}</h4>
            </div>
            <p className={`text-xl font-bold mb-1 ${insight.color}`}>{insight.value}</p>
            <p className='text-sm text-[var(--text-secondary)]'>{insight.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Weather-Portfolio Correlation */}
      <div className='bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/20 rounded-lg p-4'>
        <h3 className='font-semibold mb-2'>Weather-Portfolio Correlation</h3>
        <div className='text-sm text-[var(--text-secondary)] space-y-2'>
          <p>• <strong>Sunny Weather:</strong> Portfolio becomes more energetic and vibrant</p>
          <p>• <strong>Rainy Conditions:</strong> Encourages calm, thoughtful presentation</p>
          <p>• <strong>Cloudy Days:</strong> Balanced, professional appearance</p>
          <p>• <strong>Stormy Weather:</strong> Dynamic and intense visual effects</p>
          <p>• <strong>Snowy Conditions:</strong> Clean, minimalist design approach</p>
        </div>
        <p className='text-xs text-[var(--text-secondary)] mt-3'>
          Your portfolio automatically adapts its colors, energy levels, and presentation based on real-time weather data and your GitHub activity patterns.
        </p>
      </div>
    </motion.div>
  );
}
