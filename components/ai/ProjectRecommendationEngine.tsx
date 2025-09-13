'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from 'recharts';

interface ProjectRecommendation {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  technologies: string[];
  category: string;
  potentialImpact: number;
  matchScore: number;
  whyRecommended: string[];
  learningOutcomes: string[];
  prerequisites: string[];
}

interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  priority: 'High' | 'Medium' | 'Low';
}

interface ProjectRecommendationEngineProps {
  username: string;
  repos: any[];
  user: any;
}

export default function ProjectRecommendationEngine({ username, repos, user }: ProjectRecommendationEngineProps) {
  const [recommendations, setRecommendations] = useState<ProjectRecommendation[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'skill-gaps' | 'roadmap' | 'trends'>('recommendations');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const generateRecommendations = () => {
      // Mock project recommendations based on user profile
      const mockRecommendations: ProjectRecommendation[] = [
        {
          id: '1',
          title: 'AI-Powered Code Review Assistant',
          description: 'Build an intelligent code review tool that uses machine learning to suggest improvements and catch bugs automatically.',
          difficulty: 'Advanced',
          estimatedTime: '3-4 months',
          technologies: ['Python', 'TensorFlow', 'FastAPI', 'React', 'Docker'],
          category: 'AI/ML',
          potentialImpact: 95,
          matchScore: 88,
          whyRecommended: [
            'High demand for AI tools in development',
            'Leverages your existing Python and React skills',
            'Great for portfolio and potential startup idea'
          ],
          learningOutcomes: [
            'Machine Learning model training and deployment',
            'API design and microservices architecture',
            'Advanced React patterns and state management'
          ],
          prerequisites: ['Python', 'Basic ML concepts', 'REST APIs']
        },
        {
          id: '2',
          title: 'Real-time Collaboration Platform',
          description: 'Create a collaborative coding platform with real-time editing, video calls, and project management features.',
          difficulty: 'Advanced',
          estimatedTime: '4-5 months',
          technologies: ['Next.js', 'Socket.io', 'WebRTC', 'MongoDB', 'Redis'],
          category: 'Full-Stack',
          potentialImpact: 90,
          matchScore: 85,
          whyRecommended: [
            'Growing demand for remote collaboration tools',
            'Showcases full-stack development skills',
            'Complex real-time features demonstrate expertise'
          ],
          learningOutcomes: [
            'Real-time communication protocols',
            'WebRTC and video streaming',
            'Scalable architecture design'
          ],
          prerequisites: ['JavaScript/TypeScript', 'Node.js', 'Database design']
        },
        {
          id: '3',
          title: 'Developer Portfolio Analytics Tool',
          description: 'Build a comprehensive analytics dashboard for developers to track their GitHub activity and portfolio performance.',
          difficulty: 'Intermediate',
          estimatedTime: '2-3 months',
          technologies: ['React', 'D3.js', 'GitHub API', 'Node.js', 'PostgreSQL'],
          category: 'Data Visualization',
          potentialImpact: 85,
          matchScore: 92,
          whyRecommended: [
            'Directly relevant to your current work',
            'Demonstrates data visualization skills',
            'Useful tool for the developer community'
          ],
          learningOutcomes: [
            'Advanced data visualization techniques',
            'API integration and data processing',
            'User experience design for dashboards'
          ],
          prerequisites: ['React', 'JavaScript', 'Basic data structures']
        },
        {
          id: '4',
          title: 'Blockchain-based Voting System',
          description: 'Develop a secure, transparent voting system using blockchain technology for elections or organizational decisions.',
          difficulty: 'Advanced',
          estimatedTime: '4-6 months',
          technologies: ['Solidity', 'Web3.js', 'React', 'Ethereum', 'IPFS'],
          category: 'Blockchain',
          potentialImpact: 88,
          matchScore: 75,
          whyRecommended: [
            'Emerging technology with high growth potential',
            'Addresses real-world problems',
            'High learning curve with significant rewards'
          ],
          learningOutcomes: [
            'Blockchain fundamentals and smart contracts',
            'Cryptographic principles',
            'Decentralized application development'
          ],
          prerequisites: ['JavaScript', 'Basic cryptography', 'Web development']
        },
        {
          id: '5',
          title: 'IoT Home Automation Hub',
          description: 'Create a central hub for managing smart home devices with voice control, automation rules, and mobile app.',
          difficulty: 'Intermediate',
          estimatedTime: '3-4 months',
          technologies: ['Raspberry Pi', 'Python', 'MQTT', 'React Native', 'Firebase'],
          category: 'IoT',
          potentialImpact: 82,
          matchScore: 78,
          whyRecommended: [
            'Growing IoT market with practical applications',
            'Combines hardware and software skills',
            'Fun project with immediate tangible results'
          ],
          learningOutcomes: [
            'IoT protocols and device communication',
            'Hardware-software integration',
            'Mobile app development'
          ],
          prerequisites: ['Python', 'Basic electronics', 'Mobile development']
        }
      ];

      const mockSkillGaps: SkillGap[] = [
        { skill: 'Machine Learning', currentLevel: 3, requiredLevel: 7, gap: 4, priority: 'High' },
        { skill: 'Cloud Architecture', currentLevel: 4, requiredLevel: 8, gap: 4, priority: 'High' },
        { skill: 'DevOps/CI-CD', currentLevel: 5, requiredLevel: 8, gap: 3, priority: 'Medium' },
        { skill: 'Mobile Development', currentLevel: 6, requiredLevel: 8, gap: 2, priority: 'Medium' },
        { skill: 'Blockchain', currentLevel: 2, requiredLevel: 6, gap: 4, priority: 'Low' },
        { skill: 'UI/UX Design', currentLevel: 4, requiredLevel: 7, gap: 3, priority: 'Medium' }
      ];

      setRecommendations(mockRecommendations);
      setSkillGaps(mockSkillGaps);
      setLoading(false);
    };

    generateRecommendations();
  }, [username, repos, user]);

  const getFilteredRecommendations = () => {
    if (selectedCategory === 'all') return recommendations;
    return recommendations.filter(rec => rec.category === selectedCategory);
  };

  const getCategories = () => {
    const categories = ['all', ...Array.from(new Set(recommendations.map(r => r.category)))];
    return categories;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-500 bg-green-500/20';
      case 'Intermediate': return 'text-yellow-500 bg-yellow-500/20';
      case 'Advanced': return 'text-red-500 bg-red-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-500 bg-red-500/20';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/20';
      case 'Low': return 'text-green-500 bg-green-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getSkillGapData = () => {
    return skillGaps.map(gap => ({
      skill: gap.skill,
      current: gap.currentLevel,
      required: gap.requiredLevel,
      gap: gap.gap
    }));
  };

  const getCategoryDistribution = () => [
    { name: 'AI/ML', value: 1, color: '#8B5CF6' },
    { name: 'Full-Stack', value: 1, color: '#3B82F6' },
    { name: 'Data Visualization', value: 1, color: '#10B981' },
    { name: 'Blockchain', value: 1, color: '#F59E0B' },
    { name: 'IoT', value: 1, color: '#EF4444' }
  ];

  if (loading) {
    return (
      <div className='card'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold'>Project Recommendation Engine</h2>
          <div className='w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin'></div>
        </div>
        <div className='animate-pulse space-y-4'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='h-20 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
            ))}
          </div>
          <div className='h-64 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className='card'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-bold'>Project Recommendation Engine</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            AI-powered project recommendations based on your skills and market trends
          </p>
        </div>

        {/* Tab Navigation */}
        <div className='flex bg-[var(--background)] rounded-lg p-1'>
          {[
            { id: 'recommendations', label: 'Recommendations' },
            { id: 'skill-gaps', label: 'Skill Gaps' },
            { id: 'roadmap', label: 'Roadmap' },
            { id: 'trends', label: 'Trends' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'recommendations' && (
        <div className='space-y-6'>
          {/* Category Filter */}
          <div className='flex flex-wrap gap-2'>
            {getCategories().map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--background)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--card-border)]'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>

          {/* Project Recommendations */}
          <div className='space-y-4'>
            {getFilteredRecommendations().map((project, index) => (
              <motion.div
                key={project.id}
                className='bg-[var(--background)] p-6 rounded-lg border border-[var(--card-border)]'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-2'>
                      <h3 className='text-xl font-bold'>{project.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(project.difficulty)}`}>
                        {project.difficulty}
                      </span>
                    </div>
                    <p className='text-[var(--text-secondary)] mb-3'>{project.description}</p>

                    <div className='flex items-center gap-4 text-sm text-[var(--text-secondary)] mb-3'>
                      <span>⏱️ {project.estimatedTime}</span>
                      <span>🎯 {project.category}</span>
                      <span>📊 Match: {project.matchScore}%</span>
                      <span>💎 Impact: {project.potentialImpact}%</span>
                    </div>
                  </div>

                  <div className='text-right'>
                    <div className='text-2xl font-bold text-[var(--primary)] mb-1'>
                      {project.matchScore}%
                    </div>
                    <p className='text-xs text-[var(--text-secondary)]'>Match Score</p>
                  </div>
                </div>

                {/* Technologies */}
                <div className='mb-4'>
                  <h4 className='font-medium mb-2'>Technologies:</h4>
                  <div className='flex flex-wrap gap-2'>
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className='px-2 py-1 bg-[var(--primary)] bg-opacity-20 text-[var(--primary)] rounded-full text-xs'
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Why Recommended */}
                <div className='mb-4'>
                  <h4 className='font-medium mb-2'>Why Recommended:</h4>
                  <ul className='text-sm text-[var(--text-secondary)] space-y-1'>
                    {project.whyRecommended.map((reason, idx) => (
                      <li key={idx} className='flex items-start gap-2'>
                        <span className='text-green-500 mt-1'>✓</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Learning Outcomes */}
                <div className='mb-4'>
                  <h4 className='font-medium mb-2'>Learning Outcomes:</h4>
                  <div className='flex flex-wrap gap-2'>
                    {project.learningOutcomes.map((outcome) => (
                      <span
                        key={outcome}
                        className='px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs'
                      >
                        {outcome}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Prerequisites */}
                <div>
                  <h4 className='font-medium mb-2'>Prerequisites:</h4>
                  <div className='flex flex-wrap gap-2'>
                    {project.prerequisites.map((prereq) => (
                      <span
                        key={prereq}
                        className='px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs'
                      >
                        {prereq}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'skill-gaps' && (
        <div className='space-y-6'>
          {/* Skill Gap Analysis */}
          <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
            <h3 className='text-lg font-semibold mb-4'>Skill Gap Analysis</h3>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={getSkillGapData()}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='skill' />
                <YAxis />
                <Tooltip />
                <Bar dataKey='current' fill='#3B82F6' name='Current Level' />
                <Bar dataKey='required' fill='#EF4444' name='Required Level' />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Skill Gap Details */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {skillGaps.map((gap, index) => (
              <motion.div
                key={gap.skill}
                className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className='flex items-center justify-between mb-3'>
                  <h4 className='font-semibold'>{gap.skill}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityColor(gap.priority)}`}>
                    {gap.priority}
                  </span>
                </div>

                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Current Level:</span>
                    <span className='font-medium'>{gap.currentLevel}/10</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Required Level:</span>
                    <span className='font-medium'>{gap.requiredLevel}/10</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Gap:</span>
                    <span className='font-medium text-red-500'>-{gap.gap} levels</span>
                  </div>
                </div>

                <div className='mt-3'>
                  <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                    <div
                      className='bg-blue-500 h-2 rounded-full'
                      style={{ width: `${(gap.currentLevel / 10) * 100}%` }}
                    ></div>
                  </div>
                  <div className='flex justify-between text-xs text-[var(--text-secondary)] mt-1'>
                    <span>Current</span>
                    <span>Target</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'roadmap' && (
        <div className='space-y-6'>
          {/* Learning Roadmap */}
          <div className='bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 border border-blue-500/20 rounded-lg p-6'>
            <h3 className='text-lg font-semibold mb-4'>6-Month Learning Roadmap</h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h4 className='font-medium text-blue-500 mb-3'>Month 1-2: Foundation</h4>
                <ul className='text-sm text-[var(--text-secondary)] space-y-2'>
                  <li className='flex items-start gap-2'>
                    <span className='text-blue-500 mt-1'>•</span>
                    <span>Master advanced React patterns and hooks</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-blue-500 mt-1'>•</span>
                    <span>Learn TypeScript advanced features</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-blue-500 mt-1'>•</span>
                    <span>Study system design principles</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className='font-medium text-purple-500 mb-3'>Month 3-4: Specialization</h4>
                <ul className='text-sm text-[var(--text-secondary)] space-y-2'>
                  <li className='flex items-start gap-2'>
                    <span className='text-purple-500 mt-1'>•</span>
                    <span>Deep dive into machine learning fundamentals</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-purple-500 mt-1'>•</span>
                    <span>Learn cloud architecture (AWS/Azure)</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-purple-500 mt-1'>•</span>
                    <span>Master DevOps and CI/CD pipelines</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className='font-medium text-green-500 mb-3'>Month 5-6: Integration</h4>
                <ul className='text-sm text-[var(--text-secondary)] space-y-2'>
                  <li className='flex items-start gap-2'>
                    <span className='text-green-500 mt-1'>•</span>
                    <span>Build full-stack AI-powered applications</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-green-500 mt-1'>•</span>
                    <span>Contribute to open source projects</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-green-500 mt-1'>•</span>
                    <span>Launch your own SaaS product</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className='font-medium text-orange-500 mb-3'>Continuous Learning</h4>
                <ul className='text-sm text-[var(--text-secondary)] space-y-2'>
                  <li className='flex items-start gap-2'>
                    <span className='text-orange-500 mt-1'>•</span>
                    <span>Stay updated with latest technologies</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-orange-500 mt-1'>•</span>
                    <span>Network with industry professionals</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-orange-500 mt-1'>•</span>
                    <span>Mentor junior developers</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Progress Tracking */}
          <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
            <h3 className='text-lg font-semibold mb-4'>Roadmap Progress</h3>
            <div className='space-y-4'>
              {[
                { phase: 'Foundation', progress: 75, skills: ['React', 'TypeScript', 'System Design'] },
                { phase: 'Specialization', progress: 45, skills: ['ML', 'Cloud', 'DevOps'] },
                { phase: 'Integration', progress: 20, skills: ['Full-Stack', 'AI', 'Product'] },
                { phase: 'Mastery', progress: 10, skills: ['Leadership', 'Innovation', 'Scale'] }
              ].map((phase, index) => (
                <div key={phase.phase} className='flex items-center gap-4'>
                  <div className='w-32 text-sm font-medium'>{phase.phase}</div>
                  <div className='flex-1'>
                    <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                      <div
                        className='bg-[var(--primary)] h-2 rounded-full transition-all duration-1000'
                        style={{ width: `${phase.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className='w-16 text-sm text-[var(--text-secondary)]'>{phase.progress}%</div>
                  <div className='flex gap-1'>
                    {phase.skills.map((skill) => (
                      <span key={skill} className='px-2 py-1 bg-[var(--primary)] bg-opacity-20 text-[var(--primary)] rounded-full text-xs'>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className='space-y-6'>
          {/* Technology Trends */}
          <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
            <h3 className='text-lg font-semibold mb-4'>Technology Category Distribution</h3>
            <ResponsiveContainer width='100%' height={250}>
              <PieChart>
                <Pie
                  data={getCategoryDistribution()}
                  cx='50%'
                  cy='50%'
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey='value'
                >
                  {getCategoryDistribution().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Market Insights */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
              <h4 className='font-semibold text-green-500 mb-3'>🚀 High-Growth Areas</h4>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-sm'>AI/ML Development</span>
                  <span className='text-sm font-bold text-green-500'>+45%</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Cloud Computing</span>
                  <span className='text-sm font-bold text-green-500'>+38%</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Blockchain</span>
                  <span className='text-sm font-bold text-green-500'>+52%</span>
                </div>
              </div>
            </div>

            <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
              <h4 className='font-semibold text-blue-500 mb-3'>💼 Industry Demand</h4>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-sm'>Full-Stack Developers</span>
                  <span className='text-sm font-bold text-blue-500'>High</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>AI Specialists</span>
                  <span className='text-sm font-bold text-blue-500'>Very High</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>DevOps Engineers</span>
                  <span className='text-sm font-bold text-blue-500'>High</span>
                </div>
              </div>
            </div>
          </div>

          {/* Future Predictions */}
          <div className='bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-6'>
            <h3 className='text-lg font-semibold mb-4'>Future Technology Predictions</h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='text-center'>
                <div className='text-3xl mb-2'>🤖</div>
                <h4 className='font-medium mb-1'>AI-First Development</h4>
                <p className='text-sm text-[var(--text-secondary)]'>
                  AI tools will become integral to development workflows
                </p>
              </div>

              <div className='text-center'>
                <div className='text-3xl mb-2'>☁️</div>
                <h4 className='font-medium mb-1'>Serverless Revolution</h4>
                <p className='text-sm text-[var(--text-secondary)]'>
                  Serverless computing will dominate cloud deployments
                </p>
              </div>

              <div className='text-center'>
                <div className='text-3xl mb-2'>🔗</div>
                <h4 className='font-medium mb-1'>Web3 Integration</h4>
                <p className='text-sm text-[var(--text-secondary)]'>
                  Blockchain and Web3 will transform user experiences
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}