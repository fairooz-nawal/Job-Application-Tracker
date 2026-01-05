import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const db = await dbConnect()
    const followUps = db.collection("follow_ups")

    const searchParams = request.nextUrl.searchParams
    const completed = searchParams.get("completed")

    let query = {}

    if (completed === "false") {
      query = { completed: false }
    } else if (completed === "true") {
      query = { completed: true }
    }

    const followUpList = await followUps.find(query).sort({ followUpDate: 1 }).toArray()

    return NextResponse.json(followUpList)
  } catch (error) {
    console.error("[v0] Error fetching follow-ups:", error)
    return NextResponse.json({ error: "Failed to fetch follow-ups" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await dbConnect()
    const followUps = db.collection("follow_ups")

    const body = await request.json()

    const result = await followUps.insertOne({
      ...body,
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const followUp = await followUps.findOne({ _id: result.insertedId })

    return NextResponse.json(followUp, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating follow-up:", error)
    return NextResponse.json({ error: "Failed to create follow-up" }, { status: 500 })
  }
}
