import { useState, FormEvent } from 'react';
import { useLocation, Link } from 'wouter';
import { Eye, EyeOff } from 'lucide-react';
import { customFetch, ApiError } from '@/api/custom-fetch';

export default function ResetPassword() {
  const [location] = useLocation();

  // Parse token from the query string manually (wouter doesn't expose search params)
  const token = new URLSearchParams(window.location.search).get('token') ?? '';

  const [, navigate] = useLocation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center space-y-6">
          <div className="font-pixel text-2xl text-destructive">!</div>
          <h1 className="font-pixel text-[10px] text-foreground leading-loose">
            INVALID LINK
          </h1>
          <p className="font-vt text-xl text-muted-foreground">
            This reset link is missing a token. Request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block font-pixel text-[11px] text-primary-foreground bg-primary px-4 py-3 no-underline pixel-btn"
          >
            ▶ REQUEST NEW LINK
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await customFetch<unknown>(
        '/api/users/reset-password',
        { method: 'POST', body: JSON.stringify({ token, newPassword }) },
      );
      setDone(true);
      setTimeout(() => navigate('/'), 2500);
    } catch (err) {
      const errorData = (err as ApiError)?.data as { error?: string } | null;
      setError(errorData?.error ?? 'Connection failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center space-y-6">
          <div className="font-pixel text-[10px] text-accent text-glow-accent leading-loose">
            ★ PASSWORD UPDATED ★
          </div>
          <p className="font-vt text-xl text-muted-foreground">
            Your password has been changed. Redirecting you home...
          </p>
          <div className="w-48 mx-auto h-2 bg-secondary border border-border overflow-hidden">
            <div className="h-full bg-primary animate-pulse w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">

        {/* Title */}
        <div className="text-center space-y-3">
          <div className="font-pixel text-[11px] text-muted-foreground tracking-widest">
            ══════════════════
          </div>
          <h1 className="font-pixel text-sm text-primary text-glow leading-loose">
            RESET<br />PASSWORD
          </h1>
          <div className="font-pixel text-[11px] text-muted-foreground tracking-widest">
            ══════════════════
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="font-vt text-xl text-muted-foreground text-center">
            Choose a new password for your account.
          </p>

          {/* New password */}
          <div className="space-y-2">
            <label htmlFor="new-password" className="block font-pixel text-[11px] text-primary">
              NEW PASSWORD:
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPass ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full bg-card border-2 border-border focus:border-primary outline-none px-3 py-2 pr-10 font-vt text-xl text-foreground transition-colors"
                style={{ boxShadow: '3px 3px 0 hsl(232 30% 22%)' }}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                tabIndex={-1}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <label htmlFor="confirm-password" className="block font-pixel text-[11px] text-primary">
              CONFIRM PASSWORD:
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full bg-card border-2 border-border focus:border-primary outline-none px-3 py-2 pr-10 font-vt text-xl text-foreground transition-colors"
                style={{ boxShadow: '3px 3px 0 hsl(232 30% 22%)' }}
              />
            </div>
          </div>

          {error && (
            <div
              className="border-2 border-destructive px-3 py-2 font-pixel text-[11px] text-destructive"
              style={{ boxShadow: '2px 2px 0 hsl(355 90% 45% / 0.4)' }}
            >
              ✕ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-pixel text-[12px] text-primary-foreground bg-primary py-3 px-4 disabled:opacity-60 pixel-btn"
          >
            {loading ? '[ SAVING... ]' : '▶ SET NEW PASSWORD'}
          </button>
        </form>
      </div>
    </div>
  );
}
