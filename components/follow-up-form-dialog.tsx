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
import type { IFollowUp, IJob } from "@/types"

interface FollowUpFormDialogProps {
  followUp?: IFollowUp
  onSuccess?: () => void
}

export function FollowUpFormDialog({ followUp, onSuccess }: FollowUpFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [jobs, setJobs] = useState<IJob[]>([])
  const { toast } = useToast()

  const isEditing = !!followUp

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
      followUpDate: formData.get("followUpDate"),
      method: formData.get("method"),
      recipientName: formData.get("recipientName"),
      recipientEmail: formData.get("recipientEmail"),
      message: formData.get("message"),
      completed: formData.get("completed") === "true",
    }

    try {
      const url = isEditing ? `/api/follow-ups/${followUp._id}` : "/api/follow-ups"
      const method = isEditing ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to save follow-up")

      toast({
        title: isEditing ? "Follow-up updated" : "Follow-up scheduled",
        description: isEditing ? "Follow-up has been updated successfully" : "New follow-up has been scheduled",
      })

      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("[v0] Error saving follow-up:", error)
      toast({
        title: "Error",
        description: "Failed to save follow-up",
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
            Schedule Follow-up
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Follow-up" : "Schedule New Follow-up"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the follow-up details" : "Schedule a follow-up for a job application"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing ? (
            <div className="space-y-2">
              <Label htmlFor="jobId">Select Job Application *</Label>
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
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input id="company" name="company" defaultValue={followUp.company} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Input id="position" name="position" defaultValue={followUp.position} required />
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="followUpDate">Follow-up Date *</Label>
              <Input
                id="followUpDate"
                name="followUpDate"
                type="date"
                defaultValue={followUp?.followUpDate ? new Date(followUp.followUpDate).toISOString().split("T")[0] : ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">Method *</Label>
              <Select name="method" defaultValue={followUp?.method || "email"}>
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="in-person">In-Person</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="recipientName">Recipient Name</Label>
              <Input id="recipientName" name="recipientName" defaultValue={followUp?.recipientName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Recipient Email</Label>
              <Input id="recipientEmail" name="recipientEmail" type="email" defaultValue={followUp?.recipientEmail} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message/Notes</Label>
            <Textarea
              id="message"
              name="message"
              defaultValue={followUp?.message}
              placeholder="What you want to mention in the follow-up..."
              rows={4}
            />
          </div>

          {isEditing && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="completed"
                name="completed"
                defaultChecked={followUp.completed}
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
