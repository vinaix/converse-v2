import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue } from 'framer-motion';

// SVG Icon Components
const SendIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
);

const UserIcon = ({ size = 32, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

const BotIcon = ({ size = 32, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
  </svg>
);

const ImageIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
  </svg>
);

const LoadingIcon = ({ size = 20, className = "" }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    className={className}
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  >
    <path d="M21 12a9 9 0 11-6.219-8.56"/>
  </motion.svg>
);

const SearchIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const CommandIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3z"/>
  </svg>
);

const ZenIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 12h8"/>
  </svg>
);

const SparkleIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0l3.09 6.26L22 9.27l-6.91 3.01L12 24l-3.09-11.72L2 9.27l6.91-3.01L12 0z"/>
  </svg>
);

// Custom Hooks
const useScrollAnimations = (scrollRef) => {
  const { scrollY } = useScroll({ container: scrollRef });
  const scrollVelocity = useMotionValue(0);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const updateVelocity = () => {
      const currentY = scrollY.get();
      const velocity = Math.abs(currentY - lastScrollY.current);
      scrollVelocity.set(velocity);
      lastScrollY.current = currentY;
    };

    const unsubscribe = scrollY.onChange(updateVelocity);
    return unsubscribe;
  }, [scrollY, scrollVelocity]);

  return { scrollY, scrollVelocity };
};

