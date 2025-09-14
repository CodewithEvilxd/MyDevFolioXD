// Advanced Animation Hooks for GitHubFolioXD
import { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

// Hook for scroll-triggered animations
export const useScrollAnimation = (threshold = 0.1) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: threshold, once: true });

  return { ref, isInView };
};

// Hook for staggered animations
export const useStaggeredAnimation = (items: any[], delay = 0.1) => {
  const [animatedItems, setAnimatedItems] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedItems(items);
    }, 100);

    return () => clearTimeout(timer);
  }, [items]);

  return animatedItems.map((item, index) => ({
    ...item,
    delay: index * delay
  }));
};

// Hook for hover animations with sound effects (optional)
export const useHoverAnimation = () => {
  const [isHovered, setIsHovered] = useState(false);

  const hoverProps = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false)
  };

  return { isHovered, hoverProps };
};

// Hook for click animations
export const useClickAnimation = () => {
  const [isClicked, setIsClicked] = useState(false);

  const clickProps = {
    onClick: () => {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 150);
    }
  };

  return { isClicked, clickProps };
};

// Hook for loading states with animations
export const useLoadingAnimation = (isLoading: boolean, delay = 0) => {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowLoader(true), delay);
      return () => clearTimeout(timer);
    } else {
      setShowLoader(false);
    }
  }, [isLoading, delay]);

  return showLoader;
};

// Hook for progressive loading
export const useProgressiveLoading = (items: any[], batchSize = 3) => {
  const [loadedItems, setLoadedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;

    setIsLoading(true);
    let currentIndex = 0;

    const loadBatch = () => {
      const nextBatch = items.slice(currentIndex, currentIndex + batchSize);
      setLoadedItems(prev => [...prev, ...nextBatch]);
      currentIndex += batchSize;

      if (currentIndex < items.length) {
        setTimeout(loadBatch, 200);
      } else {
        setIsLoading(false);
      }
    };

    loadBatch();
  }, [items, batchSize]);

  return { loadedItems, isLoading };
};

// Hook for typing animation
export const useTypingAnimation = (text: string, speed = 50) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text) return;

    setIsTyping(true);
    setDisplayText('');

    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(prev => prev + text.charAt(i));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayText, isTyping };
};

// Hook for counter animation
export const useCounterAnimation = (end: number, duration = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration]);

  return count;
};

// Hook for parallax effect
export const useParallax = (speed = 0.5) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.pageYOffset * speed);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return offset;
};

// Hook for mouse position tracking
export const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return mousePosition;
};

// Hook for intersection observer with custom threshold
export const useIntersectionObserver = (
  threshold = 0.1,
  rootMargin = '0px'
) => {
  const ref = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, rootMargin]);

  return { ref, isIntersecting };
};

// Hook for reduced motion preference
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

// Hook for theme-aware animations
export const useThemeAnimation = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark') ||
                        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(isDarkMode);
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
};

// Hook for sequential animations
export const useSequentialAnimation = (steps: (() => void)[], delay = 500) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = () => {
    setIsPlaying(true);
    setCurrentStep(0);

    steps.forEach((step, index) => {
      setTimeout(() => {
        step();
        if (index === steps.length - 1) {
          setIsPlaying(false);
        }
      }, index * delay);
    });
  };

  return { currentStep, isPlaying, play };
};

// Hook for gesture animations
export const useGestureAnimation = () => {
  const [gesture, setGesture] = useState<'none' | 'swipe-left' | 'swipe-right' | 'tap'>('none');

  useEffect(() => {
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
        setGesture(diffX > 0 ? 'swipe-left' : 'swipe-right');
      } else {
        setGesture('tap');
      }

      setTimeout(() => setGesture('none'), 300);
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return gesture;
};
