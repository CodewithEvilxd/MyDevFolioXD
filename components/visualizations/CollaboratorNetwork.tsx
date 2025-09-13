'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getGitHubToken } from '@/lib/githubToken';
import Image from 'next/image';

interface Collaborator {
  id: string;
  login: string;
  avatar_url: string;
  name?: string;
  contributions: number;
  repositories: string[];
  location?: string;
  company?: string;
  x?: number;
  y?: number;
}

interface Collaboration {
  source: string;
  target: string;
  weight: number;
  repositories: string[];
}

interface CollaboratorNetworkProps {
  username: string;
  repos: any[];
}

export default function CollaboratorNetwork({ username, repos }: CollaboratorNetworkProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
  const [networkView, setNetworkView] = useState<'overview' | 'detailed'>('overview');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchCollaboratorData = async () => {
      try {
        setLoading(true);
        if (!repos || repos.length === 0) {
          setCollaborators([]);
          setCollaborations([]);
          setLoading(false);
          return;
        }

        // Check if we have a GitHub token
        const token = getGitHubToken();

        // Fetch real contributor data from GitHub
        const contributorMap = new Map<string, Collaborator>();
        const collaborationMap = new Map<string, Collaboration>();

        // Process repositories in smaller batches to avoid rate limits
        const batchSize = 3; // Smaller batch size for better rate limit handling

        for (let i = 0; i < Math.min(repos.length, 10); i += batchSize) {
          const batch = repos.slice(i, i + batchSize);

          const batchPromises = batch.map(async (repo) => {
            try {
              const headers: Record<string, string> = {
                'Accept': 'application/vnd.github.v3+json'
              };

              if (token) {
                headers['Authorization'] = `token ${token}`;
              }

              const response = await fetch(
                `https://api.github.com/repos/${username}/${repo.name}/contributors?per_page=10`,
                { headers }
              );

              if (response.ok) {
                let contributors: any[] = [];
                try {
                  const responseText = await response.text();
                  if (responseText.trim() === '') {
                    return [];
                  }
                  contributors = JSON.parse(responseText);
                } catch (parseError) {
                  return [];
                }

                if (!Array.isArray(contributors)) {
                  return [];
                }

                return contributors;
              } else {
                return [];
              }
            } catch (error) {
              return [];
            }
          });

          const batchResults = await Promise.all(batchPromises);

          // Process batch results
          batchResults.forEach((contributors, batchIndex) => {
            const currentRepo = batch[batchIndex];
            contributors.forEach((contributor: any) => {
              if (contributor.login !== username) { // Exclude the main user
                const existing = contributorMap.get(contributor.login);

                if (existing) {
                  existing.contributions += contributor.contributions;
                  if (!existing.repositories.includes(currentRepo.name)) {
                    existing.repositories.push(currentRepo.name);
                  }
                } else {
                  contributorMap.set(contributor.login, {
                    id: contributor.id.toString(),
                    login: contributor.login,
                    avatar_url: contributor.avatar_url,
                    name: contributor.login, // Will be updated if we can fetch user data
                    contributions: contributor.contributions,
                    repositories: [currentRepo.name],
                    location: undefined,
                    company: undefined
                  });
                }
              }
            });
          });

          // Add delay between batches to respect rate limits
          if (i + batchSize < Math.min(repos.length, 10)) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
          }
        }

        // Fetch additional user details for collaborators
        const collaboratorsWithDetails = await Promise.all(
          Array.from(contributorMap.values()).map(async (collaborator) => {
            try {
              const userResponse = await fetch(
                `https://api.github.com/users/${collaborator.login}`,
                {
                  headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    ...(token ? { 'Authorization': `token ${token}` } : {})
                  }
                }
              );

              if (userResponse.ok) {
                const userData = await userResponse.json();
                return {
                  ...collaborator,
                  name: userData.name || collaborator.login,
                  location: userData.location,
                  company: userData.company
                };
              }
            } catch (error) {
              // Keep original data if fetch fails
            }
            return collaborator;
          })
        );

        // Create collaborations based on shared repositories
        const realCollaborations: Collaboration[] = [];
        for (let i = 0; i < collaboratorsWithDetails.length; i++) {
          for (let j = i + 1; j < collaboratorsWithDetails.length; j++) {
            const collab1 = collaboratorsWithDetails[i];
            const collab2 = collaboratorsWithDetails[j];

            const sharedRepos = collab1.repositories.filter(repo =>
              collab2.repositories.includes(repo)
            );

            if (sharedRepos.length > 0) {
              realCollaborations.push({
                source: collab1.login,
                target: collab2.login,
                weight: sharedRepos.length,
                repositories: sharedRepos
              });
            }
          }
        }

        // Set real data or fallback to sample data if no collaborators found
        if (collaboratorsWithDetails.length === 0) {
          // Fallback sample data for demonstration
          const sampleCollaborators: Collaborator[] = [
            {
              id: 'sample-1',
              login: 'octocat',
              avatar_url: 'https://github.com/images/error/octocat_happy.gif',
              name: 'The Octocat',
              contributions: 25,
              repositories: ['sample-repo-1', 'sample-repo-2'],
              location: 'San Francisco, CA',
              company: 'GitHub',
              x: 0,
              y: 0
            },
            {
              id: 'sample-2',
              login: 'torvalds',
              avatar_url: 'https://avatars.githubusercontent.com/u/1024025?v=4',
              name: 'Linus Torvalds',
              contributions: 18,
              repositories: ['sample-repo-1'],
              location: 'Portland, OR',
              company: 'Linux Foundation',
              x: 0,
              y: 0
            },
            {
              id: 'sample-3',
              login: 'gaearon',
              avatar_url: 'https://avatars.githubusercontent.com/u/810438?v=4',
              name: 'Dan Abramov',
              contributions: 12,
              repositories: ['sample-repo-2'],
              location: 'London, UK',
              company: 'Meta',
              x: 0,
              y: 0
            }
          ];

          const sampleCollaborations: Collaboration[] = [
            {
              source: 'octocat',
              target: 'torvalds',
              weight: 1,
              repositories: ['sample-repo-1']
            },
            {
              source: 'octocat',
              target: 'gaearon',
              weight: 1,
              repositories: ['sample-repo-2']
            }
          ];

          setCollaborators(sampleCollaborators);
          setCollaborations(sampleCollaborations);
        } else {
          setCollaborators(collaboratorsWithDetails);
          setCollaborations(realCollaborations);
        }

      } catch (err) {
        setCollaborators([]);
        setCollaborations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCollaboratorData();
  }, [username, repos]);

  const drawNetwork = useCallback((nodes: Collaborator[], edges: Collaboration[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 800;
    canvas.height = 400;

    // Clear canvas without setting background (let CSS handle it)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (nodes.length === 0) return;

    // Calculate node positions (simple circular layout)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 60;

    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI;
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
    });

    // Draw edges
    ctx.strokeStyle = 'rgba(135, 118, 234, 0.3)';
    ctx.lineWidth = 2;

    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.login === edge.source);
      const targetNode = nodes.find(n => n.login === edge.target);

      if (sourceNode && targetNode && sourceNode.x !== undefined && sourceNode.y !== undefined && targetNode.x !== undefined && targetNode.y !== undefined) {
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.stroke();

        // Draw edge weight indicator
        const midX = (sourceNode.x + targetNode.x) / 2;
        const midY = (sourceNode.y + targetNode.y) / 2;

        ctx.fillStyle = 'rgba(135, 118, 234, 0.8)';
        ctx.beginPath();
        ctx.arc(midX, midY, Math.max(2, edge.weight), 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      if (node.x === undefined || node.y === undefined) return;

      // Draw avatar background
      ctx.fillStyle = 'rgba(135, 118, 234, 0.2)';
      ctx.beginPath();
      ctx.arc(node.x, node.y, 25, 0, 2 * Math.PI);
      ctx.fill();

      // Draw avatar border
      ctx.strokeStyle = selectedCollaborator?.id === node.id ? '#8976EA' : 'rgba(135, 118, 234, 0.5)';
      ctx.lineWidth = selectedCollaborator?.id === node.id ? 3 : 2;
      ctx.stroke();

      // Draw avatar image (simplified as circle)
      ctx.fillStyle = '#8976EA';
      ctx.beginPath();
      ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
      ctx.fill();

      // Draw contribution count
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(node.contributions.toString(), node.x, node.y + 3);
    });
  }, [selectedCollaborator]);

  // Redraw network when data or view changes
  useEffect(() => {
    if (collaborators.length > 0 && !loading) {
      // Small delay to ensure canvas is ready
      const timeoutId = setTimeout(() => {
        drawNetwork(collaborators, collaborations);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [collaborators, collaborations, networkView, loading, drawNetwork]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked collaborator
    const clickedCollaborator = collaborators.find(collaborator => {
      if (!collaborator.x || !collaborator.y) return false;
      const distance = Math.sqrt((x - collaborator.x) ** 2 + (y - collaborator.y) ** 2);
      return distance <= 25;
    });

    setSelectedCollaborator(clickedCollaborator || null);
  };

  const getTopCollaborators = () => {
    return collaborators
      .sort((a, b) => b.contributions - a.contributions)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className='card'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold'>Collaborator Network</h2>
          <div className='w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin'></div>
        </div>
        <div className='animate-pulse'>
          <div className='h-96 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4'></div>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='h-20 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
            ))}
          </div>
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
          <h2 className='text-2xl font-bold'>Collaborator Network</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            {collaborators.length > 0
              ? `${collaborators.length} collaborators across ${collaborations.length} connections`
              : 'No collaborators found yet'
            }
          </p>
        </div>

        {/* View Toggle */}
        <div className='flex bg-[var(--background)] rounded-lg p-1'>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'detailed', label: 'Detailed' }
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setNetworkView(view.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                networkView === view.id
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Network Visualization */}
      <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)] mb-6'>
        {networkView === 'overview' ? (
          // Overview View - Basic network visualization
          collaborators.length > 0 ? (
            <>
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className='w-full h-96 cursor-pointer bg-transparent'
                style={{
                  maxWidth: '100%',
                  height: '400px',
                  backgroundColor: 'transparent'
                }}
              />
              <p className='text-xs text-[var(--text-secondary)] mt-2 text-center'>
                Click on any collaborator to view their details
              </p>
            </>
          ) : (
            <div className='w-full h-96 flex items-center justify-center text-center'>
              <div>
                <div className='w-16 h-16 mx-auto mb-4 bg-[var(--primary)] bg-opacity-20 rounded-full flex items-center justify-center'>
                  <svg className='w-8 h-8 text-[var(--primary)]' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                  </svg>
                </div>
                <h3 className='text-lg font-semibold mb-2'>No Collaborators Yet</h3>
                <p className='text-[var(--text-secondary)] text-sm'>
                  Start collaborating on GitHub repositories to build your network!
                </p>
              </div>
            </div>
          )
        ) : (
          // Detailed View - Enhanced network with more information
          <div className='space-y-4'>
            {collaborators.length > 0 ? (
              <>
                <div className='relative'>
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className='w-full h-96 cursor-pointer bg-transparent'
                    style={{
                      maxWidth: '100%',
                      height: '400px',
                      backgroundColor: 'transparent'
                    }}
                  />
                  <div className='absolute top-2 right-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm'>
                    Detailed View
                  </div>
                </div>

                {/* Detailed Statistics */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-4'>
                  <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
                    <div className='text-lg font-bold text-[var(--primary)]'>{collaborators.length}</div>
                    <div className='text-xs text-[var(--text-secondary)]'>Total Nodes</div>
                  </div>
                  <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
                    <div className='text-lg font-bold text-blue-500'>{collaborations.length}</div>
                    <div className='text-xs text-[var(--text-secondary)]'>Connections</div>
                  </div>
                  <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
                    <div className='text-lg font-bold text-green-500'>
                      {collaborators.reduce((sum, c) => sum + c.contributions, 0)}
                    </div>
                    <div className='text-xs text-[var(--text-secondary)]'>Total Contributions</div>
                  </div>
                  <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
                    <div className='text-lg font-bold text-purple-500'>
                      {collaborators.length > 1
                        ? Math.round((collaborations.length / (collaborators.length * (collaborators.length - 1) / 2)) * 100)
                        : 0}%
                    </div>
                    <div className='text-xs text-[var(--text-secondary)]'>Network Density</div>
                  </div>
                </div>

                <p className='text-xs text-[var(--text-secondary)] mt-2 text-center'>
                  Click on any collaborator node to view detailed information
                </p>
              </>
            ) : (
              <div className='w-full h-96 flex items-center justify-center text-center'>
                <div>
                  <div className='w-16 h-16 mx-auto mb-4 bg-[var(--primary)] bg-opacity-20 rounded-full flex items-center justify-center'>
                    <svg className='w-8 h-8 text-[var(--primary)]' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
                    </svg>
                  </div>
                  <h3 className='text-lg font-semibold mb-2'>No Collaborator Data Available</h3>
                  <p className='text-[var(--text-secondary)] text-sm'>
                    Switch to Overview view or collaborate on more repositories to see detailed network analysis.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Collaborator Details */}
      {selectedCollaborator && (
        <motion.div
          className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)] mb-6'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className='flex items-center gap-4'>
            <Image
              src={selectedCollaborator.avatar_url}
              alt={selectedCollaborator.name || selectedCollaborator.login}
              width={48}
              height={48}
              className='w-12 h-12 rounded-full'
            />
            <div className='flex-1'>
              <h3 className='font-semibold text-lg'>
                {selectedCollaborator.name || selectedCollaborator.login}
              </h3>
              <p className='text-[var(--text-secondary)] text-sm'>@{selectedCollaborator.login}</p>
              <div className='flex items-center gap-4 mt-2 text-sm'>
                <span className='flex items-center gap-1'>
                  <span className='text-blue-500'>📊</span>
                  {selectedCollaborator.contributions} contributions
                </span>
                {selectedCollaborator.location && (
                  <span className='flex items-center gap-1'>
                    <span className='text-green-500'>📍</span>
                    {selectedCollaborator.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className='mt-4'>
            <h4 className='font-medium mb-2'>Collaborated on:</h4>
            <div className='flex flex-wrap gap-2'>
              {selectedCollaborator.repositories.map(repo => (
                <span
                  key={repo}
                  className='px-3 py-1 bg-blue-500 bg-opacity-10 text-blue-600 dark:text-blue-400 border border-blue-500 border-opacity-30 rounded-full text-xs font-medium hover:bg-blue-500 hover:bg-opacity-20 transition-colors'
                >
                  {repo}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {networkView === 'overview' ? (
        // Overview View - Basic statistics and top collaborators
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
            <h3 className='text-lg font-semibold mb-4'>Top Collaborators</h3>
            <div className='space-y-3'>
              {collaborators.length > 0 ? (
                getTopCollaborators().map((collaborator, index) => (
                  <motion.div
                    key={collaborator.id}
                    className='flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--card-bg)] cursor-pointer'
                    onClick={() => setSelectedCollaborator(collaborator)}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className='flex items-center justify-center w-6 h-6 bg-[var(--primary)] text-white text-xs font-bold rounded-full'>
                      {index + 1}
                    </div>
                    <Image
                      src={collaborator.avatar_url}
                      alt={collaborator.name || collaborator.login}
                      width={32}
                      height={32}
                      className='w-8 h-8 rounded-full'
                    />
                    <div className='flex-1'>
                      <p className='font-medium text-sm'>
                        {collaborator.name || collaborator.login}
                      </p>
                      <p className='text-xs text-[var(--text-secondary)]'>
                        {collaborator.contributions} contributions
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className='text-center py-8'>
                  <div className='w-12 h-12 mx-auto mb-3 bg-[var(--primary)] bg-opacity-20 rounded-full flex items-center justify-center'>
                    <svg className='w-6 h-6 text-[var(--primary)]' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                    </svg>
                  </div>
                  <p className='text-[var(--text-secondary)] text-sm'>No collaborators yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Network Statistics */}
          <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
            <h3 className='text-lg font-semibold mb-4'>Network Statistics</h3>
            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-[var(--text-secondary)]'>Total Collaborators</span>
                <span className='font-semibold text-lg'>{collaborators.length}</span>
              </div>

              <div className='flex justify-between items-center'>
                <span className='text-sm text-[var(--text-secondary)]'>Active Connections</span>
                <span className='font-semibold text-lg'>{collaborations.length}</span>
              </div>

              <div className='flex justify-between items-center'>
                <span className='text-sm text-[var(--text-secondary)]'>Avg Contributions</span>
                <span className='font-semibold text-lg'>
                  {collaborators.length > 0
                    ? Math.round(collaborators.reduce((sum, c) => sum + c.contributions, 0) / collaborators.length)
                    : 0}
                </span>
              </div>

              <div className='flex justify-between items-center'>
                <span className='text-sm text-[var(--text-secondary)]'>Network Density</span>
                <span className='font-semibold text-lg'>
                  {collaborators.length > 1
                    ? Math.round((collaborations.length / (collaborators.length * (collaborators.length - 1) / 2)) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Detailed View - Advanced analytics and insights
        <div className='space-y-6'>
          {/* Collaboration Analysis */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
              <h4 className='font-semibold mb-2 text-blue-500'>Strongest Connections</h4>
              <div className='space-y-2'>
                {collaborations
                  .sort((a, b) => b.weight - a.weight)
                  .slice(0, 3)
                  .map((collab, index) => (
                    <div key={index} className='text-sm'>
                      <span className='font-medium'>{collab.source}</span>
                      <span className='text-[var(--text-secondary)]'> ↔ </span>
                      <span className='font-medium'>{collab.target}</span>
                      <div className='text-xs text-[var(--text-secondary)]'>
                        {collab.weight} shared project{collab.weight > 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                {collaborations.length === 0 && (
                  <p className='text-sm text-[var(--text-secondary)]'>No connections yet</p>
                )}
              </div>
            </div>

            <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
              <h4 className='font-semibold mb-2 text-green-500'>Most Active Collaborator</h4>
              <div className='flex items-center gap-3'>
                {collaborators.length > 0 ? (
                  <>
                    <Image
                      src={getTopCollaborators()[0]?.avatar_url}
                      alt={getTopCollaborators()[0]?.name || getTopCollaborators()[0]?.login}
                      width={40}
                      height={40}
                      className='w-10 h-10 rounded-full'
                    />
                    <div>
                      <p className='font-medium text-sm'>
                        {getTopCollaborators()[0]?.name || getTopCollaborators()[0]?.login}
                      </p>
                      <p className='text-xs text-[var(--text-secondary)]'>
                        {getTopCollaborators()[0]?.contributions} contributions
                      </p>
                    </div>
                  </>
                ) : (
                  <p className='text-sm text-[var(--text-secondary)]'>No collaborators yet</p>
                )}
              </div>
            </div>

            <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
              <h4 className='font-semibold mb-2 text-purple-500'>Network Health</h4>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>Connectivity:</span>
                  <span className='font-medium'>
                    {collaborators.length > 1
                      ? Math.round((collaborations.length / (collaborators.length * (collaborators.length - 1) / 2)) * 100)
                      : 0}%
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Growth Potential:</span>
                  <span className='font-medium text-green-500'>
                    {collaborators.length < 5 ? 'High' : collaborators.length < 10 ? 'Medium' : 'Low'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Repository Collaboration Matrix */}
          {collaborators.length > 0 && (
            <div className='bg-[var(--background)] p-4 rounded-lg border border-[var(--card-border)]'>
              <h4 className='font-semibold mb-4'>Repository Collaboration Matrix</h4>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-[var(--card-border)]'>
                      <th className='text-left py-2 px-3'>Collaborator</th>
                      <th className='text-center py-2 px-3'>Contributions</th>
                      <th className='text-center py-2 px-3'>Projects</th>
                      <th className='text-center py-2 px-3'>Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collaborators
                      .sort((a, b) => b.contributions - a.contributions)
                      .slice(0, 8)
                      .map((collaborator) => (
                        <tr key={collaborator.id} className='border-b border-[var(--card-border)] hover:bg-[var(--card-bg)]'>
                          <td className='py-2 px-3'>
                            <div className='flex items-center gap-2'>
                              <Image
                                src={collaborator.avatar_url}
                                alt={collaborator.name || collaborator.login}
                                width={24}
                                height={24}
                                className='w-6 h-6 rounded-full'
                              />
                              <span className='font-medium'>{collaborator.name || collaborator.login}</span>
                            </div>
                          </td>
                          <td className='text-center py-2 px-3'>{collaborator.contributions}</td>
                          <td className='text-center py-2 px-3'>{collaborator.repositories.length}</td>
                          <td className='text-center py-2 px-3'>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              collaborator.contributions > 50 ? 'bg-green-500/20 text-green-600' :
                              collaborator.contributions > 20 ? 'bg-yellow-500/20 text-yellow-600' :
                              'bg-gray-500/20 text-gray-600'
                            }`}>
                              {collaborator.contributions > 50 ? 'High' :
                               collaborator.contributions > 20 ? 'Medium' : 'Low'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className='mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--text-secondary)]'>
        <div className='flex items-center gap-2'>
          <div className='w-4 h-4 bg-[var(--primary)] bg-opacity-20 border-2 border-[var(--primary)] border-opacity-50 rounded-full'></div>
          <span>Collaborator Node</span>
        </div>

        <div className='flex items-center gap-2'>
          <div className='w-8 h-0.5 bg-[var(--primary)] bg-opacity-30'></div>
          <span>Collaboration Link</span>
        </div>

        <div className='flex items-center gap-2'>
          <div className='w-3 h-3 bg-[var(--primary)] bg-opacity-80 rounded-full'></div>
          <span>Collaboration Strength</span>
        </div>

        {networkView === 'detailed' && (
          <>
            <div className='flex items-center gap-2'>
              <div className='w-4 h-4 bg-blue-500 bg-opacity-20 border-2 border-blue-500 border-opacity-50 rounded-full'></div>
              <span>High Activity</span>
            </div>

            <div className='flex items-center gap-2'>
              <div className='w-4 h-4 bg-green-500 bg-opacity-20 border-2 border-green-500 border-opacity-50 rounded-full'></div>
              <span>Strong Connection</span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}