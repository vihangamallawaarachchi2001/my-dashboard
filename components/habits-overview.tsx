"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusCircle } from "lucide-react"
import type { Habit } from "@/lib/types"

export function HabitsOverview() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const res = await fetch("/api/habits?limit=5")
        if (res.ok) {
          const data = await res.json()
          setHabits(data)
        }
      } catch (error) {
        console.error("Failed to fetch habits:", error)
        // Use placeholder data if API fails
        setHabits([
          {
            _id: "1",
            name: "Morning meditation",
            description: "10 minutes of mindfulness",
            frequency: "daily",
            streak: 5,
            completedToday: false,
            history: [],
          },
          {
            _id: "2",
            name: "Read technical articles",
            description: "Stay updated with industry trends",
            frequency: "daily",
            streak: 3,
            completedToday: true,
            history: [],
          },
          {
            _id: "3",
            name: "Exercise",
            description: "30 minutes of physical activity",
            frequency: "daily",
            streak: 0,
            completedToday: false,
            history: [],
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchHabits()
  }, [])

  const toggleHabitCompletion = async (habitId: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/habits/${habitId}/toggle`, {
        method: "POST",
      })

      if (res.ok) {
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
      console.error("Failed to update habit:", error)
      // Optimistically update UI even if API fails
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
  }

  return (
    <Card className="gradient-card glow-accent">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Habits</CardTitle>
          <CardDescription>Track your daily habits</CardDescription>
        </div>
        <Link href="/habits">
          <Button size="sm" className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Habit
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">Loading habits...</div>
        ) : habits.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">No habits found. Create your first habit!</div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <div
                key={habit._id}
                className="flex items-start gap-3 p-3 rounded-md bg-secondary/30 hover:bg-secondary/40 transition-all duration-200"
              >
                <Checkbox
                  checked={habit.completedToday}
                  onCheckedChange={() => toggleHabitCompletion(habit._id, habit.completedToday)}
                  className="mt-1 border-primary"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium">{habit.name}</span>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="font-medium">Streak:</span>
                      <span className={habit.streak > 0 ? "text-primary font-bold" : ""}>
                        {habit.streak} {habit.streak === 1 ? "day" : "days"}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{habit.description}</div>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Link href="/habits">
                <Button variant="link" className="p-0 h-auto text-primary">
                  View all habits
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
