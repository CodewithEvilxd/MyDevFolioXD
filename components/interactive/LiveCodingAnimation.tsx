'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const codeSnippets = [
  {
    language: 'JavaScript',
    code: `const portfolio = {
  name: 'MyDevFolioXD',
  skills: ['React', 'Next.js', 'TypeScript'],
  projects: 42,
  stars: 1337
};

console.log('🚀 Building amazing portfolios!');`
  },
  {
    language: 'Python',
    code: `def create_portfolio(user_data):
    """Generate stunning portfolio from GitHub data"""
    skills = extract_skills(user_data.repos)
    projects = showcase_projects(user_data.pinned)

    return Portfolio(
        name=user_data.name,
        skills=skills,
        projects=projects,
        theme='dark_mode'
    )

print("✨ Portfolio created successfully!")`
  },
  {
    language: 'TypeScript',
    code: `interface Developer {
  name: string;
  skills: string[];
  projects: Project[];
  github: string;
}

const developer: Developer = {
  name: 'Awesome Dev',
  skills: ['React', 'Node.js', 'Python'],
  projects: featuredProjects,
  github: 'https://github.com/username'
};

export default developer;`
  }
];

export default function LiveCodingAnimation() {
  const [currentSnippet, setCurrentSnippet] = useState(0);
  const [displayedCode, setDisplayedCode] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const snippet = codeSnippets[currentSnippet];
    let charIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const typeCode = () => {
      if (charIndex < snippet.code.length) {
        setDisplayedCode(snippet.code.slice(0, charIndex + 1));
        charIndex++;
        timeoutId = setTimeout(typeCode, 50 + Math.random() * 50);
      } else {
        setIsTyping(false);
        setTimeout(() => {
          setCurrentSnippet((prev) => (prev + 1) % codeSnippets.length);
          setDisplayedCode('');
          setIsTyping(true);
        }, 3000);
      }
    };

    if (isTyping) {
      typeCode();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentSnippet, isTyping]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <motion.div
      className='card'
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className='flex items-center gap-2 px-4 py-2 border-b border-[var(--card-border)] bg-opacity-50'>
        <div className='w-3 h-3 rounded-full bg-red-500'></div>
        <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
        <div className='w-3 h-3 rounded-full bg-green-500'></div>
        <div className='ml-2 text-xs font-mono text-[var(--text-secondary)]'>
          live-coding.tsx - {codeSnippets[currentSnippet].language}
        </div>
      </div>

      <div className='p-4'>
        <div className='flex items-start gap-2 mb-2'>
          <span className='font-mono text-[var(--primary)]'>$</span>
          <span className='text-[var(--text-secondary)]'>
            npm run build-portfolio
          </span>
        </div>

        <div className='bg-[var(--background)] rounded-lg p-4 font-mono text-sm overflow-hidden'>
          <pre className='text-[var(--text-primary)] whitespace-pre-wrap'>
            {displayedCode}
            {showCursor && isTyping && (
              <span className='bg-[var(--primary)] text-white animate-pulse'>█</span>
            )}
          </pre>
        </div>

        <div className='flex items-center justify-between mt-4'>
          <div className='flex items-center gap-2'>
            <div className={`w-2 h-2 rounded-full ${isTyping ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <span className='text-xs text-[var(--text-secondary)]'>
              {isTyping ? 'Typing...' : 'Complete'}
            </span>
          </div>

          <div className='flex gap-1'>
            {codeSnippets.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSnippet ? 'bg-[var(--primary)]' : 'bg-[var(--card-border)]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}