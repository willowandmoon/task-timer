import { TaskModel } from './models/Task'
import { HistoryModel } from './models/History'

export async function cleanupExpiredDoneTasks() {
  const tenSecondsAgo = new Date(Date.now() - 10_000)

  // Use updatedAt (always saved by Mongoose timestamps) instead of doneAt,
  // which can be null if the model was cached with an old schema during hot reload.
  const expired = await TaskModel.find({
    status: 'done',
    updatedAt: { $lte: tenSecondsAgo },
  })

  if (expired.length === 0) return

  await HistoryModel.insertMany(
    expired.map((t) => ({
      title: t.title,
      reason: 'done',
      inProgressDuration: t.inProgressDuration ?? null,
      archivedAt: new Date(),
      originalCreatedAt: (t.createdAt as Date) ?? new Date(),
    }))
  )
  await TaskModel.deleteMany({ _id: { $in: expired.map((t) => t._id) } })
}
