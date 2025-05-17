import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase, TimeBlock } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    // Get today's date (start of day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get time blocks for today
    const todayBlocks = await TimeBlock.find({
      startTime: {
        $gte: today.toISOString(),
        $lt: tomorrow.toISOString(),
      },
    }).exec()

    // Calculate total focus hours for today
    let focusHours = 0
    todayBlocks.forEach((block) => {
      const startTime = new Date(block.startTime)
      const endTime = new Date(block.endTime)
      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
      focusHours += durationHours
    })

    // Get time blocks by category
    const categories = ["work", "study", "startup", "personal"]
    const categoryStats: Record<string, number> = {}

    for (const category of categories) {
      const categoryBlocks = todayBlocks.filter((block) => block.category === category)
      let categoryHours = 0

      categoryBlocks.forEach((block) => {
        const startTime = new Date(block.startTime)
        const endTime = new Date(block.endTime)
        const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
        categoryHours += durationHours
      })

      categoryStats[category] = Number.parseFloat(categoryHours.toFixed(1))
    }

    return NextResponse.json({
      focusHours: Number.parseFloat(focusHours.toFixed(1)),
      blockCount: todayBlocks.length,
      categoryBreakdown: categoryStats,
    })
  } catch (error) {
    console.error("Error fetching time block stats:", error)
    return NextResponse.json({ error: "Failed to fetch time block stats" }, { status: 500 })
  }
}
