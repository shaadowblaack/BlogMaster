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
          postsData?.posts.map((post, idx) => (
            <Link key={post.id} href={`/posts/${post.slug}`} className="block no-underline group">
              <article
                className="border-2 border-border p-5 transition-all duration-100 group-hover:border-primary"
                style={{ boxShadow: '3px 3px 0 hsl(232 30% 22%)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '5px 5px 0 hsl(191 100% 50% / 0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '3px 3px 0 hsl(232 30% 22%)';
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-pixel text-[11px] text-primary">{String(idx + 1).padStart(2, '0')}.</span>
                    {post.tags && post.tags.length > 0 && (
                      <span
                        className="font-pixel text-[10px] px-2 py-1 text-accent-foreground bg-accent"
                        style={{ boxShadow: '2px 2px 0 hsl(51 100% 35%)' }}
                      >
                        {post.tags[0].name.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <time className="font-pixel text-[10px] text-muted-foreground"
                    dateTime={post.publishedAt || post.createdAt}>
                    {format(new Date(post.publishedAt || post.createdAt), 'yyyy.MM.dd')}
                  </time>
                </div>

                <h3 className="font-pixel text-[10px] md:text-xs text-foreground group-hover:text-primary transition-colors leading-loose mb-3">
                  {post.title.toUpperCase()}
                </h3>

                {post.excerpt && (
                  <p className="font-vt text-lg text-muted-foreground leading-snug">
                    {post.excerpt}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <span className="font-pixel text-[10px] text-primary group-hover:text-glow">
                    ▶ READ QUEST
                  </span>
                </div>
              </article>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
