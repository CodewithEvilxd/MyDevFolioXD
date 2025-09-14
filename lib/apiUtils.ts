// Utility functions for easy API integration

import { makeAPIRequest } from './apiFallback';

/**
 * Simple function to generate text using the fallback API system
 * @param prompt The text prompt to send to the API
 * @param options Additional options like maxTokens, temperature
 * @returns Promise with the generated text or error
 */
export async function generateText(prompt: string, options: any = {}) {
  try {
    const result = await makeAPIRequest(prompt, {
      maxTokens: 500,
      temperature: 0.7,
      ...options
    });

    if (result.success) {
      return {
        success: true,
        text: result.data,
        apiUsed: result.apiUsed
      };
    } else {
      return {
        success: false,
        error: result.error,
        apiUsed: result.apiUsed
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      apiUsed: 'error'
    };
  }
}

/**
 * Generate a code explanation using the fallback API system
 * @param code The code to explain
 * @param language The programming language
 * @returns Promise with the explanation
 */
export async function explainCode(code: string, language: string = 'javascript') {
  const prompt = `Explain this ${language} code in simple terms:\n\n${code}\n\nProvide a clear, concise explanation of what this code does.`;

  return generateText(prompt, { maxTokens: 300 });
}

/**
 * Generate documentation for a function using the fallback API system
 * @param functionCode The function code to document
 * @param language The programming language
 * @returns Promise with the documentation
 */
export async function generateFunctionDocs(functionCode: string, language: string = 'javascript') {
  const prompt = `Generate comprehensive documentation for this ${language} function:\n\n${functionCode}\n\nInclude: purpose, parameters, return value, and usage example.`;

  return generateText(prompt, { maxTokens: 400 });
}

/**
 * Ask a general question using the fallback API system
 * @param question The question to ask
 * @returns Promise with the answer
 */
export async function askQuestion(question: string) {
  const prompt = `Answer this question clearly and concisely: ${question}`;

  return generateText(prompt, { maxTokens: 200 });
}

/**
 * Generate a creative idea or suggestion using the fallback API system
 * @param topic The topic to generate ideas about
 * @param context Additional context
 * @returns Promise with the generated idea
 */
export async function generateIdea(topic: string, context: string = '') {
  const prompt = `Generate a creative and practical idea about: ${topic}${context ? `\n\nContext: ${context}` : ''}\n\nMake it innovative and actionable.`;

  return generateText(prompt, { maxTokens: 300 });
}

// Export the main API functions for direct use
export { makeAPIRequest, getAPIsStatus, getCurrentPrimaryAPI, switchToAPI } from './apiFallback';
