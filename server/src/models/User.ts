import { Schema, model, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type UserRole = 'user' | 'admin';

export interface UserDoc extends Omit<Document, '_id'> {
  _id: string;
  username: string;
  displayName?: string | null;
  email?: string | null;
  passwordHash?: string | null;
  role: UserRole;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
}

const userSchema = new Schema<UserDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    username: { type: String, required: true, unique: true },
    displayName: { type: String, default: null },
    email: { type: String, default: null },
    passwordHash: { type: String, default: null },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    profileImageUrl: { type: String, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    _id: false,
  },
);

const UserModel = model<UserDoc>('User', userSchema);

export default UserModel;
