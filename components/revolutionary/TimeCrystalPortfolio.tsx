'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { githubAPI } from '@/lib/githubService';
import { GitHubUserWithStats, Repository } from '@/types';

interface TimeCrystalPortfolioProps {
  username: string;
}

interface TimeSnapshot {
  date: string;
  repos: Repository[];
  stats: {
    totalRepos: number;
    totalStars: number;
    totalCommits: number;
    languages: Record<string, number>;
  };
}

export default function TimeCrystalPortfolio({ username }: TimeCrystalPortfolioProps) {
  const [userData, setUserData] = useState<GitHubUserWithStats | null>(null);
  const [timeSnapshots, setTimeSnapshots] = useState<TimeSnapshot[]>([]);
  const [selectedTimeCrystal, setSelectedTimeCrystal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTimeCrystals = async () => {
      try {
        const user = await githubAPI.getUserProfile(username);
        setUserData(user);

        // Generate time snapshots for the past 12 months
        const snapshots: TimeSnapshot[] = [];
        const now = new Date();

        for (let i = 0; i < 12; i++) {
          const snapshotDate = new Date(now);
          snapshotDate.setMonth(now.getMonth() - i);

          const snapshot: TimeSnapshot = {
            date: snapshotDate.toISOString().split('T')[0],
            repos: user.repositories?.filter(repo =>
              new Date(repo.created_at) <= snapshotDate
            ) || [],
            stats: {
              totalRepos: 0,
              totalStars: 0,
              totalCommits: 0,
              languages: {}
            }
          };

          // Calculate stats for this time period
          snapshot.stats.totalRepos = snapshot.repos.length;
          snapshot.stats.totalStars = snapshot.repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

          // Calculate language distribution
          snapshot.repos.forEach(repo => {
            if (repo.language) {
              snapshot.stats.languages[repo.language] =
                (snapshot.stats.languages[repo.language] || 0) + 1;
            }
          });

          snapshots.push(snapshot);
        }

        setTimeSnapshots(snapshots);
      } catch (error) {
        console.error('Error loading time crystals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      loadTimeCrystals();
    }
  }, [username]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const getCrystalColor = (index: number) => {
    const colors = [
      'from-blue-400 to-cyan-400',
      'from-purple-400 to-pink-400',
      'from-green-400 to-emerald-400',
      'from-orange-400 to-red-400',
      'from-indigo-400 to-blue-400',
      'from-pink-400 to-rose-400',
      'from-teal-400 to-green-400',
      'from-yellow-400 to-orange-400',
      'from-violet-400 to-purple-400',
      'from-cyan-400 to-blue-400',
      'from-emerald-400 to-teal-400',
      'from-rose-400 to-pink-400'
    ];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Time Crystals...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Title */}
      <motion.div
        className="text-center mb-8"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          🕰️ Time Crystal Portfolio
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Witness your coding journey through time. Each crystal represents a moment in your GitHub history,
          showing how your repositories, stars, and skills have evolved across different time dimensions.
        </p>
      </motion.div>

      {/* Time Crystals Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {timeSnapshots.map((snapshot, index) => (
          <motion.div
            key={snapshot.date}
            className="relative cursor-pointer group"
            initial={{ scale: 0, rotateY: -90 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{
              delay: index * 0.1,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedTimeCrystal(index)}
          >
            {/* Crystal Container */}
            <div className="relative h-32 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-lg overflow-hidden">
              {/* Crystal Facets */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getCrystalColor(index)} opacity-20`}></div>

              {/* Crystal Content */}
              <div className="relative h-full p-3 flex flex-col justify-between">
                <div className="text-xs font-medium text-white/80">
                  {formatDate(snapshot.date)}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Repos:</span>
                    <span className="font-bold text-white">{snapshot.stats.totalRepos}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Stars:</span>
                    <span className="font-bold text-yellow-300">{snapshot.stats.totalStars}</span>
                  </div>
                </div>

                {/* Language Indicators */}
                <div className="flex flex-wrap gap-1">
                  {Object.entries(snapshot.stats.languages).slice(0, 3).map(([lang, count]) => (
                    <div
                      key={lang}
                      className="w-2 h-2 bg-white/40 rounded-full"
                      title={`${lang}: ${count} repos`}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Crystal Shine Effect */}
              <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-white/30 to-transparent transform -skew-x-12"></div>
            </div>

            {/* Hover Glow Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${getCrystalColor(index)} opacity-0 group-hover:opacity-30 rounded-lg blur-xl transition-opacity duration-300`}></div>
          </motion.div>
        ))}
      </div>

      {/* Selected Time Crystal Details */}
      <AnimatePresence>
        {selectedTimeCrystal !== null && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTimeCrystal(null)}
          >
            <motion.div
              className="bg-white/95 backdrop-blur-md rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {formatDate(timeSnapshots[selectedTimeCrystal].date)}
                  </h3>
                  <p className="text-gray-600">
                    {`Time Crystal #${selectedTimeCrystal + 1} - ${userData?.name || username}'s coding timeline`}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTimeCrystal(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {timeSnapshots[selectedTimeCrystal].stats.totalRepos}
                  </div>
                  <div className="text-sm text-gray-600">Total Repos</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {timeSnapshots[selectedTimeCrystal].stats.totalStars}
                  </div>
                  <div className="text-sm text-gray-600">Total Stars</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.keys(timeSnapshots[selectedTimeCrystal].stats.languages).length}
                  </div>
                  <div className="text-sm text-gray-600">Languages</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {timeSnapshots[selectedTimeCrystal].repos.length > 0 ?
                      Math.round(timeSnapshots[selectedTimeCrystal].stats.totalStars / timeSnapshots[selectedTimeCrystal].repos.length * 10) / 10 : 0
                    }
                  </div>
                  <div className="text-sm text-gray-600">Avg Stars/Repo</div>
                </div>
              </div>

              {/* Language Distribution */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Language Distribution</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(timeSnapshots[selectedTimeCrystal].stats.languages)
                    .sort(([,a], [,b]) => b - a)
                    .map(([lang, count]) => (
                    <div key={lang} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">{lang}</span>
                      <span className="text-xs text-gray-600">({count})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Repository Timeline */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Repository Timeline</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {timeSnapshots[selectedTimeCrystal].repos
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 10)
                    .map((repo, index) => (
                    <div key={repo.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{repo.name}</div>
                        <div className="text-xs text-gray-600">
                          ⭐ {repo.stargazers_count} • {repo.language || 'No language'} • {new Date(repo.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <motion.div
        className="text-center text-sm text-gray-500 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Click on any time crystal to explore your coding journey at that moment in time
      </motion.div>
    </motion.div>
  );
}