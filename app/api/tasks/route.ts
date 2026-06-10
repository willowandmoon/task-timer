import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { TaskModel } from '@/lib/models/Task'
import { CommentModel } from '@/lib/models/Comment'

export async function GET() {
  await connectDB()

  const tasks = await TaskModel.find().sort({ createdAt: -1 }).lean()

  // commentCount is computed with an aggregation — never stored on the task.
  const counts = await CommentModel.aggregate([
    { $group: { _id: '$todoId', count: { $sum: 1 } } },
  ])
  const countByTodoId = new Map<string, number>(
    counts.map((c) => [c._id.toString(), c.count])
  )

  return NextResponse.json(
    tasks.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      status: t.status,
      startedAt: t.startedAt ?? null,
      doneAt: t.doneAt ?? null,
      inProgressDuration: t.inProgressDuration ?? null,
      commentCount: countByTodoId.get(t._id.toString()) ?? 0,
    }))
  )
}

export async function POST(req: Request) {
  await connectDB()
  const { title } = await req.json()
  if (!title?.trim()) {
    return NextResponse.json({ error: 'El título es requerido' }, { status: 400 })
  }
  const task = await TaskModel.create({ title: title.trim(), status: 'pending' })
  return NextResponse.json(
    { id: task._id.toString(), title: task.title, status: task.status, startedAt: null, inProgressDuration: null },
    { status: 201 }
  )
}
