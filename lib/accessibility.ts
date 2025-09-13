// Accessibility Utilities for GitHubFolioXD

// ARIA Label Generators
export const ariaLabels = {
  // Navigation
  navigation: {
    main: 'Main navigation',
    skipToContent: 'Skip to main content',
    breadcrumb: 'Breadcrumb navigation',
  },

  // Buttons and Controls
  buttons: {
    close: 'Close',
    open: 'Open',
    menu: 'Toggle menu',
    search: 'Search',
    filter: 'Filter options',
    sort: 'Sort options',
    loadMore: 'Load more items',
    refresh: 'Refresh content',
    share: 'Share this content',
    download: 'Download',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save changes',
    cancel: 'Cancel',
    submit: 'Submit form',
    reset: 'Reset form',
  },

  // Form Elements
  forms: {
    searchInput: 'Search repositories, projects, or users',
    emailInput: 'Enter your email address',
    nameInput: 'Enter your full name',
    messageInput: 'Enter your message',
    usernameInput: 'Enter GitHub username',
    passwordInput: 'Enter your password',
    confirmPasswordInput: 'Confirm your password',
  },

  // Status Messages
  status: {
    loading: 'Loading content, please wait',
    error: 'An error occurred',
    success: 'Operation completed successfully',
    warning: 'Warning message',
    info: 'Information message',
  },

  // Live Regions
  live: {
    resultsCount: 'Search results count updated',
    loadingProgress: 'Loading progress',
    notification: 'New notification',
    statusUpdate: 'Status updated',
  },

  // Charts and Data Visualization
  charts: {
    barChart: 'Bar chart showing',
    lineChart: 'Line chart displaying',
    pieChart: 'Pie chart representing',
    heatmap: 'Activity heatmap for',
    progressBar: 'Progress indicator',
  },

  // Media
  media: {
    image: (alt: string) => `Image: ${alt}`,
    avatar: (username: string) => `Avatar for ${username}`,
    logo: 'GitHubFolioXD logo',
    icon: (name: string) => `${name} icon`,
  },

  // Links
  links: {
    external: 'Opens in new tab',
    internal: 'Navigate to',
    profile: (username: string) => `View ${username}'s profile`,
    repository: (name: string) => `View ${name} repository`,
    project: (name: string) => `View ${name} project`,
  }
};

// Keyboard Navigation Utilities
export const keyboardNavigation = {
  // Focus management
  focusableSelectors: [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', '),

  // Focus trap utilities
  focusTrap: {
    getFocusableElements: (container: HTMLElement): HTMLElement[] => {
      const focusableElements = container.querySelectorAll(keyboardNavigation.focusableSelectors);
      return Array.from(focusableElements) as HTMLElement[];
    },

    trapFocus: (container: HTMLElement, event: KeyboardEvent): void => {
      const focusableElements = keyboardNavigation.focusTrap.getFocusableElements(container);
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    }
  },

  // Skip links
  skipLinks: {
    create: (targetId: string, label: string): HTMLAnchorElement => {
      const skipLink = document.createElement('a');
      skipLink.href = `#${targetId}`;
      skipLink.textContent = label;
      skipLink.className = 'skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded';
      return skipLink;
    }
  }
};

// Screen Reader Utilities
export const screenReader = {
  // Screen reader only text
  srOnly: 'sr-only',

  // Announce content to screen readers
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  // Update live region
  updateLiveRegion: (regionId: string, message: string): void => {
    const region = document.getElementById(regionId);
    if (region) {
      region.textContent = message;
    }
  }
};

