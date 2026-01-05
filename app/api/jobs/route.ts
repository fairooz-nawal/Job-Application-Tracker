import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const db = await dbConnect()
    const jobs = db.collection("jobs")

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const query: Record<string, unknown> = {}

    if (status && status !== "all") {
      query.status = status
    }

    if (search) {
      query.$or = [{ company: { $regex: search, $options: "i" } }, { position: { $regex: search, $options: "i" } }]
    }

    const jobList = await jobs.find(query).sort({ lastUpdated: -1 }).toArray()

    return NextResponse.json(jobList)
  } catch (error) {
    console.error("[v0] Error fetching jobs:", error)
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await dbConnect()
    const jobs = db.collection("jobs")

    const body = await request.json()

    const result = await jobs.insertOne({
      ...body,
      appliedDate: body.appliedDate ? new Date(body.appliedDate) : new Date(),
      lastUpdated: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const job = await jobs.findOne({ _id: result.insertedId })

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating job:", error)
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
  }
}
