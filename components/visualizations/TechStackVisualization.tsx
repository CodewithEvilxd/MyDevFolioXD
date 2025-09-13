'use client';

import { useState, useEffect } from 'react';
import { Repository } from '@/types';
import { motion } from 'framer-motion';

interface TechStackVisualizationProps {
  repos: Repository[];
}

interface TechItem {
  name: string;
  count: number;
  color: string;
  icon: string;
  category: string;
}

const techIcons: Record<string, string> = {
  JavaScript: '🟨',
  TypeScript: '🔷',
  Python: '🐍',
  Java: '☕',
  'C++': '⚡',
  'C#': '💎',
  Go: '🐹',
  Rust: '🦀',
  PHP: '🐘',
  Ruby: '💎',
  Swift: '🦉',
  Kotlin: '🎯',
  Dart: '🎯',
  HTML: '🌐',
  CSS: '🎨',
  React: '⚛️',
  Vue: '💚',
  Angular: '🅰️',
  Node: '🟢',
  Express: '🚂',
  Django: '🎸',
  Flask: '🧪',
  Spring: '🌱',
  Laravel: '🎭',
  Rails: '🚂',
  Next: '▲',
  Nuxt: '💚',
  Svelte: '🧡',
  Gatsby: '👻',
  Hugo: '🤗',
  Jekyll: '💎',
  MongoDB: '🍃',
  PostgreSQL: '🐘',
  MySQL: '🦭',
  Redis: '🔴',
  Docker: '🐳',
  Kubernetes: '⛵',
  AWS: '☁️',
  Azure: '☁️',
  GCP: '☁️',
  Git: '📚',
  GitHub: '🐙',
  GitLab: '🦊',
  Bitbucket: '🐦'
};

const techColors: Record<string, string> = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Python: '#3776ab',
  Java: '#007396',
  'C++': '#00599c',
  'C#': '#239120',
  Go: '#00add8',
  Rust: '#000000',
  PHP: '#777bb4',
  Ruby: '#cc342d',
  Swift: '#fa7343',
  Kotlin: '#7f52ff',
  Dart: '#00b4ab',
  HTML: '#e34f26',
  CSS: '#1572b6',
  React: '#61dafb',
  Vue: '#4fc08d',
  Angular: '#dd0031',
  Node: '#339933',
  Express: '#000000',
  Django: '#092e20',
  Flask: '#000000',
  Spring: '#6db33f',
  Laravel: '#ff2d20',
  Rails: '#cc0000',
  Next: '#000000',
  Nuxt: '#00dc82',
  Svelte: '#ff3e00',
  Gatsby: '#663399',
  Hugo: '#ff4088',
  Jekyll: '#cc0000',
  MongoDB: '#47a248',
  PostgreSQL: '#336791',
  MySQL: '#4479a1',
  Redis: '#dc382d',
  Docker: '#2496ed',
  Kubernetes: '#326ce5',
  AWS: '#ff9900',
  Azure: '#0078d4',
  GCP: '#4285f4',
  Git: '#f05032',
  GitHub: '#181717',
  GitLab: '#fca121',
  Bitbucket: '#0052cc'
};

