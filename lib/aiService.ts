/**
 * AI Service for handling OpenRouter and Gemini API calls with fallback
 */

interface AIRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

interface AIResponse {
  success: boolean;
  content: string;
  error?: string;
  apiUsed: 'openrouter' | 'gemini' | 'none';
}

/**
 * Call OpenRouter API
 */
async function callOpenRouter(request: AIRequest): Promise<AIResponse> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
        'X-Title': 'GitHubFolioXD'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [{ role: 'user', content: request.prompt }],
        max_tokens: request.maxTokens || 1000,
        temperature: request.temperature || 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Validate response structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from OpenRouter API');
    }

    const content = data.choices[0].message.content;
    if (!content || typeof content !== 'string') {
      throw new Error('No content received from OpenRouter API');
    }

    return {
      success: true,
      content: content.trim(),
      apiUsed: 'openrouter'
    };
  } catch (error) {
    return {
      success: false,
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      apiUsed: 'openrouter'
    };
  }
}

/**
 * Call Gemini API
 */
async function callGemini(request: AIRequest): Promise<AIResponse> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: request.prompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: request.maxTokens || 1000,
          temperature: request.temperature || 0.7
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Validate response structure
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      throw new Error('Invalid response structure from Gemini API');
    }

    const content = data.candidates[0].content.parts[0].text;
    if (!content || typeof content !== 'string') {
      throw new Error('No content received from Gemini API');
    }

    return {
      success: true,
      content: content.trim(),
      apiUsed: 'gemini'
    };
  } catch (error) {
    return {
      success: false,
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      apiUsed: 'gemini'
    };
  }
}

/**
 * Main AI service function with fallback
 */
export async function callAI(request: AIRequest): Promise<AIResponse> {
  // Try OpenRouter first
  if (process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) {
    const openRouterResponse = await callOpenRouter(request);
    if (openRouterResponse.success) {
      return openRouterResponse;
    }
  }

  // Fallback to Gemini
  if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    const geminiResponse = await callGemini(request);
    if (geminiResponse.success) {
      return geminiResponse;
    }
  }

  // Both APIs failed
  return {
    success: false,
    content: '',
    error: 'All AI APIs failed - check API keys and network connection',
    apiUsed: 'none'
  };
}

/**
 * Generate code review analysis using AI
 */
export async function generateCodeReview(codeSnippet: string, language: string): Promise<AIResponse> {
  const prompt = `Analyze this ${language} code for potential issues, bugs, security vulnerabilities, and improvements:

${codeSnippet}

Please provide:
1. Any security vulnerabilities
2. Performance issues
3. Code quality problems
4. Best practice violations
5. Potential bugs

Format your response as a JSON array of issues with this structure:
[
  {
    "type": "security|performance|maintainability|best-practice|bug-risk",
    "severity": "critical|high|medium|low|info",
    "title": "Brief title",
    "description": "Detailed description",
    "suggestion": "How to fix it",
    "impact": "Why it matters",
    "confidence": 0.0-1.0
  }
]`;

  return callAI({ prompt, maxTokens: 1500, temperature: 0.3 });
}

/**
 * Generate dream project ideas using AI
 */
export async function generateDreamProjects(codingStyle: any, existingProjects: any[]): Promise<AIResponse> {
  const prompt = `Based on this developer's coding style and existing projects, suggest 3-5 innovative project ideas:

Coding Style Analysis:
- Languages: ${codingStyle.languages?.join(', ')}
- Topics: ${codingStyle.topics?.join(', ')}
- Patterns: ${codingStyle.patterns?.join(', ')}
- Existing Projects: ${existingProjects.map(p => p.name).join(', ')}

Please suggest innovative, challenging projects that would:
1. Leverage their existing skills
2. Push them to learn new technologies
3. Solve real-world problems
4. Have commercial or open-source potential

Format your response as a JSON array of project ideas with this structure:
[
  {
    "title": "Project Name",
    "description": "Detailed description",
    "technologies": ["tech1", "tech2", "tech3"],
    "complexity": "Beginner|Intermediate|Advanced|Expert",
    "estimatedTime": "X-Y months",
    "whyItFits": "Why this fits their profile",
    "codeSnippet": "Sample code showing key concept",
    "innovation": "What's innovative about this"
  }
]`;

  return callAI({ prompt, maxTokens: 2000, temperature: 0.8 });
}

/**
 * Analyze repository for code quality issues
 */
export async function analyzeRepositoryCode(repoName: string, languages: string[], description: string): Promise<AIResponse> {
  const prompt = `Analyze this repository for potential code quality issues:

Repository: ${repoName}
Languages: ${languages.join(', ')}
Description: ${description}

Based on the repository name, languages, and description, identify likely code quality issues and provide recommendations.

Format your response as a JSON array of issues:
[
  {
    "type": "security|performance|maintainability|best-practice|bug-risk",
    "severity": "critical|high|medium|low|info",
    "title": "Issue title",
    "description": "Issue description",
    "suggestion": "How to fix",
    "impact": "Why it matters",
    "confidence": 0.0-1.0
  }
]`;

  return callAI({ prompt, maxTokens: 1200, temperature: 0.4 });
}