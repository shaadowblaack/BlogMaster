import { useState, FormEvent } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useUserAuth } from '@/contexts/UserAuthContext';

interface AuthModalProps {
  initialTab?: 'login' | 'register';
  onClose: () => void;
  onSuccess?: () => void;
  /** If true, show a change-password form instead */
  changePassword?: boolean;
}

export function AuthModal({
  initialTab = 'login',
  onClose,
  onSuccess,
  changePassword = false,
}: AuthModalProps) {
  const { refresh } = useUserAuth();
  const [tab, setTab] = useState<'login' | 'register' | 'change'>(
    changePassword ? 'change' : initialTab,
  );
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  function resetForm() {
    setError('');
    setSuccess('');
    setUsername('');
    setDisplayName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setCurrentPassword('');
    setNewPassword('');
  }

  function switchTab(t: 'login' | 'register' | 'change') {
    resetForm();
    setTab(t);
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      await refresh();
      onSuccess?.();
    } catch {
      setError('Connection failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, displayName: displayName || username, email: email || undefined, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed'); return; }
      await refresh();
      onSuccess?.();
    } catch {
      setError('Connection failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to change password'); return; }
      setSuccess('Password changed successfully!');
      setTimeout(() => { if (onSuccess) onSuccess(); else onClose(); }, 1500);
    } catch {
      setError('Connection failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md pixel-box bg-background p-8 relative"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab bar */}
        {!changePassword && (
          <div className="flex mb-8 border-b-2 border-border">
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`font-pixel text-[11px] px-4 py-2 transition-colors ${
                  tab === t
                    ? 'text-primary border-b-2 border-primary -mb-[2px]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'login' ? 'SIGN IN' : 'SIGN UP'}
              </button>
            ))}
          </div>
        )}

        {changePassword && (
          <h2 className="font-pixel text-[10px] text-primary mb-8 leading-loose">
            CHANGE PASSWORD
          </h2>
        )}

        {/* ── LOGIN FORM ── */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <Field label="USERNAME" id="login-username">
              <Input id="login-username" type="text" value={username} onChange={setUsername} required autoComplete="username" />
            </Field>
            <Field label="PASSWORD" id="login-password">
              <PasswordInput value={password} onChange={setPassword} show={showPass} onToggle={() => setShowPass(v => !v)} id="login-password" autoComplete="current-password" />
            </Field>
            <ErrorBox msg={error} />
            <SubmitBtn loading={loading} label="▶ SIGN IN" />
            <div className="flex items-center justify-between flex-wrap gap-2">
              <button type="button" onClick={() => switchTab('register')}
                className="font-pixel text-[10px] text-muted-foreground hover:text-primary transition-colors">
                No account? SIGN UP →
              </button>
              <a href="/forgot-password"
                className="font-pixel text-[10px] text-muted-foreground hover:text-primary transition-colors no-underline">
                Forgot password?
              </a>
            </div>
          </form>
        )}

        {/* ── REGISTER FORM ── */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-5">
            <Field label="USERNAME *" id="reg-username">
              <Input id="reg-username" type="text" value={username} onChange={setUsername} required autoComplete="username" />
            </Field>
            <Field label="DISPLAY NAME" id="reg-display">
              <Input id="reg-display" type="text" value={displayName} onChange={setDisplayName} placeholder={username || 'How others see you'} />
            </Field>
            <Field label="EMAIL (OPTIONAL)" id="reg-email">
              <Input id="reg-email" type="email" value={email} onChange={setEmail} autoComplete="email" />
            </Field>
            <Field label="PASSWORD *" id="reg-password">
              <PasswordInput value={password} onChange={setPassword} show={showPass} onToggle={() => setShowPass(v => !v)} id="reg-password" autoComplete="new-password" />
            </Field>
            <Field label="CONFIRM PASSWORD *" id="reg-confirm">
              <PasswordInput value={confirmPassword} onChange={setConfirmPassword} show={showPass} onToggle={() => setShowPass(v => !v)} id="reg-confirm" autoComplete="new-password" />
            </Field>
            <ErrorBox msg={error} />
            <SubmitBtn loading={loading} label="✦ CREATE ACCOUNT" />
            <div className="text-center">
              <button type="button" onClick={() => switchTab('login')}
                className="font-pixel text-[10px] text-muted-foreground hover:text-primary transition-colors">
                Have an account? SIGN IN →
              </button>
            </div>
          </form>
        )}

        {/* ── CHANGE PASSWORD FORM ── */}
        {tab === 'change' && (
          <form onSubmit={handleChangePassword} className="space-y-5">
            <Field label="CURRENT PASSWORD" id="cp-current">
              <PasswordInput value={currentPassword} onChange={setCurrentPassword} show={showPass} onToggle={() => setShowPass(v => !v)} id="cp-current" autoComplete="current-password" />
            </Field>
            <Field label="NEW PASSWORD" id="cp-new">
              <PasswordInput value={newPassword} onChange={setNewPassword} show={showPass} onToggle={() => setShowPass(v => !v)} id="cp-new" autoComplete="new-password" />
            </Field>
            <Field label="CONFIRM NEW PASSWORD" id="cp-confirm">
              <PasswordInput value={confirmPassword} onChange={setConfirmPassword} show={showPass} onToggle={() => setShowPass(v => !v)} id="cp-confirm" autoComplete="new-password" />
            </Field>
            <ErrorBox msg={error} />
            {success && (
              <div className="border-2 border-primary px-3 py-2 font-pixel text-[11px] text-primary">
                ✓ {success}
              </div>
            )}
            <SubmitBtn loading={loading} label="▶ UPDATE PASSWORD" />
          </form>
        )}
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block font-pixel text-[10px] text-primary">{label}</label>
      {children}
    </div>
  );
}

function Input({
  id, type, value, onChange, required, autoComplete, placeholder,
}: {
  id: string; type: string; value: string;
  onChange: (v: string) => void; required?: boolean;
  autoComplete?: string; placeholder?: string;
}) {
  return (
    <input
      id={id} type={type} value={value} required={required}
      autoComplete={autoComplete} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-card border-2 border-border focus:border-primary outline-none px-3 py-2 font-vt text-xl text-foreground transition-colors"
      style={{ boxShadow: '3px 3px 0 hsl(232 30% 22%)' }}
    />
  );
}

function PasswordInput({
  id, value, onChange, show, onToggle, autoComplete,
}: {
  id: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void; autoComplete?: string;
}) {
  return (
    <div className="relative">
      <input
        id={id} type={show ? 'text' : 'password'} value={value}
        autoComplete={autoComplete} required
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-card border-2 border-border focus:border-primary outline-none px-3 py-2 pr-10 font-vt text-xl text-foreground transition-colors"
        style={{ boxShadow: '3px 3px 0 hsl(232 30% 22%)' }}
      />
      <button type="button" onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
        tabIndex={-1}>
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div className="border-2 border-destructive px-3 py-2 font-pixel text-[10px] text-destructive"
      style={{ boxShadow: '2px 2px 0 hsl(355 90% 45% / 0.4)' }}>
      ✕ {msg}
    </div>
  );
}

function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full font-pixel text-[11px] text-primary-foreground bg-primary py-3 px-4 disabled:opacity-60 pixel-btn">
      {loading ? '[ PROCESSING... ]' : label}
    </button>
  );
}
