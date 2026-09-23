import { ReactNode, useState } from 'react';
import { Link } from 'wouter';
import { useGetProfile } from '@/api';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { User, LogOut, KeyRound, ChevronDown, LogIn, UserPlus } from 'lucide-react';

export function PublicLayout({ children }: { children: ReactNode }) {
  const { data: profile } = useGetProfile();
  const { user, logout } = useUserAuth();
  const { theme, setTheme } = useTheme();
  const [showAuth, setShowAuth] = useState<'login' | 'register' | null>(null);
  const [showChangePass, setShowChangePass] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const name = profile?.name || 'BLOG';

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* ── Header / HUD ── */}
      <header
        className="border-b-2 border-primary px-6 md:px-12 py-4 flex items-center justify-between gap-4"
        style={{ boxShadow: '0 4px 0 hsl(var(--primary) / 0.2)' }}
      >
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-3 no-underline group shrink-0">
          <div
            className="w-10 h-10 flex items-center justify-center text-sm font-pixel text-primary-foreground bg-primary group-hover:bg-accent group-hover:text-accent-foreground transition-colors"
            style={{ boxShadow: 'var(--px-shadow-sm)' }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <span className="font-pixel text-[12px] md:text-sm text-primary tracking-wider leading-tight cursor-blink hidden sm:block">
            {name.toUpperCase()}
          </span>
        </Link>

        {/* Right side controls */}
        <div className="flex items-center gap-3">

          {/* Theme toggle */}
          <div className="flex border-2 border-border overflow-hidden"
            style={{ boxShadow: 'var(--px-shadow-sm)' }}>
            <button
              onClick={() => setTheme('tokyo')}
              title="Tokyo Night Storm"
              className={`px-2 py-1 font-pixel text-[10px] transition-colors ${theme === 'tokyo'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-primary'
                }`}
            >⚡</button>
            <button
              onClick={() => setTheme('coffee')}
              title="Coffee"
              className={`px-2 py-1 font-pixel text-[10px] border-l-2 border-border transition-colors ${theme === 'coffee'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-primary'
                }`}
            >☕</button>
          </div>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                className="flex items-center gap-2 font-pixel text-[11px] text-primary border-2 border-primary px-3 py-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                style={{ boxShadow: 'var(--px-shadow-sm)' }}
              >
                <User className="w-3 h-3" />
                <span className="hidden sm:inline">{(user.displayName || user.username).toUpperCase()}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showUserMenu && (
                <>
                  {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                  <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />
                  <div
                    className="absolute right-0 top-full mt-1 z-40 bg-card border-2 border-primary min-w-[190px]"
                    style={{ boxShadow: 'var(--px-shadow-lg)' }}
                  >
                    <button
                      onClick={() => { setShowUserMenu(false); setShowChangePass(true); }}
                      className="w-full flex items-center gap-2 px-4 py-3 font-pixel text-[10px] text-muted-foreground hover:text-primary hover:bg-secondary transition-colors text-left"
                    >
                      <KeyRound className="w-3 h-3" /> CHANGE PASSWORD
                    </button>
                    <button
                      onClick={() => { setShowUserMenu(false); logout(); }}
                      className="w-full flex items-center gap-2 px-4 py-3 font-pixel text-[10px] text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors text-left border-t-2 border-border"
                    >
                      <LogOut className="w-3 h-3" /> SIGN OUT
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAuth('login')}
                title="Sign in"
                aria-label="Sign in"
                className="flex items-center gap-2 p-2 sm:px-1 sm:py-2 font-pixel text-[11px] text-muted-foreground hover:text-primary transition-colors"
              >
                <LogIn className="w-4 h-4 sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">SIGN IN</span>
              </button>
              <button
                onClick={() => setShowAuth('register')}
                title="Sign up"
                aria-label="Sign up"
                className="flex items-center gap-2 font-pixel text-[11px] text-primary-foreground bg-primary p-2 sm:px-3 sm:py-2 pixel-btn"
              >
                <UserPlus className="w-4 h-4 sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">SIGN UP</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 px-6 md:px-12 lg:px-20 py-10 max-w-5xl mx-auto w-full">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t-2 border-border px-6 md:px-12 py-6 mt-8">
        <div className=" mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-pixel text-[10px] text-muted-foreground">
          <span> Thoughts of Shade © {new Date().getFullYear()} {name.toUpperCase()}</span>
          <div className="flex gap-6">
            {profile?.twitterUrl && (
              <a href={profile.twitterUrl} target="_blank" rel="noreferrer"
                className="hover:text-primary transition-colors">TWITTER</a>
            )}
            {profile?.githubUrl && (
              <a href={profile.githubUrl} target="_blank" rel="noreferrer"
                className="hover:text-primary transition-colors">GITHUB</a>
            )}
            {profile?.websiteUrl && (
              <a href={profile.websiteUrl} target="_blank" rel="noreferrer"
                className="hover:text-primary transition-colors">WEBSITE</a>
            )}
          </div>
        </div>
      </footer>

      {showAuth && (
        <AuthModal initialTab={showAuth} onClose={() => setShowAuth(null)} onSuccess={() => setShowAuth(null)} />
      )}
      {showChangePass && (
        <AuthModal changePassword onClose={() => setShowChangePass(false)} onSuccess={() => setShowChangePass(false)} />
      )}
    </div>
  );
}
