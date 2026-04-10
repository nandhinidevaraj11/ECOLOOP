import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Send, X, Phone, Info, CheckCircle2, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  sender: 'user' | 'recycler';
  text: string;
  timestamp: string;
  type?: 'text' | 'offer';
  offerAmount?: string;
}

interface ChatProps {
  listing: any;
  onClose: () => void;
}

export const Chat: React.FC<ChatProps> = ({ listing, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'user',
      text: `Hi, I'm interested in the ${listing.wasteType} you posted. Is it still available for pickup?`,
      timestamp: '10:00 AM'
    },
    {
      id: '2',
      sender: 'recycler',
      text: 'Yes, it is! We can arrange a pickup for tomorrow morning. What is the exact quantity?',
      timestamp: '10:02 AM'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');

    // Mock response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'recycler',
        text: 'Understood. I will send a formal quote shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, response]);
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white shadow-2xl z-50 flex flex-col border-l border-[var(--line)]"
    >
      {/* Header */}
      <div className="p-4 border-b border-[var(--line)] bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
            <AvatarFallback className="bg-[var(--ink)] text-white font-bold">{(listing.userName || 'U')[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-sm">{listing.userName || 'Anonymous User'}</h3>
            <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Online
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Listing Context */}
      <div className="p-3 bg-slate-100/50 border-b border-[var(--line)] flex items-center gap-3">
        <img src={listing.image} className="w-12 h-12 rounded object-cover border border-white shadow-sm" referrerPolicy="no-referrer" />
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Inquiry for</p>
          <p className="text-xs font-bold truncate">{listing.wasteType}</p>
        </div>
        <Badge variant="outline" className="bg-white text-[10px]">{listing.quantity}</Badge>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn(
              "flex flex-col max-w-[80%]",
              msg.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start"
            )}>
              <div className={cn(
                "p-3 rounded-2xl text-sm shadow-sm",
                msg.sender === 'user' 
                  ? "bg-[var(--ink)] text-white rounded-tr-none" 
                  : "bg-slate-100 text-slate-800 rounded-tl-none"
              )}>
                {msg.text}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 font-mono">{msg.timestamp}</span>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--line)] bg-slate-50 space-y-3">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase font-bold flex-1 bg-white">
            <Phone className="w-3 h-3 mr-1" /> Call
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase font-bold flex-1 bg-white">
            <IndianRupee className="w-3 h-3 mr-1" /> Negotiate
          </Button>
        </div>
        <div className="flex gap-2">
          <Input 
            placeholder="Type your message..." 
            className="bg-white text-xs"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button size="icon" className="bg-[var(--ink)] hover:bg-slate-800 shrink-0" onClick={handleSendMessage}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
