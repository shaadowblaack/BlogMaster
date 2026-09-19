import { useRoute, Link } from 'wouter';
import { useGetPostBySlug, useGetProfile } from '@/api';
import { format } from 'date-fns';
import { resolveImageUrl } from '@/lib/image-url';
import { CommentSection } from '@/components/comments/CommentSection';

export default function Post() {
  const [, params] = useRoute('/posts/:slug');
  const slug = params?.slug || '';

  const { data: post, isLoading, isError } = useGetPostBySlug(slug, {
    query: { enabled: !!slug, queryKey: ['/api/posts/slug', slug] },
  });
  const { data: profile } = useGetProfile();

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-20 space-y-8 text-center">
        <div className="font-pixel text-[10px] text-primary text-glow cursor-blink">
          LOADING STORY
        </div>
        <div className="w-full h-2 bg-secondary border border-border overflow-hidden">
          <div className="h-full bg-primary animate-pulse" style={{ width: '66%' }} />
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center space-y-6">
        <div className="font-pixel text-2xl text-destructive">404</div>
        <h1 className="font-pixel text-[10px] text-foreground">QUEST NOT FOUND</h1>
        <p className="font-vt text-xl text-muted-foreground">
          This story doesn&apos;t exist in the archive.
        </p>
        <Link href="/home"
          className="inline-block font-pixel text-[11px] text-primary-foreground bg-primary px-4 py-3 no-underline pixel-btn mt-4">
          ◀ RETURN TO BASE
        </Link>
      </div>
    );
  }

  const coverUrl = resolveImageUrl(post.coverImageUrl);

  return (
    <article className="max-w-2xl mx-auto py-8">

      {/* ── Status bar ── */}
      <div className="flex items-center justify-between mb-8 font-pixel text-[10px] text-muted-foreground">
        <Link href="/home" className="text-primary hover:text-accent transition-colors no-underline">
          ◀ QUEST LOG
        </Link>
        <span className="text-primary">[ STORY MODE ]</span>
      </div>

      {/* ── Tags / skill badges ── */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.map(tag => (
            <Link key={tag.id} href={`/tags/${tag.slug}`} className="no-underline">
              <span
                className="font-pixel text-[10px] px-2 py-1 bg-accent text-accent-foreground"
                style={{ boxShadow: '2px 2px 0 hsl(51 100% 35%)' }}
              >
                {tag.name.toUpperCase()}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* ── Title ── */}
      <h1 className="font-pixel text-sm md:text-base text-foreground leading-loose mb-6">
        {post.title.toUpperCase()}
      </h1>

      {/* ── Meta stats ── */}
      <div
        className="border-2 border-border p-4 mb-8 flex flex-wrap gap-6"
        style={{ boxShadow: '3px 3px 0 hsl(232 30% 22%)' }}
      >
        <div className="font-pixel text-[11px] text-muted-foreground">
          AUTHOR: <span className="text-primary">{(profile?.name || 'UNKNOWN').toUpperCase()}</span>
        </div>
        <div className="font-pixel text-[11px] text-muted-foreground">
          DATE:{' '}
          <span className="text-primary">
            {format(new Date(post.publishedAt || post.createdAt), 'yyyy.MM.dd')}
          </span>
        </div>
        {post.viewCount !== undefined && (
          <div className="font-pixel text-[11px] text-muted-foreground">
            EXP GAINED: <span className="text-accent">+{post.viewCount}</span>
          </div>
        )}
      </div>

      {/* ── Cover image ── */}
      {coverUrl && (
        <figure className="mb-10 pixel-box overflow-hidden">
          <img
            src={coverUrl}
            alt={post.title}
            className="w-full h-auto object-cover"
            style={{ imageRendering: 'auto' }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        </figure>
      )}

      {/* ── Content ── */}
      <div
        className="border-l-2 border-primary pl-6 mb-12"
        style={{ borderLeftStyle: 'solid' }}
      >
        <div
          className="font-vt text-xl text-foreground leading-relaxed"
          style={{ lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }}
        />
      </div>

      {/* ── Quest complete ── */}
      <div
        className="pixel-box p-6 text-center space-y-4 mb-16"
        style={{ background: 'linear-gradient(135deg, hsl(232 42% 10%) 0%, hsl(232 42% 7%) 100%)' }}
      >
        <div className="font-pixel text-[10px] text-accent text-glow-accent">
          ★ QUEST COMPLETE ★
        </div>
        <p className="font-vt text-xl text-muted-foreground">
          You finished the story. +{post.viewCount ?? 1} EXP earned.
        </p>
        <Link
          href="/home"
          className="inline-block font-pixel text-[11px] text-primary-foreground bg-primary px-4 py-3 no-underline pixel-btn mt-2"
        >
          ▶ NEXT QUEST
        </Link>
      </div>

      {/* ── Reactions + Comments ── */}
      <CommentSection postId={post.id} />
    </article>
  );
}
