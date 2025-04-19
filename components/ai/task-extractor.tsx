"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import type { Task } from "@/lib/types"

export default function TaskExtractor({ onTasksExtracted }: { onTasksExtracted: (tasks: Partial<Task>[]) => void }) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleExtract = async () => {
    if (!content.trim()) {
      setError("Please enter some content to extract tasks from")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/extract-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error("Failed to extract tasks")
      }

      const data = await response.json()
      onTasksExtracted(data.tasks)
      setContent("")
    } catch (err) {
      setError("Failed to extract tasks. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Paste your emails, messages, or notes here to automatically extract tasks..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[200px] w-full"
      />
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button onClick={handleExtract} disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Extracting tasks...
          </>
        ) : (
          "Extract Tasks"
        )}
      </Button>
    </div>
  )
}
