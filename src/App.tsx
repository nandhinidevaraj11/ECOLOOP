import React, { useState, useEffect } from 'react';
import { WasteAnalyzer } from './components/WasteAnalyzer';
import { RecyclingCenters } from './components/RecyclingCenters';
import { Marketplace } from './components/Marketplace';
import { Chat } from './components/Chat';
import { Analytics } from './components/Analytics';
import { ProductDetail } from './components/ProductDetail';
import { Auth } from './components/Auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { RefreshCw, User, LogOut, Loader2 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, getDoc, addDoc, where, serverTimestamp } from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState('analyzer');
  const [activeChat, setActiveChat] = useState<any>(null);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [marketListings, setMarketListings] = useState<any[]>([]);
  const [analyticsHistory, setAnalyticsHistory] = useState<any[]>([]);
  const [lastAnalyzedType, setLastAnalyzedType] = useState<string | undefined>(undefined);
  const [preSelectedCenter, setPreSelectedCenter] = useState<any>(null);
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setCurrentUser({ ...user, ...userDoc.data() });
      } else {
        setCurrentUser(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;
    
    const q = query(collection(db, 'listings'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate().toLocaleDateString() + ' ' + doc.data().timestamp?.toDate().toLocaleTimeString()
      }));
      setMarketListings(listings);
    });
    
    return () => unsubscribe();
  }, [isAuthReady]);

  useEffect(() => {
    if (!isAuthReady || !currentUser) return;
    
    const q = query(
      collection(db, 'analytics'), 
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate().toLocaleTimeString() || new Date().toLocaleTimeString()
      }));
      setAnalyticsHistory(history);
    });
    
    return () => unsubscribe();
  }, [isAuthReady, currentUser?.uid]);

  const handlePostToMarketplace = (listing: any) => {
    // Handled by Firestore listener
  };

  const handleRecordAnalytics = async (data: any) => {
    if (!currentUser) return;
    try {
      await addDoc(collection(db, 'analytics'), {
        ...data,
        userId: currentUser.uid,
        timestamp: serverTimestamp()
      });
      setLastAnalyzedType(data.wasteType);
    } catch (error) {
      console.error("Error recording analytics:", error);
    }
  };

  const handleBuyItem = async (id: string, transactionDetails?: any) => {
    try {
      await updateDoc(doc(db, 'listings', id), { isSold: true });
      if (selectedListing && selectedListing.id === id) {
        setSelectedListing((prev: any) => ({ ...prev, isSold: true }));
      }
    } catch (error) {
      console.error("Error updating listing:", error);
    }
  };

  const handleSellToCenter = (center: any) => {
    setPreSelectedCenter(center);
    setActiveTab('analyzer');
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--paper)]">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--ink)]" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[var(--paper)] py-24">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[var(--ink)] rounded-xl flex items-center justify-center shadow-lg transform -rotate-6">
              <RefreshCw className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic">EcoLoop</h1>
              <p className="text-[12px] font-mono font-bold uppercase tracking-[0.2em] opacity-50 -mt-1">Industrial Resource Recovery</p>
            </div>
          </div>
          <Auth onAuthChange={setCurrentUser} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] font-sans selection:bg-[var(--accent)] selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[var(--line)]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--ink)] rounded-xl flex items-center justify-center shadow-lg transform -rotate-6">
              <RefreshCw className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic">EcoLoop</h1>
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] opacity-50 -mt-1">Industrial Resource Recovery</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-[10px] font-bold uppercase opacity-50">{currentUser.name}</span>
              <span className="text-[10px] font-mono text-green-600 font-bold flex items-center gap-1">
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" /> {currentUser.type.toUpperCase()}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="w-10 h-10 rounded-full bg-slate-100 border border-[var(--line)] flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
          <div className="flex justify-center">
            <TabsList className="bg-slate-100 p-1 border border-[var(--line)] h-12">
              <TabsTrigger value="analyzer" className="px-8 font-mono text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Waste Material
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="px-8 font-mono text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Marketplace
              </TabsTrigger>
              <TabsTrigger value="analytics" className="px-8 font-mono text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="centers" className="px-8 font-mono text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Recycling Centers
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="analyzer" className="mt-0 focus-visible:outline-none">
            <div className="space-y-12">
              <section className="text-center max-w-2xl mx-auto space-y-4">
                <Badge variant="outline" className="px-4 py-1 rounded-full border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-widest">
                  v2.4 Neural Network Active
                </Badge>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
                  Upload Waste <br />
                  <span className="text-[var(--accent)]">Material.</span>
                </h2>
                <p className="text-slate-500 text-sm md:text-base font-medium">
                  Upload industrial or household waste images for instant classification, 
                  safety protocols, and real-time market valuation.
                </p>
              </section>
              <WasteAnalyzer 
                currentUser={currentUser}
                onPostToMarketplace={handlePostToMarketplace} 
                onRecordAnalytics={handleRecordAnalytics}
                preSelectedCenter={preSelectedCenter}
                onClearPreSelected={() => setPreSelectedCenter(null)}
              />
            </div>
          </TabsContent>

          <TabsContent value="marketplace" className="mt-0 focus-visible:outline-none">
            <Marketplace 
              onOpenChat={(listing) => setActiveChat(listing)} 
              onBuy={handleBuyItem}
              onSelectListing={(listing) => setSelectedListing(listing)}
              listings={marketListings}
            />
          </TabsContent>

          <TabsContent value="analytics" className="mt-0 focus-visible:outline-none">
            <Analytics history={analyticsHistory} />
          </TabsContent>

          <TabsContent value="centers" className="mt-0 focus-visible:outline-none">
            <RecyclingCenters 
              filterType={lastAnalyzedType} 
              onSellToCenter={handleSellToCenter}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Chat Overlay */}
      <AnimatePresence>
        {activeChat && (
          <Chat listing={activeChat} onClose={() => setActiveChat(null)} />
        )}
      </AnimatePresence>

      {/* Detail View Overlay */}
      <AnimatePresence>
        {selectedListing && (
          <ProductDetail 
            listing={selectedListing} 
            onClose={() => setSelectedListing(null)}
            onBuy={handleBuyItem}
            onOpenChat={(listing) => {
              setSelectedListing(null);
              setActiveChat(listing);
            }}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-[var(--line)] bg-white py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              <span className="font-black uppercase tracking-tighter italic">EcoLoop</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Driving the circular economy through advanced AI material analysis and 
              seamless industrial resource recovery.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">© 2026 EcoLoop Systems • Tamil Nadu, India</p>
          <div className="flex gap-6">
            <a href="#" className="text-[10px] font-mono text-slate-400 uppercase tracking-widest hover:text-[var(--ink)]">Privacy</a>
            <a href="#" className="text-[10px] font-mono text-slate-400 uppercase tracking-widest hover:text-[var(--ink)]">Terms</a>
            <a href="#" className="text-[10px] font-mono text-slate-400 uppercase tracking-widest hover:text-[var(--ink)]">API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

