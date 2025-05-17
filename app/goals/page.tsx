"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { format } from "date-fns"
import { CalendarIcon, Plus, Target, Trash2 } from "lucide-react"
import type { Goal } from "@/lib/types"

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "work",
    targetDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(), // 3 months from now
    progress: 0,
    metrics: [{ name: "", target: 0, current: 0 }],
  })
  const [date, setDate] = useState<Date | undefined>(new Date(new Date().setMonth(new Date().getMonth() + 3)))
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    fetchGoals()
  }, [activeCategory])

  const fetchGoals = async () => {
    try {
      setLoading(true)

      let url = "/api/goals"
      if (activeCategory) {
        url += `?category=${activeCategory}`
      }

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setGoals(data)
      }
    } catch (error) {
      console.error("Failed to fetch goals:", error)
      // Use placeholder data if API fails
      setGoals([
        {
          _id: "1",
          title: "Complete React Native course",
          description: "Finish the advanced React Native course on Udemy",
          category: "study",
          targetDate: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString(),
          progress: 65,
          metrics: [
            { name: "Modules completed", target: 12, current: 8 },
            { name: "Projects built", target: 3, current: 2 },
          ],
        },
        {
          _id: "2",
          title: "Launch MVP for startup",
          description: "Complete and launch the minimum viable product for my startup idea",
          category: "startup",
          targetDate: new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString(),
          progress: 40,
          metrics: [
            { name: "Features implemented", target: 10, current: 4 },
            { name: "User tests conducted", target: 5, current: 2 },
          ],
        },
        {
          _id: "3",
          title: "Improve test coverage",
          description: "Increase test coverage for the main project at work",
          category: "work",
          targetDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
          progress: 75,
          metrics: [
            { name: "Coverage percentage", target: 80, current: 60 },
            { name: "Critical paths tested", target: 15, current: 12 },
          ],
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewGoal({ ...newGoal, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewGoal({ ...newGoal, [name]: value })
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDate(date)
      setNewGoal({ ...newGoal, targetDate: date.toISOString() })
    }
  }

  const handleMetricChange = (index: number, field: string, value: string | number) => {
    const updatedMetrics = [...newGoal.metrics]
    updatedMetrics[index] = { ...updatedMetrics[index], [field]: value }
    setNewGoal({ ...newGoal, metrics: updatedMetrics })
  }

  const addMetric = () => {
    setNewGoal({
      ...newGoal,
      metrics: [...newGoal.metrics, { name: "", target: 0, current: 0 }],
    })
  }

  const removeMetric = (index: number) => {
    const updatedMetrics = [...newGoal.metrics]
    updatedMetrics.splice(index, 1)
    setNewGoal({ ...newGoal, metrics: updatedMetrics })
  }

  const handleCreateGoal = async () => {
    try {
      // Filter out empty metrics
      const filteredMetrics = newGoal.metrics.filter((metric) => metric.name.trim() !== "")

      const goalData = {
        ...newGoal,
        metrics: filteredMetrics,
      }

      const res = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(goalData),
      })

      if (res.ok) {
        // Reset form and close dialog
        setNewGoal({
          title: "",
          description: "",
          category: "work",
          targetDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
          progress: 0,
          metrics: [{ name: "", target: 0, current: 0 }],
        })
        setDate(new Date(new Date().setMonth(new Date().getMonth() + 3)))
        setIsDialogOpen(false)

        // Refresh goals
        fetchGoals()
      }
    } catch (error) {
      console.error("Failed to create goal:", error)
    }
  }

  const handleUpdateProgress = async (goalId: string, progress: number) => {
    try {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ progress }),
      })

      if (res.ok) {
        // Update goal in state
        setGoals(goals.map((goal) => (goal._id === goalId ? { ...goal, progress } : goal)))
      }
    } catch (error) {
      console.error("Failed to update goal progress:", error)
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        // Remove goal from state
        setGoals(goals.filter((goal) => goal._id !== goalId))
      }
    } catch (error) {
      console.error("Failed to delete goal:", error)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "work":
        return "bg-purple-100 dark:bg-purple-900 border-l-4 border-purple-500"
      case "study":
        return "bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500"
      case "startup":
        return "bg-orange-100 dark:bg-orange-900 border-l-4 border-orange-500"
      case "personal":
        return "bg-green-100 dark:bg-green-900 border-l-4 border-green-500"
      default:
        return "bg-gray-100 dark:bg-gray-800 border-l-4 border-gray-500"
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress < 25) return "bg-red-500"
    if (progress < 50) return "bg-orange-500"
    if (progress < 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  const calculateDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate)
    const today = new Date()
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            SMART Goals
          </h1>
          <p className="text-muted-foreground">Track your personal and professional goals</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20">
              <Plus className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create SMART Goal</DialogTitle>
              <DialogDescription>
                Set a Specific, Measurable, Achievable, Relevant, and Time-bound goal.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Goal Title
                </label>
                <Input
                  id="title"
                  name="title"
                  value={newGoal.title}
                  onChange={handleInputChange}
                  placeholder="What do you want to achieve?"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={newGoal.description}
                  onChange={handleInputChange}
                  placeholder="Describe your goal in detail..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category
                  </label>
                  <Select value={newGoal.category} onValueChange={(value) => handleSelectChange("category", value)}>
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
                <div className="grid gap-2">
                  <label htmlFor="targetDate" className="text-sm font-medium">
                    Target Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Metrics</label>
                  <Button type="button" variant="outline" size="sm" onClick={addMetric}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Metric
                  </Button>
                </div>
                <div className="space-y-3">
                  {newGoal.metrics.map((metric, index) => (
                    <div key={index} className="grid gap-2 p-3 border rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Metric {index + 1}</span>
                        {newGoal.metrics.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeMetric(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Input
                        placeholder="Metric name"
                        value={metric.name}
                        onChange={(e) => handleMetricChange(index, "name", e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="grid gap-1">
                          <label className="text-xs">Target Value</label>
                          <Input
                            type="number"
                            placeholder="Target"
                            value={metric.target}
                            onChange={(e) => handleMetricChange(index, "target", Number.parseInt(e.target.value))}
                          />
                        </div>
                        <div className="grid gap-1">
                          <label className="text-xs">Current Value</label>
                          <Input
                            type="number"
                            placeholder="Current"
                            value={metric.current}
                            onChange={(e) => handleMetricChange(index, "current", Number.parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGoal}>Create Goal</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex overflow-x-auto pb-2 space-x-2">
        <Button
          variant={activeCategory === null ? "default" : "outline"}
          className="min-w-[100px]"
          onClick={() => setActiveCategory(null)}
        >
          All
        </Button>
        <Button
          variant={activeCategory === "work" ? "default" : "outline"}
          className="min-w-[100px]"
          onClick={() => setActiveCategory("work")}
        >
          Work
        </Button>
        <Button
          variant={activeCategory === "study" ? "default" : "outline"}
          className="min-w-[100px]"
          onClick={() => setActiveCategory("study")}
        >
          Study
        </Button>
        <Button
          variant={activeCategory === "startup" ? "default" : "outline"}
          className="min-w-[100px]"
          onClick={() => setActiveCategory("startup")}
        >
          Startup
        </Button>
        <Button
          variant={activeCategory === "personal" ? "default" : "outline"}
          className="min-w-[100px]"
          onClick={() => setActiveCategory("personal")}
        >
          Personal
        </Button>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center p-4">Loading goals...</div>
        ) : goals.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">No goals found. Create your first SMART goal!</div>
        ) : (
          goals.map((goal) => {
            const targetDate = new Date(goal.targetDate)
            const daysRemaining = calculateDaysRemaining(goal.targetDate)

            return (
              <Card key={goal._id} className="overflow-hidden gradient-card">
                <div className={`h-1 ${getProgressColor(goal.progress)}`} />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{goal.title}</CardTitle>
                      <CardDescription>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs capitalize ${getCategoryColor(
                            goal.category,
                          ).replace("border-l-4", "")}`}
                        >
                          {goal.category}
                        </span>
                        <span className="ml-2">
                          Due: {format(targetDate, "MMM d, yyyy")}
                          {daysRemaining > 0 ? (
                            <span className="ml-1 text-muted-foreground">({daysRemaining} days left)</span>
                          ) : (
                            <span className="ml-1 text-red-500">(Overdue)</span>
                          )}
                        </span>
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{goal.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Progress: {goal.progress}%</span>
                      <span className="text-xs text-muted-foreground">
                        <Target className="inline h-3 w-3 mr-1" />
                        Target: {format(targetDate, "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Slider
                          value={[goal.progress]}
                          min={0}
                          max={100}
                          step={5}
                          onValueChange={(value) => handleUpdateProgress(goal._id, value[0])}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{goal.progress}%</span>
                    </div>
                  </div>

                  {goal.metrics && goal.metrics.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Metrics:</h4>
                      <div className="grid gap-2">
                        {goal.metrics.map((metric, index) => {
                          const progress =
                            metric.target > 0 ? Math.min(100, Math.round((metric.current / metric.target) * 100)) : 0

                          return (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm">{metric.name}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                                  <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                                </div>
                                <span className="text-xs">
                                  {metric.current}/{metric.target}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
