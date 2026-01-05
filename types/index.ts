import type { ObjectId } from "mongodb"

export interface IJob {
  _id?: ObjectId
  company: string
  position: string
  location?: string
  salaryRange?: string
  jobUrl?: string
  contactEmail?: string
  contactPhone?: string
  status: "applied" | "follow-up" | "interview" | "task" | "rejected"
  appliedDate: Date
  lastUpdated: Date
  notes?: string
  resumeVersion?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface IInterview {
  _id?: ObjectId
  jobId: ObjectId | string
  company: string
  position: string
  interviewDate: Date
  interviewTime: string
  interviewType: "phone" | "video" | "in-person" | "technical" | "panel"
  location?: string
  meetingLink?: string
  interviewerName?: string
  interviewerEmail?: string
  notes?: string
  preparation?: string
  completed: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface ITask {
  _id?: ObjectId
  jobId?: ObjectId | string
  company?: string
  title: string
  description?: string
  dueDate: Date
  priority: "low" | "medium" | "high"
  category: "application" | "follow-up" | "interview-prep" | "research" | "networking" | "other"
  completed: boolean
  completedDate?: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface IFollowUp {
  _id?: ObjectId
  jobId: ObjectId | string
  company: string
  position: string
  followUpDate: Date
  method: "email" | "phone" | "linkedin" | "in-person"
  recipientName?: string
  recipientEmail?: string
  message?: string
  completed: boolean
  completedDate?: Date
  reminderSent: boolean
  createdAt?: Date
  updatedAt?: Date
}
