'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from 'recharts';

interface ProjectMetrics {
  name: string;
  stars: number;
  forks: number;
  watchers: number;
  issues: number;
  contributors: number;
  commits: number;
  size: number;
  language: string;
  created_at: string;
  updated_at: string;
}

interface ImpactScore {
  project: string;
  totalScore: number;
  reachScore: number;
  engagementScore: number;
  qualityScore: number;
  maintenanceScore: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D';
}

interface ProjectImpactCalculatorProps {
  username: string;
  repos: any[];
}

export default function ProjectImpactCalculator({ username, repos }: ProjectImpactCalculatorProps) {
  const [projects, setProjects] = useState<ProjectMetrics[]>([]);
  const [impactScores, setImpactScores] = useState<ImpactScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'impact' | 'stars' | 'forks' | 'recent'>('impact');

  useEffect(() => {
    const calculateProjectImpact = () => {
      if (!repos || repos.length === 0) {
        setProjects([]);
        setImpactScores([]);
        setLoading(false);
        return;
      }

      // Use real repository data
      const realProjects: ProjectMetrics[] = repos.slice(0, 10).map(repo => ({
        name: repo.name,
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        watchers: repo.watchers_count || 0,
        issues: 0, // Would need additional API call
        contributors: 0, // Would need additional API call
        commits: 0, // Would need additional API call
        size: repo.size || 0,
        language: repo.language || 'Unknown',
        created_at: repo.created_at,
        updated_at: repo.updated_at || repo.pushed_at
      }));

      // Calculate impact scores for each project
      const calculatedScores: ImpactScore[] = realProjects.map(project => {
        // Reach Score (30%): Based on stars, forks, watchers
        const reachScore = Math.min(100, (
          (project.stars / 50) * 0.5 +
          (project.forks / 10) * 0.3 +
          (project.watchers / 5) * 0.2
        ));

        // Engagement Score (25%): Based on issues, contributors, commits
        const engagementScore = Math.min(100, (
          (project.contributors / 2) * 0.4 +
          (project.commits / 50) * 0.4 +
          (project.issues > 0 ? Math.min(100, 100 - (project.issues / 2)) : 100) * 0.2
        ));

        // Quality Score (25%): Based on size, language popularity, maintenance
        const qualityScore = Math.min(100, (
          (project.size > 1000 ? 80 : project.size / 12.5) * 0.4 +
          70 * 0.3 + // Language quality assumption
          (project.contributors > 5 ? 90 : project.contributors * 15) * 0.3
        ));

        // Maintenance Score (20%): Based on recent updates, issue resolution
        const daysSinceUpdate = (Date.now() - new Date(project.updated_at).getTime()) / (1000 * 60 * 60 * 24);
        const maintenanceScore = Math.min(100, Math.max(0,
          100 - (daysSinceUpdate / 30) * 20 +
          (project.issues < 20 ? 80 : 40)
        ));

        // Total weighted score
        const totalScore = (
          reachScore * 0.3 +
          engagementScore * 0.25 +
          qualityScore * 0.25 +
          maintenanceScore * 0.2
        );

        // Determine grade
        let grade: ImpactScore['grade'];
        if (totalScore >= 95) grade = 'A+';
        else if (totalScore >= 90) grade = 'A';
        else if (totalScore >= 85) grade = 'B+';
        else if (totalScore >= 80) grade = 'B';
        else if (totalScore >= 70) grade = 'C+';
        else if (totalScore >= 60) grade = 'C';
        else grade = 'D';

        return {
          project: project.name,
          totalScore: Math.round(totalScore),
          reachScore: Math.round(reachScore),
          engagementScore: Math.round(engagementScore),
          qualityScore: Math.round(qualityScore),
          maintenanceScore: Math.round(maintenanceScore),
          grade
        };
      });

      setProjects(realProjects);
      setImpactScores(calculatedScores);
      setLoading(false);
    };

    calculateProjectImpact();
  }, [username, repos]);

  const getSortedProjects = () => {
    return [...impactScores].sort((a, b) => {
      switch (sortBy) {
        case 'impact':
          return b.totalScore - a.totalScore;
        case 'stars':
          return (projects.find(p => p.name === b.project)?.stars || 0) -
                 (projects.find(p => p.name === a.project)?.stars || 0);
        case 'forks':
          return (projects.find(p => p.name === b.project)?.forks || 0) -
                 (projects.find(p => p.name === a.project)?.forks || 0);
        case 'recent':
          return new Date(projects.find(p => p.name === b.project)?.updated_at || 0).getTime() -
                 new Date(projects.find(p => p.name === a.project)?.updated_at || 0).getTime();
        default:
          return 0;
      }
    });
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'text-green-500 bg-green-500/20';
      case 'A': return 'text-green-400 bg-green-400/20';
      case 'B+': return 'text-blue-500 bg-blue-500/20';
      case 'B': return 'text-blue-400 bg-blue-400/20';
      case 'C+': return 'text-yellow-500 bg-yellow-500/20';
      case 'C': return 'text-yellow-400 bg-yellow-400/20';
      case 'D': return 'text-red-500 bg-red-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getSelectedProjectData = () => {
    if (!selectedProject) return null;
    const project = projects.find(p => p.name === selectedProject);
    const impact = impactScores.find(i => i.project === selectedProject);
    return { project, impact };
  };

  const getRadarData = () => {
    const data = getSelectedProjectData();
    if (!data?.impact) return [];

    return [
      { subject: 'Reach', A: data.impact.reachScore, fullMark: 100 },
      { subject: 'Engagement', A: data.impact.engagementScore, fullMark: 100 },
      { subject: 'Quality', A: data.impact.qualityScore, fullMark: 100 },
      { subject: 'Maintenance', A: data.impact.maintenanceScore, fullMark: 100 }
    ];
  };

  const getGradeDistribution = () => {
    const distribution = impactScores.reduce((acc, score) => {
      acc[score.grade] = (acc[score.grade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution).map(([grade, count]) => ({
      grade,
      count,
      color: grade.startsWith('A') ? '#10B981' : grade.startsWith('B') ? '#3B82F6' : grade.startsWith('C') ? '#F59E0B' : '#EF4444'
    }));
  };

  if (loading) {
    return (
      <div className='card'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold'>Project Impact Calculator</h2>
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

  const selectedData = getSelectedProjectData();

  return (
    <motion.div
      className='card'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-bold'>Project Impact Calculator</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Calculate the reach and impact of your projects
          </p>
        </div>

        {/* Sort Options */}
        <div className='flex bg-[var(--background)] rounded-lg p-1'>
          {[
            { id: 'impact', label: 'Impact' },
            { id: 'stars', label: 'Stars' },
            { id: 'forks', label: 'Forks' },
            { id: 'recent', label: 'Recent' }
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setSortBy(option.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                sortBy === option.id
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Statistics */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <div className='text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20'>
          <p className='text-2xl font-bold text-blue-500'>
            {Math.round(impactScores.reduce((sum, score) => sum + score.totalScore, 0) / impactScores.length)}
          </p>
          <p className='text-sm text-[var(--text-secondary)]'>Avg Impact Score</p>
        </div>

        <div className='text-center p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg border border-green-500/20'>
          <p className='text-2xl font-bold text-green-500'>
            {projects.reduce((sum, project) => sum + project.stars, 0).toLocaleString()}
          </p>
          <p className='text-sm text-[var(--text-secondary)]'>Total Stars</p>
        </div>

        <div className='text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/20'>
          <p className='text-2xl font-bold text-purple-500'>
            {projects.reduce((sum, project) => sum + project.forks, 0)}
          </p>
          <p className='text-sm text-[var(--text-secondary)]'>Total Forks</p>
        </div>

        <div className='text-center p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-lg border border-yellow-500/20'>
          <p className='text-2xl font-bold text-yellow-500'>
            {impactScores.filter(score => score.grade.startsWith('A')).length}
          </p>
          <p className='text-sm text-[var(--text-secondary)]'>A-Grade Projects</p>
        </div>
      </div>

      {/* Project Impact Scores */}
      <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)] mb-6'>
        <h3 className='text-lg font-semibold mb-4'>Project Impact Rankings</h3>
        <div className='space-y-3'>
          {getSortedProjects().map((score, index) => {
            const project = projects.find(p => p.name === score.project);
            return (
              <motion.div
                key={score.project}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedProject === score.project
                    ? 'border-[var(--primary)] bg-[var(--primary)] bg-opacity-5'
                    : 'border-[var(--card-border)] hover:border-[var(--primary)] hover:border-opacity-50'
                }`}
                onClick={() => setSelectedProject(score.project)}
                whileHover={{ scale: 1.01 }}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center justify-center w-8 h-8 bg-[var(--primary)] text-white text-sm font-bold rounded-full'>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className='font-semibold'>{score.project}</h4>
                      <p className='text-sm text-[var(--text-secondary)]'>
                        ⭐ {project?.stars} • 🍴 {project?.forks} • 👁️ {project?.watchers}
                      </p>
                    </div>
                  </div>

                  <div className='text-right'>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getGradeColor(score.grade)}`}>
                      {score.grade}
                    </div>
                    <p className='text-sm text-[var(--text-secondary)] mt-1'>
                      {score.totalScore}/100
                    </p>
                  </div>
                </div>

                {/* Progress bars for different metrics */}
                <div className='mt-3 grid grid-cols-4 gap-2'>
                  <div>
                    <div className='flex justify-between text-xs text-[var(--text-secondary)] mb-1'>
                      <span>Reach</span>
                      <span>{score.reachScore}</span>
                    </div>
                    <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1'>
                      <div className='bg-blue-500 h-1 rounded-full' style={{ width: `${score.reachScore}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className='flex justify-between text-xs text-[var(--text-secondary)] mb-1'>
                      <span>Engage</span>
                      <span>{score.engagementScore}</span>
                    </div>
                    <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1'>
                      <div className='bg-green-500 h-1 rounded-full' style={{ width: `${score.engagementScore}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className='flex justify-between text-xs text-[var(--text-secondary)] mb-1'>
                      <span>Quality</span>
                      <span>{score.qualityScore}</span>
                    </div>
                    <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1'>
                      <div className='bg-purple-500 h-1 rounded-full' style={{ width: `${score.qualityScore}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className='flex justify-between text-xs text-[var(--text-secondary)] mb-1'>
                      <span>Maint</span>
                      <span>{score.maintenanceScore}</span>
                    </div>
                    <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1'>
                      <div className='bg-yellow-500 h-1 rounded-full' style={{ width: `${score.maintenanceScore}%` }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detailed Analysis */}
      {selectedData && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
          {/* Radar Chart */}
          <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
            <h3 className='text-lg font-semibold mb-4'>Impact Breakdown</h3>
            <ResponsiveContainer width='100%' height={250}>
              <RadarChart data={getRadarData()}>
                <PolarGrid />
                <PolarAngleAxis dataKey='subject' />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name={selectedProject || ''}
                  dataKey='A'
                  stroke='#8976EA'
                  fill='#8976EA'
                  fillOpacity={0.3}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Project Details */}
          <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
            <h3 className='text-lg font-semibold mb-4'>Project Details</h3>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-[var(--text-secondary)]'>Language:</span>
                <span className='font-medium'>{selectedData.project?.language}</span>
              </div>

              <div className='flex justify-between'>
                <span className='text-[var(--text-secondary)]'>Contributors:</span>
                <span className='font-medium'>{selectedData.project?.contributors}</span>
              </div>

              <div className='flex justify-between'>
                <span className='text-[var(--text-secondary)]'>Total Commits:</span>
                <span className='font-medium'>{selectedData.project?.commits}</span>
              </div>

              <div className='flex justify-between'>
                <span className='text-[var(--text-secondary)]'>Size (KB):</span>
                <span className='font-medium'>{selectedData.project?.size}</span>
              </div>

              <div className='flex justify-between'>
                <span className='text-[var(--text-secondary)]'>Created:</span>
                <span className='font-medium'>
                  {new Date(selectedData.project?.created_at || '').toLocaleDateString()}
                </span>
              </div>

              <div className='flex justify-between'>
                <span className='text-[var(--text-secondary)]'>Last Updated:</span>
                <span className='font-medium'>
                  {new Date(selectedData.project?.updated_at || '').toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grade Distribution */}
      <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
        <h3 className='text-lg font-semibold mb-4'>Impact Grade Distribution</h3>
        <ResponsiveContainer width='100%' height={200}>
          <PieChart>
            <Pie
              data={getGradeDistribution()}
              cx='50%'
              cy='50%'
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey='count'
            >
              {getGradeDistribution().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        <div className='flex flex-wrap justify-center gap-4 mt-4'>
          {getGradeDistribution().map((item) => (
            <div key={item.grade} className='flex items-center gap-2'>
              <div
                className='w-3 h-3 rounded-full'
                style={{ backgroundColor: item.color }}
              ></div>
              <span className='text-sm'>
                {item.grade}: {item.count} project{item.count !== 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
