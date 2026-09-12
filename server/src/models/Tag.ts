import { Schema, model, Document } from 'mongoose';
import { getNextId } from './Counter.js';

export interface TagDoc extends Document {
  id: number;
  name: string;
  slug: string;
  postCount?: number;
}

const tagSchema = new Schema<TagDoc>({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
}, { timestamps: true });

tagSchema.pre('validate', async function (next) {
  if (!this.isNew) return next();
  if (this.id == null) {
    this.id = await getNextId('tag');
  }
  next();
});

const TagModel = model<TagDoc>('Tag', tagSchema);

export default TagModel;
