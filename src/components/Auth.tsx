import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, LogIn, UserPlus, LogOut, Building2, User, Chrome } from 'lucide-react';

export const Auth: React.FC<{ onAuthChange: (user: any) => void }> = ({ onAuthChange }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<'Industry' | 'Household'>('Industry');
  const [location, setLocation] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        const userData = {
          uid: user.uid,
          name: user.displayName || 'Anonymous User',
          email: user.email || '',
          type: 'Industry',
          location: '',
          createdAt: serverTimestamp()
        };
        await setDoc(userDocRef, userData);
        onAuthChange({ ...user, ...userData });
      } else {
        onAuthChange({ ...user, ...userDoc.data() });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        onAuthChange({ ...userCredential.user, ...userDoc.data() });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        const userData = {
          uid: userCredential.user.uid,
          name,
          email,
          type,
          location,
          createdAt: serverTimestamp()
        };
        
        await setDoc(doc(db, 'users', userCredential.user.uid), userData);
        onAuthChange({ ...userCredential.user, ...userData });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-[var(--line)] shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-[var(--ink)] rounded-xl flex items-center justify-center shadow-lg transform -rotate-6">
              {isLogin ? <LogIn className="text-white w-6 h-6" /> : <UserPlus className="text-white w-6 h-6" />}
            </div>
          </div>
          <CardTitle className="text-2xl font-black tracking-tighter uppercase italic">
            {isLogin ? 'Welcome Back' : 'Join EcoLoop'}
          </CardTitle>
          <CardDescription className="text-xs font-mono uppercase tracking-widest opacity-50">
            {isLogin ? 'Access your industrial recovery dashboard' : 'Start your circular economy journey'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Industry / User Name</Label>
                  <Input 
                    required 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="e.g. TVS Industrial Park"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">User Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button"
                      onClick={() => setType('Industry')}
                      className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-all ${type === 'Industry' ? 'border-[var(--ink)] bg-slate-50' : 'border-slate-200 opacity-50'}`}
                    >
                      <Building2 className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase">Industry</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setType('Household')}
                      className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-all ${type === 'Household' ? 'border-[var(--ink)] bg-slate-50' : 'border-slate-200 opacity-50'}`}
                    >
                      <User className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase">Household</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Location</Label>
                  <Input 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                    placeholder="e.g. Hosur, TN"
                    className="h-11"
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Email Address</Label>
              <Input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="name@industry.com"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest opacity-50">Password</Label>
              <Input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                className="h-11"
              />
            </div>

            {error && (
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest bg-red-50 p-2 rounded border border-red-100">
                {error}
              </p>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-[var(--ink)] hover:bg-slate-800 text-white font-mono uppercase text-xs font-bold tracking-[0.2em] shadow-lg"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200"></span>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                <span className="bg-white px-2 text-slate-400">Or continue with</span>
              </div>
            </div>

            <Button 
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-12 border-slate-200 hover:bg-slate-50 font-mono uppercase text-xs font-bold tracking-[0.2em]"
            >
              <Chrome className="w-4 h-4 mr-2" /> Google
            </Button>

            <div className="text-center pt-2">
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-[var(--ink)] transition-colors"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
