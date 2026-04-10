import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { BarChart3, Clock, Tag, ShieldAlert, IndianRupee, ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface AnalyticsItem {
  id: string;
  wasteType: string;
  classification: string;
  timestamp: string;
  image: string;
  marketValue: string;
  hazardous: boolean;
}

interface AnalyticsProps {
  history: AnalyticsItem[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ history }) => {
  const totalItems = history.length;
  const hazardousCount = history.filter(item => item.hazardous).length;
  const totalValue = history.reduce((acc, item) => {
    const value = parseInt(item.marketValue.replace(/[^0-9]/g, '')) || 0;
    return acc + value;
  }, 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-[var(--line)] bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Total Analyzed</p>
              <p className="text-2xl font-black">{totalItems}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-[var(--line)] bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-lg text-red-600">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Hazardous Detected</p>
              <p className="text-2xl font-black">{hazardousCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--line)] bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg text-green-600">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Total Recovery Value</p>
              <p className="text-2xl font-black">₹{totalValue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="font-mono font-bold text-sm uppercase italic">Material Classification History</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history.length === 0 ? (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">No data recorded yet</p>
            </div>
          ) : (
            history.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="border-[var(--line)] overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video relative">
                    <img src={item.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute top-2 right-2">
                      <Badge className={cn(
                        "uppercase text-[8px] font-bold",
                        item.classification === 'recyclable' ? 'bg-green-500' : 
                        item.classification === 'hazardous' ? 'bg-red-500' : 'bg-blue-500'
                      )}>
                        {item.classification}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm">{item.wasteType}</h4>
                      <p className="text-green-600 font-bold text-xs">{item.marketValue}</p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.timestamp}</span>
                      <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> ID: {item.id}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
