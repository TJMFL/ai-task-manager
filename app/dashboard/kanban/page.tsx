"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import KanbanBoard from "@/components/tasks/kanban-board"
import type { Task } from "@/lib/types"
import { taskService, authService } from "@/lib/db-service"

export default function KanbanPage() {
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

  const handleTaskUpdate = async (updatedTask: Task) => {
    const result = await taskService.updateTask(updatedTask.id, updatedTask)
    if (result) {
      setTasks((prevTasks) => prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
    }
  }

  const handleTaskCreate = async (newTask: Partial<Task>) => {
    const user = await authService.getCurrentUser()
    if (!user) return

    const createdTask = await taskService.createTask({
      ...newTask,
      id: "",
      userId: user.email,
      status: "todo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      hoursSpent: null,
    } as Task)

    if (createdTask) {
      setTasks((prevTasks) => [...prevTasks, createdTask])
    }
  }

  const handleTaskDelete = async (taskId: string) => {
    const result = await taskService.deleteTask(taskId)
    if (result) {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
    }
  }

  const handleTaskComplete = async (taskId: string, hoursSpent: number) => {
    const result = await taskService.completeTask(taskId, hoursSpent)
    if (result) {
      setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? result : task)))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Tabs defaultValue="kanban">
      <TabsContent value="kanban" className="space-y-4">
        <KanbanBoard
          tasks={tasks}
          onTaskUpdate={handleTaskUpdate}
          onTaskCreate={handleTaskCreate}
          onTaskDelete={handleTaskDelete}
          onTaskComplete={handleTaskComplete}
        />
      </TabsContent>
    </Tabs>
  )
}
