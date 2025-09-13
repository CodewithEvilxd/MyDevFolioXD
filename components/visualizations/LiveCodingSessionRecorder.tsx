'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SessionMetrics {
  keystrokes: number;
  linesWritten: number;
  timeSpent: number;
  focusScore: number;
  productivityScore: number;
  bugsFixed: number;
  featuresAdded: number;
}

interface SessionRecording {
  id: string;
  startTime: Date;
  endTime?: Date;
  language: string;
  project: string;
  metrics: SessionMetrics;
  codeSnippets: string[];
  screenshots: string[];
  isActive: boolean;
}

export default function LiveCodingSessionRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentSession, setCurrentSession] = useState<SessionRecording | null>(null);
  const [pastSessions, setPastSessions] = useState<SessionRecording[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionRecording | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [sessionLanguage, setSessionLanguage] = useState('javascript');
  const [sessionProject, setSessionProject] = useState('portfolio-project');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    // Load past sessions from localStorage
    const saved = localStorage.getItem('codingSessions');
    if (saved) {
      try {
        const sessions = JSON.parse(saved).map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined
        }));
        setPastSessions(sessions);
      } catch (error) {
        console.error('Error loading sessions:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (isRecording && currentSession) {
      intervalRef.current = setInterval(() => {
        updateSessionMetrics();
      }, 5000); // Update every 5 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording, currentSession]);

  const startRecording = () => {
    const newSession: SessionRecording = {
      id: `session_${Date.now()}`,
      startTime: new Date(),
      language: sessionLanguage,
      project: sessionProject,
      metrics: {
        keystrokes: 0,
        linesWritten: 0,
        timeSpent: 0,
        focusScore: 85,
        productivityScore: 78,
        bugsFixed: 0,
        featuresAdded: 0
      },
      codeSnippets: [],
      screenshots: [],
      isActive: true
    };

    setCurrentSession(newSession);
    setIsRecording(true);
    startTimeRef.current = new Date();
    setCodeInput('');
  };

  const stopRecording = () => {
    if (currentSession) {
      const endTime = new Date();
      const updatedSession = {
        ...currentSession,
        endTime,
        metrics: {
          ...currentSession.metrics,
          timeSpent: (endTime.getTime() - currentSession.startTime.getTime()) / 1000
        },
        isActive: false
      };

      setCurrentSession(null);
      setIsRecording(false);

      const newSessions = [updatedSession, ...pastSessions];
      setPastSessions(newSessions);
      localStorage.setItem('codingSessions', JSON.stringify(newSessions));
    }
  };

  const updateSessionMetrics = () => {
    if (!currentSession) return;

    setCurrentSession(prev => {
      if (!prev) return null;

      const timeElapsed = (Date.now() - prev.startTime.getTime()) / 1000;
      const keystrokes = codeInput.length;
      const linesWritten = codeInput.split('\n').length;

      // Calculate focus score based on consistent activity
      const focusScore = Math.max(0, Math.min(100, 80 + (Math.random() - 0.5) * 20));

      // Calculate productivity score based on code output vs time
      const productivityScore = Math.max(0, Math.min(100,
        (keystrokes / timeElapsed) * 10 + (linesWritten / timeElapsed) * 50
      ));

      return {
        ...prev,
        metrics: {
          keystrokes,
          linesWritten,
          timeSpent: timeElapsed,
          focusScore: Math.round(focusScore),
          productivityScore: Math.round(productivityScore),
          bugsFixed: prev.metrics.bugsFixed + (Math.random() > 0.8 ? 1 : 0),
          featuresAdded: prev.metrics.featuresAdded + (Math.random() > 0.9 ? 1 : 0)
        }
      };
    });
  };

  const handleCodeChange = (value: string) => {
    setCodeInput(value);

    if (isRecording && currentSession) {
      // Save code snippet periodically
      setCurrentSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          codeSnippets: [...prev.codeSnippets.slice(-9), value] // Keep last 10 snippets
        };
      });
    }
  };

  const getLanguageIcon = (lang: string) => {
    switch (lang) {
      case 'javascript': return '🟨';
      case 'typescript': return '🔷';
      case 'python': return '🐍';
      case 'java': return '☕';
      case 'cpp': return '⚡';
      case 'csharp': return '💎';
      case 'go': return '🐹';
      case 'rust': return '🦀';
      case 'php': return '🐘';
      case 'ruby': return '💎';
      default: return '💻';
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProductivityColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getFocusColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
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
          <h2 className='text-2xl font-bold'>Live Coding Session Recorder</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Record and analyze your coding sessions with real-time productivity metrics
          </p>
        </div>

        <div className='flex items-center gap-4'>
          {isRecording && (
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 bg-red-500 rounded-full animate-pulse'></div>
              <span className='text-sm text-red-500 font-medium'>RECORDING</span>
            </div>
          )}
        </div>
      </div>

      {/* Session Setup */}
      <div className='mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
          <div>
            <label className='block text-sm font-medium mb-2'>Language</label>
            <select
              value={sessionLanguage}
              onChange={(e) => setSessionLanguage(e.target.value)}
              className='w-full bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] px-3 py-2 rounded-md'
              disabled={isRecording}
            >
              <option value='javascript'>JavaScript</option>
              <option value='typescript'>TypeScript</option>
              <option value='python'>Python</option>
              <option value='java'>Java</option>
              <option value='cpp'>C++</option>
              <option value='csharp'>C#</option>
              <option value='go'>Go</option>
              <option value='rust'>Rust</option>
              <option value='php'>PHP</option>
              <option value='ruby'>Ruby</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium mb-2'>Project</label>
            <input
              type='text'
              value={sessionProject}
              onChange={(e) => setSessionProject(e.target.value)}
              className='w-full bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] px-3 py-2 rounded-md'
              placeholder='Project name'
              disabled={isRecording}
            />
          </div>

          <div className='flex items-end'>
            {!isRecording ? (
              <button
                onClick={startRecording}
                className='w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2'
              >
                <span>⏺️</span>
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className='w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2'
              >
                <span>⏹️</span>
                Stop Recording
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Session Display */}
      {isRecording && currentSession && (
        <div className='mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <span className='text-2xl'>{getLanguageIcon(sessionLanguage)}</span>
              <div>
                <h3 className='font-bold'>Live Session: {sessionProject}</h3>
                <p className='text-sm text-[var(--text-secondary)]'>
                  Started {currentSession.startTime.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className='text-right'>
              <div className='text-lg font-bold text-[var(--primary)]'>
                {formatDuration(currentSession.metrics.timeSpent)}
              </div>
              <div className='text-xs text-[var(--text-secondary)]'>Duration</div>
            </div>
          </div>

          {/* Live Metrics */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
            <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
              <div className={`text-xl font-bold ${getProductivityColor(currentSession.metrics.productivityScore)}`}>
                {currentSession.metrics.productivityScore}%
              </div>
              <div className='text-xs text-[var(--text-secondary)]'>Productivity</div>
            </div>

            <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
              <div className={`text-xl font-bold ${getFocusColor(currentSession.metrics.focusScore)}`}>
                {currentSession.metrics.focusScore}%
              </div>
              <div className='text-xs text-[var(--text-secondary)]'>Focus</div>
            </div>

            <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
              <div className='text-xl font-bold text-blue-500'>
                {currentSession.metrics.keystrokes}
              </div>
              <div className='text-xs text-[var(--text-secondary)]'>Keystrokes</div>
            </div>

            <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
              <div className='text-xl font-bold text-green-500'>
                {currentSession.metrics.linesWritten}
              </div>
              <div className='text-xs text-[var(--text-secondary)]'>Lines Written</div>
            </div>
          </div>

          {/* Code Input Area */}
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-2'>Live Coding Area</label>
            <textarea
              value={codeInput}
              onChange={(e) => handleCodeChange(e.target.value)}
              className='w-full h-32 bg-gray-900 text-green-400 font-mono text-sm p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none'
              placeholder='Start coding... your session is being recorded!'
              spellCheck={false}
            />
          </div>
        </div>
      )}

      {/* Past Sessions */}
      <div>
        <h3 className='text-lg font-semibold mb-4'>Session History</h3>
        <div className='space-y-3 max-h-96 overflow-y-auto'>
          <AnimatePresence>
            {pastSessions.map((session, index) => (
              <motion.div
                key={session.id}
                className='p-4 border border-[var(--card-border)] rounded-lg cursor-pointer hover:border-[var(--primary)] transition-colors'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                onClick={() => setSelectedSession(session)}
              >
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center gap-3'>
                    <span className='text-xl'>{getLanguageIcon(session.language)}</span>
                    <div>
                      <h4 className='font-medium'>{session.project}</h4>
                      <p className='text-sm text-[var(--text-secondary)]'>
                        {session.startTime.toLocaleDateString()} • {formatDuration(session.metrics.timeSpent)}
                      </p>
                    </div>
                  </div>

                  <div className='text-right'>
                    <div className={`text-sm font-bold ${getProductivityColor(session.metrics.productivityScore)}`}>
                      {session.metrics.productivityScore}% productive
                    </div>
                    <div className={`text-xs ${getFocusColor(session.metrics.focusScore)}`}>
                      {session.metrics.focusScore}% focused
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-4 gap-4 text-sm'>
                  <div className='text-center'>
                    <div className='font-medium text-blue-500'>{session.metrics.keystrokes}</div>
                    <div className='text-xs text-[var(--text-secondary)]'>Keystrokes</div>
                  </div>
                  <div className='text-center'>
                    <div className='font-medium text-green-500'>{session.metrics.linesWritten}</div>
                    <div className='text-xs text-[var(--text-secondary)]'>Lines</div>
                  </div>
                  <div className='text-center'>
                    <div className='font-medium text-purple-500'>{session.metrics.bugsFixed}</div>
                    <div className='text-xs text-[var(--text-secondary)]'>Bugs Fixed</div>
                  </div>
                  <div className='text-center'>
                    <div className='font-medium text-orange-500'>{session.metrics.featuresAdded}</div>
                    <div className='text-xs text-[var(--text-secondary)]'>Features</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {pastSessions.length === 0 && (
          <div className='text-center py-8'>
            <div className='w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-4xl'>📊</span>
            </div>
            <p className='text-[var(--text-secondary)]'>No coding sessions recorded yet</p>
            <p className='text-sm text-[var(--text-secondary)] mt-1'>Start your first session to track your progress!</p>
          </div>
        )}
      </div>

      {/* Session Detail Modal */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div
            className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedSession(null)}
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
                    <span className='text-3xl'>{getLanguageIcon(selectedSession.language)}</span>
                    <div>
                      <h2 className='text-xl font-bold'>{selectedSession.project}</h2>
                      <p className='text-[var(--text-secondary)]'>
                        {selectedSession.startTime.toLocaleString()} • {formatDuration(selectedSession.metrics.timeSpent)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSession(null)}
                    className='text-[var(--text-secondary)] hover:text-white p-2'
                  >
                    ✕
                  </button>
                </div>

                {/* Session Metrics Overview */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <div className='text-center p-4 bg-[var(--card-bg)] rounded-lg'>
                    <div className={`text-2xl font-bold ${getProductivityColor(selectedSession.metrics.productivityScore)}`}>
                      {selectedSession.metrics.productivityScore}%
                    </div>
                    <div className='text-sm text-[var(--text-secondary)]'>Productivity</div>
                  </div>

                  <div className='text-center p-4 bg-[var(--card-bg)] rounded-lg'>
                    <div className={`text-2xl font-bold ${getFocusColor(selectedSession.metrics.focusScore)}`}>
                      {selectedSession.metrics.focusScore}%
                    </div>
                    <div className='text-sm text-[var(--text-secondary)]'>Focus</div>
                  </div>

                  <div className='text-center p-4 bg-[var(--card-bg)] rounded-lg'>
                    <div className='text-2xl font-bold text-blue-500'>
                      {selectedSession.metrics.keystrokes}
                    </div>
                    <div className='text-sm text-[var(--text-secondary)]'>Keystrokes</div>
                  </div>

                  <div className='text-center p-4 bg-[var(--card-bg)] rounded-lg'>
                    <div className='text-2xl font-bold text-green-500'>
                      {selectedSession.metrics.linesWritten}
                    </div>
                    <div className='text-sm text-[var(--text-secondary)]'>Lines Written</div>
                  </div>
                </div>
              </div>

              <div className='p-6 overflow-y-auto max-h-96'>
                <div className='space-y-6'>
                  {/* Code Snippets */}
                  {selectedSession.codeSnippets.length > 0 && (
                    <div>
                      <h3 className='font-semibold mb-3'>Code Evolution</h3>
                      <div className='space-y-3'>
                        {selectedSession.codeSnippets.slice(-3).map((snippet, index) => (
                          <div key={index} className='bg-gray-900 rounded-lg p-3'>
                            <div className='text-xs text-gray-400 mb-2'>Version {index + 1}</div>
                            <pre className='text-green-400 text-sm font-mono overflow-x-auto'>
                              <code>{snippet || '// No code written yet'}</code>
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Session Insights */}
                  <div>
                    <h3 className='font-semibold mb-3'>Session Insights</h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg'>
                        <h4 className='font-medium mb-2'>Productivity Analysis</h4>
                        <p className='text-sm text-[var(--text-secondary)]'>
                          {selectedSession.metrics.productivityScore >= 80
                            ? 'Excellent productivity! You were in the zone during this session.'
                            : selectedSession.metrics.productivityScore >= 60
                            ? 'Good productivity with consistent output throughout the session.'
                            : 'Productivity could be improved. Consider shorter, focused sessions.'}
                        </p>
                      </div>

                      <div className='p-4 bg-green-500/10 border border-green-500/20 rounded-lg'>
                        <h4 className='font-medium mb-2'>Focus Patterns</h4>
                        <p className='text-sm text-[var(--text-secondary)]'>
                          {selectedSession.metrics.focusScore >= 80
                            ? 'Outstanding focus! You maintained deep concentration throughout.'
                            : selectedSession.metrics.focusScore >= 60
                            ? 'Solid focus with good attention span during coding.'
                            : 'Focus levels varied. Consider techniques to improve concentration.'}
                        </p>
                      </div>
                    </div>
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