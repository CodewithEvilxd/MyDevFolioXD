'use client';

import { useState, useEffect } from 'react';
import { Repository } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface RecommendedProject {
  id: string;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  language: string;
  stars: number;
  forks: number;
  issues: number;
  topics: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  match_score: number;
  why_recommended: string[];
  contribution_ideas: string[];
  learning_outcomes: string[];
  time_estimate: string;
  maintainer_active: boolean;
}

interface UserSkills {
  languages: string[];
  frameworks: string[];
  topics: string[];
  experience_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  preferred_difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

interface SmartProjectRecommendationEngineProps {
  username: string;
  repos: Repository[];
}

export default function SmartProjectRecommendationEngine({ username, repos }: SmartProjectRecommendationEngineProps) {
  const [recommendations, setRecommendations] = useState<RecommendedProject[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkills | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [selectedProject, setSelectedProject] = useState<RecommendedProject | null>(null);

  useEffect(() => {
    analyzeUserSkills();
  }, [repos]);

  useEffect(() => {
    if (userSkills) {
      generateRecommendations();
    }
  }, [userSkills]);

  const analyzeUserSkills = async () => {
    setIsAnalyzing(true);

    // Analyze user's repositories to determine skills
    const languages = new Set<string>();
    const topics = new Set<string>();
    const frameworks = new Set<string>();

    repos.forEach(repo => {
      if (repo.language) languages.add(repo.language);
      if (repo.topics) {
        repo.topics.forEach(topic => topics.add(topic));
      }
    });

    // Detect frameworks from topics and repo names
    const frameworkKeywords = ['react', 'vue', 'angular', 'next', 'nuxt', 'svelte', 'express', 'django', 'flask', 'spring'];
    frameworkKeywords.forEach(framework => {
      if (Array.from(topics).some(topic => topic.toLowerCase().includes(framework))) {
        frameworks.add(framework.charAt(0).toUpperCase() + framework.slice(1));
      }
    });

    // Determine experience level based on repo metrics
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
    const avgStarsPerRepo = totalStars / repos.length;

    let experience_level: UserSkills['experience_level'] = 'Beginner';
    if (avgStarsPerRepo > 50 || totalForks > 20) experience_level = 'Intermediate';
    if (avgStarsPerRepo > 200 || totalForks > 100) experience_level = 'Advanced';
    if (avgStarsPerRepo > 1000 || totalForks > 500) experience_level = 'Expert';

    const skills: UserSkills = {
      languages: Array.from(languages),
      frameworks: Array.from(frameworks),
      topics: Array.from(topics),
      experience_level,
      preferred_difficulty: experience_level // Start with same difficulty
    };

    setUserSkills(skills);
    setIsAnalyzing(false);
  };

  const generateRecommendations = async () => {
    if (!userSkills) return;

    try {
      const token = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN;
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch trending repositories from GitHub
      const trendingRes = await fetch('https://api.github.com/search/repositories?q=stars:>100&sort=stars&order=desc&per_page=20', { headers });
      const trendingData = trendingRes.ok ? await trendingRes.json() : { items: [] };

      const recommendations: RecommendedProject[] = [];

      // Analyze user's repositories to determine skill levels
      const userLanguages = new Set(repos.map(repo => repo.language).filter(Boolean));
      const userTopics = new Set(repos.flatMap(repo => repo.topics || []));
      const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);

      // Determine user experience level
      let experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';
      if (totalStars > 100 || totalForks > 20) experienceLevel = 'Intermediate';
      if (totalStars > 500 || totalForks > 100) experienceLevel = 'Advanced';

      // Generate recommendations based on real trending repos
      trendingData.items?.slice(0, 10).forEach((repo: any, index: number) => {
        const language = repo.language || 'Other';
        const topics = repo.topics || [];

        // Calculate match score based on user's skills
        let matchScore = 50; // Base score

        if (userLanguages.has(language)) matchScore += 20;
        if (topics.some((topic: string) => userTopics.has(topic))) matchScore += 15;

        // Adjust based on difficulty vs experience
        const difficulty = repo.stargazers_count > 1000 ? 'Advanced' :
                          repo.stargazers_count > 100 ? 'Intermediate' : 'Beginner';

        if (difficulty === experienceLevel) matchScore += 10;
        else if (difficulty === 'Beginner' && experienceLevel === 'Advanced') matchScore -= 10;

        matchScore = Math.max(0, Math.min(100, matchScore));

        // Generate recommendation reasons
        const whyRecommended = [];
        if (userLanguages.has(language)) {
          whyRecommended.push(`Matches your ${language} experience`);
        }
        if (topics.some((topic: string) => userTopics.has(topic))) {
          whyRecommended.push('Aligns with your interests and skills');
        }
        whyRecommended.push(`${repo.stargazers_count} stars indicate active project`);
        whyRecommended.push('Good opportunity to contribute to popular open source');

        // Generate contribution ideas based on repo topics
        const contributionIdeas = [];
        if (topics.includes('react') || topics.includes('frontend')) {
          contributionIdeas.push('Add new UI components');
          contributionIdeas.push('Implement responsive design improvements');
          contributionIdeas.push('Add accessibility features');
        }
        if (topics.includes('api') || topics.includes('backend')) {
          contributionIdeas.push('Add new API endpoints');
          contributionIdeas.push('Implement authentication');
          contributionIdeas.push('Add database optimizations');
        }
        if (topics.includes('testing')) {
          contributionIdeas.push('Add comprehensive test suites');
          contributionIdeas.push('Implement CI/CD improvements');
        }
        if (contributionIdeas.length === 0) {
          contributionIdeas.push('Fix bugs and issues');
          contributionIdeas.push('Add documentation');
          contributionIdeas.push('Implement new features');
        }

        // Generate learning outcomes
        const learningOutcomes = [];
        learningOutcomes.push(`${language} best practices`);
        if (topics.includes('testing')) learningOutcomes.push('Testing methodologies');
        if (topics.includes('api')) learningOutcomes.push('API design patterns');
        if (topics.includes('database')) learningOutcomes.push('Database management');
        learningOutcomes.push('Open source contribution workflow');
        learningOutcomes.push('Code review processes');

        recommendations.push({
          id: repo.id.toString(),
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description || 'No description available',
          html_url: repo.html_url,
          language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          issues: repo.open_issues_count,
          topics,
          difficulty,
          match_score: matchScore,
          why_recommended: whyRecommended,
          contribution_ideas: contributionIdeas,
          learning_outcomes: learningOutcomes,
          time_estimate: difficulty === 'Beginner' ? '1-2 weeks' :
                        difficulty === 'Intermediate' ? '2-4 weeks' : '4-8 weeks',
          maintainer_active: new Date(repo.updated_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        });
      });

      // Filter and sort recommendations
      const filteredRecommendations = recommendations
        .filter(project => {
          const languageMatch = selectedLanguage === 'all' || project.language === selectedLanguage;
          const difficultyMatch = selectedDifficulty === 'all' || project.difficulty === selectedDifficulty;
          return languageMatch && difficultyMatch;
        })
        .sort((a, b) => b.match_score - a.match_score);

      setRecommendations(filteredRecommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Fallback to basic recommendations
      setRecommendations([]);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-500 bg-green-500/20';
      case 'Intermediate': return 'text-blue-500 bg-blue-500/20';
      case 'Advanced': return 'text-orange-500 bg-orange-500/20';
      case 'Expert': return 'text-red-500 bg-red-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const filteredRecommendations = recommendations.filter(project => {
    const languageMatch = selectedLanguage === 'all' || project.language === selectedLanguage;
    const difficultyMatch = selectedDifficulty === 'all' || project.difficulty === selectedDifficulty;
    return languageMatch && difficultyMatch;
  });

  if (isAnalyzing) {
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
            <p className='text-[var(--text-secondary)]'>Analyzing your skills and finding perfect projects...</p>
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
          <h2 className='text-2xl font-bold'>Smart Project Recommendation Engine</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            AI-powered recommendations for open source projects perfect for your skills
          </p>
        </div>

        <div className='flex items-center gap-4'>
          <div className='text-sm text-[var(--text-secondary)]'>
            {filteredRecommendations.length} recommendations
          </div>
        </div>
      </div>

      {/* User Skills Summary */}
      {userSkills && (
        <div className='mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg'>
          <h3 className='font-semibold mb-3'>Your Profile</h3>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
            <div>
              <span className='text-[var(--text-secondary)]'>Experience:</span>
              <div className='font-medium text-[var(--primary)]'>{userSkills.experience_level}</div>
            </div>
            <div>
              <span className='text-[var(--text-secondary)]'>Languages:</span>
              <div className='font-medium'>{userSkills.languages.length}</div>
            </div>
            <div>
              <span className='text-[var(--text-secondary)]'>Frameworks:</span>
              <div className='font-medium'>{userSkills.frameworks.length}</div>
            </div>
            <div>
              <span className='text-[var(--text-secondary)]'>Topics:</span>
              <div className='font-medium'>{userSkills.topics.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className='flex flex-wrap gap-4 mb-6'>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-[var(--text-secondary)]'>Difficulty:</span>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className='bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] px-3 py-1 rounded text-sm'
          >
            <option value='all'>All Levels</option>
            <option value='Beginner'>Beginner</option>
            <option value='Intermediate'>Intermediate</option>
            <option value='Advanced'>Advanced</option>
            <option value='Expert'>Expert</option>
          </select>
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-sm text-[var(--text-secondary)]'>Language:</span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className='bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] px-3 py-1 rounded text-sm'
          >
            <option value='all'>All Languages</option>
            {userSkills?.languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Project Recommendations */}
      <div className='space-y-4'>
        <AnimatePresence>
          {filteredRecommendations.map((project, index) => (
            <motion.div
              key={project.id}
              className='p-6 border border-[var(--card-border)] rounded-lg cursor-pointer hover:border-[var(--primary)] transition-colors'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              onClick={() => setSelectedProject(project)}
            >
              <div className='flex items-start justify-between mb-4'>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-2'>
                    <h3 className='text-lg font-bold hover:text-[var(--primary)] transition-colors'>
                      {project.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(project.difficulty)}`}>
                      {project.difficulty}
                    </span>
                    <span className='px-2 py-1 bg-[var(--card-bg)] text-xs rounded-full'>
                      {project.language}
                    </span>
                  </div>
                  <p className='text-[var(--text-secondary)] mb-3'>{project.description}</p>
                </div>

                <div className='text-right'>
                  <div className='text-2xl font-bold text-[var(--primary)] mb-1'>
                    {project.match_score}%
                  </div>
                  <div className='text-xs text-[var(--text-secondary)]'>Match Score</div>
                </div>
              </div>

              <div className='flex items-center gap-6 text-sm text-[var(--text-secondary)] mb-3'>
                <span>⭐ {project.stars.toLocaleString()}</span>
                <span>🍴 {project.forks.toLocaleString()}</span>
                <span>🐛 {project.issues} issues</span>
                <span>⏱️ {project.time_estimate}</span>
              </div>

              <div className='flex flex-wrap gap-2 mb-3'>
                {project.topics.slice(0, 4).map(topic => (
                  <span
                    key={topic}
                    className='px-2 py-1 bg-[var(--background)] text-xs rounded-full'
                  >
                    {topic}
                  </span>
                ))}
              </div>

              <div className='text-sm'>
                <span className='font-medium'>Why recommended:</span>
                <span className='text-[var(--text-secondary)] ml-2'>
                  {project.why_recommended[0]}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredRecommendations.length === 0 && (
        <div className='text-center py-8'>
          <p className='text-[var(--text-secondary)]'>No projects match your current filters</p>
        </div>
      )}

      {/* Project Detail Modal */}
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
              className='bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden'
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className='p-6 border-b border-[var(--card-border)]'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-3'>
                    <div className={`px-3 py-1 text-sm rounded-full ${getDifficultyColor(selectedProject.difficulty)}`}>
                      {selectedProject.difficulty}
                    </div>
                    <h2 className='text-xl font-bold'>{selectedProject.name}</h2>
                  </div>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className='text-[var(--text-secondary)] hover:text-white p-2'
                  >
                    ✕
                  </button>
                </div>

                <p className='text-[var(--text-secondary)] mb-4'>{selectedProject.description}</p>

                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
                  <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
                    <div className='text-lg font-bold text-yellow-500'>⭐ {selectedProject.stars}</div>
                    <div className='text-xs text-[var(--text-secondary)]'>Stars</div>
                  </div>
                  <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
                    <div className='text-lg font-bold text-blue-500'>🍴 {selectedProject.forks}</div>
                    <div className='text-xs text-[var(--text-secondary)]'>Forks</div>
                  </div>
                  <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
                    <div className='text-lg font-bold text-green-500'>{selectedProject.match_score}%</div>
                    <div className='text-xs text-[var(--text-secondary)]'>Match</div>
                  </div>
                  <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
                    <div className='text-lg font-bold text-purple-500'>{selectedProject.issues}</div>
                    <div className='text-xs text-[var(--text-secondary)]'>Issues</div>
                  </div>
                </div>
              </div>

              <div className='p-6 overflow-y-auto max-h-96'>
                <div className='space-y-6'>
                  <div>
                    <h3 className='font-semibold mb-3'>🎯 Why This Project?</h3>
                    <ul className='space-y-2'>
                      {selectedProject.why_recommended.map((reason, index) => (
                        <li key={index} className='text-sm text-[var(--text-secondary)] flex items-start gap-2'>
                          <span className='text-green-500 mt-1'>•</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className='font-semibold mb-3'>💡 Contribution Ideas</h3>
                    <ul className='space-y-2'>
                      {selectedProject.contribution_ideas.map((idea, index) => (
                        <li key={index} className='text-sm text-[var(--text-secondary)] flex items-start gap-2'>
                          <span className='text-blue-500 mt-1'>•</span>
                          {idea}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className='font-semibold mb-3'>📚 Learning Outcomes</h3>
                    <ul className='space-y-2'>
                      {selectedProject.learning_outcomes.map((outcome, index) => (
                        <li key={index} className='text-sm text-[var(--text-secondary)] flex items-start gap-2'>
                          <span className='text-purple-500 mt-1'>•</span>
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className='flex items-center justify-between pt-4 border-t border-[var(--card-border)]'>
                    <div className='text-sm text-[var(--text-secondary)]'>
                      ⏱️ Estimated time: {selectedProject.time_estimate}
                    </div>
                    <a
                      href={selectedProject.html_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg transition-colors text-sm font-medium'
                    >
                      View on GitHub →
                    </a>
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