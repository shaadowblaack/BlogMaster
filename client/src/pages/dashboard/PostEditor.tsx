import { useState, useEffect, useRef } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import {
  useGetPost, useCreatePost, useUpdatePost,
  getGetPostQueryKey,
} from '@/api';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, ImageOff, Upload, Link2 } from 'lucide-react';
import { resolveImageUrl } from '@/lib/image-url';
import { customFetch } from '@/api/custom-fetch';

// ── Image upload hook (direct multipart upload to backend) ────────────────────
function useUploadCover(onDone: (url: string) => void) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');

  async function uploadFile(file: File) {
    setUploading(true);
    setUploadError('');
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { url } = await customFetch<{ url: string }>('/api/storage/upload', {
        method: 'POST',
        body: formData,
      });
      onDone(url);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  return { uploadFile, uploading, progress, uploadError };
}

// ── Cover preview ───────────────────────────────────────────────────────────
function CoverPreview({ url }: { url: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const resolved = resolveImageUrl(url);

  useEffect(() => {
    if (!resolved) { setStatus('idle'); return; }
    setStatus('loading');
    const img = new Image();
    img.onload  = () => setStatus('ok');
    img.onerror = () => setStatus('error');
    img.src = resolved;
  }, [resolved]);

  if (!resolved || status === 'idle') return null;
  if (status === 'error') return (
    <div className="flex items-center gap-2 text-sm text-destructive mt-2 font-pixel text-[10px]">
      <ImageOff className="w-3.5 h-3.5 shrink-0" /> Image couldn&apos;t load — check the URL.
    </div>
  );
  if (status === 'ok') return (
    <img src={resolved} alt="Cover preview"
      className="mt-3 w-full max-h-48 object-cover border-2 pixel-box" />
  );
  return <p className="text-sm text-muted-foreground mt-1 font-pixel text-[10px]">Checking image…</p>;
}

// ── Main editor ─────────────────────────────────────────────────────────────
export default function PostEditor() {
  const [, params] = useRoute('/dashboard/posts/:id/edit');
  const [, setLocation] = useLocation();
  const isNew = !params?.id || params?.id === 'new';
  const postId = params?.id ? parseInt(params.id, 10) : 0;

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [coverTab, setCoverTab] = useState<'url' | 'upload'>('url');

  const { data: post, isLoading: loadingPost } = useGetPost(postId, {
    query: { enabled: !isNew && !!postId, queryKey: getGetPostQueryKey(postId) },
  });

  const { uploadFile, uploading, progress, uploadError } = useUploadCover((url) => {
    setCoverImageUrl(url);
  });

  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost();

  const initRef = useRef<number | null>(null);
  useEffect(() => {
    if (post && !isNew && initRef.current !== post.id) {
      initRef.current = post.id;
      setTitle(post.title);
      setContent(post.content);
      setExcerpt(post.excerpt || '');
      setCoverImageUrl(post.coverImageUrl || '');
      setTagsInput(post.tags?.map(t => t.name).join(', ') || '');
    }
  }, [post, isNew]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({ title: 'Title and content are required', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    const tagNames = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const payload = {
      title, content,
      excerpt: excerpt || undefined,
      coverImageUrl: coverImageUrl || undefined,
      tagNames: tagNames.length > 0 ? tagNames : undefined,
    };
    try {
      if (isNew) {
        const result = await createMutation.mutateAsync({ data: payload });
        toast({ title: 'Draft created successfully' });
        queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
        setLocation(`/dashboard/posts/${result.id}/edit`);
      } else {
        await updateMutation.mutateAsync({ id: postId, data: payload });
        toast({ title: 'Saved successfully' });
        queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(postId) });
        queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      }
    } catch {
      toast({ title: 'Failed to save', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isNew && loadingPost) {
    return (
      <div className="p-12 text-center font-pixel text-[11px] text-muted-foreground cursor-blink">
        LOADING MANUSCRIPT
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-24">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/dashboard/posts"
          className="font-pixel text-[10px] text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors no-underline">
          <ArrowLeft className="w-3 h-3" /> BACK
        </Link>
        <div className="font-pixel text-[10px] text-muted-foreground">
          {isNew ? 'NEW DRAFT' : post?.status === 'published' ? '[ PUBLISHED ]' : '[ DRAFT ]'}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">

        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Quest title..."
          className="w-full font-pixel text-lg md:text-xl bg-transparent border-0 border-b-2 border-border focus:border-primary outline-none pb-3 text-foreground placeholder:text-muted-foreground transition-colors"
        />

        {/* Content */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Begin your story here..."
          rows={20}
          className="w-full font-vt text-2xl bg-transparent border-0 outline-none resize-y text-foreground placeholder:text-muted-foreground leading-relaxed"
          style={{ minHeight: '50vh' }}
        />

        {/* ── Metadata ── */}
        <div className="border-t-2 border-border pt-8 space-y-6">
          <div className="font-pixel text-[11px] text-primary">▶ METADATA</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Excerpt */}
            <div className="space-y-2">
              <label htmlFor="post-excerpt" className="font-pixel text-[10px] text-muted-foreground">EXCERPT</label>
              <Textarea
                id="post-excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A brief summary..."
                className="h-28 border-2 border-border focus:border-primary rounded-none bg-card font-vt text-xl resize-none"
              />
            </div>

            <div className="space-y-5">
              {/* Tags */}
              <div className="space-y-2">
                <label htmlFor="post-tags" className="font-pixel text-[10px] text-muted-foreground">TAGS (COMMA SEPARATED)</label>
                <Input
                  id="post-tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="technology, writing, thoughts"
                  className="border-2 border-border focus:border-primary rounded-none bg-card font-vt text-xl"
                />
              </div>

              {/* Cover Image — URL or Upload */}
              <div className="space-y-2">
                <span className="font-pixel text-[10px] text-muted-foreground">COVER IMAGE</span>

                {/* Tab switcher */}
                <div className="flex border-2 border-border overflow-hidden w-fit">
                  <button type="button" onClick={() => setCoverTab('url')}
                    className={`flex items-center gap-1 px-3 py-2 font-pixel text-[10px] transition-colors ${
                      coverTab === 'url'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-primary'
                    }`}>
                    <Link2 className="w-3 h-3" /> URL
                  </button>
                  <button type="button" onClick={() => setCoverTab('upload')}
                    className={`flex items-center gap-1 px-3 py-2 font-pixel text-[10px] border-l-2 border-border transition-colors ${
                      coverTab === 'upload'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-primary'
                    }`}>
                    <Upload className="w-3 h-3" /> UPLOAD
                  </button>
                </div>

                {coverTab === 'url' ? (
                  <div>
                    <Input
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      placeholder="https://… (direct image link)"
                      className="border-2 border-border focus:border-primary rounded-none bg-card font-vt text-xl"
                    />
                    <p className="font-pixel text-[9px] text-muted-foreground mt-1">
                      Paste a direct image URL (.jpg / .png / .webp)
                    </p>
                  </div>
                ) : (
                  <div>
                    <label
                      className={`flex flex-col items-center justify-center w-full border-2 border-dashed cursor-pointer transition-colors py-6 px-4 ${
                        uploading ? 'border-primary opacity-70' : 'border-border hover:border-primary'
                      }`}
                      style={{ boxShadow: 'var(--px-shadow-sm)' }}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadFile(file);
                        }}
                      />
                      <Upload className={`w-6 h-6 mb-2 ${uploading ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
                      <span className="font-pixel text-[10px] text-center text-muted-foreground">
                        {uploading
                          ? `UPLOADING... ${progress}%`
                          : 'CLICK TO BROWSE / DROP IMAGE'}
                      </span>
                      {uploading && (
                        <div className="w-full mt-3 h-2 bg-secondary border border-border overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </label>
                    {uploadError && (
                      <p className="font-pixel text-[10px] text-destructive mt-2">✕ {uploadError}</p>
                    )}
                  </div>
                )}

                {/* Always show preview if we have a URL */}
                <CoverPreview url={coverImageUrl} />
                {coverImageUrl && (
                  <p className="font-pixel text-[9px] text-muted-foreground truncate">
                    ✓ {coverImageUrl.length > 50 ? coverImageUrl.slice(0, 50) + '…' : coverImageUrl}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Save bar */}
        <div className="fixed bottom-0 left-0 md:left-60 right-0 p-4 bg-background/90 backdrop-blur border-t-2 border-border flex justify-end px-6">
          <Button type="submit" disabled={isSaving}
            className="font-pixel text-[10px] px-8 rounded-none pixel-btn">
            {isSaving ? '[ SAVING... ]' : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {isNew ? 'CREATE DRAFT' : 'SAVE CHANGES'}
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
