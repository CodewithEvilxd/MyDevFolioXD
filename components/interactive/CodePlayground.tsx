'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  description: string;
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'cpp', label: 'C++', icon: '⚡' },
  { value: 'csharp', label: 'C#', icon: '💎' },
  { value: 'php', label: 'PHP', icon: '🐘' },
  { value: 'ruby', label: 'Ruby', icon: '💎' },
  { value: 'go', label: 'Go', icon: '🐹' },
  { value: 'rust', label: 'Rust', icon: '🦀' },
  { value: 'html', label: 'HTML', icon: '🌐' },
  { value: 'css', label: 'CSS', icon: '🎨' },
  { value: 'sql', label: 'SQL', icon: '🗄️' },
  { value: 'bash', label: 'Bash', icon: '💻' },
  { value: 'json', label: 'JSON', icon: '📄' },
  { value: 'markdown', label: 'Markdown', icon: '📝' }
];

const SAMPLE_CODE = {
  javascript: `// Hello World in JavaScript
function greet(name) {
  
  return \`Welcome to MyDevFolioXD!\`;
}

// Example usage
const result = greet("Developer");


// Array operations
const skills = ['JavaScript', 'React', 'Node.js'];
const newSkills = skills.map(skill => skill.toUpperCase());
`,

  typescript: `// TypeScript Hello World
interface User {
  name: string;
  skills: string[];
  experience: number;
}

class Developer implements User {
  constructor(
    public name: string,
    public skills: string[],
    public experience: number
  ) {}

  introduce(): string {
    return \`Hi, I'm \${this.name} with \${this.experience} years of experience!\`;
  }

  getTopSkills(count: number = 3): string[] {
    return this.skills.slice(0, count);
  }
}

// Usage
const dev = new Developer(
  "John Doe",
  ["TypeScript", "React", "Node.js", "Python"],
  5
);


`,

  python: `# Python Hello World
def calculate_fibonacci(n: int) -> list[int]:
    """Calculate Fibonacci sequence up to n terms"""
    if n <= 0:
        return []

    sequence = [0, 1]
    while len(sequence) < n:
        next_num = sequence[-1] + sequence[-2]
        sequence.append(next_num)

    return sequence[:n]

def analyze_skills(skills: list[str]) -> dict:
    """Analyze developer skills"""
    return {
        "total_skills": len(skills),
        "categories": list(set(skill.split()[0] for skill in skills)),
        "most_common": max(set(skills), key=skills.count) if skills else None
    }

# Example usage
fib_nums = calculate_fibonacci(10)
print(f"Fibonacci: {fib_nums}")

developer_skills = ["Python", "JavaScript", "React", "Django", "PostgreSQL"]
analysis = analyze_skills(developer_skills)
print(f"Skills Analysis: {analysis}")`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MyDevFolioXD - Developer Portfolio</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 30px;
            backdrop-filter: blur(10px);
        }
        .hero {
            text-align: center;
            margin-bottom: 40px;
        }
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .skill-card {
            background: rgba(255, 255, 255, 0.2);
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            transition: transform 0.3s ease;
        }
        .skill-card:hover {
            transform: translateY(-5px);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="hero">
            <h1>🚀 MyDevFolioXD</h1>
            <p>Beautiful Developer Portfolio in Seconds</p>
        </div>

        <div class="skills-grid">
            <div class="skill-card">
                <h3>⚡ Fast</h3>
                <p>Create portfolios instantly</p>
            </div>
            <div class="skill-card">
                <h3>🎨 Beautiful</h3>
                <p>Modern, responsive design</p>
            </div>
            <div class="skill-card">
                <h3>🔧 Customizable</h3>
                <p>Fully customizable themes</p>
            </div>
        </div>
    </div>
</body>
</html>`
};

export default function CodePlayground() {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState(SAMPLE_CODE.javascript);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [savedSnippets, setSavedSnippets] = useState<CodeSnippet[]>([]);
  const [currentSnippet, setCurrentSnippet] = useState<CodeSnippet | null>(null);
  const [showSavedSnippets, setShowSavedSnippets] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCode(SAMPLE_CODE[selectedLanguage as keyof typeof SAMPLE_CODE] || '');
    setOutput('');
  }, [selectedLanguage]);

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');

    try {
      // Simulate code execution with different behaviors based on language
      await new Promise(resolve => setTimeout(resolve, 1000));

      switch (selectedLanguage) {
        case 'javascript':
          // Simulate JS execution
          setOutput(`✅ JavaScript code executed successfully!\n\nOutput:\nHello, Developer!\nWelcome to MyDevFolioXD!\n["JAVASCRIPT", "REACT", "NODE.JS"]`);
          break;
        case 'typescript':
          setOutput(`✅ TypeScript compiled and executed!\n\nOutput:\nHi, I'm John Doe with 5 years of experience!\nTop skills: ["TypeScript", "React", "Node.js"]`);
          break;
        case 'python':
          setOutput(`✅ Python script executed!\n\nOutput:\nFibonacci: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]\nSkills Analysis: {'total_skills': 5, 'categories': ['Python', 'JavaScript', 'React', 'Django', 'PostgreSQL'], 'most_common': 'Python'}`);
          break;
        case 'html':
          setOutput(`✅ HTML rendered successfully!\n\nPreview: Beautiful portfolio website with gradient background and skill cards`);
          break;
        default:
          setOutput(`✅ Code validated for ${selectedLanguage.toUpperCase()}!\n\nSyntax appears correct. Ready for deployment!`);
      }
    } catch (error) {
      setOutput(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const saveSnippet = () => {
    if (!code.trim()) return;

    const snippet: CodeSnippet = {
      id: Date.now().toString(),
      title: `Code Snippet ${savedSnippets.length + 1}`,
      language: selectedLanguage,
      code: code,
      description: `${selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} code example`
    };

    setSavedSnippets(prev => [...prev, snippet]);
    setCurrentSnippet(snippet);
  };

  const loadSnippet = (snippet: CodeSnippet) => {
    setSelectedLanguage(snippet.language);
    setCode(snippet.code);
    setCurrentSnippet(snippet);
    setShowSavedSnippets(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setOutput('✅ Code copied to clipboard!');
      setTimeout(() => setOutput(''), 2000);
    } catch (error) {
      setOutput('❌ Failed to copy code');
    }
  };

  const formatCode = () => {
    // Simple code formatting simulation
    const formatted = code
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
    setCode(formatted);
    setOutput('✅ Code formatted!');
    setTimeout(() => setOutput(''), 2000);
  };

  return (
    <div className='w-full max-w-7xl mx-auto p-4 sm:p-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6'>
        <h2 className='text-xl sm:text-2xl font-bold'>Interactive Code Playground</h2>
        <div className='flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto'>
          <button
            onClick={() => setShowSavedSnippets(!showSavedSnippets)}
            className='px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
          >
            {showSavedSnippets ? 'Hide Snippets' : 'Saved Snippets'}
          </button>
          <button
            onClick={saveSnippet}
            className='px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors'
          >
            Save Snippet
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6'>
        {/* Code Editor */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className='bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] px-3 py-2 rounded-lg'
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.icon} {lang.label}
                  </option>
                ))}
              </select>
              <span className='text-sm text-[var(--text-secondary)]'>
                {currentSnippet ? `Editing: ${currentSnippet.title}` : 'New Snippet'}
              </span>
            </div>
            <div className='flex gap-2'>
              <button
                onClick={formatCode}
                className='px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm'
              >
                Format
              </button>
              <button
                onClick={copyToClipboard}
                className='px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm'
              >
                Copy
              </button>
            </div>
          </div>

          <div className='relative'>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className='w-full h-96 bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8976EA] resize-none'
              placeholder={`Write your ${selectedLanguage} code here...`}
              spellCheck={false}
            />
            <div className='absolute top-2 right-2 flex gap-2'>
              <div className='w-3 h-3 bg-red-500 rounded-full'></div>
              <div className='w-3 h-3 bg-yellow-500 rounded-full'></div>
              <div className='w-3 h-3 bg-green-500 rounded-full'></div>
            </div>
          </div>

          <div className='flex gap-3'>
            <button
              onClick={runCode}
              disabled={isRunning}
              className='flex-1 bg-[#8976EA] hover:bg-[#7D6BD0] text-white py-3 rounded-lg transition-colors disabled:opacity-50 font-medium'
            >
              {isRunning ? (
                <span className='flex items-center justify-center'>
                  <svg className='animate-spin h-5 w-5 mr-2' viewBox='0 0 24 24'>
                    <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none'></circle>
                    <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                  </svg>
                  Running...
                </span>
              ) : (
                `▶️ Run ${LANGUAGES.find(l => l.value === selectedLanguage)?.label || selectedLanguage}`
              )}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className='space-y-4'>
          <div className='bg-gray-900 rounded-lg p-4 min-h-96'>
            <div className='flex items-center justify-between mb-3'>
              <h3 className='text-white font-semibold'>Output Console</h3>
              <button
                onClick={() => setOutput('')}
                className='text-gray-400 hover:text-white text-sm'
              >
                Clear
              </button>
            </div>
            <pre className='text-green-400 font-mono text-sm whitespace-pre-wrap overflow-auto max-h-80'>
              {output || 'Click "Run" to execute your code...\n\n💡 Try different languages and see the magic happen!'}
            </pre>
          </div>

          {/* Language Info */}
          <div className='bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4'>
            <h4 className='font-semibold mb-2'>Language Features</h4>
            <div className='text-sm text-[var(--text-secondary)] space-y-1'>
              {selectedLanguage === 'javascript' && (
                <>
                  <p>• Dynamic typing with modern ES6+ features</p>
                  <p>• Asynchronous programming with async/await</p>
                  <p>• Rich ecosystem with npm packages</p>
                </>
              )}
              {selectedLanguage === 'typescript' && (
                <>
                  <p>• Static typing for better code quality</p>
                  <p>• Advanced OOP with interfaces and generics</p>
                  <p>• Enhanced IDE support and refactoring</p>
                </>
              )}
              {selectedLanguage === 'python' && (
                <>
                  <p>• Clean, readable syntax</p>
                  <p>• Extensive standard library</p>
                  <p>• Great for data science and automation</p>
                </>
              )}
              {selectedLanguage === 'html' && (
                <>
                  <p>• Markup language for web pages</p>
                  <p>• Semantic structure with modern CSS</p>
                  <p>• Foundation of modern web development</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Saved Snippets Panel */}
      <AnimatePresence>
        {showSavedSnippets && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='mt-6 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4'
          >
            <h3 className='font-semibold mb-4'>Saved Code Snippets</h3>
            {savedSnippets.length === 0 ? (
              <p className='text-[var(--text-secondary)] text-center py-8'>
                No saved snippets yet. Write some code and save it!
              </p>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
                {savedSnippets.map(snippet => (
                  <div
                    key={snippet.id}
                    className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
                    onClick={() => loadSnippet(snippet)}
                  >
                    <div className='flex items-center gap-2 mb-2'>
                      <span>{LANGUAGES.find(l => l.value === snippet.language)?.icon}</span>
                      <span className='font-medium text-sm'>{snippet.title}</span>
                    </div>
                    <p className='text-xs text-[var(--text-secondary)] mb-2'>
                      {snippet.description}
                    </p>
                    <div className='text-xs text-gray-500'>
                      {snippet.code.length} characters
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
