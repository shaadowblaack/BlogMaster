import { useState, FormEvent } from 'react';
import { useLocation } from 'wouter';
import { Eye, EyeOff } from 'lucide-react';
import { customFetch, ApiError } from '@/api/custom-fetch';

interface AdminLoginProps {
  onSuccess?: () => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
       await customFetch<unknown>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      if (onSuccess) onSuccess();
      else navigate('/dashboard');
    } catch (err) {
      const errorData = (err as ApiError)?.data as { error?: string } | null;
      setError(errorData?.error ?? 'ACCESS DENIED');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">

        {/* ── Title card ── */}
        <div className="text-center space-y-4">
          <div className="font-pixel text-[11px] text-muted-foreground tracking-widest">
            ══════════════════
          </div>
          <h1 className="font-pixel text-sm md:text-base text-primary text-glow leading-loose">
            WRITER&apos;S<br />TERMINAL
          </h1>
          <div className="font-pixel text-[11px] text-muted-foreground">
            v1.0.0 — ADMIN ACCESS REQUIRED
          </div>
          <div className="font-pixel text-[11px] text-muted-foreground tracking-widest">
            ══════════════════
          </div>
        </div>

        {/* ── Login form ── */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="username" className="block font-pixel text-[11px] text-primary">
              USERNAME:
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              className="w-full bg-card border-2 border-border focus:border-primary outline-none px-3 py-2 font-vt text-xl text-foreground transition-colors"
              style={{ boxShadow: '3px 3px 0 hsl(232 30% 22%)' }}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block font-pixel text-[11px] text-primary">
              PASSWORD:
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-card border-2 border-border focus:border-primary outline-none px-3 py-2 pr-10 font-vt text-xl text-foreground transition-colors"
                style={{ boxShadow: '3px 3px 0 hsl(232 30% 22%)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="border-2 border-destructive px-3 py-2 font-pixel text-[11px] text-destructive"
              style={{ boxShadow: '3px 3px 0 hsl(355 90% 45% / 0.5)' }}
            >
              ✕ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-pixel text-[12px] text-primary-foreground bg-primary py-3 px-4 disabled:opacity-60 disabled:cursor-not-allowed pixel-btn"
          >
            {loading ? '[ AUTHENTICATING... ]' : '▶ INSERT COIN TO CONTINUE'}
          </button>
        </form>

        <div className="text-center font-pixel text-[10px] text-muted-foreground">
          © {new Date().getFullYear()} — PRIVATE TERMINAL
        </div>
      </div>
    </div>
  );
}
