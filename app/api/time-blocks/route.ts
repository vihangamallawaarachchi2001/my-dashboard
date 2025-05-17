import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase, TimeBlock } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const searchParams = request.nextUrl.searchParams
    const dateParam = searchParams.get("date")

    let query: any = {}

    if (dateParam) {
      // Get blocks for specific date
      const date = new Date(dateParam)
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)

      query = {
        startTime: {
          $gte: date.toISOString(),
          $lt: nextDay.toISOString(),
        },
      }
    }

    // Get time blocks
    const timeBlocks = await TimeBlock.find(query).sort({ startTime: 1 }).exec()

    return NextResponse.json(timeBlocks)
  } catch (error) {
    console.error("Error fetching time blocks:", error)
    return NextResponse.json({ error: "Failed to fetch time blocks" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const blockData = await request.json()

    // Validate required fields
    if (!blockData.title || !blockData.category || !blockData.startTime || !blockData.endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate time range
    const startTime = new Date(blockData.startTime)
    const endTime = new Date(blockData.endTime)

    if (startTime >= endTime) {
      return NextResponse.json({ error: "End time must be after start time" }, { status: 400 })
    }

    // Check for overlapping blocks
    const overlappingBlock = await TimeBlock.findOne({
      $or: [
        {
          startTime: {
            $lt: blockData.endTime,
          },
          endTime: {
            $gt: blockData.startTime,
          },
        },
      ],
    }).exec()

    if (overlappingBlock) {
      return NextResponse.json({ error: "Time block overlaps with an existing block" }, { status: 400 })
    }

    // Create time block
    const timeBlock = new TimeBlock({
      title: blockData.title,
      category: blockData.category,
      startTime: blockData.startTime,
      endTime: blockData.endTime,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    const savedTimeBlock = await timeBlock.save()

    return NextResponse.json(savedTimeBlock, { status: 201 })
  } catch (error) {
    console.error("Error creating time block:", error)
    return NextResponse.json({ error: "Failed to create time block" }, { status: 500 })
  }
}
