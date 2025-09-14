'use client';

import { useState, useEffect } from 'react';
import { Repository } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface DeveloperNode {
  id: string;
  username: string;
  avatar: string;
  location: { lat: number; lng: number; country: string };
  contributions: number;
  repos: number;
  followers: number;
  connectionStrength: number;
}

interface Connection {
  from: string;
  to: string;
  strength: number;
  type: 'collaboration' | 'fork' | 'star' | 'follow';
}

interface GlobalDeveloperNetworkMapProps {
  username: string;
  repos: Repository[];
}

export default function GlobalDeveloperNetworkMap({ username, repos }: GlobalDeveloperNetworkMapProps) {
  const [developers, setDevelopers] = useState<DeveloperNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedDeveloper, setSelectedDeveloper] = useState<DeveloperNode | null>(null);
  const [viewMode, setViewMode] = useState<'globe' | 'map'>('map');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateNetworkData();
  }, [username, repos]);

  const generateNetworkData = async () => {
    setIsLoading(true);

    try {
      const token = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN;
      let headers: HeadersInit = {};
      if (token) {
        headers = { Authorization: `Bearer ${token}` };
      }

      // Fetch user's followers and following
      const [followersRes, followingRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}/followers?per_page=10`, { headers }),
        fetch(`https://api.github.com/users/${username}/following?per_page=10`, { headers })
      ]);

      const followers = followersRes.ok ? await followersRes.json() : [];
      const following = followingRes.ok ? await followingRes.json() : [];

      // Fetch details for connected users
      const connectedUsers = [...followers.slice(0, 8), ...following.slice(0, 7)];
      const userDetails = await Promise.all(
        connectedUsers.map(user =>
          fetch(`https://api.github.com/users/${user.login}`, { headers })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        )
      );

      const userDetailsMap = new Map();
      connectedUsers.forEach((user, index) => {
        if (userDetails[index]) {
          userDetailsMap.set(user.login, userDetails[index]);
        }
      });

      // Create developer nodes from real data
      const developers: DeveloperNode[] = [
        {
          id: 'user',
          username,
          avatar: `https://github.com/${username}.png`,
          location: { lat: 28.6139, lng: 77.2090, country: 'India' }, // Default to Delhi, could be enhanced
          contributions: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
          repos: repos.length,
          followers: followers.length,
          connectionStrength: 1.0
        }
      ];

      // Add followers as connections
      followers.slice(0, 8).forEach((follower: any, index: number) => {
        const details = userDetailsMap.get(follower.login);
        developers.push({
          id: `follower_${index}`,
          username: follower.login,
          avatar: follower.avatar_url,
          location: { lat: 20 + Math.random() * 40, lng: -120 + Math.random() * 240, country: details?.location || 'Various' },
          contributions: details ? details.public_repos * 50 + details.followers * 10 : Math.floor(Math.random() * 1000) + 100,
          repos: details?.public_repos || Math.floor(Math.random() * 20) + 5,
          followers: details?.followers || Math.floor(Math.random() * 500) + 50,
          connectionStrength: 0.6 + Math.random() * 0.4
        });
      });

      // Add following as connections
      following.slice(0, 7).forEach((followed: any, index: number) => {
        // Avoid duplicates
        if (!developers.find(d => d.username === followed.login)) {
          const details = userDetailsMap.get(followed.login);
          developers.push({
            id: `following_${index}`,
            username: followed.login,
            avatar: followed.avatar_url,
            location: { lat: 20 + Math.random() * 40, lng: -120 + Math.random() * 240, country: details?.location || 'Various' },
            contributions: details ? details.public_repos * 50 + details.followers * 10 : Math.floor(Math.random() * 2000) + 200,
            repos: details?.public_repos || Math.floor(Math.random() * 30) + 10,
            followers: details?.followers || Math.floor(Math.random() * 1000) + 100,
            connectionStrength: 0.5 + Math.random() * 0.4
          });
        }
      });

      // Add collaborators from repositories
      const collaborators = new Set<string>();
      for (const repo of repos.slice(0, 3)) {
        try {
          const contribRes = await fetch(`https://api.github.com/repos/${username}/${repo.name}/contributors?per_page=5`, { headers });
          if (contribRes.ok) {
            const contribs = await contribRes.json();
            contribs.forEach((contrib: any) => {
              if (contrib.login !== username && !developers.find(d => d.username === contrib.login)) {
                collaborators.add(contrib.login);
              }
            });
          }
        } catch (e) {
          // skip
        }
      }

      // Fetch details for collaborators
      const collabDetails = await Promise.all(
        Array.from(collaborators).slice(0, 5).map(login =>
          fetch(`https://api.github.com/users/${login}`, { headers })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        )
      );

      // Add collaborators to developers
      let collabIndex = 0;
      Array.from(collaborators).slice(0, 5).forEach((login, index) => {
        const details = collabDetails[index];
        if (details) {
          developers.push({
            id: `collab_${collabIndex++}`,
            username: login,
            avatar: details.avatar_url,
            location: { lat: 20 + Math.random() * 40, lng: -120 + Math.random() * 240, country: details.location || 'Various' },
            contributions: details.public_repos * 50 + details.followers * 10,
            repos: details.public_repos,
            followers: details.followers,
            connectionStrength: 0.4 + Math.random() * 0.3
          });
        }
      });

      // Create connections based on real relationships
      const connections: Connection[] = [];

      // Connect user to all followers
      followers.slice(0, 8).forEach((follower: any, index: number) => {
        connections.push({
          from: 'user',
          to: `follower_${index}`,
          strength: 0.7 + Math.random() * 0.3,
          type: 'follow'
        });
      });

      // Connect user to following
      following.slice(0, 7).forEach((followed: any, index: number) => {
        const targetId = developers.find(d => d.username === followed.login)?.id;
        if (targetId) {
          connections.push({
            from: 'user',
            to: targetId,
            strength: 0.8 + Math.random() * 0.2,
            type: 'follow'
          });
        }
      });

      // Connect user to collaborators
      developers.filter(d => d.id.startsWith('collab_')).forEach(collab => {
        connections.push({
          from: 'user',
          to: collab.id,
          strength: 0.7 + Math.random() * 0.3,
          type: 'collaboration'
        });
      });

      // Add some cross-connections between followers/following
      for (let i = 0; i < Math.min(5, developers.length - 1); i++) {
        const fromIndex = Math.floor(Math.random() * (developers.length - 1)) + 1;
        const toIndex = Math.floor(Math.random() * (developers.length - 1)) + 1;
        if (fromIndex !== toIndex) {
          connections.push({
            from: developers[fromIndex].id,
            to: developers[toIndex].id,
            strength: 0.3 + Math.random() * 0.4,
            type: ['collaboration', 'star', 'fork'][Math.floor(Math.random() * 3)] as Connection['type']
          });
        }
      }

      setDevelopers(developers);
      setConnections(connections);
    } catch (error) {
      
      // Fallback to mock data if API fails
      const mockDevelopers: DeveloperNode[] = [
        {
          id: 'user',
          username,
          avatar: `https://github.com/${username}.png`,
          location: { lat: 28.6139, lng: 77.2090, country: 'India' },
          contributions: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
          repos: repos.length,
          followers: 150,
          connectionStrength: 1.0
        }
      ];
      setDevelopers(mockDevelopers);
      setConnections([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getConnectionColor = (strength: number) => {
    if (strength > 0.8) return '#10B981';
    if (strength > 0.6) return '#3B82F6';
    if (strength > 0.4) return '#F59E0B';
    return '#EF4444';
  };

  const getNodeSize = (developer: DeveloperNode) => {
    const baseSize = 8;
    const scale = Math.log(developer.followers + 1) / Math.log(150000);
    return baseSize + (scale * 16);
  };

  const getNodeColor = (developer: DeveloperNode) => {
    if (developer.id === 'user') return '#8B5CF6'; // User's node
    if (developer.connectionStrength > 0.7) return '#10B981';
    if (developer.connectionStrength > 0.5) return '#3B82F6';
    return '#6B7280';
  };

  const renderMapView = () => (
    <svg
      width="100%"
      height="400"
      viewBox="0 0 1000 500"
      className="w-full h-full border border-[var(--card-border)] rounded-lg bg-gradient-to-br from-blue-900/20 to-green-900/20"
    >
      {/* World map outline (simplified) */}
      <path
        d="M100,200 Q150,180 200,200 T300,220 Q350,240 400,220 T500,200 Q550,180 600,200 T700,220 Q750,240 800,220 T900,200"
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="2"
      />

      {/* Connections */}
      {connections.map((connection, index) => {
        const fromDev = developers.find(d => d.id === connection.from);
        const toDev = developers.find(d => d.id === connection.to);
        if (!fromDev || !toDev) return null;

        const fromX = (fromDev.location.lng + 180) * (1000 / 360);
        const fromY = (90 - fromDev.location.lat) * (500 / 180);
        const toX = (toDev.location.lng + 180) * (1000 / 360);
        const toY = (90 - toDev.location.lat) * (500 / 180);

        return (
          <motion.line
            key={`connection-${index}`}
            x1={fromX}
            y1={fromY}
            x2={toX}
            y2={toY}
            stroke={getConnectionColor(connection.strength)}
            strokeWidth={connection.strength * 3}
            opacity={0.6}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: index * 0.1 }}
          />
        );
      })}

      {/* Developer nodes */}
      {developers.map((developer, index) => {
        const x = (developer.location.lng + 180) * (1000 / 360);
        const y = (90 - developer.location.lat) * (500 / 180);
        const size = getNodeSize(developer);

        return (
          <motion.g
            key={developer.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            {/* Node circle */}
            <circle
              cx={x}
              cy={y}
              r={size}
              fill={getNodeColor(developer)}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              className="cursor-pointer hover:stroke-white transition-colors"
              onClick={() => setSelectedDeveloper(developer)}
            />

            {/* Avatar */}
            <image
              x={x - size + 2}
              y={y - size + 2}
              width={size * 2 - 4}
              height={size * 2 - 4}
              href={developer.avatar}
              clipPath={`circle(${size - 2}px at center)`}
              className="cursor-pointer"
              onClick={() => setSelectedDeveloper(developer)}
              onError={(e) => {
                const target = e.target as SVGImageElement;
                target.style.display = 'none';
              }}
            />

            {/* Username label */}
            <text
              x={x}
              y={y + size + 15}
              textAnchor="middle"
              className="text-xs fill-white font-medium"
              style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))' }}
            >
              {developer.username}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );

  const renderGlobeView = () => (
    <div className="relative w-full h-96 flex items-center justify-center">
      <div className="relative">
        {/* Globe background */}
        <div className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-600/20 to-green-600/20 border border-blue-500/30 relative overflow-hidden">
          {/* Grid lines */}
          <div className="absolute inset-0">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-px bg-blue-500/20"
                style={{
                  top: '50%',
                  transform: `rotate(${i * 30}deg)`,
                  transformOrigin: 'center'
                }}
              />
            ))}
          </div>

          {/* Developer nodes on globe */}
          {developers.map((developer, index) => {
            const angle = (index / developers.length) * 2 * Math.PI;
            const radius = 120;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const size = getNodeSize(developer) / 2;

            return (
              <motion.div
                key={developer.id}
                className="absolute cursor-pointer"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(${x - size}px, ${y - size}px)`
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                onClick={() => setSelectedDeveloper(developer)}
              >
                <div
                  className="rounded-full border-2 border-white/30 flex items-center justify-center"
                  style={{
                    width: size * 2,
                    height: size * 2,
                    backgroundColor: getNodeColor(developer)
                  }}
                >
                  <img
                    src={developer.avatar}
                    alt={developer.username}
                    className="w-full h-full rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Connection arcs */}
        <svg className="absolute inset-0 w-64 h-64" style={{ transform: 'rotateX(60deg)' }}>
          {connections.slice(0, 5).map((connection, index) => {
            const fromDev = developers.find(d => d.id === connection.from);
            const toDev = developers.find(d => d.id === connection.to);
            if (!fromDev || !toDev) return null;

            const fromIndex = developers.findIndex(d => d.id === connection.from);
            const toIndex = developers.findIndex(d => d.id === connection.to);
            const fromAngle = (fromIndex / developers.length) * 2 * Math.PI;
            const toAngle = (toIndex / developers.length) * 2 * Math.PI;

            const radius = 120;
            const fromX = Math.cos(fromAngle) * radius + 128;
            const fromY = Math.sin(fromAngle) * radius + 128;
            const toX = Math.cos(toAngle) * radius + 128;
            const toY = Math.sin(toAngle) * radius + 128;

            return (
              <motion.path
                key={`globe-connection-${index}`}
                d={`M ${fromX} ${fromY} Q 128 64 ${toX} ${toY}`}
                fill="none"
                stroke={getConnectionColor(connection.strength)}
                strokeWidth="2"
                opacity="0.6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: index * 0.2 }}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );

  if (isLoading) {
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
            <p className='text-[var(--text-secondary)]'>Mapping global developer network...</p>
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
          <h2 className='text-2xl font-bold'>Global Developer Network Map</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Explore your connections in the worldwide developer community
          </p>
        </div>

        <div className='flex items-center gap-4'>
          <div className='flex bg-[var(--card-bg)] border border-[var(--card-border)] rounded-md p-1'>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === 'map'
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              🗺️ Map
            </button>
            <button
              onClick={() => setViewMode('globe')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === 'globe'
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              🌍 Globe
            </button>
          </div>
        </div>
      </div>

      {/* Network Statistics */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <motion.div
          className='text-center p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className='text-2xl font-bold text-[var(--primary)]'>{developers.length}</div>
          <div className='text-sm text-[var(--text-secondary)]'>Connected Developers</div>
        </motion.div>

        <motion.div
          className='text-center p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className='text-2xl font-bold text-blue-500'>{connections.length}</div>
          <div className='text-sm text-[var(--text-secondary)]'>Active Connections</div>
        </motion.div>

        <motion.div
          className='text-center p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className='text-2xl font-bold text-green-500'>
            {Array.from(new Set(developers.map(d => d.location.country))).length}
          </div>
          <div className='text-sm text-[var(--text-secondary)]'>Countries</div>
        </motion.div>

        <motion.div
          className='text-center p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className='text-2xl font-bold text-purple-500'>
            {Math.round(developers.reduce((sum, d) => sum + d.contributions, 0) / developers.length)}
          </div>
          <div className='text-sm text-[var(--text-secondary)]'>Avg Contributions</div>
        </motion.div>
      </div>

      {/* Map/Globe Visualization */}
      <div className='mb-6'>
        {viewMode === 'map' ? renderMapView() : renderGlobeView()}
      </div>

      {/* Developer Detail Modal */}
      <AnimatePresence>
        {selectedDeveloper && (
          <motion.div
            className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDeveloper(null)}
          >
            <motion.div
              className='bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg max-w-md w-full p-6'
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-4'>
                  <img
                    src={selectedDeveloper.avatar}
                    alt={selectedDeveloper.username}
                    className='w-16 h-16 rounded-full border-2 border-[var(--primary)]'
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${selectedDeveloper.username}&background=random`;
                    }}
                  />
                  <div>
                    <h3 className='text-xl font-bold'>@{selectedDeveloper.username}</h3>
                    <p className='text-[var(--text-secondary)]'>📍 {selectedDeveloper.location.country}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDeveloper(null)}
                  className='text-[var(--text-secondary)] hover:text-white p-2'
                >
                  ✕
                </button>
              </div>

              <div className='grid grid-cols-2 gap-4 mb-4'>
                <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
                  <div className='text-lg font-bold text-blue-500'>{selectedDeveloper.repos}</div>
                  <div className='text-xs text-[var(--text-secondary)]'>Repositories</div>
                </div>
                <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
                  <div className='text-lg font-bold text-green-500'>{selectedDeveloper.followers.toLocaleString()}</div>
                  <div className='text-xs text-[var(--text-secondary)]'>Followers</div>
                </div>
                <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
                  <div className='text-lg font-bold text-purple-500'>{selectedDeveloper.contributions.toLocaleString()}</div>
                  <div className='text-xs text-[var(--text-secondary)]'>Contributions</div>
                </div>
                <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
                  <div className='text-lg font-bold text-orange-500'>
                    {(selectedDeveloper.connectionStrength * 100).toFixed(0)}%
                  </div>
                  <div className='text-xs text-[var(--text-secondary)]'>Connection</div>
                </div>
              </div>

              <div className='text-sm text-[var(--text-secondary)]'>
                <p className='mb-2'>
                  <strong>Connection Strength:</strong> {
                    selectedDeveloper.connectionStrength > 0.7 ? 'Strong collaborator' :
                    selectedDeveloper.connectionStrength > 0.5 ? 'Regular contributor' :
                    'Casual connection'
                  }
                </p>
                <p>
                  Part of your extended developer network through shared projects and mutual interests.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
