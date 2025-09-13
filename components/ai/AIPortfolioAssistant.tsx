'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  provider?: string;
}

interface AIPortfolioAssistantProps {
  username?: string;
}

export default function AIPortfolioAssistant({ username }: AIPortfolioAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `👋 Hi! I'm your AI Portfolio Assistant for MyDevFolioXD! I can help you with:

🎨 **Portfolio Features**: Learn about themes, components, and customization
📊 **Analytics**: Understand your GitHub stats and insights
🚀 **Projects**: Get advice on showcasing your work
💡 **Career Tips**: AI-powered career guidance
🎯 **Best Practices**: Improve your developer portfolio

What would you like to know about your portfolio or development journey?`,
      role: 'assistant',
      timestamp: new Date(),
      provider: 'system'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = username ? `User's GitHub username: ${username}` : '';

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
        provider: data.provider
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '❌ Sorry, I\'m having trouble connecting right now. Please try again later.',
        role: 'assistant',
        timestamp: new Date(),
        provider: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      content: `👋 Hi! I'm your AI Portfolio Assistant for MyDevFolioXD! I can help you with:

🎨 **Portfolio Features**: Learn about themes, components, and customization
📊 **Analytics**: Understand your GitHub stats and insights
🚀 **Projects**: Get advice on showcasing your work
💡 **Career Tips**: AI-powered career guidance
🎯 **Best Practices**: Improve your developer portfolio

What would you like to know about your portfolio or development journey?`,
      role: 'assistant',
      timestamp: new Date(),
      provider: 'system'
    }]);
  };

  const getProviderIcon = (provider?: string) => {
    switch (provider) {
      case 'openai':
        return '🤖';
      case 'openrouter':
        return '🧠';
      case 'gemini':
        return '✨';
      case 'system':
        return '👋';
      case 'error':
        return '❌';
      default:
        return '💬';
    }
  };

  const getProviderName = (provider?: string) => {
    switch (provider) {
      case 'openai':
        return 'ChatGPT';
      case 'openrouter':
        return 'OpenRouter';
      case 'gemini':
        return 'Gemini';
      default:
        return 'AI Assistant';
    }
  };

  return (
    <motion.div
      className="fixed bottom-4 right-4 z-50"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg shadow-2xl w-96 h-[500px] flex flex-col"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🤖</span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">AI Portfolio Assistant</h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Powered by {messages[messages.length - 1]?.provider ? getProviderName(messages[messages.length - 1].provider) : 'AI'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearChat}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1"
                  title="Clear chat"
                >
                  🗑️
                </button>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1"
                  title="Minimize"
                >
                  ➖
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-[var(--background)] border border-[var(--card-border)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{getProviderIcon(message.provider)}</span>
                        <span className="text-xs opacity-70">
                          {message.role === 'assistant' && message.provider !== 'system'
                            ? getProviderName(message.provider)
                            : message.role === 'user' ? 'You' : 'Assistant'
                          }
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-50 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-[var(--background)] border border-[var(--card-border)] p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-[var(--text-secondary)]">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[var(--card-border)]">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your portfolio..."
                  className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {isLoading ? '⏳' : '📤'}
                </button>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-2">
                Press Enter to send • Supports OpenAI, Gemini & OpenRouter
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized Button */}
      {isMinimized && (
        <motion.button
          onClick={() => setIsMinimized(false)}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white text-xl transition-all duration-200 hover:scale-110"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="animate-pulse">🤖</span>
        </motion.button>
      )}
    </motion.div>
  );
}