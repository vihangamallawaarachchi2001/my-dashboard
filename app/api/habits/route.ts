import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase, Habit } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const searchParams = request.nextUrl.searchParams
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? Number.parseInt(limitParam) : 0

    // Get habits
    let habitsQuery = Habit.find().sort({ streak: -1 })

    if (limit > 0) {
      habitsQuery = habitsQuery.limit(limit)
    }

    const habits = await habitsQuery.exec()

    return NextResponse.json(habits)
  } catch (error) {
    console.error("Error fetching habits:", error)
    return NextResponse.json({ error: "Failed to fetch habits" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const habitData = await request.json()

    // Validate required fields
    if (!habitData.name || !habitData.frequency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create habit with defaults
    const habit = new Habit({
      name: habitData.name,
      description: habitData.description || "",
      frequency: habitData.frequency,
      streak: 0,
      completedToday: false,
      history: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    const savedHabit = await habit.save()

    return NextResponse.json(savedHabit, { status: 201 })
  } catch (error) {
    console.error("Error creating habit:", error)
    return NextResponse.json({ error: "Failed to create habit" }, { status: 500 })
  }
}