const useImageGeneration = () => {
  const imageKeywords = useMemo(() => [
    'generate image', 'create image', 'show me', 'draw', 'visualize', 
    'picture of', 'image of', 'make an image', 'create picture'
  ], []);

  const detectImageRequest = useCallback((message) => {
    return imageKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }, [imageKeywords]);

  const extractImagePrompt = useCallback((message) => {
    const lowerMessage = message.toLowerCase();
    for (const keyword of imageKeywords) {
      const index = lowerMessage.indexOf(keyword.toLowerCase());
      if (index !== -1) {
        const prompt = message.substring(index + keyword.length).trim();
        return prompt || message;
      }
    }
    return message;
  }, [imageKeywords]);

  const generateImageUrl = useCallback((prompt) => {
    const encodedPrompt = encodeURIComponent(prompt);
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&model=flux&nologo=true`;
  }, []);

  return { detectImageRequest, extractImagePrompt, generateImageUrl };
};

const useFocusManagement = (inputRef) => {
  const [draft, setDraft] = useState('');

  // Auto-focus on mount and restore draft
  useEffect(() => {
    const savedDraft = localStorage.getItem('chat-draft');
    if (savedDraft) {
      setDraft(savedDraft);
    }
    
    // Focus input after a brief delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [inputRef]);

  // Save draft on change
  const saveDraft = useCallback((value) => {
    setDraft(value);
    localStorage.setItem('chat-draft', value);
  }, []);

  // Clear draft
  const clearDraft = useCallback(() => {
    setDraft('');
    localStorage.removeItem('chat-draft');
  }, []);

  // Global keydown handler to refocus input
  useEffect(() => {
    const handleGlobalKeydown = (e) => {
      // Don't interfere with special keys or when modals are open
      if (e.ctrlKey || e.metaKey || e.altKey || document.querySelector('[role="dialog"]')) {
        return;
      }

      // If typing regular characters and input isn't focused, focus it
      if (e.key.length === 1 && inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeydown);
    return () => document.removeEventListener('keydown', handleGlobalKeydown);
  }, [inputRef]);

  return { draft, saveDraft, clearDraft };
};

const useHotkeys = (handlers) => {
  useEffect(() => {
    const handleKeydown = (e) => {
      const key = e.key.toLowerCase();
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      
      if (isCtrlOrCmd && key === 'k') {
        e.preventDefault();
        handlers.openCommandPalette?.();
      } else if (isCtrlOrCmd && key === 'f') {
        e.preventDefault();
        handlers.openSearch?.();
      } else if (key === 'escape') {
        handlers.closeModals?.();
      } else if (key === 'arrowup' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        handlers.editLastMessage?.();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [handlers]);
};

// Confetti Component
const Confetti = ({ show, onComplete }) => {
  const particles = useMemo(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -10,
      rotation: Math.random() * 360,
      color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][Math.floor(Math.random() * 5)]
    })), []
  );

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: particle.color }}
          initial={{ 
            x: particle.x, 
            y: particle.y, 
            rotate: particle.rotation,
            opacity: 1 
          }}
          animate={{ 
            y: window.innerHeight + 100,
            rotate: particle.rotation + 720,
            opacity: 0
          }}
          transition={{ 
            duration: 3,
            ease: "easeOut"
          }}
          onAnimationComplete={() => {
            if (particle.id === 0) onComplete?.();
          }}
        />
      ))}
    </div>
  );
};

// Typing Indicator Component
const TypingIndicator = ({ show }) => {
  if (!show) return null;

  return (
    <motion.div
      className="flex items-center space-x-2 px-4 py-2 mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex items-center space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
      <span className="text-sm text-gray-400">AI is thinking...</span>
    </motion.div>
  );
};

// Command Palette Component
const CommandPalette = ({ show, onClose, onCommand }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const commands = useMemo(() => [
    { id: 'clear', label: 'Clear Chat', icon: '🗑️', action: () => onCommand('clear') },
    { id: 'zen', label: 'Zen Mode', icon: '🧘', action: () => onCommand('zen') },
    { id: 'help', label: 'Show Help', icon: '❓', action: () => onCommand('help') },
    { id: 'invert', label: 'Invert Theme', icon: '🔄', action: () => onCommand('invert') },
  ], [onCommand]);

  const filteredCommands = useMemo(() => 
    commands.filter(cmd => 
      cmd.label.toLowerCase().includes(query.toLowerCase())
    ), [commands, query]
  );

  useEffect(() => {
    if (show && inputRef.current) {
      inputRef.current.focus();
    }
  }, [show]);

  if (!show) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-center pt-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md mx-4"
        style={{
          background: 'rgba(15, 15, 15, 0.9)',
          backdropFilter: 'blur(25px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 16px 64px rgba(0, 0, 0, 0.6)',
        }}
        initial={{ scale: 0.9, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: -20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-700">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white placeholder-gray-400 outline-none text-lg"
          />
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filteredCommands.map((command) => (
            <motion.button
              key={command.id}
              className="w-full px-4 py-3 text-left flex items-center space-x-3 hover:bg-gray-800 transition-colors"
              onClick={command.action}
              whileHover={{ x: 4 }}
            >
              <span className="text-xl">{command.icon}</span>
              <span className="text-white">{command.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Message Component with Enhanced Animations
const MessageBubble = React.memo(({ message, index, scrollY, scrollVelocity, containerHeight, isFirstMessage }) => {
  const ref = useRef(null);
  const isUser = message.sender === 'user';
  
  const y = useTransform(scrollY, [0, 1000], [0, -50]);
  const scale = useTransform(scrollY, 
    latest => {
      if (!ref.current) return 1;
      const rect = ref.current.getBoundingClientRect();
      const center = containerHeight / 2;
      const distance = Math.abs(rect.top + rect.height / 2 - center);
      return Math.max(0.98, 1 - distance / (containerHeight * 2));
    }
  );
  
  const opacity = useTransform(scrollY,
    latest => {
      if (!ref.current) return 1;
      const rect = ref.current.getBoundingClientRect();
      const fadeZone = containerHeight * 0.1;
      if (rect.top < fadeZone) return Math.max(0.3, rect.top / fadeZone);
      if (rect.bottom > containerHeight - fadeZone) {
        return Math.max(0.3, (containerHeight - rect.top) / fadeZone);
      }
      return 1;
    }
  );

  const blur = useTransform(scrollVelocity, [0, 500], [0, 2]);

  return (
    <motion.div
      ref={ref}
      style={{ y, scale, opacity }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <motion.div
        style={{ filter: useTransform(blur, v => `blur(${v}px)`) }}
        className={`flex max-w-xs lg:max-w-md ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      >
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          <motion.div
            className="w-10 h-10 rounded-full flex items-center justify-center relative"
            style={{
              background: isUser 
                ? 'rgba(59, 130, 246, 0.3)' 
                : 'rgba(16, 185, 129, 0.3)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {isUser ? 
              <UserIcon size={20} className="text-blue-300" /> : 
              <BotIcon size={20} className="text-green-300" />
            }
            {isFirstMessage && !isUser && (
              <motion.div
                className="absolute -top-1 -right-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
              >
                <SparkleIcon size={12} className="text-yellow-400" />
              </motion.div>
            )}
          </motion.div>
        </div>
        
        <div className="flex flex-col">
          <motion.div
            className={`px-4 py-3 rounded-2xl ${
              isUser ? 'rounded-tr-md' : 'rounded-tl-md'
            }`}
            style={{
              background: isUser 
                ? 'rgba(59, 130, 246, 0.2)' 
                : 'rgba(15, 15, 15, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
            whileHover={{ 
              background: isUser 
                ? 'rgba(59, 130, 246, 0.3)' 
                : 'rgba(25, 25, 25, 0.8)',
            }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-white text-sm leading-relaxed font-medium" style={{ letterSpacing: '0.2px' }}>
              {message.text}
            </p>
            
            {message.image && (
              <motion.div 
                className="mt-3 rounded-lg overflow-hidden"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <motion.img
                  src={message.image}
                  alt="Generated content"
                  className="w-full h-auto max-w-sm rounded-lg cursor-pointer"
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </motion.div>
            )}
            
            {message.status === 'sending' && (
              <div className="flex items-center mt-2">
                <LoadingIcon size={16} className="text-blue-400 mr-2" />
                <span className="text-xs text-gray-400">Sending...</span>
              </div>
            )}
            
            {message.status === 'error' && (
              <span className="text-xs text-red-400 mt-2 block">Failed to send</span>
            )}
          </motion.div>
          
          <span className="text-xs text-gray-500 mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
});

// Main Chat Application
function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Welcome to Converse  ✨ I'm your AI assistant with image generation powers. Try asking me to 'generate image of a sunset' or just chat naturally. Type /help for commands!",
      sender: 'bot',
      timestamp: Date.now(),
      status: 'sent'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [invertedTheme, setInvertedTheme] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasGeneratedFirstImage, setHasGeneratedFirstImage] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const inputRef = useRef(null);
  const { scrollY, scrollVelocity } = useScrollAnimations(scrollContainerRef);
  const { detectImageRequest, extractImagePrompt, generateImageUrl } = useImageGeneration();
  const { draft, saveDraft, clearDraft } = useFocusManagement(inputRef);
  
  const [containerHeight, setContainerHeight] = useState(window.innerHeight);

  // Initialize input value from draft
  useEffect(() => {
    setInputValue(draft);
  }, [draft]);

  useEffect(() => {
    const handleResize = () => setContainerHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Hotkey handlers
  const hotkeyHandlers = useMemo(() => ({
    openCommandPalette: () => setShowCommandPalette(true),
    openSearch: () => {
      // Implement search functionality
      console.log('Search opened');
    },
    closeModals: () => {
      setShowCommandPalette(false);
    },
    editLastMessage: () => {
      // Implement edit last message
      console.log('Edit last message');
    }
  }), []);

  useHotkeys(hotkeyHandlers);

  const handleCommand = useCallback((command) => {
    setShowCommandPalette(false);
    
    switch (command) {
      case 'clear':
        if (window.confirm('Clear all messages?')) {
          setMessages([messages[0]]); // Keep welcome message
          setMessageCount(0);
        }
        break;
      case 'zen':
        setZenMode(!zenMode);
        break;
      case 'help':
        const helpMessage = {
          id: Date.now(),
          text: "🚀 Quick Commands:\n• /clear - Clear chat\n• /zen - Toggle zen mode\n• /invert - Invert theme\n• Ctrl/Cmd+K - Command palette\n• Just type to generate images: 'show me a cat', 'draw a sunset'",
          sender: 'bot',
          timestamp: Date.now(),
          status: 'sent'
        };
        setMessages(prev => [...prev, helpMessage]);
        break;
      case 'invert':
        setInvertedTheme(!invertedTheme);
        break;
    }
  }, [zenMode, invertedTheme, messages]);

  const processSlashCommand = useCallback((text) => {
    const command = text.toLowerCase().trim();
    
    switch (command) {
      case '/clear':
        handleCommand('clear');
        return true;
      case '/zen':
        handleCommand('zen');
        return true;
      case '/help':
        handleCommand('help');
        return true;
      case '/invert':
        handleCommand('invert');
        return true;
      default:
        return false;
    }
  }, [handleCommand]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    // Handle slash commands
    if (text.startsWith('/')) {
      if (processSlashCommand(text)) {
        setInputValue('');
        clearDraft();
        return;
      }
    }

    const userMessage = {
      id: Date.now(),
      text: text.trim(),
      sender: 'user',
      timestamp: Date.now(),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    clearDraft();
    setIsLoading(true);
    setIsTyping(true);
    setMessageCount(prev => prev + 1);

    // Show confetti on first message
    if (messageCount === 0) {
      setTimeout(() => setShowConfetti(true), 500);
    }

    try {
      // Check if image generation is requested
      const isImageRequest = detectImageRequest(text);
      let imageUrl = null;
      
      if (isImageRequest) {
        const imagePrompt = extractImagePrompt(text);
        imageUrl = generateImageUrl(imagePrompt);
        
        // Show confetti on first image generation
        if (!hasGeneratedFirstImage) {
          setHasGeneratedFirstImage(true);
          setTimeout(() => setShowConfetti(true), 1000);
        }
      }

      // Send to chat API
      const response = await fetch('https://converse-api-vb6x.onrender.com/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          conversation_id: conversationId,
          generate_image: isImageRequest
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      const botMessage = {
        id: Date.now() + 1,
        text: data.reply || data.response || 'I received your message! How can I help you further?',
        sender: 'bot',
        timestamp: Date.now(),
        status: 'sent',
        image: imageUrl || data.image || null
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: Date.now() + 2,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: Date.now(),
        status: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [conversationId, detectImageRequest, extractImagePrompt, generateImageUrl, processSlashCommand, clearDraft, messageCount, hasGeneratedFirstImage]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!isLoading && inputValue.trim()) {
      sendMessage(inputValue);
    }
  }, [inputValue, isLoading, sendMessage]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setInputValue(value);
    saveDraft(value);
  }, [saveDraft]);

  // Prevent input blur
  const handleInputBlur = useCallback((e) => {
    // Immediately refocus unless clicking on a button or interactive element
    setTimeout(() => {
      if (inputRef.current && !document.querySelector(':focus')) {
        inputRef.current.focus();
      }
    }, 10);
  }, []);

  const themeStyles = useMemo(() => {
    if (invertedTheme) {
      return {
        background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 50%, #ffffff 100%)',
        primaryGlass: 'rgba(240, 240, 240, 0.7)',
        secondaryGlass: 'rgba(230, 230, 230, 0.6)',
        textPrimary: '#000000',
        textSecondary: '#474747',
        borderGlass: 'rgba(0, 0, 0, 0.1)',
      };
    }
    return {
      background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)',
      primaryGlass: 'rgba(15, 15, 15, 0.7)',
      secondaryGlass: 'rgba(25, 25, 25, 0.6)',
      textPrimary: '#ffffff',
      textSecondary: '#b8b8b8',
      borderGlass: 'rgba(255, 255, 255, 0.1)',
    };
  }, [invertedTheme]);

  return (
    <div 
      className="fixed inset-0 overflow-hidden"
      style={{
        background: themeStyles.background,
        width: '100vw',
        height: '100vh',
      }}
    >
      <Confetti 
        show={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />

      <CommandPalette
        show={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onCommand={handleCommand}
      />

      {/* Glassmorphic Header */}
      {!zenMode && (
        <motion.header
          className="fixed top-0 left-0 right-0 z-40 px-4 py-4 flex items-center justify-between"
          style={{
            background: themeStyles.primaryGlass,
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${themeStyles.borderGlass}`,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
          }}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center relative"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(16, 185, 129, 0.3))',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${themeStyles.borderGlass}`,
              }}
            >
              <BotIcon size={24} className={invertedTheme ? "text-gray-800" : "text-white"} />
              {isTyping && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.5), rgba(16, 185, 129, 0.5))',
                  }}
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
            <div>
              <h1 className={`text-xl font-bold ${invertedTheme ? 'text-gray-800' : 'text-white'}`} style={{ fontWeight: 800, letterSpacing: '0.2px' }}>
                Converse - be Creative!
              </h1>
              <p className={`text-xs ${invertedTheme ? 'text-gray-600' : 'text-gray-400'}`}>
                Anology  AI Assistant  • {messageCount} messages
              </p>
            </div>
          </motion.div>

          <div className="flex items-center space-x-2">
            <motion.button
              onClick={() => setShowCommandPalette(true)}
              className={`p-2 rounded-lg ${invertedTheme ? 'text-gray-600 hover:text-gray-800' : 'text-gray-400 hover:text-white'} transition-colors`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <CommandIcon size={18} />
            </motion.button>
            {zenMode && (
              <motion.button
                onClick={() => setZenMode(false)}
                className={`p-2 rounded-lg ${invertedTheme ? 'text-gray-600 hover:text-gray-800' : 'text-gray-400 hover:text-white'} transition-colors`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ZenIcon size={18} />
              </motion.button>
            )}
          </div>
        </motion.header>
      )}

      {/* Chat Messages Area */}
      <motion.div
        ref={scrollContainerRef}
        className="absolute overflow-y-auto custom-scrollbar"
        style={{
          top: zenMode ? '0' : '80px',
          bottom: '100px',
          left: '0',
          right: '0',
          padding: '20px',
          paddingBottom: '40px',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="max-w-4xl mx-auto">
          <AnimatePresence>
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                index={index}
                scrollY={scrollY}
                scrollVelocity={scrollVelocity}
                containerHeight={containerHeight}
                isFirstMessage={index === 0}
              />
            ))}
          </AnimatePresence>
          
          <TypingIndicator show={isTyping} />
          
          <div ref={messagesEndRef} />
        </div>
      </motion.div>

      {/* Glassmorphic Input Area */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 p-4"
        style={{
          background: themeStyles.primaryGlass,
          backdropFilter: 'blur(25px)',
          borderTop: `1px solid ${themeStyles.borderGlass}`,
          boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.3)',
        }}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <motion.div 
              className="flex-1 relative"
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onBlur={handleInputBlur}
                placeholder="Type your message... (try 'generate image of a sunset' or /help for commands)"
                className={`w-full px-4 py-3 pr-12 rounded-2xl placeholder-gray-400 resize-none text-sm leading-relaxed font-medium`}
                style={{
                  background: themeStyles.secondaryGlass,
                  backdropFilter: 'blur(15px)',
                  border: `1px solid ${themeStyles.borderGlass}`,
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
                  minHeight: '52px',
                  maxHeight: '120px',
                  color: themeStyles.textPrimary,
                  letterSpacing: '0.2px',
                }}
                rows={1}
                disabled={isLoading}
                autoFocus
              />
              {detectImageRequest(inputValue) && (
                <motion.div
                  className="absolute right-3 top-3"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <ImageIcon size={16} className="text-purple-400" />
                </motion.div>
              )}
            </motion.div>
            
            <motion.button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 ${invertedTheme ? 'text-gray-800' : 'text-white'}`}
              style={{
                background: (!isLoading && inputValue.trim()) 
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(16, 185, 129, 0.8))'
                  : 'rgba(55, 55, 55, 0.6)',
                backdropFilter: 'blur(15px)',
                border: `1px solid ${themeStyles.borderGlass}`,
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
              }}
              whileHover={!isLoading && inputValue.trim() ? { 
                scale: 1.1,
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
              } : {}}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {isLoading ? (
                <LoadingIcon size={20} className="text-blue-400" />
              ) : (
                <SendIcon size={20} />
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${invertedTheme ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'};
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${invertedTheme ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'};
        }

        @media (max-width: 768px) {
          .max-w-xs {
            max-width: calc(100vw - 100px);
          }
        }

        @media (max-width: 480px) {
          .max-w-xs {
            max-width: calc(100vw - 80px);
          }
        }

        /* Prevent zoom on iOS */
        input[type="text"], textarea {
          font-size: 16px !important;
        }

        /* Focus ring for accessibility */
        button:focus-visible, input:focus-visible, textarea:focus-visible {
          outline: 2px solid rgba(59, 130, 246, 0.5);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

export default App;