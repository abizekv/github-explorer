import axios from 'axios';

const BASE_URL = 'https://api.github.com';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string;
  topics: string[];
  updated_at: string;
  size: number;
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface SearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: Repository[];
}

export interface SearchParams {
  query?: string;
  language?: string;
  sort?: 'stars' | 'forks' | 'updated';
  order?: 'desc' | 'asc';
  per_page?: number;
  page?: number;
}

class GitHubApi {
  private async makeRequest<T>(url: string): Promise<T> {
    try {
      const response = await axios.get(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-Explorer-App'
        }
      });
      return response.data;
    } catch (error) {
      console.error('GitHub API Error:', error);
      throw error;
    }
  }

  async searchRepositories(params: SearchParams = {}): Promise<SearchResponse> {
    const {
      query = '',
      language = '',
      sort = 'stars',
      order = 'desc',
      per_page = 30,
      page = 1
    } = params;

    // Build search query
    let searchQuery = query || 'stars:>1';
    
    if (language && language !== 'All') {
      searchQuery += ` language:${language}`;
    }

    // Add date filter for trending (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateFilter = thirtyDaysAgo.toISOString().split('T')[0];
    
    if (!query) {
      searchQuery += ` created:>${dateFilter}`;
    }

    const url = `${BASE_URL}/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=${sort}&order=${order}&per_page=${per_page}&page=${page}`;
    
    return this.makeRequest<SearchResponse>(url);
  }

  async getTrendingRepositories(language?: string, period: 'day' | 'week' | 'month' = 'week'): Promise<Repository[]> {
    const dateMap = {
      day: 1,
      week: 7,
      month: 30
    };

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - dateMap[period]);
    const dateFilter = daysAgo.toISOString().split('T')[0];

    let searchQuery = `created:>${dateFilter} stars:>10`;
    
    if (language && language !== 'All') {
      searchQuery += ` language:${language}`;
    }

    const url = `${BASE_URL}/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=stars&order=desc&per_page=30`;
    
    const response = await this.makeRequest<SearchResponse>(url);
    return response.items;
  }

  async getRepositoryDetails(owner: string, repo: string): Promise<Repository> {
    const url = `${BASE_URL}/repos/${owner}/${repo}`;
    return this.makeRequest<Repository>(url);
  }

  async getPopularTopics(): Promise<string[]> {
    // Get popular topics from trending repositories
    const trendingRepos = await this.getTrendingRepositories();
    const topicsMap = new Map<string, number>();

    trendingRepos.forEach(repo => {
      if (repo.topics) {
        repo.topics.forEach(topic => {
          topicsMap.set(topic, (topicsMap.get(topic) || 0) + 1);
        });
      }
    });

    // Sort by frequency and return top topics
    return Array.from(topicsMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([topic]) => topic);
  }
}

export const githubApi = new GitHubApi();
export type { Repository, SearchResponse };