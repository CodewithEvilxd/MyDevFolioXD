'use client';

import { useState, useEffect } from 'react';
import { Repository } from '@/types';
import { motion } from 'framer-motion';
import { createGitHubHeaders } from '@/lib/githubToken';

interface DependencyNode {
  id: string;
  name: string;
  repo: string;
  type: 'file' | 'module' | 'package';
  connections: string[];
  x: number;
  y: number;
  entangledWith: string[];
}

interface QuantumCodeEntanglementVisualizerProps {
  username: string;
  repos: Repository[];
}

export default function QuantumCodeEntanglementVisualizer({ username, repos }: QuantumCodeEntanglementVisualizerProps) {
  const [dependencyGraph, setDependencyGraph] = useState<DependencyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<DependencyNode | null>(null);
  const [entanglementMode, setEntanglementMode] = useState(false);

  useEffect(() => {
    const analyzeCodeEntanglements = async () => {
      if (!username || !repos || repos.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const headers = createGitHubHeaders();
        const nodes: DependencyNode[] = [];
        const processedFiles = new Set<string>();

        // Analyze top repositories for dependencies
        for (const repo of repos.slice(0, 10)) {
          try {
            // Get repository contents
            const contentsResponse = await fetch(
              `https://api.github.com/repos/${username}/${repo.name}/contents`,
              { headers }
            );

            if (!contentsResponse.ok) {
              if (contentsResponse.status === 404) {
                console.log(`Repository ${repo.name} not found or not accessible`);
              } else {
                console.log(`Failed to fetch contents for ${repo.name}: ${contentsResponse.status}`);
              }
              continue;
            }

            let contents: any[] = [];
            try {
              const responseText = await contentsResponse.text();
              if (responseText.trim() === '') {
                console.log(`Empty response for contents in ${repo.name}`);
                continue;
              }
              contents = JSON.parse(responseText);
            } catch (parseError) {
              console.error(`Failed to parse contents JSON for ${repo.name}:`, parseError);
              continue;
            }

            if (!Array.isArray(contents)) {
              console.error(`Contents data is not an array for ${repo.name}`);
              continue;
            }

            // Find code files
            const codeFiles = contents.filter((item: any) =>
              item.type === 'file' &&
              (item.name.endsWith('.js') || item.name.endsWith('.ts') ||
               item.name.endsWith('.py') || item.name.endsWith('.java') ||
               item.name.endsWith('.cpp') || item.name.endsWith('.c'))
            );

            for (const file of codeFiles.slice(0, 5)) { // Limit files per repo
              if (processedFiles.has(file.path)) continue;
              processedFiles.add(file.path);

              try {
                const fileResponse = await fetch(file.download_url);
                if (!fileResponse.ok) continue;

                const code = await fileResponse.text();
                const dependencies = extractDependencies(code, file.name.split('.').pop() || '');

                const node: DependencyNode = {
                  id: `${repo.name}-${file.name}`,
                  name: file.name,
                  repo: repo.name,
                  type: 'file',
                  connections: dependencies,
                  x: Math.random() * 800,
                  y: Math.random() * 600,
                  entangledWith: []
                };

                nodes.push(node);
              } catch (error) {
                console.log(`Could not analyze ${file.name}`);
              }
            }
          } catch (error) {
            console.log(`Could not analyze repo ${repo.name}`);
          }
        }

        // Create entanglement connections based on shared dependencies
        const entangledNodes = nodes.map(node => {
          const entangledWith: string[] = [];

          nodes.forEach(otherNode => {
            if (node.id !== otherNode.id) {
              const sharedDeps = node.connections.filter(dep =>
                otherNode.connections.includes(dep)
              );

              if (sharedDeps.length > 0) {
                entangledWith.push(otherNode.id);
              }
            }
          });

          return { ...node, entangledWith };
        });

        setDependencyGraph(entangledNodes);
      } catch (error) {
        console.error('Error analyzing code entanglements:', error);
      } finally {
        setLoading(false);
      }
    };

    analyzeCodeEntanglements();
  }, [username, repos]);

  const extractDependencies = (code: string, language: string): string[] => {
    const dependencies: string[] = [];

    if (language === 'js' || language === 'ts') {
      // Extract import statements
      const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(code)) !== null) {
        dependencies.push(match[1]);
      }

      // Extract require statements
      const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
      while ((match = requireRegex.exec(code)) !== null) {
        dependencies.push(match[1]);
      }
    } else if (language === 'py') {
      // Extract Python imports
      const importRegex = /^(?:from\s+(\S+)\s+import|import\s+(\S+))/gm;
      let match;
      while ((match = importRegex.exec(code)) !== null) {
        dependencies.push(match[1] || match[2]);
      }
    } else if (language === 'java') {
      // Extract Java imports
      const importRegex = /^import\s+([^;]+);/gm;
      let match;
      while ((match = importRegex.exec(code)) !== null) {
        dependencies.push(match[1]);
      }
    }

    return Array.from(new Set(dependencies)); // Remove duplicates
  };

  const toggleEntanglementMode = () => {
    setEntanglementMode(!entanglementMode);
  };

  if (loading) {
    return (
      <div className='card'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold'>Quantum Code Entanglement Visualizer</h2>
          <div className='w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin'></div>
        </div>
        <div className='animate-pulse space-y-4'>
          <div className='h-64 bg-[var(--card-border)] rounded-lg'></div>
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
          <h2 className='text-2xl font-bold'>Quantum Code Entanglement Visualizer</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Visualize quantum-like connections between your code dependencies
          </p>
        </div>

        <div className='flex items-center gap-4'>
          <div className='text-sm text-[var(--text-secondary)]'>
            {dependencyGraph.length} entangled files
          </div>
          <button
            onClick={toggleEntanglementMode}
            className={`px-4 py-2 rounded-lg transition-colors ${
              entanglementMode
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--primary)]'
            }`}
          >
            {entanglementMode ? '🌌 Quantum Mode' : '🔗 Normal Mode'}
          </button>
        </div>
      </div>

      {/* Visualization Canvas */}
      <div className='relative h-96 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-lg overflow-hidden border border-purple-500/20'>
        <svg className='w-full h-full' viewBox='0 0 800 600'>
          {/* Entanglement connections */}
          {entanglementMode && dependencyGraph.map(node =>
            node.entangledWith.map(entangledId => {
              const entangledNode = dependencyGraph.find(n => n.id === entangledId);
              if (!entangledNode) return null;

              return (
                <motion.line
                  key={`${node.id}-${entangledId}`}
                  x1={node.x}
                  y1={node.y}
                  x2={entangledNode.x}
                  y2={entangledNode.y}
                  stroke="url(#entanglementGradient)"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: 2, delay: Math.random() * 2 }}
                  className="drop-shadow-lg"
                />
              );
            })
          )}

          {/* Normal dependency connections */}
          {!entanglementMode && dependencyGraph.map(node =>
            node.connections.slice(0, 3).map((dep, index) => {
              // Find if there's a node that provides this dependency
              const providerNode = dependencyGraph.find(n =>
                n.name.includes(dep.split('/').pop() || '') ||
                n.connections.some(c => c.includes(dep))
              );

              if (!providerNode || providerNode.id === node.id) return null;

              return (
                <motion.line
                  key={`${node.id}-dep-${index}`}
                  x1={node.x}
                  y1={node.y}
                  x2={providerNode.x}
                  y2={providerNode.y}
                  stroke="#60A5FA"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                />
              );
            })
          )}

          {/* Nodes */}
          {dependencyGraph.map((node, index) => (
            <motion.g
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={entanglementMode ? (node.entangledWith.length + 1) * 3 : 8}
                fill={entanglementMode ? '#A855F7' : '#3B82F6'}
                stroke={selectedNode?.id === node.id ? '#F59E0B' : '#1F2937'}
                strokeWidth="2"
                className="cursor-pointer hover:stroke-yellow-400 transition-colors"
                onClick={() => setSelectedNode(node)}
                whileHover={{ scale: 1.2 }}
                animate={entanglementMode ? {
                  r: (node.entangledWith.length + 1) * 3,
                  fill: node.entangledWith.length > 2 ? '#EC4899' : '#A855F7'
                } : {}}
              />

              {/* Node label */}
              <text
                x={node.x}
                y={node.y - 15}
                textAnchor="middle"
                className="text-xs fill-white font-medium pointer-events-none"
                style={{ fontSize: '10px' }}
              >
                {node.name}
              </text>

              {/* Repo indicator */}
              <text
                x={node.x}
                y={node.y + 18}
                textAnchor="middle"
                className="text-xs fill-gray-400 pointer-events-none"
                style={{ fontSize: '8px' }}
              >
                {node.repo}
              </text>
            </motion.g>
          ))}

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="entanglementGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#EC4899" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating particles for quantum effect */}
        {entanglementMode && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-60"
                initial={{
                  x: Math.random() * 800,
                  y: Math.random() * 600,
                  scale: 0
                }}
                animate={{
                  x: Math.random() * 800,
                  y: Math.random() * 600,
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Node Details Panel */}
      {selectedNode && (
        <motion.div
          className='mt-6 p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className='flex items-center justify-between mb-3'>
            <h3 className='font-bold text-lg'>{selectedNode.name}</h3>
            <button
              onClick={() => setSelectedNode(null)}
              className='text-[var(--text-secondary)] hover:text-white'
            >
              ✕
            </button>
          </div>

          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='text-[var(--text-secondary)]'>Repository:</span>
              <span className='ml-2 font-medium'>{selectedNode.repo}</span>
            </div>
            <div>
              <span className='text-[var(--text-secondary)]'>Type:</span>
              <span className='ml-2 font-medium capitalize'>{selectedNode.type}</span>
            </div>
            <div>
              <span className='text-[var(--text-secondary)]'>Dependencies:</span>
              <span className='ml-2 font-medium'>{selectedNode.connections.length}</span>
            </div>
            {entanglementMode && (
              <div>
                <span className='text-[var(--text-secondary)]'>Entangled With:</span>
                <span className='ml-2 font-medium'>{selectedNode.entangledWith.length} files</span>
              </div>
            )}
          </div>

          {selectedNode.connections.length > 0 && (
            <div className='mt-4'>
              <h4 className='font-medium mb-2'>Key Dependencies:</h4>
              <div className='flex flex-wrap gap-2'>
                {selectedNode.connections.slice(0, 8).map(dep => (
                  <span
                    key={dep}
                    className='px-2 py-1 bg-[var(--background)] text-xs rounded-full'
                  >
                    {dep.split('/').pop()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Legend */}
      <div className='mt-4 flex flex-wrap gap-4 text-xs text-[var(--text-secondary)]'>
        <div className='flex items-center gap-2'>
          <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
          <span>Code File</span>
        </div>
        {!entanglementMode && (
          <div className='flex items-center gap-2'>
            <div className='w-4 h-0.5 bg-blue-400 opacity-60'></div>
            <span>Dependency Link</span>
          </div>
        )}
        {entanglementMode && (
          <>
            <div className='flex items-center gap-2'>
              <div className='w-4 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500'></div>
              <span>Quantum Entanglement</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 bg-pink-500 rounded-full animate-pulse'></div>
              <span>High Entanglement</span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}