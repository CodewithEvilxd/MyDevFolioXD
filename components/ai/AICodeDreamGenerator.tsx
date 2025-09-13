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
        try {
          const dreams = JSON.parse(aiResponse.content);
          if (Array.isArray(dreams)) {
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
            // Fallback to pattern-based generation if AI returns invalid format
            const dreams = await generateFallbackProjects(codingStyle);
            setDreamProjects(dreams);
          }
        } catch (parseError) {
          // Fallback to pattern-based generation if JSON parsing fails
          const dreams = await generateFallbackProjects(codingStyle);
          setDreamProjects(dreams);
        }
      } else {
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

    // Generate projects based on patterns
    if (style.patterns.includes('fullstack-developer')) {
      dreams.push({
        id: 'neural-canvas',
        title: 'Neural Canvas',
        description: 'An AI-powered drawing application that learns your artistic style and generates collaborative artwork with other users in real-time.',
        technologies: ['React', 'Node.js', 'TensorFlow.js', 'WebRTC', 'MongoDB'],
        complexity: 'Advanced',
        estimatedTime: '3-4 months',
        whyItFits: 'Combines your fullstack skills with AI/ML interest, creating a unique collaborative platform.',
        codeSnippet: `// Neural style transfer in real-time
const applyStyleTransfer = async (canvas, styleImage) => {
  const model = await tf.loadGraphModel('/models/style-transfer/model.json');
  const tensor = tf.browser.fromPixels(canvas);
  const styleTensor = tf.browser.fromPixels(styleImage);

  const result = model.predict([tensor, styleTensor]);
  return await tf.browser.toPixels(result);
};`,
        innovation: 'Real-time collaborative AI art generation with WebRTC'
      });
    }

    if (style.patterns.includes('ai-ml-engineer')) {
      dreams.push({
        id: 'quantum-debugger',
        title: 'Quantum Code Debugger',
        description: 'A debugging tool that uses quantum computing principles to explore multiple code execution paths simultaneously.',
        technologies: ['Python', 'Qiskit', 'FastAPI', 'React', 'D3.js'],
        complexity: 'Expert',
        estimatedTime: '6 months',
        whyItFits: 'Leverages your ML expertise with cutting-edge quantum computing concepts.',
        codeSnippet: `from qiskit import QuantumCircuit, Aer, execute

def quantum_debug(code_snippet):
    """Debug code by exploring multiple execution paths"""
    qc = QuantumCircuit(4, 4)

    # Create superposition of possible code paths
    qc.h([0, 1, 2, 3])

    # Apply quantum gates based on code logic
    qc.cx(0, 3)  # Conditional execution
    qc.measure_all()

    # Execute on quantum simulator
    backend = Aer.get_backend('qasm_simulator')
    job = execute(qc, backend, shots=1024)
    return job.result().get_counts()`,
        innovation: 'Quantum algorithms for debugging classical code'
      });
    }

    if (style.patterns.includes('frontend-specialist')) {
      dreams.push({
        id: 'holographic-ui',
        title: 'Holographic UI Framework',
        description: 'A CSS framework that creates 3D holographic effects for web interfaces, with physics-based interactions.',
        technologies: ['CSS', 'JavaScript', 'WebGL', 'Three.js', 'React'],
        complexity: 'Advanced',
        estimatedTime: '2-3 months',
        whyItFits: 'Extends your frontend expertise into cutting-edge 3D web experiences.',
        codeSnippet: `// Holographic button with physics
.holographic-button {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border: none;
  border-radius: 10px;
  padding: 15px 30px;
  position: relative;
  overflow: hidden;
}

.holographic-button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(from 0deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: rotate 3s linear infinite;
}`,
        innovation: 'Physics-based holographic UI components'
      });
    }

    if (style.patterns.includes('open-source-contributor')) {
      dreams.push({
        id: 'code-time-machine',
        title: 'Code Time Machine',
        description: 'A tool that lets developers time-travel through their codebase history, seeing how code evolved and predicting future changes.',
        technologies: ['TypeScript', 'Git', 'D3.js', 'Node.js', 'React'],
        complexity: 'Advanced',
        estimatedTime: '4 months',
        whyItFits: 'Perfect for your open source contributions, helping others understand code evolution.',
        codeSnippet: `// Time-travel through git history
class TimeMachine {
  constructor(repoPath) {
    this.repo = git(repoPath);
  }

  async travelTo(date) {
    const commits = await this.repo.log({
      since: date,
      until: new Date()
    });

    return commits.all.map(commit => ({
      hash: commit.hash,
      date: commit.date,
      message: commit.message,
      diff: await this.getDiff(commit.hash)
    }));
  }

  predictFutureChanges(currentCode) {
    // ML model to predict code changes
    return this.mlModel.predict(currentCode);
  }
}`,
        innovation: 'Temporal navigation through code history with ML predictions'
      });
    }

    // Add some universal dream projects
    dreams.push({
      id: 'conscious-code',
      title: 'Conscious Code Editor',
      description: 'An AI editor that becomes conscious of your coding patterns and suggests improvements before you make mistakes.',
      technologies: ['TypeScript', 'TensorFlow.js', 'Monaco Editor', 'Node.js'],
      complexity: 'Expert',
      estimatedTime: '5 months',
      whyItFits: 'Advanced AI integration with your existing development workflow.',
      codeSnippet: `// Conscious code analysis
class ConsciousEditor {
  constructor() {
    this.brain = new NeuralNetwork();
    this.memory = new CodeMemory();
  }

  async analyzeCode(code, user) {
    const patterns = await this.memory.recall(user);
    const prediction = this.brain.predict(code, patterns);

    if (prediction.error_probability > 0.7) {
      return {
        suggestion: 'Potential bug detected',
        confidence: prediction.error_probability,
        fix: this.generateFix(code, prediction)
      };
    }
  }
}`,
      innovation: 'AI that prevents bugs before they happen'
    });

    dreams.push({
      id: 'multiverse-deployer',
      title: 'Multiverse Deployer',
      description: 'Deploy your application to multiple cloud platforms simultaneously, with automatic optimization for each environment.',
      technologies: ['Go', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure'],
      complexity: 'Advanced',
      estimatedTime: '4 months',
      whyItFits: 'Scales your deployment skills across multiple cloud platforms.',
      codeSnippet: `// Multi-cloud deployment
type MultiverseDeployer struct {
  clouds []CloudProvider
  optimizer DeploymentOptimizer
}

func (md *MultiverseDeployer) Deploy(app *Application) error {
  deployments := make([]*Deployment, len(md.clouds))

  for i, cloud := range md.clouds {
    // Optimize for each cloud's strengths
    optimized := md.optimizer.Optimize(app, cloud.Capabilities())
    deployments[i] = cloud.Deploy(optimized)
  }

  // Return the best performing deployment
  return md.selectBestDeployment(deployments)
}`,
      innovation: 'Simultaneous multi-cloud deployment with AI optimization'
    });

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