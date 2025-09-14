interface APIConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  headers?: Record<string, string>;
}

interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  apiUsed: string;
}

class APIFallbackService {
  private apis: APIConfig[] = [];
  private currentPrimaryIndex = 0;
  private lastUsedAPI = '';
  private failureCount = new Map<string, number>();
  private maxRetries = 2;

  constructor() {
    this.initializeAPIs();
  }

  private initializeAPIs() {
    // OpenRouter API Configuration
    const openRouterKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (openRouterKey) {
      this.apis.push({
        name: 'openrouter',
        baseUrl: 'https://openrouter.ai/api/v1',
        apiKey: openRouterKey,
        model: 'anthropic/claude-3-haiku',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'GitHubFolio'
        }
      });
    }

    // Gemini API Configuration
    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (geminiKey) {
      this.apis.push({
        name: 'gemini',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        apiKey: geminiKey,
        model: 'gemini-pro',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    if (this.apis.length === 0) {
      
    }
  }

  private async callAPI(api: APIConfig, prompt: string, options: any = {}): Promise<APIResponse> {
    try {
      let url = '';
      let body: any = {};

      if (api.name === 'openrouter') {
        url = `${api.baseUrl}/chat/completions`;
        body = {
          model: api.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7
        };
      } else if (api.name === 'gemini') {
        url = `${api.baseUrl}/models/${api.model}:generateContent?key=${api.apiKey}`;
        body = {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            maxOutputTokens: options.maxTokens || 1000,
            temperature: options.temperature || 0.7
          }
        };
      }

      

      const response = await fetch(url, {
        method: 'POST',
        headers: api.headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Parse response based on API
      let content = '';
      if (api.name === 'openrouter') {
        content = data.choices?.[0]?.message?.content;
      } else if (api.name === 'gemini') {
        content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      }

      if (!content) {
        throw new Error('Invalid response format from API');
      }

      
      this.lastUsedAPI = api.name;
      this.failureCount.set(api.name, 0); // Reset failure count on success

      return {
        success: true,
        data: content,
        apiUsed: api.name
      };

    } catch (error) {
      
      const currentFailures = this.failureCount.get(api.name) || 0;
      this.failureCount.set(api.name, currentFailures + 1);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        apiUsed: api.name
      };
    }
  }

  async makeRequest(prompt: string, options: any = {}): Promise<APIResponse> {
    if (this.apis.length === 0) {
      return {
        success: false,
        error: 'No API keys configured',
        apiUsed: 'none'
      };
    }

    // Try primary API first
    const primaryAPI = this.apis[this.currentPrimaryIndex];
    let result = await this.callAPI(primaryAPI, prompt, options);

    if (result.success) {
      return result;
    }

    // If primary fails, try other APIs
    

    for (let i = 0; i < this.apis.length; i++) {
      if (i === this.currentPrimaryIndex) continue; // Skip the one that already failed

      const fallbackAPI = this.apis[i];
      

      result = await this.callAPI(fallbackAPI, prompt, options);

      if (result.success) {
        // Switch primary to the working API for future requests
        this.currentPrimaryIndex = i;
        
        return result;
      }
    }

    // If all APIs fail, return the last error
    return {
      success: false,
      error: 'All APIs failed. Please check your API keys and network connection.',
      apiUsed: 'all_failed'
    };
  }

  getCurrentPrimaryAPI(): string {
    return this.apis[this.currentPrimaryIndex]?.name || 'none';
  }

  getLastUsedAPI(): string {
    return this.lastUsedAPI;
  }

  getAPIsStatus(): Record<string, any> {
    const status: Record<string, any> = {};

    this.apis.forEach(api => {
      status[api.name] = {
        configured: true,
        failures: this.failureCount.get(api.name) || 0,
        isPrimary: this.apis[this.currentPrimaryIndex].name === api.name
      };
    });

    return status;
  }

  // Force switch to a specific API
  switchToAPI(apiName: string): boolean {
    const index = this.apis.findIndex(api => api.name === apiName);
    if (index !== -1) {
      this.currentPrimaryIndex = index;
      
      return true;
    }
    return false;
  }
}

// Export singleton instance
export const apiFallbackService = new APIFallbackService();

// Export convenience function
export async function makeAPIRequest(prompt: string, options: any = {}): Promise<APIResponse> {
  return apiFallbackService.makeRequest(prompt, options);
}

// Export status functions
export function getAPIsStatus() {
  return apiFallbackService.getAPIsStatus();
}

export function getCurrentPrimaryAPI() {
  return apiFallbackService.getCurrentPrimaryAPI();
}

export function switchToAPI(apiName: string) {
  return apiFallbackService.switchToAPI(apiName);
}
