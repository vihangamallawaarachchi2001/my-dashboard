import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase, Habit } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    // Get total habits
    const total = await Habit.countDocuments().exec()

    // Get completed habits for today
    const completed = await Habit.countDocuments({ completedToday: true }).exec()

    // Get all habits for streak calculations
    const habits = await Habit.find().exec()

    // Get average streak
    const totalStreak = habits.reduce((sum, habit) => sum + habit.streak, 0)
    const averageStreak = total > 0 ? Math.round(totalStreak / total) : 0

    // Get longest streak
    const longestStreak = habits.length > 0 ? Math.max(...habits.map((habit) => habit.streak)) : 0

    return NextResponse.json({
      total,
      completed,
      averageStreak,
      longestStreak,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    })
  } catch (error) {
    console.error("Error fetching habit stats:", error)
    return NextResponse.json({ error: "Failed to fetch habit stats" }, { status: 500 })
  }
}
