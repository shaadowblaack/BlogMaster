import { Schema, model, Document } from 'mongoose';
import { getNextId } from './Counter.js';

export interface ProfileDoc extends Document {
  id: number;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  twitterUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
}

const profileSchema = new Schema<ProfileDoc>({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  bio: { type: String, default: null },
  avatarUrl: { type: String, default: null },
  twitterUrl: { type: String, default: null },
  githubUrl: { type: String, default: null },
  websiteUrl: { type: String, default: null },
});

profileSchema.pre('validate', async function (next) {
  if (!this.isNew) return next();
  if (this.id == null) {
    this.id = await getNextId('profile');
  }
  next();
});

const ProfileModel = model<ProfileDoc>('Profile', profileSchema);

export default ProfileModel;
