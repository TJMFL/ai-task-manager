"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import type { Task } from "@/lib/types"

interface TaskCompletionFormProps {
  task: Task
  onComplete: (taskId: string, hoursSpent: number) => void
  onCancel: () => void
}

export default function TaskCompletionForm({ task, onComplete, onCancel }: TaskCompletionFormProps) {
  const [hoursSpent, setHoursSpent] = useState(task.hoursSpent || 0)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    onComplete(task.id, hoursSpent)
    setIsLoading(false)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Complete Task</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="hoursSpent">Hours Spent</Label>
            <Input
              id="hoursSpent"
              type="number"
              min="0"
              step="0.5"
              value={hoursSpent}
              onChange={(e) => setHoursSpent(Number.parseFloat(e.target.value))}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Completing...
              </>
            ) : (
              "Complete Task"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
