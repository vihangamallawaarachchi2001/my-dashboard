import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase, Habit } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    // Get the habit
    const habit = await Habit.findById(params.id).exec()

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 })
    }

    // Toggle completion status
    const completedToday = !habit.completedToday

    // Update streak
    let streak = habit.streak
    if (completedToday) {
      streak += 1
    } else {
      streak = Math.max(0, streak - 1)
    }

    // Get today's date (start of day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Update history
    const historyEntry = {
      date: today.toISOString(),
      completed: completedToday,
    }

    // Check if we already have an entry for today
    const history = [...habit.history]
    const todayEntryIndex = history.findIndex((entry) => new Date(entry.date).toDateString() === today.toDateString())

    if (todayEntryIndex >= 0) {
      // Update existing entry
      history[todayEntryIndex] = historyEntry
    } else {
      // Add new entry
      history.push(historyEntry)
    }

    // Update the habit
    habit.completedToday = completedToday
    habit.streak = streak
    habit.history = history
    habit.updatedAt = new Date().toISOString()

    const updatedHabit = await habit.save()

    return NextResponse.json(updatedHabit)
  } catch (error) {
    console.error("Error toggling habit:", error)
    return NextResponse.json({ error: "Failed to toggle habit" }, { status: 500 })
  }
}
