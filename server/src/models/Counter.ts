import { Schema, model } from 'mongoose';

const counterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

counterSchema.index({ _id: 1 });

export interface CounterDoc {
  _id: string;
  seq: number;
}

const CounterModel = model<CounterDoc>('Counter', counterSchema);

export async function getNextId(name: string): Promise<number> {
  const doc = await CounterModel.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return doc.seq;
}

export default CounterModel;
