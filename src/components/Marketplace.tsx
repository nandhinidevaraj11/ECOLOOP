import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Search, Filter, MessageSquare, Package, MapPin, IndianRupee, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface WasteListing {
  id: string;
  userId: string;
  userName: string;
  userType: 'Industry' | 'Household';
  wasteType: string;
  classification: string;
  quantity: string;
  location: string;
  image: string;
  timestamp: string;
  marketValue: string;
  isSold?: boolean;
}


export const Marketplace: React.FC<{ 
  onOpenChat: (listing: WasteListing) => void;
  onBuy: (id: string) => void;
  onSelectListing: (listing: WasteListing) => void;
  listings?: WasteListing[];
}> = ({ onOpenChat, onBuy, onSelectListing, listings = [] }) => {
  const [filter, setFilter] = useState('all');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-mono font-bold text-lg uppercase italic">Recovery Marketplace</h2>
          <p className="text-xs text-slate-500 mt-1">Live listings from industries and households across Tamil Nadu</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search materials..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-[var(--line)] rounded-md text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onSelectListing(listing)}
            className="cursor-pointer"
          >
            <Card className="border-[var(--line)] overflow-hidden group hover:shadow-2xl transition-all h-full">
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={listing.image} 
                  alt={listing.wasteType} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className="bg-white/90 text-[var(--ink)] backdrop-blur-sm border-none uppercase text-[9px] font-bold tracking-widest">
                    {listing.classification}
                  </Badge>
                </div>
                <div className="absolute bottom-3 right-3">
                  <Badge className="bg-[var(--ink)] text-white border-none uppercase text-[9px] font-bold tracking-widest">
                    {listing.quantity}
                  </Badge>
                </div>
                {listing.isSold && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                    <Badge className="bg-red-600 text-white border-none text-xl font-black italic tracking-tighter px-6 py-2 rotate-[-12deg] shadow-2xl">
                      SOLD
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8 border border-slate-100">
                    <AvatarFallback className="text-[10px] font-bold">{(listing.userName || 'U')[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-bold">{listing.userName || 'Anonymous User'}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{listing.userType || 'Unknown Type'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm group-hover:text-[var(--accent)] transition-colors">{listing.wasteType}</h3>
                  <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {listing.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {listing.timestamp}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="shrink-0">
                    <p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Min. Price</p>
                    <p className="font-bold text-green-600 text-sm">{listing.marketValue}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={listing.isSold}
                      className="text-[9px] font-mono uppercase tracking-widest h-8 px-2"
                      onClick={() => onOpenChat(listing)}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" /> Chat
                    </Button>
                    <Button 
                      size="sm" 
                      disabled={listing.isSold}
                      className={cn(
                        "text-[9px] font-mono uppercase tracking-widest h-8 px-4",
                        listing.isSold ? "bg-slate-200" : "bg-[var(--ink)] hover:bg-slate-800 text-white"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectListing(listing);
                      }}
                    >
                      {listing.isSold ? 'Unavailable' : 'View Details'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
