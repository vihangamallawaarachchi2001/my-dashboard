import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase, JournalEntry } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const searchParams = request.nextUrl.searchParams
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? Number.parseInt(limitParam) : 0

    // Get journal entries
    let entriesQuery = JournalEntry.find().sort({ date: -1 })

    if (limit > 0) {
      entriesQuery = entriesQuery.limit(limit)
    }

    const entries = await entriesQuery.exec()

    return NextResponse.json(entries)
  } catch (error) {
    console.error("Error fetching journal entries:", error)
    return NextResponse.json({ error: "Failed to fetch journal entries" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const entryData = await request.json()

    // Validate required fields
    if (!entryData.content || !entryData.date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create journal entry with defaults
    const entry = new JournalEntry({
      date: entryData.date,
      content: entryData.content,
      mood: entryData.mood || "neutral",
      lessons: entryData.lessons || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    const savedEntry = await entry.save()

    return NextResponse.json(savedEntry, { status: 201 })
  } catch (error) {
    console.error("Error creating journal entry:", error)
    return NextResponse.json({ error: "Failed to create journal entry" }, { status: 500 })
  }
}
