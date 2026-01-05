"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { JobFormDialog } from "@/components/job-form-dialog"
import { useToast } from "@/hooks/use-toast"
import { Calendar, ExternalLink, Mail, MapPin, Phone, Search, Trash2 } from "lucide-react"
import type { IJob } from "@/types"

const statusColors = {
  applied: "bg-emerald-500",
  "follow-up": "bg-amber-500",
  interview: "bg-blue-500",
  task: "bg-orange-500",
  rejected: "bg-red-500",
}

const statusLabels = {
  applied: "Applied",
  "follow-up": "Follow-up",
  interview: "Interview",
  task: "Task",
  rejected: "Rejected",
}

export function JobList() {
  const [jobs, setJobs] = useState<IJob[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState("all")
  const [search, setSearch] = useState("")
  const { toast } = useToast()

  async function fetchJobs() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (status !== "all") params.append("status", status)
      if (search) params.append("search", search)

      const response = await fetch(`/api/jobs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setJobs(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [status, search])

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this job application?")) return

    try {
      const response = await fetch(`/api/jobs/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete job")

      toast({
        title: "Job deleted",
        description: "Job application has been removed",
      })

      fetchJobs()
    } catch (error) {
      console.error("[v0] Error deleting job:", error)
      toast({
        title: "Error",
        description: "Failed to delete job application",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="follow-up">Follow-up</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="task">Task</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
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
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              {search || status !== "all" ? "No applications found matching your filters" : "No job applications yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job._id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{job.company}</CardTitle>
                    <CardDescription>{job.position}</CardDescription>
                  </div>
                  <Badge className={statusColors[job.status]}>{statusLabels[job.status]}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-2 text-sm">
                {job.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{job.location}</span>
                  </div>
                )}
                {job.salaryRange && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="font-medium">Salary:</span>
                    <span>{job.salaryRange}</span>
                  </div>
                )}
                {job.contactEmail && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{job.contactEmail}</span>
                  </div>
                )}
                {job.contactPhone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{job.contactPhone}</span>
                  </div>
                )}
                {job.appliedDate && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Applied: {new Date(job.appliedDate).toLocaleDateString()}</span>
                  </div>
                )}
                {job.notes && <p className="text-muted-foreground line-clamp-2 mt-2 pt-2 border-t">{job.notes}</p>}
              </CardContent>
              <CardFooter className="flex gap-2">
                {job.jobUrl && (
                  <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                    <a href={job.jobUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      View Job
                    </a>
                  </Button>
                )}
                <JobFormDialog job={job} onSuccess={fetchJobs} />
                <Button variant="outline" size="sm" onClick={() => handleDelete(job._id!)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
