/**
 * Clean API client for the Blog Master API.
 *
 * Replaces the auto-generated Orval client that contained references to
 * non-existent routes (/api/login, /api/callback, /api/mobile-auth/*).
 * Only hooks matching real server endpoints are exported.
 */
import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  QueryFunction,
  UseMutationResult,
  UseQueryResult,
  UseQueryOptions,
} from '@tanstack/react-query';
import { customFetch } from './custom-fetch';
import type { ErrorType } from './custom-fetch';
import type {
  Post,
  PostInput,
  PostUpdate,
  PostList,
  Profile,
  ProfileInput,
  Tag,
  BlogStats,
  ListPostsParams,
  GetRecentPostsParams,
} from './api.schemas';

// ── Helpers ──────────────────────────────────────────────────────────────

function buildQuery(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      sp.append(key, String(value));
    }
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

// ─── Profile ─────────────────────────────────────────────────────────────

export const getGetProfileUrl = () => '/api/profile';
export const getGetProfileQueryKey = () => ['/api/profile'] as const;

export const getProfile = (options?: RequestInit): Promise<Profile> =>
  customFetch<Profile>(getGetProfileUrl(), { ...options, method: 'GET' });

export function useGetProfile<TData = Profile>(): UseQueryResult<TData, ErrorType<unknown>> {
  return useQuery<Profile, ErrorType<unknown>, TData>({
    queryKey: getGetProfileQueryKey(),
    queryFn: () => getProfile(),
  });
}

// ─── Update Profile ──────────────────────────────────────────────────────

export const getUpdateProfileUrl = () => '/api/profile';

export const updateProfile = (
  profileInput: ProfileInput,
  options?: RequestInit,
): Promise<Profile> =>
  customFetch<Profile>(getUpdateProfileUrl(), {
    ...options,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(profileInput),
  });

export function useUpdateProfile(): UseMutationResult<
  Profile,
  ErrorType<unknown>,
  { data: ProfileInput }
> {
  return useMutation<Profile, ErrorType<unknown>, { data: ProfileInput }>({
    mutationKey: ['updateProfile'],
    mutationFn: ({ data }) => updateProfile(data),
  });
}

// ─── Blog Stats ──────────────────────────────────────────────────────────

export const getGetBlogStatsUrl = () => '/api/stats';
export const getGetBlogStatsQueryKey = () => ['/api/stats'] as const;

export const getBlogStats = (options?: RequestInit): Promise<BlogStats> =>
  customFetch<BlogStats>(getGetBlogStatsUrl(), { ...options, method: 'GET' });

export function useGetBlogStats<TData = BlogStats>(): UseQueryResult<TData, ErrorType<unknown>> {
  return useQuery<BlogStats, ErrorType<unknown>, TData>({
    queryKey: getGetBlogStatsQueryKey(),
    queryFn: () => getBlogStats(),
  });
}

// ─── Recent Posts ────────────────────────────────────────────────────────

export const getGetRecentPostsUrl = (params?: GetRecentPostsParams) =>
  `/api/posts/recent${buildQuery(params ?? {})}`;
export const getGetRecentPostsQueryKey = (params?: GetRecentPostsParams) =>
  ['/api/posts/recent', ...(params ? [params] : [])] as const;

export const getRecentPosts = (
  params?: GetRecentPostsParams,
  options?: RequestInit,
): Promise<Post[]> =>
  customFetch<Post[]>(getGetRecentPostsUrl(params), { ...options, method: 'GET' });

export function useGetRecentPosts<TData = Post[]>(params?: GetRecentPostsParams) {
  const queryKey = getGetRecentPostsQueryKey(params);
  const queryFn: QueryFunction<Post[]> = ({ signal }) => getRecentPosts(params, { signal });
  return useQuery<Post[], ErrorType<unknown>, TData>({
    queryKey,
    queryFn,
  });
}

// ─── List Posts ──────────────────────────────────────────────────────────

export const getListPostsUrl = (params?: ListPostsParams) =>
  `/api/posts${buildQuery(params ?? {})}`;
export const getListPostsQueryKey = (params?: ListPostsParams) =>
  ['/api/posts', ...(params ? [params] : [])] as const;

export const listPosts = (
  params?: ListPostsParams,
  options?: RequestInit,
): Promise<PostList> =>
  customFetch<PostList>(getListPostsUrl(params), { ...options, method: 'GET' });

