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
      if (!repos || repos.length === 0) {
        setLoading(false);
        return;
      }

      // Analyze user's real GitHub data
      const userLanguages = new Set(repos.map(repo => repo.language).filter(Boolean));
      const userTopics = new Set(repos.flatMap(repo => repo.topics || []));
      const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
      const avgStarsPerRepo = totalStars / repos.length;

      // Determine experience level
      let experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';
      if (avgStarsPerRepo > 50 || totalForks > 20) experienceLevel = 'Intermediate';
      if (avgStarsPerRepo > 200 || totalForks > 100) experienceLevel = 'Advanced';

      // Generate personalized recommendations based on real data
      const recommendations: ProjectRecommendation[] = [];

      // AI/ML project if user has relevant background
      if (userLanguages.has('Python') || userTopics.has('machine-learning') || userTopics.has('ai')) {
        recommendations.push({
          id: `${username}-ai-ml-project`,
          title: `${username}'s AI-Powered Development Tool`,
          description: `Build an intelligent development tool using your Python and ML expertise (${Array.from(userLanguages).slice(0, 3).join(', ')}) to enhance developer productivity.`,
          difficulty: experienceLevel === 'Advanced' ? 'Advanced' : 'Intermediate',
          estimatedTime: experienceLevel === 'Advanced' ? '3-4 months' : '4-5 months',
          technologies: ['Python', 'TensorFlow/PyTorch', 'FastAPI', 'React', 'Docker'],
          category: 'AI/ML',
          potentialImpact: 90 + Math.min(totalStars / 10, 10),
          matchScore: userLanguages.has('Python') ? 85 : 70,
          whyRecommended: [
            `Leverages your ${Array.from(userLanguages).join(', ')} expertise`,
            `${totalStars} stars across your projects show strong technical foundation`,
            'High demand for AI tools in development workflows'
          ],
          learningOutcomes: [
            'Machine Learning model training and deployment',
            'API design and microservices architecture',
            'Advanced patterns in your tech stack'
          ],
          prerequisites: ['Python', 'Basic ML concepts', 'REST APIs']
        });
      }

      // Full-stack project if user has web technologies
      if (userLanguages.has('JavaScript') || userLanguages.has('TypeScript') || userTopics.has('react')) {
        recommendations.push({
          id: `${username}-fullstack-platform`,
          title: `${username}'s Real-time Collaboration Platform`,
          description: `Create a collaborative platform using your ${Array.from(userLanguages).join(', ')} skills with ${Array.from(userTopics).slice(0, 3).join(', ')} expertise.`,
          difficulty: experienceLevel,
          estimatedTime: experienceLevel === 'Advanced' ? '3-4 months' : '4-5 months',
          technologies: ['Next.js', 'Socket.io', 'WebRTC', 'MongoDB', 'Redis'],
          category: 'Full-Stack',
          potentialImpact: 85 + Math.min(totalForks / 5, 15),
          matchScore: userLanguages.has('JavaScript') ? 88 : 75,
          whyRecommended: [
            `Showcases your ${Array.from(userLanguages).join(', ')} full-stack capabilities`,
            `${repos.length} repositories demonstrate broad technical knowledge`,
            'Growing demand for remote collaboration tools'
          ],
          learningOutcomes: [
            'Real-time communication protocols',
            'Scalable architecture design',
            'Advanced state management'
          ],
          prerequisites: ['JavaScript/TypeScript', 'Node.js', 'Database design']
        });
      }

      // Data visualization project if user has data-related work
      if (userTopics.has('data') || userTopics.has('analytics') || userLanguages.has('Python')) {
        recommendations.push({
          id: `${username}-data-dashboard`,
          title: `${username}'s Advanced Analytics Dashboard`,
          description: `Build a comprehensive analytics dashboard leveraging your data expertise and ${Array.from(userLanguages).join(', ')} skills.`,
          difficulty: experienceLevel === 'Beginner' ? 'Intermediate' : experienceLevel,
          estimatedTime: '2-3 months',
          technologies: ['React', 'D3.js', 'GitHub API', 'Node.js', 'PostgreSQL'],
          category: 'Data Visualization',
          potentialImpact: 80 + Math.min(repos.length / 2, 20),
          matchScore: userTopics.has('data') ? 90 : 75,
          whyRecommended: [
            `Utilizes your ${Array.from(userTopics).filter(t => t.includes('data')).join(', ')} expertise`,
            `${repos.length} projects show consistent development experience`,
            'Essential tool for data-driven development'
          ],
          learningOutcomes: [
            'Advanced data visualization techniques',
            'API integration and data processing',
            'User experience design for dashboards'
          ],
          prerequisites: ['React', 'JavaScript', 'Basic data structures']
        });
      }

      // Blockchain project if user shows interest
      if (userTopics.has('blockchain') || userTopics.has('web3') || userTopics.has('cryptocurrency')) {
        recommendations.push({
          id: `${username}-blockchain-app`,
          title: `${username}'s Decentralized Application`,
          description: `Develop a blockchain-based application using your ${Array.from(userLanguages).join(', ')} skills and blockchain interest.`,
          difficulty: 'Advanced',
          estimatedTime: '4-6 months',
          technologies: ['Solidity', 'Web3.js', 'React', 'Ethereum', 'IPFS'],
          category: 'Blockchain',
          potentialImpact: 85 + Math.min(totalStars / 20, 15),
          matchScore: userTopics.has('blockchain') ? 85 : 65,
          whyRecommended: [
            'Aligns with your blockchain interests',
            `Builds on your ${Array.from(userLanguages).join(', ')} foundation`,
            'High-growth technology area'
          ],
          learningOutcomes: [
            'Blockchain fundamentals and smart contracts',
            'Cryptographic principles',
            'Decentralized application development'
          ],
          prerequisites: ['JavaScript', 'Basic cryptography', 'Web development']
        });
      }

      // IoT project if user has hardware/backend interest
      if (userTopics.has('api') || userTopics.has('backend') || userLanguages.has('Python')) {
        recommendations.push({
          id: `${username}-iot-platform`,
          title: `${username}'s IoT Management Platform`,
          description: `Create an IoT platform using your ${Array.from(userLanguages).join(', ')} and backend expertise.`,
          difficulty: experienceLevel === 'Beginner' ? 'Intermediate' : experienceLevel,
          estimatedTime: '3-4 months',
          technologies: ['Python', 'MQTT', 'React', 'Docker', 'InfluxDB'],
          category: 'IoT',
          potentialImpact: 75 + Math.min(totalForks / 10, 25),
          matchScore: userLanguages.has('Python') ? 80 : 70,
          whyRecommended: [
            `Leverages your ${Array.from(userLanguages).join(', ')} backend skills`,
            `${totalForks} forks show community engagement`,
            'Growing IoT market with practical applications'
          ],
          learningOutcomes: [
            'IoT protocols and device communication',
            'Time-series data management',
            'Scalable backend architecture'
          ],
          prerequisites: ['Python', 'Basic electronics', 'Database design']
        });
      }

      // Mobile development project
      if (userTopics.has('mobile') || userTopics.has('react-native') || userTopics.has('flutter')) {
        recommendations.push({
          id: `${username}-mobile-app`,
          title: `${username}'s Cross-Platform Mobile App`,
          description: `Build a mobile application using your ${Array.from(userLanguages).join(', ')} skills and mobile development experience.`,
          difficulty: experienceLevel,
          estimatedTime: '3-4 months',
          technologies: ['React Native', 'TypeScript', 'Firebase', 'Redux', 'Node.js'],
          category: 'Mobile',
          potentialImpact: 80 + Math.min(repos.length / 3, 20),
          matchScore: userTopics.has('mobile') ? 85 : 70,
          whyRecommended: [
            'Mobile development is in high demand',
            `Uses your ${Array.from(userLanguages).join(', ')} expertise`,
            `${repos.length} projects demonstrate development consistency`
          ],
          learningOutcomes: [
            'Cross-platform mobile development',
            'Mobile UI/UX design',
            'App store deployment and management'
          ],
          prerequisites: ['JavaScript/TypeScript', 'React', 'Basic mobile concepts']
        });
      }

      // DevOps/CI-CD project
      if (repos.some(repo => repo.topics?.includes('docker') || repo.topics?.includes('kubernetes'))) {
        recommendations.push({
          id: `${username}-devops-platform`,
          title: `${username}'s DevOps Automation Platform`,
          description: `Create a DevOps automation platform using your infrastructure and deployment expertise.`,
          difficulty: 'Advanced',
          estimatedTime: '4-5 months',
          technologies: ['Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'AWS/GCP'],
          category: 'DevOps',
          potentialImpact: 88 + Math.min(totalStars / 15, 12),
          matchScore: 80,
          whyRecommended: [
            'DevOps skills are critical for modern development',
            `Builds on your ${Array.from(userTopics).filter(t => t.includes('docker') || t.includes('kubernetes')).join(', ')} experience`,
            'High demand for DevOps engineers'
          ],
          learningOutcomes: [
            'Infrastructure as Code',
            'CI/CD pipeline design',
            'Cloud platform management'
          ],
          prerequisites: ['Docker', 'Basic cloud concepts', 'Scripting']
        });
      }

      // Ensure we have at least 3 recommendations
      while (recommendations.length < 3) {
        const fallbackId = `${username}-general-project-${recommendations.length}`;
        recommendations.push({
          id: fallbackId,
          title: `${username}'s Personal Development Project`,
          description: `A personalized project leveraging your ${Array.from(userLanguages).slice(0, 3).join(', ')} skills and ${Array.from(userTopics).slice(0, 3).join(', ')} interests.`,
          difficulty: experienceLevel,
          estimatedTime: '2-3 months',
          technologies: Array.from(userLanguages).slice(0, 4),
          category: 'Personal',
          potentialImpact: 70 + Math.min(repos.length / 2, 30),
          matchScore: 75,
          whyRecommended: [
            `Tailored to your ${Array.from(userLanguages).join(', ')} expertise`,
            `${repos.length} repositories show consistent development`,
            'Opportunity to explore new technologies'
          ],
          learningOutcomes: [
            'Project architecture and design',
            'Code organization and best practices',
            'Deployment and maintenance'
          ],
          prerequisites: Array.from(userLanguages).slice(0, 2)
        });
      }

      // Generate real skill gaps based on user's profile
      const skillGaps: SkillGap[] = [];

      // Analyze which skills the user might be missing based on their current stack
      const hasWebSkills = userLanguages.has('JavaScript') || userLanguages.has('TypeScript');
      const hasBackendSkills = userLanguages.has('Python') || userLanguages.has('Java') || userLanguages.has('Go');
      const hasMobileSkills = userTopics.has('mobile') || userTopics.has('react-native');
      const hasCloudSkills = userTopics.has('aws') || userTopics.has('azure') || userTopics.has('gcp');
      const hasAISkills = userTopics.has('machine-learning') || userTopics.has('ai') || userTopics.has('tensorflow');

      if (!hasAISkills && experienceLevel !== 'Beginner') {
        skillGaps.push({
          skill: 'Machine Learning',
          currentLevel: hasWebSkills ? 2 : 1,
          requiredLevel: experienceLevel === 'Advanced' ? 8 : 6,
          gap: experienceLevel === 'Advanced' ? 6 : 5,
          priority: 'High'
        });
      }

      if (!hasCloudSkills) {
        skillGaps.push({
          skill: 'Cloud Architecture',
          currentLevel: hasBackendSkills ? 3 : 1,
          requiredLevel: 7,
          gap: hasBackendSkills ? 4 : 6,
          priority: 'High'
        });
      }

      if (!userTopics.has('docker') && !userTopics.has('kubernetes')) {
        skillGaps.push({
          skill: 'DevOps/CI-CD',
          currentLevel: hasBackendSkills ? 4 : 2,
          requiredLevel: 8,
          gap: hasBackendSkills ? 4 : 6,
          priority: 'Medium'
        });
      }

      if (!hasMobileSkills && hasWebSkills) {
        skillGaps.push({
          skill: 'Mobile Development',
          currentLevel: hasWebSkills ? 5 : 2,
          requiredLevel: 8,
          gap: hasWebSkills ? 3 : 6,
          priority: 'Medium'
        });
      }

      if (!userTopics.has('blockchain') && experienceLevel === 'Advanced') {
        skillGaps.push({
          skill: 'Blockchain',
          currentLevel: 1,
          requiredLevel: 6,
          gap: 5,
          priority: 'Low'
        });
      }

      if (!userTopics.has('ui') && !userTopics.has('ux') && hasWebSkills) {
        skillGaps.push({
          skill: 'UI/UX Design',
          currentLevel: hasWebSkills ? 3 : 1,
          requiredLevel: 7,
          gap: hasWebSkills ? 4 : 6,
          priority: 'Medium'
        });
      }

      // Ensure we have some skill gaps to show
      if (skillGaps.length === 0) {
        skillGaps.push(
          {
            skill: 'Advanced Testing',
            currentLevel: 4,
            requiredLevel: 8,
            gap: 4,
            priority: 'Medium'
          },
          {
            skill: 'Performance Optimization',
            currentLevel: 5,
            requiredLevel: 9,
            gap: 4,
            priority: 'Medium'
          }
        );
      }

      setRecommendations(recommendations);
      setSkillGaps(skillGaps);
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

  const getCategoryDistribution = () => {
    const categoryCount: { [key: string]: number } = {};

    recommendations.forEach(rec => {
      categoryCount[rec.category] = (categoryCount[rec.category] || 0) + 1;
    });

    const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];

    return Object.entries(categoryCount).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  };

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
