import { TaskList } from "@/components/task-list"
import { TaskFormDialog } from "@/components/task-form-dialog"

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage your job search tasks and action items</p>
        </div>
        <TaskFormDialog />
      </div>
      <TaskList />
    </div>
  )
}
