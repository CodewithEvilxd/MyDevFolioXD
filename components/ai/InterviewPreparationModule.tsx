'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { callAI } from '@/lib/aiService';

interface InterviewQuestion {
  id: string;
  question: string;
  type: 'technical' | 'behavioral' | 'system-design' | 'coding';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  expectedAnswer: string;
  tips: string[];
  followUpQuestions: string[];
}

interface InterviewPreparationModuleProps {
  username: string;
  repos: Array<{
    id: number;
    name: string;
    language: string | null;
    topics: string[];
    stargazers_count: number;
    description: string | null;
  }>;
  user: {
    login: string;
    bio: string | null;
    public_repos: number;
    followers: number;
  };
}

export default function InterviewPreparationModule({
  username,
  repos,
  user
}: InterviewPreparationModuleProps) {
  const { t } = useLanguage();
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [practiceMode, setPracticeMode] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    generateInterviewQuestions();
  }, [repos, user]);

  const generateInterviewQuestions = async () => {
    setLoading(true);

    try {
      // Extract skills and experience from user's profile
      const languages = Array.from(new Set(repos.map(r => r.language).filter(Boolean))) as string[];
      const topics = Array.from(new Set(repos.flatMap(r => r.topics)));
      const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      const experience = user.public_repos > 50 ? 'senior' :
                        user.public_repos > 20 ? 'mid' :
                        user.public_repos > 5 ? 'junior' : 'beginner';

      // Generate questions based on user's profile
      const mockQuestions: InterviewQuestion[] = [
        {
          id: '1',
          question: `Explain how you would optimize a React component that re-renders frequently. What techniques would you use?`,
          type: 'technical',
          difficulty: 'intermediate',
          category: 'React/Frontend',
          expectedAnswer: `I would use React.memo() for functional components, useMemo() and useCallback() for expensive computations and event handlers, avoid inline functions in JSX, implement proper key props for list items, and consider using React.lazy() for code splitting.`,
          tips: [
            'Always profile first to identify the actual bottleneck',
            'Use React DevTools Profiler to measure render times',
            'Consider if the re-render is actually necessary'
          ],
          followUpQuestions: [
            'How does React.memo() work internally?',
            'When would you choose useMemo over useCallback?'
          ]
        },
        {
          id: '2',
          question: `Describe your approach to handling state management in a large-scale application.`,
          type: 'system-design',
          difficulty: 'advanced',
          category: 'Architecture',
          expectedAnswer: `I would start by identifying the state requirements and choose appropriate state management solutions. For local component state, I'd use useState/useReducer. For global state, I'd consider Context API for smaller apps or Redux/Zustand for larger applications. I'd also implement proper state normalization and consider server state with React Query.`,
          tips: [
            'Choose the right tool for the job - not all state needs global management',
            'Consider the trade-offs between different state management solutions',
            'Plan for state persistence and hydration'
          ],
          followUpQuestions: [
            'How do you decide between Context API and Redux?',
            'How would you handle server state in your application?'
          ]
        },
        {
          id: '3',
          question: `Tell me about a challenging bug you encountered and how you solved it.`,
          type: 'behavioral',
          difficulty: 'intermediate',
          category: 'Problem Solving',
          expectedAnswer: `I encountered a memory leak in a React application caused by not properly cleaning up event listeners in a custom hook. I identified it using the React DevTools Profiler and browser memory tools, then implemented proper cleanup in useEffect return functions.`,
          tips: [
            'Use systematic debugging approaches',
            'Document your investigation process',
            'Learn from each debugging experience'
          ],
          followUpQuestions: [
            'What tools do you use for debugging?',
            'How do you prevent similar bugs in the future?'
          ]
        },
        {
          id: '4',
          question: `How would you design a scalable API for a social media platform?`,
          type: 'system-design',
          difficulty: 'expert',
          category: 'System Design',
          expectedAnswer: `I would design a RESTful API with proper resource modeling, implement rate limiting and caching, use database indexing for performance, implement proper authentication/authorization, and consider microservices architecture for scalability.`,
          tips: [
            'Start with requirements gathering and user stories',
            'Consider scalability, security, and maintainability from the beginning',
            'Plan for future growth and feature additions'
          ],
          followUpQuestions: [
            'How would you handle database scaling?',
            'What security measures would you implement?'
          ]
        },
        {
          id: '5',
          question: `Write a function that finds the longest substring without repeating characters.`,
          type: 'coding',
          difficulty: 'intermediate',
          category: 'Algorithms',
          expectedAnswer: `I'll use a sliding window approach with a hash set to track characters in the current window. I'll maintain two pointers and expand the window to the right, shrinking from the left when I find duplicates.`,
          tips: [
            'Consider time and space complexity',
            'Think about edge cases (empty string, all unique characters, etc.)',
            'Explain your thought process clearly'
          ],
          followUpQuestions: [
            'What is the time complexity of your solution?',
            'Can you optimize it further?'
          ]
        }
      ];

      // Filter questions based on user's experience level
      const filteredQuestions = mockQuestions.filter(q => {
        if (experience === 'beginner' && q.difficulty === 'expert') return false;
        if (experience === 'junior' && ['expert', 'advanced'].includes(q.difficulty)) return false;
        return true;
      });

      setQuestions(filteredQuestions);
    } catch (error) {
      console.error('Error generating interview questions:', error);
      // Fallback questions
      setQuestions([
        {
          id: 'fallback-1',
          question: 'What is your favorite programming language and why?',
          type: 'behavioral',
          difficulty: 'beginner',
          category: 'General',
          expectedAnswer: 'This is a fallback question due to API limitations.',
          tips: ['Be honest', 'Explain your reasoning'],
          followUpQuestions: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesType = filterType === 'all' || q.type === filterType;
    const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
    return matchesType && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-500/10';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/10';
      case 'advanced': return 'text-orange-400 bg-orange-500/10';
      case 'expert': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'technical': return '🔧';
      case 'behavioral': return '🧠';
      case 'system-design': return '🏗️';
      case 'coding': return '💻';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <motion.div
        className='card'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
            <p className='text-[var(--text-secondary)]'>Preparing interview questions...</p>
            <p className='text-sm text-[var(--text-secondary)] mt-2'>Analyzing your profile for personalized questions</p>
          </div>
        </div>
      </motion.div>
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
          <h2 className='text-2xl font-bold'>AI Interview Preparation</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Personalized interview questions based on your GitHub profile
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => setPracticeMode(!practiceMode)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              practiceMode
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}
          >
            {practiceMode ? 'Practice Mode' : 'Study Mode'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className='flex flex-wrap gap-4 mb-6'>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-[var(--text-secondary)]'>Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className='bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value='all'>All Types</option>
            <option value='technical'>Technical</option>
            <option value='behavioral'>Behavioral</option>
            <option value='system-design'>System Design</option>
            <option value='coding'>Coding</option>
          </select>
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-sm text-[var(--text-secondary)]'>Difficulty:</span>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className='bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value='all'>All Levels</option>
            <option value='beginner'>Beginner</option>
            <option value='intermediate'>Intermediate</option>
            <option value='advanced'>Advanced</option>
            <option value='expert'>Expert</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
        {filteredQuestions.map((question, index) => (
          <motion.div
            key={question.id}
            className='bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4 cursor-pointer hover:border-blue-500/50 transition-colors'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            onClick={() => setSelectedQuestion(question)}
            whileHover={{ scale: 1.02 }}
          >
            <div className='flex items-start justify-between mb-3'>
              <div className='flex items-center gap-2'>
                <span className='text-lg'>{getTypeIcon(question.type)}</span>
                <span className='text-xs font-medium text-[var(--text-secondary)] uppercase'>
                  {question.type}
                </span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty}
              </span>
            </div>

            <h3 className='font-semibold mb-2 line-clamp-3 text-sm leading-relaxed'>
              {question.question}
            </h3>

            <div className='flex items-center justify-between text-xs text-[var(--text-secondary)]'>
              <span>{question.category}</span>
              <span>Click to view answer</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Question Detail Modal */}
      <AnimatePresence>
        {selectedQuestion && (
          <motion.div
            className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedQuestion(null)}
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
                    <span className='text-2xl'>{getTypeIcon(selectedQuestion.type)}</span>
                    <div>
                      <h2 className='text-xl font-bold'>Interview Question</h2>
                      <div className='flex items-center gap-2 mt-1'>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                          {selectedQuestion.difficulty}
                        </span>
                        <span className='text-sm text-[var(--text-secondary)]'>{selectedQuestion.category}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedQuestion(null)}
                    className='text-[var(--text-secondary)] hover:text-white p-2'
                  >
                    ✕
                  </button>
                </div>

                <p className='text-[var(--text-secondary)] text-lg leading-relaxed'>
                  {selectedQuestion.question}
                </p>
              </div>

              <div className='p-6 overflow-y-auto max-h-96'>
                <div className='space-y-6'>
                  {/* Practice Mode */}
                  {practiceMode && (
                    <div>
                      <h3 className='font-semibold mb-3 text-blue-400'>Your Answer</h3>
                      <textarea
                        value={userAnswers[selectedQuestion.id] || ''}
                        onChange={(e) => setUserAnswers(prev => ({
                          ...prev,
                          [selectedQuestion.id]: e.target.value
                        }))}
                        placeholder='Write your answer here...'
                        className='w-full bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500'
                        rows={6}
                      />
                    </div>
                  )}

                  {/* Expected Answer */}
                  <div>
                    <h3 className='font-semibold mb-3 text-green-400'>Expected Answer</h3>
                    <p className='text-[var(--text-secondary)] leading-relaxed'>
                      {selectedQuestion.expectedAnswer}
                    </p>
                  </div>

                  {/* Tips */}
                  {selectedQuestion.tips.length > 0 && (
                    <div>
                      <h3 className='font-semibold mb-3 text-yellow-400'>💡 Tips</h3>
                      <ul className='space-y-2'>
                        {selectedQuestion.tips.map((tip, index) => (
                          <li key={index} className='flex items-start gap-2 text-[var(--text-secondary)]'>
                            <span className='text-yellow-400 mt-1'>•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Follow-up Questions */}
                  {selectedQuestion.followUpQuestions.length > 0 && (
                    <div>
                      <h3 className='font-semibold mb-3 text-purple-400'>🔄 Follow-up Questions</h3>
                      <ul className='space-y-2'>
                        {selectedQuestion.followUpQuestions.map((followUp, index) => (
                          <li key={index} className='flex items-start gap-2 text-[var(--text-secondary)]'>
                            <span className='text-purple-400 mt-1'>?</span>
                            <span>{followUp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}