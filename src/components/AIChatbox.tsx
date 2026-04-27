import React, { useState, useRef, useEffect } from 'react';
import { Card, Btn, Spin } from './UI';
import { Role, Message } from '../types';
import { generateContentWithRetry } from '../lib/gemini';
import { Send, Bot, User, Sparkles, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIChatboxProps {
  role: Role;
}

export const AIChatbox: React.FC<AIChatboxProps> = ({ role }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hello! I am NyayaBot, your AI legal assistant. How can I help you with your ${role} workspace today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const contextMessages = messages.slice(-10).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
      
      const response = await generateContentWithRetry({
        model: 'gemini-3-flash-preview',
        contents: `You are NyayaBot, an AI legal assistant helping a ${role} on the NyayaSetu platform. 
        Provide helpful, professional, and accurate legal information within the context of Indian law. 
        Keep responses concise and relevant to the user's role.
        
        Previous conversation:
        ${contextMessages}
        
        User: ${input}`,
        config: {
          maxOutputTokens: 600,
          temperature: 0.7
        }
      });

      const assistantMessage: Message = { role: 'assistant', content: response.text || "I'm sorry, I couldn't process that request." };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')
        ? "AI service is currently busy due to high demand. Please try again in a moment."
        : "Error connecting to AI service. Please check your connection.";
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: `Chat cleared. How can I help you today?` }]);
  };

  return (
    <div className="flex flex-col gap-8 h-full max-h-[calc(100vh-120px)]">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-serif font-bold text-gold">AI Chatbox</h1>
        <p className="text-text-muted">Chat with NyayaBot for instant legal guidance and platform assistance.</p>
      </div>

      <Card className="flex-1 flex flex-col gap-4 overflow-hidden p-0 border-border bg-bg2 shadow-2xl">
        <div className="p-4 border-b border-border bg-bg3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold border border-gold/30">
              <Bot size={24} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm">NyayaBot</span>
              <span className="text-[10px] text-success flex items-center gap-1 font-bold uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Online
              </span>
            </div>
          </div>
          <button 
            onClick={clearChat}
            className="p-2 hover:bg-danger/10 text-text-dim hover:text-danger rounded-lg transition-all"
            title="Clear Chat"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scroll-smooth">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  max-w-[80%] p-4 text-sm leading-relaxed shadow-lg
                  ${m.role === 'user' 
                    ? 'bg-gradient-to-br from-gold to-gold-light text-bg rounded-[18px_18px_4px_18px]' 
                    : 'bg-card border border-border text-text rounded-[18px_18px_18px_4px]'}
                `}>
                  <div className="flex items-center gap-2 mb-1">
                    {m.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                    <span className="text-[10px] uppercase font-bold opacity-60">
                      {m.role === 'user' ? 'You' : 'NyayaBot'}
                    </span>
                  </div>
                  {m.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-card border border-border p-4 rounded-[18px_18px_18px_4px] flex items-center gap-3">
                <Spin />
                <span className="text-xs text-text-dim italic">NyayaBot is typing...</span>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-bg3">
          <div className="relative flex items-center gap-3 group">
            <input 
              type="text" 
              placeholder="Type your message here..." 
              className="flex-1 bg-bg border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-gold transition-all pr-12"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button 
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="absolute right-2 p-2 bg-gold text-bg rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
            >
              <Send size={18} />
            </button>
          </div>
          <div className="mt-2 flex justify-center">
            <span className="text-[10px] text-text-dim uppercase tracking-widest font-bold flex items-center gap-1">
              <Sparkles size={10} /> Powered by Gemini AI
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
