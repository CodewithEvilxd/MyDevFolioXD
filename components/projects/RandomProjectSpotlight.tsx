'use client';

import { useState, useEffect } from 'react';
import { Repository } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface RandomProjectSpotlightProps {
  repos: Repository[];
  username: string;
}

export default function RandomProjectSpotlight({ repos, username }: RandomProjectSpotlightProps) {
  const [spotlightRepo, setSpotlightRepo] = useState<Repository | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (repos.length > 0) {
      // Select a random repository
      const randomIndex = Math.floor(Math.random() * repos.length);
      setSpotlightRepo(repos[randomIndex]);
    }
  }, [repos]);

  const getNewSpotlight = () => {
    if (repos.length <= 1) return;

    setIsAnimating(true);
    setTimeout(() => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * repos.length);
      } while (repos[newIndex].id === spotlightRepo?.id);

      setSpotlightRepo(repos[newIndex]);
      setIsAnimating(false);
    }, 300);
  };

  if (!spotlightRepo) return null;

  return (
    <motion.div
      className='w-full'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className='flex items-center justify-between mb-6'>
        <h2 className='section-heading'>Project Spotlight</h2>
        <button
          onClick={getNewSpotlight}
          className='px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-md transition-colors text-sm font-medium flex items-center gap-2'
          disabled={isAnimating}
        >
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
          </svg>
          Shuffle
        </button>
      </div>

      <motion.div
        className='card relative overflow-hidden'
        key={spotlightRepo.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        {/* Spotlight effect */}
        <div className='absolute top-0 right-0 w-32 h-32 bg-[var(--primary)] opacity-10 rounded-full blur-3xl' />

        <div className='relative z-10'>
          <div className='flex items-start gap-4'>
            {/* Project icon/avatar */}
            <div className='w-16 h-16 rounded-lg bg-[var(--primary)] flex items-center justify-center text-2xl flex-shrink-0'>
              {spotlightRepo.language === 'JavaScript' && '🟨'}
              {spotlightRepo.language === 'TypeScript' && '🔷'}
              {spotlightRepo.language === 'Python' && '🐍'}
              {spotlightRepo.language === 'Java' && '☕'}
              {spotlightRepo.language === 'HTML' && '🌐'}
              {spotlightRepo.language === 'CSS' && '🎨'}
              {!['JavaScript', 'TypeScript', 'Python', 'Java', 'HTML', 'CSS'].includes(spotlightRepo.language || '') && '🚀'}
            </div>

            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2 mb-2'>
                <Link
                  href={`/${username}/projects/${spotlightRepo.name}`}
                  className='text-xl font-bold hover:text-[var(--primary)] transition-colors truncate'
                >
                  {spotlightRepo.name}
                </Link>
                <div className='flex items-center gap-1'>
                  <svg className='w-4 h-4 text-yellow-400' fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                  </svg>
                  <span className='text-sm text-[var(--text-secondary)]'>{spotlightRepo.stargazers_count}</span>
                </div>
              </div>

              <p className='text-[var(--text-secondary)] mb-4 line-clamp-2'>
                {spotlightRepo.description || `A ${spotlightRepo.language || 'code'} repository by ${username}`}
              </p>

              <div className='flex items-center gap-4 mb-4'>
                {spotlightRepo.language && (
                  <span className='px-2 py-1 bg-[var(--background)] text-xs rounded-full'>
                    {spotlightRepo.language}
                  </span>
                )}

                <span className='text-xs text-[var(--text-secondary)]'>
                  Updated {new Date(spotlightRepo.updated_at).toLocaleDateString()}
                </span>

                {spotlightRepo.fork && (
                  <span className='text-xs px-2 py-1 bg-orange-500 bg-opacity-20 text-orange-600 rounded-full'>
                    Fork
                  </span>
                )}
              </div>

              {/* Topics */}
              {spotlightRepo.topics && spotlightRepo.topics.length > 0 && (
                <div className='flex flex-wrap gap-2 mb-4'>
                  {spotlightRepo.topics.slice(0, 5).map(topic => (
                    <span
                      key={topic}
                      className='px-2 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] text-xs rounded-full'
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className='flex gap-3'>
                <Link
                  href={`/${username}/projects/${spotlightRepo.name}`}
                  className='px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-md transition-colors text-sm font-medium'
                >
                  View Project
                </Link>

                <a
                  href={spotlightRepo.html_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='px-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--primary)] text-[var(--text-primary)] rounded-md transition-colors text-sm font-medium'
                >
                  GitHub
                </a>

                {spotlightRepo.homepage && (
                  <a
                    href={spotlightRepo.homepage}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='px-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--primary)] text-[var(--text-primary)] rounded-md transition-colors text-sm font-medium'
                  >
                    Live Demo
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className='absolute bottom-4 right-4 opacity-10'>
          <div className='w-20 h-20 border-2 border-[var(--primary)] rounded-full' />
        </div>
        <div className='absolute bottom-8 right-8 opacity-5'>
          <div className='w-12 h-12 bg-[var(--primary)] rounded-full' />
        </div>
      </motion.div>
    </motion.div>
  );
}
