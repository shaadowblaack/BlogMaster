import { Schema, model, Document } from 'mongoose';
import { getNextId } from './Counter';
import { TagDoc } from './Tag';

export type PostStatus = 'draft' | 'published';

export interface PostDoc extends Document {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  status: PostStatus;
  publishedAt: Date | null;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  tags?: TagDoc[];
}

const postSchema = new Schema<PostDoc>({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, default: null },
  content: { type: String, default: '' },
  coverImageUrl: { type: String, default: null },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  publishedAt: { type: Date, default: null },
  viewCount: { type: Number, default: 0 },
}, { timestamps: true });

postSchema.pre('validate', async function (next) {
  if (!this.isNew) return next();
  if (this.id == null) {
    this.id = await getNextId('post');
  }
  next();
});

postSchema.virtual('tagsRef', {
  ref: 'PostTag',
  localField: 'id',
  foreignField: 'postId',
});

const PostModel = model<PostDoc>('Post', postSchema);

export default PostModel;