export default function TechStackVisualization({ repos }: TechStackVisualizationProps) {
  const [techStack, setTechStack] = useState<TechItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const analyzeTechStack = () => {
      const techCount: Record<string, number> = {};
      const topicsCount: Record<string, number> = {};

      repos.forEach(repo => {
        // Count programming languages
        if (repo.language) {
          techCount[repo.language] = (techCount[repo.language] || 0) + 1;
        }

        // Count topics/technologies
        if (repo.topics) {
          repo.topics.forEach(topic => {
            const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
            topicsCount[capitalizedTopic] = (topicsCount[capitalizedTopic] || 0) + 1;
          });
        }
      });

      // Combine and categorize
      const allTech = { ...techCount, ...topicsCount };
      const categorizedTech: TechItem[] = Object.entries(allTech)
        .map(([name, count]) => {
          let category = 'Other';
          if (['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Dart'].includes(name)) {
            category = 'Languages';
          } else if (['React', 'Vue', 'Angular', 'Next', 'Nuxt', 'Svelte', 'Gatsby', 'Hugo', 'Jekyll'].includes(name)) {
            category = 'Frameworks';
          } else if (['Node', 'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'Rails'].includes(name)) {
            category = 'Backend';
          } else if (['MongoDB', 'PostgreSQL', 'MySQL', 'Redis'].includes(name)) {
            category = 'Databases';
          } else if (['Docker', 'Kubernetes'].includes(name)) {
            category = 'DevOps';
          } else if (['AWS', 'Azure', 'GCP'].includes(name)) {
            category = 'Cloud';
          } else if (['Git', 'GitHub', 'GitLab', 'Bitbucket'].includes(name)) {
            category = 'Tools';
          }

          return {
            name,
            count,
            color: techColors[name] || '#6b7280',
            icon: techIcons[name] || '🔧',
            category
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Top 20 technologies

      setTechStack(categorizedTech);
    };

    analyzeTechStack();
  }, [repos]);

  const categories = ['all', ...Array.from(new Set(techStack.map(tech => tech.category)))];
  const filteredTech = selectedCategory === 'all'
    ? techStack
    : techStack.filter(tech => tech.category === selectedCategory);

  const maxCount = Math.max(...techStack.map(tech => tech.count));

  return (
    <motion.div
      className='w-full'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className='flex items-center justify-between mb-6'>
        <h2 className='section-heading'>Tech Stack</h2>
        <div className='flex gap-2'>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--card-border)]'
              }`}
            >
              {category === 'all' ? 'All' : category}
            </button>
          ))}
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'>
        {filteredTech.map((tech, index) => (
          <motion.div
            key={tech.name}
            className='card text-center relative overflow-hidden'
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
          >
            <div
              className='w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl'
              style={{ backgroundColor: `${tech.color}20`, color: tech.color }}
            >
              {tech.icon}
            </div>

            <h3 className='font-bold text-sm mb-1'>{tech.name}</h3>
            <p className='text-xs text-[var(--text-secondary)] mb-2'>
              {tech.count} {tech.count === 1 ? 'project' : 'projects'}
            </p>

            {/* Usage bar */}
            <div className='w-full bg-[var(--card-border)] rounded-full h-1 mb-2'>
              <motion.div
                className='h-1 rounded-full'
                style={{ backgroundColor: tech.color, width: `${(tech.count / maxCount) * 100}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${(tech.count / maxCount) * 100}%` }}
                transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
              />
            </div>

            <span className='text-xs px-2 py-1 bg-[var(--background)] rounded-full'>
              {tech.category}
            </span>
          </motion.div>
        ))}
      </div>

      {filteredTech.length === 0 && (
        <motion.div
          className='text-center py-8'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className='text-[var(--text-secondary)]'>No technologies found in this category</p>
        </motion.div>
      )}

      {/* Tech Stack Summary */}
      <motion.div
        className='mt-6 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className='card text-center'>
          <div className='text-2xl font-bold text-[var(--primary)]'>{techStack.length}</div>
          <div className='text-sm text-[var(--text-secondary)]'>Technologies</div>
        </div>

        <div className='card text-center'>
          <div className='text-2xl font-bold text-[var(--primary)]'>
            {techStack.filter(t => t.category === 'Languages').length}
          </div>
          <div className='text-sm text-[var(--text-secondary)]'>Languages</div>
        </div>

        <div className='card text-center'>
          <div className='text-2xl font-bold text-[var(--primary)]'>
            {techStack.filter(t => t.category === 'Frameworks').length}
          </div>
          <div className='text-sm text-[var(--text-secondary)]'>Frameworks</div>
        </div>

        <div className='card text-center'>
          <div className='text-2xl font-bold text-[var(--primary)]'>
            {categories.length - 1}
          </div>
          <div className='text-sm text-[var(--text-secondary)]'>Categories</div>
        </div>
      </motion.div>
    </motion.div>
  );
}