import Image from 'next/image';
import { motion } from 'framer-motion';
import { GitHubUser } from '@/types';
import {
  CalendarIcon,
  MapPinIcon,
  LinkIcon,
  BuildingIcon,
} from '../ui/Icons';

interface ProfileHeaderProps {
  user: GitHubUser;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const stats = [
    {
      label: 'Repositories',
      value: user.public_repos,
      icon: '📚',
      color: 'from-blue-500/20 to-cyan-500/20',
      textColor: 'text-blue-400'
    },
    {
      label: 'Followers',
      value: user.followers,
      icon: '👥',
      color: 'from-green-500/20 to-emerald-500/20',
      textColor: 'text-green-400'
    },
    {
      label: 'Following',
      value: user.following,
      icon: '👤',
      color: 'from-purple-500/20 to-pink-500/20',
      textColor: 'text-purple-400'
    },
    {
      label: 'Gists',
      value: user.public_gists,
      icon: '📝',
      color: 'from-orange-500/20 to-red-500/20',
      textColor: 'text-orange-400'
    }
  ];

  return (
    <motion.div
      className='relative overflow-hidden'
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {/* Background Effects */}
      <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 rounded-3xl' />
      <div className='absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl' />

      {/* Animated Border */}
      <motion.div
        className='absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20'
        animate={{
          background: [
            'linear-gradient(45deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2), rgba(59, 130, 246, 0.2))',
            'linear-gradient(225deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2), rgba(59, 130, 246, 0.2))',
            'linear-gradient(45deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2), rgba(59, 130, 246, 0.2))',
          ],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className='relative p-8'>
        <div className='flex flex-col lg:flex-row items-center lg:items-start gap-8'>
          {/* Avatar Section */}
          <motion.div
            className='flex-shrink-0'
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.8, type: 'spring', stiffness: 200 }}
          >
            <div className='relative'>
              {/* Avatar Glow */}
              <motion.div
                className='absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full blur-xl opacity-30'
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              {/* Avatar Container */}
              <motion.div
                className='relative w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden border-4 border-white/20 p-1 bg-gradient-to-br from-purple-500/20 to-pink-500/20'
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <motion.div
                  className='w-full h-full rounded-full overflow-hidden'
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={user.avatar_url}
                    alt={`${user.login} avatar`}
                    fill
                    className='object-cover'
                    priority
                  />
                </motion.div>

                {/* Status Indicator */}
                <motion.div
                  className='absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center'
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                >
                  <motion.div
                    className='w-2 h-2 bg-white rounded-full'
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Content Section */}
          <div className='flex-grow text-center lg:text-left'>
            {/* Name and Username */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <motion.h1
                className='text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent'
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                {user.name || user.login}
              </motion.h1>

              <motion.a
                href={user.html_url}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-mono text-lg transition-all duration-300 group'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>@{user.login}</span>
                <motion.svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  initial={{ x: 0 }}
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' />
                </motion.svg>
              </motion.a>
            </motion.div>

            {/* Bio */}
            {user.bio && (
              <motion.p
                className='text-gray-300 text-lg leading-relaxed mt-4 max-w-2xl'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                {user.bio}
              </motion.p>
            )}

            {/* Info Grid */}
            <motion.div
              className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              {[
                { icon: BuildingIcon, value: user.company, label: 'Company', color: 'text-blue-400' },
                { icon: MapPinIcon, value: user.location, label: 'Location', color: 'text-green-400' },
                {
                  icon: LinkIcon,
                  value: user.blog,
                  label: 'Website',
                  color: 'text-purple-400',
                  link: user.blog?.startsWith('http') ? user.blog : `https://${user.blog}`
                },
                { icon: CalendarIcon, value: formatDate(user.created_at), label: 'Joined', color: 'text-orange-400' }
              ].filter(item => item.value).map((item, index) => (
                <motion.div
                  key={item.label}
                  className='flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 group'
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`p-2 rounded-lg bg-white/10 ${item.color}`}>
                    {item.icon && <item.icon className='h-4 w-4' />}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='text-xs text-gray-400 uppercase tracking-wide font-medium'>
                      {item.label}
                    </div>
                    {item.link ? (
                      <a
                        href={item.link}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-gray-300 hover:text-white transition-colors truncate block'
                      >
                        {item.value}
                      </a>
                    ) : (
                      <div className='text-gray-300 truncate'>
                        {item.value}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Stats Grid */}
        <motion.div
          className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8'
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className={`relative overflow-hidden bg-gradient-to-br ${stat.color} backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center group cursor-pointer`}
              initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{
                delay: 1 + index * 0.1,
                duration: 0.6,
                type: 'spring',
                stiffness: 200
              }}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
            >
              {/* Animated Background */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                initial={{ scale: 0, borderRadius: '100%' }}
                whileHover={{ scale: 2, borderRadius: '0%' }}
                transition={{ duration: 0.5 }}
              />

              <div className='relative z-10'>
                <motion.div
                  className='text-3xl mb-2'
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 3 + index,
                    repeat: Infinity,
                    delay: index * 0.5
                  }}
                >
                  {stat.icon}
                </motion.div>

                <motion.div
                  className={`text-3xl font-bold mb-1 ${stat.textColor}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 1.2 + index * 0.1,
                    type: 'spring',
                    stiffness: 300
                  }}
                >
                  {stat.value.toLocaleString()}
                </motion.div>

                <div className='text-sm text-gray-400 font-medium uppercase tracking-wide'>
                  {stat.label}
                </div>
              </div>

              {/* Hover Glow Effect */}
              <motion.div
                className='absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500'
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.8 }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
