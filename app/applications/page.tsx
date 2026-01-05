import { JobList } from "@/components/job-list"
import { JobFormDialog } from "@/components/job-form-dialog"

export default function ApplicationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Applications</h1>
          <p className="text-muted-foreground">Manage and track all your job applications</p>
        </div>
        <JobFormDialog />
      </div>
      <JobList />
    </div>
  )
}
