'use client';

import { useState, useEffect } from 'react';
import { Repository, GitHubUser } from '@/types';
import { motion } from 'framer-motion';

interface AchievementBadgesProps {
  user: GitHubUser;
  repos: Repository[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  color: string;
}

export default function AchievementBadges({ user, repos }: AchievementBadgesProps) {
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    const calculateBadges = () => {
      const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
      const languages = new Set(repos.map(repo => repo.language).filter(Boolean));
      const yearsActive = Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365));

      const allBadges: Badge[] = [
        {
          id: 'first-repo',
          name: 'First Steps',
          description: 'Created your first repository',
          icon: '🚀',
          earned: repos.length > 0,
          color: 'bg-blue-500'
        },
        {
          id: 'polyglot',
          name: 'Polyglot',
          description: 'Used 5+ programming languages',
          icon: '🌍',
          earned: languages.size >= 5,
          color: 'bg-green-500'
        },
        {
          id: 'star-collector',
          name: 'Star Collector',
          description: 'Earned 100+ stars across repositories',
          icon: '⭐',
          earned: totalStars >= 100,
          color: 'bg-yellow-500'
        },
        {
          id: 'popular',
          name: 'Popular',
          description: 'Earned 500+ stars',
          icon: '🌟',
          earned: totalStars >= 500,
          color: 'bg-purple-500'
        },
        {
          id: 'fork-master',
          name: 'Fork Master',
          description: 'Earned 50+ forks',
          icon: '🍴',
          earned: totalForks >= 50,
          color: 'bg-orange-500'
        },
        {
          id: 'veteran',
          name: 'Veteran',
          description: '5+ years on GitHub',
          icon: '🎖️',
          earned: yearsActive >= 5,
          color: 'bg-red-500'
        },
        {
          id: 'contributor',
          name: 'Contributor',
          description: 'Has public repositories',
          icon: '🤝',
          earned: repos.length >= 10,
          color: 'bg-indigo-500'
        },
        {
          id: 'pioneer',
          name: 'Pioneer',
          description: 'Joined GitHub early',
          icon: '🏆',
          earned: yearsActive >= 10,
          color: 'bg-pink-500'
        },
        {
          id: 'collaborator',
          name: 'Collaborator',
          description: 'Has forked repositories',
          icon: '👥',
          earned: repos.some(repo => repo.fork),
          color: 'bg-teal-500'
        },
        {
          id: 'influencer',
          name: 'Influencer',
          description: '1000+ stars total',
          icon: '💫',
          earned: totalStars >= 1000,
          color: 'bg-cyan-500'
        }
      ];

      setBadges(allBadges);
    };

    calculateBadges();
  }, [user, repos]);

  const earnedBadges = badges.filter(badge => badge.earned);
  const totalEarned = earnedBadges.length;
  const totalBadges = badges.length;

  return (
    <motion.div
      className='w-full'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className='flex items-center justify-between mb-6'>
        <h2 className='section-heading'>Achievements</h2>
        <div className='text-sm text-[var(--text-secondary)]'>
          {totalEarned}/{totalBadges} unlocked
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
        {badges.map((badge, index) => (
          <motion.div
            key={badge.id}
            className={`card text-center relative overflow-hidden ${
              badge.earned ? 'border-[var(--primary)]' : 'opacity-60'
            }`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: badge.earned ? 1 : 0.6 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
          >
            {badge.earned && (
              <motion.div
                className='absolute top-2 right-2 w-3 h-3 bg-[var(--primary)] rounded-full'
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05 + 0.2 }}
              />
            )}

            <div className={`w-12 h-12 rounded-full ${badge.color} flex items-center justify-center mx-auto mb-3 text-2xl`}>
              {badge.icon}
            </div>

            <h3 className='font-bold text-sm mb-1'>{badge.name}</h3>
            <p className='text-xs text-[var(--text-secondary)] leading-tight'>
              {badge.description}
            </p>

            {!badge.earned && (
              <div className='absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center rounded-lg'>
                <div className='text-xs text-[var(--text-secondary)] font-medium'>
                  Locked
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {totalEarned > 0 && (
        <motion.div
          className='mt-6 text-center'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className='inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] bg-opacity-10 rounded-full'>
            <span className='text-sm font-medium'>Achievement Progress</span>
            <div className='w-16 h-2 bg-[var(--card-border)] rounded-full overflow-hidden'>
              <motion.div
                className='h-full bg-[var(--primary)] rounded-full'
                style={{ width: `${(totalEarned / totalBadges) * 100}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${(totalEarned / totalBadges) * 100}%` }}
                transition={{ delay: 0.7, duration: 1 }}
              />
            </div>
            <span className='text-xs text-[var(--text-secondary)]'>
              {Math.round((totalEarned / totalBadges) * 100)}%
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
