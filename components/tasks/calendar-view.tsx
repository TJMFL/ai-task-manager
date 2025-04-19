"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Task } from "@/lib/types"
import { format, isSameDay } from "date-fns"
import TaskCard from "./task-card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import TaskForm from "./task-form"
import TaskCompletionForm from "./task-completion-form"

interface CalendarViewProps {
  tasks: Task[]
  onTaskUpdate: (task: Task) => void
  onTaskDelete: (taskId: string) => void
  onTaskComplete: (taskId: string, hoursSpent: number) => void
}

export default function CalendarView({ tasks, onTaskUpdate, onTaskDelete, onTaskComplete }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [completingTask, setCompletingTask] = useState<Task | null>(null)

  // Get tasks for the selected date
  const tasksForSelectedDate = selectedDate
    ? tasks.filter((task) => task.dueDate && isSameDay(new Date(task.dueDate), selectedDate))
    : []

  // Get dates with tasks for highlighting in the calendar
  const datesWithTasks = tasks.filter((task) => task.dueDate).map((task) => new Date(task.dueDate as string))

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
  }

  const handleTaskFormSubmit = (task: Partial<Task>) => {
    onTaskUpdate({ ...editingTask!, ...task } as Task)
    setEditingTask(null)
  }

  const handleCompleteTask = (task: Task) => {
    setCompletingTask(task)
  }

  const handleTaskCompletion = (taskId: string, hoursSpent: number) => {
    onTaskComplete(taskId, hoursSpent)
    setCompletingTask(null)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiers={{
                  hasTasks: datesWithTasks,
                }}
                modifiersStyles={{
                  hasTasks: {
                    fontWeight: "bold",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                  },
                }}
              />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                {selectedDate ? `Tasks for ${format(selectedDate, "PPP")}` : "Select a date to view tasks"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasksForSelectedDate.length > 0 ? (
                <div className="space-y-4">
                  {tasksForSelectedDate.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEditTask}
                      onDelete={onTaskDelete}
                      onComplete={handleCompleteTask}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No tasks scheduled for this date</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="sm:max-w-md">
          {editingTask && (
            <TaskForm task={editingTask} onSubmit={handleTaskFormSubmit} onCancel={() => setEditingTask(null)} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!completingTask} onOpenChange={(open) => !open && setCompletingTask(null)}>
        <DialogContent className="sm:max-w-md">
          {completingTask && (
            <TaskCompletionForm
              task={completingTask}
              onComplete={handleTaskCompletion}
              onCancel={() => setCompletingTask(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
