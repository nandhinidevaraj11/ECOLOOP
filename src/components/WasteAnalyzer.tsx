import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, Loader2, CheckCircle2, XCircle, RefreshCw, ShieldAlert, IndianRupee, Package, Tag, Share2, Building2 } from 'lucide-react';
import { analyzeWasteImage, WasteAnalysisResult } from '../lib/gemini';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface WasteAnalyzerProps {
  currentUser: any;
  onPostToMarketplace?: (listing: any) => void;
  onRecordAnalytics?: (data: any) => void;
  preSelectedCenter?: any;
  onClearPreSelected?: () => void;
}

export const WasteAnalyzer: React.FC<WasteAnalyzerProps> = ({ 
  currentUser,
  onPostToMarketplace, 
  onRecordAnalytics,
  preSelectedCenter,
  onClearPreSelected
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<WasteAnalysisResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isPosted, setIsPosted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [userQuantity, setUserQuantity] = useState('');
  const [userMinPrice, setUserMinPrice] = useState('');
  const webcamRef = useRef<Webcam>(null);

  const handleAnalyze = async (base64: string) => {
    setCapturedImage(base64);
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setIsPosted(false);
    setUserQuantity('');
    setUserMinPrice('');
    try {
      const analysis = await analyzeWasteImage(base64);
      setResult(analysis);
      setUserQuantity(analysis.quantityPrediction);
      setUserMinPrice(analysis.estimatedMarketValue.replace(/[^0-9]/g, ''));
      
      // Record to analytics automatically
      if (onRecordAnalytics) {
        onRecordAnalytics({
          wasteType: analysis.wasteType,
          classification: analysis.classification,
          image: base64,
          marketValue: analysis.estimatedMarketValue,
          hazardous: !!analysis.hazardousAlert,
          quantity: analysis.quantityPrediction
        });
      }
    } catch (err) {
      setError("Analysis failed. Please try again with a clearer image.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePostToMarketplace = async () => {
    if (!result || !capturedImage || !currentUser) return;
    
    setIsPosted(true);
    setLoading(true);
    
    try {
      const listingData = {
        userId: currentUser.uid,
        userName: currentUser.name,
        userType: currentUser.type,
        wasteType: result.wasteType,
        classification: result.classification,
        quantity: userQuantity || result.quantityPrediction,
        location: preSelectedCenter?.name || currentUser.location || 'General Marketplace',
        image: capturedImage,
        timestamp: serverTimestamp(),
        marketValue: `₹${userMinPrice || result.estimatedMarketValue.replace(/[^0-9]/g, '')}`,
        isSold: false,
        recyclingMethods: result.recyclingMethods,
        safetyProtocols: result.safetyProtocols,
        hazardousAlert: result.hazardousAlert,
        reuseSuggestions: result.reuseSuggestions
      };

      await addDoc(collection(db, 'listings'), listingData);
      
      if (onPostToMarketplace) {
        onPostToMarketplace(listingData);
      }
    } catch (error) {
      console.error("Error posting listing:", error);
      setIsPosted(false);
    } finally {
      setLoading(false);
    }
  };

  const getMarketplaceSuggestions = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('paper')) return [
      { 
        name: 'TN Paper Hub', 
        location: 'Guindy, Chennai', 
        rating: '4.8', 
        type: 'Industrial',
        capacity: '50 Tons/Day',
        specialization: 'Corrugated & Kraft',
        contact: '+91 44 2235 1234'
      },
      { 
        name: 'Eco-Fiber Market', 
        location: 'Ambattur, Chennai', 
        rating: '4.5', 
        type: 'Recycling',
        capacity: '20 Tons/Day',
        specialization: 'Office & White Paper',
        contact: '+91 44 2625 5678'
      },
      { 
        name: 'Chennai Pulp Exchange', 
        location: 'Manali, Chennai', 
        rating: '4.2', 
        type: 'Processing',
        capacity: '100 Tons/Day',
        specialization: 'Bulk Industrial Pulp',
        contact: '+91 44 2594 9012'
      }
    ];
    if (t.includes('plastic')) return [
      { 
        name: 'Polymer Trade Center', 
        location: 'Hosur, TN', 
        rating: '4.9', 
        type: 'Industrial',
        capacity: '30 Tons/Day',
        specialization: 'HDPE & LDPE',
        contact: '+91 4344 276 543'
      },
      { 
        name: 'Recycle-Pro Plastic', 
        location: 'Coimbatore, TN', 
        rating: '4.6', 
        type: 'Recycling',
        capacity: '15 Tons/Day',
        specialization: 'PET Bottles',
        contact: '+91 422 257 8901'
      },
      { 
        name: 'Green Resin Market', 
        location: 'Madurai, TN', 
        rating: '4.3', 
        type: 'Processing',
        capacity: '40 Tons/Day',
        specialization: 'PP & PVC',
        contact: '+91 452 234 5678'
      }
    ];
    if (t.includes('metal')) return [
      { 
        name: 'Steel & Alloy Exchange', 
        location: 'Salem, TN', 
        rating: '4.7', 
        type: 'Industrial',
        capacity: '200 Tons/Day',
        specialization: 'Ferrous Scrap',
        contact: '+91 427 244 1234'
      },
      { 
        name: 'Metals Recovery Yard', 
        location: 'Trichy, TN', 
        rating: '4.4', 
        type: 'Recycling',
        capacity: '50 Tons/Day',
        specialization: 'Aluminum & Copper',
        contact: '+91 431 250 5678'
      },
      { 
        name: 'Industrial Scrap Hub', 
        location: 'Erode, TN', 
        rating: '4.1', 
        type: 'Processing',
        capacity: '80 Tons/Day',
        specialization: 'Mixed Industrial Alloys',
        contact: '+91 424 225 9012'
      }
    ];
    if (t.includes('e-waste')) return [
      { 
        name: 'Tech-Recycle Portal', 
        location: 'Siruseri, Chennai', 
        rating: '4.8', 
        type: 'Industrial',
        capacity: '5 Tons/Day',
        specialization: 'PCBs & Components',
        contact: '+91 44 2747 1234'
      },
      { 
        name: 'Circuit Board Recovery', 
        location: 'Sholinganallur, Chennai', 
        rating: '4.5', 
        type: 'Recycling',
        capacity: '2 Tons/Day',
        specialization: 'Consumer Electronics',
        contact: '+91 44 2450 5678'
      },
      { 
        name: 'Digital Waste Hub', 
        location: 'Perungudi, Chennai', 
        rating: '4.2', 
        type: 'Processing',
        capacity: '10 Tons/Day',
        specialization: 'IT Assets & Servers',
        contact: '+91 44 2496 9012'
      }
    ];
    return [
      { 
        name: 'General Resource Exchange', 
        location: 'Multiple Locations', 
        rating: '4.0', 
        type: 'General',
        capacity: 'Varies',
        specialization: 'Mixed Recyclables',
        contact: '1800-ECO-LOOP'
      },
      { 
        name: 'Industrial Recovery Network', 
        location: 'Tamil Nadu State', 
        rating: '4.2', 
        type: 'Network',
        capacity: 'Unlimited',
        specialization: 'All Industrial Waste',
        contact: 'support@ecoloop.in'
      }
    ];
  };

  const getClassificationColor = (cls: string) => {
    switch (cls) {
      case 'recyclable': return 'bg-green-100 text-green-700 border-green-200';
      case 'recoverable': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'hazardous': return 'bg-red-100 text-red-700 border-red-200';
      case 'non-recyclable': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      {preSelectedCenter && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex justify-between items-center"
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-full">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-900 uppercase tracking-widest">Selling to Specific Entity</p>
              <p className="text-sm font-medium text-blue-700">{preSelectedCenter.name} • {preSelectedCenter.location}</p>
            </div>
          </div>
          <button 
            onClick={onClearPreSelected}
            className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800"
          >
            Clear Selection
          </button>
        </motion.div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <Card className="border-[var(--line)] bg-white overflow-hidden">
        <CardHeader className="border-b border-[var(--line)] bg-slate-50">
          <div className="flex justify-between items-center">
            <CardTitle className="font-mono text-sm uppercase italic">Input Stream</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant={mode === 'camera' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setMode('camera')}
                className="h-8 text-[10px] uppercase font-bold"
              >
                <Camera className="w-3 h-3 mr-1" /> Camera
              </Button>
              <Button 
                variant={mode === 'upload' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setMode('upload')}
                className="h-8 text-[10px] uppercase font-bold"
              >
                <Upload className="w-3 h-3 mr-1" /> Upload
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="aspect-video bg-slate-900 relative group overflow-hidden">
            {capturedImage && !isAnalyzing ? (
              <div className="relative w-full h-full">
                <img src={capturedImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => {
                      setCapturedImage(null);
                      setResult(null);
                      setIsPosted(false);
                    }}
                    className="text-[10px] font-bold uppercase"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" /> Retake / Re-upload
                  </Button>
                </div>
              </div>
            ) : mode === 'camera' ? (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                mirrored={true}
                imageSmoothing={true}
                disablePictureInPicture={true}
                forceScreenshotSourceSize={true}
                onUserMedia={() => console.log("Webcam ready")}
                onUserMediaError={(err) => setError("Camera access denied: " + err)}
                screenshotQuality={0.92}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                <Upload className="w-12 h-12 opacity-20" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => handleAnalyze(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <p className="text-xs font-mono uppercase tracking-widest">Drop file or click to upload</p>
              </div>
            )}
            
            {mode === 'camera' && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                <Button 
                  size="lg"
                  disabled={isAnalyzing}
                  onClick={() => {
                    const image = webcamRef.current?.getScreenshot();
                    if (image) handleAnalyze(image);
                  }}
                  className="rounded-full w-16 h-16 bg-white hover:bg-slate-100 text-[var(--ink)] shadow-2xl border-4 border-slate-200/50 flex items-center justify-center"
                >
                  {isAnalyzing ? <Loader2 className="w-8 h-8 animate-spin" /> : <Camera className="w-8 h-8" />}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {!result && !isAnalyzing ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-12 text-center bg-slate-50/50"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                <RefreshCw className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="font-mono font-bold text-sm uppercase tracking-widest text-slate-400">Awaiting Analysis</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-[240px]">Upload or capture an image of industrial waste to begin the recovery protocol.</p>
            </motion.div>
          ) : isAnalyzing ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center border border-[var(--line)] rounded-xl p-12 bg-white"
            >
              <div className="relative">
                <div className="w-20 h-20 border-4 border-slate-100 rounded-full" />
                <div className="w-20 h-20 border-4 border-t-[var(--ink)] rounded-full animate-spin absolute inset-0" />
              </div>
              <p className="mt-8 font-mono text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Processing Neural Scan...</p>
            </motion.div>
          ) : result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="border-[var(--line)] shadow-xl overflow-hidden">
                <CardHeader className="border-b border-[var(--line)] bg-slate-50 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold tracking-tight">{result.wasteType}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge className={cn("uppercase text-[10px] font-bold tracking-widest", getClassificationColor(result.classification))}>
                        {result.classification}
                      </Badge>
                      <Badge variant="outline" className="uppercase text-[10px] font-bold tracking-widest flex items-center gap-1">
                        <Package className="w-3 h-3" /> {result.quantityPrediction}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setResult(null)}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Hazardous Alert */}
                  {result.hazardousAlert && (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg flex gap-4 text-red-800 animate-pulse">
                      <ShieldAlert className="w-6 h-6 shrink-0" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider">CRITICAL SAFETY ALERT</p>
                        <p className="text-sm mt-1 font-medium">{result.hazardousAlert}</p>
                        <div className="mt-3 space-y-1">
                          <p className="text-[10px] font-bold uppercase opacity-70">Handling Protocols:</p>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                            {result.safetyProtocols.map((p, i) => (
                              <li key={i} className="text-[10px] flex items-center gap-1">
                                <div className="w-1 h-1 bg-red-400 rounded-full" />
                                {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Market Value Card */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-600 p-2 rounded text-white">
                        <IndianRupee className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-green-700 opacity-70 tracking-widest">Estimated Market Value</p>
                        <p className="text-xl font-bold text-green-900">{result.estimatedMarketValue}</p>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-2">
                        <Tag className="w-3 h-3" /> Recycling Methods
                      </h4>
                      <ul className="space-y-2">
                        {result.recyclingMethods.map((m, i) => (
                          <li key={i} className="text-xs flex items-start gap-2">
                            <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5" />
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-2">
                        <Share2 className="w-3 h-3" /> Reuse Suggestions
                      </h4>
                      <ul className="space-y-2">
                        {result.reuseSuggestions.map((s, i) => (
                          <li key={i} className="text-xs flex items-start gap-2">
                            <CheckCircle2 className="w-3 h-3 text-blue-500 mt-0.5" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Seller Inputs */}
                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Listing Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="quantity" className="text-[10px] font-bold uppercase opacity-70">Quantity</Label>
                        <Input 
                          id="quantity" 
                          value={userQuantity} 
                          onChange={(e) => setUserQuantity(e.target.value)}
                          placeholder="e.g. 500 kg"
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="price" className="text-[10px] font-bold uppercase opacity-70">Min Price (₹)</Label>
                        <Input 
                          id="price" 
                          type="number"
                          value={userMinPrice} 
                          onChange={(e) => setUserMinPrice(e.target.value)}
                          placeholder="e.g. 15000"
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Marketplace Suggestions */}
                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Suggested Recovery Partners</h4>
                    <div className="grid grid-cols-1 gap-4">
                      {getMarketplaceSuggestions(result.wasteType).map((market) => (
                        <div
                          key={market.name}
                          className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{market.name}</h5>
                              <p className="text-[10px] text-slate-500 font-medium">{market.location} • {market.type}</p>
                            </div>
                            <div className="bg-white px-2 py-1 rounded border border-slate-200 text-[10px] font-bold text-amber-600">
                              ★ {market.rating}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                            <div>
                              <p className="text-[9px] font-bold uppercase text-slate-400">Specialization</p>
                              <p className="text-[10px] font-medium text-slate-700">{market.specialization}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold uppercase text-slate-400">Daily Capacity</p>
                              <p className="text-[10px] font-medium text-slate-700">{market.capacity}</p>
                            </div>
                          </div>
                          
                          <div className="pt-2 flex items-center gap-2 text-[10px] font-mono font-bold text-blue-600">
                            <Building2 className="w-3 h-3" />
                            {market.contact}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    {isPosted ? (
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-green-600 text-white p-4 rounded-lg flex items-center justify-center gap-3 shadow-lg"
                      >
                        <CheckCircle2 className="w-6 h-6" />
                        <span className="font-bold uppercase tracking-widest text-xs">Successfully Posted to Marketplace</span>
                      </motion.div>
                    ) : (
                      <Button 
                        onClick={handlePostToMarketplace}
                        disabled={loading}
                        className="w-full bg-[var(--ink)] hover:bg-slate-800 text-white font-mono uppercase text-xs font-bold tracking-[0.2em] py-6 shadow-lg"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sell to Marketplace'}
                      </Button>
                    )}
                    <p className="text-[10px] text-center text-slate-400 mt-3 uppercase tracking-widest">
                      Notify matching {result.wasteType.toLowerCase()} recyclers in Tamil Nadu
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </div>
);
};
