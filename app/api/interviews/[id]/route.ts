import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import dbConnect from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = await dbConnect()
    const interviews = db.collection("interviews")
    const { id } = await params

    const interview = await interviews.findOne({ _id: new ObjectId(id) })

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 })
    }

    return NextResponse.json(interview)
  } catch (error) {
    console.error("[v0] Error fetching interview:", error)
    return NextResponse.json({ error: "Failed to fetch interview" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = await dbConnect()
    const interviews = db.collection("interviews")
    const { id } = await params
    const body = await request.json()

    const result = await interviews.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...body, updatedAt: new Date() } },
      { returnDocument: "after" },
    )

    if (!result) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error updating interview:", error)
    return NextResponse.json({ error: "Failed to update interview" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = await dbConnect()
    const interviews = db.collection("interviews")
    const { id } = await params

    const result = await interviews.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Interview deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting interview:", error)
    return NextResponse.json({ error: "Failed to delete interview" }, { status: 500 })
  }
}
