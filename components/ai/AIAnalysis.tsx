// components/AIAnalysis.tsx
'use client';

import { useState, useEffect } from 'react';
import { Repository, GitHubUser } from '@/types';
import { callAI } from '@/lib/aiService';

interface AIAnalysisProps {
  user: GitHubUser;
  repos: Repository[];
}

export default function AIAnalysis({ user, repos }: AIAnalysisProps) {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const generateAnalysis = async () => {
      setLoading(true);
      setError('');

      try {
        // Prepare data for analysis
        const userData = {
          login: user.login,
          name: user.name,
          bio: user.bio,
          followers: user.followers,
          following: user.following,
          public_repos: user.public_repos,
          created_at: user.created_at,
        };

        const repoData = repos.map((repo) => ({
          name: repo.name,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          created_at: repo.created_at,
          updated_at: repo.updated_at,
          pushed_at: repo.pushed_at,
        }));

        // Get language statistics
        const languages: { [key: string]: number } = {};
        repos.forEach((repo) => {
          if (repo.language) {
            languages[repo.language] = (languages[repo.language] || 0) + 1;
          }
        });

        // Calculate activity patterns
        const activityByMonth: { [key: string]: number } = {};
        repos.forEach((repo) => {
          const pushDate = new Date(repo.pushed_at);
          const monthKey = `${pushDate.getFullYear()}-${String(
            pushDate.getMonth() + 1
          ).padStart(2, '0')}`;
          activityByMonth[monthKey] = (activityByMonth[monthKey] || 0) + 1;
        });

        // Sort languages by frequency
        const topLanguages = Object.entries(languages)
          .sort(([, a], [, b]) => b - a)
          .map(([language]) => language);

        // Determine most active periods
        const activityEntries = Object.entries(activityByMonth).sort(
          ([dateA], [dateB]) => dateA.localeCompare(dateB)
        );

        const activityTrend =
          activityEntries.length > 1
            ? activityEntries.slice(-3).map(([, count]) => count)
            : [];

        // Calculate total stars
        const totalStars = repos.reduce(
          (sum, repo) => sum + repo.stargazers_count,
          0
        );

        // Calculate days since last activity
        const lastPush = new Date(
          Math.max(...repos.map((repo) => new Date(repo.pushed_at).getTime()))
        );
        const daysSinceLastActivity = Math.floor(
          (new Date().getTime() - lastPush.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Try to use AI for real analysis
        const prompt = `Analyze this GitHub developer profile and provide detailed insights:

Developer: ${user.name || user.login} (@${user.login})
Bio: ${user.bio || 'No bio provided'}
Followers: ${user.followers}, Following: ${user.following}
Public Repos: ${user.public_repos}
Account Created: ${new Date(user.created_at).toLocaleDateString()}

Repository Summary:
- Total Repositories: ${repos.length}
- Total Stars: ${totalStars}
- Top Languages: ${topLanguages.slice(0, 3).join(', ')}
- Days Since Last Activity: ${daysSinceLastActivity}
- Account Age: ${Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365))} years

Recent Projects:
${repoData.slice(0, 5).map(repo => `- ${repo.name}: ${repo.description || 'No description'} (${repo.language}, ${repo.stars} stars)`).join('\n')}

Please provide a comprehensive analysis covering:
1. **Technical Expertise**: Primary languages, frameworks, and specializations
2. **Project Quality**: Code quality, project complexity, and innovation
3. **Activity Patterns**: Consistency, productivity, and development style
4. **Community Impact**: Open source contributions, community engagement
5. **Career Insights**: Professional level, growth trajectory, recommendations
6. **Strengths & Areas for Growth**: Key skills and improvement suggestions

Format your response with clear sections and actionable insights. Be specific and data-driven.`;

        const aiResponse = await callAI({
          prompt,
          maxTokens: 1500,
          temperature: 0.7
        });

        if (aiResponse.success) {
          setAnalysis(aiResponse.content);
        } else {
          // Fallback to pattern-based analysis if AI fails
          let fallbackAnalysis = '';

          // Language expertise
          if (topLanguages.length > 0) {
            fallbackAnalysis += `**Language Expertise**: ${
              topLanguages[0]
            } appears to be ${
              user.name || user.login
            }'s primary programming language, `;

            if (topLanguages.length > 1) {
              fallbackAnalysis += `with proficiency in ${topLanguages
                .slice(1, 3)
                .join(', ')}`;
              if (topLanguages.length > 3) {
                fallbackAnalysis += ` and other languages`;
              }
            }

            fallbackAnalysis += '.\n\n';
          }

          // Activity assessment
          if (daysSinceLastActivity <= 7) {
            fallbackAnalysis +=
              '**Activity Level**: Very active developer with recent contributions.\n\n';
          } else if (daysSinceLastActivity <= 30) {
            fallbackAnalysis +=
              '**Activity Level**: Moderately active developer with contributions this month.\n\n';
          } else if (daysSinceLastActivity <= 90) {
            fallbackAnalysis +=
              '**Activity Level**: Occasionally active developer with contributions in the past quarter.\n\n';
          } else {
            fallbackAnalysis +=
              '**Activity Level**: Less active recently, with the last contribution some time ago.\n\n';
          }

          // Summary
          fallbackAnalysis += '**Summary**: ';

          if (totalStars > 50) {
            fallbackAnalysis += `An impactful developer with ${totalStars}+ stars across their projects. `;
          } else if (totalStars > 10) {
            fallbackAnalysis += `A developer with growing recognition (${totalStars} stars). `;
          } else {
            fallbackAnalysis += `A developer focused on personal or specialized projects. `;
          }

          if (daysSinceLastActivity <= 30) {
            fallbackAnalysis += `Currently active on GitHub. `;
          }

          if (topLanguages.length > 0) {
            fallbackAnalysis += `Shows strongest skills in ${topLanguages[0]}. `;
          }

          setAnalysis(fallbackAnalysis);
        }
      } catch (error) {
        console.error('Error generating AI analysis:', error);
        setError('Failed to generate AI insights');
      } finally {
        setLoading(false);
      }
    };

    if (user && repos.length > 0) {
      generateAnalysis();
    }
  }, [user, repos]);

  return (
    <div className='card'>
      {loading ? (
        <div className='py-8 flex items-center justify-center'>
          <div className='flex flex-col items-center'>
            <div className='relative'>
              <div className='animate-spin h-8 w-8 border-2 border-[var(--primary)] rounded-full border-t-transparent'></div>
              <div className='absolute inset-0 m-auto w-1.5 h-1.5 bg-[var(--primary)] rounded-full'></div>
            </div>
            <p className='text-[var(--text-secondary)] mt-4'>
              Analyzing developer profile...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className='text-red-400 py-4'>{error}</div>
      ) : (
        <div className='space-y-6'>
          {analysis.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('**')) {
              const [title, content] = paragraph.split('**: ');
              return (
                <div
                  key={index}
                  className='bg-[var(--background)] border border-[var(--card-border)] rounded-md p-4 hover:border-[var(--primary)] hover:border-opacity-30 transition-all duration-300 relative group'
                >
                  <h3 className='text-lg font-medium text-[var(--primary)] mb-2'>
                    {title.replace(/\*\*/g, '')}
                  </h3>
                  <p className='text-[var(--text-secondary)] text-sm leading-relaxed'>
                    {content}
                  </p>
                  <div className='absolute right-4 top-4 w-1.5 h-1.5 rounded-full bg-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity'></div>
                </div>
              );
            }
            return (
              <p key={index} className='text-[var(--text-secondary)]'>
                {paragraph}
              </p>
            );
          })}
        </div>
      )}

      <div className='mt-6 pt-4 border-t border-[var(--card-border)] text-xs text-[var(--text-secondary)] opacity-70'>
        <p>
          This analysis is generated using AI based on public GitHub data and
          provides general insights about the developer profile.
        </p>
      </div>
    </div>
  );
}
