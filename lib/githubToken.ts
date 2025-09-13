/**
 * GitHub token helper for consistent handling of GitHub API tokens.
 * This prioritizes the environment variable token over client-side tokens
 * for better security and higher rate limits.
 */

/**
 * Get GitHub access token with the following priority:
 * 1. Environment variable (server-side)
 * 2. Local storage token (client-side)
 */
export function getGitHubToken(): string | null {
  // On the server side
  if (typeof window === 'undefined') {
    // Server-side execution
    return process.env.GITHUB_ACCESS_TOKEN || null;
  }

  // On the client side
  // First try environment variable made public to client (if any)
  if (process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN) {
    return process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN;
  }

  // Fall back to client storage
  return localStorage.getItem('github_token');
}

/**
 * Creates headers for GitHub API requests with the token if available
 */
export function createGitHubHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'MyDevFolioXD',
  };

  const token = getGitHubToken();
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  return headers;
}

/**
 * Test GitHub API connectivity
 */
export async function testGitHubAPI(): Promise<{ success: boolean; message: string; rateLimit?: any }> {
  try {
    const response = await fetch('https://api.github.com/rate_limit', {
      method: 'GET',
      headers: createGitHubHeaders()
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: 'GitHub API is working correctly',
        rateLimit: data.rate
      };
    } else {
      return {
        success: false,
        message: `GitHub API returned ${response.status}: ${response.statusText}`
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Test specific user lookup
 */
export async function testGitHubUser(username: string): Promise<{ success: boolean; message: string; user?: any }> {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      method: 'GET',
      headers: createGitHubHeaders()
    });

    if (response.ok) {
      const user = await response.json();
      return {
        success: true,
        message: `User "${user.login}" found successfully`,
        user
      };
    } else if (response.status === 404) {
      return {
        success: false,
        message: `User "${username}" not found`
      };
    } else {
      return {
        success: false,
        message: `API error ${response.status}: ${response.statusText}`
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
