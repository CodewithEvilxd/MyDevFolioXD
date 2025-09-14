'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResumeSection {
  id: string;
  title: string;
  content: string;
  order: number;
  isVisible: boolean;
}

interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    year: string;
    gpa?: string;
  }>;
  skills: string[];
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
}

export default function InteractiveResumeBuilder() {
  const [isEditing, setIsEditing] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: []
  });

  const [sections, setSections] = useState<ResumeSection[]>([
    { id: 'personal', title: 'Personal Information', content: '', order: 1, isVisible: true },
    { id: 'summary', title: 'Professional Summary', content: '', order: 2, isVisible: true },
    { id: 'experience', title: 'Work Experience', content: '', order: 3, isVisible: true },
    { id: 'education', title: 'Education', content: '', order: 4, isVisible: true },
    { id: 'skills', title: 'Skills & Technologies', content: '', order: 5, isVisible: true },
    { id: 'projects', title: 'Projects', content: '', order: 6, isVisible: true }
  ]);

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sections.length - 1)
    ) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newSections = [...sections];
    [newSections[currentIndex], newSections[newIndex]] = [newSections[newIndex], newSections[currentIndex]];

    // Update order numbers
    newSections.forEach((section, index) => {
      section.order = index + 1;
    });

    setSections(newSections);
  };

  const toggleSectionVisibility = (sectionId: string) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, isVisible: !section.isVisible }
        : section
    ));
  };

  const exportResume = () => {
    const resumeHTML = generateResumeHTML();
    const blob = new Blob([resumeHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateResumeHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${resumeData.personalInfo.name || 'Resume'} - Resume</title>
          <style>
            body { font-family: 'Arial', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 30px; }
            .section h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            .experience-item, .education-item, .project-item { margin-bottom: 15px; }
            .skills { display: flex; flex-wrap: wrap; gap: 10px; }
            .skill-tag { background: #f0f0f0; padding: 5px 10px; border-radius: 15px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${resumeData.personalInfo.name || 'Your Name'}</h1>
            <div>
              ${resumeData.personalInfo.email ? `<div>${resumeData.personalInfo.email}</div>` : ''}
              ${resumeData.personalInfo.phone ? `<div>${resumeData.personalInfo.phone}</div>` : ''}
              ${resumeData.personalInfo.location ? `<div>${resumeData.personalInfo.location}</div>` : ''}
            </div>
          </div>

          ${resumeData.summary ? `
            <div class="section">
              <h2>Professional Summary</h2>
              <p>${resumeData.summary}</p>
            </div>
          ` : ''}

          ${resumeData.experience.length > 0 ? `
            <div class="section">
              <h2>Work Experience</h2>
              ${resumeData.experience.map(exp => `
                <div class="experience-item">
                  <h3>${exp.position} at ${exp.company}</h3>
                  <div>${exp.duration}</div>
                  <p>${exp.description}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${resumeData.education.length > 0 ? `
            <div class="section">
              <h2>Education</h2>
              ${resumeData.education.map(edu => `
                <div class="education-item">
                  <h3>${edu.degree}</h3>
                  <div>${edu.institution} - ${edu.year}</div>
                  ${edu.gpa ? `<div>GPA: ${edu.gpa}</div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${resumeData.skills.length > 0 ? `
            <div class="section">
              <h2>Skills & Technologies</h2>
              <div class="skills">
                ${resumeData.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
              </div>
            </div>
          ` : ''}

          ${resumeData.projects.length > 0 ? `
            <div class="section">
              <h2>Projects</h2>
              ${resumeData.projects.map(project => `
                <div class="project-item">
                  <h3>${project.name}</h3>
                  <p>${project.description}</p>
                  <div>Technologies: ${project.technologies.join(', ')}</div>
                  ${project.link ? `<div><a href="${project.link}">View Project</a></div>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </body>
      </html>
    `;
  };

  return (
    <div className='w-full max-w-7xl mx-auto p-4 sm:p-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6'>
        <h2 className='text-xl sm:text-2xl font-bold'>Interactive Resume Builder</h2>
        <div className='flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto'>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className='px-3 sm:px-4 py-2 text-sm sm:text-base bg-[#8976EA] hover:bg-[#7D6BD0] text-white rounded-lg transition-colors'
          >
            {isEditing ? 'Preview' : 'Edit Resume'}
          </button>
          <button
            onClick={exportResume}
            className='px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors'
          >
            Export HTML
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6'>
        {/* Resume Preview */}
        <div className='lg:col-span-2'>
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 min-h-[600px]'>
            <h3 className='text-xl font-semibold mb-4'>Resume Preview</h3>
            <div className='space-y-6'>
              {sections
                .filter(section => section.isVisible)
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <motion.div
                    key={section.id}
                    layout
                    className='border border-gray-200 dark:border-gray-700 rounded-lg p-4'
                  >
                    <div className='flex justify-between items-center mb-3'>
                      <h4 className='font-semibold text-lg'>{section.title}</h4>
                      {isEditing && (
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => moveSection(section.id, 'up')}
                            disabled={sections.findIndex(s => s.id === section.id) === 0}
                            className='text-sm px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50'
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveSection(section.id, 'down')}
                            disabled={sections.findIndex(s => s.id === section.id) === sections.length - 1}
                            className='text-sm px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50'
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => toggleSectionVisibility(section.id)}
                            className='text-sm px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded'
                          >
                            {section.isVisible ? '👁️' : '🙈'}
                          </button>
                        </div>
                      )}
                    </div>

                    {section.id === 'personal' && (
                      <div className='space-y-3'>
                        <input
                          type='text'
                          placeholder='Full Name'
                          value={resumeData.personalInfo.name}
                          onChange={(e) => setResumeData({
                            ...resumeData,
                            personalInfo: { ...resumeData.personalInfo, name: e.target.value }
                          })}
                          className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700'
                          disabled={!isEditing}
                        />
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                          <input
                            type='email'
                            placeholder='Email'
                            value={resumeData.personalInfo.email}
                            onChange={(e) => setResumeData({
                              ...resumeData,
                              personalInfo: { ...resumeData.personalInfo, email: e.target.value }
                            })}
                            className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700'
                            disabled={!isEditing}
                          />
                          <input
                            type='tel'
                            placeholder='Phone'
                            value={resumeData.personalInfo.phone}
                            onChange={(e) => setResumeData({
                              ...resumeData,
                              personalInfo: { ...resumeData.personalInfo, phone: e.target.value }
                            })}
                            className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700'
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    )}

                    {section.id === 'summary' && (
                      <textarea
                        placeholder='Write your professional summary...'
                        value={resumeData.summary}
                        onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                        className='w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 min-h-[100px]'
                        disabled={!isEditing}
                      />
                    )}

                    {section.id === 'skills' && (
                      <div className='space-y-3'>
                        <input
                          type='text'
                          placeholder='Add a skill (press Enter)'
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              setResumeData({
                                ...resumeData,
                                skills: [...resumeData.skills, e.currentTarget.value.trim()]
                              });
                              e.currentTarget.value = '';
                            }
                          }}
                          className='w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700'
                          disabled={!isEditing}
                        />
                        <div className='flex flex-wrap gap-2'>
                          {resumeData.skills.map((skill, index) => (
                            <span
                              key={index}
                              className='bg-[#8976EA] text-white px-3 py-1 rounded-full text-sm flex items-center gap-2'
                            >
                              {skill}
                              {isEditing && (
                                <button
                                  onClick={() => setResumeData({
                                    ...resumeData,
                                    skills: resumeData.skills.filter((_, i) => i !== index)
                                  })}
                                  className='hover:text-red-300'
                                >
                                  ×
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className='space-y-4'>
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4'>
            <h4 className='font-semibold mb-3'>Resume Sections</h4>
            <div className='space-y-2'>
              {sections.map((section) => (
                <div
                  key={section.id}
                  className='flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded'
                >
                  <span className='text-sm'>{section.title}</span>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs text-gray-500'>#{section.order}</span>
                    <button
                      onClick={() => toggleSectionVisibility(section.id)}
                      className={`w-4 h-4 rounded border-2 ${
                        section.isVisible
                          ? 'bg-[#8976EA] border-[#8976EA]'
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4'>
            <h4 className='font-semibold mb-3'>Quick Tips</h4>
            <ul className='text-sm space-y-2 text-gray-600 dark:text-gray-400'>
              <li>• Drag sections to reorder</li>
              <li>• Click eye icon to hide/show sections</li>
              <li>• Export as HTML for easy sharing</li>
              <li>• Keep it concise (1-2 pages)</li>
              <li>• Use action verbs in descriptions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
