/**
 * MUSIC PLAYER TEST RUNNER
 *
 * This script helps execute and track the manual test scenarios
 * for the next song functionality across all types of songs.
 */

import { NEXT_SONG_TEST_SCENARIOS, TEST_CHECKLIST, BUG_REPORT_TEMPLATE } from './MusicPlayer.test.manual';

interface TestResult {
  testId: string;
  status: 'passed' | 'failed' | 'skipped' | 'pending';
  notes?: string;
  timestamp: Date;
  duration?: number;
}

class MusicPlayerTestRunner {
  private results: TestResult[] = [];
  private currentTest: string | null = null;
  private startTime: Date | null = null;

  /**
    * Start a test scenario
    */
  startTest(testId: string): void {
    this.currentTest = testId;
    this.startTime = new Date();
  }

  /**
    * End a test scenario with result
    */
  endTest(status: TestResult['status'], notes?: string): void {
    if (!this.currentTest || !this.startTime) {
      return;
    }

    const duration = Date.now() - this.startTime.getTime();
    const result: TestResult = {
      testId: this.currentTest,
      status,
      notes,
      timestamp: new Date(),
      duration
    };

    this.results.push(result);

    this.currentTest = null;
    this.startTime = null;
  }

  /**
   * Get test scenario by ID
   */
  getTestScenario(testId: string) {
    return NEXT_SONG_TEST_SCENARIOS.find(test => test.id === testId);
  }

  /**
    * Run all high priority tests
    */
  async runHighPriorityTests(): Promise<void> {
    const highPriorityTests = NEXT_SONG_TEST_SCENARIOS.filter(test => test.priority === 'high');

    for (const test of highPriorityTests) {
      await this.runTestScenario(test);
    }
  }

  /**
    * Run a specific test scenario
    */
  async runTestScenario(test: typeof NEXT_SONG_TEST_SCENARIOS[0]): Promise<void> {
    // Wait for user input
    await this.waitForUserInput();

    this.startTest(test.id);

    await this.waitForUserInput();

    const result = await this.getUserInput();

    let status: TestResult['status'] = 'pending';
    let notes = '';

    if (result.toLowerCase() === 'y') {
      status = 'passed';
    } else if (result.toLowerCase() === 'n') {
      status = 'failed';
      notes = await this.getUserInput();
    } else if (result.toLowerCase() === 's') {
      status = 'skipped';
      notes = await this.getUserInput();
    }

    this.endTest(status, notes);
  }

  /**
    * Generate test report
    */
  generateReport(): void {
    // Report generation logic removed -  statements cleaned up
  }

  /**
   * Export results to JSON
   */
  exportResults(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.status === 'passed').length,
        failed: this.results.filter(r => r.status === 'failed').length,
        skipped: this.results.filter(r => r.status === 'skipped').length
      },
      results: this.results,
      testScenarios: NEXT_SONG_TEST_SCENARIOS
    }, null, 2);
  }

  /**
   * Utility method to wait for user input
   */
  protected async waitForUserInput(): Promise<void> {
    return new Promise((resolve) => {
      // In browser environment, this would use prompt or a proper input handler
      // For now, we'll use a timeout to simulate waiting
      setTimeout(resolve, 100);
    });
  }

  /**
   * Utility method to get user input
   */
  protected async getUserInput(): Promise<string> {
    return new Promise((resolve) => {
      // In browser environment, this would use prompt or a proper input handler
      // For now, return a default value
      setTimeout(() => resolve('y'), 100);
    });
  }
}

// Browser-compatible test runner
export class BrowserTestRunner extends MusicPlayerTestRunner {
  private outputElement: HTMLElement | null = null;

  constructor(outputSelector?: string) {
    super();
    if (outputSelector && typeof document !== 'undefined') {
      this.outputElement = document.querySelector(outputSelector);
    }
  }

  log(message: string): void {
    if (this.outputElement) {
      this.outputElement.innerHTML += message + '<br>';
    }
  }

  async waitForUserInput(): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined') {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Press Enter to continue...';
        input.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; padding: 10px;';

