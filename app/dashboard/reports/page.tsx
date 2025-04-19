"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import TaskReportComponent from "@/components/reports/task-report"
import type { Task } from "@/lib/types"
import { taskService } from "@/lib/db-service"

export default function ReportsPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadTasks() {
      try {
        const allTasks = await taskService.getAllTasks()
        setTasks(allTasks)
      } catch (error) {
        console.error("Error loading tasks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTasks()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Tabs defaultValue="reports">
      <TabsContent value="reports" className="space-y-4">
        <TaskReportComponent tasks={tasks} />
      </TabsContent>
    </Tabs>
  )
}
