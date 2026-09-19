import { Link } from 'wouter';
import { useGetProfile, useGetRecentPosts, useListTags } from '@/api';
import { format } from 'date-fns';

function PixelSkeleton({ className }: { className?: string }) {
  return <div className={`bg-secondary animate-pulse ${className}`} />;
}

export default function Home() {
  const { data: profile, isLoading: profileLoading } = useGetProfile();
  const { data: recentPosts, isLoading: postsLoading } = useGetRecentPosts({ limit: 10 });
  const { data: tags, isLoading: tagsLoading } = useListTags();

  return (
    <div className="space-y-12">

      {/* ── Hero / player card ── */}
      <section
        className="pixel-box p-6 md:p-8 relative"
        style={{ background: 'linear-gradient(135deg, hsl(232 42% 10%) 0%, hsl(232 42% 7%) 100%)' }}
      >
        {/* corner label */}
        <div className="absolute -top-3 left-4 bg-background px-2 font-pixel text-[11px] text-primary">
          PLAYER CARD
        </div>

        {profileLoading ? (
          <div className="space-y-4">
            <PixelSkeleton className="h-6 w-48" />
            <PixelSkeleton className="h-4 w-72" />
          </div>
        ) : (
          <div className="space-y-4">
            <h1 className="font-pixel text-base md:text-xl text-primary text-glow leading-loose">
              {profile?.name?.toUpperCase() || 'THE AUTHOR'}
            </h1>
            {profile?.bio && (
              <p className="font-vt text-xl text-muted-foreground max-w-2xl">
                {profile.bio}
              </p>
            )}
            <div className="flex items-center gap-6 pt-2">
              <div className="font-pixel text-[11px] text-muted-foreground">
                CLASS: <span className="text-accent">WRITER</span>
              </div>
              <div className="font-pixel text-[11px] text-muted-foreground">
                STATUS: <span className="text-primary">ACTIVE</span>
              </div>
              <div className="font-pixel text-[11px] text-muted-foreground">
                POSTS: <span className="text-accent">{recentPosts?.length ?? '...'}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

        {/* ── Quest log ── */}
        <section className="md:col-span-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="font-pixel text-[12px] text-primary">▶ QUEST LOG</div>
            <div className="flex-1 border-t-2 border-dashed border-border" />
          </div>

          <div className="space-y-6">
            {postsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="pixel-box-muted p-4 space-y-3">
                  <PixelSkeleton className="h-3 w-24" />
                  <PixelSkeleton className="h-5 w-full" />
                  <PixelSkeleton className="h-3 w-3/4" />
                </div>
              ))
            ) : recentPosts?.length === 0 ? (
              <div className="pixel-box-muted p-8 text-center">
                <p className="font-pixel text-[12px] text-muted-foreground">
                  NO QUESTS AVAILABLE YET
                </p>
              </div>
            ) : (
              recentPosts?.map((post, idx) => (
                <Link key={post.id} href={`/posts/${post.slug}`} className="block no-underline group">
                  <article
                    className="border-2 border-border p-5 transition-all duration-100 group-hover:border-primary"
                    style={{ boxShadow: '3px 3px 0 hsl(232 30% 22%)' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '5px 5px 0 hsl(191 100% 50% / 0.4)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '3px 3px 0 hsl(232 30% 22%)';
                    }}
                  >
                    {/* quest header row */}
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

                    {/* title */}
                    <h3 className="font-pixel text-[10px] md:text-xs text-foreground group-hover:text-primary transition-colors leading-loose mb-3">
                      {post.title.toUpperCase()}
                    </h3>

                    {/* excerpt */}
                    {post.excerpt && (
                      <p className="font-vt text-lg text-muted-foreground leading-snug">
                        {post.excerpt}
                      </p>
                    )}

                    {/* footer */}
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
        </section>

        {/* ── Skill tree / tags ── */}
        <aside className="md:col-span-4 space-y-6">
          <div className="flex items-center gap-3">
            <div className="font-pixel text-[12px] text-primary">★ SKILL TREE</div>
            <div className="flex-1 border-t-2 border-dashed border-border" />
          </div>

          {tagsLoading ? (
            <div className="flex flex-wrap gap-2">
              <PixelSkeleton className="h-8 w-20" />
              <PixelSkeleton className="h-8 w-28" />
            </div>
          ) : tags?.length === 0 ? (
            <p className="font-pixel text-[11px] text-muted-foreground">NO SKILLS UNLOCKED</p>
          ) : (
            <div className="flex flex-col gap-3">
              {tags?.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="no-underline group"
                >
                  <div
                    className="border-2 border-border px-3 py-2 flex items-center justify-between transition-all group-hover:border-primary"
                    style={{ boxShadow: '2px 2px 0 hsl(232 30% 22%)' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '4px 4px 0 hsl(191 100% 50% / 0.4)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '2px 2px 0 hsl(232 30% 22%)';
                    }}
                  >
                    <span className="font-pixel text-[11px] text-foreground group-hover:text-primary transition-colors">
                      {tag.name.toUpperCase()}
                    </span>
                    <span className="font-pixel text-[10px] text-accent">×{tag.postCount}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