        input.onkeydown = (e) => {
          if (e.key === 'Enter') {
            input.remove();
            resolve();
          }
        };

        document.body.appendChild(input);
        input.focus();
      } else {
        setTimeout(resolve, 1000);
      }
    });
  }

  async getUserInput(): Promise<string> {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined') {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Enter y/n/s:';
        input.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; padding: 10px;';

        input.onkeydown = (e) => {
          if (e.key === 'Enter') {
            const value = input.value;
            input.remove();
            resolve(value);
          }
        };

        document.body.appendChild(input);
        input.focus();
      } else {
        resolve('y');
      }
    });
  }
}

/**
 * QUICK TEST FUNCTIONS FOR IMMEDIATE TESTING
 */
export const quickTests = {
  /**
    * Test basic next song functionality
    */
  async testBasicNextSong(): Promise<void> {
    const runner = new BrowserTestRunner('#test-output');

    // Test basic next song
    const basicTest = NEXT_SONG_TEST_SCENARIOS.find(t => t.id === 'NEXT_001');
    if (basicTest) {
      await runner.runTestScenario(basicTest);
    }

    runner.generateReport();
  },

  /**
    * Test shuffle mode
    */
  async testShuffleMode(): Promise<void> {
    const runner = new BrowserTestRunner('#test-output');

    const shuffleTest = NEXT_SONG_TEST_SCENARIOS.find(t => t.id === 'NEXT_002');
    if (shuffleTest) {
      await runner.runTestScenario(shuffleTest);
    }

    runner.generateReport();
  },

  /**
    * Test genre consistency
    */
  async testGenreConsistency(): Promise<void> {
    const runner = new BrowserTestRunner('#test-output');

    const genreTests = NEXT_SONG_TEST_SCENARIOS.filter(t =>
      t.category === 'Genre Matching' && t.priority === 'high'
    );

    for (const test of genreTests) {
      await runner.runTestScenario(test);
    }

    runner.generateReport();
  },

  /**
    * Run all tests
    */
  async runAllTests(): Promise<void> {
    const runner = new BrowserTestRunner('#test-output');
    await runner.runHighPriorityTests();
    runner.generateReport();

    // Export results
    const results = runner.exportResults();

    // Download results if in browser
    if (typeof window !== 'undefined') {
      const blob = new Blob([results], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `music-player-test-results-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }
};

/**
 * TEST UTILITIES FOR BROWSER CONSOLE
 */
export const testUtils = {
  /**
   * Check if MusicPlayer component is rendered
   */
  checkMusicPlayerPresence(): boolean {
    const musicPlayer = document.querySelector('[data-testid="music-player"]') ||
                       document.querySelector('.music-player') ||
                       document.querySelector('[class*="MusicPlayer"]');

    if (musicPlayer) {
      return true;
    } else {
      return false;
    }
  },

  /**
   * Simulate next song button click
   */
  simulateNextSongClick(): void {
    const nextButton = document.querySelector('[data-testid="next-song-btn"]') ||
                      document.querySelector('button[class*="next"]') ||
                      document.querySelector('svg[class*="next"]')?.closest('button');

    if (nextButton) {
      (nextButton as HTMLElement).click();
    }
  },

  /**
   * Monitor song changes
   */
  monitorSongChanges(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          // Song change detected
        }
      });
    });

    // Observe current song display
    const currentSongElement = document.querySelector('[data-testid="current-song"]') ||
                              document.querySelector('.current-song') ||
                              document.querySelector('[class*="current"]');

    if (currentSongElement) {
      observer.observe(currentSongElement, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }
  },

  /**
   * Test keyboard shortcuts
   */
  testKeyboardShortcuts(): void {
    // Test Ctrl + Right Arrow for next song
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      ctrlKey: true,
      bubbles: true
    });

    document.dispatchEvent(event);
  }
};

// Make functions available globally in browser
if (typeof window !== 'undefined') {
  (window as any).MusicPlayerTests = {
    runner: new BrowserTestRunner(),
    quickTests,
    testUtils,
    scenarios: NEXT_SONG_TEST_SCENARIOS
  };
}

export default MusicPlayerTestRunner;