import mongoose, { Schema, Document } from 'mongoose'

export interface IHistory extends Document {
  title: string
  reason: 'deleted' | 'done'
  inProgressDuration: number | null
  archivedAt: Date
  originalCreatedAt: Date
}

const HistorySchema = new Schema<IHistory>({
  title: { type: String, required: true },
  reason: { type: String, enum: ['deleted', 'done'], required: true },
  inProgressDuration: { type: Number, default: null },
  archivedAt: { type: Date, default: Date.now },
  originalCreatedAt: { type: Date, required: true },
})

export const HistoryModel =
  mongoose.models.History || mongoose.model<IHistory>('History', HistorySchema)
