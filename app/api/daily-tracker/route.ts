import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase, DailyLog } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const searchParams = request.nextUrl.searchParams
    const dateParam = searchParams.get("date")
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? Number.parseInt(limitParam) : 0

    const query: any = {}

    if (dateParam) {
      // Get log for specific date
      query.date = dateParam
    }

    // Get daily logs
    let logsQuery = DailyLog.find(query).sort({ date: -1 })

    if (limit > 0) {
      logsQuery = logsQuery.limit(limit)
    }

    const logs = await logsQuery.exec()

    return NextResponse.json(logs)
  } catch (error) {
    console.error("Error fetching daily logs:", error)
    return NextResponse.json({ error: "Failed to fetch daily logs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const logData = await request.json()

    // Validate required fields
    if (!logData.date || logData.sleep === undefined || logData.energy === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if log already exists for this date
    const existingLog = await DailyLog.findOne({ date: logData.date }).exec()

    if (existingLog) {
      return NextResponse.json({ error: "A log already exists for this date" }, { status: 400 })
    }

    // Create daily log with defaults
    const dailyLog = new DailyLog({
      date: logData.date,
      sleep: logData.sleep,
      energy: logData.energy,
      mood: logData.mood || "neutral",
      distractions: logData.distractions || [],
      timeSpent: logData.timeSpent || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    const savedLog = await dailyLog.save()

    return NextResponse.json(savedLog, { status: 201 })
  } catch (error) {
    console.error("Error creating daily log:", error)
    return NextResponse.json({ error: "Failed to create daily log" }, { status: 500 })
  }
}
