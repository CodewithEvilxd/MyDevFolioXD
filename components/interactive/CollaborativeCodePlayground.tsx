'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  cursor: { x: number; y: number };
  isActive: boolean;
  lastSeen: Date;
}

interface CodeSnippet {
  id: string;
  title: string;
  code: string;
  language: string;
  author: string;
  collaborators: string[];
  upvotes: number;
  createdAt: Date;
}

export default function CollaborativeCodePlayground() {
  const [code, setCode] = useState(`// Welcome to Collaborative Code Playground!
// Multiple developers can edit this code simultaneously
// Try it out - your changes will be visible to others

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}


for (let i = 0; i < 10; i++) {
  
}`);
  const [language, setLanguage] = useState('javascript');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(null);
  const [isLiveSession, setIsLiveSession] = useState(false);
  const [output, setOutput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{user: string, message: string, timestamp: Date}>>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Simulate joining a collaborative session
    joinSession();
    loadSnippets();
  }, []);

  const joinSession = () => {
    const mockCollaborators: Collaborator[] = [
      {
        id: '1',
        name: 'Alice Dev',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
        cursor: { x: 100, y: 50 },
        isActive: true,
        lastSeen: new Date()
      },
      {
        id: '2',
        name: 'Bob Coder',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
        cursor: { x: 200, y: 80 },
        isActive: true,
        lastSeen: new Date()
      },
      {
        id: '3',
        name: 'Charlie JS',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
        cursor: { x: 150, y: 120 },
        isActive: false,
        lastSeen: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      }
    ];
    setCollaborators(mockCollaborators);
    setIsLiveSession(true);
  };

  const loadSnippets = () => {
    const mockSnippets: CodeSnippet[] = [
      {
        id: '1',
        title: 'React Component Pattern',
        code: `import React, { useState, useEffect } from 'react';

const DataFetcher = ({ url }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [url]);

  if (loading) return <div>Loading...</div>;
  return <div>{JSON.stringify(data)}</div>;
};

export default DataFetcher;`,
        language: 'javascript',
        author: 'Alice Dev',
        collaborators: ['Bob Coder', 'Charlie JS'],
        upvotes: 15,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '2',
        title: 'Python Data Analysis',
        code: `import pandas as pd
import matplotlib.pyplot as plt

# Load and analyze data
df = pd.read_csv('data.csv')
print(df.head())

# Create visualization
plt.figure(figsize=(10, 6))
df['column'].hist(bins=30)
plt.title('Data Distribution')
plt.xlabel('Value')
plt.ylabel('Frequency')
plt.show()`,
        language: 'python',
        author: 'Bob Coder',
        collaborators: ['Alice Dev'],
        upvotes: 8,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      }
    ];
    setSnippets(mockSnippets);
  };

  const runCode = async () => {
    setOutput('Executing code...\n');

    // Simulate code execution
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (language === 'javascript') {
      try {
        // Simulate JS execution
        setOutput(`✅ Code executed successfully!\n\nOutput:\nFibonacci sequence:\nF(0) = 0\nF(1) = 1\nF(2) = 1\nF(3) = 2\nF(4) = 3\nF(5) = 5\nF(6) = 8\nF(7) = 13\nF(8) = 21\nF(9) = 34`);
      } catch (error) {
        setOutput(`❌ Error: ${error}`);
      }
    } else {
      setOutput(`✅ ${language.toUpperCase()} code validated successfully!\n\nReady for execution in your local environment.`);
    }
  };

  const saveSnippet = () => {
    const newSnippet: CodeSnippet = {
      id: Date.now().toString(),
      title: `Collaborative Snippet ${snippets.length + 1}`,
      code,
      language,
      author: 'You',
      collaborators: collaborators.filter(c => c.isActive).map(c => c.name),
      upvotes: 0,
      createdAt: new Date()
    };

    setSnippets(prev => [newSnippet, ...prev]);
    setOutput('✅ Snippet saved and shared with collaborators!');
    setTimeout(() => setOutput(''), 3000);
  };

  const upvoteSnippet = (snippetId: string) => {
    setSnippets(prev => prev.map(snippet =>
      snippet.id === snippetId
        ? { ...snippet, upvotes: snippet.upvotes + 1 }
        : snippet
    ));
  };

  const sendChatMessage = (message: string) => {
    if (message.trim()) {
      setChatMessages(prev => [...prev, {
        user: 'You',
        message: message.trim(),
        timestamp: new Date()
      }]);
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
          <h2 className='text-2xl font-bold'>Collaborative Code Playground</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Code together with developers worldwide in real-time
          </p>
        </div>

        <div className='flex items-center gap-4'>
          {isLiveSession && (
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
              <span className='text-sm text-green-500 font-medium'>
                {collaborators.filter(c => c.isActive).length} online
              </span>
            </div>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Code Editor */}
        <div className='lg:col-span-2 space-y-4'>
          <div className='flex items-center justify-between'>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className='bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] px-3 py-2 rounded-md'
            >
              <option value='javascript'>JavaScript</option>
              <option value='typescript'>TypeScript</option>
              <option value='python'>Python</option>
              <option value='java'>Java</option>
              <option value='cpp'>C++</option>
              <option value='go'>Go</option>
              <option value='rust'>Rust</option>
            </select>

            <div className='flex gap-2'>
              <button
                onClick={runCode}
                className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors'
              >
                ▶️ Run
              </button>
              <button
                onClick={saveSnippet}
                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
              >
                💾 Save
              </button>
            </div>
          </div>

          <div className='relative'>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className='w-full h-64 bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
              placeholder='Start coding collaboratively...'
              spellCheck={false}
            />

            {/* Collaborator cursors */}
            {collaborators.filter(c => c.isActive).map(collaborator => (
              <motion.div
                key={collaborator.id}
                className='absolute pointer-events-none'
                style={{
                  left: collaborator.cursor.x,
                  top: collaborator.cursor.y
                }}
                animate={{
                  x: collaborator.cursor.x + (Math.random() - 0.5) * 20,
                  y: collaborator.cursor.y + (Math.random() - 0.5) * 20
                }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
              >
                <div className='relative'>
                  <div className='w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg'></div>
                  <div className='absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap'>
                    {collaborator.name}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Output */}
          <div className='bg-gray-900 rounded-lg p-4 min-h-32'>
            <h4 className='text-white font-medium mb-2'>Output</h4>
            <pre className='text-green-400 font-mono text-sm whitespace-pre-wrap'>
              {output || 'Click "Run" to execute your code...\n\n💡 Your code is being shared with collaborators in real-time!'}
            </pre>
          </div>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Online Collaborators */}
          <div>
            <h3 className='text-lg font-semibold mb-3'>Online Collaborators</h3>
            <div className='space-y-3'>
              {collaborators.map(collaborator => (
                <div key={collaborator.id} className='flex items-center gap-3'>
                  <div className='relative'>
                    <img
                      src={collaborator.avatar}
                      alt={collaborator.name}
                      className='w-8 h-8 rounded-full border-2 border-gray-600'
                    />
                    {collaborator.isActive && (
                      <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white'></div>
                    )}
                  </div>
                  <div className='flex-1'>
                    <div className='text-sm font-medium'>{collaborator.name}</div>
                    <div className='text-xs text-[var(--text-secondary)]'>
                      {collaborator.isActive ? 'Online' : `Last seen ${Math.floor((Date.now() - collaborator.lastSeen.getTime()) / (1000 * 60))}m ago`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shared Snippets */}
          <div>
            <h3 className='text-lg font-semibold mb-3'>Shared Snippets</h3>
            <div className='space-y-3 max-h-64 overflow-y-auto'>
              {snippets.map(snippet => (
                <div
                  key={snippet.id}
                  className='p-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg cursor-pointer hover:border-[var(--primary)] transition-colors'
                  onClick={() => {
                    setSelectedSnippet(snippet);
                    setCode(snippet.code);
                    setLanguage(snippet.language);
                  }}
                >
                  <h4 className='font-medium text-sm mb-1'>{snippet.title}</h4>
                  <div className='flex items-center justify-between text-xs text-[var(--text-secondary)]'>
                    <span>{snippet.author}</span>
                    <div className='flex items-center gap-2'>
                      <span>👍 {snippet.upvotes}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          upvoteSnippet(snippet.id);
                        }}
                        className='text-green-500 hover:text-green-600'
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Chat */}
          <div>
            <h3 className='text-lg font-semibold mb-3'>Quick Chat</h3>
            <div className='bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 max-h-48 overflow-y-auto mb-3'>
              {chatMessages.length === 0 ? (
                <p className='text-[var(--text-secondary)] text-sm text-center'>No messages yet</p>
              ) : (
                chatMessages.slice(-5).map((msg, index) => (
                  <div key={index} className='text-sm mb-2'>
                    <span className='font-medium text-[var(--primary)]'>{msg.user}:</span>
                    <span className='text-[var(--text-secondary)] ml-2'>{msg.message}</span>
                  </div>
                ))
              )}
            </div>
            <input
              type='text'
              placeholder='Type a message...'
              className='w-full bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] px-3 py-2 rounded-md text-sm'
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  sendChatMessage(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Snippet Detail Modal */}
      <AnimatePresence>
        {selectedSnippet && (
          <motion.div
            className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedSnippet(null)}
          >
            <motion.div
              className='bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden'
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className='p-6 border-b border-[var(--card-border)]'>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-xl font-bold'>{selectedSnippet.title}</h2>
                  <button
                    onClick={() => setSelectedSnippet(null)}
                    className='text-[var(--text-secondary)] hover:text-white p-2'
                  >
                    ✕
                  </button>
                </div>

                <div className='flex items-center gap-4 text-sm text-[var(--text-secondary)]'>
                  <span>👤 {selectedSnippet.author}</span>
                  <span>💻 {selectedSnippet.language}</span>
                  <span>👍 {selectedSnippet.upvotes}</span>
                  <span>👥 {selectedSnippet.collaborators.length} collaborators</span>
                </div>
              </div>

              <div className='p-6'>
                <h3 className='font-semibold mb-3'>Code</h3>
                <div className='bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto'>
                  <pre className='text-green-400 font-mono text-sm whitespace-pre-wrap'>
                    <code>{selectedSnippet.code}</code>
                  </pre>
                </div>

                <div className='mt-4'>
                  <h3 className='font-semibold mb-2'>Collaborators</h3>
                  <div className='flex flex-wrap gap-2'>
                    {selectedSnippet.collaborators.map(collaborator => (
                      <span
                        key={collaborator}
                        className='px-3 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-full text-sm'
                      >
                        {collaborator}
                      </span>
                    ))}
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
