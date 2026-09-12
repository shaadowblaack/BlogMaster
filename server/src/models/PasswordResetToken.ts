import { Schema, model, Document } from 'mongoose';
import { getNextId } from './Counter';

export interface PasswordResetTokenDoc extends Document {
  id: number;
  userId: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const passwordResetTokenSchema = new Schema<PasswordResetTokenDoc>({
  id: { type: Number, required: true, unique: true },
  userId: { type: String, required: true, ref: 'User._id' },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
}, { timestamps: { createdAt: true, updatedAt: false } });

passwordResetTokenSchema.pre('validate', async function (next) {
  if (!this.isNew) return next();
  if (this.id == null) {
    this.id = await getNextId('password_reset_token');
  }
  next();
});

// TTL index to auto-delete expired tokens
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordResetTokenModel = model<PasswordResetTokenDoc>('PasswordResetToken', passwordResetTokenSchema);

export default PasswordResetTokenModel;
