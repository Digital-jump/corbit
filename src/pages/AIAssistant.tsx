import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Copy, Check } from 'lucide-react';
import { useAuth } from '../lib/auth';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${user?.name || 'there'}. I am Corbit AI. I can help you draft announcements, analyze team sentiment, or answer questions about workforce management. How can I assist you today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: input,
          context: `Current Page: AI Assistant`
        })
      });

      if (!res.ok) throw new Error('Failed to get response');

      const data = await res.json();
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting to my neural core right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <button 
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 text-emerald-400/50 hover:text-emerald-300 hover:bg-emerald-900/50 rounded-lg transition-colors"
        title="Copy to clipboard"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    );
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Sparkles className="w-6 h-6 text-emerald-950" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-emerald-50">Corbit AI</h2>
          <p className="text-emerald-400/60 text-sm">Powered by Gemini 2.5 Flash</p>
        </div>
      </div>

      <div className="flex-1 bg-emerald-900/20 border border-emerald-800/50 rounded-2xl overflow-hidden flex flex-col shadow-xl">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'assistant' 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                  : 'bg-emerald-800 text-emerald-200'
              }`}>
                {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              
              <div className={`relative max-w-[80%] px-5 py-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-emerald-950/80 border border-emerald-800/50 text-emerald-100 rounded-tl-none shadow-sm'
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.role === 'assistant' && <CopyButton text={msg.content} />}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="bg-emerald-950/80 border border-emerald-800/50 px-5 py-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-emerald-950/50 border-t border-emerald-800/50 backdrop-blur-sm">
          <form onSubmit={handleSend} className="relative flex gap-3">
            <input
              type="text"
              placeholder="Ask Corbit to draft an email, analyze data, or suggest improvements..."
              className="flex-1 bg-emerald-900/30 border border-emerald-800 rounded-xl pl-4 pr-12 py-4 text-sm focus:outline-none focus:border-emerald-500 focus:bg-emerald-900/50 transition-all placeholder:text-emerald-600"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-lg flex items-center justify-center transition-all disabled:opacity-0 disabled:scale-90"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              "Draft a welcome email for new hires",
              "Summarize best practices for remote standups",
              "Write a polite reminder for timesheet submission"
            ].map((suggestion, i) => (
              <button
                key={i}
                onClick={() => setInput(suggestion)}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-emerald-900/30 border border-emerald-800/50 text-xs text-emerald-400 hover:bg-emerald-800/50 hover:border-emerald-700 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
