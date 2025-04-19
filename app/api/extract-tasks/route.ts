import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { content } = await req.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const prompt = `
      Extract tasks from the following content. For each task, identify:
      1. Title (short description of the task)
      2. Description (more details if available)
      3. Priority (low, medium, high) based on urgency
      4. Due date if mentioned (in YYYY-MM-DD format)

      Format the output as a JSON array of tasks with these fields.
      If no tasks are found, return an empty array.

      Content:
      ${content}
    `

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt,
    })

    // Parse the response to extract tasks
    let tasks = []
    try {
      // Find JSON array in the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        tasks = JSON.parse(jsonMatch[0])
      } else {
        // Fallback if no JSON array is found
        tasks = []
      }
    } catch (error) {
      console.error("Error parsing tasks:", error)
      tasks = []
    }

    // Add source and created date to each task
    const tasksWithMetadata = tasks.map((task: any) => ({
      ...task,
      source: "ai-extraction",
      createdAt: new Date().toISOString(),
      status: "todo",
    }))

    return NextResponse.json({ tasks: tasksWithMetadata })
  } catch (error) {
    console.error("Error extracting tasks:", error)
    return NextResponse.json({ error: "Failed to extract tasks" }, { status: 500 })
  }
}