export function useListPosts<TData = PostList>(
  params?: ListPostsParams,
  options?: { query?: UseQueryOptions<PostList, ErrorType<unknown>, TData> },
): UseQueryResult<TData, ErrorType<unknown>> {
  const queryOptions = options?.query;
  const queryKey = queryOptions?.queryKey ?? getListPostsQueryKey(params);
  const queryFn: QueryFunction<PostList> = ({ signal }) => listPosts(params, { signal });
  return useQuery({ queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    PostList,
    ErrorType<unknown>,
    TData
  >);
}

// ─── Get Post by ID ──────────────────────────────────────────────────────

export const getGetPostUrl = (id: number) => `/api/posts/${id}`;
export const getGetPostQueryKey = (id: number) => ['/api/posts', id] as const;

export const getPost = (id: number, options?: RequestInit): Promise<Post> =>
  customFetch<Post>(getGetPostUrl(id), { ...options, method: 'GET' });

export function useGetPost<TData = Post>(
  id: number,
  options?: { query?: UseQueryOptions<Post, ErrorType<unknown>, TData> },
): UseQueryResult<TData, ErrorType<unknown>> {
  const queryOptions = options?.query;
  const queryKey = queryOptions?.queryKey ?? getGetPostQueryKey(id);
  const queryFn: QueryFunction<Post> = ({ signal }) => getPost(id, { signal });
  return useQuery({ queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Post,
    ErrorType<unknown>,
    TData
  >);
}

// ─── Get Post by Slug ────────────────────────────────────────────────────

export const getGetPostBySlugUrl = (slug: string) => `/api/posts/slug/${slug}`;
export const getGetPostBySlugQueryKey = (slug: string) =>
  ['/api/posts/slug', slug] as const;

export const getPostBySlug = (slug: string, options?: RequestInit): Promise<Post> =>
  customFetch<Post>(getGetPostBySlugUrl(slug), { ...options, method: 'GET' });

export function useGetPostBySlug<TData = Post>(
  slug: string,
  options?: { query?: UseQueryOptions<Post, ErrorType<unknown>, TData> },
): UseQueryResult<TData, ErrorType<unknown>> {
  const queryOptions = options?.query;
  const queryKey = queryOptions?.queryKey ?? getGetPostBySlugQueryKey(slug);
  const queryFn: QueryFunction<Post> = ({ signal }) => getPostBySlug(slug, { signal });
  return useQuery({ queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Post,
    ErrorType<unknown>,
    TData
  >);
}

// ─── Create Post ─────────────────────────────────────────────────────────

export const getCreatePostUrl = () => '/api/posts';

export const createPost = (postInput: PostInput, options?: RequestInit): Promise<Post> =>
  customFetch<Post>(getCreatePostUrl(), {
    ...options,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(postInput),
  });

export function useCreatePost(): UseMutationResult<
  Post,
  ErrorType<unknown>,
  { data: PostInput }
> {
  return useMutation<Post, ErrorType<unknown>, { data: PostInput }>({
    mutationKey: ['createPost'],
    mutationFn: ({ data }) => createPost(data),
  });
}

// ─── Update Post ─────────────────────────────────────────────────────────

export const getUpdatePostUrl = (id: number) => `/api/posts/${id}`;

export const updatePost = (
  id: number,
  postUpdate: PostUpdate,
  options?: RequestInit,
): Promise<Post> =>
  customFetch<Post>(getUpdatePostUrl(id), {
    ...options,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    body: JSON.stringify(postUpdate),
  });

export function useUpdatePost(): UseMutationResult<
  Post,
  ErrorType<unknown>,
  { id: number; data: PostUpdate }
> {
  return useMutation<Post, ErrorType<unknown>, { id: number; data: PostUpdate }>({
    mutationKey: ['updatePost'],
    mutationFn: ({ id, data }) => updatePost(id, data),
  });
}

// ─── Delete Post ─────────────────────────────────────────────────────────

export const getDeletePostUrl = (id: number) => `/api/posts/${id}`;

export const deletePost = (id: number): Promise<void> =>
  customFetch<void>(getDeletePostUrl(id), { method: 'DELETE' });

export function useDeletePost(): UseMutationResult<void, ErrorType<unknown>, { id: number }> {
  return useMutation<void, ErrorType<unknown>, { id: number }>({
    mutationKey: ['deletePost'],
    mutationFn: ({ id }) => deletePost(id),
  });
}

// ─── Publish Post ────────────────────────────────────────────────────────

export const getPublishPostUrl = (id: number) => `/api/posts/${id}/publish`;

export const publishPost = (id: number): Promise<Post> =>
  customFetch<Post>(getPublishPostUrl(id), { method: 'POST' });

export function usePublishPost(): UseMutationResult<Post, ErrorType<unknown>, { id: number }> {
  return useMutation<Post, ErrorType<unknown>, { id: number }>({
    mutationKey: ['publishPost'],
    mutationFn: ({ id }) => publishPost(id),
  });
}

// ─── Unpublish Post ──────────────────────────────────────────────────────

export const getUnpublishPostUrl = (id: number) => `/api/posts/${id}/unpublish`;

export const unpublishPost = (id: number): Promise<Post> =>
  customFetch<Post>(getUnpublishPostUrl(id), { method: 'POST' });

export function useUnpublishPost(): UseMutationResult<Post, ErrorType<unknown>, { id: number }> {
  return useMutation<Post, ErrorType<unknown>, { id: number }>({
    mutationKey: ['unpublishPost'],
    mutationFn: ({ id }) => unpublishPost(id),
  });
}

// ─── Tags ────────────────────────────────────────────────────────────────

export const getListTagsUrl = () => '/api/tags';
export const getListTagsQueryKey = () => ['/api/tags'] as const;

export const listTags = (options?: RequestInit): Promise<Tag[]> =>
  customFetch<Tag[]>(getListTagsUrl(), { ...options, method: 'GET' });

export function useListTags<TData = Tag[]>(): UseQueryResult<TData, ErrorType<unknown>> {
  return useQuery<Tag[], ErrorType<unknown>, TData>({
    queryKey: getListTagsQueryKey(),
    queryFn: ({ signal }) => listTags({ signal }),
  });
}
