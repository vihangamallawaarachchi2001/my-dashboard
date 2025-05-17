import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase, Goal } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")

    // Build query
    const query: any = {}
    if (category) query.category = category

    // Get goals
    const goals = await Goal.find(query).sort({ targetDate: 1 }).exec()

    return NextResponse.json(goals)
  } catch (error) {
    console.error("Error fetching goals:", error)
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const goalData = await request.json()

    // Validate required fields
    if (!goalData.title || !goalData.category || !goalData.targetDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create goal with defaults
    const goal = new Goal({
      title: goalData.title,
      description: goalData.description || "",
      category: goalData.category,
      targetDate: goalData.targetDate,
      progress: 0,
      metrics: goalData.metrics || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    const savedGoal = await goal.save()

    return NextResponse.json(savedGoal, { status: 201 })
  } catch (error) {
    console.error("Error creating goal:", error)
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 })
  }
}
