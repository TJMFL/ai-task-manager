import type { Task, User } from "./types"
import { supabase } from "./supabase"

// Task service
export const taskService = {
  // Get all tasks
  getAllTasks: async (): Promise<Task[]> => {
    const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching tasks:", error)
      return []
    }

    // Convert snake_case to camelCase
    return data.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.due_date,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      completedAt: task.completed_at,
      hoursSpent: task.hours_spent,
      userId: task.user_email,
      source: task.source,
    }))
  },

  // Get a task by ID
  getTaskById: async (taskId: string): Promise<Task | null> => {
    const { data, error } = await supabase.from("tasks").select("*").eq("id", taskId).single()

    if (error) {
      console.error("Error fetching task:", error)
      return null
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      dueDate: data.due_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      completedAt: data.completed_at,
      hoursSpent: data.hours_spent,
      userId: data.user_email,
      source: data.source,
    }
  },

  // Create a new task
  createTask: async (task: Omit<Task, "id">): Promise<Task | null> => {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        due_date: task.dueDate,
        created_at: task.createdAt,
        updated_at: task.updatedAt,
        completed_at: task.completedAt,
        hours_spent: task.hoursSpent,
        user_email: task.userId,
        source: task.source,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating task:", error)
      return null
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      dueDate: data.due_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      completedAt: data.completed_at,
      hoursSpent: data.hours_spent,
      userId: data.user_email,
      source: data.source,
    }
  },

  // Update a task
  updateTask: async (taskId: string, updates: Partial<Task>): Promise<Task | null> => {
    // Convert camelCase to snake_case for Supabase
    const supabaseUpdates: any = {}
    if (updates.title !== undefined) supabaseUpdates.title = updates.title
    if (updates.description !== undefined) supabaseUpdates.description = updates.description
    if (updates.priority !== undefined) supabaseUpdates.priority = updates.priority
    if (updates.status !== undefined) supabaseUpdates.status = updates.status
    if (updates.dueDate !== undefined) supabaseUpdates.due_date = updates.dueDate
    if (updates.updatedAt !== undefined) supabaseUpdates.updated_at = updates.updatedAt
    if (updates.completedAt !== undefined) supabaseUpdates.completed_at = updates.completedAt
    if (updates.hoursSpent !== undefined) supabaseUpdates.hours_spent = updates.hoursSpent
    if (updates.source !== undefined) supabaseUpdates.source = updates.source

    const { data, error } = await supabase.from("tasks").update(supabaseUpdates).eq("id", taskId).select().single()

    if (error) {
      console.error("Error updating task:", error)
      return null
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      dueDate: data.due_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      completedAt: data.completed_at,
      hoursSpent: data.hours_spent,
      userId: data.user_email,
      source: data.source,
    }
  },

  // Delete a task
  deleteTask: async (taskId: string): Promise<boolean> => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId)

    if (error) {
      console.error("Error deleting task:", error)
      return false
    }

    return true
  },

  // Complete a task
  completeTask: async (taskId: string, hoursSpent: number): Promise<Task | null> => {
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from("tasks")
      .update({
        status: "done",
        completed_at: now,
        hours_spent: hoursSpent,
        updated_at: now,
      })
      .eq("id", taskId)
      .select()
      .single()

    if (error) {
      console.error("Error completing task:", error)
      return null
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      dueDate: data.due_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      completedAt: data.completed_at,
      hoursSpent: data.hours_spent,
      userId: data.user_email,
      source: data.source,
    }
  },
}

// Auth service
export const authService = {
  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    return {
      id: user.id,
      email: user.email || "",
      name: user.email?.split("@")[0] || "User",
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Error signing in:", error)
        return { user: null, error: error.message }
      }

      if (!data.user) return { user: null, error: "No user returned from authentication" }

      return {
        user: {
          id: data.user.id,
          email: data.user.email || "",
          name: data.user.email?.split("@")[0] || "User",
        },
        error: null,
      }
    } catch (err) {
      console.error("Unexpected error during sign in:", err)
      return { user: null, error: "An unexpected error occurred" }
    }
  },

  // Sign up with email and password
  signUp: async (
    email: string,
    password: string,
    name: string,
  ): Promise<{ user: User | null; error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) {
        console.error("Error signing up:", error)
        return { user: null, error: error.message }
      }

      if (!data.user) return { user: null, error: "No user returned from registration" }

      return {
        user: {
          id: data.user.id,
          email: data.user.email || "",
          name: name || data.user.email?.split("@")[0] || "User",
        },
        error: null,
      }
    } catch (err) {
      console.error("Unexpected error during sign up:", err)
      return { user: null, error: "An unexpected error occurred" }
    }
  },

  // Sign out
  signOut: async (): Promise<boolean> => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Error signing out:", error)
      return false
    }

    return true
  },
}
