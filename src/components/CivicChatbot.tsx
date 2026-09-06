import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export function CivicChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', parts: [{ text: 'Hello! I am your AI Civic Assistant. You can ask me about local policies, infrastructure guidelines, or how to report issues.' }] }
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

    const userMessage: Message = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send history (excluding the first welcome message if it doesn't match API shape, but we formatted it correctly)
      const historyToSend = messages.slice(1);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: historyToSend.length > 0 ? historyToSend : undefined
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');
      const data = await response.json();

      setMessages(prev => [...prev, { role: 'model', parts: [{ text: data.text }] }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: 'Sorry, I encountered an error connecting to the AI.' }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 p-4 bg-teal-600 text-white rounded-full shadow-xl hover:bg-teal-700 transition-colors z-40"
        title="Civic Chatbot"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-[#121212] shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-white/10">
          <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-teal-600 text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-semibold">Civic Info Bot</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role === 'user' ? 'bg-teal-600 text-white rounded-tr-sm' : 'bg-slate-100 dark:bg-[#1e1e1e] text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-white/5'}`}>
                  {msg.role === 'model' && <Bot className="w-4 h-4 mb-1 text-teal-600 dark:text-teal-400" />}
                  {msg.parts[0].text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-[#1e1e1e] rounded-2xl p-3 rounded-tl-sm flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#121212]">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#1e1e1e] rounded-full p-1 pl-4 pr-1 border border-transparent focus-within:border-teal-500/50">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about policies..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 dark:text-white placeholder:text-slate-500"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-teal-600 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
