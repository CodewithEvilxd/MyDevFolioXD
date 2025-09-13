'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VisitorPattern {
  id: string;
  timestamp: number;
  section: string;
  timeSpent: number;
  interactions: number;
  device: 'mobile' | 'desktop' | 'tablet';
  referrer: string;
}

interface MorphingSuggestion {
  id: string;
  type: 'reorder' | 'highlight' | 'hide' | 'expand';
  section: string;
  reason: string;
  confidence: number;
  impact: number;
}

interface NeuralNetworkPortfolioMorphingProps {
  username: string;
}

export default function NeuralNetworkPortfolioMorphing({ username }: NeuralNetworkPortfolioMorphingProps) {
  const [visitorPatterns, setVisitorPatterns] = useState<VisitorPattern[]>([]);
  const [suggestions, setSuggestions] = useState<MorphingSuggestion[]>([]);
  const [isLearning, setIsLearning] = useState(false);
  const [morphingActive, setMorphingActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<VisitorPattern | null>(null);

  useEffect(() => {
    // Simulate visitor tracking (in real implementation, this would use analytics)
    const trackVisitorBehavior = () => {
      const sessionId = `session_${Date.now()}`;
      const newSession: VisitorPattern = {
        id: sessionId,
        timestamp: Date.now(),
        section: 'hero',
        timeSpent: 0,
        interactions: 0,
        device: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
        referrer: document.referrer || 'direct'
      };

      setCurrentSession(newSession);

      // Track section changes
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            updateCurrentSection(entry.target.id || 'unknown');
          }
        });
      }, { threshold: 0.5 });

      // Observe all sections
      setTimeout(() => {
        document.querySelectorAll('[id]').forEach(el => {
          if (el.id.includes('section') || el.id.includes('dashboard') || el.id.includes('showcase')) {
            observer.observe(el);
          }
        });
      }, 2000);

      return () => observer.disconnect();
    };

    trackVisitorBehavior();

    // Load historical patterns from localStorage
    const saved = localStorage.getItem(`portfolio_patterns_${username}`);
    if (saved) {
      setVisitorPatterns(JSON.parse(saved));
    }
  }, [username]);

  const updateCurrentSection = (sectionId: string) => {
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        section: sectionId,
        timeSpent: currentSession.timeSpent + 1,
        interactions: currentSession.interactions + 1
      };
      setCurrentSession(updatedSession);
    }
  };

  const learnFromVisitors = async () => {
    if (isLearning) return;

    setIsLearning(true);

    try {
      // Simulate AI learning process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate morphing suggestions based on patterns
      const newSuggestions = generateSuggestions(visitorPatterns);
      setSuggestions(newSuggestions);

      // Save patterns
      localStorage.setItem(`portfolio_patterns_${username}`, JSON.stringify(visitorPatterns));
    } catch (error) {
      console.error('Error learning from visitors:', error);
    } finally {
      setIsLearning(false);
    }
  };

  const generateSuggestions = (patterns: VisitorPattern[]): MorphingSuggestion[] => {
    const suggestions: MorphingSuggestion[] = [];

    // Analyze section popularity
    const sectionStats = patterns.reduce((acc, pattern) => {
      acc[pattern.section] = (acc[pattern.section] || 0) + pattern.timeSpent;
      return acc;
    }, {} as Record<string, number>);

    const totalTime = Object.values(sectionStats).reduce((sum, time) => sum + time, 0);

    // Find most engaging sections
    const sortedSections = Object.entries(sectionStats)
      .sort(([,a], [,b]) => b - a)
      .map(([section, time]) => ({ section, engagement: time / totalTime }));

    // Generate suggestions
    if (sortedSections[0]?.engagement > 0.3) {
      suggestions.push({
        id: 'highlight_top_performer',
        type: 'highlight',
        section: sortedSections[0].section,
        reason: `${sortedSections[0].section} gets ${Math.round(sortedSections[0].engagement * 100)}% of visitor attention`,
        confidence: 0.85,
        impact: 0.15
      });
    }

    // Suggest reordering based on engagement
    if (sortedSections.length > 2) {
      suggestions.push({
        id: 'reorder_high_engagement',
        type: 'reorder',
        section: sortedSections.slice(0, 3).map(s => s.section).join(', '),
        reason: 'Move high-engagement sections higher up for better visibility',
        confidence: 0.75,
        impact: 0.10
      });
    }

    // Device-specific suggestions
    const mobilePatterns = patterns.filter(p => p.device === 'mobile');
    if (mobilePatterns.length > patterns.length * 0.4) {
      suggestions.push({
        id: 'optimize_mobile',
        type: 'expand',
        section: 'mobile-optimized-sections',
        reason: `${Math.round((mobilePatterns.length / patterns.length) * 100)}% of visitors are on mobile`,
        confidence: 0.90,
        impact: 0.20
      });
    }

    // Time-based patterns
    const quickExits = patterns.filter(p => p.timeSpent < 30);
    if (quickExits.length > patterns.length * 0.5) {
      suggestions.push({
        id: 'improve_engagement',
        type: 'highlight',
        section: 'hero-section',
        reason: `${Math.round((quickExits.length / patterns.length) * 100)}% of visitors leave within 30 seconds`,
        confidence: 0.80,
        impact: 0.25
      });
    }

    return suggestions;
  };

  const applyMorphing = (suggestion: MorphingSuggestion) => {
    setMorphingActive(true);

    // In a real implementation, this would modify the actual portfolio layout
    // For now, we'll just show the effect
    setTimeout(() => {
      setMorphingActive(false);
      // Remove applied suggestion
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    }, 3000);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'highlight': return '⭐';
      case 'reorder': return '🔄';
      case 'expand': return '📱';
      case 'hide': return '👁️‍🗨️';
      default: return '💡';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-green-500 bg-green-500/20';
    if (confidence > 0.6) return 'text-yellow-500 bg-yellow-500/20';
    return 'text-red-500 bg-red-500/20';
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
          <h2 className='text-2xl font-bold'>Neural Network Portfolio Morphing</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            AI learns from visitor behavior to optimize your portfolio layout
          </p>
        </div>

        <div className='flex items-center gap-4'>
          <div className='text-sm text-[var(--text-secondary)]'>
            {visitorPatterns.length} visitor sessions analyzed
          </div>
          <button
            onClick={learnFromVisitors}
            disabled={isLearning}
            className='px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg transition-all disabled:opacity-50 font-medium flex items-center gap-2'
          >
            {isLearning ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                Learning...
              </>
            ) : (
              <>
                <span>🧠</span>
                Learn Patterns
              </>
            )}
          </button>
        </div>
      </div>

      {/* Current Session Tracking */}
      {currentSession && (
        <div className='mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-semibold text-blue-600'>Current Session</h3>
              <p className='text-sm text-[var(--text-secondary)]'>
                Viewing: {currentSession.section} • Time: {currentSession.timeSpent}s • Device: {currentSession.device}
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
              <span className='text-xs text-green-600'>Live Tracking</span>
            </div>
          </div>
        </div>
      )}

      {/* Morphing Suggestions */}
      <div className='space-y-4'>
        <AnimatePresence>
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.id}
              className='p-4 border border-[var(--card-border)] rounded-lg bg-gradient-to-r from-purple-500/5 to-pink-500/5'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <span className='text-2xl'>{getSuggestionIcon(suggestion.type)}</span>
                  <div>
                    <h4 className='font-semibold capitalize'>{suggestion.type} Suggestion</h4>
                    <p className='text-sm text-[var(--text-secondary)]'>{suggestion.reason}</p>
                    <p className='text-xs text-[var(--text-secondary)] mt-1'>
                      Target: {suggestion.section}
                    </p>
                  </div>
                </div>

                <div className='text-right'>
                  <div className='flex items-center gap-2 mb-2'>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                      {Math.round(suggestion.confidence * 100)}% confidence
                    </span>
                    <span className='text-xs text-[var(--text-secondary)]'>
                      +{Math.round(suggestion.impact * 100)}% impact
                    </span>
                  </div>

                  <button
                    onClick={() => applyMorphing(suggestion)}
                    disabled={morphingActive}
                    className='px-3 py-1 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-sm rounded transition-colors disabled:opacity-50'
                  >
                    {morphingActive ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {suggestions.length === 0 && !isLearning && (
        <div className='text-center py-8'>
          <div className='w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
            <span className='text-2xl'>🧠</span>
          </div>
          <h3 className='text-lg font-bold mb-2'>AI Learning Mode</h3>
          <p className='text-[var(--text-secondary)] mb-4'>
            Click "Learn Patterns" to analyze visitor behavior and generate optimization suggestions
          </p>
        </div>
      )}

      {/* Neural Network Visualization */}
      <div className='mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700'>
        <h3 className='text-white font-semibold mb-4'>Neural Network Status</h3>
        <div className='grid grid-cols-3 gap-4 text-center'>
          <div>
            <div className='text-2xl font-bold text-green-400'>
              {visitorPatterns.length}
            </div>
            <div className='text-xs text-gray-400'>Training Samples</div>
          </div>
          <div>
            <div className='text-2xl font-bold text-blue-400'>
              {suggestions.length}
            </div>
            <div className='text-xs text-gray-400'>Active Suggestions</div>
          </div>
          <div>
            <div className='text-2xl font-bold text-purple-400'>
              {morphingActive ? 'Active' : 'Standby'}
            </div>
            <div className='text-xs text-gray-400'>Morphing Status</div>
          </div>
        </div>

        {/* Simple neural network visualization */}
        <div className='mt-4 flex justify-center'>
          <svg width='300' height='100' viewBox='0 0 300 100'>
            {/* Input layer */}
            <circle cx='50' cy='30' r='8' fill='#60A5FA' opacity='0.7' />
            <circle cx='50' cy='50' r='8' fill='#60A5FA' opacity='0.7' />
            <circle cx='50' cy='70' r='8' fill='#60A5FA' opacity='0.7' />

            {/* Hidden layer */}
            <circle cx='150' cy='40' r='8' fill='#A855F7' opacity='0.7' />
            <circle cx='150' cy='60' r='8' fill='#A855F7' opacity='0.7' />

            {/* Output layer */}
            <circle cx='250' cy='50' r='8' fill='#EC4899' opacity='0.7' />

            {/* Connections */}
            <line x1='58' y1='30' x2='142' y2='40' stroke='#60A5FA' strokeWidth='1' opacity='0.5' />
            <line x1='58' y1='30' x2='142' y2='60' stroke='#60A5FA' strokeWidth='1' opacity='0.5' />
            <line x1='58' y1='50' x2='142' y2='40' stroke='#60A5FA' strokeWidth='1' opacity='0.5' />
            <line x1='58' y1='50' x2='142' y2='60' stroke='#60A5FA' strokeWidth='1' opacity='0.5' />
            <line x1='58' y1='70' x2='142' y2='40' stroke='#60A5FA' strokeWidth='1' opacity='0.5' />
            <line x1='58' y1='70' x2='142' y2='60' stroke='#60A5FA' strokeWidth='1' opacity='0.5' />

            <line x1='158' y1='40' x2='242' y2='50' stroke='#A855F7' strokeWidth='1' opacity='0.5' />
            <line x1='158' y1='60' x2='242' y2='50' stroke='#A855F7' strokeWidth='1' opacity='0.5' />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}