"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { Task, TaskReport } from "@/lib/types"
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import { Download, Loader2 } from "lucide-react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface TaskReportProps {
  tasks: Task[]
}

export default function TaskReportComponent({ tasks }: TaskReportProps) {
  const [period, setPeriod] = useState<"day" | "week" | "month">("day")
  const [date, setDate] = useState<Date>(new Date())
  const [isDownloading, setIsDownloading] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  // Calculate date range based on period
  const getDateRange = () => {
    const now = new Date()

    switch (period) {
      case "day":
        return {
          start: startOfDay(now),
          end: endOfDay(now),
          label: format(now, "PPP"),
        }
      case "week":
        return {
          start: startOfWeek(now),
          end: endOfWeek(now),
          label: `Week of ${format(startOfWeek(now), "PPP")}`,
        }
      case "month":
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
          label: format(now, "MMMM yyyy"),
        }
      default:
        return {
          start: startOfDay(now),
          end: endOfDay(now),
          label: format(now, "PPP"),
        }
    }
  }

  const { start, end, label } = getDateRange()

  // Filter tasks based on date range
  const filteredTasks = tasks.filter((task) => {
    if (!task.completedAt) return false
    const completedDate = new Date(task.completedAt)
    return completedDate >= start && completedDate <= end
  })

  // Generate report
  const report: TaskReport = {
    totalTasks: filteredTasks.length,
    completedTasks: filteredTasks.filter((task) => task.status === "done").length,
    totalHoursSpent: filteredTasks.reduce((total, task) => total + (task.hoursSpent || 0), 0),
    tasksByPriority: {
      low: filteredTasks.filter((task) => task.priority === "low").length,
      medium: filteredTasks.filter((task) => task.priority === "medium").length,
      high: filteredTasks.filter((task) => task.priority === "high").length,
    },
    tasksByStatus: {
      todo: filteredTasks.filter((task) => task.status === "todo").length,
      "in-progress": filteredTasks.filter((task) => task.status === "in-progress").length,
      done: filteredTasks.filter((task) => task.status === "done").length,
    },
  }

  // Function to download the report as PDF
  const downloadAsPDF = async () => {
    if (!reportRef.current) return

    setIsDownloading(true)

    try {
      const reportElement = reportRef.current
      const canvas = await html2canvas(reportElement, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Calculate the width and height to maintain aspect ratio
      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      pdf.save(`Task_Report_${label.replace(/\s/g, "_")}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Task Report</h2>
        <div className="flex gap-2">
          <Select value={period} onValueChange={(value: "day" | "week" | "month") => setPeriod(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={downloadAsPDF}
            disabled={isDownloading || filteredTasks.length === 0}
            className="flex items-center gap-1"
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <div ref={reportRef} className="bg-white p-4 rounded-lg">
        <Card>
          <CardHeader>
            <CardTitle>Summary for {label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-blue-800">Total Tasks</h3>
                <p className="text-3xl font-bold text-blue-900">{report.totalTasks}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-green-800">Completed Tasks</h3>
                <p className="text-3xl font-bold text-green-900">{report.completedTasks}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-purple-800">Total Hours</h3>
                <p className="text-3xl font-bold text-purple-900">{report.totalHoursSpent.toFixed(1)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tasks by Priority</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span>Low</span>
                      <span className="font-medium">{report.tasksByPriority.low}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Medium</span>
                      <span className="font-medium">{report.tasksByPriority.medium}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>High</span>
                      <span className="font-medium">{report.tasksByPriority.high}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tasks by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span>To Do</span>
                      <span className="font-medium">{report.tasksByStatus.todo}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>In Progress</span>
                      <span className="font-medium">{report.tasksByStatus["in-progress"]}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Done</span>
                      <span className="font-medium">{report.tasksByStatus.done}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="mt-4">
              <h3 className="font-medium mb-2">Completed Tasks</h3>
              {filteredTasks.length > 0 ? (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border p-2 text-left">Task</th>
                      <th className="border p-2 text-left">Priority</th>
                      <th className="border p-2 text-left">Hours</th>
                      <th className="border p-2 text-left">Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((task) => (
                      <tr key={task.id}>
                        <td className="border p-2">{task.title}</td>
                        <td className="border p-2 capitalize">{task.priority}</td>
                        <td className="border p-2">{task.hoursSpent || 0}</td>
                        <td className="border p-2">
                          {task.completedAt ? format(new Date(task.completedAt), "PPP") : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-gray-500 py-4">No tasks completed in this period</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
