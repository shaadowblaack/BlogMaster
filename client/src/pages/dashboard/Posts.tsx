import { useState } from 'react';
import { Link } from 'wouter';
import { useListPosts, useDeletePost, usePublishPost, useUnpublishPost, getListPostsQueryKey, getGetBlogStatsQueryKey, getGetRecentPostsQueryKey } from '@/api';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { PenTool, Trash2, MoreHorizontal, Globe, Archive } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function Posts() {
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: postsData, isLoading } = useListPosts(
    { status: filter !== 'all' ? filter : undefined, limit: 50 },
    { query: { queryKey: getListPostsQueryKey({ status: filter !== 'all' ? filter : undefined, limit: 50 }) } }
  );

  const deleteMutation = useDeletePost();
  const publishMutation = usePublishPost();
  const unpublishMutation = useUnpublishPost();

  const invalidateData = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    queryClient.invalidateQueries({ queryKey: getGetBlogStatsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetRecentPostsQueryKey() });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast({ title: 'Post deleted' });
      invalidateData();
    } catch {
      toast({ title: 'Failed to delete post', variant: 'destructive' });
    }
  };

  const handlePublishToggle = async (id: number, currentStatus: string) => {
    try {
      if (currentStatus === 'draft') {
        await publishMutation.mutateAsync({ id });
        toast({ title: 'Post published successfully' });
      } else {
        await unpublishMutation.mutateAsync({ id });
        toast({ title: 'Post moved to drafts' });
      }
      invalidateData();
    } catch {
      toast({ title: 'Action failed', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-serif mb-2 text-foreground">Archive</h1>
          <p className="text-muted-foreground">Manage your writings.</p>
        </div>
        <Link href="/dashboard/posts/new">
          <Button className="rounded-none gap-2">
            <PenTool className="w-4 h-4" />
            New Entry
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        {['all', 'published', 'draft'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as 'all' | 'published' | 'draft')}
            className={`text-sm uppercase tracking-wider font-medium pb-2 border-b-2 transition-colors ${
              filter === f 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border">
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 flex justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-64" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : postsData?.posts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground italic font-serif mb-4">No posts found in this category.</p>
            {filter === 'all' && (
              <Link href="/dashboard/posts/new">
                <Button variant="outline" className="rounded-none">Write something new</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {postsData?.posts.map((post) => (
              <div key={post.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-muted/10 transition-colors">
                <div>
                  <Link href={`/dashboard/posts/${post.id}/edit`} className="font-serif text-xl font-medium hover:text-primary transition-colors block mb-1">
                    {post.title}
                  </Link>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className="rounded-none font-normal uppercase tracking-wide text-[10px]">
                      {post.status}
                    </Badge>
                    <span>
                      Created {format(new Date(post.createdAt), 'MMM d, yyyy')}
                    </span>
                    {post.publishedAt && (
                      <>
                        <span className="opacity-50">&bull;</span>
                        <span>Published {format(new Date(post.publishedAt), 'MMM d, yyyy')}</span>
                      </>
                    )}
                    {post.viewCount !== undefined && (
                      <>
                        <span className="opacity-50">&bull;</span>
                        <span>{post.viewCount} views</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Link href={`/dashboard/posts/${post.id}/edit`}>
                    <Button variant="ghost" size="sm" className="rounded-none">Edit</Button>
                  </Link>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-none w-8 h-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-none border-border shadow-md">
                      <DropdownMenuItem onClick={() => handlePublishToggle(post.id, post.status)} className="cursor-pointer gap-2 rounded-none">
                        {post.status === 'draft' ? (
                          <><Globe className="w-4 h-4" /> Publish</>
                        ) : (
                          <><Archive className="w-4 h-4" /> Revert to draft</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(post.id)} 
                        className="cursor-pointer text-destructive focus:text-destructive gap-2 rounded-none"
                      >
                        <Trash2 className="w-4 h-4" /> Delete permanently
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
