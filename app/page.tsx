// app/page.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import RateLimitIndicator from '@/components/ui/RateLimitIndicator';

export default function HomePage() {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsSubmitting(true);
      router.push(`/${username.trim()}`);
    }
  };

  return (
    <div className='min-h-screen flex flex-col relative overflow-hidden'>
      {/* Animated Background Elements */}
      <div className='fixed inset-0 pointer-events-none'>
        <motion.div
          className='absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl'
          animate={{
            x: mousePosition.x * 0.01,
            y: mousePosition.y * 0.01,
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.div
          className='absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl'
          animate={{
            x: -mousePosition.x * 0.005,
            y: -mousePosition.y * 0.005,
            scale: [1.1, 1, 1.1],
          }}
          transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
        />
      </div>

      {/* Hero Section */}
      <motion.div
        className='relative z-10 w-full px-4 md:px-0 py-20 flex flex-col items-center justify-center'
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        {/* Logo and Title */}
        <motion.div
          className='text-center mb-12'
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            className='flex items-center justify-center gap-4 mb-8'
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Image
                alt='logo'
                src='/mydevfolio.png'
                width={50}
                height={50}
                className='drop-shadow-lg'
              />
            </motion.div>
            <motion.h1
              className='text-4xl md:text-5xl font-bold font-mono bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent'
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              MyDevFolioXD
            </motion.h1>
          </motion.div>

          <motion.h2
            className='text-5xl md:text-7xl font-bold mb-8 leading-tight'
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <span className='bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent'>
              Transform Your GitHub
            </span>
            <br />
            <motion.span
              className='bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent'
              animate={{
                textShadow: [
                  '0 0 20px rgba(168, 85, 247, 0.4)',
                  '0 0 40px rgba(236, 72, 153, 0.6)',
                  '0 0 20px rgba(168, 85, 247, 0.4)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Into Magic ✨
            </motion.span>
          </motion.h2>

          <motion.p
            className='text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            🚀 Create a <span className='text-purple-400 font-semibold'>stunning developer portfolio</span> that makes recruiters go{' '}
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className='text-yellow-400 font-bold'
            >
              "Wow!"
            </motion.span>
            <br />
            Just enter your GitHub username and watch the magic happen! ✨
          </motion.p>

          {/* Enhanced Social Media Icons */}
          <motion.div
            className='flex justify-center gap-6 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            {[
              {
                href: 'https://x.com/raj_dev_X',
                icon: (
                  <path d='M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z' />
                ),
                label: 'Twitter',
                color: 'hover:text-blue-400 hover:border-blue-400'
              },
              {
                href: 'https://github.com',
                icon: (
                  <path d='M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22' />
                ),
                label: 'GitHub',
                color: 'hover:text-purple-400 hover:border-purple-400'
              }
            ].map((social, index) => (
              <motion.a
                key={social.label}
                href={social.href}
                target='_blank'
                rel='noopener noreferrer'
                className={`group relative bg-white/5 backdrop-blur-lg border border-white/10 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${social.color} hover:bg-white/10 hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/25`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.5, type: 'spring' }}
                whileHover={{
                  rotate: [0, -10, 10, 0],
                  transition: { duration: 0.3 }
                }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='transition-all duration-300 group-hover:scale-110'
                >
                  {social.icon}
                </svg>
                <div className='absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs text-gray-400 whitespace-nowrap'>
                  {social.label}
                </div>
              </motion.a>
            ))}
          </motion.div>
        </motion.div>

        {/* Enhanced Form */}
        <motion.div
          className='w-full max-w-lg'
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <motion.form
            onSubmit={handleSubmit}
            className='relative'
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {/* Glassmorphism Container */}
            <div className='relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl'>
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
                transition={{ duration: 4, repeat: Infinity }}
              />

              <div className='relative z-10'>
                <motion.div
                  className='relative mb-6'
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                >
                  <div className='absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none'>
                    <span className='text-gray-400 font-medium'>github.com/</span>
                  </div>
                  <motion.input
                    type='text'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder='your-username'
                    className='w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 pl-32 pr-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 text-lg font-medium backdrop-blur-sm'
                    required
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  />
                </motion.div>

                <motion.button
                  type='submit'
                  disabled={isSubmitting || !username.trim()}
                  className='w-full relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 text-white py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-purple-500/25'
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4, duration: 0.6 }}
                >
                  {/* Animated Background */}
                  <motion.div
                    className='absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400'
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />

                  <span className='relative z-10 flex items-center justify-center gap-3'>
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24'>
                            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z' />
                          </svg>
                        </motion.div>
                        Creating Magic...
                      </>
                    ) : (
                      <>
                        <motion.span
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          🎨
                        </motion.span>
                        Create My Magical Portfolio
                        <motion.span
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          ✨
                        </motion.span>
                      </>
                    )}
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.form>
        </motion.div>
      </motion.div>

      {/* Enhanced Feature Cards Section */}
      <motion.div
        className='w-full px-4 pb-20 relative'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
      >
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto'>
          {[
            {
              icon: (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 10V3L4 14h7v7l9-11h-7z'
                />
              ),
              title: '⚡ Instant Magic',
              description: '✨ Your dream portfolio in seconds! Just type your GitHub username and watch the magic unfold! 🎉',
              gradient: 'from-yellow-500/20 to-orange-500/20',
              iconColor: 'text-yellow-400',
              delay: 0
            },
            {
              icon: (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z'
                />
              ),
              title: '🎨 Showcase Your Art',
              description: '🌟 Your projects deserve the spotlight! Beautiful cards that make your code shine like stars ✨',
              gradient: 'from-purple-500/20 to-pink-500/20',
              iconColor: 'text-purple-400',
              delay: 0.2
            },
            {
              icon: (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z'
                />
              ),
              title: '🔗 Share & Shine',
              description: '🎯 Share your amazing portfolio with a cute link! Updates magically with your latest GitHub adventures! 🚀',
              gradient: 'from-blue-500/20 to-cyan-500/20',
              iconColor: 'text-blue-400',
              delay: 0.4
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className={`group relative overflow-hidden bg-gradient-to-br ${feature.gradient} backdrop-blur-xl border border-white/10 rounded-3xl p-8 cursor-default transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10`}
              initial={{ opacity: 0, y: 50, rotateY: -15 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{
                delay: 1.8 + feature.delay,
                duration: 0.8,
                type: 'spring',
                stiffness: 100
              }}
              whileHover={{
                y: -10,
                scale: 1.02,
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
            >
              {/* Animated Background */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                initial={{ scale: 0, borderRadius: '100%' }}
                whileHover={{ scale: 2, borderRadius: '0%' }}
                transition={{ duration: 0.5 }}
              />

              {/* Floating Particles */}
              <div className='absolute inset-0 pointer-events-none'>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className='absolute w-2 h-2 bg-white/20 rounded-full'
                    style={{
                      left: `${20 + i * 30}%`,
                      top: `${20 + i * 20}%`,
                    }}
                    animate={{
                      y: [-10, 10, -10],
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      duration: 3 + i,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                  />
                ))}
              </div>

              <div className='relative z-10'>
                <motion.div
                  className={`w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6 ${feature.iconColor} group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{
                    rotate: [0, -10, 10, 0],
                    transition: { duration: 0.5 }
                  }}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-8 w-8'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    {feature.icon}
                  </svg>
                </motion.div>

                <motion.h3
                  className='text-2xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 + feature.delay, duration: 0.6 }}
                >
                  {feature.title}
                </motion.h3>

                <motion.p
                  className='text-gray-300 text-base leading-relaxed'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.2 + feature.delay, duration: 0.6 }}
                >
                  {feature.description}
                </motion.p>
              </div>

              {/* Hover Glow Effect */}
              <motion.div
                className='absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500'
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.8 }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Enhanced Bottom Section */}
      <motion.div
        className='w-full px-4 pb-20'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
      >
        <div className='text-center max-w-4xl mx-auto'>
          <motion.div
            className='mb-8'
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.7, duration: 0.8 }}
          >
            <div className='inline-flex items-center gap-3 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 border border-white/20 rounded-full px-6 py-3 backdrop-blur-xl shadow-2xl'>
              <motion.span
                className='text-pink-400 text-2xl'
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                💖
              </motion.span>
              <span className='text-white text-lg font-semibold'>Ready to shine?</span>
              <motion.span
                className='text-purple-400 text-2xl'
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ✨
              </motion.span>
            </div>
          </motion.div>

          <motion.p
            className='text-2xl md:text-3xl text-gray-300 mb-8 font-medium leading-relaxed'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.9, duration: 0.8 }}
          >
            🌟 Your <span className='text-purple-400 font-bold'>magical portfolio</span> awaits at
          </motion.p>

          <motion.div
            className='font-mono inline-block bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 border border-white/20 rounded-2xl px-10 py-6 backdrop-blur-xl shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 hover:scale-105 cursor-pointer group'
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 3.1, duration: 0.8, type: 'spring' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className='flex items-center gap-2'>
              <span className='text-white text-xl font-bold'>MyDevFolioXD.com/</span>
              <motion.span
                className='text-purple-400 font-bold text-xl'
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                your-username
              </motion.span>
              <motion.span
                className='text-yellow-400 text-2xl'
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨
              </motion.span>
            </div>
          </motion.div>

          <motion.div
            className='mt-8 flex flex-wrap justify-center gap-6 text-sm'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.3, duration: 0.8 }}
          >
            {[
              { icon: '✅', text: 'No signup needed', color: 'text-green-400' },
              { icon: '💎', text: 'Free forever', color: 'text-blue-400' },
              { icon: '🔮', text: 'Pure magic', color: 'text-purple-400' },
              { icon: '⚡', text: 'Instant creation', color: 'text-yellow-400' }
            ].map((item, index) => (
              <motion.div
                key={item.text}
                className='flex items-center gap-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-full px-4 py-2'
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 3.3 + index * 0.1,
                  duration: 0.5,
                  type: 'spring',
                  stiffness: 200
                }}
                whileHover={{ scale: 1.05 }}
              >
                <span className={`${item.color} text-lg`}>{item.icon}</span>
                <span className='text-gray-300 font-medium'>{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* GitHub API Rate Limit Indicator */}
      {/* <RateLimitIndicator /> */}
    </div>
  );
}
