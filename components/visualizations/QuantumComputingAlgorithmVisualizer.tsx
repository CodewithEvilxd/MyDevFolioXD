'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Qubit {
  id: number;
  state: '0' | '1' | 'superposition';
  probability0: number;
  probability1: number;
  phase: number;
  entangledWith: number[];
}

interface QuantumGate {
  id: string;
  name: string;
  qubits: number[];
  type: 'single' | 'two' | 'multi';
  matrix: number[][];
}

interface QuantumAlgorithm {
  name: string;
  description: string;
  qubits: number;
  gates: QuantumGate[];
  purpose: string;
}

export default function QuantumComputingAlgorithmVisualizer() {
  const [qubits, setQubits] = useState<Qubit[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('bell-state');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [entanglementMap, setEntanglementMap] = useState<Map<string, number>>(new Map());
  const [speed, setSpeed] = useState(1500);
  const [isSpeedChanging, setIsSpeedChanging] = useState(false);
  const [stepExplanation, setStepExplanation] = useState<string>('');

  const algorithms: Record<string, QuantumAlgorithm> = {
    'bell-state': {
      name: 'Bell State Preparation',
      description: 'Creates quantum entanglement between two qubits',
      qubits: 2,
      purpose: 'Demonstrates fundamental quantum entanglement',
      gates: [
        { id: 'h0', name: 'H', qubits: [0], type: 'single', matrix: [[1/Math.sqrt(2), 1/Math.sqrt(2)], [1/Math.sqrt(2), -1/Math.sqrt(2)]] },
        { id: 'cnot01', name: 'CNOT', qubits: [0, 1], type: 'two', matrix: [[1,0,0,0],[0,1,0,0],[0,0,0,1],[0,0,1,0]] }
      ]
    },
    'quantum-fourier': {
      name: 'Quantum Fourier Transform',
      description: 'Quantum version of the discrete Fourier transform',
      qubits: 3,
      purpose: 'Used in Shor\'s algorithm and quantum phase estimation',
      gates: [
        { id: 'h0', name: 'H', qubits: [0], type: 'single', matrix: [[1/Math.sqrt(2), 1/Math.sqrt(2)], [1/Math.sqrt(2), -1/Math.sqrt(2)]] },
        { id: 'h1', name: 'H', qubits: [1], type: 'single', matrix: [[1/Math.sqrt(2), 1/Math.sqrt(2)], [1/Math.sqrt(2), -1/Math.sqrt(2)]] },
        { id: 'h2', name: 'H', qubits: [2], type: 'single', matrix: [[1/Math.sqrt(2), 1/Math.sqrt(2)], [1/Math.sqrt(2), -1/Math.sqrt(2)]] },
        { id: 'cu1_01', name: 'CU1', qubits: [0, 1], type: 'two', matrix: [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,-1]] },
        { id: 'cu1_02', name: 'CU1', qubits: [0, 2], type: 'two', matrix: [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]] }
      ]
    },
    'grover-search': {
      name: 'Grover Search Algorithm',
      description: 'Quadratically faster database search on quantum computers',
      qubits: 3,
      purpose: 'Demonstrates quantum advantage in search problems',
      gates: [
        { id: 'h0', name: 'H', qubits: [0], type: 'single', matrix: [[1/Math.sqrt(2), 1/Math.sqrt(2)], [1/Math.sqrt(2), -1/Math.sqrt(2)]] },
        { id: 'h1', name: 'H', qubits: [1], type: 'single', matrix: [[1/Math.sqrt(2), 1/Math.sqrt(2)], [1/Math.sqrt(2), -1/Math.sqrt(2)]] },
        { id: 'h2', name: 'H', qubits: [2], type: 'single', matrix: [[1/Math.sqrt(2), 1/Math.sqrt(2)], [1/Math.sqrt(2), -1/Math.sqrt(2)]] },
        { id: 'oracle', name: 'Oracle', qubits: [0, 1, 2], type: 'multi', matrix: [] },
        { id: 'diffusion', name: 'Diffusion', qubits: [0, 1, 2], type: 'multi', matrix: [] }
      ]
    },
    'teleportation': {
      name: 'Quantum Teleportation',
      description: 'Transfer quantum state using entanglement and classical communication',
      qubits: 3,
      purpose: 'Fundamental quantum communication protocol',
      gates: [
        { id: 'bell_prep', name: 'Bell Prep', qubits: [1, 2], type: 'two', matrix: [] },
        { id: 'cnot_01', name: 'CNOT', qubits: [0, 1], type: 'two', matrix: [[1,0,0,0],[0,1,0,0],[0,0,0,1],[0,0,1,0]] },
        { id: 'h0', name: 'H', qubits: [0], type: 'single', matrix: [[1/Math.sqrt(2), 1/Math.sqrt(2)], [1/Math.sqrt(2), -1/Math.sqrt(2)]] },
        { id: 'measure', name: 'Measure', qubits: [0, 1], type: 'two', matrix: [] },
        { id: 'conditional_z', name: 'Z⊗I', qubits: [2], type: 'single', matrix: [[1,0],[0,-1]] }
      ]
    },
    'shor-algorithm': {
      name: 'Shor\'s Algorithm (Simplified)',
      description: 'Quantum algorithm for factoring large numbers',
      qubits: 4,
      purpose: 'Demonstrates exponential speedup for factoring',
      gates: [
        { id: 'h0', name: 'H', qubits: [0], type: 'single', matrix: [[1/Math.sqrt(2), 1/Math.sqrt(2)], [1/Math.sqrt(2), -1/Math.sqrt(2)]] },
        { id: 'h1', name: 'H', qubits: [1], type: 'single', matrix: [[1/Math.sqrt(2), 1/Math.sqrt(2)], [1/Math.sqrt(2), -1/Math.sqrt(2)]] },
        { id: 'qft', name: 'QFT', qubits: [0, 1], type: 'multi', matrix: [] },
        { id: 'measure', name: 'Measure', qubits: [0, 1], type: 'multi', matrix: [] }
      ]
    },
    'qaoa': {
      name: 'QAOA (Quantum Approximate Optimization)',
      description: 'Hybrid quantum-classical algorithm for optimization problems',
      qubits: 4,
      purpose: 'Combines quantum and classical computing for optimization',
      gates: [
        { id: 'h0', name: 'H', qubits: [0], type: 'single', matrix: [[1/Math.sqrt(2), 1/Math.sqrt(2)], [1/Math.sqrt(2), -1/Math.sqrt(2)]] },
        { id: 'h1', name: 'H', qubits: [1], type: 'single', matrix: [[1/Math.sqrt(2), 1/Math.sqrt(2)], [1/Math.sqrt(2), -1/Math.sqrt(2)]] },
        { id: 'h2', name: 'H', qubits: [2], type: 'single', matrix: [[1/Math.sqrt(2), 1/Math.sqrt(2)], [1/Math.sqrt(2), -1/Math.sqrt(2)]] },
        { id: 'h3', name: 'H', qubits: [3], type: 'single', matrix: [[1/Math.sqrt(2), 1/Math.sqrt(2)], [1/Math.sqrt(2), -1/Math.sqrt(2)]] },
        { id: 'cost_hamiltonian', name: 'Cost H', qubits: [0, 1, 2, 3], type: 'multi', matrix: [] },
        { id: 'mixer_hamiltonian', name: 'Mixer H', qubits: [0, 1, 2, 3], type: 'multi', matrix: [] }
      ]
    },
    'vqe': {
      name: 'Variational Quantum Eigensolver',
      description: 'Quantum algorithm for finding molecular ground state energies',
      qubits: 4,
      purpose: 'Key algorithm for quantum chemistry simulations',
      gates: [
        { id: 'prep', name: 'State Prep', qubits: [0, 1, 2, 3], type: 'multi', matrix: [] },
        { id: 'ansatz', name: 'Ansatz', qubits: [0, 1, 2, 3], type: 'multi', matrix: [] },
        { id: 'measure', name: 'Measure', qubits: [0, 1, 2, 3], type: 'multi', matrix: [] }
      ]
    }
  };

  useEffect(() => {
    initializeQubits();
  }, [selectedAlgorithm]);

  const initializeQubits = () => {
    const algorithm = algorithms[selectedAlgorithm];
    const initialQubits: Qubit[] = Array.from({ length: algorithm.qubits }, (_, i) => ({
      id: i,
      state: '0',
      probability0: 1,
      probability1: 0,
      phase: 0,
      entangledWith: []
    }));
    setQubits(initialQubits);
    setCurrentStep(0);
    setEntanglementMap(new Map());
  };

  const runAlgorithm = async () => {
    if (isRunning && !isPaused) return;

    setIsRunning(true);
    setIsPaused(false);
    setCurrentStep(0);
    setStepExplanation('');

    const algorithm = algorithms[selectedAlgorithm];

    for (let i = 0; i < algorithm.gates.length; i++) {
      if (!isRunning) break; // Stop if reset

      setCurrentStep(i);
      setStepExplanation(getGateExplanation(algorithm.gates[i], algorithm.name));

      // Simulate gate application
      applyGate(algorithm.gates[i]);

      // Use current speed value (not captured in closure)
      await new Promise(resolve => setTimeout(resolve, speed));

      while (isPaused && isRunning) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    setIsRunning(false);
    setStepExplanation('Algorithm completed!');
  };

  const pauseAlgorithm = () => {
    setIsPaused(!isPaused);
  };

  const resetAlgorithm = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStep(0);
    setStepExplanation('');
    initializeQubits();
  };

  const applyGate = (gate: QuantumGate) => {
    setQubits(prevQubits => {
      const newQubits = [...prevQubits];

      if (gate.name === 'H') {
        // Hadamard gate - creates superposition
        const qubit = newQubits[gate.qubits[0]];
        qubit.state = 'superposition';
        qubit.probability0 = 0.5;
        qubit.probability1 = 0.5;
        qubit.phase = Math.PI / 4;
      } else if (gate.name === 'CNOT') {
        // CNOT gate - creates entanglement
        const control = newQubits[gate.qubits[0]];
        const target = newQubits[gate.qubits[1]];

        if (control.state === '1' || (control.state === 'superposition' && control.probability1 > 0.5)) {
          target.state = 'superposition';
          target.probability0 = 0.5;
          target.probability1 = 0.5;
        }

        // Mark as entangled
        control.entangledWith.push(target.id);
        target.entangledWith.push(control.id);

        setEntanglementMap(prev => new Map(prev.set(`${control.id}-${target.id}`, 1)));
      } else if (gate.name === 'CU1') {
        // Controlled phase gate
        const control = newQubits[gate.qubits[0]];
        const target = newQubits[gate.qubits[1]];

        if (control.state === '1') {
          target.phase += Math.PI / 2;
        }
      } else if (gate.name === 'QFT') {
        // Quantum Fourier Transform - put all qubits in superposition
        gate.qubits.forEach(q => {
          const qubit = newQubits[q];
          qubit.state = 'superposition';
          qubit.probability0 = 0.5;
          qubit.probability1 = 0.5;
          qubit.phase = Math.random() * Math.PI;
        });
      } else if (gate.name === 'Cost H' || gate.name === 'Mixer H' || gate.name === 'Ansatz') {
        // Variational gates - mix states
        gate.qubits.forEach(q => {
          const qubit = newQubits[q];
          qubit.state = 'superposition';
          qubit.probability0 = Math.random() * 0.6 + 0.2;
          qubit.probability1 = 1 - qubit.probability0;
          qubit.phase += Math.random() * Math.PI / 2;
        });
      }

      return newQubits;
    });
  };

  const getQubitColor = (qubit: Qubit) => {
    if (qubit.state === 'superposition') return '#A855F7';
    if (qubit.state === '1') return '#EC4899';
    return '#10B981';
  };

  const getGateColor = (gateName: string) => {
    switch (gateName) {
      case 'H': return '#3B82F6';
      case 'CNOT': return '#EF4444';
      case 'CU1': return '#F59E0B';
      case 'Oracle': return '#8B5CF6';
      case 'Diffusion': return '#06B6D4';
      case 'QFT': return '#10B981';
      case 'Cost H': return '#F59E0B';
      case 'Mixer H': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getGateExplanation = (gate: QuantumGate, algorithmName: string) => {
    switch (gate.name) {
      case 'H':
        return `Applying Hadamard gate to qubit ${gate.qubits[0]}. This creates superposition, putting the qubit in equal probability of |0⟩ and |1⟩ states.`;
      case 'CNOT':
        return `Applying CNOT gate with qubit ${gate.qubits[0]} as control and ${gate.qubits[1]} as target. This creates entanglement between the qubits.`;
      case 'CU1':
        return `Applying controlled phase gate, adding quantum phase to create interference patterns.`;
      case 'Oracle':
        return `Applying the oracle function that marks the solution state in Grover's search algorithm.`;
      case 'Diffusion':
        return `Applying the diffusion operator (amplitude amplification) to increase the probability of the correct solution.`;
      case 'QFT':
        return `Applying Quantum Fourier Transform to convert between computational and frequency domains.`;
      case 'Measure':
        return `Measuring qubits ${gate.qubits.join(', ')} to collapse the quantum state to classical bits.`;
      default:
        return `Applying ${gate.name} gate to qubits ${gate.qubits.join(', ')}.`;
    }
  };

  const algorithm = algorithms[selectedAlgorithm];

  return (
    <motion.div
      className='card'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-bold'>Quantum Computing Algorithm Visualizer</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Visualize quantum algorithms running on simulated quantum hardware
          </p>
        </div>

        <div className='flex items-center gap-4'>
          <select
            value={selectedAlgorithm}
            onChange={(e) => setSelectedAlgorithm(e.target.value)}
            className='bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
          >
            {Object.entries(algorithms).map(([key, alg]) => (
              <option key={key} value={key}>{alg.name}</option>
            ))}
          </select>

          <div className='flex items-center gap-4'>
            <button
              onClick={runAlgorithm}
              disabled={isRunning && !isPaused}
              className='px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all disabled:opacity-50 font-medium flex items-center gap-2'
            >
              {isRunning && !isPaused ? (
                <>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                  Running...
                </>
              ) : (
                <>
                  <span>⚛️</span>
                  {isPaused ? 'Resume' : 'Run Algorithm'}
                </>
              )}
            </button>

            {isRunning && (
              <button
                onClick={pauseAlgorithm}
                className='px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all font-medium'
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            )}

            <button
              onClick={resetAlgorithm}
              className='px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all font-medium'
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Algorithm Info */}
      <div className='mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <h3 className='font-semibold text-blue-600'>{algorithm.name}</h3>
            <p className='text-sm text-[var(--text-secondary)]'>{algorithm.description}</p>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-[var(--primary)]'>{algorithm.qubits}</div>
            <div className='text-sm text-[var(--text-secondary)]'>Qubits</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-[var(--primary)]'>{algorithm.gates.length}</div>
            <div className='text-sm text-[var(--text-secondary)]'>Gates</div>
          </div>
        </div>
        <p className='text-sm text-[var(--text-secondary)] mt-2 italic'>
          {algorithm.purpose}
        </p>
      </div>

      {/* Speed Control */}
      <div className='mb-6 p-4 bg-gradient-to-r from-gray-500/10 to-slate-500/10 border border-gray-500/20 rounded-lg'>
        <div className='flex flex-col gap-3'>
          <div className='flex items-center gap-3'>
            <span className='text-sm font-medium text-[var(--text-primary)]'>Animation Speed:</span>
            <div className='flex items-center gap-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg px-3 py-2 flex-1'>
              <input
                type='range'
                min='200'
                max='5000'
                step='100'
                value={speed}
                onChange={(e) => {
                  setSpeed(Number(e.target.value));
                  setIsSpeedChanging(true);
                  setTimeout(() => setIsSpeedChanging(false), 500);
                }}
                className='flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider'
                style={{
                  background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${(speed - 200) / (5000 - 200) * 100}%, #374151 ${(speed - 200) / (5000 - 200) * 100}%, #374151 100%)`
                }}
              />
              <div className='flex items-center gap-2'>
                <span className={`text-sm font-mono font-bold transition-all duration-300 ${isSpeedChanging ? 'text-yellow-400 scale-110' : 'text-[var(--primary)]'}`}>
                  {speed}ms
                </span>
                {isSpeedChanging && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className='text-yellow-400'
                  >
                    ⚡
                  </motion.span>
                )}
              </div>
            </div>
          </div>

          {/* Preset Speed Buttons */}
          <div className='flex items-center gap-2'>
            <span className='text-xs text-[var(--text-secondary)] font-medium'>Presets:</span>
            <div className='flex gap-1 flex-wrap'>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSpeed(300);
                  setIsSpeedChanging(true);
                  setTimeout(() => setIsSpeedChanging(false), 500);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  speed === 300
                    ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                    : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:border-green-500 hover:text-green-400'
                }`}
              >
                Turbo
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSpeed(800);
                  setIsSpeedChanging(true);
                  setTimeout(() => setIsSpeedChanging(false), 500);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  speed === 800
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:border-blue-500 hover:text-blue-400'
                }`}
              >
                Fast
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSpeed(1500);
                  setIsSpeedChanging(true);
                  setTimeout(() => setIsSpeedChanging(false), 500);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  speed === 1500
                    ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30'
                    : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
                }`}
              >
                Normal
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSpeed(2500);
                  setIsSpeedChanging(true);
                  setTimeout(() => setIsSpeedChanging(false), 500);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  speed === 2500
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                    : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:border-orange-500 hover:text-orange-400'
                }`}
              >
                Slow
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSpeed(4000);
                  setIsSpeedChanging(true);
                  setTimeout(() => setIsSpeedChanging(false), 500);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  speed === 4000
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:border-red-500 hover:text-red-400'
                }`}
              >
                Very Slow
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Quantum Circuit Visualization */}
      <div className='mb-6 p-4 bg-gray-900 rounded-lg border border-gray-700 overflow-x-auto'>
        <h3 className='text-white font-semibold mb-4'>Quantum Circuit</h3>

        <svg width={Math.max(600, algorithm.gates.length * 80)} height={algorithm.qubits * 60 + 40} className='w-full'>
          {/* Qubit lines */}
          {Array.from({ length: algorithm.qubits }).map((_, i) => (
            <line
              key={`qubit-${i}`}
              x1='40'
              y1={i * 60 + 40}
              x2={algorithm.gates.length * 80 + 40}
              y2={i * 60 + 40}
              stroke='#4B5563'
              strokeWidth='2'
            />
          ))}

          {/* Qubit labels */}
          {Array.from({ length: algorithm.qubits }).map((_, i) => (
            <text
              key={`label-${i}`}
              x='20'
              y={i * 60 + 45}
              className='text-sm fill-gray-400 font-mono'
            >
              |q{i}⟩
            </text>
          ))}

          {/* Gates */}
          {algorithm.gates.map((gate, gateIndex) => (
            <g key={gate.id}>
              {gate.qubits.map((qubitIndex, qubitPos) => {
                const x = gateIndex * 80 + 60;
                const y = qubitIndex * 60 + 40;
                const isActive = isRunning && currentStep === gateIndex;

                return (
                  <motion.g key={`${gate.id}-${qubitIndex}`}>
                    {/* Gate box */}
                    <motion.rect
                      x={x - 20}
                      y={y - 15}
                      width='40'
                      height='30'
                      fill={getGateColor(gate.name)}
                      stroke={isActive ? '#F59E0B' : '#374151'}
                      strokeWidth={isActive ? '3' : '1'}
                      rx='4'
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{
                        scale: isActive ? 1.2 : 1,
                        opacity: 1
                      }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Gate text */}
                    <text
                      x={x}
                      y={y + 5}
                      textAnchor='middle'
                      className='text-xs fill-white font-bold'
                    >
                      {gate.name}
                    </text>

                    {/* Connection lines for multi-qubit gates */}
                    {gate.qubits.length > 1 && qubitPos > 0 && (
                      <line
                        x1={x}
                        y1={gate.qubits[0] * 60 + 40}
                        x2={x}
                        y2={y}
                        stroke={getGateColor(gate.name)}
                        strokeWidth='2'
                      />
                    )}
                  </motion.g>
                );
              })}
            </g>
          ))}
        </svg>
      </div>

      {/* Qubit States */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
        {qubits.map((qubit, index) => (
          <motion.div
            key={qubit.id}
            className='p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <div className='flex items-center justify-between mb-3'>
              <h4 className='font-semibold'>Qubit |q{qubit.id}⟩</h4>
              <div
                className='w-3 h-3 rounded-full'
                style={{ backgroundColor: getQubitColor(qubit) }}
              />
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>|0⟩:</span>
                <span className='font-mono'>
                  {(qubit.probability0 * 100).toFixed(1)}%
                </span>
              </div>
              <div className='w-full bg-[var(--card-border)] rounded-full h-2'>
                <motion.div
                  className='h-2 bg-green-500 rounded-full'
                  style={{ width: `${qubit.probability0 * 100}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${qubit.probability0 * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className='flex justify-between text-sm'>
                <span>|1⟩:</span>
                <span className='font-mono'>
                  {(qubit.probability1 * 100).toFixed(1)}%
                </span>
              </div>
              <div className='w-full bg-[var(--card-border)] rounded-full h-2'>
                <motion.div
                  className='h-2 bg-red-500 rounded-full'
                  style={{ width: `${qubit.probability1 * 100}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${qubit.probability1 * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {qubit.phase !== 0 && (
                <div className='text-xs text-[var(--text-secondary)]'>
                  Phase: {(qubit.phase / Math.PI).toFixed(2)}π
                </div>
              )}

              {qubit.entangledWith.length > 0 && (
                <div className='text-xs text-purple-600'>
                  Entangled with: q{qubit.entangledWith.join(', q')}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Entanglement Visualization */}
      {entanglementMap.size > 0 && (
        <div className='p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg'>
          <h3 className='font-semibold mb-3 text-purple-600'>Quantum Entanglement Map</h3>
          <div className='flex flex-wrap gap-2'>
            {Array.from(entanglementMap.entries()).map(([pair, strength]) => (
              <motion.div
                key={pair}
                className='px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm'
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                {pair} (Strength: {strength})
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Step Explanation */}
      {stepExplanation && (
        <div className='mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg'>
          <p className='text-sm text-blue-600'>{stepExplanation}</p>
        </div>
      )}

      {/* Algorithm Progress */}
      <div className='mt-6 flex items-center justify-between text-sm text-[var(--text-secondary)]'>
        <span>Step {currentStep + 1} of {algorithm.gates.length}</span>
        <div className='w-32 h-2 bg-[var(--card-border)] rounded-full overflow-hidden'>
          <motion.div
            className='h-full bg-[var(--primary)] rounded-full'
            style={{ width: `${((currentStep + 1) / algorithm.gates.length) * 100}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / algorithm.gates.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </motion.div>
  );
}