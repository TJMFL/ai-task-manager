"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import TaskExtractor from "@/components/ai/task-extractor"
import KanbanBoard from "@/components/tasks/kanban-board"
import type { Task } from "@/lib/types"
import { taskService, authService } from "@/lib/db-service"

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        // Get current user
        const currentUser = await authService.getCurrentUser()
        if (currentUser) {
          setUser({ id: currentUser.id, email: currentUser.email })
        }

        // Load all tasks
        const allTasks = await taskService.getAllTasks()
        setTasks(allTasks)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleTasksExtracted = async (extractedTasks: Partial<Task>[]) => {
    if (!user) return

    // Create tasks in the database
    const newTasks: Task[] = []

    for (const task of extractedTasks) {
      const createdTask = await taskService.createTask({
        ...task,
        id: "",
        userId: user.email,
        status: "todo",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null,
        hoursSpent: null,
      } as Task)

      if (createdTask) {
        newTasks.push(createdTask)
      }
    }

    // Update state
    setTasks((prevTasks) => [...prevTasks, ...newTasks])
  }

  const handleTaskUpdate = async (updatedTask: Task) => {
    const result = await taskService.updateTask(updatedTask.id, updatedTask)
    if (result) {
      setTasks((prevTasks) => prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
    }
  }

  const handleTaskCreate = async (newTask: Partial<Task>) => {
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
    <Tabs defaultValue="dashboard">
      <TabsContent value="dashboard" className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Task Board - Full Width and Above */}
          <Card className="w-full bg-blue-50 border-blue-200 shadow-lg shadow-blue-100">
            <CardHeader>
              <CardTitle>Task Board</CardTitle>
              <CardDescription>View and manage your tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <KanbanBoard
                tasks={tasks}
                onTaskUpdate={handleTaskUpdate}
                onTaskCreate={handleTaskCreate}
                onTaskDelete={handleTaskDelete}
                onTaskComplete={handleTaskComplete}
              />
            </CardContent>
          </Card>

          {/* AI Task Extractor - Full Width and Below */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>ENSPYR AI</CardTitle>
              <CardDescription>Paste emails, messages, or notes to automatically extract tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <TaskExtractor onTasksExtracted={handleTasksExtracted} />
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}
