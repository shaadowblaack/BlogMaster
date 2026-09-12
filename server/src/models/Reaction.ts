import { Schema, model, Document } from 'mongoose';
import { getNextId } from './Counter.js';

export interface ReactionDoc extends Document {
  id: number;
  postId: number;
  userId: string | null;
  guestId: string | null;
  emoji: string;
  createdAt: Date;
}

const reactionSchema = new Schema<ReactionDoc>({
  id: { type: Number, required: true, unique: true },
  postId: { type: Number, required: true },
  userId: { type: String, default: null },
  guestId: { type: String, default: null },
  emoji: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

reactionSchema.pre('validate', async function (next) {
  if (!this.isNew) return next();
  if (this.id == null) {
    this.id = await getNextId('reaction');
  }
  next();
});

// One reaction per emoji per user per post
reactionSchema.index(
  { postId: 1, userId: 1, emoji: 1 },
  { unique: true, partialFilterExpression: { userId: { $ne: null } } },
);
reactionSchema.index(
  { postId: 1, guestId: 1, emoji: 1 },
  { unique: true, partialFilterExpression: { guestId: { $ne: null } } },
);

const ReactionModel = model<ReactionDoc>('Reaction', reactionSchema);

export default ReactionModel;
