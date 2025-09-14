'use client';

import { useState } from 'react';
import { Repository, GitHubUser } from '@/types';
import { motion } from 'framer-motion';

interface PDFExportProps {
  user: GitHubUser;
  repos: Repository[];
}

export default function PDFExport({ user, repos }: PDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      // For demo purposes, we'll create a simple HTML-based PDF
      // In a real implementation, you'd use a library like jsPDF or Puppeteer

      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${user.name || user.login} - Portfolio</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                .avatar { width: 100px; height: 100px; border-radius: 50%; margin: 0 auto 20px; display: block; }
                .section { margin-bottom: 30px; }
                .section h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                .project { margin-bottom: 15px; padding: 10px; border: 1px solid #eee; border-radius: 5px; }
                .skills { display: flex; flex-wrap: wrap; gap: 10px; }
                .skill { background: #f0f0f0; padding: 5px 10px; border-radius: 15px; font-size: 12px; }
                .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; text-align: center; }
                .stat { padding: 15px; background: #f9f9f9; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="header">
                <img src="${user.avatar_url}" alt="${user.name}" class="avatar" />
                <h1>${user.name || user.login}</h1>
                <p>${user.bio || 'Developer'}</p>
                <p>${user.location || ''} | ${user.email || ''}</p>
            </div>

            <div class="section">
                <h2>📊 Statistics</h2>
                <div class="stats">
                    <div class="stat">
                        <div style="font-size: 24px; font-weight: bold; color: #007acc;">${user.public_repos}</div>
                        <div>Repositories</div>
                    </div>
                    <div class="stat">
                        <div style="font-size: 24px; font-weight: bold; color: #28a745;">${user.followers}</div>
                        <div>Followers</div>
                    </div>
                    <div class="stat">
                        <div style="font-size: 24px; font-weight: bold; color: #ffc107;">${user.following}</div>
                        <div>Following</div>
                    </div>
                    <div class="stat">
                        <div style="font-size: 24px; font-weight: bold; color: #dc3545;">${Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365))}</div>
                        <div>Years Active</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>🛠️ Skills</h2>
                <div class="skills">
                    ${Array.from(new Set(repos.map(repo => repo.language).filter(Boolean))).map(lang =>
                      `<span class="skill">${lang}</span>`
                    ).join('')}
                </div>
            </div>

            <div class="section">
                <h2>🚀 Featured Projects</h2>
                ${repos.slice(0, 6).map(repo => `
                    <div class="project">
                        <h3>${repo.name}</h3>
                        <p>${repo.description || 'No description available'}</p>
                        <p><strong>Language:</strong> ${repo.language || 'N/A'} |
                           <strong>Stars:</strong> ${repo.stargazers_count} |
                           <strong>Forks:</strong> ${repo.forks_count}</p>
                        ${repo.homepage ? `<p><strong>Demo:</strong> <a href="${repo.homepage}">${repo.homepage}</a></p>` : ''}
                    </div>
                `).join('')}
            </div>

            <div class="section">
                <h2>📞 Contact</h2>
                <p><strong>GitHub:</strong> <a href="${user.html_url}">${user.html_url}</a></p>
                ${user.email ? `<p><strong>Email:</strong> ${user.email}</p>` : ''}
                ${user.blog ? `<p><strong>Website:</strong> <a href="${user.blog}">${user.blog}</a></p>` : ''}
                ${user.twitter_username ? `<p><strong>Twitter:</strong> @${user.twitter_username}</p>` : ''}
                ${user.location ? `<p><strong>Location:</strong> ${user.location}</p>` : ''}
            </div>
        </body>
        </html>
      `;

      // Create blob and download
      const blob = new Blob([pdfContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${user.login}-portfolio.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      className='card text-center'
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className='w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4'>
        <svg className='w-8 h-8 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
        </svg>
      </div>

      <h3 className='text-lg font-bold mb-2'>Export Portfolio</h3>
      <p className='text-[var(--text-secondary)] mb-4'>
        Download your complete portfolio as a beautiful HTML document
      </p>

      <button
        onClick={generatePDF}
        disabled={isGenerating}
        className='px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto'
      >
        {isGenerating ? (
          <>
            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
            Generating...
          </>
        ) : (
          <>
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
            </svg>
            Download HTML
          </>
        )}
      </button>

      <p className='text-xs text-[var(--text-secondary)] mt-3'>
        Perfect for sharing or printing your portfolio
      </p>
    </motion.div>
  );
}
