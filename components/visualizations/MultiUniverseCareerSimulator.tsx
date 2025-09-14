'use client';

import { useState, useEffect } from 'react';
import { Repository, GitHubUser } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface Universe {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  companies: string[];
  achievements: string[];
  currentRole: string;
  salary: string;
  projects: number;
  followers: number;
  probability: number;
  color: string;
  timeline: TimelineEvent[];
}

interface TimelineEvent {
  year: number;
  event: string;
  impact: 'positive' | 'negative' | 'neutral';
}

interface MultiUniverseCareerSimulatorProps {
  username: string;
  user: GitHubUser;
  repos: Repository[];
}

export default function MultiUniverseCareerSimulator({ username, user, repos }: MultiUniverseCareerSimulatorProps) {
  const [universes, setUniverses] = useState<Universe[]>([]);
  const [selectedUniverse, setSelectedUniverse] = useState<Universe | null>(null);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const analyzeCurrentCareer = () => {
    const languages = new Set<string>();
    const topics = new Set<string>();
    const yearsActive = Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365));
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);

    repos.forEach(repo => {
      if (repo.language) languages.add(repo.language);
      if (repo.topics) repo.topics.forEach(topic => topics.add(topic));
    });

    return {
      languages: Array.from(languages),
      topics: Array.from(topics),
      yearsActive,
      totalStars,
      totalForks,
      repoCount: repos.length,
      followers: user.followers,
      following: user.following
    };
  };

  const simulateUniverses = async () => {
    if (simulating) return;

    setSimulating(true);
    setLoading(true);

    try {
      const current = analyzeCurrentCareer();
      const simulatedUniverses = generateAlternativeUniverses(current);
      setUniverses(simulatedUniverses);
    } catch (error) {
      
    } finally {
      setLoading(false);
      setSimulating(false);
    }
  };

  const generateAlternativeUniverses = (current: any): Universe[] => {
    const universes: Universe[] = [];

    // Universe 1: Early Blockchain Pioneer
    if (current.yearsActive > 3) {
      universes.push({
        id: 'blockchain-pioneer',
        name: 'Blockchain Pioneer',
        description: 'You discovered blockchain early and became a DeFi protocol architect',
        technologies: ['Solidity', 'Web3.js', 'Rust', 'Ethereum', 'IPFS'],
        companies: ['ConsenSys', 'Chainlink', 'Aave'],
        achievements: ['Built 5 DeFi protocols', 'Raised $2M in funding', 'Spoke at ETH Denver'],
        currentRole: 'Chief Blockchain Architect',
        salary: '$350,000',
        projects: current.repoCount + 15,
        followers: current.followers * 3,
        probability: 0.15,
        color: '#F59E0B',
        timeline: [
          { year: 2017, event: 'Discovered Bitcoin whitepaper', impact: 'positive' },
          { year: 2018, event: 'Built first smart contract', impact: 'positive' },
          { year: 2020, event: 'Joined DeFi startup', impact: 'positive' },
          { year: 2022, event: 'Led $5M Series A round', impact: 'positive' },
          { year: 2024, event: 'Became blockchain consultant', impact: 'positive' }
        ]
      });
    }

    // Universe 2: AI/ML Research Scientist
    if (current.languages.includes('Python') || current.topics.has('machine-learning')) {
      universes.push({
        id: 'ai-researcher',
        name: 'AI Research Scientist',
        description: 'You pursued PhD in AI and now lead research at a top lab',
        technologies: ['Python', 'TensorFlow', 'PyTorch', 'CUDA', 'JAX'],
        companies: ['OpenAI', 'DeepMind', 'Google Brain'],
        achievements: ['Published 12 papers in NeurIPS', 'PhD in Machine Learning', 'H-index of 25'],
        currentRole: 'Principal Research Scientist',
        salary: '$280,000',
        projects: current.repoCount - 5,
        followers: current.followers * 2.5,
        probability: 0.20,
        color: '#8B5CF6',
        timeline: [
          { year: 2019, event: 'Started PhD program', impact: 'positive' },
          { year: 2020, event: 'First paper published', impact: 'positive' },
          { year: 2021, event: 'Internship at Google Brain', impact: 'positive' },
          { year: 2023, event: 'Joined OpenAI', impact: 'positive' },
          { year: 2024, event: 'Led breakthrough in AGI safety', impact: 'positive' }
        ]
      });
    }

    // Universe 3: Startup Founder
    universes.push({
      id: 'startup-founder',
      name: 'Serial Entrepreneur',
      description: 'You founded 3 successful startups and became a venture capitalist',
      technologies: ['React', 'Node.js', 'AWS', 'PostgreSQL', 'Kubernetes'],
      companies: ['Your Startup #1', 'Your Startup #2', 'Your Startup #3'],
      achievements: ['3 successful exits', 'Raised $15M total', 'Angel investor network'],
      currentRole: 'CEO & Venture Capitalist',
      salary: '$500,000+',
      projects: current.repoCount + 8,
      followers: current.followers * 4,
      probability: 0.10,
      color: '#10B981',
      timeline: [
        { year: 2018, event: 'Quit job to start first company', impact: 'positive' },
        { year: 2019, event: 'First startup acquired for $8M', impact: 'positive' },
        { year: 2020, event: 'Started second startup during pandemic', impact: 'positive' },
        { year: 2022, event: 'Second exit for $12M', impact: 'positive' },
        { year: 2024, event: 'Became VC and mentor', impact: 'positive' }
        ]
      });

    // Universe 4: Big Tech Executive
    if (current.repoCount > 10) {
      universes.push({
        id: 'big-tech-executive',
        name: 'Big Tech Executive',
        description: 'You joined FAANG early and rose to executive level',
        technologies: ['Java', 'C++', 'Python', 'Scala', 'Kubernetes'],
        companies: ['Google', 'Meta', 'Amazon'],
        achievements: ['Led 500+ person team', 'Doubled company revenue', 'Stock options worth $50M'],
        currentRole: 'VP of Engineering',
        salary: '$450,000',
        projects: current.repoCount - 10,
        followers: current.followers * 1.5,
        probability: 0.25,
        color: '#EF4444',
        timeline: [
          { year: 2016, event: 'Joined Google as junior engineer', impact: 'positive' },
          { year: 2018, event: 'Promoted to Senior Engineer', impact: 'positive' },
          { year: 2020, event: 'Became Engineering Manager', impact: 'positive' },
          { year: 2022, event: 'Promoted to Director', impact: 'positive' },
          { year: 2024, event: 'VP of Engineering role', impact: 'positive' }
        ]
      });
    }

    // Universe 5: Open Source Legend
    if (current.totalForks > current.totalStars) {
      universes.push({
        id: 'open-source-legend',
        name: 'Open Source Legend',
        description: 'You became the maintainer of major open source projects',
        technologies: ['Go', 'Rust', 'TypeScript', 'Docker', 'Linux'],
        companies: ['GitHub', 'Linux Foundation', 'CNCF'],
        achievements: ['Maintainer of 3 major projects', 'GitHub Stars: 50K+', 'Keynote speaker at conferences'],
        currentRole: 'Open Source Program Manager',
        salary: '$180,000',
        projects: current.repoCount + 20,
        followers: current.followers * 5,
        probability: 0.30,
        color: '#06B6D4',
        timeline: [
          { year: 2017, event: 'First open source contribution', impact: 'positive' },
          { year: 2019, event: 'Became maintainer of popular library', impact: 'positive' },
          { year: 2021, event: 'Spoke at FOSDEM', impact: 'positive' },
          { year: 2023, event: 'Joined GitHub as OSS advocate', impact: 'positive' },
          { year: 2024, event: 'Led major open source initiative', impact: 'positive' }
        ]
      });
    }

    // Universe 6: Burned Out Consultant
    universes.push({
      id: 'burned-out-consultant',
      name: 'Corporate Consultant',
      description: 'You became a well-paid consultant but lost passion for coding',
      technologies: ['PowerPoint', 'Excel', 'Java', 'SQL'],
      companies: ['Accenture', 'Deloitte', 'PwC'],
      achievements: ['Managed $10M projects', 'Got PMP certification', 'Traveled to 20 countries'],
      currentRole: 'Senior Management Consultant',
      salary: '$220,000',
      projects: Math.max(0, current.repoCount - 15),
      followers: Math.max(0, current.followers - 500),
      probability: 0.35,
      color: '#6B7280',
      timeline: [
        { year: 2018, event: 'Started consulting career', impact: 'neutral' },
        { year: 2020, event: 'Got promoted to Senior Consultant', impact: 'positive' },
        { year: 2021, event: 'Burned out from constant travel', impact: 'negative' },
        { year: 2023, event: 'Lost touch with latest technologies', impact: 'negative' },
        { year: 2024, event: 'Considering career change back to coding', impact: 'neutral' }
      ]
    });

    return universes.sort((a, b) => b.probability - a.probability);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return '📈';
      case 'negative': return '📉';
      default: return '➡️';
    }
  };

  return (
    <motion.div
      className='card'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-bold'>Multi-Universe Career Simulator</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Explore alternate career paths you might have taken
          </p>
        </div>

        <button
          onClick={simulateUniverses}
          disabled={simulating}
          className='px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all disabled:opacity-50 font-medium flex items-center gap-2'
        >
          {simulating ? (
            <>
              <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
              Simulating...
            </>
          ) : (
            <>
              <span>🌌</span>
              Simulate Universes
            </>
          )}
        </button>
      </div>

      {universes.length === 0 && !loading && (
        <div className='text-center py-12'>
          <div className='w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-4xl'>🌌</span>
          </div>
          <h3 className='text-lg font-bold mb-2'>Infinite Possibilities</h3>
          <p className='text-[var(--text-secondary)] mb-6'>
            Discover what your career might look like in parallel universes
          </p>
        </div>
      )}

      {loading && (
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
            <p className='text-[var(--text-secondary)]'>Calculating quantum probabilities...</p>
          </div>
        </div>
      )}

      <div className='grid gap-4'>
        <AnimatePresence>
          {universes.map((universe, index) => (
            <motion.div
              key={universe.id}
              className='card cursor-pointer group relative overflow-hidden'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              onClick={() => setSelectedUniverse(universe)}
              whileHover={{ scale: 1.02 }}
            >
              {/* Universe background effect */}
              <div
                className='absolute inset-0 opacity-10'
                style={{ backgroundColor: universe.color }}
              />

              <div className='relative z-10 flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <div
                    className='w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg'
                    style={{ backgroundColor: universe.color }}
                  >
                    {universe.name.charAt(0)}
                  </div>

                  <div>
                    <h3 className='text-lg font-bold group-hover:text-[var(--primary)] transition-colors'>
                      {universe.name}
                    </h3>
                    <p className='text-[var(--text-secondary)] text-sm'>
                      {universe.description}
                    </p>
                    <div className='flex items-center gap-4 mt-2 text-xs text-[var(--text-secondary)]'>
                      <span>🎯 {universe.currentRole}</span>
                      <span>💰 {universe.salary}</span>
                      <span>📊 {Math.round(universe.probability * 100)}% probability</span>
                    </div>
                  </div>
                </div>

                <div className='text-right'>
                  <div className='text-2xl font-bold' style={{ color: universe.color }}>
                    🌟
                  </div>
                  <div className='text-xs text-[var(--text-secondary)] mt-1'>
                    {universe.followers.toLocaleString()} followers
                  </div>
                </div>
              </div>

              {/* Tech stack preview */}
              <div className='mt-4 flex flex-wrap gap-2'>
                {universe.technologies.slice(0, 4).map(tech => (
                  <span
                    key={tech}
                    className='px-2 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] text-xs rounded-full'
                  >
                    {tech}
                  </span>
                ))}
                {universe.technologies.length > 4 && (
                  <span className='px-2 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] text-xs rounded-full'>
                    +{universe.technologies.length - 4} more
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Universe Detail Modal */}
      <AnimatePresence>
        {selectedUniverse && (
          <motion.div
            className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedUniverse(null)}
          >
            <motion.div
              className='bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden'
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className='p-6 border-b border-[var(--card-border)]'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-4'>
                    <div
                      className='w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl'
                      style={{ backgroundColor: selectedUniverse.color }}
                    >
                      {selectedUniverse.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className='text-2xl font-bold'>{selectedUniverse.name}</h2>
                      <p className='text-[var(--text-secondary)]'>{selectedUniverse.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUniverse(null)}
                    className='text-[var(--text-secondary)] hover:text-white p-2'
                  >
                    ✕
                  </button>
                </div>

                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
                    <div className='text-lg font-bold' style={{ color: selectedUniverse.color }}>
                      {selectedUniverse.currentRole}
                    </div>
                    <div className='text-xs text-[var(--text-secondary)]'>Current Role</div>
                  </div>

                  <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
                    <div className='text-lg font-bold text-green-500'>
                      {selectedUniverse.salary}
                    </div>
                    <div className='text-xs text-[var(--text-secondary)]'>Annual Salary</div>
                  </div>

                  <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
                    <div className='text-lg font-bold text-blue-500'>
                      {selectedUniverse.projects}
                    </div>
                    <div className='text-xs text-[var(--text-secondary)]'>Total Projects</div>
                  </div>

                  <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
                    <div className='text-lg font-bold text-purple-500'>
                      {Math.round(selectedUniverse.probability * 100)}%
                    </div>
                    <div className='text-xs text-[var(--text-secondary)]'>Probability</div>
                  </div>
                </div>
              </div>

              <div className='p-6 overflow-y-auto max-h-96'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <h3 className='text-lg font-semibold mb-3'>Technologies</h3>
                    <div className='flex flex-wrap gap-2'>
                      {selectedUniverse.technologies.map(tech => (
                        <span
                          key={tech}
                          className='px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-sm rounded-full'
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <h3 className='text-lg font-semibold mb-3 mt-6'>Companies</h3>
                    <div className='space-y-2'>
                      {selectedUniverse.companies.map(company => (
                        <div key={company} className='flex items-center gap-2'>
                          <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                          <span className='text-sm'>{company}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className='text-lg font-semibold mb-3'>Key Achievements</h3>
                    <div className='space-y-2'>
                      {selectedUniverse.achievements.map(achievement => (
                        <div key={achievement} className='flex items-start gap-2'>
                          <span className='text-yellow-500 mt-1'>🏆</span>
                          <span className='text-sm'>{achievement}</span>
                        </div>
                      ))}
                    </div>

                    <h3 className='text-lg font-semibold mb-3 mt-6'>Timeline</h3>
                    <div className='space-y-3'>
                      {selectedUniverse.timeline.map((event, index) => (
                        <div key={index} className='flex items-center gap-3'>
                          <div className='text-xs text-[var(--text-secondary)] w-12'>
                            {event.year}
                          </div>
                          <div className={`text-xs ${getImpactColor(event.impact)}`}>
                            {getImpactIcon(event.impact)}
                          </div>
                          <div className='text-sm flex-1'>{event.event}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
