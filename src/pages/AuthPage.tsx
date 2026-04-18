import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().trim().email({ message: 'Invalid email' }).max(320);
const passwordSchema = z.string().min(6, { message: 'Password must be at least 6 characters' }).max(72);
const nameSchema = z.string().trim().min(1, { message: 'Name is required' }).max(100);

export default function AuthPage() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState<'signin' | 'signup'>(params.get('mode') === 'signup' ? 'signup' : 'signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) navigate('/account', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const safeEmail = emailSchema.parse(email);
      const safePassword = passwordSchema.parse(password);
      if (mode === 'signup') nameSchema.parse(name);

      setLoading(true);
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: safeEmail,
          password: safePassword,
          options: {
            emailRedirectTo: `${window.location.origin}/account`,
            data: { full_name: name.trim() },
          },
        });
        if (error) throw error;
        toast({ title: 'Account created', description: 'You are now signed in.' });
        navigate('/account', { replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: safeEmail,
          password: safePassword,
        });
        if (error) throw error;
        navigate('/account', { replace: true });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      toast({ title: 'Authentication failed', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: `${window.location.origin}/account`,
    });
    if (result.error) {
      toast({ title: 'Google sign-in failed', description: String(result.error), variant: 'destructive' });
      setLoading(false);
    }
  };

  return (
    <div className="container-page py-16 max-w-md mx-auto">
      <h1 className="section-heading text-center mb-2">
        {mode === 'signup' ? 'Create your account' : 'Welcome back'}
      </h1>
      <p className="text-center text-muted-foreground mb-8 text-sm">
        {mode === 'signup' ? 'Save addresses, track orders, redownload digital files.' : 'Sign in to view your orders & downloads.'}
      </p>

      <div className="product-card space-y-4">
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="btn-outline w-full text-sm disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center"><span className="bg-card px-3 text-xs text-muted-foreground">or with email</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <input
              required
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-md text-sm bg-background text-foreground"
            />
          )}
          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-md text-sm bg-background text-foreground"
          />
          <input
            type="password"
            required
            placeholder="Password (6+ characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-md text-sm bg-background text-foreground"
          />
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? 'Please wait…' : mode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')} className="text-primary hover:underline">
            {mode === 'signup' ? 'Sign in' : 'Create one'}
          </button>
        </p>

        <p className="text-center">
          <Link to="/checkout" className="text-xs text-muted-foreground hover:text-foreground">
            Continue as guest →
          </Link>
        </p>
      </div>
    </div>
  );
}
