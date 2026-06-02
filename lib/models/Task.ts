import mongoose, { Schema, Document } from 'mongoose'
import type { TaskStatus } from '@/types/task'

export interface ITask extends Document {
  title: string
  status: TaskStatus
  startedAt: Date | null
  doneAt: Date | null
  inProgressDuration: number | null
  createdAt: Date
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    status: { type: String, enum: ['pending', 'inprogress', 'done'], default: 'pending' },
    startedAt: { type: Date, default: null },
    doneAt: { type: Date, default: null },
    inProgressDuration: { type: Number, default: null },
  },
  { timestamps: true }
)

export const TaskModel =
  mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema)
