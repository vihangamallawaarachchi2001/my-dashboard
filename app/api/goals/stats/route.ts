import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase, Goal } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    // Get all goals
    const goals = await Goal.find().exec()

    // Calculate average progress
    const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0)
    const averageProgress = goals.length > 0 ? Math.round(totalProgress / goals.length) : 0

    // Count goals by category
    const categories = ["work", "study", "startup", "personal"]
    const categoryCounts: Record<string, number> = {}

    for (const category of categories) {
      categoryCounts[category] = goals.filter((goal) => goal.category === category).length
    }

    // Count completed goals
    const completedGoals = goals.filter((goal) => goal.progress === 100).length

    // Count goals due soon (within next 30 days)
    const today = new Date()
    const thirtyDaysLater = new Date(today)
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)

    const dueSoon = goals.filter((goal) => {
      const targetDate = new Date(goal.targetDate)
      return targetDate >= today && targetDate <= thirtyDaysLater && goal.progress < 100
    }).length

    return NextResponse.json({
      total: goals.length,
      completed: completedGoals,
      dueSoon,
      progress: averageProgress,
      categoryBreakdown: categoryCounts,
    })
  } catch (error) {
    console.error("Error fetching goal stats:", error)
    return NextResponse.json({ error: "Failed to fetch goal stats" }, { status: 500 })
  }
}
