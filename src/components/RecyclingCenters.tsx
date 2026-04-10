import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Info, ExternalLink, Navigation, IndianRupee, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { searchRecyclingCenters } from '../lib/gemini';
import { cn } from '../lib/utils';

interface Center {
  id: number;
  name: string;
  location: string;
  type: string;
  contact: string;
  buyingPrice: string;
  coordinates: { lat: number; lng: number };
}

interface RecyclingCentersProps {
  filterType?: string;
  onSellToCenter: (center: Center) => void;
}

export const RecyclingCenters: React.FC<RecyclingCentersProps> = ({ filterType, onSellToCenter }) => {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [isFiltered, setIsFiltered] = useState(!!filterType);

  useEffect(() => {
    setIsFiltered(!!filterType);
  }, [filterType]);

  useEffect(() => {
    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          console.warn("Geolocation denied, using default view", err);
          fetchCenters(); // Fetch default centers
        }
      );
    } else {
      fetchCenters();
    }
  }, []);

  useEffect(() => {
    if (location) {
      fetchCenters(location.lat, location.lng);
    }
  }, [location, filterType, isFiltered]);

  const fetchCenters = async (lat?: number, lng?: number) => {
    setLoading(true);
    try {
      let data: Center[] = [];
      if (lat && lng) {
        data = await searchRecyclingCenters(lat, lng);
      } else {
        // Fallback to static mock data if no location
        const res = await fetch('/api/recycling-centers');
        const mockData = await res.json();
        // Add mock buying prices and commissions to static data
        data = mockData.map((c: any) => ({
          ...c,
          buyingPrice: "Market Rates"
        }));
      }
      
      // Filter by type if filterType is provided and isFiltered is true
      if (isFiltered && filterType && Array.isArray(data)) {
        const searchTerms = filterType.toLowerCase().split(' ');
        data = data.filter(center => 
          searchTerms.some(term => 
            center.name.toLowerCase().includes(term) || 
            center.type.toLowerCase().includes(term)
          )
        );
      }
      
      // Safety check: ensure data is an array
      setCenters(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch centers:", err);
      setCenters([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-mono font-bold text-lg uppercase italic">
            {(isFiltered && filterType) ? `${filterType} Recovery Network` : 'Resource Recovery Network'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {(isFiltered && filterType) 
              ? `Suggested ${filterType} recycling facilities in Tamil Nadu`
              : 'Nearby industrial recycling facilities in Tamil Nadu'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {filterType && (
            <button 
              onClick={() => setIsFiltered(!isFiltered)}
              className={cn(
                "text-[10px] font-mono px-3 py-1 rounded border transition-all font-bold uppercase tracking-widest",
                isFiltered 
                  ? "bg-blue-50 text-blue-700 border-blue-200" 
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400"
              )}
            >
              {isFiltered ? 'Showing Matches' : 'Show All Centers'}
            </button>
          )}
          <div className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
            LIVE DATABASE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-lg border border-[var(--line)]" />
          ))
        ) : (
          centers.map((center, i) => (
            <motion.div 
              key={center.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white border border-[var(--line)] p-5 rounded-lg hover:border-[var(--ink)] transition-all flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-100 p-2 rounded group-hover:bg-[var(--ink)] group-hover:text-white transition-colors">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">{center.type}</span>
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-tighter">Buying: {center.buyingPrice}</span>
                </div>
              </div>
              
              <h3 className="font-bold text-sm mb-1 group-hover:text-[var(--accent)] transition-colors">{center.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mb-4">
                <Navigation className="w-3 h-3" />
                {center.location}
              </p>
              
              <div className="mt-auto pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Phone className="w-3 h-3" />
                    {center.contact}
                  </div>
                </div>
                
                <button 
                  onClick={() => onSellToCenter(center)}
                  className="w-full bg-slate-50 border border-slate-200 text-[var(--ink)] font-mono py-2 rounded uppercase text-[10px] font-bold tracking-widest hover:bg-[var(--ink)] hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <IndianRupee className="w-3 h-3" />
                  Sell Waste Material
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Transaction Modal */}
      <AnimatePresence>
        {selectedCenter && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[var(--line)] rounded-lg max-w-md w-full overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-[var(--line)] bg-slate-50 flex justify-between items-center">
                <h3 className="font-mono font-bold text-sm uppercase italic">Initiate Recovery Transaction</h3>
                <button onClick={() => setSelectedCenter(null)} className="text-slate-400 hover:text-[var(--ink)]">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Facility</p>
                  <p className="font-bold text-lg">{selectedCenter.name}</p>
                  <p className="text-xs text-slate-500">{selectedCenter.location}</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="p-3 bg-slate-50 rounded border border-slate-100">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Buying Rate</p>
                    <p className="font-bold text-green-600">{selectedCenter.buyingPrice}</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded text-blue-800 text-xs leading-relaxed">
                  <strong>Protocol:</strong> Upon confirmation, a digital manifest will be generated. The facility will verify the material quality on arrival.
                </div>

                <button 
                  onClick={() => {
                    alert("Transaction Request Sent! The facility will contact you shortly.");
                    setSelectedCenter(null);
                  }}
                  className="w-full bg-[var(--ink)] text-white font-mono py-4 rounded uppercase text-xs font-bold tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                >
                  Confirm & Generate Manifest
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Note:</strong> This list is based on registered industrial recovery units in Tamil Nadu. Always contact the facility before transporting hazardous materials to ensure they have the appropriate pollution control board (TNPCB) clearances.
        </p>
      </div>
    </div>
  );
};
