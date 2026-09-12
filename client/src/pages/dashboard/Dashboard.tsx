import { useGetBlogStats, useGetRecentPosts } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Link } from 'wouter';
import { BookOpen, FileText, Eye, PenTool } from 'lucide-react';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetBlogStats();
  const { data: recentPosts, isLoading: postsLoading } = useGetRecentPosts({ limit: 5 });

  return (
    <div className="space-y-10 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-serif mb-2 text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">An overview of your writing activity.</p>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Published</p>
                  <p className="text-4xl font-serif">{stats?.publishedPosts || 0}</p>
                </div>
                <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Drafts</p>
                  <p className="text-4xl font-serif">{stats?.draftPosts || 0}</p>
                </div>
                <div className="w-10 h-10 bg-secondary text-secondary-foreground flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Reads</p>
                  <p className="text-4xl font-serif">{stats?.totalViews || 0}</p>
                </div>
                <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-xl font-serif">Recent Work</h2>
            <Link href="/dashboard/posts" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          
          {postsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : recentPosts?.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border bg-muted/20">
              <p className="text-muted-foreground mb-4 font-serif italic">Your desk is empty.</p>
              <Link href="/dashboard/posts/new" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/90">
                <PenTool className="w-4 h-4" />
                Start Writing
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentPosts?.map(post => (
                <div key={post.id} className="py-4 flex justify-between items-center group">
                  <div>
                    <Link href={`/dashboard/posts/${post.id}/edit`} className="font-medium text-foreground group-hover:text-primary transition-colors text-lg font-serif">
                      {post.title}
                    </Link>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      <span className={`px-2 py-0.5 border text-[10px] uppercase tracking-wider ${
                        post.status === 'published' ? 'border-primary text-primary' : 'border-border text-muted-foreground'
                      }`}>
                        {post.status}
                      </span>
                      <span>
                        Last edited {format(new Date(post.updatedAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <Card className="border-border bg-secondary/30 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link 
                href="/dashboard/posts/new" 
                className="w-full flex items-center justify-between p-4 bg-background border border-border hover:border-primary transition-colors group"
              >
                <span className="font-medium text-sm group-hover:text-primary transition-colors">Draft a new post</span>
                <PenTool className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              </Link>
              <Link 
                href="/dashboard/profile" 
                className="w-full flex items-center justify-between p-4 bg-background border border-border hover:border-primary transition-colors group"
              >
                <span className="font-medium text-sm group-hover:text-primary transition-colors">Update profile</span>
                <span className="text-muted-foreground group-hover:text-primary">&rarr;</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
