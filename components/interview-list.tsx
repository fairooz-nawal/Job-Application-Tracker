"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InterviewFormDialog } from "@/components/interview-form-dialog"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, ExternalLink, Mail, MapPin, Trash2, User, Video } from "lucide-react"
import type { IInterview } from "@/types"

const typeColors = {
  phone: "bg-blue-500",
  video: "bg-emerald-500",
  "in-person": "bg-amber-500",
  technical: "bg-purple-500",
  panel: "bg-orange-500",
}

const typeLabels = {
  phone: "Phone",
  video: "Video",
  "in-person": "In-Person",
  technical: "Technical",
  panel: "Panel",
}

const typeIcons = {
  phone: Clock,
  video: Video,
  "in-person": MapPin,
  technical: User,
  panel: User,
}

export function InterviewList() {
  const [interviews, setInterviews] = useState<IInterview[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  async function fetchInterviews() {
    setLoading(true)
    try {
      const response = await fetch("/api/interviews")
      if (response.ok) {
        const data = await response.json()
        setInterviews(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching interviews:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInterviews()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this interview?")) return

    try {
      const response = await fetch(`/api/interviews/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete interview")

      toast({
        title: "Interview deleted",
        description: "Interview has been removed",
      })

      fetchInterviews()
    } catch (error) {
      console.error("[v0] Error deleting interview:", error)
      toast({
        title: "Error",
        description: "Failed to delete interview",
        variant: "destructive",
      })
    }
  }

  async function handleComplete(id: string, completed: boolean) {
    try {
      const response = await fetch(`/api/interviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      })

      if (!response.ok) throw new Error("Failed to update interview")

      toast({
        title: completed ? "Interview marked as completed" : "Interview reopened",
        description: completed ? "Interview status updated" : "Interview marked as pending",
      })

      fetchInterviews()
    } catch (error) {
      console.error("[v0] Error updating interview:", error)
      toast({
        title: "Error",
        description: "Failed to update interview",
        variant: "destructive",
      })
    }
  }

  const upcomingInterviews = interviews.filter((i) => !i.completed && new Date(i.interviewDate) >= new Date())
  const pastInterviews = interviews.filter((i) => i.completed || new Date(i.interviewDate) < new Date())

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

  function InterviewCard({ interview }: { interview: IInterview }) {
    const TypeIcon = typeIcons[interview.interviewType]
    const isPast = new Date(interview.interviewDate) < new Date() || interview.completed

    return (
      <Card className={isPast ? "opacity-60" : ""}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{interview.company}</CardTitle>
              <CardDescription>{interview.position}</CardDescription>
            </div>
            <Badge className={typeColors[interview.interviewType]}>
              <TypeIcon className="h-3 w-3 mr-1" />
              {typeLabels[interview.interviewType]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(interview.interviewDate).toLocaleDateString()}</span>
            <Clock className="h-3.5 w-3.5 ml-2" />
            <span>{interview.interviewTime}</span>
          </div>
          {interview.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{interview.location}</span>
            </div>
          )}
          {interview.interviewerName && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>{interview.interviewerName}</span>
            </div>
          )}
          {interview.interviewerEmail && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate">{interview.interviewerEmail}</span>
            </div>
          )}
          {interview.preparation && (
            <p className="text-muted-foreground pt-2 border-t">
              <span className="font-medium">Prep: </span>
              {interview.preparation}
            </p>
          )}
          {interview.completed && <Badge variant="outline">Completed</Badge>}
        </CardContent>
        <CardFooter className="flex gap-2">
          {interview.meetingLink && (
            <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
              <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Join Meeting
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => handleComplete(interview._id!, !interview.completed)}>
            {interview.completed ? "Reopen" : "Complete"}
          </Button>
          <InterviewFormDialog interview={interview} onSuccess={fetchInterviews} />
          <Button variant="outline" size="sm" onClick={() => handleDelete(interview._id!)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {upcomingInterviews.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upcoming Interviews</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingInterviews.map((interview) => (
              <InterviewCard key={interview._id} interview={interview} />
            ))}
          </div>
        </div>
      )}

      {pastInterviews.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Past Interviews</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pastInterviews.map((interview) => (
              <InterviewCard key={interview._id} interview={interview} />
            ))}
          </div>
        </div>
      )}

      {interviews.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">No interviews scheduled yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
