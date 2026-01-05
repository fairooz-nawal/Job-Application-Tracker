import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import dbConnect from "@/lib/db"
import {
  sendEmail,
  generateInterviewReminderEmail,
  generateFollowUpReminderEmail,
  generateTaskReminderEmail,
} from "@/lib/email"

export async function POST(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await dbConnect()
    const interviews = db.collection("interviews")
    const followUps = db.collection("follow_ups")
    const tasks = db.collection("tasks")

    const results = {
      interviewReminders: 0,
      followUpReminders: 0,
      taskReminders: 0,
      errors: [] as string[],
    }

    // Send interview reminders (24 hours before)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const dayAfter = new Date(tomorrow)
    dayAfter.setDate(dayAfter.getDate() + 1)

    const upcomingInterviews = await interviews
      .find({
        interviewDate: { $gte: tomorrow, $lt: dayAfter },
        completed: false,
      })
      .toArray()

    for (const interview of upcomingInterviews) {
      if (!process.env.EMAIL_USER) continue

      const emailContent = generateInterviewReminderEmail(
        interview.company,
        interview.position,
        new Date(interview.interviewDate).toLocaleDateString(),
        interview.interviewTime,
      )

      const result = await sendEmail({
        to: process.env.EMAIL_USER,
        subject: emailContent.subject,
        html: emailContent.html,
      })

      if (result.success) {
        results.interviewReminders++
      } else {
        results.errors.push(`Failed to send interview reminder for ${interview.company}`)
      }
    }

    // Send follow-up reminders (on the day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEnd = new Date(today)
    todayEnd.setDate(todayEnd.getDate() + 1)

    const dueFollowUps = await followUps
      .find({
        followUpDate: { $gte: today, $lt: todayEnd },
        completed: false,
        reminderSent: false,
      })
      .toArray()

    for (const followUp of dueFollowUps) {
      if (!process.env.EMAIL_USER) continue

      const emailContent = generateFollowUpReminderEmail(
        followUp.company,
        followUp.position,
        new Date(followUp.followUpDate).toLocaleDateString(),
        followUp.method,
      )

      const result = await sendEmail({
        to: process.env.EMAIL_USER,
        subject: emailContent.subject,
        html: emailContent.html,
      })

      if (result.success) {
        results.followUpReminders++
        await followUps.updateOne({ _id: new ObjectId(followUp._id) }, { $set: { reminderSent: true } })
      } else {
        results.errors.push(`Failed to send follow-up reminder for ${followUp.company}`)
      }
    }

    // Send task reminders (on the day)
    const dueTasks = await tasks
      .find({
        dueDate: { $gte: today, $lt: todayEnd },
        completed: false,
      })
      .toArray()

    for (const task of dueTasks) {
      if (!process.env.EMAIL_USER) continue

      const emailContent = generateTaskReminderEmail(
        task.title,
        new Date(task.dueDate).toLocaleDateString(),
        task.priority,
      )

      const result = await sendEmail({
        to: process.env.EMAIL_USER,
        subject: emailContent.subject,
        html: emailContent.html,
      })

      if (result.success) {
        results.taskReminders++
      } else {
        results.errors.push(`Failed to send task reminder: ${task.title}`)
      }
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error("[v0] Error sending reminders:", error)
    return NextResponse.json({ error: "Failed to send reminders" }, { status: 500 })
  }
}
