'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createGitHubHeaders } from '@/lib/githubToken';

interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  description: string;
  tags: string[];
  featured: boolean;
  repo: string;
  file: string;
  url: string;
  stars: number;
}

interface CodeSnippetShowcaseProps {
  username: string;
  repos: any[];
}

export default function CodeSnippetShowcase({ username, repos }: CodeSnippetShowcaseProps) {
  const [codeSnippets, setCodeSnippets] = useState<CodeSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCodeSnippets = async () => {
      if (!username || !repos || repos.length === 0 || typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      try {
        const headers = createGitHubHeaders();
        const snippets: CodeSnippet[] = [];

        // Get top 5 repositories by stars
        const topRepos = repos
          .filter(repo => !repo.fork && repo.language)
          .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
          .slice(0, 5);

        for (const repo of topRepos) {
          try {
            // Try to fetch README.md first
            const readmeResponse = await fetch(
              `https://api.github.com/repos/${username}/${repo.name}/contents/README.md`,
              { headers }
            );

            if (readmeResponse.ok) {
              const readmeData = await readmeResponse.json();
              const content = atob(readmeData.content);

              // Extract code blocks from README
              const codeBlocks = extractCodeBlocks(content, repo.language || 'markdown');
              codeBlocks.forEach((block, index) => {
                if (block.code.length > 50 && block.code.length < 1000) {
                  snippets.push({
                    id: `${repo.name}-readme-${index}`,
                    title: `${repo.name} - ${block.title || 'Code Example'}`,
                    language: block.language,
                    code: block.code,
                    description: `Code example from ${repo.name} README`,
                    tags: [repo.language || 'code', 'example', 'readme'],
                    featured: index === 0 && repo.stargazers_count > 10,
                    repo: repo.name,
                    file: 'README.md',
                    url: `https://github.com/${username}/${repo.name}#readme`,
                    stars: repo.stargazers_count || 0
                  });
                }
              });
            }

            // Try to fetch main source file with multiple fallback attempts
            const mainFiles = getMainFileForLanguage(repo.language);
            let fileFetched = false;

            if (mainFiles && mainFiles.length > 0) {
              for (const mainFile of mainFiles) {
                if (fileFetched) break;

              try {
                const mainFileResponse = await fetch(
                  `https://api.github.com/repos/${username}/${repo.name}/contents/${mainFile}`,
                  { headers }
                );

                if (mainFileResponse.ok) {
                  const mainFileData = await mainFileResponse.json();
                  const content = atob(mainFileData.content);

                  // Extract meaningful code snippets
                  const snippetsFromFile = extractMeaningfulSnippets(content, repo.language || 'text', mainFile);
                  snippetsFromFile.forEach((snippet, index) => {
                    if (snippet.code.length > 100 && snippet.code.length < 800) {
                      snippets.push({
                        id: `${repo.name}-${mainFile}-${index}`,
                        title: `${repo.name} - ${snippet.title}`,
                        language: repo.language || 'text',
                        code: snippet.code,
                        description: snippet.description,
                        tags: [repo.language || 'code', 'source', mainFile.split('.').pop() || 'file'],
                        featured: repo.stargazers_count > 50,
                        repo: repo.name,
                        file: mainFile,
                        url: `https://github.com/${username}/${repo.name}/blob/main/${mainFile}`,
                        stars: repo.stargazers_count || 0
                      });
                    }
                  });
                  fileFetched = true;
                } else if (mainFileResponse.status === 404) {
                  // File doesn't exist, try next fallback
                  continue;
                } else {
                  // Other error, break out
                  break;
                }
              } catch (error) {
                
                // Continue to next fallback
              }
            }
            }
          } catch (error) {
            
          }
        }

        // Sort by stars and featured status
        snippets.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.stars - a.stars;
        });

        setCodeSnippets(snippets);
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    fetchCodeSnippets();
  }, [username, repos]);

  const getMainFileForLanguage = (language: string | null): string[] => {
    const mainFiles: { [key: string]: string[] } = {
      'javascript': ['index.js', 'app.js', 'main.js', 'server.js'],
      'typescript': ['index.ts', 'app.ts', 'main.ts', 'server.ts'],
      'python': ['main.py', 'app.py', '__main__.py', 'run.py'],
      'java': ['Main.java', 'App.java', 'Application.java'],
      'cpp': ['main.cpp', 'app.cpp', 'Main.cpp'],
      'c': ['main.c', 'app.c', 'Main.c'],
      'go': ['main.go', 'app.go', 'server.go'],
      'rust': ['src/main.rs', 'main.rs'],
      'php': ['index.php', 'app.php', 'main.php'],
      'ruby': ['app.rb', 'main.rb', 'application.rb'],
      'swift': ['main.swift', 'App.swift'],
      'kotlin': ['Main.kt', 'App.kt', 'Application.kt']
    };
    return mainFiles[language?.toLowerCase() || ''] || [];
  };

  const extractCodeBlocks = (content: string, defaultLanguage: string) => {
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    const blocks: { language: string; code: string; title: string }[] = [];
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1] || defaultLanguage;
      const code = match[2].trim();
      const lines = code.split('\n');
      const title = lines[0].startsWith('//') || lines[0].startsWith('#') || lines[0].startsWith('/*')
        ? lines[0].replace(/^\/\/|^#|^\/\*/, '').trim()
        : `Code block in ${language}`;

      blocks.push({ language, code, title });
    }

    return blocks;
  };

  const extractMeaningfulSnippets = (content: string, language: string, filename: string) => {
    const lines = content.split('\n');
    const snippets: { title: string; code: string; description: string }[] = [];

    // Extract functions, classes, or meaningful code blocks
    if (language === 'javascript' || language === 'typescript') {
      const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|function)|class\s+(\w+))/g;
      let match;
      while ((match = functionRegex.exec(content)) !== null) {
        const funcName = match[1] || match[2] || match[3];
        const startIndex = match.index;
        const endIndex = findFunctionEnd(content, startIndex);

        if (endIndex > startIndex) {
          const code = content.substring(startIndex, endIndex).trim();
          if (code.length > 100 && code.length < 800) {
            snippets.push({
              title: `${funcName} function`,
              code,
              description: `Function ${funcName} from ${filename}`
            });
          }
        }
      }
    } else if (language === 'python') {
      const functionRegex = /def\s+(\w+)\s*\(/g;
      let match;
      while ((match = functionRegex.exec(content)) !== null) {
        const funcName = match[1];
        const startIndex = match.index;
        const endIndex = findPythonFunctionEnd(content, startIndex);

        if (endIndex > startIndex) {
          const code = content.substring(startIndex, endIndex).trim();
          if (code.length > 100 && code.length < 800) {
            snippets.push({
              title: `${funcName} function`,
              code,
              description: `Python function ${funcName} from ${filename}`
            });
          }
        }
      }
    }

    // If no functions found, extract meaningful code sections
    if (snippets.length === 0) {
      for (let i = 0; i < lines.length; i += 20) {
        const chunk = lines.slice(i, i + 20).join('\n').trim();
        if (chunk.length > 100 && chunk.length < 800 && !chunk.includes('import') && !chunk.includes('from')) {
          snippets.push({
            title: `Code section ${Math.floor(i / 20) + 1}`,
            code: chunk,
            description: `Code snippet from ${filename}`
          });
        }
      }
    }

    return snippets.slice(0, 3); // Limit to 3 snippets per file
  };

  const findFunctionEnd = (content: string, startIndex: number): number => {
    let braceCount = 0;
    let inString = false;
    let stringChar = '';

    for (let i = startIndex; i < content.length; i++) {
      const char = content[i];

      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar && content[i - 1] !== '\\') {
        inString = false;
      } else if (!inString) {
        if (char === '{') braceCount++;
        else if (char === '}') {
          braceCount--;
          if (braceCount === 0) return i + 1;
        }
      }
    }

    return startIndex + 500; // Fallback
  };

  const findPythonFunctionEnd = (content: string, startIndex: number): number => {
    const lines = content.split('\n');
    const startLine = content.substring(0, startIndex).split('\n').length - 1;

    for (let i = startLine + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '' || line.startsWith(' ') || line.startsWith('\t')) continue;
      if (!line.startsWith(' ') && !line.startsWith('\t') && line !== '') {
        return content.split('\n').slice(0, i).join('\n').length;
      }
    }

    return startIndex + 500; // Fallback
  };

  const copyToClipboard = async (code: string, id: string) => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      } else if (typeof document !== 'undefined') {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (error) {
      
    }
  };

  const languages = Array.from(new Set(codeSnippets.map(snippet => snippet.language)));
  const filteredSnippets = codeSnippets
    .filter(snippet =>
      selectedLanguage === 'all' || snippet.language === selectedLanguage
    )
    .filter(snippet =>
      searchTerm === '' ||
      snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const featuredSnippets = filteredSnippets.filter(snippet => snippet.featured);
  const regularSnippets = filteredSnippets.filter(snippet => !snippet.featured);

  if (loading) {
    return (
      <div className='card'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold'>Code Snippets</h2>
          <div className='w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin'></div>
        </div>
        <div className='animate-pulse space-y-4'>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='h-32 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className='w-full'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className='flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4'>
        <div>
          <h2 className='section-heading'>Code Snippets</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            {codeSnippets.length} code snippets from your repositories
          </p>
        </div>

        <div className='flex flex-col sm:flex-row gap-2'>
          <input
            type='text'
            placeholder='Search snippets...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='px-3 py-2 text-sm bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
          />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className='px-3 py-2 text-sm bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'
          >
            <option value='all'>All Languages</option>
            {languages.map(lang => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Featured Snippets */}
      {featuredSnippets.length > 0 && (
        <div className='mb-8'>
          <h3 className='text-lg font-bold mb-4 flex items-center gap-2'>
            <span className='text-yellow-500'>⭐</span>
            Featured Snippets
          </h3>
          <div className='grid gap-4'>
            {featuredSnippets.map((snippet, index) => (
              <motion.div
                key={snippet.id}
                className='card cursor-pointer group'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedSnippet(snippet)}
                whileHover={{ scale: 1.02 }}
              >
                <div className='flex items-start justify-between mb-3'>
                  <div className='flex-1'>
                    <h4 className='font-bold text-lg mb-1 group-hover:text-[var(--primary)] transition-colors'>
                      {snippet.title}
                    </h4>
                    <p className='text-[var(--text-secondary)] text-sm mb-2'>
                      {snippet.description}
                    </p>
                    <div className='flex items-center gap-2 text-xs text-[var(--text-secondary)]'>
                      <span>📁 {snippet.repo}</span>
                      <span>⭐ {snippet.stars}</span>
                    </div>
                  </div>
                  <div className='flex flex-col items-end gap-2'>
                    <span className='px-2 py-1 bg-yellow-500 text-white text-xs rounded-full'>
                      Featured
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(snippet.code, snippet.id);
                      }}
                      className='p-1 hover:bg-[var(--card-border)] rounded transition-colors'
                      title='Copy to clipboard'
                    >
                      {copiedId === snippet.id ? (
                        <svg className='w-4 h-4 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                        </svg>
                      ) : (
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className='bg-[var(--background)] rounded-lg p-3 mb-3 overflow-hidden border border-[var(--card-border)]'>
                  <pre className='text-xs text-[var(--text-primary)] overflow-x-auto font-mono'>
                    <code>{snippet.code.slice(0, 200)}{snippet.code.length > 200 ? '...' : ''}</code>
                  </pre>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex gap-2 flex-wrap'>
                    {snippet.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className='px-2 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] text-xs rounded-full hover:bg-[var(--primary)] hover:text-white transition-colors'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs text-white capitalize px-2 py-1 bg-[var(--primary)] bg-opacity-20 rounded-full'>
                      {snippet.language}
                    </span>
                    <a
                      href={snippet.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      onClick={(e) => e.stopPropagation()}
                      className='text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors'
                      title='View on GitHub'
                    >
                      <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                        <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z'/>
                      </svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Snippets Grid */}
      {regularSnippets.length > 0 ? (
        <div className='grid md:grid-cols-2 gap-4'>
          {regularSnippets.map((snippet, index) => (
            <motion.div
              key={snippet.id}
              className='card cursor-pointer group'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedSnippet(snippet)}
              whileHover={{ scale: 1.02 }}
            >
              <div className='flex items-start justify-between mb-2'>
                <h4 className='font-bold line-clamp-2 group-hover:text-[var(--primary)] transition-colors'>
                  {snippet.title}
                </h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(snippet.code, snippet.id);
                  }}
                  className='p-1 hover:bg-[var(--card-border)] rounded transition-colors opacity-0 group-hover:opacity-100'
                  title='Copy to clipboard'
                >
                  {copiedId === snippet.id ? (
                    <svg className='w-4 h-4 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                    </svg>
                  ) : (
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
                    </svg>
                  )}
                </button>
              </div>

              <p className='text-[var(--text-secondary)] text-sm mb-2 line-clamp-2'>
                {snippet.description}
              </p>

              <div className='flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-3'>
                <span>📁 {snippet.repo}</span>
                <span>⭐ {snippet.stars}</span>
              </div>

              <div className='bg-[var(--background)] rounded p-3 mb-3 border border-[var(--card-border)]'>
                <pre className='text-xs text-[var(--text-primary)] overflow-hidden font-mono'>
                  <code>{snippet.code.slice(0, 120)}{snippet.code.length > 120 ? '...' : ''}</code>
                </pre>
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex gap-1 flex-wrap'>
                  {snippet.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className='px-2 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] text-xs rounded-full hover:bg-[var(--primary)] hover:text-white transition-colors'
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-white capitalize px-2 py-1 bg-[var(--primary)] bg-opacity-20 rounded-full'>
                    {snippet.language}
                  </span>
                  <a
                    href={snippet.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={(e) => e.stopPropagation()}
                    className='text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors'
                    title='View on GitHub'
                  >
                    <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z'/>
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className='text-center py-12'>
          <div className='w-16 h-16 bg-[var(--card-bg)] flex items-center justify-center rounded-full border border-[var(--card-border)] mb-4 mx-auto'>
            <svg className='w-8 h-8 text-[var(--text-secondary)]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' />
            </svg>
          </div>
          <h3 className='text-lg font-bold mb-2'>No Code Snippets Found</h3>
          <p className='text-[var(--text-secondary)] mb-4'>
            {searchTerm || selectedLanguage !== 'all'
              ? 'No snippets match your current filters.'
              : 'Code snippets will be extracted from your repositories.'}
          </p>
          {(searchTerm || selectedLanguage !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedLanguage('all');
              }}
              className='px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-dark)] transition-colors'
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Snippet Modal */}
      {selectedSnippet && (
        <motion.div
          className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedSnippet(null)}
        >
          <motion.div
            className='bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden'
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex items-center justify-between p-6 border-b border-[var(--card-border)]'>
              <div className='flex-1'>
                <h3 className='text-xl font-bold mb-1'>{selectedSnippet.title}</h3>
                <p className='text-[var(--text-secondary)] text-sm mb-2'>
                  {selectedSnippet.description}
                </p>
                <div className='flex items-center gap-4 text-xs text-[var(--text-secondary)]'>
                  <span>📁 {selectedSnippet.repo}</span>
                  <span>📄 {selectedSnippet.file}</span>
                  <span>⭐ {selectedSnippet.stars} stars</span>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => copyToClipboard(selectedSnippet.code, selectedSnippet.id)}
                  className='p-2 hover:bg-[var(--card-border)] rounded transition-colors'
                  title='Copy to clipboard'
                >
                  {copiedId === selectedSnippet.id ? (
                    <svg className='w-5 h-5 text-green-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                    </svg>
                  ) : (
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' />
                    </svg>
                  )}
                </button>
                <a
                  href={selectedSnippet.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='p-2 hover:bg-[var(--card-border)] rounded transition-colors'
                  title='View on GitHub'
                >
                  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z'/>
                  </svg>
                </a>
                <button
                  onClick={() => setSelectedSnippet(null)}
                  className='p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-border)] rounded transition-colors'
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              </div>
            </div>

            <div className='p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <span className='px-3 py-1 bg-[var(--primary)] text-white text-sm rounded-full capitalize font-medium'>
                  {selectedSnippet.language}
                </span>
                {selectedSnippet.featured && (
                  <span className='px-3 py-1 bg-yellow-500 text-white text-sm rounded-full font-medium'>
                    ⭐ Featured
                  </span>
                )}
                <span className='text-sm text-[var(--text-secondary)]'>
                  {selectedSnippet.code.split('\n').length} lines
                </span>
              </div>

              <div className='bg-[var(--background)] rounded-lg p-4 mb-4 border border-[var(--card-border)] relative'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-xs text-[var(--text-secondary)] font-medium'>Code Snippet</span>
                  <span className='text-xs text-[var(--text-secondary)]'>
                    {copiedId === selectedSnippet.id ? 'Copied!' : 'Click to copy'}
                  </span>
                </div>
                <pre
                  className='text-sm text-[var(--text-primary)] overflow-x-auto cursor-pointer font-mono leading-relaxed'
                  onClick={() => copyToClipboard(selectedSnippet.code, selectedSnippet.id)}
                  title='Click to copy full code'
                >
                  <code>{selectedSnippet.code}</code>
                </pre>
              </div>

              <div className='flex flex-wrap gap-2'>
                {selectedSnippet.tags.map(tag => (
                  <span
                    key={tag}
                    className='px-3 py-1 bg-[var(--card-bg)] border border-[var(--card-border)] text-sm rounded-full hover:bg-[var(--primary)] hover:text-white transition-colors cursor-pointer'
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
