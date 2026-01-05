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
import type { ITask, IJob } from "@/types"

interface TaskFormDialogProps {
  task?: ITask
  onSuccess?: () => void
}

export function TaskFormDialog({ task, onSuccess }: TaskFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [jobs, setJobs] = useState<IJob[]>([])
  const { toast } = useToast()

  const isEditing = !!task

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
      jobId: jobId || undefined,
      company: selectedJob?.company || formData.get("company"),
      title: formData.get("title"),
      description: formData.get("description"),
      dueDate: formData.get("dueDate"),
      priority: formData.get("priority"),
      category: formData.get("category"),
      completed: formData.get("completed") === "true",
    }

    try {
      const url = isEditing ? `/api/tasks/${task._id}` : "/api/tasks"
      const method = isEditing ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to save task")

      toast({
        title: isEditing ? "Task updated" : "Task created",
        description: isEditing ? "Task has been updated successfully" : "New task has been added",
      })

      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("[v0] Error saving task:", error)
      toast({
        title: "Error",
        description: "Failed to save task",
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
            Add Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the task details" : "Add a new task to your job search workflow"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input id="title" name="title" defaultValue={task?.title} required placeholder="e.g., Update resume" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobId">Related Job (Optional)</Label>
            <Select name="jobId" defaultValue={task?.jobId?.toString() || "none"}>
              <SelectTrigger id="jobId">
                <SelectValue placeholder="Select a job application" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job._id} value={job._id!}>
                    {job.company} - {job.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!task?.jobId && (
            <div className="space-y-2">
              <Label htmlFor="company">Company (if not linked to job)</Label>
              <Input id="company" name="company" defaultValue={task?.company} placeholder="Optional" />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" defaultValue={task?.priority || "medium"}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={task?.category || "other"}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="application">Application</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="interview-prep">Interview Prep</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={task?.description}
              placeholder="Additional details about this task..."
              rows={4}
            />
          </div>

          {isEditing && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="completed"
                name="completed"
                defaultChecked={task.completed}
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
              {loading ? "Saving..." : isEditing ? "Update" : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
