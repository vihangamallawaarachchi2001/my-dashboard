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
import { CheckCircle, Flame, Plus, Trash2 } from "lucide-react"
import type { Habit } from "@/lib/types"

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [newHabit, setNewHabit] = useState({
    name: "",
    description: "",
    frequency: "daily",
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchHabits()
  }, [])

  const fetchHabits = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/habits")
      if (res.ok) {
        const data = await res.json()
        setHabits(data)
      }
    } catch (error) {
      console.error("Failed to fetch habits:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewHabit({ ...newHabit, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewHabit({ ...newHabit, [name]: value })
  }

  const handleCreateHabit = async () => {
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newHabit),
      })

      if (res.ok) {
        // Reset form and close dialog
        setNewHabit({
          name: "",
          description: "",
          frequency: "daily",
        })
        setIsDialogOpen(false)

        // Refresh habits
        fetchHabits()
      }
    } catch (error) {
      console.error("Failed to create habit:", error)
    }
  }

  const handleToggleHabit = async (habitId: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/habits/${habitId}/toggle`, {
        method: "POST",
      })

      if (res.ok) {
        // Update habit in state
        setHabits(
          habits.map((habit) =>
            habit._id === habitId
              ? {
                  ...habit,
                  completedToday: !completed,
                  streak: !completed ? habit.streak + 1 : Math.max(0, habit.streak - 1),
                }
              : habit,
          ),
        )
      }
    } catch (error) {
      console.error("Failed to toggle habit:", error)
    }
  }

  const handleDeleteHabit = async (habitId: string) => {
    try {
      const res = await fetch(`/api/habits/${habitId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        // Remove habit from state
        setHabits(habits.filter((habit) => habit._id !== habitId))
      }
    } catch (error) {
      console.error("Failed to delete habit:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Habits</h1>
          <p className="text-muted-foreground">Track your daily and weekly habits</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20">
              <Plus className="mr-2 h-4 w-4" />
              Add Habit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Habit</DialogTitle>
              <DialogDescription>
                Add a new habit to track. Consistency is key to building good habits.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={newHabit.name}
                  onChange={handleInputChange}
                  placeholder="Habit name"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={newHabit.description}
                  onChange={handleInputChange}
                  placeholder="Habit description"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="frequency" className="text-sm font-medium">
                  Frequency
                </label>
                <Select value={newHabit.frequency} onValueChange={(value) => handleSelectChange("frequency", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateHabit}>Create Habit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="gradient-card glow-accent">
        <CardHeader>
          <CardTitle>Habit Tracker</CardTitle>
          <CardDescription>Check off your habits daily to build streaks</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">Loading habits...</div>
          ) : habits.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">No habits found. Create your first habit!</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {habits.map((habit) => (
                <Card key={habit._id} className="overflow-hidden gradient-card">
                  <div className={`h-1 ${habit.streak > 0 ? "bg-primary" : "bg-secondary"}`} />
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-medium">{habit.name}</h3>
                        <p className="text-sm text-muted-foreground">{habit.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteHabit(habit._id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">
                          {habit.streak} day{habit.streak !== 1 ? "s" : ""} streak
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">{habit.frequency}</div>
                    </div>

                    <Button
                      variant={habit.completedToday ? "outline" : "default"}
                      className={
                        habit.completedToday
                          ? "w-full mt-4 border-primary/30 text-primary"
                          : "w-full mt-4 bg-primary/20 hover:bg-primary/30 text-primary"
                      }
                      onClick={() => handleToggleHabit(habit._id, habit.completedToday)}
                    >
                      {habit.completedToday ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Completed
                        </>
                      ) : (
                        "Mark as Complete"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
