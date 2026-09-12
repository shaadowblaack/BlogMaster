import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { useGetProfile } from '@/api';
import { AuthModal } from '@/components/auth/AuthModal';

const LINES = [
  'Welcome, traveller.',
  'This is a place of ideas.',
  'Stories live here.',
  'Ready to explore?',
];

export default function Welcome() {
  const [, navigate] = useLocation();
  const { user, loading } = useUserAuth();
  const { data: profile } = useGetProfile();
  const [showModal, setShowModal] = useState<'login' | 'register' | null>(null);
  const [displayText, setDisplayText] = useState('');
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [done, setDone] = useState(false);

  // Typewriter effect
  useEffect(() => {
    if (done) return;
    const line = LINES[lineIdx];
    if (charIdx < line.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), 45);
      return () => clearTimeout(t);
    }
    if (lineIdx < LINES.length - 1) {
      const t = setTimeout(() => {
        setDisplayText((prev) => prev + line + '\n');
        setLineIdx((i) => i + 1);
        setCharIdx(0);
      }, 700);
      return () => clearTimeout(t);
    }
    setDisplayText((prev) => prev + line);
    setDone(true);
  }, [charIdx, lineIdx, done]);

  const currentLine = done ? '' : LINES[lineIdx].slice(0, charIdx);
  const fullText = displayText + currentLine;

  function enter() {
    navigate('/home');
  }

  if (loading) return null;

  return (
    <div
      className="min-h-fit bg-background flex flex-col items-center justify-center px-6 text-center"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 50% 40%, hsl(191 100% 50% / 0.06) 0%, transparent 70%)',
      }}
    >
      {/* Pixel decorative header */}
      <div className="mb-8 font-pixel text-[11px] text-muted-foreground tracking-widest animate-pulse">
        ▓▓▓ THOUGHTS OF SHADE ▓▓▓
      </div>

      {/* Blog name */}
      <h1
        className="font-pixel text-2xl md:text-4xl text-primary text-glow mb-10 leading-loose"
        style={{ letterSpacing: '0.1em' }}
      >
        {(profile?.name || 'THE BLOG').toUpperCase()}
      </h1>

      {/* Typewriter terminal box */}
      <div
        className="w-full max-w-lg pixel-box p-6 mb-10 text-left font-vt text-xl text-foreground min-h-[12rem]"
        style={{ background: 'hsl(232 42% 8%)' }}
      >
        <span className="text-muted-foreground select-none">$ </span>
        {fullText.split('\n').map((line, i, arr) => (
          <span key={i}>
            {line}
            {i < arr.length - 1 && <br />}
          </span>
        ))}
        {!done && (
          <span className="inline-block w-2 h-4 bg-primary align-middle ml-1 animate-pulse" />
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {user ? (
          <>
            <div className="font-pixel text-[11px] text-primary mb-2 text-center w-full">
              WELCOME BACK, {(user.displayName || user.username).toUpperCase()}!
            </div>
            <button
              onClick={enter}
              className="flex-1 font-pixel text-[12px] text-primary-foreground bg-primary py-4 px-4 pixel-btn"
            >
              ▶ ENTER
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setShowModal('register')}
              className="flex-1 font-pixel text-[11px] text-primary-foreground bg-primary py-4 px-3 pixel-btn"
            >
              ✦ CREATE ACCOUNT
            </button>
            <button
              onClick={() => setShowModal('login')}
              className="flex-1 font-pixel text-[11px] text-foreground py-4 px-3 border-2 border-border hover:border-primary transition-colors"
              style={{ boxShadow: '3px 3px 0 hsl(232 30% 22%)' }}
            >
              ▶ SIGN IN
            </button>
            <button
              onClick={enter}
              className="flex-1 font-pixel text-[11px] text-muted-foreground py-4 px-3 hover:text-foreground transition-colors"
            >
              ◌ GUEST
            </button>
          </>
        )}
      </div>

      {!user && (
        <p className="font-vt text-lg text-muted-foreground mt-6">
          Guests can read and comment without an account.
        </p>
      )}

      {showModal && (
        <AuthModal
          initialTab={showModal}
          onClose={() => setShowModal(null)}
          onSuccess={() => {
            setShowModal(null);
            enter();
          }}
        />
      )}
    </div>
  );
}
