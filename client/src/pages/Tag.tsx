import { useRoute, Link } from 'wouter';
import { useListPosts } from '@/api';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function TagPage() {
  const [, params] = useRoute('/tags/:slug');
  const slug = params?.slug || '';

  const { data: postsData, isLoading } = useListPosts(
    { tag: slug, status: 'published' },
    { query: { enabled: !!slug, queryKey: ['/api/posts', { tag: slug, status: 'published' }] } }
  );

  return (
    <div className="max-w-2xl mx-auto py-12 animate-in fade-in">
      <header className="mb-16 border-b border-border pb-8">
        <Link href="/home" className="text-muted-foreground hover:text-foreground text-sm mb-6 inline-block transition-colors">
          &larr; Back home
        </Link>
        <h1 className="text-3xl font-serif text-foreground">
          Notes on <span className="text-primary italic">&quot;{slug.replace(/-/g, ' ')}&quot;</span>
        </h1>
      </header>

      <div className="space-y-16">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))
        ) : postsData?.posts.length === 0 ? (
          <p className="text-muted-foreground italic font-serif">No writings found for this topic.</p>
        ) : (
          postsData?.posts.map((post) => (
            <article key={post.id} className="group">
              <Link href={`/posts/${post.slug}`} className="block">
                <div className="mb-2 text-sm text-muted-foreground">
                  <time dateTime={post.publishedAt || post.createdAt}>
                    {format(new Date(post.publishedAt || post.createdAt), 'MMMM d, yyyy')}
                  </time>
                </div>
                <h3 className="text-2xl font-serif text-foreground group-hover:text-primary transition-colors mb-3">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-muted-foreground leading-relaxed">
                    {post.excerpt}
                  </p>
                )}
              </Link>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
