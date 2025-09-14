'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';

interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  language: string;
  code: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  usageCount: number;
}

interface CodeSnippetManagerProps {
  username: string;
  repos: Array<{
    id: number;
    name: string;
    language: string | null;
    topics: string[];
  }>;
}

export default function CodeSnippetManager({ username, repos }: CodeSnippetManagerProps) {
  const { t } = useLanguage();
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(null);
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    // Generate realistic code snippets based on user's repositories
    const generateSnippets = () => {
      const languages = Array.from(new Set(repos.map(repo => repo.language).filter(Boolean))) as string[];
      const allTags = Array.from(new Set(repos.flatMap(repo => repo.topics)));

      const mockSnippets: CodeSnippet[] = [];

      // Generate snippets for each language
      languages.forEach((lang, index) => {
        if (!lang) return;

        const langSnippets = [
          {
            title: `${lang} Utility Functions`,
            description: `Common utility functions for ${lang} development`,
            code: generateSampleCode(lang, 'utils'),
            tags: ['utility', 'helper', 'common'],
          },
          {
            title: `${lang} API Client`,
            description: `HTTP client wrapper for ${lang}`,
            code: generateSampleCode(lang, 'api'),
            tags: ['api', 'http', 'client'],
          },
          {
            title: `${lang} Data Structures`,
            description: `Custom data structures implementation in ${lang}`,
            code: generateSampleCode(lang, 'data-structures'),
            tags: ['data-structures', 'algorithms'],
          },
          {
            title: `${lang} Testing Helpers`,
            description: `Testing utilities and mocks for ${lang}`,
            code: generateSampleCode(lang, 'testing'),
            tags: ['testing', 'mocks', 'tdd'],
          }
        ];

        langSnippets.forEach((snippet, snippetIndex) => {
          mockSnippets.push({
            id: `${lang}-${index}-${snippetIndex}`,
            title: snippet.title,
            description: snippet.description,
            language: lang,
            code: snippet.code,
            tags: [...snippet.tags, ...allTags.slice(0, 2)],
            createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            isPublic: Math.random() > 0.3,
            usageCount: Math.floor(Math.random() * 100) + 1,
          });
        });
      });

      setSnippets(mockSnippets);
      setLoading(false);
    };

    // Simulate API delay
    const timer = setTimeout(generateSnippets, 1200);
    return () => clearTimeout(timer);
  }, [repos]);

  const generateSampleCode = (language: string, type: string): string => {
    const samples: Record<string, Record<string, string>> = {
      javascript: {
        utils: `// Utility functions
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

export { debounce, throttle };`,
        api: `// API Client
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = \`\${this.baseURL}\${endpoint}\`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      return await response.json();
    } catch (error) {
      
      throw error;
    }
  }

  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}`,
        'data-structures': `// Stack implementation
class Stack {
  constructor() {
    this.items = [];
  }

  push(element) {
    this.items.push(element);
  }

  pop() {
    if (this.items.length === 0) return null;
    return this.items.pop();
  }

  peek() {
    return this.items[this.items.length - 1];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }
}

// Queue implementation
class Queue {
  constructor() {
    this.items = [];
  }

  enqueue(element) {
    this.items.push(element);
  }

  dequeue() {
    if (this.items.length === 0) return null;
    return this.items.shift();
  }

  front() {
    return this.items[0];
  }

  isEmpty() {
    return this.items.length === 0;
  }
}`,
        testing: `// Testing utilities
const createMockResponse = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
});

const mockFetch = (response) => {
  global.fetch = jest.fn(() => Promise.resolve(response));
};

const waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Custom matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    return {
      message: () => \`expected \${received} to be within range \${floor} - \${ceiling}\`,
      pass,
    };
  },
});`
      },
      typescript: {
        utils: `// Type-safe utility functions
type DebounceFunction<T extends (...args: any[]) => any> = (
  func: T,
  wait: number
) => (...args: Parameters<T>) => void;

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): DebounceFunction<T> => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Type guards
export const isString = (value: unknown): value is string => typeof value === 'string';
export const isNumber = (value: unknown): value is number => typeof value === 'number';
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';`,
        api: `// Type-safe API client
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
}

class TypedApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string, defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { headers, timeout = 5000, ...restOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(\`\${this.baseURL}\${endpoint}\`, {
        ...restOptions,
        headers: { ...this.defaultHeaders, ...headers },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      return {
        data,
        status: response.status,
        message: response.statusText,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw new Error(\`API request failed: \${error instanceof Error ? error.message : 'Unknown error'}\`);
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, data: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}`,
        'data-structures': `// Generic data structures
interface Node<T> {
  value: T;
  next: Node<T> | null;
}

class LinkedList<T> {
  private head: Node<T> | null = null;
  private _size: number = 0;

  get size(): number {
    return this._size;
  }

  append(value: T): void {
    const newNode: Node<T> = { value, next: null };

    if (!this.head) {
      this.head = newNode;
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = newNode;
    }
    this._size++;
  }

  prepend(value: T): void {
    const newNode: Node<T> = { value, next: this.head };
    this.head = newNode;
    this._size++;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }
}

class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }
}`,
        testing: `// Type-safe testing utilities
import { expect } from '@jest/globals';

interface MockResponse<T = any> {
  data: T;
  status: number;
  headers?: Record<string, string>;
}

export const createMockResponse = <T>(
  data: T,
  status: number = 200,
  headers: Record<string, string> = {}
): MockResponse<T> => ({
  data,
  status,
  headers: {
    'content-type': 'application/json',
    ...headers,
  },
});

export const mockApiCall = <T>(response: MockResponse<T>) => {
  return jest.fn(() => Promise.resolve(response));
};

export const waitForComponent = async (
  component: React.ComponentType,
  timeout: number = 1000
): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};

// Custom type guards for testing
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};`
      },
      python: {
        utils: `# Utility functions
import functools
from typing import Callable, TypeVar, Any
import time

T = TypeVar('T')

def debounce(wait_time: float) -> Callable:
    """Decorator to debounce a function call"""
    def decorator(func: Callable) -> Callable:
        last_call = [0.0]

        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            current_time = time.time()
            if current_time - last_call[0] > wait_time:
                last_call[0] = current_time
                return func(*args, **kwargs)
        return wrapper
    return decorator

def throttle(wait_time: float) -> Callable:
    """Decorator to throttle a function call"""
    def decorator(func: Callable) -> Callable:
        last_call = [0.0]

        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            current_time = time.time()
            if current_time - last_call[0] > wait_time:
                last_call[0] = current_time
                return func(*args, **kwargs)
        return wrapper
    return decorator

def memoize(func: Callable) -> Callable:
    """Decorator to memoize function results"""
    cache = {}

    @functools.wraps(func)
    def wrapper(*args, **kwargs) -> Any:
        key = str(args) + str(kwargs)
        if key not in cache:
            cache[key] = func(*args, **kwargs)
        return cache[key]
    return wrapper

# Type checking utilities
def is_string(value: Any) -> bool:
    return isinstance(value, str)

def is_int(value: Any) -> bool:
    return isinstance(value, int)

def is_list(value: Any) -> bool:
    return isinstance(value, list)`,
        api: `# API Client with type hints
import requests
import json
from typing import Dict, Any, Optional, TypeVar, Generic
from dataclasses import dataclass
import logging

T = TypeVar('T')

@dataclass
class ApiResponse(Generic[T]):
    data: T
    status_code: int
    headers: Dict[str, str]
    success: bool

class ApiClient:
    def __init__(self, base_url: str, timeout: int = 30):
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.session = requests.Session()
        self.logger = logging.getLogger(__name__)

    def _make_request(self, method: str, endpoint: str,
                     data: Optional[Dict[str, Any]] = None,
                     headers: Optional[Dict[str, str]] = None) -> requests.Response:
        url = f"{self.base_url}/{endpoint.lstrip('/')}"

        request_headers = {'Content-Type': 'application/json'}
        if headers:
            request_headers.update(headers)

        request_data = json.dumps(data) if data else None

        try:
            response = self.session.request(
                method=method,
                url=url,
                data=request_data,
                headers=request_headers,
                timeout=self.timeout
            )
            return response
        except requests.RequestException as e:
            self.logger.error(f"Request failed: {e}")
            raise

    def get(self, endpoint: str, headers: Optional[Dict[str, str]] = None) -> ApiResponse:
        response = self._make_request('GET', endpoint, headers=headers)
        return ApiResponse(
            data=response.json() if response.content else None,
            status_code=response.status_code,
            headers=dict(response.headers),
            success=response.status_code < 400
        )

    def post(self, endpoint: str, data: Dict[str, Any],
             headers: Optional[Dict[str, str]] = None) -> ApiResponse:
        response = self._make_request('POST', endpoint, data=data, headers=headers)
        return ApiResponse(
            data=response.json() if response.content else None,
            status_code=response.status_code,
            headers=dict(response.headers),
            success=response.status_code < 400
        )

    def put(self, endpoint: str, data: Dict[str, Any],
            headers: Optional[Dict[str, str]] = None) -> ApiResponse:
        response = self._make_request('PUT', endpoint, data=data, headers=headers)
        return ApiResponse(
            data=response.json() if response.content else None,
            status_code=response.status_code,
            headers=dict(response.headers),
            success=response.status_code < 400
        )

    def delete(self, endpoint: str, headers: Optional[Dict[str, str]] = None) -> ApiResponse:
        response = self._make_request('DELETE', endpoint, headers=headers)
        return ApiResponse(
            data=response.json() if response.content else None,
            status_code=response.status_code,
            headers=dict(response.headers),
            success=response.status_code < 400
        )`,
        'data-structures': `# Data structures implementation
from typing import TypeVar, Generic, Optional, List
import heapq

T = TypeVar('T')

class Stack(Generic[T]):
    """Stack implementation with type hints"""

    def __init__(self):
        self._items: List[T] = []

    def push(self, item: T) -> None:
        """Add an item to the top of the stack"""
        self._items.append(item)

    def pop(self) -> Optional[T]:
        """Remove and return the top item"""
        return self._items.pop() if self._items else None

    def peek(self) -> Optional[T]:
        """Return the top item without removing it"""
        return self._items[-1] if self._items else None

    def is_empty(self) -> bool:
        """Check if the stack is empty"""
        return len(self._items) == 0

    def size(self) -> int:
        """Return the size of the stack"""
        return len(self._items)

class Queue(Generic[T]):
    """Queue implementation with type hints"""

    def __init__(self):
        self._items: List[T] = []

    def enqueue(self, item: T) -> None:
        """Add an item to the end of the queue"""
        self._items.append(item)

    def dequeue(self) -> Optional[T]:
        """Remove and return the front item"""
        return self._items.pop(0) if self._items else None

    def peek(self) -> Optional[T]:
        """Return the front item without removing it"""
        return self._items[0] if self._items else None

    def is_empty(self) -> bool:
        """Check if the queue is empty"""
        return len(self._items) == 0

    def size(self) -> int:
        """Return the size of the queue"""
        return len(self._items)

class PriorityQueue(Generic[T]):
    """Priority queue implementation"""

    def __init__(self):
        self._heap: List[T] = []

    def push(self, item: T, priority: int = 0) -> None:
        """Add an item with priority"""
        heapq.heappush(self._heap, (priority, item))

    def pop(self) -> Optional[T]:
        """Remove and return the highest priority item"""
        return heapq.heappop(self._heap)[1] if self._heap else None

    def peek(self) -> Optional[T]:
        """Return the highest priority item without removing it"""
        return self._heap[0][1] if self._heap else None

    def is_empty(self) -> bool:
        """Check if the priority queue is empty"""
        return len(self._heap) == 0

    def size(self) -> int:
        """Return the size of the priority queue"""
        return len(self._heap)`,
        testing: `# Testing utilities for Python
import pytest
from unittest.mock import Mock, patch, MagicMock
from typing import Any, Dict, Callable
import json

def create_mock_response(data: Dict[str, Any], status_code: int = 200) -> Mock:
    """Create a mock response object"""
    mock_response = Mock()
    mock_response.json.return_value = data
    mock_response.status_code = status_code
    mock_response.content = json.dumps(data).encode('utf-8')
    mock_response.headers = {'Content-Type': 'application/json'}
    return mock_response

def mock_requests_get(response_data: Dict[str, Any], status_code: int = 200):
    """Context manager to mock requests.get"""
    mock_response = create_mock_response(response_data, status_code)

    def mock_get(*args, **kwargs):
        return mock_response

    return patch('requests.get', side_effect=mock_get)

def mock_requests_post(response_data: Dict[str, Any], status_code: int = 201):
    """Context manager to mock requests.post"""
    mock_response = create_mock_response(response_data, status_code)

    def mock_post(*args, **kwargs):
        return mock_response

    return patch('requests.post', side_effect=mock_post)

class AsyncMock(MagicMock):
    """Mock for async functions"""
    async def __call__(self, *args, **kwargs):
        return super(AsyncMock, self).__call__(*args, **kwargs)

def async_mock(return_value: Any = None):
    """Create an async mock function"""
    mock = AsyncMock()
    mock.return_value = return_value
    return mock

# Custom pytest fixtures
@pytest.fixture
def sample_user_data():
    """Sample user data for testing"""
    return {
        'id': 1,
        'username': 'testuser',
        'email': 'test@example.com',
        'is_active': True
    }

@pytest.fixture
def sample_project_data():
    """Sample project data for testing"""
    return {
        'id': 1,
        'name': 'Test Project',
        'description': 'A test project',
        'owner_id': 1,
        'is_public': True
    }

# Assertion helpers
def assert_dict_contains(actual: Dict, expected: Dict) -> None:
    """Assert that actual dict contains all key-value pairs from expected"""
    for key, value in expected.items():
        assert key in actual, f"Key '{key}' not found in dict"
        assert actual[key] == value, f"Value for key '{key}' doesn't match: expected {value}, got {actual[key]}"

def assert_list_contains(actual: List, expected: List) -> None:
    """Assert that actual list contains all items from expected"""
    for item in expected:
        assert item in actual, f"Item '{item}' not found in list"`
      }
    };

    return samples[language]?.[type] || `# Sample ${language} code for ${type}`;
  };

  // Get unique languages and tags
  const languages = Array.from(new Set(snippets.map(s => s.language)));
  const allTags = Array.from(new Set(snippets.flatMap(s => s.tags)));

  // Filter snippets
  const filteredSnippets = snippets.filter(snippet => {
    const matchesLanguage = filterLanguage === 'all' || snippet.language === filterLanguage;
    const matchesTag = filterTag === 'all' || snippet.tags.includes(filterTag);
    const matchesSearch = searchTerm === '' ||
      snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesLanguage && matchesTag && matchesSearch;
  });

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      javascript: '#f7df1e',
      typescript: '#3178c6',
      python: '#3776ab',
      java: '#007396',
      'c++': '#00599c',
      'c#': '#239120',
      php: '#777bb4',
      ruby: '#cc342d',
      go: '#00add8',
      rust: '#000000',
      swift: '#fa7343',
      kotlin: '#7f52ff',
    };
    return colors[language.toLowerCase()] || '#6b7280';
  };

  if (loading) {
    return (
      <motion.div
        className='card'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
            <p className='text-[var(--text-secondary)]'>Loading code snippets...</p>
            <p className='text-sm text-[var(--text-secondary)] mt-2'>Analyzing your repositories</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className='card'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-bold'>Code Snippet Manager</h2>
          <p className='text-[var(--text-secondary)] mt-1'>
            Manage and showcase your reusable code snippets
          </p>
        </div>
        <div className='text-sm text-[var(--text-secondary)]'>
          {filteredSnippets.length} of {snippets.length} snippets
        </div>
      </div>

      {/* Filters */}
      <div className='flex flex-wrap gap-4 mb-6'>
        <div className='flex items-center gap-2'>
          <span className='text-sm text-[var(--text-secondary)]'>Search:</span>
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Search snippets...'
            className='bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-sm text-[var(--text-secondary)]'>Language:</span>
          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            className='bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value='all'>All Languages</option>
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-sm text-[var(--text-secondary)]'>Tag:</span>
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className='bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-primary)] px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value='all'>All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Snippets Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {filteredSnippets.map((snippet, index) => (
          <motion.div
            key={snippet.id}
            className='bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-4 cursor-pointer hover:border-blue-500/50 transition-colors'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            onClick={() => setSelectedSnippet(snippet)}
            whileHover={{ scale: 1.02 }}
          >
            <div className='flex items-start justify-between mb-3'>
              <div className='flex items-center gap-2'>
                <div
                  className='w-3 h-3 rounded-full'
                  style={{ backgroundColor: getLanguageColor(snippet.language) }}
                />
                <span className='text-xs font-medium text-[var(--text-secondary)] uppercase'>
                  {snippet.language}
                </span>
              </div>
              <div className='flex items-center gap-1'>
                <span className='text-xs text-[var(--text-secondary)]'>👁</span>
                <span className='text-xs text-[var(--text-secondary)]'>{snippet.usageCount}</span>
              </div>
            </div>

            <h3 className='font-semibold mb-2 line-clamp-2'>{snippet.title}</h3>
            <p className='text-sm text-[var(--text-secondary)] mb-3 line-clamp-2'>
              {snippet.description}
            </p>

            <div className='flex flex-wrap gap-1 mb-3'>
              {snippet.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className='px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs'
                >
                  {tag}
                </span>
              ))}
              {snippet.tags.length > 3 && (
                <span className='px-2 py-1 bg-gray-500/10 text-gray-400 rounded-full text-xs'>
                  +{snippet.tags.length - 3}
                </span>
              )}
            </div>

            <div className='flex items-center justify-between text-xs text-[var(--text-secondary)]'>
              <span>{snippet.isPublic ? 'Public' : 'Private'}</span>
              <span>{new Date(snippet.updatedAt).toLocaleDateString()}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Snippet Detail Modal */}
      <AnimatePresence>
        {selectedSnippet && (
          <motion.div
            className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedSnippet(null)}
          >
            <motion.div
              className='bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden'
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className='p-6 border-b border-[var(--card-border)]'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-3'>
                    <div
                      className='w-4 h-4 rounded-full'
                      style={{ backgroundColor: getLanguageColor(selectedSnippet.language) }}
                    />
                    <h2 className='text-xl font-bold'>{selectedSnippet.title}</h2>
                  </div>
                  <button
                    onClick={() => setSelectedSnippet(null)}
                    className='text-[var(--text-secondary)] hover:text-white p-2'
                  >
                    ✕
                  </button>
                </div>

                <p className='text-[var(--text-secondary)] mb-4'>{selectedSnippet.description}</p>

                <div className='flex items-center gap-4 text-sm'>
                  <span className='flex items-center gap-1'>
                    <span>Language:</span>
                    <span className='font-medium'>{selectedSnippet.language}</span>
                  </span>
                  <span className='flex items-center gap-1'>
                    <span>Visibility:</span>
                    <span className={`font-medium ${selectedSnippet.isPublic ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedSnippet.isPublic ? 'Public' : 'Private'}
                    </span>
                  </span>
                  <span className='flex items-center gap-1'>
                    <span>Usage:</span>
                    <span className='font-medium text-blue-400'>{selectedSnippet.usageCount} times</span>
                  </span>
                </div>
              </div>

              <div className='p-6 overflow-y-auto max-h-96'>
                <div className='mb-4'>
                  <h3 className='font-semibold mb-2'>Tags</h3>
                  <div className='flex flex-wrap gap-2'>
                    {selectedSnippet.tags.map(tag => (
                      <span
                        key={tag}
                        className='px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm'
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className='font-semibold mb-2'>Code</h3>
                  <pre className='bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm'>
                    <code>{selectedSnippet.code}</code>
                  </pre>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
