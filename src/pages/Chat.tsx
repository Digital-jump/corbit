import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../lib/auth';
import { Send, Hash, User } from 'lucide-react';

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const res = await fetch('/api/chat/messages');
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMessage, channel: 'general' })
    });
    
    setNewMessage('');
    fetchMessages();
  };

  return (
    <div className="h-[calc(100vh-140px)] flex bg-emerald-900/20 border border-emerald-800/50 rounded-xl overflow-hidden">
      {/* Channels Sidebar */}
      <div className="w-64 bg-emerald-950/50 border-r border-emerald-800/50 p-4 hidden md:flex flex-col">
        <h3 className="text-emerald-400/70 text-xs font-medium uppercase tracking-wider mb-4">Channels</h3>
        <div className="space-y-1">
          {['general', 'announcements', 'random', 'engineering'].map(channel => (
            <button key={channel} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${channel === 'general' ? 'bg-emerald-500/10 text-emerald-400' : 'text-emerald-400/60 hover:bg-emerald-900/30'}`}>
              <Hash className="w-4 h-4 opacity-70" />
              {channel}
            </button>
          ))}
        </div>
        
        <h3 className="text-emerald-400/70 text-xs font-medium uppercase tracking-wider mt-8 mb-4">Direct Messages</h3>
        <div className="space-y-1">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-emerald-400/60 hover:bg-emerald-900/30">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            Sarah Connor
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-emerald-800/50 flex items-center px-6 bg-emerald-900/30">
          <Hash className="w-5 h-5 text-emerald-500 mr-2" />
          <span className="font-bold text-emerald-50">general</span>
          <span className="text-emerald-400/50 text-sm ml-4">Team updates and general discussion</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => {
            const isMe = msg.sender_id === user?.userId;
            return (
              <div key={msg.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center flex-shrink-0 text-sm font-bold text-emerald-200">
                  {msg.sender_name.charAt(0)}
                </div>
                <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-bold text-emerald-100">{msg.sender_name}</span>
                    <span className="text-xs text-emerald-500/50">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    isMe 
                      ? 'bg-emerald-500 text-emerald-950 rounded-tr-none' 
                      : 'bg-emerald-900/50 text-emerald-100 border border-emerald-800/50 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-emerald-900/30 border-t border-emerald-800/50">
          <form onSubmit={handleSend} className="flex gap-4">
            <input
              type="text"
              placeholder="Message #general..."
              className="flex-1 bg-emerald-950/50 border border-emerald-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