// Color Contrast Utilities
export const colorContrast = {
  // Check if color combination meets WCAG standards
  meetsWCAG: (foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
    // This is a simplified check - in production, use a proper color contrast library
    const contrastRatio = 4.5; // Minimum for AA
    return contrastRatio >= (level === 'AAA' ? 7 : 4.5);
  },

  // Get accessible color combinations
  accessibleColors: {
    primary: {
      light: '#8976ea',
      dark: '#6f5bd0',
      onLight: '#ffffff',
      onDark: '#ffffff'
    },
    secondary: {
      light: '#6b7280',
      dark: '#9ca3af',
      onLight: '#ffffff',
      onDark: '#000000'
    },
    success: {
      light: '#10b981',
      dark: '#34d399',
      onLight: '#ffffff',
      onDark: '#ffffff'
    },
    error: {
      light: '#ef4444',
      dark: '#f87171',
      onLight: '#ffffff',
      onDark: '#ffffff'
    },
    warning: {
      light: '#f59e0b',
      dark: '#fbbf24',
      onLight: '#000000',
      onDark: '#000000'
    }
  }
};

// Motion Preferences
export const motionPreferences = {
  // Check if user prefers reduced motion
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Respect motion preferences in animations
  respectMotionPreference: (animationProps: any): any => {
    if (motionPreferences.prefersReducedMotion()) {
      return {
        ...animationProps,
        transition: { duration: 0.1 },
        animate: animationProps.initial || {}
      };
    }
    return animationProps;
  }
};

// High Contrast Mode Detection
export const highContrastMode = {
  // Check if high contrast mode is enabled
  isEnabled: (): boolean => {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  // Apply high contrast styles
  applyHighContrast: (element: HTMLElement): void => {
    if (highContrastMode.isEnabled()) {
      element.style.border = '2px solid currentColor';
      element.style.backgroundColor = 'transparent';
    }
  }
};

// Focus Management
export const focusManagement = {
  // Move focus to element
  moveFocus: (element: HTMLElement): void => {
    element.focus();
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  // Save and restore focus
  saveFocus: (): (() => void) => {
    const activeElement = document.activeElement as HTMLElement;
    return () => {
      if (activeElement && typeof activeElement.focus === 'function') {
        activeElement.focus();
      }
    };
  },

  // Focus first focusable element
  focusFirst: (container: HTMLElement): void => {
    const focusableElements = keyboardNavigation.focusTrap.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }
};

// Error Handling for Accessibility
export const accessibilityErrorHandler = {
  // Handle accessibility violations
  onViolation: (violations: any[]): void => {
    violations.forEach(violation => {
      console.warn('Accessibility violation:', violation);
      screenReader.announce(`Accessibility issue: ${violation.description}`, 'assertive');
    });
  },

  // Validate accessibility
  validate: (element: HTMLElement): void => {
    // Basic accessibility checks
    const issues: string[] = [];

    // Check for alt text on images
    const images = element.querySelectorAll('img');
    images.forEach(img => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        issues.push('Image missing alt text');
      }
    });

    // Check for labels on form elements
    const inputs = element.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const label = element.querySelector(`label[for="${input.id}"]`);
      if (!label && !input.getAttribute('aria-label')) {
        issues.push('Form element missing label');
      }
    });

    if (issues.length > 0) {
      console.warn('Accessibility issues found:', issues);
    }
  }
};

// Touch and Gesture Support
export const touchSupport = {
  // Check if touch is supported
  isSupported: (): boolean => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  // Touch gesture handlers
  gestures: {
    onSwipe: (element: HTMLElement, callback: (direction: 'left' | 'right' | 'up' | 'down') => void): void => {
      let startX = 0;
      let startY = 0;

      const handleTouchStart = (e: TouchEvent) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      };

      const handleTouchEnd = (e: TouchEvent) => {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = startX - endX;
        const diffY = startY - endY;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
          callback(diffX > 0 ? 'left' : 'right');
        } else if (Math.abs(diffY) > 50) {
          callback(diffY > 0 ? 'up' : 'down');
        }
      };

      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchend', handleTouchEnd);
    }
  }
};

// Export all utilities
export const accessibilityUtils = {
  ariaLabels,
  keyboardNavigation,
  screenReader,
  colorContrast,
  motionPreferences,
  highContrastMode,
  focusManagement,
  accessibilityErrorHandler,
  touchSupport
};