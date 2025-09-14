'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'quick_reply' | 'code' | 'link';
}

interface QuickReply {
  text: string;
  action: string;
}

const BOT_RESPONSES = {
  greeting: [
    "👋 Hi there! I'm your portfolio assistant. How can I help you today?",
    "🚀 Welcome to MyDevFolioXD! I'm here to help you make the most of your portfolio.",
    "💻 Hello! Ready to explore your developer portfolio? I can help with anything!"
  ],

  about_portfolio: [
    "MyDevFolioXD is a stunning developer portfolio that showcases your GitHub projects beautifully. It includes interactive features like live coding animations, analytics dashboards, and much more!",
    "Your portfolio features 25+ amazing components including project showcases, skill visualizations, achievement badges, and interactive resume builder!"
  ],

  features: [
    "🎨 **Theme Customization**: Choose from 6 beautiful color themes",
    "📊 **Analytics Dashboard**: Track visitor insights and GitHub stats",
    "💼 **Interactive Resume Builder**: Create professional resumes with drag-and-drop",
    "⚡ **Live Coding Animation**: Showcase your coding skills in real-time",
    "🏆 **Achievement Badges**: Gamified system for your accomplishments",
    "🔍 **Project Search & Filter**: Find projects by language, stars, or keywords",
    "📱 **Responsive Design**: Looks perfect on all devices",
    "🎯 **SEO Optimized**: Better visibility on search engines"
  ],

  help: [
    "I can help you with:",
    "• Understanding portfolio features",
    "• Customizing your theme",
    "• Adding new projects",
    "• Optimizing your profile",
    "• Troubleshooting issues",
    "• Getting started tips"
  ],

  customization: [
    "🎨 **Theme Options**: Click the theme customizer to choose from 6 beautiful themes",
    "📝 **Edit Sections**: Use the interactive resume builder to customize your experience",
    "🔧 **Settings**: Access theme and layout options in the customization panel",
    "🎯 **Personalization**: Add your own branding, colors, and content"
  ],

  contact: [
    "📧 **Email**: Feel free to reach out for collaborations or questions",
    "💼 **LinkedIn**: Connect with me professionally",
    "🐦 **Twitter**: Follow for updates and tech discussions",
    "💻 **GitHub**: Check out my latest projects and contributions"
  ],

  projects: [
    "📂 **Project Showcase**: Your GitHub repositories are automatically displayed",
    "🔍 **Smart Filtering**: Filter by programming language, stars, or search terms",
    "📊 **Statistics**: View detailed stats for each project",
    "🎯 **Featured Projects**: Pin your best work to the top",
    "📱 **Live Demos**: Add demo links for interactive projects"
  ],

  analytics: [
    "📊 **Visitor Tracking**: Monitor who visits your portfolio",
    "📈 **GitHub Stats**: Track repository performance and contributions",
    "🎯 **Popular Content**: See which sections get the most attention",
    "📱 **Device Analytics**: Understand your audience's devices and browsers"
  ]
};

const QUICK_REPLIES = [
  { text: "🎨 Tell me about themes", action: "themes" },
  { text: "📊 Show analytics", action: "analytics" },
  { text: "💼 Resume builder", action: "resume" },
  { text: "🔧 Customization", action: "customization" },
  { text: "📂 My projects", action: "projects" },
  { text: "❓ Help", action: "help" }
];

// API Service Functions
const callOpenRouterAPI = async (message: string, context: string): Promise<string> => {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key not found');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'MyDevFolioXD Portfolio Assistant'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3-haiku',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant for MyDevFolioXD, a developer portfolio website. Help users understand the portfolio features, provide guidance on customization, and answer questions about the developer's work. Context: ${context}`
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
};

const callGeminiAPI = async (message: string, context: string): Promise<string> => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not found');
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are an AI assistant for MyDevFolioXD, a developer portfolio website. Help users understand the portfolio features, provide guidance on customization, and answer questions about the developer's work. Context: ${context}

User message: ${message}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || 'Sorry, I couldn\'t generate a response.';
};

const callChatAPIWithFallback = async (message: string, context: string, setCurrentAPI?: (api: 'openrouter' | 'gemini' | 'fallback') => void): Promise<string> => {
  // Try OpenRouter first
  try {
    
    setCurrentAPI?.('openrouter');
    return await callOpenRouterAPI(message, context);
  } catch (error) {
    

    // Fallback to Gemini
    try {
      
      setCurrentAPI?.('gemini');
      return await callGeminiAPI(message, context);
    } catch (geminiError) {
      

      // Final fallback to basic responses
      setCurrentAPI?.('fallback');
      return getFallbackResponse(message);
    }
  }
};

