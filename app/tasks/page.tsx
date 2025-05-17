"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Clock, Filter, Plus, Trash2 } from "lucide-react"
import type { Task } from "@/lib/types"

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "urgent-important",
    category: "work",
    dueDate: new Date().toISOString(),
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [filterPriority, setFilterPriority] = useState<string | null>(null)
  const [date, setDate] = useState<Date | undefined>(new Date())

  useEffect(() => {
    fetchTasks()
  }, [activeTab, filterCategory, filterPriority])

  const fetchTasks = async () => {
    try {
      setLoading(true)

      let url = "/api/tasks?"

      // Add filters based on active tab
      if (activeTab === "completed") {
        url += "completed=true&"
      } else if (activeTab === "pending") {
        url += "completed=false&"
      }

      // Add category filter if selected
      if (filterCategory) {
        url += `category=${filterCategory}&`
      }

      // Add priority filter if selected
      if (filterPriority) {
        url += `priority=${filterPriority}&`
      }

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewTask({ ...newTask, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewTask({ ...newTask, [name]: value })
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDate(date)
      setNewTask({ ...newTask, dueDate: date.toISOString() })
    }
  }

  const handleCreateTask = async () => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      })

      if (res.ok) {
        // Reset form and close dialog
        setNewTask({
          title: "",
          description: "",
          priority: "urgent-important",
          category: "work",
          dueDate: new Date().toISOString(),
        })
        setIsDialogOpen(false)

        // Refresh tasks
        fetchTasks()
      }
    } catch (error) {
      console.error("Failed to create task:", error)
    }
  }

  const handleToggleTaskCompletion = async (taskId: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: !completed }),
      })

      if (res.ok) {
        // Update task in state
        setTasks(tasks.map((task) => (task._id === taskId ? { ...task, completed: !completed } : task)))
      }
    } catch (error) {
      console.error("Failed to update task:", error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        // Remove task from state
        setTasks(tasks.filter((task) => task._id !== taskId))
      }
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgent-important":
        return { label: "Do", color: "bg-red-500" }
      case "not-urgent-important":
        return { label: "Schedule", color: "bg-blue-500" }
      case "urgent-not-important":
        return { label: "Delegate", color: "bg-yellow-500" }
      case "not-urgent-not-important":
        return { label: "Eliminate", color: "bg-green-500" }
      default:
        return { label: "Unknown", color: "bg-gray-500" }
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "work":
        return { label: "Work", color: "bg-purple-500" }
      case "study":
        return { label: "Study", color: "bg-blue-500" }
      case "startup":
        return { label: "Startup", color: "bg-orange-500" }
      case "personal":
        return { label: "Personal", color: "bg-green-500" }
      default:
        return { label: category, color: "bg-gray-500" }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage your tasks using the Eisenhower Matrix</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20">
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task to your list. Use the Eisenhower Matrix to prioritize.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="title"
                  name="title"
                  value={newTask.title}
                  onChange={handleInputChange}
                  placeholder="Task title"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={newTask.description}
                  onChange={handleInputChange}
                  placeholder="Task description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="priority" className="text-sm font-medium">
                    Priority
                  </label>
                  <Select value={newTask.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent-important">Do (Urgent & Important)</SelectItem>
                      <SelectItem value="not-urgent-important">Schedule (Important, Not Urgent)</SelectItem>
                      <SelectItem value="urgent-not-important">Delegate (Urgent, Not Important)</SelectItem>
                      <SelectItem value="not-urgent-not-important">Eliminate (Not Urgent or Important)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category
                  </label>
                  <Select value={newTask.category} onValueChange={(value) => handleSelectChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="study">Study</SelectItem>
                      <SelectItem value="startup">Startup</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="dueDate" className="text-sm font-medium">
                  Due Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTask}>Create Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Category</h4>
                  <Select value={filterCategory || ""} onValueChange={(value) => setFilterCategory(value || null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="study">Study</SelectItem>
                      <SelectItem value="startup">Startup</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Priority</h4>
                  <Select value={filterPriority || ""} onValueChange={(value) => setFilterPriority(value || null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All priorities</SelectItem>
                      <SelectItem value="urgent-important">Do (Urgent & Important)</SelectItem>
                      <SelectItem value="not-urgent-important">Schedule (Important, Not Urgent)</SelectItem>
                      <SelectItem value="urgent-not-important">Delegate (Urgent, Not Important)</SelectItem>
                      <SelectItem value="not-urgent-not-important">Eliminate (Not Urgent or Important)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilterCategory(null)
                    setFilterPriority(null)
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Card className="gradient-card glow-accent">
        <CardHeader>
          <CardTitle>Task List</CardTitle>
          <CardDescription>Manage and track your tasks</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">No tasks found. Create your first task!</div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => {
                const priority = getPriorityLabel(task.priority)
                const category = getCategoryLabel(task.category)
                const dueDate = new Date(task.dueDate)
                const isOverdue = dueDate < new Date() && !task.completed

                return (
                  <div
                    key={task._id}
                    className={`flex items-start gap-3 p-3 rounded-md border ${
                      task.completed ? "bg-secondary/30 opacity-70" : getPriorityClass(task.priority)
                    }`}
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTaskCompletion(task._id, task.completed)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-base font-medium ${
                            task.completed ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {task.title}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className={`text-xs ${priority.color} text-white`}>
                            {priority.label}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${category.color} text-white`}>
                            {category.label}
                          </Badge>
                        </div>
                      </div>
                      {task.description && (
                        <p className={`text-sm mt-1 ${task.completed ? "text-muted-foreground" : ""}`}>
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3 mr-1" />
                        Due: {dueDate.toLocaleDateString()}
                        {isOverdue && <span className="text-red-500 ml-2">Overdue</span>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTask(task._id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
