// Responsive Design Utilities for GitHubFolioXD

// Breakpoint definitions
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Responsive utility functions
export const getResponsiveValue = <T>(
  values: Partial<Record<keyof typeof breakpoints | 'default', T>>
): T => {
  if (typeof window === 'undefined') {
    return values.default || values.md || Object.values(values)[0];
  }

  const width = window.innerWidth;

  if (width >= breakpoints['2xl'] && values['2xl']) return values['2xl'];
  if (width >= breakpoints.xl && values.xl) return values.xl;
  if (width >= breakpoints.lg && values.lg) return values.lg;
  if (width >= breakpoints.md && values.md) return values.md;
  if (width >= breakpoints.sm && values.sm) return values.sm;

  return values.default || values.md || Object.values(values)[0];
};

// Hook for responsive values
export const useResponsiveValue = <T>(
  values: Partial<Record<keyof typeof breakpoints | 'default', T>>
): T => {
  const [value, setValue] = React.useState<T>(() =>
    getResponsiveValue(values)
  );

  React.useEffect(() => {
    const handleResize = () => {
      setValue(getResponsiveValue(values));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [values]);

  return value;
};

// Responsive grid utilities
export const responsiveGrid = {
  // Auto-fit grid with responsive columns
  autoFit: (minWidth: string) => `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(${minWidth}, 1fr));
    gap: 1rem;
  `,

  // Responsive column spans
  cols: {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6',
  },

  // Responsive gap sizes
  gaps: {
    sm: 'gap-2 md:gap-3',
    md: 'gap-3 md:gap-4 lg:gap-6',
    lg: 'gap-4 md:gap-6 lg:gap-8',
    xl: 'gap-6 md:gap-8 lg:gap-10 xl:gap-12',
  }
};

// Responsive text utilities
export const responsiveText = {
  // Responsive font sizes
  sizes: {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl md:text-2xl',
    xl: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl',
    '2xl': 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
    '3xl': 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
  },

  // Responsive line heights
  leading: {
    tight: 'leading-tight',
    normal: 'leading-normal sm:leading-relaxed',
    relaxed: 'leading-relaxed sm:leading-loose',
    loose: 'leading-loose',
  }
};

// Responsive spacing utilities
export const responsiveSpacing = {
  // Responsive padding
  padding: {
    sm: 'p-2 sm:p-3 md:p-4',
    md: 'p-3 sm:p-4 md:p-6 lg:p-8',
    lg: 'p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12',
    xl: 'p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16',
  },

  // Responsive margins
  margin: {
    sm: 'm-2 sm:m-3 md:m-4',
    md: 'm-3 sm:m-4 md:m-6 lg:m-8',
    lg: 'm-4 sm:m-6 md:m-8 lg:m-10 xl:m-12',
  },

  // Responsive spacing between elements
  space: {
    x: {
      sm: 'space-x-2 sm:space-x-3 md:space-x-4',
      md: 'space-x-3 sm:space-x-4 md:space-x-6 lg:space-x-8',
      lg: 'space-x-4 sm:space-x-6 md:space-x-8 lg:space-x-10 xl:space-x-12',
    },
    y: {
      sm: 'space-y-2 sm:space-y-3 md:space-y-4',
      md: 'space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8',
      lg: 'space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10 xl:space-y-12',
    }
  }
};

// Responsive flexbox utilities
export const responsiveFlex = {
  // Responsive flex directions
  direction: {
    col: 'flex-col sm:flex-row',
    row: 'flex-row sm:flex-col',
  },

  // Responsive justify content
  justify: {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  },

  // Responsive align items
  align: {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  },

  // Responsive flex wrap
  wrap: 'flex-wrap sm:flex-nowrap',
  nowrap: 'flex-nowrap sm:flex-wrap',
};

// Responsive container utilities
export const responsiveContainer = {
  // Responsive max widths
  maxWidth: {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  },

  // Responsive container with padding
  container: 'container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12',
};

// Responsive visibility utilities
export const responsiveVisibility = {
  // Show/hide based on screen size
  hidden: {
    sm: 'hidden sm:block',
    md: 'hidden md:block',
    lg: 'hidden lg:block',
    xl: 'hidden xl:block',
  },

  block: {
    sm: 'block sm:hidden',
    md: 'block md:hidden',
    lg: 'block lg:hidden',
    xl: 'block xl:hidden',
  }
};

// Responsive aspect ratio utilities
export const responsiveAspectRatio = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  wide: 'aspect-[16/9]',
  ultraWide: 'aspect-[21/9]',
};

// Responsive border radius utilities
export const responsiveBorderRadius = {
  none: 'rounded-none',
  sm: 'rounded-sm sm:rounded',
  md: 'rounded sm:rounded-md md:rounded-lg',
  lg: 'rounded-md sm:rounded-lg md:rounded-xl lg:rounded-2xl',
  xl: 'rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl xl:rounded-full',
  full: 'rounded-full',
};

// Responsive shadow utilities
export const responsiveShadow = {
  none: 'shadow-none',
  sm: 'shadow-sm sm:shadow',
  md: 'shadow sm:shadow-md md:shadow-lg',
  lg: 'shadow-md sm:shadow-lg md:shadow-xl lg:shadow-2xl',
  xl: 'shadow-lg sm:shadow-xl md:shadow-2xl lg:shadow-inner xl:shadow-2xl',
};

// Utility function to combine responsive classes
export const combineResponsiveClasses = (...classes: (string | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Hook for responsive screen size detection
export const useScreenSize = () => {
  const [screenSize, setScreenSize] = React.useState<keyof typeof breakpoints | 'default'>('default');

  React.useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width >= breakpoints['2xl']) setScreenSize('2xl');
      else if (width >= breakpoints.xl) setScreenSize('xl');
      else if (width >= breakpoints.lg) setScreenSize('lg');
      else if (width >= breakpoints.md) setScreenSize('md');
      else if (width >= breakpoints.sm) setScreenSize('sm');
      else setScreenSize('default');
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
};

// Hook for responsive orientation detection
export const useOrientation = () => {
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait');

  React.useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return orientation;
};

// Hook for responsive device detection
export const useDeviceType = () => {
  const [deviceType, setDeviceType] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  React.useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      if (width < breakpoints.sm) setDeviceType('mobile');
      else if (width < breakpoints.lg) setDeviceType('tablet');
      else setDeviceType('desktop');
    };

    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  return deviceType;
};

// Import React for hooks
import React from 'react';