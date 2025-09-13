// lib/githubService.ts
import { NextRequest } from 'next/server';

/**
 * GitHub API service for handling authentication and API calls
 * This service ensures consistent use of the GitHub access token
 * across the application, prioritizing the server token from the
 * environment variable.
 */

// Define types for GitHub API responses
export interface GitHubRateLimit {
  resources: {
    core: {
      limit: number;
      remaining: number;
      reset: number;
      used: number;
    };
    search: {
      limit: number;
      remaining: number;
      reset: number;
      used: number;
    };
    graphql: {
      limit: number;
      remaining: number;
      reset: number;
      used: number;
    };
    integration_manifest: {
      limit: number;
      remaining: number;
      reset: number;
      used: number;
    };
    code_scanning_upload: {
      limit: number;
      remaining: number;
      reset: number;
      used: number;
    };
  };
  rate: {
    limit: number;
    remaining: number;
    reset: number;
    used: number;
  };
}

// Default options for fetch requests
const defaultOptions: RequestInit = {
  headers: {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'MyDevFolioXD',
  },
};

/**
 * Returns the GitHub access token with the following priority:
 * 1. Server token from environment variable (if available)
 * 2. Public client token from environment variable (client-side)
 * 3. Client token (if provided and no env tokens available)
 *
 * @param clientToken Optional client token from localStorage
 * @returns The GitHub access token or null if none available
 */
export function getGitHubToken(clientToken?: string | null): string | null {
  // Always prioritize the server token from environment
  const serverToken = process.env.GITHUB_ACCESS_TOKEN;

  if (serverToken) {
    return serverToken;
  }

  // Check for public client token (available on both server and client)
  const publicClientToken = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN;

  if (publicClientToken) {
    return publicClientToken;
  }

  // Fallback to client token if provided
  return clientToken || null;
}

/**
 * Creates the headers for GitHub API requests including authentication
 *
 * @param clientToken Optional client token from localStorage
 * @returns Headers for GitHub API requests
 */
export function createGitHubHeaders(clientToken?: string | null): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'MyDevFolioXD',
  };

  const token = getGitHubToken(clientToken);

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  return headers;
}

/**
 * Makes a request to the GitHub API with authentication
 *
 * @param url GitHub API endpoint
 * @param options Fetch options
 * @param clientToken Optional client token from localStorage
 * @returns Response from GitHub API
 */
export async function githubFetch(
  url: string,
  options: RequestInit = {},
  clientToken?: string | null
): Promise<Response> {
  const headers = createGitHubHeaders(clientToken);

  const mergedOptions: RequestInit = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
      ...headers,
    },
  };

  return fetch(url, mergedOptions);
}

/**
 * Fetches the GitHub rate limit information
 *
 * @param clientToken Optional client token from localStorage
 * @returns Rate limit information
 */
export async function fetchRateLimit(
  clientToken?: string | null
): Promise<GitHubRateLimit> {
  const response = await githubFetch(
    'https://api.github.com/rate_limit',
    {},
    clientToken
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch rate limit: ${response.status}`);
  }

  return await response.json();
}

/**
 * Extract client token from request
 *
 * @param request Next.js request object
 * @returns The client token or null
 */
export function getClientTokenFromRequest(request: NextRequest): string | null {
  const { searchParams } = new URL(request.url);
  return searchParams.get('token');
}
