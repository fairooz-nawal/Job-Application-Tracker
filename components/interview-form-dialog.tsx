"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"
import type { IInterview, IJob } from "@/types"

interface InterviewFormDialogProps {
  interview?: IInterview
  onSuccess?: () => void
}

export function InterviewFormDialog({ interview, onSuccess }: InterviewFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [jobs, setJobs] = useState<IJob[]>([])
  const { toast } = useToast()

  const isEditing = !!interview

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch("/api/jobs")
        if (response.ok) {
          const data = await response.json()
          setJobs(data)
        }
      } catch (error) {
        console.error("[v0] Error fetching jobs:", error)
      }
    }

    if (open) {
      fetchJobs()
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const jobId = formData.get("jobId")
    const selectedJob = jobs.find((j) => j._id === jobId)

    const data = {
      jobId,
      company: selectedJob?.company || formData.get("company"),
      position: selectedJob?.position || formData.get("position"),
      interviewDate: formData.get("interviewDate"),
      interviewTime: formData.get("interviewTime"),
      interviewType: formData.get("interviewType"),
      location: formData.get("location"),
      meetingLink: formData.get("meetingLink"),
      interviewerName: formData.get("interviewerName"),
      interviewerEmail: formData.get("interviewerEmail"),
      notes: formData.get("notes"),
      preparation: formData.get("preparation"),
      completed: formData.get("completed") === "true",
    }

    try {
      const url = isEditing ? `/api/interviews/${interview._id}` : "/api/interviews"
      const method = isEditing ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to save interview")

      toast({
        title: isEditing ? "Interview updated" : "Interview scheduled",
        description: isEditing
          ? "Interview details have been updated successfully"
          : "New interview has been scheduled",
      })

      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("[v0] Error saving interview:", error)
      toast({
        title: "Error",
        description: "Failed to save interview",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="outline" size="sm">
            Edit
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Interview
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Interview" : "Schedule New Interview"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the interview details" : "Fill in the details for your upcoming interview"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="jobId">Select Job Application</Label>
              <Select name="jobId" required>
                <SelectTrigger id="jobId">
                  <SelectValue placeholder="Choose a job application" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job._id} value={job._id!}>
                      {job.company} - {job.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isEditing && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="company">Company *</Label>
                <Input id="company" name="company" defaultValue={interview.company} required />
              </div>
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="position">Position *</Label>
                <Input id="position" name="position" defaultValue={interview.position} required />
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="interviewDate">Date *</Label>
              <Input
                id="interviewDate"
                name="interviewDate"
                type="date"
                defaultValue={
                  interview?.interviewDate ? new Date(interview.interviewDate).toISOString().split("T")[0] : ""
                }
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="interviewTime">Time *</Label>
              <Input
                id="interviewTime"
                name="interviewTime"
                type="time"
                defaultValue={interview?.interviewTime}
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="interviewType">Type *</Label>
              <Select name="interviewType" defaultValue={interview?.interviewType || "phone"}>
                <SelectTrigger id="interviewType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="in-person">In-Person</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="panel">Panel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" defaultValue={interview?.location} placeholder="Address or City" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meetingLink">Meeting Link</Label>
              <Input
                id="meetingLink"
                name="meetingLink"
                type="url"
                defaultValue={interview?.meetingLink}
                placeholder="Zoom, Teams, Meet URL"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="interviewerName">Interviewer Name</Label>
              <Input id="interviewerName" name="interviewerName" defaultValue={interview?.interviewerName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interviewerEmail">Interviewer Email</Label>
              <Input
                id="interviewerEmail"
                name="interviewerEmail"
                type="email"
                defaultValue={interview?.interviewerEmail}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preparation">Preparation Notes</Label>
            <Textarea
              id="preparation"
              name="preparation"
              defaultValue={interview?.preparation}
              placeholder="Topics to review, questions to prepare, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={interview?.notes}
              placeholder="Any other relevant information..."
              rows={3}
            />
          </div>

          {isEditing && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="completed"
                name="completed"
                defaultChecked={interview.completed}
                value="true"
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="completed" className="font-normal">
                Mark as completed
              </Label>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Update" : "Schedule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
