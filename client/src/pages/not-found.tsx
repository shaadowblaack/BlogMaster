import { Link } from 'wouter';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 animate-in fade-in">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-muted-foreground" />
      </div>
      <h1 className="text-4xl font-serif text-foreground mb-4">Page not found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="inline-flex items-center justify-center border border-border px-6 py-3 text-sm font-medium hover:bg-secondary transition-colors">
        Return home
      </Link>
    </div>
  );
}
