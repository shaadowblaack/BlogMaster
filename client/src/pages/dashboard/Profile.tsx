import { useState, useEffect } from 'react';
import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from '@/api';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function Profile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: profile, isLoading } = useGetProfile();
  const updateMutation = useUpdateProfile();

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatarUrl: '',
    twitterUrl: '',
    githubUrl: '',
    websiteUrl: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        avatarUrl: profile.avatarUrl || '',
        twitterUrl: profile.twitterUrl || '',
        githubUrl: profile.githubUrl || '',
        websiteUrl: profile.websiteUrl || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        data: {
          name: formData.name,
          bio: formData.bio || undefined,
          avatarUrl: formData.avatarUrl || undefined,
          twitterUrl: formData.twitterUrl || undefined,
          githubUrl: formData.githubUrl || undefined,
          websiteUrl: formData.websiteUrl || undefined,
        }
      });
      toast({ title: 'Profile updated successfully' });
      queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
    } catch {
      toast({ title: 'Failed to update profile', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in max-w-2xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-serif mb-2 text-foreground">Profile</h1>
        <p className="text-muted-foreground">Update your personal information and presence.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6 bg-card border border-border p-6 sm:p-8">
          <div className="space-y-2">
            <label htmlFor="profile-name" className="text-xs uppercase tracking-wider font-medium text-muted-foreground">Pen Name</label>
            <Input 
              id="profile-name"
              value={formData.name}
              onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
              placeholder="Your name"
              className="rounded-none border-border max-w-md font-serif text-lg py-5"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="profile-bio" className="text-xs uppercase tracking-wider font-medium text-muted-foreground">Bio</label>
            <Textarea 
              id="profile-bio"
              value={formData.bio}
              onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
              placeholder="A short introduction..."
              className="rounded-none border-border h-32"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="profile-avatar" className="text-xs uppercase tracking-wider font-medium text-muted-foreground">Avatar URL</label>
            <Input 
              id="profile-avatar"
              value={formData.avatarUrl}
              onChange={(e) => setFormData(p => ({ ...p, avatarUrl: e.target.value }))}
              placeholder="https://..."
              className="rounded-none border-border max-w-md"
            />
          </div>
        </div>

        <div className="space-y-6 bg-card border border-border p-6 sm:p-8">
          <h3 className="font-serif text-xl border-b border-border pb-4">Digital Presence</h3>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="profile-website" className="text-xs uppercase tracking-wider font-medium text-muted-foreground">Website</label>
              <Input 
                id="profile-website"
                value={formData.websiteUrl}
                onChange={(e) => setFormData(p => ({ ...p, websiteUrl: e.target.value }))}
                placeholder="https://..."
                className="rounded-none border-border"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="profile-twitter" className="text-xs uppercase tracking-wider font-medium text-muted-foreground">Twitter</label>
              <Input 
                id="profile-twitter"
                value={formData.twitterUrl}
                onChange={(e) => setFormData(p => ({ ...p, twitterUrl: e.target.value }))}
                placeholder="https://twitter.com/..."
                className="rounded-none border-border"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="profile-github" className="text-xs uppercase tracking-wider font-medium text-muted-foreground">GitHub</label>
              <Input 
                id="profile-github"
                value={formData.githubUrl}
                onChange={(e) => setFormData(p => ({ ...p, githubUrl: e.target.value }))}
                placeholder="https://github.com/..."
                className="rounded-none border-border"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={updateMutation.isPending} className="rounded-none px-8">
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
