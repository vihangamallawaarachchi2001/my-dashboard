import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase, Task } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    // Get today's date (start of day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get tomorrow's date (start of day)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get total tasks
    const total = await Task.countDocuments().exec()

    // Get completed tasks
    const completed = await Task.countDocuments({ completed: true }).exec()

    // Get tasks due today
    const dueToday = await Task.countDocuments({
      dueDate: {
        $gte: today.toISOString(),
        $lt: tomorrow.toISOString(),
      },
    }).exec()

    // Get overdue tasks
    const overdue = await Task.countDocuments({
      dueDate: { $lt: today.toISOString() },
      completed: false,
    }).exec()

    return NextResponse.json({
      total,
      completed,
      dueToday,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    })
  } catch (error) {
    console.error("Error fetching task stats:", error)
    return NextResponse.json({ error: "Failed to fetch task stats" }, { status: 500 })
  }
}
