import { Schema, model, Document } from 'mongoose';
import { getNextId } from './Counter.js';

export interface CommentDoc extends Document {
  id: number;
  postId: number;
  userId: string | null;
  authorName: string;
  authorEmail: string | null;
  body: string;
  editToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<CommentDoc>({
  id: { type: Number, required: true, unique: true },
  postId: { type: Number, required: true },
  userId: { type: String, default: null },
  authorName: { type: String, required: true },
  authorEmail: { type: String, default: null },
  body: { type: String, required: true },
  editToken: { type: String, default: null },
}, { timestamps: true });

commentSchema.pre('validate', async function (next) {
  if (!this.isNew) return next();
  if (this.id == null) {
    this.id = await getNextId('comment');
  }
  next();
});

const CommentModel = model<CommentDoc>('Comment', commentSchema);

export default CommentModel;
