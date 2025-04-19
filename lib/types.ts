export type User = {
  id: string
  email: string
  name: string
}

export type Task = {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  status: "todo" | "in-progress" | "done"
  dueDate: string | null
  createdAt: string
  updatedAt: string
  completedAt: string | null
  hoursSpent: number | null
  userId: string
  source?: string // email, message, manual
}

export type TaskReport = {
  totalTasks: number
  completedTasks: number
  totalHoursSpent: number
  tasksByPriority: Record<string, number>
  tasksByStatus: Record<string, number>
}
