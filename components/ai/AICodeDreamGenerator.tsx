'use client';

import { useState, useEffect } from 'react';
import { Repository } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { generateDreamProjects } from '@/lib/aiService';

interface DreamProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  complexity: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  estimatedTime: string;
  whyItFits: string;
  codeSnippet: string;
  innovation: string;
}

interface CodingStyle {
  languages: string[];
  topics: string[];
  patterns: string[];
}

interface AICodeDreamGeneratorProps {
  username: string;
  repos: Repository[];
}

export default function AICodeDreamGenerator({ username, repos }: AICodeDreamGeneratorProps) {
  const [dreamProjects, setDreamProjects] = useState<DreamProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<DreamProject | null>(null);
  const [generating, setGenerating] = useState(false);

  // Analyze user's coding patterns
  const analyzeCodingStyle = () => {
    const languages = new Set<string>();
    const topics = new Set<string>();
    const patterns: string[] = [];

    repos.forEach(repo => {
      if (repo.language) languages.add(repo.language);
      if (repo.topics) repo.topics.forEach(topic => topics.add(topic));
    });

    // Determine coding style patterns
    if (languages.has('JavaScript') && languages.has('TypeScript')) {
      patterns.push('fullstack-developer');
    }
    if (languages.has('Python') && topics.has('machine-learning')) {
      patterns.push('ai-ml-engineer');
    }
    if (languages.has('React') && topics.has('frontend')) {
      patterns.push('frontend-specialist');
    }
    if (repos.some(r => r.forks_count > r.stargazers_count * 2)) {
      patterns.push('open-source-contributor');
    }
    if (repos.length > 20) {
      patterns.push('prolific-coder');
    }

    return {
      languages: Array.from(languages),
      topics: Array.from(topics),
      patterns
    };
  };

  const handleGenerateDreamProjects = async () => {
    if (generating) return;

    setGenerating(true);
    setLoading(true);

    try {
      const codingStyle = analyzeCodingStyle();

      // Use AI to generate personalized dream projects
      const aiResponse = await generateDreamProjects(codingStyle, repos.slice(0, 5));

      if (aiResponse.success) {
        console.log('AI Dream Generator response received, length:', aiResponse.content.length);

        // Validate that the response looks like JSON
        const content = aiResponse.content.trim();
        if (!content.startsWith('[') && !content.startsWith('{')) {
          console.warn('AI dream response does not appear to be JSON, using fallback. Response starts with:', content.substring(0, 100));
          const dreams = await generateFallbackProjects(codingStyle);
          setDreamProjects(dreams);
        } else {
          try {
            const dreams = JSON.parse(content);
            console.log('Successfully parsed AI dream projects:', dreams.length);

            if (Array.isArray(dreams) && dreams.length > 0) {
              // Validate the structure of the first dream
              const firstDream = dreams[0];
              if (firstDream.title && firstDream.description) {
                setDreamProjects(dreams.map(dream => ({
                  id: dream.title.toLowerCase().replace(/\s+/g, '-'),
                  title: dream.title,
                  description: dream.description,
                  technologies: dream.technologies || [],
                  complexity: dream.complexity || 'Intermediate',
                  estimatedTime: dream.estimatedTime || '2-3 months',
                  whyItFits: dream.whyItFits || 'Perfect match for your skills',
                  codeSnippet: dream.codeSnippet || '// Sample code',
                  innovation: dream.innovation || 'Innovative approach'
                })));
              } else {
                console.warn('AI dream response structure is invalid, using fallback');
                const dreams = await generateFallbackProjects(codingStyle);
                setDreamProjects(dreams);
              }
            } else {
              console.warn('AI dream response is not a valid array or is empty, using fallback');
              const dreams = await generateFallbackProjects(codingStyle);
              setDreamProjects(dreams);
            }
          } catch (parseError) {
            console.warn('AI dream response parsing failed, using fallback. Error:', parseError);
            console.warn('Raw AI dream response:', content.substring(0, 500));
            const dreams = await generateFallbackProjects(codingStyle);
            setDreamProjects(dreams);
          }
        }
      } else {
        console.warn('AI dream response was not successful:', aiResponse.error);
        // Fallback to pattern-based generation if AI fails
        const dreams = await generateFallbackProjects(codingStyle);
        setDreamProjects(dreams);
      }
    } catch (error) {
      // Final fallback to pattern-based generation
      try {
        const codingStyle = analyzeCodingStyle();
        const dreams = await generateFallbackProjects(codingStyle);
        setDreamProjects(dreams);
      } catch (fallbackError) {
        setDreamProjects([]);
      }
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  const generateFallbackProjects = async (style: CodingStyle): Promise<DreamProject[]> => {
    const dreams: DreamProject[] = [];

    // Get user's primary language and technologies from real data
    const primaryLanguage = style.languages[0] || 'JavaScript';
    const userTopics = style.topics.slice(0, 5);
    const userLanguages = style.languages;

    // Generate projects based on user's real coding patterns and technologies
    if (style.patterns.includes('fullstack-developer')) {
      dreams.push({
        id: `${username}-fullstack-ai-app`,
        title: `${username}'s AI-Powered ${primaryLanguage} Application`,
        description: `A full-stack application built with your preferred technologies (${userLanguages.join(', ')}) that leverages AI to enhance user experience and automate common tasks.`,
        technologies: [...userLanguages, 'Node.js', 'AI/ML', 'Database'],
        complexity: userLanguages.length > 2 ? 'Advanced' : 'Intermediate',
        estimatedTime: '3-4 months',
        whyItFits: `Built specifically for your ${primaryLanguage} and ${userLanguages.slice(1).join(', ')} stack with ${userTopics.length} specialized topics.`,
        codeSnippet: `// AI-enhanced ${primaryLanguage} application
const AIApp = {
  async processUserData(data) {
    // Use your ${userTopics.join(', ')} expertise
    const analysis = await analyzeWithAI(data, {
      technologies: ${JSON.stringify(userLanguages)},
      topics: ${JSON.stringify(userTopics)}
    });
    return analysis;
  }
};`,
        innovation: `AI integration with your ${primaryLanguage} expertise and ${userTopics.join(', ')} specializations`
      });
    }

    if (style.patterns.includes('ai-ml-engineer')) {
      dreams.push({
        id: `${username}-ml-automation`,
        title: `${username}'s ML Automation Platform`,
        description: `An automation platform that uses your Python and machine learning expertise to create intelligent workflows for data processing and decision making.`,
        technologies: ['Python', 'TensorFlow/PyTorch', 'FastAPI', 'Docker', 'PostgreSQL'],
        complexity: 'Expert',
        estimatedTime: '5-6 months',
        whyItFits: `Leverages your Python expertise and ${userTopics.filter(t => t.includes('ml') || t.includes('ai')).join(', ')} background.`,
        codeSnippet: `from sklearn.ensemble import RandomForestClassifier
from fastapi import FastAPI

class MLAutomationPlatform:
    def __init__(self):
        self.models = {}
        self.app = FastAPI()

    def train_model(self, data, target):
        # Your ML expertise in action
        model = RandomForestClassifier(n_estimators=100)
        model.fit(data, target)
        return model

    def predict(self, model_name, input_data):
        model = self.models[model_name]
        return model.predict_proba(input_data)`,
        innovation: 'Automated ML pipelines with your specialized algorithms'
      });
    }

    if (style.patterns.includes('frontend-specialist')) {
      dreams.push({
        id: `${username}-interactive-dashboard`,
        title: `${username}'s Interactive Data Dashboard`,
        description: `A sophisticated dashboard built with your frontend expertise (${userLanguages.join(', ')}) that visualizes complex data with interactive charts and real-time updates.`,
        technologies: [...userLanguages, 'D3.js', 'WebSocket', 'Node.js'],
        complexity: 'Advanced',
        estimatedTime: '2-3 months',
        whyItFits: `Showcases your ${primaryLanguage} frontend skills with ${userTopics.join(', ')} visualizations.`,
        codeSnippet: `// Interactive dashboard with your tech stack
class InteractiveDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      technologies: ${JSON.stringify(userLanguages)}
    };
  }

  async fetchData() {
    // Real-time data visualization
    const response = await fetch('/api/data');
    const data = await response.json();
    this.setState({ data });
  }

  render() {
    return (
      <div className="dashboard">
        {/* Your ${userTopics.join(', ')} visualization expertise */}
      </div>
    );
  }
}`,
        innovation: `Real-time data visualization with your ${primaryLanguage} and ${userTopics.join(', ')} expertise`
      });
    }

    if (style.patterns.includes('open-source-contributor')) {
      dreams.push({
        id: `${username}-oss-toolkit`,
        title: `${username}'s Open Source Developer Toolkit`,
        description: `A comprehensive toolkit for open source contributors featuring your ${primaryLanguage} utilities, automation scripts, and contribution tracking tools.`,
        technologies: [...userLanguages, 'Git', 'GitHub API', 'CLI'],
        complexity: 'Intermediate',
        estimatedTime: '3 months',
        whyItFits: `Built for your open source contribution style with ${userTopics.length} specialized areas.`,
        codeSnippet: `#!/usr/bin/env ${primaryLanguage.toLowerCase()}
// Open source contribution toolkit
const OSSToolkit = {
  async analyzeContributions(username) {
    const repos = await fetchGitHubRepos(username);
    return repos.map(repo => ({
      name: repo.name,
      contributions: repo.contributions,
      technologies: ${JSON.stringify(userLanguages)},
      topics: ${JSON.stringify(userTopics)}
    }));
  },

  generateContributionReport(repos) {
    // Your analysis expertise
    return repos.reduce((report, repo) => {
      report.totalContributions += repo.contributions;
      return report;
    }, { totalContributions: 0 });
  }
};`,
        innovation: `Automated open source contribution analysis with your ${primaryLanguage} tooling`
      });
    }

    // Generate personalized projects based on user's actual technologies and topics
    if (userLanguages.includes('TypeScript') || userLanguages.includes('JavaScript')) {
      dreams.push({
        id: `${username}-web-framework`,
        title: `${username}'s Custom Web Framework`,
        description: `A lightweight web framework built with your ${primaryLanguage} expertise, optimized for ${userTopics.slice(0, 3).join(', ')} applications.`,
        technologies: [...userLanguages, 'NPM', 'Webpack', 'Testing'],
        complexity: userLanguages.length > 3 ? 'Advanced' : 'Intermediate',
        estimatedTime: '4 months',
        whyItFits: `Custom framework tailored to your ${userLanguages.join(', ')} stack and ${userTopics.join(', ')} interests.`,
        codeSnippet: `// Custom ${primaryLanguage} web framework
class ${username}Framework {
  constructor(config) {
    this.config = config;
    this.routes = new Map();
    this.middlewares = [];
  }

  route(path, handler) {
    this.routes.set(path, handler);
  }

  use(middleware) {
    this.middlewares.push(middleware);
  }

  async handle(request) {
    // Your framework logic with ${userTopics.join(', ')} optimizations
    for (const middleware of this.middlewares) {
      await middleware(request);
    }

    const handler = this.routes.get(request.path);
    if (handler) {
      return await handler(request);
    }
  }
}`,
        innovation: `Custom framework with ${userTopics.join(', ')} optimizations for your development style`
      });
    }

    if (userTopics.some(topic => topic.includes('api') || topic.includes('backend'))) {
      dreams.push({
        id: `${username}-api-platform`,
        title: `${username}'s API Development Platform`,
        description: `A robust API platform built with your backend expertise, featuring automatic documentation, testing, and deployment capabilities.`,
        technologies: [...userLanguages, 'REST', 'GraphQL', 'Docker', 'Testing'],
        complexity: 'Advanced',
        estimatedTime: '4-5 months',
        whyItFits: `API platform designed around your ${primaryLanguage} backend patterns and ${userTopics.filter(t => t.includes('api')).join(', ')} experience.`,
        codeSnippet: `// API platform with your expertise
const APIPlatform = {
  endpoints: new Map(),

  registerEndpoint(path, config) {
    this.endpoints.set(path, {
      ...config,
      technologies: ${JSON.stringify(userLanguages)},
      topics: ${JSON.stringify(userTopics)}
    });
  },

  async handleRequest(path, request) {
    const endpoint = this.endpoints.get(path);
    if (!endpoint) {
      throw new Error('Endpoint not found');
    }

    // Your API handling logic
    return await endpoint.handler(request);
  },

  generateDocs() {
    // Auto-generate documentation
    return Array.from(this.endpoints.entries()).map(([path, config]) => ({
      path,
      methods: config.methods,
      description: config.description
    }));
  }
};`,
        innovation: `Intelligent API platform with your ${userTopics.join(', ')} domain expertise`
      });
    }

    // Ensure we always have at least 3 projects
    while (dreams.length < 3) {
      dreams.push({
        id: `${username}-personal-project-${dreams.length}`,
        title: `${username}'s ${primaryLanguage} Innovation Project`,
        description: `An innovative project leveraging your ${primaryLanguage} skills and ${userTopics.slice(0, 3).join(', ')} expertise to solve real-world problems.`,
        technologies: [...userLanguages, 'Modern Tools'],
        complexity: 'Intermediate',
        estimatedTime: '2-3 months',
        whyItFits: `Personalized project based on your ${userLanguages.join(', ')} proficiency and ${userTopics.join(', ')} interests.`,
        codeSnippet: `// Your personalized ${primaryLanguage} project
const ${username}Project = {
  technologies: ${JSON.stringify(userLanguages)},
  topics: ${JSON.stringify(userTopics)},

  async initialize() {
    console.log('Initializing with your tech stack...');
    // Project initialization with your preferences
  },

  async execute() {
    // Main project logic using your expertise
    return {
      success: true,
      technologies: this.technologies,
      topics: this.topics
    };
  }
};`,
        innovation: `Personalized innovation using your ${primaryLanguage} and ${userTopics.join(', ')} expertise`
      });
    }

    return dreams;
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Beginner': return 'text-green-500 bg-green-500/20';
      case 'Intermediate': return 'text-blue-500 bg-blue-500/20';
      case 'Advanced': return 'text-purple-500 bg-purple-500/20';
      case 'Expert': return 'text-red-500 bg-red-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
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
          <h2 className='text-2xl font-bold'>AI Code Dream Generator</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Discover innovative projects based on your coding style and interests
          </p>
        </div>

        <button
          onClick={handleGenerateDreamProjects}
          disabled={generating}
          className='px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all disabled:opacity-50 font-medium flex items-center gap-2'
        >
          {generating ? (
            <>
              <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
              Dreaming...
            </>
          ) : (
            <>
              <span>🧠</span>
              Generate Dreams
            </>
          )}
        </button>
      </div>

      {dreamProjects.length === 0 && !loading && (
        <div className='text-center py-12'>
          <div className='w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-4xl'>💭</span>
          </div>
          <h3 className='text-lg font-bold mb-2'>Ready to Dream?</h3>
          <p className='text-[var(--text-secondary)] mb-6'>
            Click "Generate Dreams" to discover innovative project ideas tailored to your coding style
          </p>
        </div>
      )}

      {loading && (
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
            <p className='text-[var(--text-secondary)]'>Analyzing your coding patterns...</p>
          </div>
        </div>
      )}

      <div className='grid gap-6'>
        <AnimatePresence>
          {dreamProjects.map((project, index) => (
            <motion.div
              key={project.id}
              className='card cursor-pointer group'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              onClick={() => setSelectedProject(project)}
              whileHover={{ scale: 1.02 }}
            >
              <div className='flex items-start justify-between mb-4'>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-2'>
                    <h3 className='text-xl font-bold group-hover:text-[var(--primary)] transition-colors'>
                      {project.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getComplexityColor(project.complexity)}`}>
                      {project.complexity}
                    </span>
                  </div>
                  <p className='text-[var(--text-secondary)] mb-3'>
                    {project.description}
                  </p>
                  <div className='flex flex-wrap gap-2 mb-3'>
                    {project.technologies.map(tech => (
                      <span
                        key={tech}
                        className='px-2 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] text-xs rounded-full'
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className='text-sm text-[var(--text-secondary)]'>
                    <span className='font-medium'>Estimated time:</span> {project.estimatedTime}
                  </div>
                </div>
                <div className='text-2xl ml-4'>✨</div>
              </div>

              <div className='text-sm text-[var(--text-secondary)] italic'>
                💡 {project.innovation}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Dream Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
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
                  <div className='flex items-center gap-3'>
                    <span className='text-3xl'>💭</span>
                    <div>
                      <h2 className='text-2xl font-bold'>{selectedProject.title}</h2>
                      <p className='text-[var(--text-secondary)]'>{selectedProject.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className='text-[var(--text-secondary)] hover:text-white p-2'
                  >
                    ✕
                  </button>
                </div>

                <div className='flex flex-wrap gap-4 mb-4'>
                  <span className={`px-3 py-1 text-sm rounded-full font-medium ${getComplexityColor(selectedProject.complexity)}`}>
                    {selectedProject.complexity}
                  </span>
                  <span className='px-3 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] text-sm rounded-full'>
                    {selectedProject.estimatedTime}
                  </span>
                </div>

                <div className='flex flex-wrap gap-2'>
                  {selectedProject.technologies.map(tech => (
                    <span
                      key={tech}
                      className='px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-sm rounded-full'
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className='p-6 overflow-y-auto max-h-96'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <h3 className='text-lg font-semibold mb-3'>Why This Fits You</h3>
                    <p className='text-[var(--text-secondary)] mb-4'>
                      {selectedProject.whyItFits}
                    </p>

                    <h3 className='text-lg font-semibold mb-3'>Innovation</h3>
                    <p className='text-[var(--text-secondary)]'>
                      {selectedProject.innovation}
                    </p>
                  </div>

                  <div>
                    <h3 className='text-lg font-semibold mb-3'>Sample Code</h3>
                    <div className='bg-gray-900 rounded-lg p-4 overflow-x-auto'>
                      <pre className='text-green-400 text-sm font-mono'>
                        <code>{selectedProject.codeSnippet}</code>
                      </pre>
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