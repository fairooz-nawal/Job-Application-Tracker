"use client"

import type React from "react"

import { useState } from "react"
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
import type { IJob } from "@/types"

interface JobFormDialogProps {
  job?: IJob
  onSuccess?: () => void
}

export function JobFormDialog({ job, onSuccess }: JobFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const isEditing = !!job

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      company: formData.get("company"),
      position: formData.get("position"),
      location: formData.get("location"),
      salaryRange: formData.get("salaryRange"),
      jobUrl: formData.get("jobUrl"),
      contactEmail: formData.get("contactEmail"),
      contactPhone: formData.get("contactPhone"),
      status: formData.get("status"),
      notes: formData.get("notes"),
      resumeVersion: formData.get("resumeVersion"),
    }

    try {
      const url = isEditing ? `/api/jobs/${job._id}` : "/api/jobs"
      const method = isEditing ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to save job")

      toast({
        title: isEditing ? "Job updated" : "Job added",
        description: isEditing ? "Job application has been updated successfully" : "New job application has been added",
      })

      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("[v0] Error saving job:", error)
      toast({
        title: "Error",
        description: "Failed to save job application",
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
            Add Application
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Job Application" : "Add New Job Application"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the job application details" : "Fill in the details for your new job application"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input id="company" name="company" defaultValue={job?.company} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Input id="position" name="position" defaultValue={job?.position} required />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" defaultValue={job?.location} placeholder="City, State" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryRange">Salary Range</Label>
              <Input
                id="salaryRange"
                name="salaryRange"
                defaultValue={job?.salaryRange}
                placeholder="$80,000 - $100,000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobUrl">Job Posting URL</Label>
            <Input id="jobUrl" name="jobUrl" type="url" defaultValue={job?.jobUrl} placeholder="https://..." />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                defaultValue={job?.contactEmail}
                placeholder="recruiter@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                defaultValue={job?.contactPhone}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={job?.status || "applied"}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="follow-up">Follow-up Needed</SelectItem>
                  <SelectItem value="interview">Interview Scheduled</SelectItem>
                  <SelectItem value="task">Task Required</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resumeVersion">Resume Version</Label>
              <Input
                id="resumeVersion"
                name="resumeVersion"
                defaultValue={job?.resumeVersion}
                placeholder="v2.0, Tech Resume, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={job?.notes}
              placeholder="Additional notes about this application..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Update" : "Add Application"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
