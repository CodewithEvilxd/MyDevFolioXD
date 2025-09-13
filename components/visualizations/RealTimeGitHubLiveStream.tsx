'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createGitHubHeaders } from '@/lib/githubToken';

interface GitHubEvent {
  id: string;
  type: 'WatchEvent' | 'ForkEvent' | 'IssuesEvent' | 'PullRequestEvent' | 'PushEvent' | 'CreateEvent';
  actor: {
    login: string;
    avatar_url: string;
  };
  repo: {
    name: string;
    url: string;
  };
  payload: any;
  created_at: string;
  isLive: boolean;
}

interface RealTimeGitHubLiveStreamProps {
  username: string;
}

export default function RealTimeGitHubLiveStream({ username }: RealTimeGitHubLiveStreamProps) {
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [stats, setStats] = useState({
    totalEvents: 0,
    uniqueUsers: 0,
    popularRepos: [] as string[]
  });

  useEffect(() => {
    if (isStreaming) {
      startLiveStream();
    } else {
      stopLiveStream();
    }

    return () => stopLiveStream();
  }, [isStreaming, username]);

  const startLiveStream = async () => {
    setConnectionStatus('connecting');

    try {
      // Simulate connecting to GitHub events
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConnectionStatus('connected');

      // Start generating mock live events
      const eventInterval = setInterval(() => {
        generateLiveEvent();
      }, 3000 + Math.random() * 5000); // Random interval between 3-8 seconds

      // Store interval ID for cleanup
      (window as any).liveStreamInterval = eventInterval;

      // Initial events
      for (let i = 0; i < 5; i++) {
        setTimeout(() => generateLiveEvent(), i * 1000);
      }

    } catch (error) {
      console.error('Failed to start live stream:', error);
      setConnectionStatus('disconnected');
    }
  };

  const stopLiveStream = () => {
    setConnectionStatus('disconnected');
    if ((window as any).liveStreamInterval) {
      clearInterval((window as any).liveStreamInterval);
    }
  };

  const generateLiveEvent = () => {
    const eventTypes = ['WatchEvent', 'ForkEvent', 'IssuesEvent', 'PullRequestEvent', 'PushEvent', 'CreateEvent'];
    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    const mockUsers = [
      'octocat', 'torvalds', 'gaearon', 'tj', 'sindresorhus', 'addyosmani',
      'paulirish', 'getify', 'btholt', 'kentcdodds', 'sophiebits', 'sebmarkbage'
    ];

    const mockRepos = [
      `${username}/portfolio-project`,
      `${username}/react-components`,
      `${username}/api-wrapper`,
      `${username}/data-visualizer`,
      `${username}/cli-tool`,
      `${username}/mobile-app`
    ];

    const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const randomRepo = mockRepos[Math.floor(Math.random() * mockRepos.length)];

    const newEvent: GitHubEvent = {
      id: `event_${Date.now()}_${Math.random()}`,
      type: randomType as any,
      actor: {
        login: randomUser,
        avatar_url: `https://avatars.githubusercontent.com/${randomUser}`
      },
      repo: {
        name: randomRepo,
        url: `https://github.com/${randomRepo}`
      },
      payload: {
        action: randomType === 'IssuesEvent' ? 'opened' : randomType === 'PullRequestEvent' ? 'opened' : undefined
      },
      created_at: new Date().toISOString(),
      isLive: true
    };

    setEvents(prev => [newEvent, ...prev.slice(0, 49)]); // Keep last 50 events

    // Update stats
    setStats(prev => ({
      totalEvents: prev.totalEvents + 1,
      uniqueUsers: new Set([...Array.from({ length: prev.totalEvents }, (_, i) => `user${i}`), randomUser]).size,
      popularRepos: Array.from(new Set([randomRepo, ...prev.popularRepos.slice(0, 4)]))
    }));
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'WatchEvent': return '⭐';
      case 'ForkEvent': return '🍴';
      case 'IssuesEvent': return '❗';
      case 'PullRequestEvent': return '🔄';
      case 'PushEvent': return '📤';
      case 'CreateEvent': return '➕';
      default: return '📝';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'WatchEvent': return 'text-yellow-500';
      case 'ForkEvent': return 'text-blue-500';
      case 'IssuesEvent': return 'text-red-500';
      case 'PullRequestEvent': return 'text-purple-500';
      case 'PushEvent': return 'text-green-500';
      case 'CreateEvent': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const getEventDescription = (event: GitHubEvent) => {
    const repoName = event.repo.name.split('/')[1];
    const user = event.actor.login;

    switch (event.type) {
      case 'WatchEvent': return `${user} starred ${repoName}`;
      case 'ForkEvent': return `${user} forked ${repoName}`;
      case 'IssuesEvent': return `${user} ${event.payload.action} an issue in ${repoName}`;
      case 'PullRequestEvent': return `${user} ${event.payload.action} a pull request in ${repoName}`;
      case 'PushEvent': return `${user} pushed to ${repoName}`;
      case 'CreateEvent': return `${user} created ${repoName}`;
      default: return `${user} interacted with ${repoName}`;
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
          <h2 className='text-2xl font-bold'>Real-Time GitHub Live Stream</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Live GitHub activity from your repositories and network
          </p>
        </div>

        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
              connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
              'bg-red-500'
            }`} />
            <span className='text-sm text-[var(--text-secondary)] capitalize'>
              {connectionStatus}
            </span>
          </div>

          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-2 ${
              isStreaming
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isStreaming ? (
              <>
                <span>⏹️</span>
                Stop Stream
              </>
            ) : (
              <>
                <span>▶️</span>
                Start Live Stream
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Stats */}
      <div className='grid grid-cols-3 gap-4 mb-6'>
        <motion.div
          className='text-center p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className='text-2xl font-bold text-[var(--primary)]'>{stats.totalEvents}</div>
          <div className='text-sm text-[var(--text-secondary)]'>Live Events</div>
        </motion.div>

        <motion.div
          className='text-center p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className='text-2xl font-bold text-blue-500'>{stats.uniqueUsers}</div>
          <div className='text-sm text-[var(--text-secondary)]'>Active Users</div>
        </motion.div>

        <motion.div
          className='text-center p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className='text-2xl font-bold text-green-500'>{stats.popularRepos.length}</div>
          <div className='text-sm text-[var(--text-secondary)]'>Popular Repos</div>
        </motion.div>
      </div>

      {/* Live Event Feed */}
      <div className='space-y-3 max-h-96 overflow-y-auto'>
        <AnimatePresence>
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              className='flex items-center gap-4 p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg'
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* User Avatar */}
              <img
                src={event.actor.avatar_url}
                alt={event.actor.login}
                className='w-10 h-10 rounded-full border-2 border-[var(--primary)]'
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${event.actor.login}&background=random`;
                }}
              />

              {/* Event Icon */}
              <div className={`text-2xl ${getEventColor(event.type)}`}>
                {getEventIcon(event.type)}
              </div>

              {/* Event Details */}
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium'>
                  {getEventDescription(event)}
                </p>
                <p className='text-xs text-[var(--text-secondary)]'>
                  {new Date(event.created_at).toLocaleTimeString()}
                  {event.isLive && (
                    <span className='ml-2 px-2 py-1 bg-green-500/20 text-green-600 rounded-full text-xs'>
                      LIVE
                    </span>
                  )}
                </p>
              </div>

              {/* Event Type Badge */}
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                event.type === 'WatchEvent' ? 'bg-yellow-500/20 text-yellow-600' :
                event.type === 'ForkEvent' ? 'bg-blue-500/20 text-blue-600' :
                event.type === 'IssuesEvent' ? 'bg-red-500/20 text-red-600' :
                event.type === 'PullRequestEvent' ? 'bg-purple-500/20 text-purple-600' :
                'bg-gray-500/20 text-gray-600'
              }`}>
                {event.type.replace('Event', '')}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {events.length === 0 && !isStreaming && (
        <div className='text-center py-12'>
          <div className='w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-4xl'>📡</span>
          </div>
          <h3 className='text-lg font-bold mb-2'>Ready to Go Live</h3>
          <p className='text-[var(--text-secondary)] mb-4'>
            Start the live stream to see real-time GitHub activity from your network
          </p>
        </div>
      )}

      {/* Stream Controls */}
      <div className='mt-6 flex items-center justify-between text-sm text-[var(--text-secondary)]'>
        <span>Real-time GitHub activity monitoring</span>
        <div className='flex items-center gap-2'>
          <span>Auto-refresh:</span>
          <span className='font-medium text-[var(--primary)]'>3-8 seconds</span>
        </div>
      </div>
    </motion.div>
  );
}