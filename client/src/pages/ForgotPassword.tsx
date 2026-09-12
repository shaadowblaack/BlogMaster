import { useState, FormEvent } from 'react';
import { Link } from 'wouter';
import { customFetch, ApiError } from '@/api/custom-fetch';

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setResetLink('');
    setLoading(true);
    try {
       const data = await customFetch<{ token?: string }>(
        '/api/users/forgot-password',
        { method: 'POST', body: JSON.stringify({ identifier: identifier.trim() }) },
      );
      if (data.token) {
        const url = `${window.location.origin}/reset-password?token=${data.token}`;
        setResetLink(url);
      } else {
        setResetLink('NOT_FOUND');
      }
    } catch (err) {
      const errorData = (err as ApiError)?.data as { error?: string } | null;
      setError(errorData?.error ?? 'Connection failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(resetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">

        <div className="text-center space-y-3">
          <div className="font-pixel text-[10px] text-muted-foreground tracking-widest">══════════════════</div>
          <h1 className="font-pixel text-base text-primary text-glow leading-loose">
            FORGOT<br />PASSWORD
          </h1>
          <div className="font-pixel text-[10px] text-muted-foreground tracking-widest">══════════════════</div>
        </div>

        {!resetLink ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="font-vt text-2xl text-muted-foreground text-center">
              Enter your username or email and we&apos;ll generate a reset link right here.
            </p>

            <div className="space-y-2">
              <label htmlFor="identifier" className="block font-pixel text-[10px] text-primary">
                USERNAME OR EMAIL:
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="username"
                className="w-full bg-card border-2 border-border focus:border-primary outline-none px-3 py-2 font-vt text-2xl text-foreground transition-colors"
                style={{ boxShadow: '3px 3px 0 hsl(var(--border))' }}
              />
            </div>

            {error && (
              <div className="border-2 border-destructive px-3 py-2 font-pixel text-[12px] text-destructive">
                ✕ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-pixel text-[10px] text-primary-foreground bg-primary py-3 px-4 disabled:opacity-60 pixel-btn"
            >
              {loading ? '[ GENERATING... ]' : '▶ GET RESET LINK'}
            </button>

            <div className="text-center">
              <Link href="/" className="font-pixel text-[12px] text-muted-foreground hover:text-primary transition-colors no-underline">
                ◀ BACK TO BLOG
              </Link>
            </div>
          </form>
        ) : resetLink === 'NOT_FOUND' ? (
          <div className="space-y-5 text-center">
            <div className="border-2 border-primary p-5" style={{ boxShadow: '4px 4px 0 hsl(var(--primary) / 0.4)' }}>
              <div className="font-pixel text-[10px] text-accent mb-3">✓ LINK GENERATED</div>
              <p className="font-vt text-2xl text-muted-foreground">
                If that account exists, a reset link has been prepared. Check your username or email and try again if needed.
              </p>
            </div>
            <Link href="/" className="font-pixel text-[12px] text-muted-foreground hover:text-primary transition-colors no-underline">◀ BACK TO BLOG</Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border-2 border-primary p-5 space-y-4" style={{ boxShadow: '4px 4px 0 hsl(var(--primary) / 0.4)' }}>
              <div className="font-pixel text-[10px] text-accent">✓ RESET LINK READY</div>
              <p className="font-vt text-2xl text-muted-foreground">
                Copy the link below and open it. It expires in <span className="text-primary">1 hour</span>.
              </p>
              <div
                className="bg-card border-2 border-border px-3 py-3 font-vt text-lg text-primary break-all select-all cursor-text"
                style={{ wordBreak: 'break-all' }}
              >
                {resetLink}
              </div>
              <button
                onClick={copyLink}
                className="w-full font-pixel text-[10px] text-primary-foreground bg-primary py-3 pixel-btn"
              >
                {copied ? '✓ COPIED!' : '▶ COPY LINK'}
              </button>
              <a
                href={resetLink}
                className="block w-full font-pixel text-[12px] text-center text-muted-foreground hover:text-primary transition-colors no-underline"
              >
                OR CLICK HERE TO OPEN →
              </a>
            </div>
            <div className="text-center">
              <Link href="/" className="font-pixel text-[12px] text-muted-foreground hover:text-primary transition-colors no-underline">◀ BACK TO BLOG</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
