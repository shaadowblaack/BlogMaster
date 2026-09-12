import { Schema, model, Document } from 'mongoose';

export interface PostTagDoc extends Document {
  postId: number;
  tagId: number;
}

const postTagSchema = new Schema<PostTagDoc>({
  postId: { type: Number, required: true, ref: 'Post.id' },
  tagId: { type: Number, required: true, ref: 'Tag.id' },
});

postTagSchema.index({ postId: 1, tagId: 1 }, { unique: true });

const PostTagModel = model<PostTagDoc>('PostTag', postTagSchema);

export default PostTagModel;
