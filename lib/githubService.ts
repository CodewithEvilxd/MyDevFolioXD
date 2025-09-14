import { Repository, GitHubUser, GitHubEvent, GitHubCommit, GitHubIssue, GitHubPullRequest, GitHubUserWithStats } from '@/types';

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN;

interface GitHubApiConfig {
  token?: string;
  username?: string;
}

class GitHubAPIService {
  private token: string | undefined;
  private username: string | undefined;
  private baseURL: string;

  constructor(config: GitHubApiConfig = {}) {
    this.token = config.token || GITHUB_TOKEN;
    this.username = config.username;
    this.baseURL = GITHUB_API_BASE;
  }

  async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'MyDevFolioXD/1.0.0',
    };

    // Merge with existing headers if any
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get user profile with detailed information
  async getUserProfile(username?: string): Promise<GitHubUserWithStats> {
    const targetUsername = username || this.username;
    if (!targetUsername) throw new Error('Username required');

    const [user, events, repos] = await Promise.all([
      this.fetchWithAuth(`/users/${targetUsername}`),
      this.getUserEvents(targetUsername, 100),
      this.getUserRepos(targetUsername, 100)
    ]);

    return {
      ...user,
      events,
      repositories: repos,
      stats: this.calculateUserStats(user, events, repos)
    };
  }

  // Get user events (activity)
  async getUserEvents(username: string, count: number = 30): Promise<GitHubEvent[]> {
    return this.fetchWithAuth(`/users/${username}/events?per_page=${count}`);
  }

  // Get user repositories
  async getUserRepos(username: string, count: number = 30): Promise<Repository[]> {
    const repos = await this.fetchWithAuth(`/users/${username}/repos?per_page=${count}&sort=updated`);
    return repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      html_url: repo.html_url,
      clone_url: repo.clone_url,
      language: repo.language,
      languages: {},
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      watchers_count: repo.watchers_count,
      size: repo.size,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at,
      topics: repo.topics || [],
      visibility: repo.visibility,
      fork: repo.fork,
      archived: repo.archived,
      disabled: repo.disabled,
      license: repo.license,
      owner: repo.owner
    }));
  }

  // Get repository languages
  async getRepoLanguages(languagesUrl: string): Promise<Record<string, number>> {
    try {
      return await this.fetchWithAuth(languagesUrl.replace(this.baseURL, ''));
    } catch {
      return {};
    }
  }

  // Get repository commits
  async getRepoCommits(owner: string, repo: string, count: number = 30): Promise<GitHubCommit[]> {
    return this.fetchWithAuth(`/repos/${owner}/${repo}/commits?per_page=${count}`);
  }

  // Get repository issues
  async getRepoIssues(owner: string, repo: string, count: number = 30): Promise<GitHubIssue[]> {
    return this.fetchWithAuth(`/repos/${owner}/${repo}/issues?per_page=${count}&state=all`);
  }

  // Get repository pull requests
  async getRepoPullRequests(owner: string, repo: string, count: number = 30): Promise<GitHubPullRequest[]> {
    return this.fetchWithAuth(`/repos/${owner}/${repo}/pulls?per_page=${count}&state=all`);
  }

  // Get repository contributors
  async getRepoContributors(owner: string, repo: string, count: number = 30): Promise<any[]> {
    return this.fetchWithAuth(`/repos/${owner}/${repo}/contributors?per_page=${count}`);
  }

  // Get repository traffic data
  async getRepoTraffic(owner: string, repo: string): Promise<any> {
    return this.fetchWithAuth(`/repos/${owner}/${repo}/traffic/views`);
  }

  // Get user's followers
  async getUserFollowers(username: string, count: number = 30): Promise<any[]> {
    return this.fetchWithAuth(`/users/${username}/followers?per_page=${count}`);
  }

  // Get user's following
  async getUserFollowing(username: string, count: number = 30): Promise<any[]> {
    return this.fetchWithAuth(`/users/${username}/following?per_page=${count}`);
  }

  // Get user's organizations
  async getUserOrganizations(username: string, count: number = 30): Promise<any[]> {
    return this.fetchWithAuth(`/users/${username}/orgs?per_page=${count}`);
  }

  // Get user's gists
  async getUserGists(username: string, count: number = 30): Promise<any[]> {
    return this.fetchWithAuth(`/users/${username}/gists?per_page=${count}`);
  }

  // Get user's starred repositories
  async getUserStarred(username: string, count: number = 30): Promise<Repository[]> {
    return this.fetchWithAuth(`/users/${username}/starred?per_page=${count}`);
  }

  // Search repositories
  async searchRepos(query: string, count: number = 30): Promise<any> {
    return this.fetchWithAuth(`/search/repositories?q=${encodeURIComponent(query)}&per_page=${count}`);
  }

  // Get trending repositories (using search with sort)
  async getTrendingRepos(language?: string, count: number = 30): Promise<Repository[]> {
    const query = language ? `language:${language} created:>${this.getDateString(-7)}` : `created:>${this.getDateString(-7)}`;
    const result = await this.searchRepos(`${query} sort:stars-desc`, count);
    return result.items || [];
  }

  // Calculate comprehensive user statistics
  private calculateUserStats(user: any, events: GitHubEvent[], repos: Repository[]): any {
    const stats = {
      totalStars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      totalForks: repos.reduce((sum, repo) => sum + repo.forks_count, 0),
      totalRepos: repos.length,
      languages: this.calculateLanguageStats(repos),
      activity: this.calculateActivityStats(events),
      contributions: this.calculateContributionStats(events),
      streak: this.calculateStreakStats(events),
      productivity: this.calculateProductivityStats(events, repos),
      social: this.calculateSocialStats(user),
      impact: this.calculateImpactStats(repos, events)
    };

    return stats;
  }

  private calculateLanguageStats(repos: Repository[]): Record<string, any> {
    const languages: Record<string, { repos: number, size: number, stars: number }> = {};

    repos.forEach(repo => {
      if (repo.language) {
        if (!languages[repo.language]) {
          languages[repo.language] = { repos: 0, size: 0, stars: 0 };
        }
        languages[repo.language].repos += 1;
        languages[repo.language].size += repo.size;
        languages[repo.language].stars += repo.stargazers_count;
      }
    });

    return languages;
  }

  private calculateActivityStats(events: GitHubEvent[]): any {
    const activity = {
      daily: {} as Record<string, number>,
      weekly: {} as Record<string, number>,
      monthly: {} as Record<string, number>,
      byType: {} as Record<string, number>
    };

    events.forEach(event => {
      const date = new Date(event.created_at);
      const dayKey = date.toISOString().split('T')[0];
      const weekKey = this.getWeekKey(date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      activity.daily[dayKey] = (activity.daily[dayKey] || 0) + 1;
      activity.weekly[weekKey] = (activity.weekly[weekKey] || 0) + 1;
      activity.monthly[monthKey] = (activity.monthly[monthKey] || 0) + 1;
      activity.byType[event.type] = (activity.byType[event.type] || 0) + 1;
    });

    return activity;
  }

  private calculateContributionStats(events: GitHubEvent[]): any {
    const contributions = {
      commits: 0,
      pullRequests: 0,
      issues: 0,
      reviews: 0,
      releases: 0
    };

    events.forEach(event => {
      switch (event.type) {
        case 'PushEvent':
          contributions.commits += event.payload.commits?.length || 0;
          break;
        case 'PullRequestEvent':
          contributions.pullRequests += 1;
          break;
        case 'IssuesEvent':
          contributions.issues += 1;
          break;
        case 'PullRequestReviewEvent':
          contributions.reviews += 1;
          break;
        case 'ReleaseEvent':
          contributions.releases += 1;
          break;
      }
    });

    return contributions;
  }

  private calculateStreakStats(events: GitHubEvent[]): any {
    const commitDates = events
      .filter(event => event.type === 'PushEvent')
      .map(event => new Date(event.created_at).toISOString().split('T')[0])
      .sort()
      .reverse();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < commitDates.length; i++) {
      if (i === 0 || this.isConsecutiveDay(commitDates[i - 1], commitDates[i])) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate current streak
    const today = new Date().toISOString().split('T')[0];
    if (commitDates[0] === today || this.isConsecutiveDay(commitDates[0], today)) {
      currentStreak = tempStreak;
    }

    return { current: currentStreak, longest: longestStreak };
  }

  private calculateProductivityStats(events: GitHubEvent[], repos: Repository[]): any {
    const productivity = {
      commitsPerDay: 0,
      reposPerMonth: 0,
      issuesResolvedPerWeek: 0,
      prMergedPerWeek: 0
    };

    const commitEvents = events.filter(e => e.type === 'PushEvent');
    const totalCommits = commitEvents.reduce((sum, event) => sum + (event.payload.commits?.length || 0), 0);

    const daysSinceFirstCommit = Math.max(1, Math.floor((Date.now() - new Date(events[events.length - 1]?.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24)));
    productivity.commitsPerDay = totalCommits / daysSinceFirstCommit;

    const monthsSinceFirstRepo = Math.max(1, Math.floor((Date.now() - new Date(repos[repos.length - 1]?.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 30)));
    productivity.reposPerMonth = repos.length / monthsSinceFirstRepo;

    return productivity;
  }

  private calculateSocialStats(user: any): any {
    return {
      followers: user.followers || 0,
      following: user.following || 0,
      publicRepos: user.public_repos || 0,
      publicGists: user.public_gists || 0,
      hireable: user.hireable || false
    };
  }

  private calculateImpactStats(repos: Repository[], events: GitHubEvent[]): any {
    const impact = {
      totalStars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      totalForks: repos.reduce((sum, repo) => sum + repo.forks_count, 0),
      totalWatchers: repos.reduce((sum, repo) => sum + repo.watchers_count, 0),
      averageStarsPerRepo: 0,
      mostStarredRepo: null as Repository | null,
      mostForkedRepo: null as Repository | null
    };

    if (repos.length > 0) {
      impact.averageStarsPerRepo = impact.totalStars / repos.length;
      impact.mostStarredRepo = repos.reduce((max, repo) => repo.stargazers_count > max.stargazers_count ? repo : max);
      impact.mostForkedRepo = repos.reduce((max, repo) => repo.forks_count > max.forks_count ? repo : max);
    }

    return impact;
  }

  private getDateString(daysAgo: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysAgo);
    return date.toISOString().split('T')[0];
  }

  private getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const weekNum = Math.ceil((date.getDate() - date.getDay() + 1) / 7);
    return `${year}-W${String(weekNum).padStart(2, '0')}`;
  }

  private isConsecutiveDay(date1: string, date2: string): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  }
}

// Export singleton instance
export const githubAPI = new GitHubAPIService();
export default GitHubAPIService;

// Export utility functions for backward compatibility
export const githubFetch = async (endpoint: string, options: RequestInit = {}, token?: string): Promise<Response> => {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'MyDevFolioXD/1.0.0',
  };

  // Merge with existing headers if any
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};

export const getGitHubToken = (): string | undefined => {
  return process.env.NEXT_PUBLIC_GITHUB_ACCESS_TOKEN;
};
