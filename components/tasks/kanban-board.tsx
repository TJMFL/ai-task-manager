"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "react-beautiful-dnd"
import type { Task } from "@/lib/types"
import TaskCard from "./task-card"
import TaskForm from "./task-form"
import TaskCompletionForm from "./task-completion-form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface KanbanBoardProps {
  tasks: Task[]
  onTaskUpdate: (task: Task) => void
  onTaskCreate: (task: Partial<Task>) => void
  onTaskDelete: (taskId: string) => void
  onTaskComplete: (taskId: string, hoursSpent: number) => void
}

export default function KanbanBoard({
  tasks,
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete,
  onTaskComplete,
}: KanbanBoardProps) {
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [completingTask, setCompletingTask] = useState<Task | null>(null)

  // Group tasks by status
  const columns = {
    todo: tasks.filter((task) => task.status === "todo"),
    "in-progress": tasks.filter((task) => task.status === "in-progress"),
    done: tasks.filter((task) => task.status === "done"),
  }

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result

    // Dropped outside the list
    if (!destination) return

    // Dropped in the same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    // Find the task that was dragged
    const taskId = result.draggableId
    const task = tasks.find((t) => t.id === taskId)

    if (!task) return

    // Update the task status based on the destination column
    const updatedTask = {
      ...task,
      status: destination.droppableId as "todo" | "in-progress" | "done",
      updatedAt: new Date().toISOString(),
    }

    // If moved to done column, set completedAt
    if (destination.droppableId === "done" && !updatedTask.completedAt) {
      setCompletingTask(updatedTask)
    } else {
      onTaskUpdate(updatedTask)
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const handleTaskFormSubmit = (task: Partial<Task>) => {
    if (editingTask) {
      onTaskUpdate({ ...editingTask, ...task } as Task)
    } else {
      onTaskCreate(task)
    }
    setShowTaskForm(false)
    setEditingTask(null)
  }

  const handleCompleteTask = (task: Task) => {
    setCompletingTask(task)
  }

  const handleTaskCompletion = (taskId: string, hoursSpent: number) => {
    onTaskComplete(taskId, hoursSpent)
    setCompletingTask(null)
  }

  // Update the KanbanBoard component to be more streamlined and take up full width

  // Update the return statement to remove the title and add button that are now in the Card header
  return (
    <div className="h-full flex flex-col">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          {Object.entries(columns).map(([columnId, columnTasks]) => (
            <div key={columnId} className="flex flex-col h-full">
              <h3 className="font-medium mb-2 capitalize">
                {columnId.replace("-", " ")} ({columnTasks.length})
              </h3>
              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="bg-gray-50 p-2 rounded-md flex-1 min-h-[200px] overflow-y-auto"
                  >
                    <div className="space-y-2">
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                              <TaskCard
                                task={task}
                                onEdit={handleEditTask}
                                onDelete={onTaskDelete}
                                onComplete={handleCompleteTask}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <div className="mt-4 flex justify-end">
        <Button onClick={() => setShowTaskForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Task
        </Button>
      </div>

      <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
        <DialogContent className="sm:max-w-md">
          <TaskForm
            task={editingTask || undefined}
            onSubmit={handleTaskFormSubmit}
            onCancel={() => setShowTaskForm(false)}
          />
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
