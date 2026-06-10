import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/db'
import { CommentModel } from '@/lib/models/Comment'
import { TaskModel } from '@/lib/models/Task'

export async function POST(req: Request) {
  await connectDB()
  const { todoId, content } = await req.json()

  if (!todoId || !mongoose.Types.ObjectId.isValid(todoId)) {
    return NextResponse.json({ error: 'todoId inválido' }, { status: 400 })
  }
  if (!content?.trim()) {
    return NextResponse.json({ error: 'El contenido es requerido' }, { status: 400 })
  }

  const task = await TaskModel.findById(todoId)
  if (!task) {
    return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 })
  }

  const comment = await CommentModel.create({ todoId, content: content.trim() })

  return NextResponse.json(
    {
      id: comment._id.toString(),
      todoId: comment.todoId.toString(),
      content: comment.content,
      createdAt: comment.createdAt,
    },
    { status: 201 }
  )
}
