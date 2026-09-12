import { useState, useEffect } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { format } from 'date-fns';

interface Comment {
  id: number;
  postId: number;
  authorName: string;
  body: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  editToken?: string | null;
}

interface ReactionCounts {
  counts: Record<string, number>;
  mine: string[];
}

const EMOJIS = ['👍', '❤️', '🔥', '💡', '😂'];

// Store guest edit tokens per comment id in localStorage
function getEditToken(commentId: number): string | null {
  return localStorage.getItem(`comment_token_${commentId}`);
}
function saveEditToken(commentId: number, token: string) {
  localStorage.setItem(`comment_token_${commentId}`, token);
}

interface CommentSectionProps {
  postId: number;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { user, guestId } = useUserAuth();

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);

  const [reactions, setReactions] = useState<ReactionCounts>({ counts: {}, mine: [] });

  // New comment form
  const [body, setBody] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');

  // Editing state per comment
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBody, setEditBody] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  async function fetchComments() {
    const res = await fetch(`/api/posts/${postId}/comments`);
    if (res.ok) setComments(await res.json());
    setCommentsLoading(false);
  }

  async function fetchReactions() {
    const res = await fetch(`/api/posts/${postId}/reactions`, {
      credentials: 'include',
      headers: { 'x-guest-id': guestId },
    });
    if (res.ok) setReactions(await res.json());
  }

  useEffect(() => {
    fetchComments();
    fetchReactions();
  }, [postId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPostError('');
    if (!body.trim()) return;
    if (!user && !guestName.trim()) {
      setPostError('Please enter your name.');
      return;
    }
    setPosting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ body, authorName: guestName, authorEmail: guestEmail }),
      });
      if (!res.ok) {
        const d = await res.json();
        setPostError(d.error || 'Failed to post comment');
        return;
      }
      const comment: Comment = await res.json();
      // Save edit token for guests
      if (!user && comment.editToken) {
        saveEditToken(comment.id, comment.editToken);
      }
      setComments((prev) => [comment, ...prev]);
      setBody('');
      setGuestName('');
      setGuestEmail('');
    } catch {
      setPostError('Connection failed. Try again.');
    } finally {
      setPosting(false);
    }
  }

  async function handleReact(emoji: string) {
    const res = await fetch(`/api/posts/${postId}/reactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-guest-id': guestId,
      },
      credentials: 'include',
      body: JSON.stringify({ emoji }),
    });
    if (res.ok) {
      const { toggled } = await res.json();
      setReactions((prev) => {
        const newCounts = { ...prev.counts };
        const newMine = [...prev.mine];
        if (toggled === 'on') {
          newCounts[emoji] = (newCounts[emoji] || 0) + 1;
          newMine.push(emoji);
        } else {
          newCounts[emoji] = Math.max(0, (newCounts[emoji] || 1) - 1);
          const idx = newMine.indexOf(emoji);
          if (idx !== -1) newMine.splice(idx, 1);
        }
        return { counts: newCounts, mine: newMine };
      });
    }
  }

  function startEdit(c: Comment) {
    setEditingId(c.id);
    setEditBody(c.body);
  }

  async function saveEdit(c: Comment) {
    if (!editBody.trim()) return;
    setEditSaving(true);
    const editToken = c.userId ? undefined : getEditToken(c.id);
    const res = await fetch(`/api/comments/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ body: editBody, editToken }),
    });
    if (res.ok) {
      const updated: Comment = await res.json();
      setComments((prev) => prev.map((x) => (x.id === c.id ? { ...x, ...updated } : x)));
      setEditingId(null);
    }
    setEditSaving(false);
  }

  function canEdit(c: Comment): boolean {
    if (user && c.userId === user.id) return true;
    if (user?.role === 'admin') return true;
    if (!c.userId && getEditToken(c.id)) return true;
    return false;
  }

  async function handleDelete(c: Comment) {
    if (!confirm('Delete this comment?')) return;
    const editToken = c.userId ? undefined : getEditToken(c.id);
    await fetch(`/api/comments/${c.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ editToken }),
    });
    setComments((prev) => prev.filter((x) => x.id !== c.id));
  }

  return (
    <section className="mt-16 space-y-10">

      {/* ── Reactions ── */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <span className="font-pixel text-[12px] text-primary">★ REACTIONS</span>
          <div className="flex-1 border-t-2 border-dashed border-border" />
        </div>
        <div className="flex flex-wrap gap-3">
          {EMOJIS.map((emoji) => {
            const count = reactions.counts[emoji] || 0;
            const active = reactions.mine.includes(emoji);
            return (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className={`flex items-center gap-2 px-4 py-2 border-2 font-pixel text-[11px] transition-all ${
                  active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                }`}
                style={{ boxShadow: active ? '3px 3px 0 hsl(191 100% 50% / 0.4)' : '2px 2px 0 hsl(232 30% 22%)' }}
              >
                <span className="text-base">{emoji}</span>
                {count > 0 && <span>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Comment form ── */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <span className="font-pixel text-[12px] text-primary">
            ▶ {comments.length > 0 ? `${comments.length} ` : ''}COMMENTS
          </span>
          <div className="flex-1 border-t-2 border-dashed border-border" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-2 border-border p-5 mb-8 space-y-4"
          style={{ boxShadow: '4px 4px 0 hsl(232 30% 22%)' }}
        >
          <div className="font-pixel text-[11px] text-primary mb-2">
            {user
              ? `POSTING AS: ${(user.displayName || user.username).toUpperCase()}`
              : 'POST A COMMENT'}
          </div>

          {!user && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="comment-name" className="block font-pixel text-[10px] text-muted-foreground mb-1">
                  NAME *
                </label>
                <input
                  id="comment-name"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required={!user}
                  placeholder="Your name"
                  className="w-full bg-card border-2 border-border focus:border-primary outline-none px-3 py-2 font-vt text-lg text-foreground transition-colors"
                />
              </div>
              <div>
                <label htmlFor="comment-email" className="block font-pixel text-[10px] text-muted-foreground mb-1">
                  EMAIL (OPTIONAL)
                </label>
                <input
                  id="comment-email"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-card border-2 border-border focus:border-primary outline-none px-3 py-2 font-vt text-lg text-foreground transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Write your comment..."
              className="w-full bg-card border-2 border-border focus:border-primary outline-none px-3 py-2 font-vt text-lg text-foreground transition-colors resize-none"
            />
          </div>

          {postError && (
            <div className="font-pixel text-[10px] text-destructive">✕ {postError}</div>
          )}

          <button
            type="submit"
            disabled={posting}
            className="font-pixel text-[11px] text-primary-foreground bg-primary px-5 py-2 disabled:opacity-50 pixel-btn"
          >
            {posting ? '[ POSTING... ]' : '▶ POST COMMENT'}
          </button>
        </form>
      </div>

      {/* ── Comment list ── */}
      {commentsLoading ? (
        <div className="font-pixel text-[11px] text-muted-foreground">LOADING...</div>
      ) : comments.length === 0 ? (
        <div className="border-2 border-dashed border-border p-8 text-center">
          <p className="font-pixel text-[11px] text-muted-foreground">NO COMMENTS YET. BE THE FIRST!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((c) => (
            <div
              key={c.id}
              className="border-2 border-border p-5"
              style={{ boxShadow: '3px 3px 0 hsl(232 30% 22%)' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-pixel text-[11px] text-primary">{c.authorName.toUpperCase()}</span>
                  {c.userId && (
                    <span className="ml-2 font-pixel text-[6px] text-accent px-1 border border-accent">MEMBER</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <time className="font-pixel text-[6px] text-muted-foreground">
                    {format(new Date(c.createdAt), 'yyyy.MM.dd')}
                    {c.updatedAt !== c.createdAt && ' (edited)'}
                  </time>
                  {canEdit(c) && editingId !== c.id && (
                    <>
                      <button onClick={() => startEdit(c)}
                        className="text-muted-foreground hover:text-primary transition-colors" title="Edit">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDelete(c)}
                        className="text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Body or edit form */}
              {editingId === c.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={3}
                    className="w-full bg-card border-2 border-primary outline-none px-3 py-2 font-vt text-lg text-foreground resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(c)}
                      disabled={editSaving}
                      className="flex items-center gap-1 font-pixel text-[10px] text-primary-foreground bg-primary px-3 py-1 pixel-btn disabled:opacity-50"
                    >
                      <Check className="w-3 h-3" />
                      {editSaving ? 'SAVING...' : 'SAVE'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-1 font-pixel text-[10px] text-muted-foreground px-3 py-1 border-2 border-border hover:border-primary transition-colors"
                    >
                      <X className="w-3 h-3" />
                      CANCEL
                    </button>
                  </div>
                </div>
              ) : (
                <p className="font-vt text-xl text-foreground leading-relaxed">{c.body}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
