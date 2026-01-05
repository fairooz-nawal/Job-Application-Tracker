import { InterviewList } from "@/components/interview-list"
import { InterviewFormDialog } from "@/components/interview-form-dialog"

export default function InterviewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interviews</h1>
          <p className="text-muted-foreground">Manage and track your scheduled interviews</p>
        </div>
        <InterviewFormDialog />
      </div>
      <InterviewList />
    </div>
  )
}
