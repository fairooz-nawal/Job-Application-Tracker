import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import dbConnect from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = await dbConnect()
    const followUps = db.collection("follow_ups")
    const { id } = await params
    const body = await request.json()

    const result = await followUps.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...body, updatedAt: new Date() } },
      { returnDocument: "after" },
    )

    if (!result) {
      return NextResponse.json({ error: "Follow-up not found" }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error updating follow-up:", error)
    return NextResponse.json({ error: "Failed to update follow-up" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = await dbConnect()
    const followUps = db.collection("follow_ups")
    const { id } = await params

    const result = await followUps.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Follow-up not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Follow-up deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting follow-up:", error)
    return NextResponse.json({ error: "Failed to delete follow-up" }, { status: 500 })
  }
}
