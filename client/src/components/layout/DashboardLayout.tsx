import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { FileText, Settings, LayoutDashboard, ArrowLeft, PenTool, LogOut, Zap } from 'lucide-react';
import { useGetProfile } from '@/api';
import { useQueryClient } from '@tanstack/react-query';
import { customFetch } from '@/api/custom-fetch';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const { data: profile } = useGetProfile();
  const queryClient = useQueryClient();

  const navItems = [
    { href: '/dashboard',            label: 'HQ',        icon: LayoutDashboard },
    { href: '/dashboard/posts',      label: 'QUESTS',    icon: FileText },
    { href: '/dashboard/posts/new',  label: 'NEW QUEST', icon: PenTool },
    { href: '/dashboard/profile',    label: 'SETTINGS',  icon: Settings },
  ];

  async function handleLogout() {
    await customFetch('/api/auth/logout', { method: 'POST' });
    queryClient.clear();
    navigate('/');
    window.location.reload();
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">

      {/* ── Sidebar / command panel ── */}
      <aside
        className="w-full md:w-60 border-r-2 border-primary md:min-h-[100dvh] p-5 flex flex-col"
        style={{ boxShadow: '4px 0 0 hsl(191 100% 50% / 0.15)' }}
      >
        {/* back to public */}
        <Link
          href="/"
          className="flex items-center gap-2 font-pixel text-[10px] text-muted-foreground hover:text-primary transition-colors mb-8 no-underline"
        >
          <ArrowLeft className="w-3 h-3" /> EXIT TO BLOG
        </Link>

        {/* identity */}
        <div
          className="border-2 border-primary p-3 mb-8"
          style={{ boxShadow: '4px 4px 0 hsl(191 100% 50% / 0.3)' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3 h-3 text-accent" />
            <span className="font-pixel text-[10px] text-accent">COMMAND CENTER</span>
          </div>
          <div className="font-pixel text-[11px] text-primary text-glow leading-loose">
            {(profile?.name || 'ADMIN').toUpperCase()}
          </div>
          <div className="font-pixel text-[10px] text-muted-foreground mt-1">
            ROLE: <span className="text-accent">ADMIN LVL 99</span>
          </div>
        </div>

        {/* nav */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive =
              location === item.href ||
              (item.href !== '/dashboard' && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 font-pixel text-[10px] transition-all no-underline ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-primary hover:bg-secondary'
                }`}
                style={isActive ? { boxShadow: '3px 3px 0 hsl(191 100% 35%)' } : {}}
              >
                <item.icon className="w-3 h-3 shrink-0" />
                {isActive && <span className="text-[11px]">▶ </span>}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 font-pixel text-[10px] text-muted-foreground hover:text-destructive transition-colors w-full mt-4 border-t-2 border-border pt-4"
        >
          <LogOut className="w-3 h-3" />
          LOGOUT
        </button>
      </aside>

      {/* ── Main content area ── */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
