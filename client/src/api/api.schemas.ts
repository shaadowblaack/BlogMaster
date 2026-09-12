/**
 * Type definitions for the Blog Master API.
 *
 * Only types matching actual server endpoints are included.
 * Stale OIDC/mobile-auth types have been removed.
 */

export type PostStatus = typeof PostStatus[keyof typeof PostStatus];
export const PostStatus = {
  draft: 'draft',
  published: 'published',
} as const;

export interface Tag {
  id: number;
  name: string;
  slug: string;
  postCount?: number;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImageUrl?: string | null;
  status: PostStatus;
  publishedAt?: string | null;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
  tags?: Tag[];
}

export interface PostList {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
}

export interface PostInput {
  title: string;
  excerpt?: string;
  content: string;
  coverImageUrl?: string;
  tagNames?: string[];
}

export type PostUpdateStatus = typeof PostUpdateStatus[keyof typeof PostUpdateStatus];
export const PostUpdateStatus = {
  draft: 'draft',
  published: 'published',
} as const;

export interface PostUpdate {
  title?: string;
  excerpt?: string;
  content?: string;
  coverImageUrl?: string;
  tagNames?: string[];
  status?: PostUpdateStatus;
}

export interface Profile {
  id: number;
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
  twitterUrl?: string | null;
  githubUrl?: string | null;
  websiteUrl?: string | null;
}

export interface ProfileInput {
  name: string;
  bio?: string;
  avatarUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
}

export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  topTags?: Tag[];
}

export type ListPostsStatus = typeof ListPostsStatus[keyof typeof ListPostsStatus];
export const ListPostsStatus = {
  draft: 'draft',
  published: 'published',
  all: 'all',
} as const;

export type ListPostsParams = {
  status?: ListPostsStatus;
  tag?: string;
  page?: number;
  limit?: number;
};

export type GetRecentPostsParams = {
  limit?: number;
};
