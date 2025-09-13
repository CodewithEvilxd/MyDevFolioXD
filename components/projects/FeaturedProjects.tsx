// components/FeaturedProjects.tsx
import Link from 'next/link';
import { Repository } from '@/types';
import { motion } from 'framer-motion';

interface FeaturedProjectsProps {
  repos: Repository[];
}

export default function FeaturedProjects({ repos }: FeaturedProjectsProps) {
  if (repos.length === 0) {
    return null;
  }

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9, rotateY: -15 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1,
      },
    },
  };

  // Helper function to get color for language
  const getLanguageColor = (language: string | null): string => {
    if (!language) return '#8b949e';

    const colors: Record<string, string> = {
      JavaScript: '#f1e05a',
      TypeScript: '#3178c6',
      HTML: '#e34c26',
      CSS: '#563d7c',
      Python: '#3572A5',
      Java: '#b07219',
      Ruby: '#701516',
      PHP: '#4F5D95',
      Go: '#00ADD8',
      Rust: '#dea584',
      C: '#555555',
      'C++': '#f34b7d',
      'C#': '#178600',
      Swift: '#ffac45',
      Kotlin: '#A97BFF',
      Dart: '#00B4AB',
      Shell: '#89e051',
      Vue: '#41b883',
    };

    return colors[language] || '#8b949e';
  };

  return (
    <section
      aria-labelledby='featured-projects-heading'
      role='region'
    >
      <motion.div
        className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 relative'
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        role='grid'
        aria-label='Featured projects grid'
      >
      {repos.map((repo, index) => (
        <motion.div
          key={repo.id}
          className='group relative overflow-hidden'
          variants={itemVariants}
          whileHover={{ y: -8, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* Glassmorphism Background */}
          <div className='absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl border border-white/20 rounded-3xl' />

          {/* Animated Border */}
          <motion.div
            className='absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30'
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Floating Particles */}
          <div className='absolute inset-0 pointer-events-none overflow-hidden rounded-3xl'>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className='absolute w-1 h-1 bg-white/30 rounded-full'
                style={{
                  left: `${15 + i * 20}%`,
                  top: `${20 + i * 15}%`,
                }}
                animate={{
                  y: [-20, 20, -20],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>

          <div className='relative p-4 sm:p-6 md:p-8 h-full flex flex-col'>
            {/* Project Number Badge */}
            <motion.div
              className='absolute top-6 right-6 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg'
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5 + index * 0.1, type: 'spring', stiffness: 300 }}
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              {String(index + 1).padStart(2, '0')}
            </motion.div>

            {/* Header Section */}
            <motion.div
              className='mb-6'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div className='flex items-start gap-3 mb-3'>
                {repo.language && (
                  <motion.div
                    className='flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full'
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <motion.span
                      className='w-3 h-3 rounded-full shadow-sm'
                      style={{ backgroundColor: getLanguageColor(repo.language) }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className='text-sm font-medium text-white'>{repo.language}</span>
                  </motion.div>
                )}
              </div>

              <motion.h3
                className='text-lg sm:text-xl md:text-2xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Link
                  href={`/${repo.owner.login}/projects/${repo.name}`}
                  className='hover:text-transparent hover:bg-gradient-to-r hover:from-purple-400 hover:to-pink-400 hover:bg-clip-text transition-all duration-300'
                  aria-label={`View ${repo.name} repository details`}
                >
                  {repo.name}
                </Link>
              </motion.h3>

              <motion.div
                className='flex items-center gap-2 text-sm text-gray-400'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <span className='px-2 py-1 bg-white/5 rounded-md font-mono text-xs'>
                  {new Date(repo.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className='text-gray-500'>•</span>
                <span className='text-purple-400'>@{repo.owner.login}</span>
              </motion.div>
            </motion.div>

            {/* Description */}
            <motion.p
              className='text-gray-300 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 flex-grow'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
            >
              {repo.description ||
                `A ${repo.language || 'code'} repository showcasing development skills and project management.`}
            </motion.p>

            {/* Stats and Actions */}
            <motion.div
              className='flex items-center justify-between'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
            >
              <div className='flex items-center gap-4'>
                <motion.div
                  className='flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl'
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  role='group'
                  aria-label={`Star count: ${repo.stargazers_count.toLocaleString()}`}
                >
                  <motion.svg
                    className='h-4 w-4 text-yellow-400'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    aria-hidden='true'
                  >
                    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                  </motion.svg>
                  <span className='text-sm font-bold text-yellow-400' aria-label={`${repo.stargazers_count.toLocaleString()} stars`}>
                    {repo.stargazers_count.toLocaleString()}
                  </span>
                </motion.div>

                <motion.div
                  className='flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl'
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <motion.svg
                    className='h-4 w-4 text-blue-400'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <path fillRule='evenodd' d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z' clipRule='evenodd' />
                  </motion.svg>
                  <span className='text-sm font-bold text-blue-400'>
                    {repo.forks_count.toLocaleString()}
                  </span>
                </motion.div>
              </div>

              <div className='flex items-center gap-3'>
                {repo.homepage && (
                  <motion.a
                    href={repo.homepage}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl text-green-400 hover:text-white hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-500 transition-all duration-300'
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.svg
                      className='h-4 w-4'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z' clipRule='evenodd' />
                    </motion.svg>
                    <span className='text-sm font-medium'>Demo</span>
                  </motion.a>
                )}

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={`/${repo.owner.login}/projects/${repo.name}`}
                    className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl text-purple-400 hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 transition-all duration-300 group/link'
                  >
                    <span className='text-sm font-medium'>View</span>
                    <motion.svg
                      className='h-4 w-4 group-hover/link:translate-x-2 transition-transform duration-300'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path fillRule='evenodd' d='M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z' clipRule='evenodd' />
                    </motion.svg>
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* Topics */}
            {repo.topics && repo.topics.length > 0 && (
              <motion.div
                className='flex flex-wrap gap-2 mt-6 pt-6 border-t border-white/10'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 + index * 0.1 }}
              >
                {repo.topics.slice(0, 4).map((topic, topicIndex) => (
                  <motion.span
                    key={topic}
                    className='px-2 sm:px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-300 cursor-pointer'
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: 1 + index * 0.1 + topicIndex * 0.05,
                      type: 'spring',
                      stiffness: 300
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    #{topic}
                  </motion.span>
                ))}
                {repo.topics.length > 4 && (
                  <motion.span
                    className='px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-xs text-purple-400 font-medium'
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: 1 + index * 0.1 + 4 * 0.05,
                      type: 'spring',
                      stiffness: 300
                    }}
                  >
                    +{repo.topics.length - 4} more
                  </motion.span>
                )}
              </motion.div>
            )}
          </div>

          {/* Hover Glow Effect */}
          <motion.div
            className='absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none'
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.8 }}
          />
        </motion.div>
      ))}

      {/* Enhanced View All Button */}
      {repos.length > 0 && (
        <motion.div
          className='md:col-span-2 text-center mt-8'
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 + repos.length * 0.1 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href={`/${repos[0]?.owner?.login}/projects`}
              className='inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-gradient-to-r hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 group'
            >
              <span className='text-lg font-semibold'>View All Projects</span>
              <motion.svg
                className='h-5 w-5 group-hover:translate-x-2 transition-transform duration-300'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path fillRule='evenodd' d='M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z' clipRule='evenodd' />
              </motion.svg>
            </Link>
          </motion.div>
        </motion.div>
      )}
      </motion.div>
    </section>
  );
}
