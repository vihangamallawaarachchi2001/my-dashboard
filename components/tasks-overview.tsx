"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusCircle } from "lucide-react"
import type { Task } from "@/lib/types"

export function TasksOverview() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/tasks?limit=5")
        if (res.ok) {
          const data = await res.json()
          setTasks(data)
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error)
        // Use placeholder data if API fails
        setTasks([
          {
            _id: "1",
            title: "Complete project proposal",
            description: "Finish the draft and send for review",
            priority: "urgent-important",
            category: "work",
            completed: false,
            dueDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow
          },
          {
            _id: "2",
            title: "Study for algorithms exam",
            description: "Focus on dynamic programming",
            priority: "not-urgent-important",
            category: "study",
            completed: false,
            dueDate: new Date(Date.now() + 172800000).toISOString(), // day after tomorrow
          },
          {
            _id: "3",
            title: "Weekly team meeting",
            description: "Prepare status update",
            priority: "urgent-not-important",
            category: "work",
            completed: false,
            dueDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const toggleTaskCompletion = async (taskId: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: !completed }),
      })

      if (res.ok) {
        setTasks(tasks.map((task) => (task._id === taskId ? { ...task, completed: !completed } : task)))
      }
    } catch (error) {
      console.error("Failed to update task:", error)
      // Optimistically update UI even if API fails
      setTasks(tasks.map((task) => (task._id === taskId ? { ...task, completed: !completed } : task)))
    }
  }

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "urgent-important":
        return "priority-do"
      case "not-urgent-important":
        return "priority-schedule"
      case "urgent-not-important":
        return "priority-delegate"
      case "not-urgent-not-important":
        return "priority-eliminate"
      default:
        return ""
    }
  }

  const getCategoryClass = (category: string) => {
    switch (category) {
      case "work":
        return "category-work"
      case "study":
        return "category-study"
      case "startup":
        return "category-startup"
      case "personal":
        return "category-personal"
      default:
        return ""
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgent-important":
        return "Do"
      case "not-urgent-important":
        return "Schedule"
      case "urgent-not-important":
        return "Delegate"
      case "not-urgent-not-important":
        return "Eliminate"
      default:
        return "Unknown"
    }
  }

  return (
    <Card className="gradient-card glow-accent">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>Your upcoming tasks</CardDescription>
        </div>
        <Link href="/tasks">
          <Button size="sm" className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">No tasks found. Create your first task!</div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const priorityClass = getPriorityClass(task.priority)
              const categoryClass = getCategoryClass(task.category)
              const dueDate = new Date(task.dueDate)
              const isOverdue = dueDate < new Date() && !task.completed

              return (
                <div
                  key={task._id}
                  className={`flex items-start gap-3 p-3 rounded-md transition-all duration-200 ${
                    task.completed ? "bg-secondary/30 opacity-70" : priorityClass
                  }`}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTaskCompletion(task._id, task.completed)}
                    className="mt-1 border-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}
                      >
                        {task.title}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs border-primary/30 bg-primary/10 text-primary">
                          {getPriorityLabel(task.priority)}
                        </Badge>
                        <Badge variant="outline" className={`text-xs border-primary/30 bg-primary/10 text-primary`}>
                          {task.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Due: {dueDate.toLocaleDateString()}
                      {isOverdue && <span className="text-red-500 ml-2">Overdue</span>}
                    </div>
                  </div>
                </div>
              )
            })}
            <div className="pt-2">
              <Link href="/tasks">
                <Button variant="link" className="p-0 h-auto text-primary">
                  View all tasks
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
