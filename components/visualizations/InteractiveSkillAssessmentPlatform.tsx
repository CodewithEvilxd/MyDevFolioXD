'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AssessmentQuestion {
  id: string;
  type: 'multiple-choice' | 'code' | 'debug' | 'refactor';
  skill: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  question: string;
  options?: string[];
  correct_answer: string | string[];
  explanation: string;
  code_snippet?: string;
  time_limit?: number;
}

interface AssessmentResult {
  skill: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  recommendations: string[];
}

interface InteractiveSkillAssessmentPlatformProps {
  username: string;
}

export default function InteractiveSkillAssessmentPlatform({ username }: InteractiveSkillAssessmentPlatformProps) {
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [currentAssessment, setCurrentAssessment] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | string[]>>({});
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [assessmentStartTime, setAssessmentStartTime] = useState<number>(0);

  const skills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL',
    'Git', 'Docker', 'AWS', 'System Design', 'Algorithms', 'Data Structures'
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAssessing && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Auto-submit when time runs out
            handleSubmitAssessment();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isAssessing, timeRemaining]);

  const startAssessment = async (skill: string) => {
    setIsAssessing(true);
    setSelectedSkill(skill);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setAssessmentResult(null);
    setAssessmentStartTime(Date.now());

    // Generate assessment questions
    const questions = generateQuestions(skill);
    setCurrentAssessment(questions);

    // Set time limit (15 minutes for 10 questions)
    setTimeRemaining(15 * 60);
  };

  const generateQuestions = (skill: string): AssessmentQuestion[] => {
    const questions: AssessmentQuestion[] = [];

    // JavaScript questions
    if (skill === 'JavaScript') {
      questions.push(
        {
          id: 'js-1',
          type: 'multiple-choice',
          skill: 'JavaScript',
          difficulty: 'Beginner',
          question: 'What will `console.log(typeof null)` output?',
          options: ['"null"', '"object"', '"undefined"', '"boolean"'],
          correct_answer: '"object"',
          explanation: 'In JavaScript, `typeof null` returns "object" due to a historical bug in the language that has been kept for backward compatibility.'
        },
        {
          id: 'js-2',
          type: 'code',
          skill: 'JavaScript',
          difficulty: 'Intermediate',
          question: 'Write a function that reverses a string without using built-in reverse methods.',
          correct_answer: `function reverseString(str) {
  let reversed = '';
  for (let i = str.length - 1; i >= 0; i--) {
    reversed += str[i];
  }
  return reversed;
}`,
          explanation: 'This function iterates through the string from the end to the beginning, building a new string with characters in reverse order.'
        },
        {
          id: 'js-3',
          type: 'debug',
          skill: 'JavaScript',
          difficulty: 'Intermediate',
          question: 'Find and fix the bug in this async function:',
          code_snippet: `async function fetchUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    const data = response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
  }
}`,
          correct_answer: 'Add await before response.json()',
          explanation: 'The response.json() method returns a Promise, so it needs to be awaited to get the actual data.'
        }
      );
    }

    // React questions
    if (skill === 'React') {
      questions.push(
        {
          id: 'react-1',
          type: 'multiple-choice',
          skill: 'React',
          difficulty: 'Beginner',
          question: 'What hook is used to manage state in functional components?',
          options: ['useEffect', 'useState', 'useContext', 'useReducer'],
          correct_answer: 'useState',
          explanation: 'useState is the primary hook for managing local state in functional React components.'
        },
        {
          id: 'react-2',
          type: 'code',
          skill: 'React',
          difficulty: 'Intermediate',
          question: 'Create a simple counter component using hooks.',
          correct_answer: `import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

export default Counter;`,
          explanation: 'This component uses useState to manage the count state and provides a button to increment it.'
        }
      );
    }

    // Add more questions for other skills...
    while (questions.length < 10) {
      questions.push({
        id: `${skill.toLowerCase()}-${questions.length + 1}`,
        type: 'multiple-choice',
        skill,
        difficulty: 'Beginner',
        question: `Sample ${skill} question ${questions.length + 1}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct_answer: 'Option A',
        explanation: `This is a sample explanation for ${skill} question ${questions.length + 1}.`
      });
    }

    return questions;
  };

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentAssessment.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitAssessment = () => {
    const endTime = Date.now();
    const timeTaken = (endTime - assessmentStartTime) / 1000; // in seconds

    let correctAnswers = 0;
    currentAssessment.forEach(question => {
      const userAnswer = userAnswers[question.id];
      if (userAnswer) {
        if (Array.isArray(question.correct_answer)) {
          // For multiple correct answers
          if (Array.isArray(userAnswer) &&
              question.correct_answer.every(ans => userAnswer.includes(ans)) &&
              userAnswer.length === question.correct_answer.length) {
            correctAnswers++;
          }
        } else if (userAnswer === question.correct_answer) {
          correctAnswers++;
        }
      }
    });

    const score = Math.round((correctAnswers / currentAssessment.length) * 100);

    let level: AssessmentResult['level'] = 'Beginner';
    if (score >= 80) level = 'Expert';
    else if (score >= 70) level = 'Advanced';
    else if (score >= 60) level = 'Intermediate';

    const recommendations = generateRecommendations(selectedSkill, score, level);

    const result: AssessmentResult = {
      skill: selectedSkill,
      score,
      total_questions: currentAssessment.length,
      correct_answers: correctAnswers,
      time_taken: timeTaken,
      level,
      recommendations
    };

    setAssessmentResult(result);
    setIsAssessing(false);
  };

  const generateRecommendations = (skill: string, score: number, level: string): string[] => {
    const recommendations = [];

    if (score < 60) {
      recommendations.push(`Focus on ${skill} fundamentals and basic concepts`);
      recommendations.push('Practice with beginner-friendly coding challenges');
      recommendations.push(`Take ${skill} courses on platforms like freeCodeCamp or Codecademy`);
    } else if (score < 80) {
      recommendations.push(`Strengthen your ${skill} intermediate concepts`);
      recommendations.push('Work on real-world projects to apply your knowledge');
      recommendations.push(`Study ${skill} design patterns and best practices`);
    } else {
      recommendations.push(`You're proficient in ${skill}! Focus on advanced topics`);
      recommendations.push('Contribute to open source projects');
      recommendations.push(`Consider specializing in ${skill} frameworks or tools`);
    }

    return recommendations;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = currentAssessment[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / currentAssessment.length) * 100;

  return (
    <motion.div
      className='card'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-bold'>Interactive Skill Assessment Platform</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Test and improve your programming skills with interactive assessments
          </p>
        </div>

        {isAssessing && (
          <div className='flex items-center gap-4'>
            <div className='text-sm text-[var(--text-secondary)]'>
              Question {currentQuestionIndex + 1} of {currentAssessment.length}
            </div>
            <div className={`text-sm font-bold ${timeRemaining < 300 ? 'text-red-500' : 'text-[var(--primary)]'}`}>
              ⏱️ {formatTime(timeRemaining)}
            </div>
          </div>
        )}
      </div>

      {!isAssessing && !assessmentResult && (
        <>
          {/* Skill Selection */}
          <div className='mb-6'>
            <h3 className='text-lg font-semibold mb-4'>Choose a skill to assess</h3>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
              {skills.map(skill => (
                <motion.button
                  key={skill}
                  onClick={() => startAssessment(skill)}
                  className='p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg hover:border-[var(--primary)] transition-colors text-left'
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className='font-medium mb-1'>{skill}</div>
                  <div className='text-sm text-[var(--text-secondary)]'>10 questions • 15 min</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Assessment Info */}
          <div className='bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6'>
            <h3 className='text-lg font-semibold mb-4'>How it works</h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
              <div className='text-center'>
                <div className='text-2xl mb-2'>🎯</div>
                <div className='font-medium mb-1'>Targeted Assessment</div>
                <div className='text-[var(--text-secondary)]'>Skill-specific questions tailored to your level</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl mb-2'>📊</div>
                <div className='font-medium mb-1'>Detailed Analytics</div>
                <div className='text-[var(--text-secondary)]'>Comprehensive performance analysis and insights</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl mb-2'>🚀</div>
                <div className='font-medium mb-1'>Personalized Learning</div>
                <div className='text-[var(--text-secondary)]'>Custom recommendations to improve your skills</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Assessment in Progress */}
      {isAssessing && currentQuestion && (
        <div>
          {/* Progress Bar */}
          <div className='mb-6'>
            <div className='w-full bg-[var(--card-border)] rounded-full h-2'>
              <motion.div
                className='bg-[var(--primary)] h-2 rounded-full'
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Question */}
          <div className='mb-6'>
            <div className='flex items-center gap-2 mb-4'>
              <span className={`px-2 py-1 text-xs rounded-full ${
                currentQuestion.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-600' :
                currentQuestion.difficulty === 'Intermediate' ? 'bg-blue-500/20 text-blue-600' :
                'bg-red-500/20 text-red-600'
              }`}>
                {currentQuestion.difficulty}
              </span>
              <span className='text-sm text-[var(--text-secondary)] capitalize'>
                {currentQuestion.type.replace('-', ' ')}
              </span>
            </div>

            <h3 className='text-lg font-semibold mb-4'>{currentQuestion.question}</h3>

            {currentQuestion.code_snippet && (
              <div className='mb-4 p-4 bg-gray-900 rounded-lg'>
                <pre className='text-green-400 text-sm font-mono overflow-x-auto'>
                  <code>{currentQuestion.code_snippet}</code>
                </pre>
              </div>
            )}

            {/* Answer Options */}
            {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
              <div className='space-y-3'>
                {currentQuestion.options.map((option, index) => (
                  <label key={index} className='flex items-center gap-3 p-3 border border-[var(--card-border)] rounded-lg cursor-pointer hover:border-[var(--primary)] transition-colors'>
                    <input
                      type='radio'
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={userAnswers[currentQuestion.id] === option}
                      onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                      className='text-[var(--primary)]'
                    />
                    <span className='text-[var(--text-primary)]'>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === 'code' && (
              <textarea
                value={userAnswers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                placeholder='Write your code here...'
                className='w-full h-48 bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
                spellCheck={false}
              />
            )}

            {currentQuestion.type === 'debug' && (
              <textarea
                value={userAnswers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                placeholder='Describe the bug and how to fix it...'
                className='w-full h-32 bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none'
              />
            )}
          </div>

          {/* Navigation */}
          <div className='flex justify-between'>
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className='px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Previous
            </button>

            {currentQuestionIndex === currentAssessment.length - 1 ? (
              <button
                onClick={handleSubmitAssessment}
                className='px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium'
              >
                Submit Assessment
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                disabled={!userAnswers[currentQuestion.id]}
                className='px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Next
              </button>
            )}
          </div>
        </div>
      )}

      {/* Assessment Results */}
      <AnimatePresence>
        {assessmentResult && (
          <motion.div
            className='border-t border-[var(--card-border)] pt-6'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className='text-center mb-6'>
              <div className='text-6xl font-bold mb-2'>
                <span className={
                  assessmentResult.score >= 80 ? 'text-green-500' :
                  assessmentResult.score >= 60 ? 'text-blue-500' :
                  assessmentResult.score >= 40 ? 'text-yellow-500' : 'text-red-500'
                }>
                  {assessmentResult.score}%
                </span>
              </div>
              <div className='text-xl font-bold mb-2'>{assessmentResult.skill} Assessment</div>
              <div className={`text-lg font-semibold mb-4 px-4 py-2 rounded-full inline-block ${
                assessmentResult.level === 'Expert' ? 'bg-green-500/20 text-green-600' :
                assessmentResult.level === 'Advanced' ? 'bg-blue-500/20 text-blue-600' :
                assessmentResult.level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-600' :
                'bg-red-500/20 text-red-600'
              }`}>
                {assessmentResult.level} Level
              </div>
            </div>

            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
              <div className='text-center p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg'>
                <div className='text-2xl font-bold text-[var(--primary)]'>{assessmentResult.correct_answers}</div>
                <div className='text-sm text-[var(--text-secondary)]'>Correct Answers</div>
              </div>

              <div className='text-center p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg'>
                <div className='text-2xl font-bold text-blue-500'>{assessmentResult.total_questions}</div>
                <div className='text-sm text-[var(--text-secondary)]'>Total Questions</div>
              </div>

              <div className='text-center p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg'>
                <div className='text-2xl font-bold text-green-500'>{formatTime(assessmentResult.time_taken)}</div>
                <div className='text-sm text-[var(--text-secondary)]'>Time Taken</div>
              </div>

              <div className='text-center p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg'>
                <div className='text-2xl font-bold text-purple-500'>
                  {Math.round((assessmentResult.correct_answers / assessmentResult.total_questions) * 100)}%
                </div>
                <div className='text-sm text-[var(--text-secondary)]'>Accuracy</div>
              </div>
            </div>

            {/* Recommendations */}
            <div className='mb-6'>
              <h3 className='text-lg font-semibold mb-4'>Recommendations</h3>
              <div className='space-y-3'>
                {assessmentResult.recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    className='flex items-start gap-3 p-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg'
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <span className='text-green-500 mt-1'>💡</span>
                    <span className='text-sm'>{rec}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className='text-center'>
              <button
                onClick={() => {
                  setAssessmentResult(null);
                  setSelectedSkill('');
                  setCurrentAssessment([]);
                }}
                className='px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-lg transition-colors font-medium'
              >
                Take Another Assessment
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}