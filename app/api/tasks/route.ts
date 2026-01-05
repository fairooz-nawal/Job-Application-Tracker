import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const db = await dbConnect()
    const tasks = db.collection("tasks")

    const searchParams = request.nextUrl.searchParams
    const completed = searchParams.get("completed")

    let query = {}

    if (completed === "false") {
      query = { completed: false }
    } else if (completed === "true") {
      query = { completed: true }
    }

    const taskList = await tasks.find(query).sort({ dueDate: 1 }).toArray()

    return NextResponse.json(taskList)
  } catch (error) {
    console.error("[v0] Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await dbConnect()
    const tasks = db.collection("tasks")

    const body = await request.json()

    const result = await tasks.insertOne({
      ...body,
      dueDate: body.dueDate ? new Date(body.dueDate) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const task = await tasks.findOne({ _id: result.insertedId })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
