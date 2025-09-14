'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { makeAPIRequest, getAPIsStatus, getCurrentPrimaryAPI, switchToAPI } from '@/lib/apiFallback';

interface APIStatus {
  configured: boolean;
  failures: number;
  isPrimary: boolean;
}

export default function APIFallbackDashboard() {
  const [apiStatus, setApiStatus] = useState<Record<string, APIStatus>>({});
  const [currentPrimary, setCurrentPrimary] = useState<string>('none');
  const [testPrompt, setTestPrompt] = useState('Hello, can you tell me about quantum computing in one sentence?');
  const [testResult, setTestResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);
  const [lastTestTime, setLastTestTime] = useState<Date | null>(null);

  useEffect(() => {
    updateStatus();
    const interval = setInterval(updateStatus, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const updateStatus = () => {
    setApiStatus(getAPIsStatus());
    setCurrentPrimary(getCurrentPrimaryAPI());
  };

  const handleTestAPI = async () => {
    if (!testPrompt.trim()) return;

    setIsTesting(true);
    setTestResult('');

    try {
      const result = await makeAPIRequest(testPrompt, {
        maxTokens: 200,
        temperature: 0.7
      });

      if (result.success) {
        setTestResult(`✅ Success using ${result.apiUsed} API:\n\n${result.data}`);
      } else {
        setTestResult(`❌ Failed: ${result.error}\nUsed API: ${result.apiUsed}`);
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
      setLastTestTime(new Date());
      updateStatus(); // Refresh status after test
    }
  };

  const handleSwitchAPI = (apiName: string) => {
    if (switchToAPI(apiName)) {
      updateStatus();
    }
  };

  const getStatusColor = (apiName: string) => {
    const status = apiStatus[apiName];
    if (!status?.configured) return 'text-gray-500 bg-gray-500/20 border-gray-500';
    if (status.isPrimary) return 'text-green-500 bg-green-500/20 border-green-500';
    if (status.failures > 0) return 'text-red-500 bg-red-500/20 border-red-500';
    return 'text-blue-500 bg-blue-500/20 border-blue-500';
  };

  const getStatusIcon = (apiName: string) => {
    const status = apiStatus[apiName];
    if (!status?.configured) return '❓';
    if (status.isPrimary) return '⭐';
    if (status.failures > 0) return '⚠️';
    return '✅';
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
          <h2 className='text-2xl font-bold'>API Fallback System</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Automatic API switching with Gemini & OpenRouter fallback
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-sm text-[var(--text-secondary)]'>Primary:</span>
          <span className='px-3 py-1 bg-[var(--primary)] text-white rounded-full text-sm font-medium'>
            {currentPrimary.toUpperCase()}
          </span>
        </div>
      </div>

      {/* API Status Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
        {Object.entries(apiStatus).map(([apiName, status]) => (
          <motion.div
            key={apiName}
            className={`p-4 border rounded-lg transition-all duration-300 ${getStatusColor(apiName)}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Object.keys(apiStatus).indexOf(apiName) * 0.1 }}
          >
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center gap-2'>
                <span className='text-lg'>{getStatusIcon(apiName)}</span>
                <h3 className='font-semibold capitalize'>{apiName} API</h3>
              </div>
              {status.isPrimary && (
                <span className='px-2 py-1 bg-green-600 text-white text-xs rounded-full'>
                  PRIMARY
                </span>
              )}
            </div>

            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span>Status:</span>
                <span className={status.configured ? 'text-green-400' : 'text-red-400'}>
                  {status.configured ? 'Configured' : 'Not Configured'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span>Failures:</span>
                <span className={status.failures > 0 ? 'text-red-400' : 'text-green-400'}>
                  {status.failures}
                </span>
              </div>
            </div>

            {status.configured && (
              <button
                onClick={() => handleSwitchAPI(apiName)}
                disabled={status.isPrimary}
                className={`w-full mt-3 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                  status.isPrimary
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--primary)] text-[var(--text-secondary)] hover:text-[var(--primary)]'
                }`}
              >
                {status.isPrimary ? 'Current Primary' : 'Set as Primary'}
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Test Interface */}
      <div className='p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg'>
        <h3 className='font-semibold mb-4 text-blue-600'>Test API Fallback System</h3>

        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-[var(--text-primary)] mb-2'>
              Test Prompt:
            </label>
            <textarea
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              className='w-full p-3 bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none'
              rows={3}
              placeholder='Enter a prompt to test the API fallback system...'
            />
          </div>

          <div className='flex items-center gap-4'>
            <motion.button
              onClick={handleTestAPI}
              disabled={isTesting || !testPrompt.trim()}
              className='px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all disabled:opacity-50 font-medium flex items-center gap-2'
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isTesting ? (
                <>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                  Testing...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Test API Fallback
                </>
              )}
            </motion.button>

            {lastTestTime && (
              <span className='text-xs text-[var(--text-secondary)]'>
                Last test: {lastTestTime.toLocaleTimeString()}
              </span>
            )}
          </div>

          {testResult && (
            <motion.div
              className='p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-md'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h4 className='font-medium mb-2 text-[var(--text-primary)]'>Test Result:</h4>
              <pre className='text-sm text-[var(--text-secondary)] whitespace-pre-wrap font-mono'>
                {testResult}
              </pre>
            </motion.div>
          )}
        </div>
      </div>

      {/* System Info */}
      <div className='mt-6 p-3 bg-gray-500/10 border border-gray-500/20 rounded-lg'>
        <div className='flex items-center gap-2 text-sm text-[var(--text-secondary)]'>
          <span>🔄</span>
          <span>
            System automatically switches APIs on failure. Primary API rotates to the last successful one.
          </span>
        </div>
      </div>
    </motion.div>
  );
}
