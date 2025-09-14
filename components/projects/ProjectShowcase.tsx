'use client';

import { useState } from 'react';
import { Repository } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ProjectShowcaseProps {
  repos: Repository[];
  username: string;
}

export default function ProjectShowcase({ repos, username }: ProjectShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Categorize projects
  const categorizedRepos = repos.map(repo => {
    let category = 'Other';
    const topics = repo.topics || [];
    const description = repo.description || '';

    if (topics.includes('react') || topics.includes('nextjs') || description.toLowerCase().includes('react')) {
      category = 'Frontend';
    } else if (topics.includes('nodejs') || topics.includes('express') || topics.includes('api') || description.toLowerCase().includes('api')) {
      category = 'Backend';
    } else if (topics.includes('mobile') || topics.includes('react-native') || topics.includes('flutter')) {
      category = 'Mobile';
    } else if (topics.includes('ai') || topics.includes('machine-learning') || topics.includes('ml')) {
      category = 'AI/ML';
    } else if (topics.includes('data') || topics.includes('analytics') || description.toLowerCase().includes('data')) {
      category = 'Data';
    }

    return { ...repo, category };
  });

  const categories = ['all', ...Array.from(new Set(categorizedRepos.map(repo => repo.category)))];
  const filteredRepos = selectedCategory === 'all'
    ? categorizedRepos
    : categorizedRepos.filter(repo => repo.category === selectedCategory);

  const featuredRepos = filteredRepos.filter(repo => repo.stargazers_count >= 10 || repo.forks_count >= 5);
  const regularRepos = filteredRepos.filter(repo => repo.stargazers_count < 10 && repo.forks_count < 5);

  return (
    <motion.div
      className='w-full'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6'>
        <h2 className='section-heading text-xl sm:text-2xl'>Project Showcase</h2>
        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto'>
          <div className='flex bg-[var(--card-bg)] border border-[var(--card-border)] rounded-md p-1'>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              List
            </button>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className='bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] w-full sm:w-auto'
          >
            <option value='all'>All Categories</option>
            {categories.slice(1).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Featured Projects */}
      {featuredRepos.length > 0 && (
        <div className='mb-8'>
          <h3 className='text-lg font-bold mb-4 flex items-center gap-2'>
            <span className='text-yellow-500'>⭐</span>
            Featured Projects
          </h3>

          {viewMode === 'grid' ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
              {featuredRepos.map((repo, index) => (
                <ProjectCard key={repo.id} repo={repo} username={username} index={index} featured />
              ))}
            </div>
          ) : (
            <div className='space-y-4'>
              {featuredRepos.map((repo, index) => (
                <ProjectListItem key={repo.id} repo={repo} username={username} index={index} featured />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Regular Projects */}
      <div>
        <h3 className='text-lg font-bold mb-4'>All Projects</h3>

        {viewMode === 'grid' ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
            {regularRepos.map((repo, index) => (
              <ProjectCard key={repo.id} repo={repo} username={username} index={index + featuredRepos.length} />
            ))}
          </div>
        ) : (
          <div className='space-y-4'>
            {regularRepos.map((repo, index) => (
              <ProjectListItem key={repo.id} repo={repo} username={username} index={index + featuredRepos.length} />
            ))}
          </div>
        )}
      </div>

      {filteredRepos.length === 0 && (
        <motion.div
          className='text-center py-8'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className='text-[var(--text-secondary)]'>No projects found in this category</p>
        </motion.div>
      )}
    </motion.div>
  );
}

interface ProjectCardProps {
  repo: Repository & { category: string };
  username: string;
  index: number;
  featured?: boolean;
}

function ProjectCard({ repo, username, index, featured = false }: ProjectCardProps) {
  return (
    <motion.div
      className={`card group cursor-pointer ${featured ? 'ring-2 ring-yellow-500 ring-opacity-50' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className='flex items-start justify-between mb-3'>
        <div className='flex-1 min-w-0'>
          <Link
            href={`/${username}/projects/${repo.name}`}
            className='font-bold text-lg hover:text-[var(--primary)] transition-colors line-clamp-2'
          >
            {repo.name}
          </Link>
          <div className='flex items-center gap-2 mt-1'>
            <span className={`px-2 py-1 text-xs rounded-full ${
              repo.category === 'Frontend' ? 'bg-blue-500 bg-opacity-20 text-blue-600' :
              repo.category === 'Backend' ? 'bg-green-500 bg-opacity-20 text-green-600' :
              repo.category === 'Mobile' ? 'bg-purple-500 bg-opacity-20 text-purple-600' :
              repo.category === 'AI/ML' ? 'bg-orange-500 bg-opacity-20 text-orange-600' :
              repo.category === 'Data' ? 'bg-teal-500 bg-opacity-20 text-teal-600' :
              'bg-gray-500 bg-opacity-20 text-gray-600'
            }`}>
              {repo.category}
            </span>
            {repo.language && (
              <span className='px-2 py-1 bg-[var(--background)] text-xs rounded-full'>
                {repo.language}
              </span>
            )}
          </div>
        </div>
        {featured && (
          <span className='text-yellow-500 text-lg'>⭐</span>
        )}
      </div>

      <p className='text-[var(--text-secondary)] text-sm mb-4 line-clamp-3'>
        {repo.description || `A ${repo.language || 'code'} repository by ${username}`}
      </p>

      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-4 text-sm text-[var(--text-secondary)]'>
          <div className='flex items-center gap-1'>
            <svg className='w-4 h-4 text-yellow-400' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
            </svg>
            {repo.stargazers_count}
          </div>
          <div className='flex items-center gap-1'>
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2m0 0V6a2 2 0 012-2h10a2 2 0 012 2v10z' />
            </svg>
            {repo.forks_count}
          </div>
        </div>

        <div className='text-xs text-[var(--text-secondary)]'>
          {new Date(repo.updated_at).toLocaleDateString()}
        </div>
      </div>

      <div className='flex gap-2'>
        <Link
          href={`/${username}/projects/${repo.name}`}
          className='flex-1 text-center px-3 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-md transition-colors text-sm font-medium'
        >
          View Details
        </Link>
        {repo.homepage && (
          <a
            href={repo.homepage}
            target='_blank'
            rel='noopener noreferrer'
            className='px-3 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--primary)] text-[var(--text-primary)] rounded-md transition-colors text-sm font-medium'
          >
            Demo
          </a>
        )}
      </div>
    </motion.div>
  );
}

function ProjectListItem({ repo, username, index, featured = false }: ProjectCardProps) {
  return (
    <motion.div
      className={`card ${featured ? 'ring-2 ring-yellow-500 ring-opacity-50' : ''}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <div className='flex items-center gap-4'>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-2'>
            <Link
              href={`/${username}/projects/${repo.name}`}
              className='font-bold hover:text-[var(--primary)] transition-colors'
            >
              {repo.name}
            </Link>
            {featured && <span className='text-yellow-500'>⭐</span>}
            <span className={`px-2 py-1 text-xs rounded-full ${
              repo.category === 'Frontend' ? 'bg-blue-500 bg-opacity-20 text-blue-600' :
              repo.category === 'Backend' ? 'bg-green-500 bg-opacity-20 text-green-600' :
              repo.category === 'Mobile' ? 'bg-purple-500 bg-opacity-20 text-purple-600' :
              repo.category === 'AI/ML' ? 'bg-orange-500 bg-opacity-20 text-orange-600' :
              repo.category === 'Data' ? 'bg-teal-500 bg-opacity-20 text-teal-600' :
              'bg-gray-500 bg-opacity-20 text-gray-600'
            }`}>
              {repo.category}
            </span>
          </div>

          <p className='text-[var(--text-secondary)] text-sm mb-3 line-clamp-2'>
            {repo.description || `A ${repo.language || 'code'} repository`}
          </p>

          <div className='flex items-center gap-4 text-sm text-[var(--text-secondary)]'>
            {repo.language && <span>{repo.language}</span>}
            <span>{repo.stargazers_count} stars</span>
            <span>{repo.forks_count} forks</span>
            <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className='flex gap-2'>
          <Link
            href={`/${username}/projects/${repo.name}`}
            className='px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-md transition-colors text-sm font-medium'
          >
            View
          </Link>
          {repo.homepage && (
            <a
              href={repo.homepage}
              target='_blank'
              rel='noopener noreferrer'
              className='px-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--primary)] text-[var(--text-primary)] rounded-md transition-colors text-sm font-medium'
            >
              Demo
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
