// Advanced Animation System for GitHubFolioXD
import { Variants } from 'framer-motion';

// Core Animation Variants
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const fadeInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -50,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const fadeInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 50,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    rotateY: -15
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const slideInFromBottom: Variants = {
  hidden: {
    opacity: 0,
    y: 100,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

// Staggered Container Variants
export const createStaggeredContainer = (staggerDelay: number = 0.1): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.2
    }
  }
});

export const createStaggeredItem = (delay: number = 0): Variants => ({
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
});

// Hover Animations
export const hoverLift: Variants = {
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1
    }
  }
};

export const hoverGlow: Variants = {
  hover: {
    boxShadow: '0 20px 40px rgba(137, 118, 234, 0.3)',
    scale: 1.02,
    transition: {
      duration: 0.3
    }
  }
};

// Micro-interactions
export const pulse: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export const bounce: Variants = {
  bounce: {
    y: [0, -10, 0],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export const wiggle: Variants = {
  wiggle: {
    rotate: [0, -3, 3, -3, 3, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut'
    }
  }
};

// Loading Animations
export const loadingDots: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      repeat: Infinity,
      repeatType: 'reverse' as const
    }
  }
};

export const loadingDot: Variants = {
  hidden: { y: 0, opacity: 0.3 },
  visible: {
    y: -10,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  }
};

// Page Transition Animations
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    y: 20
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    y: -20,
    transition: {
      duration: 0.4,
      ease: 'easeIn'
    }
  }
};

// Card Animations
export const cardHover: Variants = {
  hover: {
    y: -5,
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

// Button Animations
export const buttonHover: Variants = {
  hover: {
    scale: 1.05,
    boxShadow: '0 10px 25px rgba(137, 118, 234, 0.3)',
    transition: {
      duration: 0.2
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1
    }
  }
};

// Text Animations
export const textReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: 'blur(10px)'
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const textGradient: Variants = {
  hidden: {
    backgroundPosition: '0% 50%'
  },
  visible: {
    backgroundPosition: '100% 50%',
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: 'reverse' as const,
      ease: 'linear'
    }
  }
};

// Icon Animations
export const iconBounce: Variants = {
  bounce: {
    scale: [1, 1.2, 1],
    rotate: [0, 10, -10, 0],
    transition: {
      duration: 0.6,
      ease: 'easeInOut'
    }
  }
};

export const iconSpin: Variants = {
  spin: {
    rotate: 360,
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

// Progress Bar Animations
export const progressBar: Variants = {
  hidden: { width: 0 },
  visible: (width: number) => ({
    width: `${width}%`,
    transition: {
      duration: 1.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  })
};

// Notification Animations
export const notificationSlideIn: Variants = {
  hidden: {
    x: '100%',
    opacity: 0
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};

// Modal Animations
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

export const modalContent: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.2
    }
  }
};

// Utility Functions
export const createDelayedAnimation = (delay: number): Variants => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
});

export const createStaggeredAnimation = (index: number, baseDelay: number = 0.1): Variants => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: baseDelay * index,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
});

// Animation Presets
export const animationPresets = {
  // Page animations
  pageEnter: pageTransition,

  // Card animations
  cardHover,
  hoverLift,
  hoverGlow,

  // Button animations
  buttonHover,

  // Loading animations
  loadingDots,
  loadingDot,

  // Text animations
  textReveal,
  textGradient,

  // Icon animations
  iconBounce,
  iconSpin,

  // Micro-interactions
  pulse,
  bounce,
  wiggle,

  // Progress animations
  progressBar,

  // Modal animations
  modalBackdrop,
  modalContent,
  notificationSlideIn,

  // Basic animations
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  slideInFromBottom
};
