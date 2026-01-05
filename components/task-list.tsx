"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { TaskFormDialog } from "@/components/task-form-dialog"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Trash2 } from "lucide-react"
import type { ITask } from "@/types"

const priorityColors = {
  low: "bg-blue-500",
  medium: "bg-amber-500",
  high: "bg-red-500",
}

const categoryLabels = {
  application: "Application",
  "follow-up": "Follow-up",
  "interview-prep": "Interview Prep",
  research: "Research",
  networking: "Networking",
  other: "Other",
}

export function TaskList() {
  const [tasks, setTasks] = useState<ITask[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  async function fetchTasks() {
    setLoading(true)
    try {
      const response = await fetch("/api/tasks")
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  async function handleToggleComplete(id: string, completed: boolean) {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completed,
          completedDate: completed ? new Date() : null,
        }),
      })

      if (!response.ok) throw new Error("Failed to update task")

      fetchTasks()
    } catch (error) {
      console.error("[v0] Error updating task:", error)
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      })
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this task?")) return

    try {
      const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete task")

      toast({
        title: "Task deleted",
        description: "Task has been removed",
      })

      fetchTasks()
    } catch (error) {
      console.error("[v0] Error deleting task:", error)
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      })
    }
  }

  const pendingTasks = tasks.filter((t) => !t.completed)
  const completedTasks = tasks.filter((t) => t.completed)

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-5 w-5 bg-muted animate-pulse rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-48 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  function TaskCard({ task }: { task: ITask }) {
    const isOverdue = new Date(task.dueDate) < new Date() && !task.completed

    return (
      <Card className={task.completed ? "opacity-60" : ""}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Checkbox
              checked={task.completed}
              onCheckedChange={(checked) => handleToggleComplete(task._id!, checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className={`text-base ${task.completed ? "line-through" : ""}`}>{task.title}</CardTitle>
                <Badge className={priorityColors[task.priority]} variant="outline">
                  {task.priority}
                </Badge>
                <Badge variant="outline">{categoryLabels[task.category]}</Badge>
                {isOverdue && (
                  <Badge variant="destructive" className="bg-red-500">
                    Overdue
                  </Badge>
                )}
              </div>
              {task.company && <CardDescription>{task.company}</CardDescription>}
              {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                {task.completedDate && <span>• Completed: {new Date(task.completedDate).toLocaleDateString()}</span>}
              </div>
            </div>
            <div className="flex gap-1">
              <TaskFormDialog task={task} onSuccess={fetchTasks} />
              <Button variant="outline" size="sm" onClick={() => handleDelete(task._id!)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {pendingTasks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Pending Tasks ({pendingTasks.length})</h2>
          {pendingTasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Completed Tasks ({completedTasks.length})</h2>
          {completedTasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>
      )}

      {tasks.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">No tasks yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
