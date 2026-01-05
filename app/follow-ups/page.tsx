import { FollowUpList } from "@/components/follow-up-list"
import { FollowUpFormDialog } from "@/components/follow-up-form-dialog"

export default function FollowUpsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Follow-ups</h1>
          <p className="text-muted-foreground">Track and manage follow-ups for your applications</p>
        </div>
        <FollowUpFormDialog />
      </div>
      <FollowUpList />
    </div>
  )
}
