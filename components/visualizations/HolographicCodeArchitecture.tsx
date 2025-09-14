'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CodeNode {
  id: string;
  name: string;
  type: 'module' | 'function' | 'class' | 'component' | 'service' | 'data';
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  connections: string[];
  complexity: number;
  dependencies: number;
}

interface HolographicLayer {
  id: string;
  name: string;
  nodes: CodeNode[];
  opacity: number;
  rotation: number;
}

export default function HolographicCodeArchitecture() {
  const [layers, setLayers] = useState<HolographicLayer[]>([]);
  const [selectedNode, setSelectedNode] = useState<CodeNode | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | '2d' | 'flow'>('3d');
  const [isAnimating, setIsAnimating] = useState(true);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    initializeArchitecture();
  }, []);

  const initializeArchitecture = () => {
    // Simulate analyzing a codebase and creating holographic layers
    const mockLayers: HolographicLayer[] = [
      {
        id: 'frontend',
        name: 'Frontend Layer',
        opacity: 0.9,
        rotation: 0,
        nodes: [
          { id: 'app', name: 'App.tsx', type: 'component', x: 0, y: 0, z: 0, size: 20, color: '#61DAFB', connections: ['router', 'auth'], complexity: 8, dependencies: 5 },
          { id: 'router', name: 'Router', type: 'service', x: 30, y: 20, z: 10, size: 15, color: '#FF6B6B', connections: ['dashboard', 'profile'], complexity: 5, dependencies: 2 },
          { id: 'dashboard', name: 'Dashboard', type: 'component', x: 60, y: 10, z: 5, size: 18, color: '#4ECDC4', connections: ['api'], complexity: 7, dependencies: 3 },
          { id: 'auth', name: 'AuthService', type: 'service', x: -30, y: -20, z: -5, size: 12, color: '#45B7D1', connections: ['api'], complexity: 4, dependencies: 1 }
        ]
      },
      {
        id: 'backend',
        name: 'Backend Layer',
        opacity: 0.7,
        rotation: 45,
        nodes: [
          { id: 'api', name: 'API Gateway', type: 'service', x: 0, y: 50, z: 20, size: 16, color: '#F39C12', connections: ['db', 'cache'], complexity: 6, dependencies: 4 },
          { id: 'db', name: 'Database', type: 'data', x: 40, y: 70, z: 15, size: 14, color: '#E74C3C', connections: [], complexity: 3, dependencies: 0 },
          { id: 'cache', name: 'Redis Cache', type: 'service', x: -20, y: 60, z: 25, size: 10, color: '#9B59B6', connections: ['db'], complexity: 2, dependencies: 1 },
          { id: 'worker', name: 'Background Worker', type: 'service', x: 20, y: 80, z: 10, size: 11, color: '#1ABC9C', connections: ['queue'], complexity: 4, dependencies: 2 }
        ]
      },
      {
        id: 'infrastructure',
        name: 'Infrastructure Layer',
        opacity: 0.5,
        rotation: 90,
        nodes: [
          { id: 'docker', name: 'Docker', type: 'service', x: -50, y: 30, z: 30, size: 13, color: '#2496ED', connections: ['k8s'], complexity: 3, dependencies: 1 },
          { id: 'k8s', name: 'Kubernetes', type: 'service', x: -70, y: 50, z: 35, size: 15, color: '#326CE5', connections: ['monitoring'], complexity: 5, dependencies: 3 },
          { id: 'monitoring', name: 'Monitoring', type: 'service', x: -40, y: 80, z: 40, size: 9, color: '#F1C40F', connections: [], complexity: 2, dependencies: 0 },
          { id: 'ci', name: 'CI/CD', type: 'service', x: 50, y: 90, z: 45, size: 12, color: '#E67E22', connections: ['docker'], complexity: 4, dependencies: 2 }
        ]
      }
    ];

    setLayers(mockLayers);
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'component': return '🧩';
      case 'service': return '⚙️';
      case 'data': return '💾';
      case 'function': return '🔧';
      case 'class': return '🏗️';
      case 'module': return '📦';
      default: return '🔵';
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'component': return '#61DAFB';
      case 'service': return '#FF6B6B';
      case 'data': return '#4ECDC4';
      case 'function': return '#45B7D1';
      case 'class': return '#F39C12';
      case 'module': return '#E74C3C';
      default: return '#9B59B6';
    }
  };

  const renderConnections = (layer: HolographicLayer) => {
    const connections: JSX.Element[] = [];

    layer.nodes.forEach(node => {
      node.connections.forEach(targetId => {
        const targetNode = layer.nodes.find(n => n.id === targetId);
        if (targetNode) {
          const distance = Math.sqrt(
            Math.pow(targetNode.x - node.x, 2) +
            Math.pow(targetNode.y - node.y, 2) +
            Math.pow(targetNode.z - node.z, 2)
          );

          connections.push(
            <motion.line
              key={`${node.id}-${targetId}`}
              x1={node.x}
              y1={node.y}
              x2={targetNode.x}
              y2={targetNode.y}
              stroke={`rgba(255, 255, 255, ${layer.opacity * 0.3})`}
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: Math.random() * 2 }}
            />
          );
        }
      });
    });

    return connections;
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
          <h2 className='text-2xl font-bold'>Holographic Code Architecture</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Explore your codebase in immersive 3D holographic space
          </p>
        </div>

        <div className='flex items-center gap-4'>
          <div className='flex bg-[var(--card-bg)] border border-[var(--card-border)] rounded-md p-1'>
            {['3d', '2d', 'flow'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === mode
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {mode.toUpperCase()}
              </button>
            ))}
          </div>

          <div className='flex items-center gap-2'>
            <span className='text-sm text-[var(--text-secondary)]'>Zoom:</span>
            <input
              type='range'
              min='0.5'
              max='2'
              step='0.1'
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className='w-20'
            />
            <span className='text-sm text-[var(--text-secondary)]'>{zoom.toFixed(1)}x</span>
          </div>

          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className='px-3 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded transition-colors'
          >
            {isAnimating ? '⏸️' : '▶️'}
          </button>
        </div>
      </div>

      {/* Holographic Visualization */}
      <div className='relative h-96 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-lg border border-purple-500/20 overflow-hidden mb-6'>
        <svg
          width='100%'
          height='100%'
          viewBox='-100 -100 200 200'
          className='w-full h-full'
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Grid background */}
          <defs>
            <pattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'>
              <path d='M 20 0 L 0 0 0 20' fill='none' stroke='rgba(255,255,255,0.1)' strokeWidth='1'/>
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill='url(#grid)' />

          {/* Render layers */}
          {layers.map((layer, layerIndex) => (
            <g key={layer.id} style={{ opacity: layer.opacity }}>
              {/* Connections */}
              {renderConnections(layer)}

              {/* Nodes */}
              {layer.nodes.map((node, nodeIndex) => (
                <motion.g
                  key={node.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: isAnimating ? [1, 1.1, 1] : 1,
                    opacity: 1,
                    rotate: isAnimating ? [0, 360] : 0
                  }}
                  transition={{
                    delay: (layerIndex * 0.5) + (nodeIndex * 0.1),
                    duration: isAnimating ? 3 : 0,
                    repeat: isAnimating ? Infinity : 0,
                    repeatType: 'reverse'
                  }}
                  onClick={() => setSelectedNode(node)}
                  className='cursor-pointer'
                >
                  {/* Node glow effect */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.size + 5}
                    fill={node.color}
                    opacity='0.2'
                    filter='blur(4px)'
                  />

                  {/* Node circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.size}
                    fill={node.color}
                    stroke='rgba(255,255,255,0.3)'
                    strokeWidth='2'
                  />

                  {/* Node icon */}
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor='middle'
                    className='text-lg pointer-events-none'
                    style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.5))' }}
                  >
                    {getNodeIcon(node.type)}
                  </text>

                  {/* Node label */}
                  <text
                    x={node.x}
                    y={node.y + node.size + 15}
                    textAnchor='middle'
                    className='text-xs fill-white font-medium'
                    style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))' }}
                  >
                    {node.name}
                  </text>
                </motion.g>
              ))}
            </g>
          ))}
        </svg>

        {/* Layer indicators */}
        <div className='absolute top-4 left-4 space-y-2'>
          {layers.map((layer, index) => (
            <div
              key={layer.id}
              className='flex items-center gap-2 px-3 py-1 bg-black/50 rounded-full text-xs text-white backdrop-blur-sm'
            >
              <div
                className='w-2 h-2 rounded-full'
                style={{ backgroundColor: `hsl(${index * 120}, 70%, 50%)` }}
              />
              {layer.name}
            </div>
          ))}
        </div>
      </div>

      {/* Architecture Metrics */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6'>
        <motion.div
          className='text-center p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className='text-2xl font-bold text-[var(--primary)]'>
            {layers.reduce((sum, layer) => sum + layer.nodes.length, 0)}
          </div>
          <div className='text-sm text-[var(--text-secondary)]'>Total Components</div>
        </motion.div>

        <motion.div
          className='text-center p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className='text-2xl font-bold text-green-500'>
            {layers.reduce((sum, layer) => sum + layer.nodes.reduce((s, n) => s + n.connections.length, 0), 0)}
          </div>
          <div className='text-sm text-[var(--text-secondary)]'>Connections</div>
        </motion.div>

        <motion.div
          className='text-center p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className='text-2xl font-bold text-blue-500'>
            {layers.length}
          </div>
          <div className='text-sm text-[var(--text-secondary)]'>Architecture Layers</div>
        </motion.div>

        <motion.div
          className='text-center p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg'
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className='text-2xl font-bold text-purple-500'>
            {(() => {
              const totalNodes = layers.reduce((sum, layer) => sum + layer.nodes.length, 0);
              const totalComplexity = layers.reduce((sum, layer) => sum + layer.nodes.reduce((s, n) => s + n.complexity, 0), 0);
              return totalNodes > 0 ? Math.round(totalComplexity / totalNodes) : 0;
            })()}
          </div>
          <div className='text-sm text-[var(--text-secondary)]'>Avg Complexity</div>
        </motion.div>
      </div>

      {/* Node Detail Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            className='mt-6 p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-4'>
                <div
                  className='w-12 h-12 rounded-full flex items-center justify-center text-2xl'
                  style={{ backgroundColor: `${selectedNode.color}20`, color: selectedNode.color }}
                >
                  {getNodeIcon(selectedNode.type)}
                </div>
                <div>
                  <h3 className='text-xl font-bold'>{selectedNode.name}</h3>
                  <p className='text-[var(--text-secondary)] capitalize'>{selectedNode.type}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className='text-[var(--text-secondary)] hover:text-white p-2'
              >
                ✕
              </button>
            </div>

            <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
              <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
                <div className='text-lg font-bold' style={{ color: selectedNode.color }}>
                  {selectedNode.complexity}
                </div>
                <div className='text-xs text-[var(--text-secondary)]'>Complexity</div>
              </div>

              <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
                <div className='text-lg font-bold text-blue-500'>
                  {selectedNode.connections.length}
                </div>
                <div className='text-xs text-[var(--text-secondary)]'>Connections</div>
              </div>

              <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
                <div className='text-lg font-bold text-green-500'>
                  {selectedNode.dependencies}
                </div>
                <div className='text-xs text-[var(--text-secondary)]'>Dependencies</div>
              </div>

              <div className='text-center p-3 bg-[var(--card-bg)] rounded-lg'>
                <div className='text-lg font-bold text-purple-500'>
                  {selectedNode.size}
                </div>
                <div className='text-xs text-[var(--text-secondary)]'>Size</div>
              </div>
            </div>

            {selectedNode.connections.length > 0 && (
              <div className='mt-4'>
                <h4 className='font-semibold mb-2'>Connected To:</h4>
                <div className='flex flex-wrap gap-2'>
                  {selectedNode.connections.map(conn => (
                    <span
                      key={conn}
                      className='px-3 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-full text-sm'
                    >
                      {conn}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
