"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FollowUpFormDialog } from "@/components/follow-up-form-dialog"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Mail, Trash2 } from "lucide-react"
import type { IFollowUp } from "@/types"

const methodColors = {
  email: "bg-blue-500",
  phone: "bg-emerald-500",
  linkedin: "bg-indigo-500",
  "in-person": "bg-amber-500",
}

const methodLabels = {
  email: "Email",
  phone: "Phone",
  linkedin: "LinkedIn",
  "in-person": "In-Person",
}

export function FollowUpList() {
  const [followUps, setFollowUps] = useState<IFollowUp[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  async function fetchFollowUps() {
    setLoading(true)
    try {
      const response = await fetch("/api/follow-ups")
      if (response.ok) {
        const data = await response.json()
        setFollowUps(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching follow-ups:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFollowUps()
  }, [])

  async function handleComplete(id: string, completed: boolean) {
    try {
      const response = await fetch(`/api/follow-ups/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completed,
          completedDate: completed ? new Date() : null,
        }),
      })

      if (!response.ok) throw new Error("Failed to update follow-up")

      toast({
        title: completed ? "Follow-up completed" : "Follow-up reopened",
        description: completed ? "Follow-up has been marked as done" : "Follow-up reopened",
      })

      fetchFollowUps()
    } catch (error) {
      console.error("[v0] Error updating follow-up:", error)
      toast({
        title: "Error",
        description: "Failed to update follow-up",
        variant: "destructive",
      })
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this follow-up?")) return

    try {
      const response = await fetch(`/api/follow-ups/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete follow-up")

      toast({
        title: "Follow-up deleted",
        description: "Follow-up has been removed",
      })

      fetchFollowUps()
    } catch (error) {
      console.error("[v0] Error deleting follow-up:", error)
      toast({
        title: "Error",
        description: "Failed to delete follow-up",
        variant: "destructive",
      })
    }
  }

  const pendingFollowUps = followUps.filter((f) => !f.completed && new Date(f.followUpDate) >= new Date())
  const overdueFollowUps = followUps.filter((f) => !f.completed && new Date(f.followUpDate) < new Date())
  const completedFollowUps = followUps.filter((f) => f.completed)

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="h-6 w-32 bg-muted animate-pulse rounded" />
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  function FollowUpCard({ followUp, isOverdue = false }: { followUp: IFollowUp; isOverdue?: boolean }) {
    return (
      <Card className={followUp.completed ? "opacity-60" : ""}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{followUp.company}</CardTitle>
              <p className="text-sm text-muted-foreground">{followUp.position}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={methodColors[followUp.method]}>{methodLabels[followUp.method]}</Badge>
              {isOverdue && <Badge variant="destructive">Overdue</Badge>}
              {followUp.completed && <Badge variant="outline">Done</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <Calendar className="h-3.5 w-3.5" />
            <span>Follow-up: {new Date(followUp.followUpDate).toLocaleDateString()}</span>
          </div>
          {followUp.recipientName && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-medium">Contact:</span>
              <span>{followUp.recipientName}</span>
            </div>
          )}
          {followUp.recipientEmail && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate">{followUp.recipientEmail}</span>
            </div>
          )}
          {followUp.message && <p className="text-muted-foreground pt-2 border-t">{followUp.message}</p>}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-transparent"
            onClick={() => handleComplete(followUp._id!, !followUp.completed)}
          >
            {followUp.completed ? "Reopen" : "Complete"}
          </Button>
          <FollowUpFormDialog followUp={followUp} onSuccess={fetchFollowUps} />
          <Button variant="outline" size="sm" onClick={() => handleDelete(followUp._id!)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {overdueFollowUps.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-destructive">Overdue Follow-ups ({overdueFollowUps.length})</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {overdueFollowUps.map((followUp) => (
              <FollowUpCard key={followUp._id} followUp={followUp} isOverdue />
            ))}
          </div>
        </div>
      )}

      {pendingFollowUps.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upcoming Follow-ups ({pendingFollowUps.length})</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pendingFollowUps.map((followUp) => (
              <FollowUpCard key={followUp._id} followUp={followUp} />
            ))}
          </div>
        </div>
      )}

      {completedFollowUps.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Completed Follow-ups ({completedFollowUps.length})</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {completedFollowUps.map((followUp) => (
              <FollowUpCard key={followUp._id} followUp={followUp} />
            ))}
          </div>
        </div>
      )}

      {followUps.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">No follow-ups scheduled yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
