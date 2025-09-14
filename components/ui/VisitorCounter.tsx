'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface VisitorCounterProps {
  username?: string;
  repos?: any[];
}

export default function VisitorCounter({ username, repos }: VisitorCounterProps) {
  const [visitorCount, setVisitorCount] = useState(0);
  const [githubViews, setGithubViews] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const initializeCounter = async () => {
      try {
        // Check if this device has already been counted
        const hasVisited = localStorage.getItem('hasVisited');

        if (!hasVisited) {
          // New device: increment global counter using CountAPI
          const response = await fetch('https://api.countapi.xyz/hit/mydevfolio/visitors');
          const data = await response.json();
          setVisitorCount(data.value);
          localStorage.setItem('hasVisited', 'true');
        } else {
          // Existing device: just get current count
          const response = await fetch('https://api.countapi.xyz/get/mydevfolio/visitors');
          const data = await response.json();
          setVisitorCount(data.value);
        }
      } catch (error) {
        // Fallback if API fails
        setVisitorCount(1);
      }

      // Try to fetch GitHub repository views if username and repos are available
      if (username && repos && repos.length > 0) {
        try {
          const token = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN;
          const headers: Record<string, string> = {
            'Accept': 'application/vnd.github.v3+json'
          };

          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          // Get traffic data for top repositories (limited to avoid rate limits)
          let totalViews = 0;
          const topRepos = repos.slice(0, 3); // Check top 3 repos for traffic

          for (const repo of topRepos) {
            try {
              const response = await fetch(
                `https://api.github.com/repos/${username}/${repo.name}/traffic/views`,
                { headers }
              );

              if (response.ok) {
                const trafficData = await response.json();
                if (trafficData.views && Array.isArray(trafficData.views)) {
                  const recentViews = trafficData.views.slice(-30); // Last 30 days
                  const repoViews = recentViews.reduce((sum: number, day: any) => sum + (day.count || 0), 0);
                  totalViews += repoViews;
                }
              }
            } catch (error) {
              // Silently continue if traffic data unavailable
            }
          }

          if (totalViews > 0) {
            setGithubViews(totalViews);
          }
        } catch (error) {
          // Silently handle GitHub API errors
        }
      }

      // Animate the counter
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);

      // Always show welcome message for fresh start
      setShowMessage(true);
      localStorage.setItem('hasVisited', 'true');
      setTimeout(() => setShowMessage(false), 3000);
    };

    initializeCounter();
  }, [username, repos]);

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <>
      {/* Welcome Message for First-time Visitors */}
      {showMessage && (
        <motion.div
          className='fixed top-12 left-2 right-2 sm:top-16 sm:left-4 sm:right-4 z-50 md:top-20 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2'
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className='bg-gradient-to-r from-purple-500/95 to-blue-500/95 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg shadow-xl backdrop-blur-sm border border-white/20 mx-auto max-w-xs sm:max-w-sm md:max-w-md'>
            <div className='flex items-center justify-center gap-2 flex-wrap text-center md:flex-nowrap md:text-left'>
              <span className='text-base sm:text-lg md:text-xl'>👋</span>
              <div className='flex-1 min-w-0'>
                <span className='font-medium text-xs sm:text-sm md:text-base block'>Welcome to MyDevFolioXD!</span>
                <span className='text-xs opacity-90 block md:inline'>
                  {githubViews > 0
                    ? `Portfolio viewed ${formatNumber(githubViews)}+ times!`
                    : `You're visitor #${formatNumber(visitorCount)}`
                  }
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Visitor Counter */}
      <motion.div
        className='fixed bottom-2 left-2 sm:bottom-4 sm:left-4 z-50'
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        <div className='bg-[var(--card-bg)] border border-[var(--card-border)] rounded-md px-2 py-1.5 shadow-md backdrop-blur-sm hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105 cursor-pointer group'>
          <div className='flex items-center gap-1'>
            <div className='w-1 h-1 bg-green-500 rounded-full animate-pulse' />
            <span className='text-[10px] text-[var(--text-secondary)] font-medium'>
              {githubViews > 0 ? 'Portfolio Views' : 'Visitors'}
            </span>
          </div>
          <motion.div
            className='text-sm font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-mono'
            animate={isAnimating ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {formatNumber(githubViews > 0 ? githubViews : visitorCount)}
          </motion.div>
          {githubViews > 0 && (
            <div className='text-[9px] text-[var(--text-secondary)] mt-0.5'>
              +{formatNumber(visitorCount)} local
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
