import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/db'
import { TaskModel } from '@/lib/models/Task'

export async function GET(
  _: Request,
  { params }: { params: Promise<{ dato: string }> }
) {
  await connectDB()
  const { dato } = await params

  if (!mongoose.Types.ObjectId.isValid(dato)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const task = await TaskModel.findById(dato).lean()
  if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    id: task._id.toString(),
    title: task.title,
    status: task.status,
    startedAt: task.startedAt ?? null,
    doneAt: task.doneAt ?? null,
    inProgressDuration: task.inProgressDuration ?? null,
  })
}
