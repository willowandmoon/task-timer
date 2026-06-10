import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/db'
import { CommentModel } from '@/lib/models/Comment'

export async function GET(
  _: Request,
  { params }: { params: Promise<{ todoId: string }> }
) {
  await connectDB()
  const { todoId } = await params

  if (!mongoose.Types.ObjectId.isValid(todoId)) {
    return NextResponse.json({ error: 'Invalid todoId' }, { status: 400 })
  }

  const comments = await CommentModel.find({ todoId })
    .sort({ createdAt: 1 })
    .lean()

  return NextResponse.json(
    comments.map((c) => ({
      id: c._id.toString(),
      todoId: c.todoId.toString(),
      content: c.content,
      createdAt: c.createdAt,
    }))
  )
}
