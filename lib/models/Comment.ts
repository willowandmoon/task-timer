import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IComment extends Document {
  todoId: Types.ObjectId
  content: string
  createdAt: Date
}

const CommentSchema = new Schema<IComment>(
  {
    todoId: { type: Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export const CommentModel =
  mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema)
