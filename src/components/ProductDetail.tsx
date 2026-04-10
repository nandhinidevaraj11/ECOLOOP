import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MapPin, 
  Clock, 
  Package, 
  Tag, 
  ShieldAlert, 
  CheckCircle2, 
  IndianRupee, 
  MessageSquare, 
  CreditCard, 
  Truck, 
  Building2,
  ArrowLeft
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from '../lib/utils';

interface ProductDetailProps {
  listing: any;
  onClose: () => void;
  onBuy: (id: string, transactionDetails: any) => void;
  onOpenChat: (listing: any) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ listing, onClose, onBuy, onOpenChat }) => {
  const [showTransaction, setShowTransaction] = useState(false);
  const [transactionData, setTransactionData] = useState({
    paymentMethod: 'bank_transfer',
    address: '',
    contactNumber: ''
  });

  const handleConfirmPurchase = () => {
    if (!transactionData.address || !transactionData.contactNumber) {
      alert("Please fill in all transaction details.");
      return;
    }
    onBuy(listing.id, transactionData);
    setShowTransaction(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-white overflow-y-auto"
    >
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-slate-400 hover:text-[var(--ink)] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="space-y-6">
            <div className="aspect-square rounded-2xl overflow-hidden border border-[var(--line)] shadow-xl relative">
              <img 
                src={listing.image} 
                alt={listing.wasteType} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {listing.isSold && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                  <Badge className="bg-red-600 text-white border-none text-4xl font-black italic tracking-tighter px-12 py-4 rotate-[-12deg] shadow-2xl">
                    SOLD
                  </Badge>
                </div>
              )}
            </div>

            <Card className="border-[var(--line)] bg-slate-50/50">
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-mono font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Marketplace Distribution</h3>
                  <Badge variant="outline" className="text-[8px] font-bold text-blue-600 border-blue-200">MAP ACTIVE</Badge>
                </div>

                {/* Mini Map Placeholder */}
                <div className="aspect-[21/9] bg-slate-200 rounded-lg relative overflow-hidden border border-slate-300">
                  <div className="absolute inset-0 opacity-40 grayscale" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute -inset-4 bg-blue-500/20 rounded-full animate-ping" />
                      <MapPin className="w-6 h-6 text-blue-600 relative z-10" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[8px] font-mono font-bold border border-slate-200">
                    LAT: 12.9716 | LNG: 77.5946
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Target Recovery Units</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 flex items-center gap-2 py-1.5">
                      <Building2 className="w-3 h-3" /> {listing.location}
                    </Badge>
                    {listing.wasteType.toLowerCase().includes('paper') && (
                      <>
                        <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 flex items-center gap-2 py-1.5">
                          <Building2 className="w-3 h-3" /> TN Paper Hub
                        </Badge>
                        <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 flex items-center gap-2 py-1.5">
                          <Building2 className="w-3 h-3" /> Eco-Fiber Market
                        </Badge>
                        <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 flex items-center gap-2 py-1.5">
                          <Building2 className="w-3 h-3" /> Chennai Pulp Exchange
                        </Badge>
                      </>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 italic">This listing is broadcasted to all relevant recovery networks in Tamil Nadu.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details Section */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={cn(
                  "uppercase text-[10px] font-bold tracking-widest px-3 py-1",
                  listing.classification === 'recyclable' ? 'bg-green-100 text-green-700 border-green-200' :
                  listing.classification === 'hazardous' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                )}>
                  {listing.classification}
                </Badge>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Posted {listing.timestamp}
                </span>
              </div>
              <h1 className="text-4xl font-black tracking-tight uppercase italic">{listing.wasteType}</h1>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <Building2 className="w-4 h-4" />
                <span>{listing.userName}</span>
                <span className="opacity-30">|</span>
                <span className="text-blue-600">{listing.userType}</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-[9px] font-bold uppercase text-slate-400">Quantity</p>
                    <p className="font-bold text-sm">{listing.quantity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-[9px] font-bold uppercase text-slate-400">Min. Price</p>
                    <p className="font-bold text-sm text-green-600">{listing.marketValue}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-8 border-t border-[var(--line)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Recycling Protocol
                  </h3>
                  <ul className="space-y-2">
                    {(listing.recyclingMethods || []).length > 0 ? (
                      listing.recyclingMethods.map((m: string, i: number) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                          <div className="w-1 h-1 bg-slate-300 rounded-full mt-1.5" />
                          {m}
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-slate-400 italic">No specific recycling methods provided.</li>
                    )}
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500" /> Safety Notes
                  </h3>
                  <div className="space-y-2">
                    {listing.hazardousAlert && (
                      <p className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded border border-red-100">
                        {listing.hazardousAlert}
                      </p>
                    )}
                    <ul className="space-y-2">
                      {(listing.safetyProtocols || []).length > 0 ? (
                        listing.safetyProtocols.map((p: string, i: number) => (
                          <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                            <div className="w-1 h-1 bg-slate-300 rounded-full mt-1.5" />
                            {p}
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-slate-600">Ensure dry storage and standard industrial handling protocols.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="flex-1 h-14 font-mono font-bold uppercase tracking-widest"
                  onClick={() => onOpenChat(listing)}
                  disabled={listing.isSold}
                >
                  <MessageSquare className="w-5 h-5 mr-2" /> Negotiate
                </Button>
                <Button 
                  size="lg" 
                  className={cn(
                    "flex-1 h-14 font-mono font-bold uppercase tracking-widest shadow-xl",
                    listing.isSold ? "bg-slate-100 text-slate-400" : "bg-[var(--ink)] text-white hover:bg-slate-800"
                  )}
                  onClick={() => setShowTransaction(true)}
                  disabled={listing.isSold}
                >
                  {listing.isSold ? 'Sold to Another' : 'Buy Now'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      <AnimatePresence>
        {showTransaction && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-[var(--line)] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-[var(--line)] bg-slate-50 flex justify-between items-center">
                <h3 className="font-mono font-bold text-sm uppercase italic">Complete Transaction</h3>
                <button onClick={() => setShowTransaction(false)} className="text-slate-400 hover:text-[var(--ink)]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Payment Method</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setTransactionData({...transactionData, paymentMethod: 'bank_transfer'})}
                        className={cn(
                          "p-3 border rounded-lg flex flex-col items-center gap-2 transition-all",
                          transactionData.paymentMethod === 'bank_transfer' ? "border-[var(--ink)] bg-slate-50" : "border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <Building2 className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase">Bank Transfer</span>
                      </button>
                      <button 
                        onClick={() => setTransactionData({...transactionData, paymentMethod: 'card'})}
                        className={cn(
                          "p-3 border rounded-lg flex flex-col items-center gap-2 transition-all",
                          transactionData.paymentMethod === 'card' ? "border-[var(--ink)] bg-slate-50" : "border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <CreditCard className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase">Card / UPI</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Delivery Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <textarea 
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/10 min-h-[100px]"
                        placeholder="Enter full industrial facility address..."
                        value={transactionData.address}
                        onChange={(e) => setTransactionData({...transactionData, address: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Contact Number</Label>
                    <div className="relative">
                      <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        className="pl-10 h-12"
                        placeholder="+91 00000 00000"
                        value={transactionData.contactNumber}
                        onChange={(e) => setTransactionData({...transactionData, contactNumber: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="uppercase tracking-widest opacity-50">Total Payable</span>
                    <span className="text-green-600 text-lg">{listing.marketValue}</span>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      className="flex-1 h-14 font-mono font-bold uppercase tracking-widest"
                      onClick={() => setShowTransaction(false)}
                    >
                      Back
                    </Button>
                    <Button 
                      className="flex-[2] h-14 bg-[var(--ink)] text-white font-mono font-bold uppercase tracking-widest shadow-lg"
                      onClick={handleConfirmPurchase}
                    >
                      Confirm & Pay
                    </Button>
                  </div>
                  <p className="text-[9px] text-center text-slate-400 uppercase tracking-widest">
                    Secure transaction powered by EcoLoop Escrow
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
