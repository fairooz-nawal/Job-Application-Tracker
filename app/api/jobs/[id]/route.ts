import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import dbConnect from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = await dbConnect()
    const jobs = db.collection("jobs")
    const { id } = await params

    const job = await jobs.findOne({ _id: new ObjectId(id) })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error("[v0] Error fetching job:", error)
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = await dbConnect()
    const jobs = db.collection("jobs")
    const { id } = await params
    const body = await request.json()

    const result = await jobs.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...body, lastUpdated: new Date(), updatedAt: new Date() } },
      { returnDocument: "after" },
    )

    if (!result) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error updating job:", error)
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = await dbConnect()
    const jobs = db.collection("jobs")
    const { id } = await params

    const result = await jobs.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Job deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting job:", error)
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 })
  }
}
