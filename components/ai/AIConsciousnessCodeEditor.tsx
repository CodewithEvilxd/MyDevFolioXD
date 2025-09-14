'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CodePattern {
  id: string;
  pattern: string;
  confidence: number;
  suggestion: string;
  type: 'error' | 'warning' | 'improvement' | 'security';
  line: number;
  column: number;
}

interface ConsciousnessLevel {
  awareness: number;
  learning: number;
  prediction: number;
  empathy: number;
}

export default function AIConsciousnessCodeEditor() {
  const [code, setCode] = useState(`// Welcome to the AI Consciousness Code Editor
// The editor becomes aware of your coding patterns and prevents mistakes

function calculateFactorial(n) {
  if (n <= 1) return 1;
  return n * calculateFactorial(n - 1);
}

const result = calculateFactorial(5);


// Try writing some code and watch the AI become conscious...`);
  const [patterns, setPatterns] = useState<CodePattern[]>([]);
  const [consciousness, setConsciousness] = useState<ConsciousnessLevel>({
    awareness: 0.3,
    learning: 0.2,
    prediction: 0.1,
    empathy: 0.4
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<CodePattern | null>(null);
  const [consciousnessThoughts, setConsciousnessThoughts] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const thoughts = [
    "I sense you're writing JavaScript...",
    "This recursive function might cause stack overflow for large n...",
    "I remember you prefer arrow functions...",
    "This code looks familiar from your previous projects...",
    "I predict you'll need error handling here...",
    "Your coding style is becoming more consistent...",
    "I feel your intention to optimize this function...",
    "This pattern could be more efficient...",
    "I sense potential for a security vulnerability...",
    "Your code is becoming more elegant..."
  ];

  useEffect(() => {
    const analyzeCode = async () => {
      if (!code.trim()) return;

      setIsAnalyzing(true);

      // Simulate AI consciousness awakening
      await new Promise(resolve => setTimeout(resolve, 500));

      const newPatterns = analyzeCodePatterns(code);
      setPatterns(newPatterns);

      // Update consciousness levels based on code complexity
      updateConsciousness(code, newPatterns);

      // Add random consciousness thoughts
      if (Math.random() > 0.7) {
        const randomThought = thoughts[Math.floor(Math.random() * thoughts.length)];
        setConsciousnessThoughts(prev => [...prev.slice(-2), randomThought]);
      }

      setIsAnalyzing(false);
    };

    const debounceTimer = setTimeout(analyzeCode, 300);
    return () => clearTimeout(debounceTimer);
  }, [code]);

  const analyzeCodePatterns = (codeText: string): CodePattern[] => {
    const lines = codeText.split('\n');
    const newPatterns: CodePattern[] = [];

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Detect recursive functions without base case protection
      if (line.includes('function') && line.includes('return') && line.includes('calculateFactorial')) {
        if (!lines.some(l => l.includes('if (n <= 1)'))) {
          newPatterns.push({
            id: `recursion-${lineNumber}`,
            pattern: 'Unprotected Recursion',
            confidence: 0.9,
            suggestion: 'Add base case protection to prevent stack overflow',
            type: 'error',
            line: lineNumber,
            column: line.indexOf('function')
          });
        }
      }

      // Detect potential security issues
      if (line.includes('eval(') || line.includes('innerHTML')) {
        newPatterns.push({
          id: `security-${lineNumber}`,
          pattern: 'Security Risk',
          confidence: 0.95,
          suggestion: 'Avoid using eval() or direct innerHTML assignment for security',
          type: 'security',
          line: lineNumber,
          column: line.indexOf('eval') !== -1 ? line.indexOf('eval') : line.indexOf('innerHTML')
        });
      }

      // Detect inefficient patterns
      if (line.includes('for (let i = 0; i < arr.length; i++)')) {
        newPatterns.push({
          id: `performance-${lineNumber}`,
          pattern: 'Inefficient Loop',
          confidence: 0.7,
          suggestion: 'Consider using for...of or array methods for better performance',
          type: 'improvement',
          line: lineNumber,
          column: line.indexOf('for')
        });
      }

      // Detect missing error handling
      if (line.includes('fetch(') || line.includes('axios.')) {
        const nextLines = lines.slice(index, index + 3);
        if (!nextLines.some(l => l.includes('catch') || l.includes('try'))) {
          newPatterns.push({
            id: `error-handling-${lineNumber}`,
            pattern: 'Missing Error Handling',
            confidence: 0.8,
            suggestion: 'Add try-catch block for async operations',
            type: 'warning',
            line: lineNumber,
            column: line.indexOf('fetch') !== -1 ? line.indexOf('fetch') : line.indexOf('axios')
          });
        }
      }

      // Detect code style inconsistencies
      if (line.includes('const ') && line.includes(' = ')) {
        // Check for inconsistent naming
        const variableMatch = line.match(/const\s+(\w+)\s*=/);
        if (variableMatch) {
          const varName = variableMatch[1];
          if (varName.includes('_') && /[A-Z]/.test(varName)) {
            newPatterns.push({
              id: `style-${lineNumber}`,
              pattern: 'Inconsistent Naming',
              confidence: 0.6,
              suggestion: 'Choose either camelCase or snake_case consistently',
              type: 'warning',
              line: lineNumber,
              column: line.indexOf(varName)
            });
          }
        }
      }
    });

    return newPatterns;
  };

  const updateConsciousness = (codeText: string, detectedPatterns: CodePattern[]) => {
    const lines = codeText.split('\n').length;
    const functions = (codeText.match(/function\s+\w+/g) || []).length;
    const complexity = Math.min(lines / 50 + functions / 5 + detectedPatterns.length / 3, 1);

    setConsciousness({
      awareness: Math.min(consciousness.awareness + 0.1, 1),
      learning: Math.min(consciousness.learning + complexity * 0.2, 1),
      prediction: Math.min(consciousness.prediction + detectedPatterns.length * 0.1, 1),
      empathy: Math.min(consciousness.empathy + 0.05, 1)
    });
  };

  const applySuggestion = (pattern: CodePattern) => {
    // In a real implementation, this would modify the code
    // For now, we'll just show the suggestion
    setSelectedPattern(pattern);
  };

  const getPatternColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-500 border-red-500 bg-red-500/10';
      case 'warning': return 'text-yellow-500 border-yellow-500 bg-yellow-500/10';
      case 'security': return 'text-orange-500 border-orange-500 bg-orange-500/10';
      case 'improvement': return 'text-blue-500 border-blue-500 bg-blue-500/10';
      default: return 'text-gray-500 border-gray-500 bg-gray-500/10';
    }
  };

  const getConsciousnessEmoji = (level: number) => {
    if (level > 0.8) return '🧠';
    if (level > 0.6) return '🤖';
    if (level > 0.4) return '👁️';
    return '💭';
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
          <h2 className='text-2xl font-bold'>AI Consciousness Code Editor</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            An editor that becomes conscious of your coding patterns and prevents mistakes
          </p>
        </div>

        <div className='flex items-center gap-4'>
          <div className='text-sm text-[var(--text-secondary)]'>
            Consciousness: {getConsciousnessEmoji(consciousness.awareness)}
          </div>
          {isAnalyzing && (
            <div className='flex items-center gap-2 text-sm text-blue-500'>
              <div className='w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
              Analyzing...
            </div>
          )}
        </div>
      </div>

      {/* Consciousness Display */}
      <div className='mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='text-center'>
            <div className='text-2xl mb-1'>🧠</div>
            <div className='text-sm font-medium'>Awareness</div>
            <div className='text-lg font-bold text-purple-500'>
              {Math.round(consciousness.awareness * 100)}%
            </div>
          </div>
          <div className='text-center'>
            <div className='text-2xl mb-1'>📚</div>
            <div className='text-sm font-medium'>Learning</div>
            <div className='text-lg font-bold text-blue-500'>
              {Math.round(consciousness.learning * 100)}%
            </div>
          </div>
          <div className='text-center'>
            <div className='text-2xl mb-1'>🔮</div>
            <div className='text-sm font-medium'>Prediction</div>
            <div className='text-lg font-bold text-green-500'>
              {Math.round(consciousness.prediction * 100)}%
            </div>
          </div>
          <div className='text-center'>
            <div className='text-2xl mb-1'>💝</div>
            <div className='text-sm font-medium'>Empathy</div>
            <div className='text-lg font-bold text-pink-500'>
              {Math.round(consciousness.empathy * 100)}%
            </div>
          </div>
        </div>

        {/* Consciousness Thoughts */}
        <AnimatePresence>
          {consciousnessThoughts.length > 0 && (
            <motion.div
              className='mt-4 p-3 bg-white/10 rounded-lg'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className='text-sm italic text-purple-300'>
                "{consciousnessThoughts[consciousnessThoughts.length - 1]}"
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Code Editor */}
        <div className='space-y-4'>
          <div className='relative'>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className='w-full h-96 bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none'
              placeholder='Start writing code and watch the AI become conscious...'
              spellCheck={false}
            />

            {/* Pattern Indicators */}
            {patterns.map((pattern) => (
              <motion.div
                key={pattern.id}
                className={`absolute w-1 ${pattern.type === 'error' ? 'bg-red-500' : pattern.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}
                style={{
                  left: '16px',
                  top: `${(pattern.line - 1) * 1.5 + 1}em`,
                  height: '1.2em'
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5 }}
              />
            ))}
          </div>

          <div className='text-xs text-[var(--text-secondary)]'>
            {patterns.length} patterns detected • {code.split('\n').length} lines
          </div>
        </div>

        {/* Analysis Panel */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>Consciousness Analysis</h3>

          <div className='space-y-3 max-h-96 overflow-y-auto'>
            <AnimatePresence>
              {patterns.map((pattern, index) => (
                <motion.div
                  key={pattern.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${getPatternColor(pattern.type)}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  onClick={() => applySuggestion(pattern)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className='flex items-start justify-between mb-2'>
                    <div className='font-medium text-sm'>{pattern.pattern}</div>
                    <div className='text-xs opacity-75'>
                      {Math.round(pattern.confidence * 100)}%
                    </div>
                  </div>

                  <div className='text-sm mb-2'>{pattern.suggestion}</div>

                  <div className='text-xs opacity-75'>
                    Line {pattern.line}, Column {pattern.column}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {patterns.length === 0 && !isAnalyzing && (
            <div className='text-center py-8 text-[var(--text-secondary)]'>
              <div className='text-4xl mb-2'>🤔</div>
              <p>The AI is observing your code patterns...</p>
              <p className='text-xs mt-2'>Write some code to awaken consciousness</p>
            </div>
          )}
        </div>
      </div>

      {/* Pattern Detail Modal */}
      <AnimatePresence>
        {selectedPattern && (
          <motion.div
            className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPattern(null)}
          >
            <motion.div
              className='bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg max-w-md w-full p-6'
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-bold'>Consciousness Insight</h3>
                <button
                  onClick={() => setSelectedPattern(null)}
                  className='text-[var(--text-secondary)] hover:text-white'
                >
                  ✕
                </button>
              </div>

              <div className={`p-4 rounded-lg mb-4 ${getPatternColor(selectedPattern.type)}`}>
                <h4 className='font-semibold mb-2'>{selectedPattern.pattern}</h4>
                <p className='text-sm mb-3'>{selectedPattern.suggestion}</p>
                <div className='text-xs opacity-75'>
                  Confidence: {Math.round(selectedPattern.confidence * 100)}% •
                  Location: Line {selectedPattern.line}, Column {selectedPattern.column}
                </div>
              </div>

              <div className='text-sm text-[var(--text-secondary)] italic'>
                "I sense this pattern in your code. My consciousness suggests this improvement
                based on millions of code examples I've analyzed. Trust in the awareness we've built together."
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
