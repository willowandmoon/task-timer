import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { HistoryModel } from '@/lib/models/History'
import { cleanupExpiredDoneTasks } from '@/lib/cleanup'

export async function GET() {
  await connectDB()
  await cleanupExpiredDoneTasks()
  const history = await HistoryModel.find().sort({ archivedAt: -1 }).lean()
  return NextResponse.json(
    history.map((h) => ({
      id: h._id.toString(),
      title: h.title,
      reason: h.reason,
      inProgressDuration: h.inProgressDuration ?? null,
      archivedAt: h.archivedAt,
      originalCreatedAt: h.originalCreatedAt,
    }))
  )
}
