// app/[username]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { GitHubUser, Repository } from '@/types';
import { createGitHubHeaders } from '@/lib/githubToken';
import { motion } from 'framer-motion';
import SEOHead from '@/components/SEOHead';

// Organized component imports
import {
  // UI Components
  SideNav,
  ThemeCustomizer,
  VisitorCounter,

  // Profile Components
  AboutMeWithReadme,
  AchievementBadges,

  // Project Components
  FeaturedProjects,
  ProjectShowcase,
  RandomProjectSpotlight,
  PDFExport,

  // Analytics Components
  AnalyticsDashboard,
  PortfolioAnalytics,
  CodeReviewAnalytics,
  DeveloperProductivityTracker,
  ProjectRecommendationEngine,
  GitHubInsightsDashboard,
  AutomatedPortfolioSEOOptimizer,
  APIFallbackDashboard,
  PerformanceMonitoringDashboard,

  // Interactive Components
  InteractiveResumeBuilder,
  CodePlayground,
  LiveCodingAnimation,
  BlogSection,
  CodeSnippetShowcase,
  CodeSnippetManager,
  LiveCodeExecutionEnvironment,
  CollaborativeCodePlayground,

  // AI Components
  AICareerPathPredictor,
  AICodeDreamGenerator,
  AIPoweredCodeReviewAssistant,
  SmartProjectRecommendationEngine,
  NeuralCodeDreamWeaver,
  AIPortfolioAssistant,
  InterviewPreparationModule,

  // Visualization Components
  TechStackVisualization,
  GitHubActivityHeatmap,
  ContributionTimeline,
  CollaboratorNetwork,
  TechnologyTrendAnalysis,
  ProjectImpactCalculator,
  GitHubProfileComparison,
  RepositoryHealthScore,
  CodingLanguageJourney,
  OpenSourceContributionMap,
  DeveloperAchievementTimeline,
  ProjectCollaborationInsights,
  QuantumCodeEntanglementVisualizer,
  TimeCrystalCommitAnalysis,
  MultiUniverseCareerSimulator,
  NeuralNetworkPortfolioMorphing,
  BlockchainVerifiedSkillNFTs,
  QuantumComputingAlgorithmVisualizer,
  AIConsciousnessCodeEditor,
  BioFeedbackDevelopmentTracker,
  HolographicCodeArchitecture,
  RealTimeGitHubLiveStream,
  GlobalDeveloperNetworkMap,
  LiveCodingSessionRecorder,
  RealTimeTechStackHealthMonitor,
  InteractiveSkillAssessmentPlatform,
  GitHubStreakCounter,
  CodeQualityMetrics,

  // Astral Components
  // AstralPortfolioNavigation, // Moved to separate import

  // Culinary Components
  CulinaryCodeFlavorProfiling,

  // Weather Components
  WeatherPatternPortfolioAdaptation,

  // Olfactory Components
  OlfactoryMemoryPalaceConstructor,

  // Dream Components
  DreamJournalPortfolioIntegration,

  // Bio-Rhythm Components
  BioRhythmPortfolioSynchronization,

  // Sonic Components
  SonicMeditationPortfolioEnvironment,

  // Crystal Components
  CrystalEnergyPortfolioAlignment,

  // Taste Components
  TasteBudCodeTasteProfiling,

  // Chakra Components
  ChakraPortfolioEnergyBalancing
} from '@/components';
import { AstralPortfolioNavigation } from '@/components/astral';
import {
  PortfolioStarForge,
  BlackHolePortfolio,
  MagneticPortfolioFields,
  PortfolioBlackHole,
  PortfolioCircusDimension,
  PortfolioDreamWeaver,
  PortfolioEcosystemEngine,
  PortfolioEmotionCanvas,
  PortfolioMagneticFields,
  PortfolioTimeCrystal,
  PortfolioVirusEvolution,
  PortfolioWeatherSystems,
  TimeCrystalPortfolio
} from '@/components/revolutionary';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [userData, setUserData] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [pinnedRepos, setPinnedRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [filterSort, setFilterSort] = useState<string>('stars');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Function to download resume
  const downloadResume = () => {
    if (!userData) return;

    const resumeContent = `
${userData.name || userData.login}
${userData.location || 'Developer'}
${userData.bio || ''}

Contact:
- GitHub: ${userData.html_url}
${userData.email ? `- Email: ${userData.email}` : ''}
${userData.blog ? `- Website: ${userData.blog}` : ''}
${userData.twitter_username ? `- Twitter: @${userData.twitter_username}` : ''}

Stats:
- Repositories: ${userData.public_repos}
- Followers: ${userData.followers}
- Following: ${userData.following}
- Joined: ${new Date(userData.created_at).toLocaleDateString()}

Skills: ${skills.join(', ')}

Top Projects:
${repos.slice(0, 5).map(repo => `- ${repo.name}: ${repo.description || 'No description'}`).join('\n')}
    `.trim();

    const blob = new Blob([resumeContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${userData.login}-resume.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get unique languages for filter
  const languages = Array.from(new Set(repos.map(repo => repo.language).filter((lang): lang is string => Boolean(lang))));

  // Filter and sort repos
  const filteredRepos = repos
    .filter(repo =>
      (filterLanguage === 'all' || repo.language === filterLanguage) &&
      (searchTerm === '' || repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .sort((a, b) => {
      switch (filterSort) {
        case 'stars':
          return b.stargazers_count - a.stargazers_count;
        case 'forks':
          return b.forks_count - a.forks_count;
        case 'recent':
          return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  // Check for token in localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('github_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Fetch GitHub profile data when component mounts or token changes
  useEffect(() => {
    const fetchGitHubProfile = async () => {
      if (!username) return;

      setLoading(true);
      setError('');

      try {
        // Fetch user profile data
        const userResponse = await fetch(
          `https://api.github.com/users/${username}`,
          {
            method: 'GET',
            headers: createGitHubHeaders()
          }
        );

        if (!userResponse.ok) {
          if (userResponse.status === 404) {
            throw new Error(`GitHub user "${username}" not found. Please check the username and try again.`);
          } else if (userResponse.status === 403) {
            const resetTime = userResponse.headers.get('X-RateLimit-Reset');
            const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : null;
            const resetMessage = resetDate ? ` (resets at ${resetDate.toLocaleTimeString()})` : '';
            throw new Error(`GitHub API rate limit exceeded. Please try again later${resetMessage}.`);
          } else if (userResponse.status === 500 || userResponse.status === 502 || userResponse.status === 503) {
            throw new Error('GitHub API is temporarily unavailable. Please try again later.');
          } else if (userResponse.status === 422) {
            throw new Error('Invalid username format. Please check and try again.');
          } else {
            throw new Error(`Failed to fetch user data (${userResponse.status}: ${userResponse.statusText})`);
          }
        }

        const userData = await userResponse.json();
        setUserData(userData);

        // Fetch repositories
        const reposResponse = await fetch(
          `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`,
          {
            method: 'GET',
            headers: createGitHubHeaders()
          }
        );

        let reposData: Repository[] = [];
        if (!reposResponse.ok) {
          if (reposResponse.status === 404) {
            setRepos([]);
          } else if (reposResponse.status === 403) {
            setRepos([]);
          } else {
            setRepos([]);
          }
        } else {
          reposData = await reposResponse.json();
          setRepos(reposData);
        }

        // Fetch pinned repositories using GraphQL (with our GitHub token)
        try {
          const query = {
            query: `
              query {
                user(login: "${username}") {
                  pinnedItems(first: 6, types: REPOSITORY) {
                    nodes {
                      ... on Repository {
                        name
                        description
                        url
                        stargazerCount
                        forkCount
                        primaryLanguage {
                          name
                          color
                        }
                        repositoryTopics(first: 5) {
                          nodes {
                            topic {
                              name
                            }
                          }
                        }
                        owner {
                          login
                          avatarUrl
                        }
                      }
                    }
                  }
                }
              }
            `,
          };

          // Use a GitHub token - either from localStorage or a hardcoded one for demos
          const token =
            localStorage.getItem('github_token') ||
            process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN;

          const res = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(query),
          });

          const graphqlData = await res.json();
          const pinnedItems = graphqlData?.data?.user?.pinnedItems?.nodes || [];

          // Convert GraphQL data format to match our Repository type
          const formattedPinnedRepos = pinnedItems.map((item: any) => {
            // Create topic array from the GraphQL response
            const topics = item.repositoryTopics.nodes.map(
              (node: any) => node.topic.name
            );

            // Get homepage URL if available from the repository (for live demo links)
            let homepage = null;

            // Try to fetch additional details for this repository to get accurate dates and homepage
            // This is a bit more complex but provides better data
            let repoDetails = reposData.find(
              (repo: any) => repo.name === item.name
            );

            return {
              id: item.name, // Use name as ID since we don't have the actual ID
              name: item.name,
              full_name: `${item.owner.login}/${item.name}`,
              html_url: item.url,
              description: item.description,
              fork: false, // We don't have this info from the GraphQL response
              language: item.primaryLanguage?.name || null,
              stargazers_count: item.stargazerCount,
              forks_count: item.forkCount,
              topics: topics,
              owner: {
                login: item.owner.login,
                avatar_url: item.owner.avatarUrl,
                html_url: `https://github.com/${item.owner.login}`,
                id: 0, // Placeholder as we don't have this from GraphQL
              },
              // Use data from repoDetails if available, otherwise use fallbacks
              created_at: repoDetails?.created_at || new Date().toISOString(),
              updated_at: repoDetails?.updated_at || new Date().toISOString(),
              pushed_at: repoDetails?.pushed_at || new Date().toISOString(),
              homepage: repoDetails?.homepage || null, // For live demo links
              size: 0,
              watchers_count: 0,
              open_issues_count: 0,
              license: null,
              visibility: '',
              default_branch: '',
            };
          });

          // Set pinned repos state
          setPinnedRepos(formattedPinnedRepos);
        } catch (error) {
          // Fallback: Just use regular repos sorted by stars
          const fallbackRepos = [...reposData]
            .filter((repo) => !repo.fork)
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 6);
          setPinnedRepos(fallbackRepos);
        }

        // Extract skills from languages
        const languages = new Set<string>();
        reposData.forEach((repo: Repository) => {
          if (repo.language) {
            languages.add(repo.language);
          }
        });
        setSkills(Array.from(languages).slice(0, 6));
      } catch (error) {
        if (error instanceof Error) {
          setError(`Error: ${error.message}`);
        } else {
          setError(
            'Error fetching GitHub profile. Please check the username and try again.'
          );
        }
        setUserData(null);
        setRepos([]);
        setPinnedRepos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubProfile();
  }, [username, token]);

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <div className='relative w-16 h-16'>
          <div className='absolute inset-0 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin'></div>
          <div className='absolute inset-0 m-auto w-2 h-2 bg-[var(--primary)] rounded-full'></div>
        </div>
        <h2 className='text-xl font-bold mt-8 mb-2 font-mono'>
          Creating your portfolio...
        </h2>
        <p className='text-[var(--text-secondary)] max-w-md text-center'>
          We&apos;re fetching your GitHub data and crafting a beautiful developer
          portfolio.
        </p>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className='flex flex-col items-center justify-center h-screen text-center px-4'>
        <div className='w-16 h-16 bg-[var(--card-bg)] flex items-center justify-center rounded-full border border-[var(--card-border)] mb-6'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-8 w-8 text-[var(--primary)]'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </div>

        <h2 className='text-3xl font-bold mb-4 font-mono'>Profile Not Found</h2>

        <p className='text-xl mb-6 text-[var(--text-secondary)]'>
          We couldn&apos;t find a GitHub profile for &quot;
          <span className='text-[var(--primary)]'>{username}</span>&quot;.
        </p>

        <p className='mb-8 text-[var(--text-secondary)] max-w-md'>
          Please check that you&apos;ve entered a valid GitHub username or try again
          later.
        </p>

        <div className='flex gap-4'>
          <Link
            href='/'
            className='bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white px-6 py-3 rounded-md transition-colors font-medium'
          >
            Back to Home
          </Link>

          {/* Debug Info */}
          <details className='text-xs text-[var(--text-secondary)]'>
            <summary className='cursor-pointer hover:text-[var(--primary)]'>Debug Info</summary>
            <div className='mt-2 p-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-md max-w-md'>
              <p><strong>Username:</strong> {username}</p>
              <p><strong>Error:</strong> {error}</p>
              <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
              <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent : 'Server'}</p>
            </div>
          </details>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        username={username}
        avatar={userData.avatar_url}
        bio={userData.bio || undefined}
        skills={skills}
        projects={userData.public_repos}
        followers={userData.followers}
        stars={repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)}
      />
      <SideNav username={username} />

      <div className='flex flex-col items-center pt-12 pb-32 relative'>
        {/* Date indicator */}
        <motion.div
          className='date-marker top-8 right-0'
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {new Date().toISOString().split('T')[0]}
        </motion.div>

        {/* Profile Header */}
        <motion.div
          className='flex flex-col items-center mb-16 relative'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className='w-32 h-32 rounded-full overflow-hidden border-2 border-[var(--primary)] p-1 mb-6 relative'
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Image
              src={userData.avatar_url}
              alt={userData.name || userData.login}
              fill
              sizes="(max-width: 768px) 128px, 128px"
              priority
              className='rounded-full object-cover'
            />
            <motion.div
              className='absolute -z-10 w-40 h-40 bg-[var(--primary)] opacity-20 blur-xl'
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            ></motion.div>
          </motion.div>

          <motion.h1
            className='text-4xl font-bold mb-2 title-gradient'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {userData.name || userData.login}
          </motion.h1>

          <motion.div
            className='font-mono text-[var(--text-secondary)] mb-6 flex items-center'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <span>@{userData.login}</span>
            <span className='mx-2 text-xs'>•</span>
            <span className='text-sm'>
              {userData.location && (
                <span className='flex items-center'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 mr-1'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                    />
                  </svg>
                  {userData.location}
                </span>
              )}
            </span>
          </motion.div>

          {userData.bio && (
            <motion.p
              className='text-[var(--text-secondary)] text-center max-w-md mb-8'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {userData.bio}
            </motion.p>
          )}

          <motion.div
            className='flex space-x-4 mb-6'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {/* Link buttons with hover effects */}
            <a
              href={userData.html_url}
              target='_blank'
              rel='noopener noreferrer'
              className='bg-[var(--card-bg)] hover:bg-[var(--primary)] hover:text-white border border-[var(--card-border)] w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22'></path>
              </svg>
            </a>

            {userData.blog && (
              <a
                href={
                  userData.blog.startsWith('http')
                    ? userData.blog
                    : `https://${userData.blog}`
                }
                target='_blank'
                rel='noopener noreferrer'
                className='bg-[var(--card-bg)] hover:bg-[var(--primary)] hover:text-white border border-[var(--card-border)] w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'></path>
                  <path d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'></path>
                </svg>
              </a>
            )}

            {userData.twitter_username && (
              <a
                href={`https://twitter.com/${userData.twitter_username}`}
                target='_blank'
                rel='noopener noreferrer'
                className='bg-[var(--card-bg)] hover:bg-[var(--primary)] hover:text-white border border-[var(--card-border)] w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z'></path>
                </svg>
              </a>
            )}

            <motion.button
              onClick={downloadResume}
              className='bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white px-4 py-2 rounded-md transition-colors text-sm font-medium'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.5 }}
            >
              Download Resume
            </motion.button>
          </motion.div>

          {/* Stats display */}
          <motion.div
            className='grid grid-cols-4 gap-6 mt-2'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className='text-center'>
              <p className='text-2xl font-bold text-[var(--primary)]'>
                {userData.public_repos}
              </p>
              <p className='text-sm text-[var(--text-secondary)]'>
                Repositories
              </p>
            </div>

            <div className='text-center'>
              <p className='text-2xl font-bold text-[var(--primary)]'>
                {userData.followers}
              </p>
              <p className='text-sm text-[var(--text-secondary)]'>Followers</p>
            </div>

            <div className='text-center'>
              <p className='text-2xl font-bold text-[var(--primary)]'>
                {userData.following}
              </p>
              <p className='text-sm text-[var(--text-secondary)]'>Following</p>
            </div>

            <div className='text-center'>
              <p className='text-2xl font-bold text-[var(--primary)]'>
                {(() => {
                  const createdDate = new Date(userData.created_at);
                  const currentDate = new Date();
                  const years = currentDate.getFullYear() - createdDate.getFullYear();
                  return years;
                })()}
              </p>
              <p className='text-sm text-[var(--text-secondary)]'>Years</p>
            </div>
          </motion.div>

          {skills.length > 0 && (
            <motion.div
              className='flex flex-wrap justify-center gap-2 mt-8'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              {skills.map((skill, index) => (
                <motion.span
                  key={skill}
                  className='px-3 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-full text-xs'
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.05, duration: 0.3 }}
                >
                  {skill}
                </motion.span>
              ))}
            </motion.div>
          )}

          {/* Index marker */}
          <motion.div
            className='absolute -right-4 top-0 text-xs font-mono text-[var(--text-secondary)] opacity-70'
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            #01
          </motion.div>
        </motion.div>

        {/* Contribution Graph - Hidden as requested */}
        {/* AI Analysis - Hidden as requested */}

        {/* Featured Projects Section */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.5 }}
        >
          <h2 className='section-heading'>Featured Projects</h2>

          {/* Filter Controls */}
          <motion.div
            className='flex flex-wrap gap-4 mb-6'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            <div className='flex items-center gap-2'>
              <span className='text-sm text-[var(--text-secondary)]'>Search:</span>
              <input
                type='text'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder='Search projects...'
                className='bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] px-3 py-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
              />
            </div>

            <div className='flex items-center gap-2'>
              <span className='text-sm text-[var(--text-secondary)]'>Language:</span>
              <select
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
                className='bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] px-3 py-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
              >
                <option value='all'>All</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div className='flex items-center gap-2'>
              <span className='text-sm text-[var(--text-secondary)]'>Sort by:</span>
              <select
                value={filterSort}
                onChange={(e) => setFilterSort(e.target.value)}
                className='bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] px-3 py-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
              >
                <option value='stars'>Stars</option>
                <option value='forks'>Forks</option>
                <option value='recent'>Recent</option>
                <option value='name'>Name</option>
              </select>
            </div>
          </motion.div>

          {repos.length === 0 ? (
            <motion.div
              className='card text-center py-16'
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className='w-20 h-20 mx-auto mb-6 bg-[var(--background)] rounded-full flex items-center justify-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-10 w-10 text-[var(--text-secondary)]'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1.5}
                    d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1.5}
                    d='M12 11v6m-3-3h6'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-bold mb-4'>No Repositories Found</h3>
              <p className='text-[var(--text-secondary)] mb-6 max-w-md mx-auto'>
                This GitHub profile doesn&apos;t have any public repositories yet.
                Start creating projects to showcase your skills!
              </p>
              <a
                href={`https://github.com/new`}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-dark)] transition-colors'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 mr-2'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                  />
                </svg>
                Create New Repository
              </a>
            </motion.div>
          ) : pinnedRepos.length === 0 ? (
            <>
              <motion.div
                className='mb-4 flex justify-between items-center'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className='text-[var(--text-secondary)] italic'>
                  No pinned repositories found. Showing most active projects.
                </p>
                <a
                  href={`https://github.com/${username}?tab=repositories`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-[var(--primary)] hover:underline text-sm flex items-center'
                >
                  <span>View all repositories</span>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4 ml-1'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z'
                      clipRule='evenodd'
                    />
                  </svg>
                </a>
              </motion.div>
              <FeaturedProjects
                repos={filteredRepos
                  .filter((repo) => !repo.fork)
                  .slice(0, 4)}
              />
            </>
          ) : (
            <FeaturedProjects repos={filteredRepos.slice(0, 6)} />
          )}
        </motion.div>

        {/* Analytics Dashboard */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          <AnalyticsDashboard
            username={username}
            repos={repos}
            user={userData}
          />
        </motion.div>

        {/* Astral Portfolio Navigation */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.5 }}
        >
          <AstralPortfolioNavigation username={username} repos={repos} />
        </motion.div>

        {/* Culinary Code Flavor Profiling */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <CulinaryCodeFlavorProfiling username={username} repos={repos} />
        </motion.div>

        {/* Weather Pattern Portfolio Adaptation */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.25, duration: 0.5 }}
        >
          <WeatherPatternPortfolioAdaptation username={username} repos={repos} />
        </motion.div>

        {/* Olfactory Memory Palace Constructor */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          <OlfactoryMemoryPalaceConstructor username={username} repos={repos} />
        </motion.div>

        {/* Dream Journal Portfolio Integration */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35, duration: 0.5 }}
        >
          <DreamJournalPortfolioIntegration username={username} repos={repos} />
        </motion.div>

        {/* Bio-Rhythm Portfolio Synchronization */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          <BioRhythmPortfolioSynchronization username={username} repos={repos} />
        </motion.div>

        {/* Sonic Meditation Portfolio Environment */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.45, duration: 0.5 }}
        >
          <SonicMeditationPortfolioEnvironment username={username} repos={repos} />
        </motion.div>

        {/* Crystal Energy Portfolio Alignment */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <CrystalEnergyPortfolioAlignment username={username} repos={repos} />
        </motion.div>

        {/* Taste Bud Code Taste Profiling */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.55, duration: 0.5 }}
        >
          <TasteBudCodeTasteProfiling username={username} repos={repos} />
        </motion.div>

        {/* Chakra Portfolio Energy Balancing */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.5 }}
        >
          <ChakraPortfolioEnergyBalancing username={username} repos={repos} />
        </motion.div>

        {/* Performance Monitoring Dashboard */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.5 }}
        >
          <PerformanceMonitoringDashboard
            username={username}
            repos={repos}
          />
        </motion.div>

        {/* Code Review Analytics */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <CodeReviewAnalytics username={username} repos={repos} />
        </motion.div>

        {/* Collaborator Network */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          <CollaboratorNetwork username={username} repos={repos} />
        </motion.div>

        {/* Technology Trend Analysis */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          <TechnologyTrendAnalysis username={username} repos={repos} />
        </motion.div>

        {/* Project Impact Calculator */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <ProjectImpactCalculator username={username} repos={repos} />
        </motion.div>

        {/* GitHub Insights Dashboard */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.5 }}
        >
          <GitHubInsightsDashboard username={username} repos={repos} user={userData} />
        </motion.div>

        {/* Code Quality Metrics */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 0.5 }}
        >
          <CodeQualityMetrics username={username} repos={repos} />
        </motion.div>

        {/* Developer Productivity Tracker */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.5 }}
        >
          <DeveloperProductivityTracker username={username} repos={repos} />
        </motion.div>

        {/* Project Recommendation Engine */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9, duration: 0.5 }}
        >
          <ProjectRecommendationEngine username={username} repos={repos} user={userData} />
        </motion.div>

        {/* GitHub Profile Comparison */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.5 }}
        >
          <GitHubProfileComparison username={username} repos={repos} />
        </motion.div>

        {/* Repository Health Score */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.1, duration: 0.5 }}
        >
          <RepositoryHealthScore username={username} repos={repos} />
        </motion.div>

        {/* Coding Language Journey */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.5 }}
        >
          <CodingLanguageJourney username={username} repos={repos} />
        </motion.div>

        {/* Open Source Contribution Map */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.3, duration: 0.5 }}
        >
          <OpenSourceContributionMap username={username} repos={repos} />
        </motion.div>

        {/* Developer Achievement Timeline */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, duration: 0.5 }}
        >
          <DeveloperAchievementTimeline username={username} repos={repos} />
        </motion.div>

        {/* Project Collaboration Insights */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.5 }}
        >
          <ProjectCollaborationInsights username={username} repos={repos} />
        </motion.div>

        {/* Portfolio Star Forge */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <PortfolioStarForge username={username} />
        </motion.div>

        {/* Black Hole Portfolio */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.25, duration: 0.5 }}
        >
          <BlackHolePortfolio username={username} />
        </motion.div>

        {/* Magnetic Portfolio Fields */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          <MagneticPortfolioFields username={username} />
        </motion.div>

        {/* Portfolio Black Hole */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35, duration: 0.5 }}
        >
          <PortfolioBlackHole username={username} />
        </motion.div>

        {/* Portfolio Circus Dimension */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          <PortfolioCircusDimension username={username} />
        </motion.div>

        {/* Portfolio Dream Weaver */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.45, duration: 0.5 }}
        >
          <PortfolioDreamWeaver username={username} />
        </motion.div>

        {/* Portfolio Ecosystem Engine */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <PortfolioEcosystemEngine username={username} />
        </motion.div>

        {/* Portfolio Emotion Canvas */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.55, duration: 0.5 }}
        >
          <PortfolioEmotionCanvas username={username} />
        </motion.div>

        {/* Portfolio Magnetic Fields */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.5 }}
        >
          <PortfolioMagneticFields username={username} />
        </motion.div>

        {/* Portfolio Time Crystal */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.65, duration: 0.5 }}
        >
          <PortfolioTimeCrystal username={username} />
        </motion.div>

        {/* Portfolio Virus Evolution */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 0.5 }}
        >
          <PortfolioVirusEvolution username={username} />
        </motion.div>

        {/* Portfolio Weather Systems */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.75, duration: 0.5 }}
        >
          <PortfolioWeatherSystems username={username} />
        </motion.div>

        {/* Time Crystal Portfolio */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.5 }}
        >
          <TimeCrystalPortfolio username={username} />
        </motion.div>

        {/* Portfolio Analytics */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.25, duration: 0.5 }}
        >
          <PortfolioAnalytics />
        </motion.div>

        {/* Tech Stack Visualization */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <TechStackVisualization repos={repos} />
        </motion.div>

        {/* Achievement Badges */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          <AchievementBadges user={userData} repos={repos} />
        </motion.div>

        {/* Random Project Spotlight */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          <RandomProjectSpotlight repos={repos} username={username} />
        </motion.div>

        {/* GitHub Streak Counter */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <GitHubStreakCounter username={username} />
        </motion.div>

        {/* Live Coding Animation */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.5 }}
        >
          <LiveCodingAnimation />
        </motion.div>

        {/* Blog Section */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 0.5 }}
        >
          <BlogSection />
        </motion.div>

        {/* Code Snippet Showcase */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.5 }}
        >
          <CodeSnippetShowcase username={username} repos={repos} />
        </motion.div>

        {/* Code Snippet Manager */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.85, duration: 0.5 }}
        >
          <CodeSnippetManager username={username} repos={repos} />
        </motion.div>

        {/* PDF Export */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9, duration: 0.5 }}
        >
          <PDFExport user={userData} repos={repos} />
        </motion.div>

        {/* Theme Customizer */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.5 }}
        >
          <ThemeCustomizer />
        </motion.div>

        {/* GitHub Activity Heatmap */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.1, duration: 0.5 }}
        >
          <GitHubActivityHeatmap username={username} />
        </motion.div>

        {/* Contribution Timeline */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.5 }}
        >
          <ContributionTimeline username={username} />
        </motion.div>

        {/* Project Showcase */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.5 }}
        >
          <ProjectShowcase repos={repos} username={username} />
        </motion.div>

        {/* Interactive Resume Builder */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.3, duration: 0.5 }}
        >
          <InteractiveResumeBuilder />
        </motion.div>

        {/* Code Playground */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, duration: 0.5 }}
        >
          <CodePlayground />
        </motion.div>

        {/* Live Code Execution Environment */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.45, duration: 0.5 }}
        >
          <LiveCodeExecutionEnvironment username={username} repos={repos} />
        </motion.div>

        {/* Quantum Code Entanglement Visualizer */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.5 }}
        >
          <QuantumCodeEntanglementVisualizer username={username} repos={repos} />
        </motion.div>

        {/* Time Crystal Commit Analysis */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.6, duration: 0.5 }}
        >
          <TimeCrystalCommitAnalysis username={username} />
        </motion.div>

        {/* AI Code Dream Generator */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.7, duration: 0.5 }}
        >
          <AICodeDreamGenerator username={username} repos={repos} />
        </motion.div>

        {/* Multi-Universe Career Simulator */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.8, duration: 0.5 }}
        >
          <MultiUniverseCareerSimulator username={username} user={userData} repos={repos} />
        </motion.div>

        {/* Neural Network Portfolio Morphing */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.9, duration: 0.5 }}
        >
          <NeuralNetworkPortfolioMorphing username={username} />
        </motion.div>

        {/* Blockchain-Verified Skill NFTs */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.0, duration: 0.5 }}
        >
          <BlockchainVerifiedSkillNFTs username={username} user={userData} repos={repos} />
        </motion.div>

        {/* Quantum Computing Algorithm Visualizer */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.1, duration: 0.5 }}
        >
          <QuantumComputingAlgorithmVisualizer />
        </motion.div>

        {/* AI Consciousness Code Editor */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.2, duration: 0.5 }}
        >
          <AIConsciousnessCodeEditor />
        </motion.div>

        {/* Bio-Feedback Development Tracker */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.3, duration: 0.5 }}
        >
          <BioFeedbackDevelopmentTracker />
        </motion.div>

        {/* Holographic Code Architecture */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.4, duration: 0.5 }}
        >
          <HolographicCodeArchitecture />
        </motion.div>

        {/* Real-Time GitHub Live Stream */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.5, duration: 0.5 }}
        >
          <RealTimeGitHubLiveStream username={username} />
        </motion.div>

        {/* AI-Powered Code Review Assistant */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.6, duration: 0.5 }}
        >
          <AIPoweredCodeReviewAssistant username={username} repos={repos} />
        </motion.div>

        {/* Global Developer Network Map */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.7, duration: 0.5 }}
        >
          <GlobalDeveloperNetworkMap username={username} repos={repos} />
        </motion.div>

        {/* Smart Project Recommendation Engine */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.8, duration: 0.5 }}
        >
          <SmartProjectRecommendationEngine username={username} repos={repos} />
        </motion.div>

        {/* Live Coding Session Recorder */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.9, duration: 0.5 }}
        >
          <LiveCodingSessionRecorder />
        </motion.div>

        {/* Automated Portfolio SEO Optimizer */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4.0, duration: 0.5 }}
        >
          <AutomatedPortfolioSEOOptimizer username={username} repos={repos} />
        </motion.div>

        {/* Collaborative Code Playground */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4.1, duration: 0.5 }}
        >
          <CollaborativeCodePlayground />
        </motion.div>

        {/* AI Career Path Predictor */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4.2, duration: 0.5 }}
        >
          <AICareerPathPredictor username={username} repos={repos} />
        </motion.div>

        {/* AI Interview Preparation Module */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4.25, duration: 0.5 }}
        >
          <InterviewPreparationModule username={username} repos={repos} user={userData} />
        </motion.div>

        {/* Neural Code Dream Weaver */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4.6, duration: 0.5 }}
        >
          <NeuralCodeDreamWeaver username={username} repos={repos} />
        </motion.div>

        {/* Real-Time Tech Stack Health Monitor */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4.3, duration: 0.5 }}
        >
          <RealTimeTechStackHealthMonitor username={username} repos={repos} />
        </motion.div>

        {/* Interactive Skill Assessment Platform */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4.4, duration: 0.5 }}
        >
          <InteractiveSkillAssessmentPlatform username={username} />
        </motion.div>

        {/* API Fallback Dashboard */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4.5, duration: 0.5 }}
        >
          <APIFallbackDashboard />
        </motion.div>

        {/* About Me Section with GitHub README.md support */}
        <motion.div
          className='w-full mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.3, duration: 0.5 }}
        >
          <h2 className='section-heading'>About Me</h2>
          <AboutMeWithReadme
            username={username}
            user={userData}
            token={token}
          />
        </motion.div>
      </div>

      {/* AI Portfolio Assistant */}
      <AIPortfolioAssistant username={username} />

      {/* Visitor Counter with Real GitHub Data */}
      <VisitorCounter username={username} repos={repos} />
    </>
  );
}
