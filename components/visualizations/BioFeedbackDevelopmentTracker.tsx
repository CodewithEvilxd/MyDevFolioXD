'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BioMetric {
  timestamp: number;
  heartRate: number;
  focus: number;
  stress: number;
  fatigue: number;
  productivity: number;
}

interface HealthInsight {
  id: string;
  type: 'warning' | 'success' | 'info';
  title: string;
  description: string;
  recommendation: string;
  severity: number;
}

export default function BioFeedbackDevelopmentTracker() {
  const [metrics, setMetrics] = useState<BioMetric[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<BioMetric>({
    timestamp: Date.now(),
    heartRate: 72,
    focus: 85,
    stress: 25,
    fatigue: 15,
    productivity: 90
  });
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d'>('24h');

  useEffect(() => {
    // Simulate real-time bio-metric tracking
    if (isTracking) {
      const interval = setInterval(() => {
        const newMetrics: BioMetric = {
          timestamp: Date.now(),
          heartRate: 65 + Math.random() * 20, // 65-85 BPM
          focus: Math.max(0, Math.min(100, currentMetrics.focus + (Math.random() - 0.5) * 10)),
          stress: Math.max(0, Math.min(100, currentMetrics.stress + (Math.random() - 0.5) * 5)),
          fatigue: Math.max(0, Math.min(100, currentMetrics.fatigue + (Math.random() - 0.5) * 3)),
          productivity: Math.max(0, Math.min(100, currentMetrics.productivity + (Math.random() - 0.5) * 8))
        };

        setCurrentMetrics(newMetrics);
        setMetrics(prev => [...prev.slice(-50), newMetrics]); // Keep last 50 readings

        // Generate insights based on metrics
        generateInsights(newMetrics);
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval);
    }
  }, [isTracking, currentMetrics]);

  const generateInsights = (current: BioMetric) => {
    const newInsights: HealthInsight[] = [];

    // Heart rate analysis
    if (current.heartRate > 85) {
      newInsights.push({
        id: 'high-heart-rate',
        type: 'warning',
        title: 'Elevated Heart Rate',
        description: 'Your heart rate is higher than optimal for focused coding.',
        recommendation: 'Take a 5-minute break and practice deep breathing.',
        severity: 0.7
      });
    } else if (current.heartRate < 60) {
      newInsights.push({
        id: 'low-heart-rate',
        type: 'info',
        title: 'Low Heart Rate',
        description: 'Your heart rate suggests deep focus or relaxation.',
        recommendation: 'You\'re in a good state for complex problem-solving.',
        severity: 0.2
      });
    }

    // Focus analysis
    if (current.focus < 40) {
      newInsights.push({
        id: 'low-focus',
        type: 'warning',
        title: 'Focus Deteriorating',
        description: 'Your focus levels are dropping significantly.',
        recommendation: 'Consider taking a short walk or switching to a less demanding task.',
        severity: 0.8
      });
    } else if (current.focus > 90) {
      newInsights.push({
        id: 'peak-focus',
        type: 'success',
        title: 'Peak Focus Achieved',
        description: 'You\'re in an optimal state for deep work.',
        recommendation: 'This is an excellent time for tackling complex problems.',
        severity: 0.1
      });
    }

    // Stress analysis
    if (current.stress > 70) {
      newInsights.push({
        id: 'high-stress',
        type: 'warning',
        title: 'High Stress Levels',
        description: 'Your stress levels are elevated, which may impact code quality.',
        recommendation: 'Practice mindfulness or take a break to reduce stress.',
        severity: 0.9
      });
    }

    // Fatigue analysis
    if (current.fatigue > 80) {
      newInsights.push({
        id: 'high-fatigue',
        type: 'warning',
        title: 'High Fatigue Detected',
        description: 'You\'re showing signs of mental fatigue.',
        recommendation: 'Take a longer break or consider ending your coding session.',
        severity: 0.85
      });
    }

    // Productivity correlation
    if (current.productivity > 85 && current.focus > 80 && current.stress < 30) {
      newInsights.push({
        id: 'optimal-state',
        type: 'success',
        title: 'Optimal Development State',
        description: 'All your bio-metrics indicate peak performance.',
        recommendation: 'You\'re in the zone! Keep up the great work.',
        severity: 0.05
      });
    }

    // Time-based insights
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 6) {
      newInsights.push({
        id: 'late-night-coding',
        type: 'info',
        title: 'Late Night Coding',
        description: 'You\'re coding during typical sleep hours.',
        recommendation: 'Consider your sleep schedule for long-term health.',
        severity: 0.4
      });
    }

    setInsights(newInsights);
  };

  const getMetricColor = (value: number, type: string) => {
    if (type === 'heartRate') {
      if (value > 85 || value < 60) return '#EF4444';
      return '#10B981';
    }
    if (type === 'focus' || type === 'productivity') {
      if (value > 80) return '#10B981';
      if (value > 60) return '#F59E0B';
      return '#EF4444';
    }
    if (type === 'stress' || type === 'fatigue') {
      if (value > 70) return '#EF4444';
      if (value > 40) return '#F59E0B';
      return '#10B981';
    }
    return '#6B7280';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '💡';
    }
  };

  const getAverageMetrics = () => {
    if (metrics.length === 0) return currentMetrics;

    const recent = metrics.slice(-10); // Last 10 readings
    return {
      timestamp: Date.now(),
      heartRate: recent.reduce((sum, m) => sum + m.heartRate, 0) / recent.length,
      focus: recent.reduce((sum, m) => sum + m.focus, 0) / recent.length,
      stress: recent.reduce((sum, m) => sum + m.stress, 0) / recent.length,
      fatigue: recent.reduce((sum, m) => sum + m.fatigue, 0) / recent.length,
      productivity: recent.reduce((sum, m) => sum + m.productivity, 0) / recent.length
    };
  };

  const avgMetrics = getAverageMetrics();

  return (
    <motion.div
      className='card'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-bold'>Bio-Feedback Development Tracker</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Monitor your physiological state and optimize coding performance
          </p>
        </div>

        <div className='flex items-center gap-4'>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className='bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] px-3 py-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
          >
            <option value='1h'>Last Hour</option>
            <option value='24h'>Last 24 Hours</option>
            <option value='7d'>Last 7 Days</option>
          </select>

          <button
            onClick={() => setIsTracking(!isTracking)}
            className={`px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-2 ${
              isTracking
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isTracking ? (
              <>
                <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
                Stop Tracking
              </>
            ) : (
              <>
                <span>📊</span>
                Start Tracking
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-time Metrics Dashboard */}
      <div className='grid grid-cols-2 md:grid-cols-5 gap-4 mb-6'>
        <motion.div
          className='text-center p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className='text-2xl mb-2'>❤️</div>
          <div className='text-sm font-medium mb-1'>Heart Rate</div>
          <div
            className='text-2xl font-bold'
            style={{ color: getMetricColor(currentMetrics.heartRate, 'heartRate') }}
          >
            {Math.round(currentMetrics.heartRate)}
          </div>
          <div className='text-xs text-[var(--text-secondary)]'>BPM</div>
        </motion.div>

        <motion.div
          className='text-center p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className='text-2xl mb-2'>🎯</div>
          <div className='text-sm font-medium mb-1'>Focus</div>
          <div
            className='text-2xl font-bold'
            style={{ color: getMetricColor(currentMetrics.focus, 'focus') }}
          >
            {Math.round(currentMetrics.focus)}%
          </div>
          <div className='text-xs text-[var(--text-secondary)]'>Level</div>
        </motion.div>

        <motion.div
          className='text-center p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className='text-2xl mb-2'>😰</div>
          <div className='text-sm font-medium mb-1'>Stress</div>
          <div
            className='text-2xl font-bold'
            style={{ color: getMetricColor(currentMetrics.stress, 'stress') }}
          >
            {Math.round(currentMetrics.stress)}%
          </div>
          <div className='text-xs text-[var(--text-secondary)]'>Level</div>
        </motion.div>

        <motion.div
          className='text-center p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className='text-2xl mb-2'>😴</div>
          <div className='text-sm font-medium mb-1'>Fatigue</div>
          <div
            className='text-2xl font-bold'
            style={{ color: getMetricColor(currentMetrics.fatigue, 'fatigue') }}
          >
            {Math.round(currentMetrics.fatigue)}%
          </div>
          <div className='text-xs text-[var(--text-secondary)]'>Level</div>
        </motion.div>

        <motion.div
          className='text-center p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className='text-2xl mb-2'>⚡</div>
          <div className='text-sm font-medium mb-1'>Productivity</div>
          <div
            className='text-2xl font-bold'
            style={{ color: getMetricColor(currentMetrics.productivity, 'productivity') }}
          >
            {Math.round(currentMetrics.productivity)}%
          </div>
          <div className='text-xs text-[var(--text-secondary)]'>Efficiency</div>
        </motion.div>
      </div>

      {/* Health Insights */}
      <div className='mb-6'>
        <h3 className='text-lg font-semibold mb-4'>Health Insights</h3>
        <div className='space-y-3'>
          <AnimatePresence>
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                className={`p-4 border rounded-lg ${
                  insight.type === 'warning' ? 'border-red-500 bg-red-500/10' :
                  insight.type === 'success' ? 'border-green-500 bg-green-500/10' :
                  'border-blue-500 bg-blue-500/10'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <div className='flex items-start gap-3'>
                  <span className='text-xl'>{getInsightIcon(insight.type)}</span>
                  <div className='flex-1'>
                    <h4 className='font-semibold mb-1'>{insight.title}</h4>
                    <p className='text-sm text-[var(--text-secondary)] mb-2'>
                      {insight.description}
                    </p>
                    <p className='text-sm font-medium text-[var(--primary)]'>
                      💡 {insight.recommendation}
                    </p>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    insight.severity > 0.7 ? 'bg-red-500/20 text-red-600' :
                    insight.severity > 0.4 ? 'bg-yellow-500/20 text-yellow-600' :
                    'bg-green-500/20 text-green-600'
                  }`}>
                    Severity: {Math.round(insight.severity * 100)}%
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Metrics History Chart */}
      <div className='p-4 bg-gray-900 rounded-lg border border-gray-700'>
        <h3 className='text-white font-semibold mb-4'>Bio-Metric Trends</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Focus vs Productivity Correlation */}
          <div>
            <h4 className='text-white text-sm mb-2'>Focus vs Productivity</h4>
            <div className='h-32 bg-gray-800 rounded p-2'>
              <div className='flex items-end justify-center h-full gap-1'>
                {metrics.slice(-10).map((metric, i) => (
                  <div key={i} className='flex flex-col items-center gap-1'>
                    <div
                      className='w-4 bg-blue-500 rounded-t'
                      style={{ height: `${metric.focus / 2}px` }}
                    />
                    <div
                      className='w-4 bg-green-500 rounded-t'
                      style={{ height: `${metric.productivity / 2}px` }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className='flex justify-center gap-4 mt-2 text-xs text-gray-400'>
              <span className='flex items-center gap-1'>
                <div className='w-3 h-3 bg-blue-500 rounded'></div>
                Focus
              </span>
              <span className='flex items-center gap-1'>
                <div className='w-3 h-3 bg-green-500 rounded'></div>
                Productivity
              </span>
            </div>
          </div>

          {/* Stress vs Heart Rate */}
          <div>
            <h4 className='text-white text-sm mb-2'>Stress vs Heart Rate</h4>
            <div className='h-32 bg-gray-800 rounded p-2'>
              <div className='flex items-end justify-center h-full gap-1'>
                {metrics.slice(-10).map((metric, i) => (
                  <div key={i} className='flex flex-col items-center gap-1'>
                    <div
                      className='w-4 bg-red-500 rounded-t'
                      style={{ height: `${metric.stress / 1.5}px` }}
                    />
                    <div
                      className='w-4 bg-pink-500 rounded-t'
                      style={{ height: `${(metric.heartRate - 60) * 2}px` }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className='flex justify-center gap-4 mt-2 text-xs text-gray-400'>
              <span className='flex items-center gap-1'>
                <div className='w-3 h-3 bg-red-500 rounded'></div>
                Stress
              </span>
              <span className='flex items-center gap-1'>
                <div className='w-3 h-3 bg-pink-500 rounded'></div>
                Heart Rate
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Wellness Recommendations */}
      <div className='mt-6 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg'>
        <h3 className='font-semibold mb-3 text-green-600'>Wellness Recommendations</h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
          <div className='text-center'>
            <div className='text-2xl mb-2'>🧘</div>
            <div className='font-medium mb-1'>Breathing Exercise</div>
            <div className='text-[var(--text-secondary)]'>4-7-8 breathing for stress reduction</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl mb-2'>🏃</div>
            <div className='font-medium mb-1'>Movement Break</div>
            <div className='text-[var(--text-secondary)]'>5-minute walk every hour</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl mb-2'>💧</div>
            <div className='font-medium mb-1'>Hydration</div>
            <div className='text-[var(--text-secondary)]'>Drink water regularly</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
