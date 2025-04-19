"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Task } from "@/lib/types"
import { CalendarIcon, Clock, Edit, Trash } from "lucide-react"
import { format } from "date-fns"

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onComplete: (task: Task) => void
}

export default function TaskCard({ task, onEdit, onDelete, onComplete }: TaskCardProps) {
  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  }

  const statusColors = {
    todo: "bg-gray-100 text-gray-800",
    "in-progress": "bg-purple-100 text-purple-800",
    done: "bg-green-100 text-green-800",
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-lg">{task.title}</h3>
          <div className="flex gap-1">
            <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
            <Badge className={statusColors[task.status]}>{task.status}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-500 mb-4">{task.description}</p>
        <div className="flex flex-col gap-1 text-sm">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <span>Due: {format(new Date(task.dueDate), "PPP")}</span>
            </div>
          )}
          {task.hoursSpent !== null && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>Hours spent: {task.hoursSpent}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(task)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDelete(task.id)}>
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
        {task.status !== "done" && (
          <Button size="sm" onClick={() => onComplete(task)}>
            Complete
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
