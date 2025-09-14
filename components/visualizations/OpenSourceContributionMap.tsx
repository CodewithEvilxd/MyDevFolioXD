'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, Treemap } from 'recharts';

interface Contribution {
  id: string;
  repository: string;
  organization: string;
  type: 'commit' | 'pull_request' | 'issue' | 'review' | 'discussion';
  date: string;
  impact: number;
  language: string;
  stars: number;
  description: string;
}

interface Organization {
  name: string;
  contributions: number;
  repositories: number;
  impact: number;
  color: string;
}

interface ContributionStats {
  totalContributions: number;
  organizations: number;
  repositories: number;
  totalImpact: number;
  mostActiveMonth: string;
  topLanguage: string;
  averageImpact: number;
}

interface OpenSourceContributionMapProps {
  username: string;
  repos: any[];
}

export default function OpenSourceContributionMap({ username, repos }: OpenSourceContributionMapProps) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [stats, setStats] = useState<ContributionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'commits' | 'prs' | 'issues'>('all');
  const [monthData, setMonthData] = useState<any[]>([]);

  useEffect(() => {
    const analyzeContributions = async () => {
      setLoading(true);

      try {
        const token = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN;
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Fetch user events
        const eventsRes = await fetch(`https://api.github.com/users/${username}/events?per_page=100`, { headers });
        if (!eventsRes.ok) {
          if (eventsRes.status === 404) {
            
            setContributions([]);
            setOrganizations([]);
            setStats(null);
            setMonthData([]);
            setLoading(false);
            return;
          }
          throw new Error(`Failed to fetch events: ${eventsRes.status}`);
        }

        let events: any[] = [];
        try {
          const responseText = await eventsRes.text();
          if (responseText.trim() === '') {
            
            setContributions([]);
            setOrganizations([]);
            setStats(null);
            setMonthData([]);
            setLoading(false);
            return;
          }
          events = JSON.parse(responseText);
        } catch (parseError) {
          
          setContributions([]);
          setOrganizations([]);
          setStats(null);
          setMonthData([]);
          setLoading(false);
          return;
        }

        if (!Array.isArray(events)) {
          
          setContributions([]);
          setOrganizations([]);
          setStats(null);
          setMonthData([]);
          setLoading(false);
          return;
        }

        // Process events
        const contributions: Contribution[] = [];
        const orgMap = new Map<string, { contributions: number, repos: Set<string>, impact: number, color: string }>();
        const repoSet = new Set<string>();
        const monthMap = new Map<string, { contributions: number, impact: number }>();

        events.forEach((event: any) => {
          const repoFull = event.repo.name;
          const [org, repo] = repoFull.split('/');
          repoSet.add(repoFull);
          const type = mapEventType(event.type);
          if (!type) return;
          const date = event.created_at;
          const month = new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          const impact = calculateImpact(event, type);
          contributions.push({
            id: event.id,
            repository: repo,
            organization: org,
            type,
            date,
            impact,
            language: '',
            stars: 0,
            description: getEventDescription(event, type)
          });

          if (!orgMap.has(org)) {
            orgMap.set(org, { contributions: 0, repos: new Set(), impact: 0, color: getOrgColor(org) });
          }
          const orgData = orgMap.get(org)!;
          orgData.contributions++;
          orgData.repos.add(repo);
          orgData.impact += impact;

          if (!monthMap.has(month)) {
            monthMap.set(month, { contributions: 0, impact: 0 });
          }
          monthMap.get(month)!.contributions++;
          monthMap.get(month)!.impact += impact;
        });

        // Fetch repo details
        const repoDetails = new Map<string, { language: string, stars: number }>();
        for (const repoFull of Array.from(repoSet).slice(0, 20)) { // Limit to 20 to avoid rate limits
          try {
            const repoRes = await fetch(`https://api.github.com/repos/${repoFull}`, { headers });
            if (repoRes.ok) {
              let repoData: any;
              try {
                const responseText = await repoRes.text();
                if (responseText.trim() === '') {
                  
                  continue;
                }
                repoData = JSON.parse(responseText);
              } catch (parseError) {
                
                continue;
              }
              repoDetails.set(repoFull, { language: repoData.language || 'Unknown', stars: repoData.stargazers_count || 0 });
            } else if (repoRes.status === 404) {
              
            } else {
              
            }
          } catch (e) {
            
          }
        }

        // Update contributions
        contributions.forEach(contrib => {
          const repoFull = `${contrib.organization}/${contrib.repository}`;
          const details = repoDetails.get(repoFull);
          if (details) {
            contrib.language = details.language;
            contrib.stars = details.stars;
          }
        });

        // Create organizations
        const organizations: Organization[] = Array.from(orgMap.entries()).map(([name, data]) => ({
          name,
          contributions: data.contributions,
          repositories: data.repos.size,
          impact: data.impact,
          color: data.color
        })).sort((a, b) => b.impact - a.impact);

        // Stats
        const totalContributions = contributions.length;
        const totalImpact = contributions.reduce((sum, c) => sum + c.impact, 0);
        const averageImpact = totalContributions > 0 ? Math.round(totalImpact / totalContributions) : 0;
        const stats: ContributionStats = {
          totalContributions,
          organizations: organizations.length,
          repositories: repoSet.size,
          totalImpact,
          mostActiveMonth: Array.from(monthMap.entries()).sort((a, b) => b[1].contributions - a[1].contributions)[0]?.[0] || '',
          topLanguage: getTopLanguage(contributions),
          averageImpact
        };

        // Month data
        const sortedMonths = Array.from(monthMap.entries())
          .map(([month, data]) => ({ month, ...data }))
          .sort((a, b) => new Date(a.month + ' 1').getTime() - new Date(b.month + ' 1').getTime());
        setMonthData(sortedMonths);

        // Sort contributions by date desc
        contributions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setContributions(contributions);
        setOrganizations(organizations);
        setStats(stats);
      } catch (error) {
        
        // Fallback to empty
        setContributions([]);
        setOrganizations([]);
        setStats(null);
        setMonthData([]);
      } finally {
        setLoading(false);
      }
    };

    analyzeContributions();
  }, [username, repos]);

  const mapEventType = (type: string) => {
    switch (type) {
      case 'PushEvent': return 'commit';
      case 'PullRequestEvent': return 'pull_request';
      case 'IssuesEvent': return 'issue';
      case 'IssueCommentEvent': return 'discussion';
      case 'PullRequestReviewEvent': return 'review';
      default: return null;
    }
  };

  const calculateImpact = (event: any, type: string) => {
    let base = 10;
    if (type === 'pull_request') base = 20;
    if (type === 'issue') base = 15;
    if (type === 'review') base = 12;
    return base;
  };

  const getEventDescription = (event: any, type: string) => {
    switch (type) {
      case 'commit': return `Pushed ${event.payload.commits?.length || 1} commits`;
      case 'pull_request': return event.payload.pull_request?.title || 'Pull request';
      case 'issue': return event.payload.issue?.title || 'Issue';
      case 'review': return 'Reviewed pull request';
      case 'discussion': return 'Commented on issue';
      default: return 'Contribution';
    }
  };

  const getOrgColor = (org: string) => {
    let hash = 0;
    for (let i = 0; i < org.length; i++) {
      hash = org.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - color.length) + color;
  };

  const getTopLanguage = (contributions: Contribution[]) => {
    const langMap = new Map<string, number>();
    contributions.forEach(c => {
      if (c.language) langMap.set(c.language, (langMap.get(c.language) || 0) + 1);
    });
    return Array.from(langMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
  };

  const getFilteredContributions = () => {
    if (filterType === 'all') return contributions;
    if (filterType === 'commits') return contributions.filter(c => c.type === 'commit');
    if (filterType === 'prs') return contributions.filter(c => c.type === 'pull_request');
    if (filterType === 'issues') return contributions.filter(c => c.type === 'issue');
    return contributions;
  };

  const getContributionTypeData = () => [
    { name: 'Pull Requests', value: contributions.filter(c => c.type === 'pull_request').length, color: '#10B981' },
    { name: 'Commits', value: contributions.filter(c => c.type === 'commit').length, color: '#3B82F6' },
    { name: 'Issues', value: contributions.filter(c => c.type === 'issue').length, color: '#F59E0B' },
    { name: 'Reviews', value: contributions.filter(c => c.type === 'review').length, color: '#8B5CF6' },
    { name: 'Discussions', value: contributions.filter(c => c.type === 'discussion').length, color: '#EF4444' }
  ];

  const getOrganizationImpactData = () => {
    return organizations.map(org => ({
      name: org.name,
      impact: org.impact,
      contributions: org.contributions,
      repositories: org.repositories
    }));
  };

  const getLanguageDistribution = () => {
    const languageMap = new Map<string, number>();
    contributions.forEach(contrib => {
      const current = languageMap.get(contrib.language) || 0;
      languageMap.set(contrib.language, current + 1);
    });

    return Array.from(languageMap.entries()).map(([language, count]) => ({
      name: language,
      value: count,
      color: getLanguageColor(language)
    }));
  };

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      'JavaScript': '#F7DF1E',
      'TypeScript': '#3178C6',
      'Python': '#3776AB',
      'Go': '#00ADD8',
      'Rust': '#000000',
      'C': '#A8B9CC'
    };
    return colors[language] || '#6B7280';
  };

  const getImpactVsStarsData = () => {
    return contributions.map(contrib => ({
      impact: contrib.impact,
      stars: contrib.stars / 1000, // Convert to K for better visualization
      repository: contrib.repository,
      organization: contrib.organization
    }));
  };

  const getContributionTimelineData = () => monthData;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'commit': return '💾';
      case 'pull_request': return '🔀';
      case 'issue': return '🐛';
      case 'review': return '👁️';
      case 'discussion': return '💬';
      default: return '📝';
    }
  };

  const getImpactColor = (impact: number) => {
    if (impact >= 90) return 'text-green-500 bg-green-500/20';
    if (impact >= 80) return 'text-blue-500 bg-blue-500/20';
    if (impact >= 70) return 'text-yellow-500 bg-yellow-500/20';
    return 'text-red-500 bg-red-500/20';
  };

  const getSelectedOrgData = () => {
    return organizations.find(org => org.name === selectedOrg);
  };

  if (loading) {
    return (
      <div className='card'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold'>Open Source Contribution Map</h2>
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

  const selectedOrgData = getSelectedOrgData();

  return (
    <motion.div
      className='card'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-bold'>Open Source Contribution Map</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Visualize your impact across the open source ecosystem
          </p>
        </div>

        {/* Filter Options */}
        <div className='flex bg-[var(--background)] rounded-lg p-1'>
          {[
            { id: 'all', label: 'All' },
            { id: 'commits', label: 'Commits' },
            { id: 'prs', label: 'PRs' },
            { id: 'issues', label: 'Issues' }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setFilterType(filter.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filterType === filter.id
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contribution Stats Overview */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <div className='text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20'>
          <p className='text-2xl font-bold text-blue-500'>{stats?.totalContributions}</p>
          <p className='text-sm text-[var(--text-secondary)]'>Total Contributions</p>
        </div>

        <div className='text-center p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg border border-green-500/20'>
          <p className='text-2xl font-bold text-green-500'>{stats?.organizations}</p>
          <p className='text-sm text-[var(--text-secondary)]'>Organizations</p>
        </div>

        <div className='text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/20'>
          <p className='text-2xl font-bold text-purple-500'>{stats?.totalImpact}</p>
          <p className='text-sm text-[var(--text-secondary)]'>Total Impact</p>
        </div>

        <div className='text-center p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-lg border border-orange-500/20'>
          <p className='text-2xl font-bold text-orange-500'>{stats?.averageImpact}</p>
          <p className='text-sm text-[var(--text-secondary)]'>Avg Impact</p>
        </div>
      </div>

      {/* Contribution Timeline */}
      <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)] mb-6'>
        <h3 className='text-lg font-semibold mb-4'>Contribution Timeline</h3>
        <ResponsiveContainer width='100%' height={250}>
          <BarChart data={getContributionTimelineData()}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='month' />
            <YAxis />
            <Tooltip />
            <Bar dataKey='contributions' fill='#8976EA' name='Contributions' />
            <Bar dataKey='impact' fill='#10B981' name='Impact Score' />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Contribution Types and Organizations */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
        <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
          <h3 className='text-lg font-semibold mb-4'>Contribution Types</h3>
          <ResponsiveContainer width='100%' height={200}>
            <PieChart>
              <Pie
                data={getContributionTypeData()}
                cx='50%'
                cy='50%'
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey='value'
              >
                {getContributionTypeData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
          <h3 className='text-lg font-semibold mb-4'>Organization Impact</h3>
          <ResponsiveContainer width='100%' height={200}>
            <BarChart data={getOrganizationImpactData()}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='name' />
              <YAxis />
              <Tooltip />
              <Bar dataKey='impact' fill='#F59E0B' name='Impact' />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Language Distribution */}
      <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)] mb-6'>
        <h3 className='text-lg font-semibold mb-4'>Language Distribution</h3>
        <ResponsiveContainer width='100%' height={200}>
          <PieChart>
            <Pie
              data={getLanguageDistribution()}
              cx='50%'
              cy='50%'
              innerRadius={30}
              outerRadius={70}
              paddingAngle={5}
              dataKey='value'
            >
              {getLanguageDistribution().map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Impact vs Popularity Scatter */}
      <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)] mb-6'>
        <h3 className='text-lg font-semibold mb-4'>Impact vs Repository Popularity</h3>
        <ResponsiveContainer width='100%' height={250}>
          <ScatterChart data={getImpactVsStarsData()}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='stars' name='Stars (K)' />
            <YAxis dataKey='impact' name='Impact Score' />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value, name) => [
                name === 'stars' ? `${value}K stars` : `${value} impact`,
                name === 'stars' ? 'Repository Stars' : 'Your Impact'
              ]}
              labelFormatter={(label) => `Repository: ${label}`}
            />
            <Scatter dataKey='impact' fill='#8976EA' />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Organization List */}
      <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)] mb-6'>
        <h3 className='text-lg font-semibold mb-4'>Organization Contributions</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {organizations.map((org, index) => (
            <motion.div
              key={org.name}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedOrg === org.name
                  ? 'border-[var(--primary)] bg-[var(--primary)] bg-opacity-5'
                  : 'border-[var(--card-border)] hover:border-[var(--primary)] hover:border-opacity-50'
              }`}
              onClick={() => setSelectedOrg(org.name)}
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-3'>
                  <div
                    className='w-4 h-4 rounded-full'
                    style={{ backgroundColor: org.color }}
                  ></div>
                  <h4 className='font-semibold capitalize'>{org.name}</h4>
                </div>

                <div className='text-right'>
                  <p className='text-lg font-bold'>{org.impact}</p>
                  <p className='text-xs text-[var(--text-secondary)]'>Impact</p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <p className='text-[var(--text-secondary)]'>Contributions</p>
                  <p className='font-medium'>{org.contributions}</p>
                </div>
                <div>
                  <p className='text-[var(--text-secondary)]'>Repositories</p>
                  <p className='font-medium'>{org.repositories}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className='mt-3'>
                <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
                  <div
                    className='h-2 rounded-full transition-all duration-1000'
                    style={{
                      width: `${(org.impact / Math.max(...organizations.map(o => o.impact))) * 100}%`,
                      backgroundColor: org.color
                    }}
                  ></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Contributions */}
      <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)] mb-6'>
        <h3 className='text-lg font-semibold mb-4'>Recent Contributions</h3>
        <div className='space-y-3'>
          {getFilteredContributions().slice(0, 8).map((contrib, index) => (
            <motion.div
              key={contrib.id}
              className='flex items-start gap-4 p-4 bg-[var(--card-bg)] rounded-lg'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className='text-2xl'>{getTypeIcon(contrib.type)}</div>
              <div className='flex-1'>
                <div className='flex items-center gap-2 mb-1'>
                  <h4 className='font-semibold'>{contrib.repository}</h4>
                  <span className='text-sm text-[var(--text-secondary)]'>•</span>
                  <span className='text-sm font-medium text-[var(--primary)] capitalize'>
                    {contrib.organization}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getImpactColor(contrib.impact)}`}>
                    {contrib.impact} impact
                  </span>
                </div>
                <p className='text-sm text-[var(--text-secondary)] mb-2'>{contrib.description}</p>
                <div className='flex items-center gap-4 text-xs text-[var(--text-secondary)]'>
                  <span>{contrib.language}</span>
                  <span>{contrib.stars.toLocaleString()} stars</span>
                  <span>{new Date(contrib.date).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contribution Insights */}
      <div className='bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 border border-green-500/20 rounded-lg p-6'>
        <h3 className='text-lg font-semibold mb-4'>Contribution Insights</h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='text-center'>
            <div className='text-3xl mb-2'>🎯</div>
            <h4 className='font-medium mb-1'>High Impact Focus</h4>
            <p className='text-sm text-[var(--text-secondary)]'>
              Your contributions have significant impact on major projects
            </p>
          </div>

          <div className='text-center'>
            <div className='text-3xl mb-2'>🌍</div>
            <h4 className='font-medium mb-1'>Global Reach</h4>
            <p className='text-sm text-[var(--text-secondary)]'>
              Contributing to projects used by millions worldwide
            </p>
          </div>

          <div className='text-center'>
            <div className='text-3xl mb-2'>📈</div>
            <h4 className='font-medium mb-1'>Growing Influence</h4>
            <p className='text-sm text-[var(--text-secondary)]'>
              Your open source contributions are increasing in impact
            </p>
          </div>
        </div>

        <div className='mt-4 p-3 bg-white/5 rounded-lg'>
          <p className='text-sm text-[var(--text-secondary)]'>
            <strong>Recommendation:</strong> Continue focusing on high-impact contributions to major projects.
            Your work is making a real difference in the open source community.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
