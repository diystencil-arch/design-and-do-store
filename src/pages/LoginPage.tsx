import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <div className="container-page py-20 max-w-md mx-auto">
      <h1 className="section-heading text-center mb-8">
        {isRegister ? 'Create an account' : 'Welcome back'}
      </h1>

      <div className="product-card space-y-4">
        {isRegister && (
          <input
            placeholder="Full name"
            className="w-full px-4 py-3 border border-border rounded-md text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        )}
        <input
          type="email"
          placeholder="Email address"
          className="w-full px-4 py-3 border border-border rounded-md text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-3 border border-border rounded-md text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button className="btn-primary w-full">
          {isRegister ? 'Create Account' : 'Sign In'}
        </button>

        <div className="relative py-3">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center"><span className="bg-card px-3 text-xs text-muted-foreground">or</span></div>
        </div>

        <button className="btn-outline w-full text-sm">
          Continue with Google
        </button>

        <p className="text-center text-sm text-muted-foreground">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsRegister(!isRegister)} className="text-accent hover:underline">
            {isRegister ? 'Sign in' : 'Create one'}
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
