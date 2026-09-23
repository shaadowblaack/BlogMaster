import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { UserAuthProvider } from '@/contexts/UserAuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { AmbientParticles } from '@/components/ui/AmbientParticles';

import Welcome from '@/pages/Welcome';
import Home from '@/pages/Home';
import Post from '@/pages/Post';
import TagPage from '@/pages/Tag';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/dashboard/Dashboard';
import Posts from '@/pages/dashboard/Posts';
import PostEditor from '@/pages/dashboard/PostEditor';
import Profile from '@/pages/dashboard/Profile';
import AdminLogin from '@/pages/AdminLogin';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function PublicRoutes() {
  return (
    <PublicLayout>
      <Switch>
        <Route path="/" component={Welcome} />
        <Route path="/home" component={Home} />
        <Route path="/posts/:slug" component={Post} />
        <Route path="/tags/:slug" component={TagPage} />
        <Route component={NotFound} />
      </Switch>
    </PublicLayout>
  );
}

function DashboardRoutes() {
  return (
    <AdminGuard>
      <DashboardLayout>
        <Switch>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/dashboard/posts" component={Posts} />
          <Route path="/dashboard/posts/new" component={PostEditor} />
          <Route path="/dashboard/posts/:id/edit" component={PostEditor} />
          <Route path="/dashboard/profile" component={Profile} />
          <Route component={NotFound} />
        </Switch>
      </DashboardLayout>
    </AdminGuard>
  );
}

function Router() {
  return (

    <Switch>

      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/writers-den">{() => <AdminLogin />}</Route>
      <Route path="/dashboard/*" component={DashboardRoutes} />
      <Route path="/dashboard" component={DashboardRoutes} />
      <Route path="/*" component={PublicRoutes} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AmbientParticles />
        <UserAuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </UserAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
