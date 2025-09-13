'use client';

import React, { useState, useEffect } from 'react';
import { Repository } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { callAI } from '@/lib/aiService';

interface CareerPath {
  id: string;
  title: string;
  description: string;
  salary: {
    entry: number;
    mid: number;
    senior: number;
  };
  skills: string[];
  timeline: string;
  demand: 'High' | 'Medium' | 'Low';
  match_score: number;
  next_steps: string[];
}

interface SkillGap {
  skill: string;
  current_level: number;
  required_level: number;
  time_to_learn: string;
  resources: string[];
}

interface AICareerPathPredictorProps {
  username: string;
  repos: Repository[];
}

function AICareerPathPredictor({ username, repos }: AICareerPathPredictorProps) {
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);

  useEffect(() => {
    analyzeCareerPaths();
  }, [repos]);

  const analyzeCareerPaths = async () => {
    setIsAnalyzing(true);

    try {
      // Extract skills from repositories
      const skills = new Set<string>();
      const languages = new Set<string>();
      const frameworks = new Set<string>();

      repos.forEach(repo => {
        if (repo.language) languages.add(repo.language);
        if (repo.topics) {
          repo.topics.forEach(topic => {
            skills.add(topic);
            if (['react', 'vue', 'angular', 'next', 'nuxt', 'svelte'].includes(topic)) {
              frameworks.add(topic);
            }
          });
        }
      });

      const userSkills = Array.from(skills);
      const userLanguages = Array.from(languages);
      const userFrameworks = Array.from(frameworks);

      setCurrentSkills(userSkills);

      // Fetch GitHub data
      const token = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN;
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const contributionsRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers });
      const userRepos = contributionsRes.ok ? await contributionsRes.json() : repos;

      const totalStars = userRepos.reduce((sum: number, repo: any) => sum + (repo.stargazers_count || 0), 0);
      const totalForks = userRepos.reduce((sum: number, repo: any) => sum + (repo.forks_count || 0), 0);
      const accountAge = new Date().getFullYear() - new Date(userRepos[0]?.created_at || new Date()).getFullYear();

      // AI prompt
      const prompt = `Based on this GitHub developer profile, recommend the top 5 most suitable career paths:

Developer Profile:
- Username: ${username}
- Total Repositories: ${userRepos.length}
- Total Stars: ${totalStars}
- Total Forks: ${totalForks}
- Account Age: ${accountAge} years
- Primary Languages: ${userLanguages.slice(0, 3).join(', ')}
- Skills/Topics: ${userSkills.slice(0, 5).join(', ')}
- Frameworks Used: ${userFrameworks.join(', ')}

Recent Projects:
${userRepos.slice(0, 3).map((repo: any) => `- ${repo.name}: ${repo.description || 'No description'} (${repo.language}, ${repo.stargazers_count} stars)`).join('\n')}

Please recommend career paths that match their:
1. Technical skills and experience level
2. Project types and complexity
3. Industry trends and market demand
4. Growth potential and salary expectations

Format your response as a JSON array of career recommendations:
[
  {
    "title": "Career Path Name",
    "description": "Detailed description of the role",
    "skills": ["required skill 1", "required skill 2"],
    "salary": {"entry": 60000, "mid": 90000, "senior": 130000},
    "timeline": "Time to achieve this role",
    "demand": "High|Medium|Low",
    "match_score": 85,
    "next_steps": ["Step 1", "Step 2", "Step 3"]
  }
]`;

      const aiResponse = await callAI({
        prompt,
        maxTokens: 2000,
        temperature: 0.7
      });

      if (aiResponse.success) {
        try {
          const aiCareerPaths = JSON.parse(aiResponse.content);
          if (Array.isArray(aiCareerPaths) && aiCareerPaths.length > 0) {
            setCareerPaths(aiCareerPaths);

            // Calculate skill gaps
            const topPath = aiCareerPaths[0];
            const gaps: SkillGap[] = topPath.skills
              .filter((skill: string) => !userSkills.some(userSkill =>
                userSkill.toLowerCase().includes(skill.toLowerCase().split(' ')[0])
              ))
              .map((skill: string) => ({
                skill,
                current_level: 0,
                required_level: 3,
                time_to_learn: skill.includes('React') || skill.includes('TypeScript') ? '2-3 months' :
                              skill.includes('Node') || skill.includes('Python') ? '3-4 months' :
                              skill.includes('Docker') || skill.includes('AWS') ? '1-2 months' : '4-6 months',
                resources: [
                  `Official ${skill} documentation`,
                  `${skill} courses on Udemy/Pluralsight`,
                  `${skill} projects on GitHub`,
                  `Join ${skill} communities on Reddit/Discord`
                ]
              }));

            setSkillGaps(gaps);
            setIsAnalyzing(false);
            return;
          }
        } catch (parseError) {
          console.warn('AI response parsing failed, using fallback:', parseError);
        }
      }
    } catch (error) {
      console.error('Error analyzing career paths:', error);
    }

    // Fallback
    const skills = new Set<string>();
    const languages = new Set<string>();
    const frameworks = new Set<string>();

    repos.forEach(repo => {
      if (repo.language) languages.add(repo.language);
      if (repo.topics) {
        repo.topics.forEach(topic => {
          skills.add(topic);
          if (['react', 'vue', 'angular', 'next', 'nuxt', 'svelte'].includes(topic)) {
            frameworks.add(topic);
          }
        });
      }
    });

    const userSkills = Array.from(skills);
    const userFrameworks = Array.from(frameworks);
    setCurrentSkills(userSkills);

    const fallbackCareerPaths: CareerPath[] = [
      {
        id: 'fullstack-dev',
        title: 'Full-Stack Developer',
        description: 'Build complete web applications with both frontend and backend technologies',
        salary: { entry: 60000, mid: 90000, senior: 130000 },
        skills: ['JavaScript', 'React', 'Node.js', 'SQL', 'REST APIs', 'Git'],
        timeline: '6-12 months',
        demand: 'High',
        match_score: userFrameworks.includes('react') ? 85 : 70,
        next_steps: [
          'Master a backend framework (Express.js or Django)',
          'Learn database design and SQL',
          'Build full-stack projects',
          'Study system design principles'
        ]
      },
      {
        id: 'frontend-specialist',
        title: 'Frontend Specialist',
        description: 'Create exceptional user interfaces and experiences',
        salary: { entry: 55000, mid: 85000, senior: 120000 },
        skills: ['React', 'TypeScript', 'CSS', 'JavaScript', 'UI/UX', 'Performance'],
        timeline: '4-8 months',
        demand: 'High',
        match_score: userFrameworks.includes('react') ? 90 : 75,
        next_steps: [
          'Master React ecosystem',
          'Learn TypeScript',
          'Study UI/UX principles',
          'Focus on performance optimization'
        ]
      }
    ];

    setCareerPaths(fallbackCareerPaths);

    if (fallbackCareerPaths.length > 0) {
      const topPath = fallbackCareerPaths[0];
      const gaps: SkillGap[] = topPath.skills
        .filter(skill => !userSkills.some(userSkill =>
          userSkill.toLowerCase().includes(skill.toLowerCase().split(' ')[0])
        ))
        .map(skill => ({
          skill,
          current_level: 0,
          required_level: 3,
          time_to_learn: skill.includes('React') || skill.includes('TypeScript') ? '2-3 months' :
                        skill.includes('Node') || skill.includes('Python') ? '3-4 months' :
                        skill.includes('Docker') || skill.includes('AWS') ? '1-2 months' : '4-6 months',
          resources: [
            `Official ${skill} documentation`,
            `${skill} courses on Udemy/Pluralsight`,
            `${skill} projects on GitHub`,
            `Join ${skill} communities on Reddit/Discord`
          ]
        }));

      setSkillGaps(gaps);
    }

    setIsAnalyzing(false);
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'High': return 'text-green-500 bg-green-500/20';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/20';
      case 'Low': return 'text-red-500 bg-red-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

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
            <p className='text-[var(--text-secondary)]'>AI analyzing your career trajectory...</p>
            <p className='text-sm text-[var(--text-secondary)] mt-2'>Evaluating skills, experience, and market trends</p>
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
          <h2 className='text-2xl font-bold'>AI Career Path Predictor</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Personalized career recommendations based on your GitHub profile and market trends
          </p>
        </div>

        <div className='text-sm text-[var(--text-secondary)]'>
          {currentSkills.length} skills detected
        </div>
      </div>

      {/* Top Recommendation */}
      {careerPaths.length > 0 && (
        <div className='mb-6 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg'>
          <div className='flex items-center gap-4 mb-4'>
            <div className='text-4xl'>🎯</div>
            <div>
              <h3 className='text-xl font-bold'>Top Recommendation</h3>
              <p className='text-[var(--text-secondary)]'>Based on your current skills and market demand</p>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h4 className='text-lg font-semibold mb-2'>{careerPaths[0].title}</h4>
              <p className='text-[var(--text-secondary)] mb-4'>{careerPaths[0].description}</p>

              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span>Match Score:</span>
                  <span className='font-bold text-[var(--primary)]'>{careerPaths[0].match_score}%</span>
                </div>
                <div className='flex justify-between'>
                  <span>Time to Achieve:</span>
                  <span>{careerPaths[0].timeline}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Market Demand:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getDemandColor(careerPaths[0].demand)}`}>
                    {careerPaths[0].demand}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className='font-semibold mb-2'>Salary Range</h4>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span>Entry Level:</span>
                  <span className='font-bold text-green-500'>{formatSalary(careerPaths[0].salary.entry)}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Mid Level:</span>
                  <span className='font-bold text-blue-500'>{formatSalary(careerPaths[0].salary.mid)}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Senior Level:</span>
                  <span className='font-bold text-purple-500'>{formatSalary(careerPaths[0].salary.senior)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Career Paths Grid */}
      <div className='mb-6'>
        <h3 className='text-lg font-semibold mb-4'>Recommended Career Paths</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {careerPaths.map((path, index) => (
            <motion.div
              key={path.id}
              className='p-4 border border-[var(--card-border)] rounded-lg cursor-pointer hover:border-[var(--primary)] transition-colors'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              onClick={() => setSelectedPath(path)}
            >
              <div className='flex items-center justify-between mb-2'>
                <h4 className='font-semibold'>{path.title}</h4>
                <span className={`px-2 py-1 rounded-full text-xs ${getDemandColor(path.demand)}`}>
                  {path.demand}
                </span>
              </div>

              <p className='text-sm text-[var(--text-secondary)] mb-3 line-clamp-2'>
                {path.description}
              </p>

              <div className='flex items-center justify-between text-sm'>
                <span className='text-[var(--primary)] font-bold'>{path.match_score}% match</span>
                <span>{path.timeline}</span>
              </div>

              <div className='mt-2 text-xs text-[var(--text-secondary)]'>
                💰 {formatSalary(path.salary.mid)} avg salary
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Skill Gaps Analysis */}
      {skillGaps.length > 0 && (
        <div>
          <h3 className='text-lg font-semibold mb-4'>Skill Gaps to Close</h3>
          <div className='space-y-3'>
            {skillGaps.map((gap, index) => (
              <motion.div
                key={gap.skill}
                className='p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg'
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <div className='flex items-center justify-between mb-2'>
                  <h4 className='font-medium'>{gap.skill}</h4>
                  <span className='text-sm text-[var(--text-secondary)]'>{gap.time_to_learn}</span>
                </div>

                <div className='mb-3'>
                  <div className='flex justify-between text-sm mb-1'>
                    <span>Current Level</span>
                    <span>Required Level</span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-[var(--primary)] h-2 rounded-full transition-all duration-500'
                      style={{ width: `${(gap.current_level / gap.required_level) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <h5 className='text-sm font-medium mb-2'>Learning Resources:</h5>
                  <div className='flex flex-wrap gap-2'>
                    {gap.resources.map((resource, idx) => (
                      <span
                        key={idx}
                        className='px-2 py-1 bg-blue-500/20 text-blue-600 rounded-full text-xs'
                      >
                        {resource}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Career Path Detail Modal */}
      <AnimatePresence>
        {selectedPath && (
          <motion.div
            className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPath(null)}
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
                  <h2 className='text-2xl font-bold'>{selectedPath.title}</h2>
                  <button
                    onClick={() => setSelectedPath(null)}
                    className='text-[var(--text-secondary)] hover:text-white p-2'
                  >
                    ✕
                  </button>
                </div>

                <p className='text-[var(--text-secondary)] mb-4'>{selectedPath.description}</p>

                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
                    <div className='text-lg font-bold text-[var(--primary)]'>{selectedPath.match_score}%</div>
                    <div className='text-xs text-[var(--text-secondary)]'>Match Score</div>
                  </div>

                  <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
                    <div className='text-lg font-bold text-green-500'>{formatSalary(selectedPath.salary.mid)}</div>
                    <div className='text-xs text-[var(--text-secondary)]'>Avg Salary</div>
                  </div>

                  <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
                    <div className='text-lg font-bold text-blue-500'>{selectedPath.timeline}</div>
                    <div className='text-xs text-[var(--text-secondary)]'>Timeline</div>
                  </div>

                  <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
                    <div className={`px-2 py-1 rounded-full text-xs ${getDemandColor(selectedPath.demand)}`}>
                      {selectedPath.demand}
                    </div>
                    <div className='text-xs text-[var(--text-secondary)]'>Demand</div>
                  </div>
                </div>
              </div>

              <div className='p-6 overflow-y-auto max-h-96'>
                <div className='space-y-6'>
                  <div>
                    <h3 className='font-semibold mb-3'>Required Skills</h3>
                    <div className='flex flex-wrap gap-2'>
                      {selectedPath.skills.map(skill => (
                        <span
                          key={skill}
                          className={`px-3 py-1 rounded-full text-sm ${
                            currentSkills.some(userSkill =>
                              userSkill.toLowerCase().includes(skill.toLowerCase().split(' ')[0])
                            )
                              ? 'bg-green-500/20 text-green-600'
                              : 'bg-gray-500/20 text-gray-600'
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className='font-semibold mb-3'>Next Steps</h3>
                    <div className='space-y-2'>
                      {selectedPath.next_steps.map((step, index) => (
                        <div key={index} className='flex items-start gap-3'>
                          <span className='text-blue-500 mt-1'>•</span>
                          <span className='text-sm text-[var(--text-secondary)]'>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className='bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4'>
                    <h3 className='font-semibold mb-2 text-green-600'>🎯 AI Career Prediction</h3>
                    <p className='text-sm text-[var(--text-secondary)]'>
                      Based on current market trends and your skill profile, this career path has a {selectedPath.match_score}% compatibility score.
                      The projected timeline accounts for your current experience level and learning curve.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AICareerPathPredictor;