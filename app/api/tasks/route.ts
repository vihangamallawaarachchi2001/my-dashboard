import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase, Task } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const searchParams = request.nextUrl.searchParams
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? Number.parseInt(limitParam) : 0
    const category = searchParams.get("category")
    const priority = searchParams.get("priority")
    const completed = searchParams.has("completed") ? searchParams.get("completed") === "true" : undefined

    // Build query
    const query: any = {}
    if (category) query.category = category
    if (priority) query.priority = priority
    if (completed !== undefined) query.completed = completed

    // Get tasks
    let tasksQuery = Task.find(query).sort({ dueDate: 1, priority: 1 })

    if (limit > 0) {
      tasksQuery = tasksQuery.limit(limit)
    }

    const tasks = await tasksQuery.exec()

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const taskData = await request.json()

    // Validate required fields
    if (!taskData.title || !taskData.priority || !taskData.category || !taskData.dueDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create task with defaults
    const task = new Task({
      title: taskData.title,
      description: taskData.description || "",
      priority: taskData.priority,
      category: taskData.category,
      completed: false,
      dueDate: taskData.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    const savedTask = await task.save()

    return NextResponse.json(savedTask, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