const getFallbackResponse = (message: string): string => {
  const input = message.toLowerCase();

  if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
    return "👋 Hello! I'm your portfolio assistant. How can I help you today?";
  }

  if (input.includes('thank') || input.includes('thanks')) {
    return "🙏 You're welcome! I'm here whenever you need help with your portfolio.";
  }

  if (input.includes('theme') || input.includes('customization')) {
    return "🎨 You can customize your portfolio theme by clicking the theme customizer button. Choose from 6 beautiful color schemes!";
  }

  if (input.includes('project') || input.includes('work')) {
    return "📂 Check out the Featured Projects section to see detailed information about the developer's work, technologies used, and live demos.";
  }

  if (input.includes('contact') || input.includes('hire')) {
    return "📧 You can find contact information in the profile section. The developer is always open to interesting collaboration opportunities!";
  }

  return "🤔 I'm having trouble connecting to my AI services right now. Try asking about themes, projects, or general help!";
};

export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [chatSize, setChatSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [currentDimensions, setCurrentDimensions] = useState({ width: 450, height: 550 });
  const [currentAPI, setCurrentAPI] = useState<'openrouter' | 'gemini' | 'fallback'>('openrouter');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Send initial greeting
      setTimeout(() => {
        addBotMessage(BOT_RESPONSES.greeting[Math.floor(Math.random() * BOT_RESPONSES.greeting.length)]);
      }, 500);
    }
  }, [isOpen]);

  const addBotMessage = (text: string, type: 'text' | 'quick_reply' | 'code' | 'link' = 'text') => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      sender: 'bot',
      timestamp: new Date(),
      type
    };
    setMessages(prev => [...prev, message]);
  };

  const addUserMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    addUserMessage(userMessage);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Call AI API with fallback (OpenRouter -> Gemini -> Basic responses)
      const aiResponse = await callChatAPIWithFallback(
        userMessage,
        'User is interacting with MyDevFolioXD portfolio assistant',
        setCurrentAPI
      );

      // Simulate realistic typing delay
      setTimeout(() => {
        setIsTyping(false);
        addBotMessage(aiResponse);
      }, 1000 + Math.random() * 1000);

    } catch (error) {
      
      setIsTyping(false);

      // Final fallback if all APIs fail
      setTimeout(() => {
        addBotMessage("🤔 I'm having trouble connecting to my AI services right now. Try asking about themes, projects, or general help!");
      }, 500);
    }
  };

  const handleQuickReply = async (action: string) => {
    const quickReplyText = QUICK_REPLIES.find(q => q.action === action)?.text || action;
    addUserMessage(quickReplyText);
    setIsTyping(true);

    try {
      // Create contextual message based on quick reply
      let contextualMessage = quickReplyText;
      switch (action) {
        case 'themes':
          contextualMessage = "Tell me about the theme customization options in MyDevFolioXD";
          break;
        case 'analytics':
          contextualMessage = "What analytics features are available in the portfolio?";
          break;
        case 'resume':
          contextualMessage = "How does the interactive resume builder work?";
          break;
        case 'customization':
          contextualMessage = "What customization options are available?";
          break;
        case 'projects':
          contextualMessage = "How does the project showcase work?";
          break;
        case 'help':
          contextualMessage = "What can you help me with regarding my portfolio?";
          break;
      }

      // Call AI API with fallback using contextual message
      const aiResponse = await callChatAPIWithFallback(
        contextualMessage,
        `User clicked quick reply: ${action}`,
        setCurrentAPI
      );

      setTimeout(() => {
        setIsTyping(false);
        addBotMessage(aiResponse);
      }, 800 + Math.random() * 500);

    } catch (error) {
      
      setIsTyping(false);

      // Use the fallback response system
      setTimeout(() => {
        const fallbackResponse = getFallbackResponse(quickReplyText);
        addBotMessage(fallbackResponse);
      }, 500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (!isFullScreen) {
      setChatSize('large');
    } else {
      // When exiting full screen, restore to current dimensions
      setChatSize('medium');
    }
  };

  const changeChatSize = (size: 'small' | 'medium' | 'large') => {
    setChatSize(size);
    setIsFullScreen(false);

    // Reset to default dimensions for preset sizes
    switch (size) {
      case 'small':
        setCurrentDimensions({ width: 320, height: 400 });
        break;
      case 'large':
        setCurrentDimensions({ width: 600, height: 700 });
        break;
      default: // medium
        setCurrentDimensions({ width: 450, height: 550 });
        break;
    }
  };


  const getChatDimensions = () => {
    if (isFullScreen) {
      return {
        width: 'calc(100vw - 1rem)',
        height: 'calc(100vh - 1rem)',
        maxWidth: 'none',
        maxHeight: 'none'
      };
    }

    // Use current dimensions for manual resize, otherwise use preset sizes
    if (currentDimensions.width !== 450 || currentDimensions.height !== 550) {
      return {
        width: `${Math.max(280, Math.min(800, currentDimensions.width))}px`,
        height: `${Math.max(350, Math.min(800, currentDimensions.height))}px`,
        maxWidth: '95vw',
        maxHeight: '90vh'
      };
    }

    switch (chatSize) {
      case 'small':
        return {
          width: '300px',
          height: '380px',
          maxWidth: '85vw',
          maxHeight: '55vh',
          minWidth: '260px',
          minHeight: '320px'
        };
      case 'large':
        return {
          width: '550px',
          height: '650px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          minWidth: '300px',
          minHeight: '380px'
        };
      default: // medium
        return {
          width: '400px',
          height: '500px',
          maxWidth: '85vw',
          maxHeight: '70vh',
          minWidth: '300px',
          minHeight: '380px'
        };
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isFullScreen) return;

    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY });

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();

      if (!isResizing) return;

      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      setCurrentDimensions(prev => ({
        width: Math.max(280, Math.min(800, prev.width + deltaX)),
        height: Math.max(350, Math.min(800, prev.height + deltaY))
      }));

      setResizeStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'se-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isFullScreen) return;

    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    const touch = e.touches[0];
    setResizeStart({ x: touch.clientX, y: touch.clientY });

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();

      if (!isResizing || e.touches.length === 0) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - resizeStart.x;
      const deltaY = touch.clientY - resizeStart.y;

      setCurrentDimensions(prev => ({
        width: Math.max(280, Math.min(800, prev.width + deltaX)),
        height: Math.max(350, Math.min(800, prev.height + deltaY))
      }));

      setResizeStart({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      setIsResizing(false);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'se-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
  };

  const getCursorStyle = () => {
    return { cursor: 'pointer' };
  };

  return (
    <>
      {/* Chat Widget Button */}
      <motion.div
        className='fixed bottom-3 right-3 sm:bottom-4 sm:right-4 md:bottom-5 md:right-5 lg:bottom-5 lg:right-5 z-50'
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={{
          position: 'fixed',
          zIndex: 50,
          pointerEvents: 'auto',
          boxSizing: 'border-box',
          contain: 'layout style paint'
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className='bg-[#8976EA] hover:bg-[#7D6BD0] text-white w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110'
        >
          {isOpen ? (
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          ) : (
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' />
            </svg>
          )}
        </button>

        {/* Notification Badge */}
        {messages.length === 0 && (
          <motion.div
            className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center'
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 2, type: 'spring' }}
          >
            <span className='text-[10px] sm:text-xs'>1</span>
          </motion.div>
        )}
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatRef}
            className={`fixed z-50 flex flex-col bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-2xl ${
              isFullScreen
                ? 'top-2 right-2 bottom-2 left-2 md:top-4 md:right-4 md:bottom-4 md:left-4'
                : 'bottom-16 right-2 left-2 sm:left-auto sm:bottom-20 sm:right-3 md:bottom-20 md:right-4 lg:bottom-20 lg:right-4'
            }`}
            style={{
              flexDirection: 'column',
              position: 'fixed',
              zIndex: 50,
              boxSizing: 'border-box',
              overflow: 'hidden',
              contain: 'layout style paint',
              ...getChatDimensions(),
              ...getCursorStyle()
            }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Resize Handles */}
            {!isFullScreen && (
              <>
                {/* Corner handles */}
                <div
                  className="absolute -top-3 -left-3 w-6 h-6 bg-[#8976EA] rounded-full cursor-nw-resize hover:bg-[#7D6BD0] transition-colors shadow-lg"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleMouseDown(e);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleTouchStart(e);
                  }}
                  title="Resize (North-West)"
                  style={{ zIndex: 60 }}
                />
                <div
                  className="absolute -top-3 -right-3 w-6 h-6 bg-[#8976EA] rounded-full cursor-ne-resize hover:bg-[#7D6BD0] transition-colors shadow-lg"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleMouseDown(e);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleTouchStart(e);
                  }}
                  title="Resize (North-East)"
                  style={{ zIndex: 60 }}
                />
                <div
                  className="absolute -bottom-3 -left-3 w-6 h-6 bg-[#8976EA] rounded-full cursor-sw-resize hover:bg-[#7D6BD0] transition-colors shadow-lg"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleMouseDown(e);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleTouchStart(e);
                  }}
                  title="Resize (South-West)"
                  style={{ zIndex: 60 }}
                />
                <div
                  className="absolute -bottom-3 -right-3 w-6 h-6 bg-[#8976EA] rounded-full cursor-se-resize hover:bg-[#7D6BD0] transition-colors shadow-lg"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleMouseDown(e);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleTouchStart(e);
                  }}
                  title="Resize (South-East)"
                  style={{ zIndex: 60 }}
                />

                {/* Side handles */}
                <div
                  className="absolute top-1/2 -left-3 transform -translate-y-1/2 w-3 h-12 bg-[#8976EA] rounded-l cursor-w-resize hover:bg-[#7D6BD0] transition-colors shadow-lg"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleMouseDown(e);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleTouchStart(e);
                  }}
                  title="Resize Width (West)"
                  style={{ zIndex: 60 }}
                />
                <div
                  className="absolute top-1/2 -right-3 transform -translate-y-1/2 w-3 h-12 bg-[#8976EA] rounded-r cursor-e-resize hover:bg-[#7D6BD0] transition-colors shadow-lg"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleMouseDown(e);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleTouchStart(e);
                  }}
                  title="Resize Width (East)"
                  style={{ zIndex: 60 }}
                />
                <div
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-12 h-3 bg-[#8976EA] rounded-t cursor-n-resize hover:bg-[#7D6BD0] transition-colors shadow-lg"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleMouseDown(e);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleTouchStart(e);
                  }}
                  title="Resize Height (North)"
                  style={{ zIndex: 60 }}
                />
                <div
                  className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-12 h-3 bg-[#8976EA] rounded-b cursor-s-resize hover:bg-[#7D6BD0] transition-colors shadow-lg"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleMouseDown(e);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleTouchStart(e);
                  }}
                  title="Resize Height (South)"
                  style={{ zIndex: 60 }}
                />
              </>
            )}

            {/* Header */}
            <div className='bg-[#8976EA] text-white p-2 md:p-3 rounded-t-lg flex items-center justify-between'>
              <div className='flex items-center gap-2 md:gap-3'>
                <div className='w-6 h-6 md:w-8 md:h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center'>
                  <svg className='w-3 h-3 md:w-4 md:h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' />
                  </svg>
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <h3 className='font-semibold text-sm md:text-base'>AI Portfolio Assistant</h3>
                    <div className={`w-2 h-2 rounded-full ${
                      currentAPI === 'openrouter' ? 'bg-green-400' :
                      currentAPI === 'gemini' ? 'bg-blue-400' :
                      'bg-yellow-400'
                    }`} title={`Using ${currentAPI === 'openrouter' ? 'OpenRouter' : currentAPI === 'gemini' ? 'Gemini' : 'Fallback'} API`} />
                  </div>
                  <p className='text-xs opacity-90 hidden sm:block'>
                    Online • {currentAPI === 'openrouter' ? 'OpenRouter' : currentAPI === 'gemini' ? 'Gemini' : 'Fallback'} API
                  </p>
                </div>
              </div>

              {/* Control Buttons */}
              <div className='flex items-center gap-1 md:gap-2'>
                {/* Full Screen Toggle */}
                <button
                  onClick={toggleFullScreen}
                  className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-xs transition-colors ${
                    isFullScreen ? 'bg-white bg-opacity-30' : 'hover:bg-white hover:bg-opacity-20'
                  }`}
                  title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                >
                  {isFullScreen ? '🗗' : '🗖'}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className='w-6 h-6 md:w-7 md:h-7 text-white hover:bg-white hover:bg-opacity-20 rounded-full flex items-center justify-center transition-colors'
                  title='Close Chat'
                >
                  <svg className='w-3 h-3 md:w-4 md:h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className='flex-1 overflow-y-auto p-2 md:p-3 space-y-2 md:space-y-3 max-h-[calc(100%-120px)]'>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={`max-w-[85%] p-2 md:p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-[#8976EA] text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-[var(--text-primary)]'
                    }`}
                  >
                    <p className='text-sm whitespace-pre-wrap'>{message.text}</p>
                    <span className='text-xs opacity-70 mt-1 block'>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  className='flex justify-start'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className='bg-gray-100 dark:bg-gray-700 p-2 rounded-lg'>
                    <div className='flex space-x-1'>
                      <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
                      <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{ animationDelay: '0.1s' }}></div>
                      <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length === 1 && !isTyping && (
              <div className='px-2 md:px-3 pb-1'>
                <div className='flex flex-wrap gap-1.5 md:gap-2'>
                  {QUICK_REPLIES.map((reply, index) => (
                    <motion.button
                      key={reply.action}
                      onClick={() => handleQuickReply(reply.action)}
                      className='bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-xs md:text-sm px-2 md:px-3 py-1 rounded-full transition-colors'
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {reply.text}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className='p-2 md:p-3 border-t border-[var(--card-border)]'>
              <div className='flex gap-2'>
                <input
                  ref={inputRef}
                  type='text'
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder='Type your message...'
                  className='flex-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full px-2 md:px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8976EA]'
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className='bg-[#8976EA] hover:bg-[#7D6BD0] text-white w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-50'
                >
                  <svg className='w-3 h-3 md:w-4 md:h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8' />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
