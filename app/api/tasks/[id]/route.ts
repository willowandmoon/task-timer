import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { TaskModel } from '@/lib/models/Task'
import { HistoryModel } from '@/lib/models/History'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB()
  const { id } = await params
  const { status } = await req.json()

  const current = await TaskModel.findById(id)
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const update: Record<string, unknown> = { status }

  if (status === 'inprogress') {
    update.startedAt = new Date()
  }

  if (status === 'done') {
    const now = new Date()
    update.doneAt = now
    if (current.startedAt) {
      update.inProgressDuration = Math.floor(
        (now.getTime() - current.startedAt.getTime()) / 1000
      )
    }
  }

  // strict: false ensures custom fields (startedAt, doneAt, inProgressDuration)
  // are saved even if the model was hot-reloaded with a cached old schema.
  const task = await TaskModel.findByIdAndUpdate(id, update, { new: true, strict: false })
  return NextResponse.json({
    id: task!._id.toString(),
    title: task!.title,
    status: task!.status,
    startedAt: task!.startedAt ?? null,
    doneAt: task!.doneAt ?? null,
    inProgressDuration: task!.inProgressDuration ?? null,
  })
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB()
  const { id } = await params
  const task = await TaskModel.findById(id)

  if (task) {
    await HistoryModel.create({
      title: task.title,
      reason: 'deleted',
      inProgressDuration: task.inProgressDuration,
      archivedAt: new Date(),
      originalCreatedAt: task.createdAt,
    })
    await task.deleteOne()
  }

  return NextResponse.json({ ok: true })
}
