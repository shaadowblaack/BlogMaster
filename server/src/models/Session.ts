import { Schema, model, Document } from 'mongoose';

export interface SessionData {
  user: {
    id: string;
    username: string;
    displayName?: string;
    role: 'admin' | 'user';
  };
}

export interface SessionDoc extends Document {
  sid: string;
  sess: Record<string, unknown>;
  expire: Date;
}

const sessionSchema = new Schema<SessionDoc>({
  sid: { type: String, required: true, unique: true },
  sess: { type: Schema.Types.Mixed, required: true },
  expire: { type: Date, required: true, index: { expires: 0 } },
});

const SessionModel = model<SessionDoc>('Session', sessionSchema);

export default SessionModel;
