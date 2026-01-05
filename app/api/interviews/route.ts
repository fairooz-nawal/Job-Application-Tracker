import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const db = await dbConnect()
    const interviews = db.collection("interviews")

    const searchParams = request.nextUrl.searchParams
    const upcoming = searchParams.get("upcoming")

    let query = {}

    if (upcoming === "true") {
      query = { interviewDate: { $gte: new Date() }, completed: false }
    }

    const interviewList = await interviews.find(query).sort({ interviewDate: 1, interviewTime: 1 }).toArray()

    return NextResponse.json(interviewList)
  } catch (error) {
    console.error("[v0] Error fetching interviews:", error)
    return NextResponse.json({ error: "Failed to fetch interviews" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await dbConnect()
    const interviews = db.collection("interviews")

    const body = await request.json()

    const result = await interviews.insertOne({
      ...body,
      interviewDate: body.interviewDate ? new Date(body.interviewDate) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const interview = await interviews.findOne({ _id: result.insertedId })

    return NextResponse.json(interview, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating interview:", error)
    return NextResponse.json({ error: "Failed to create interview" }, { status: 500 })
  }
}
