import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"

export async function GET() {
  try {
    const db = await dbConnect()
    const jobs = db.collection("jobs")
    const interviews = db.collection("interviews")
    const tasks = db.collection("tasks")
    const followUps = db.collection("follow_ups")

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get this week's date range
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const [
      totalApplications,
      todayApplications,
      weekApplications,
      statusCounts,
      upcomingInterviews,
      pendingTasks,
      pendingFollowUps,
    ] = await Promise.all([
      jobs.countDocuments(),
      jobs.countDocuments({ appliedDate: { $gte: today, $lt: tomorrow } }),
      jobs.countDocuments({ appliedDate: { $gte: weekStart, $lt: weekEnd } }),
      jobs
        .aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ])
        .toArray(),
      interviews.countDocuments({
        interviewDate: { $gte: today },
        completed: false,
      }),
      tasks.countDocuments({ completed: false }),
      followUps.countDocuments({ completed: false }),
    ])

    // Process status counts
    const statusMap = statusCounts.reduce((acc: Record<string, number>, item: { _id: string; count: number }) => {
      acc[item._id] = item.count
      return acc
    }, {})

    return NextResponse.json({
      totalApplications,
      todayApplications,
      weekApplications,
      dailyGoal: 10,
      progressPercentage: Math.min((todayApplications / 10) * 100, 100),
      statusCounts: {
        applied: statusMap.applied || 0,
        followUp: statusMap["follow-up"] || 0,
        interview: statusMap.interview || 0,
        task: statusMap.task || 0,
        rejected: statusMap.rejected || 0,
      },
      upcomingInterviews,
      pendingTasks,
      pendingFollowUps,
    })
  } catch (error) {
    console.error("[v0] Error fetching statistics:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}
