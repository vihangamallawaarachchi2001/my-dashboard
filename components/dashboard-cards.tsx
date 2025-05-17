"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, ListTodo, Target } from "lucide-react"

export function DashboardCards() {
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    tasksTotal: 0,
    habitsCompleted: 0,
    habitsTotal: 0,
    focusHours: 0,
    goalsProgress: 0,
  })

  useEffect(() => {
    // Fetch stats from API
    const fetchStats = async () => {
      try {
        const [tasksRes, habitsRes, timeBlocksRes, goalsRes] = await Promise.all([
          fetch("/api/tasks/stats"),
          fetch("/api/habits/stats"),
          fetch("/api/time-blocks/stats"),
          fetch("/api/goals/stats"),
        ])

        if (tasksRes.ok && habitsRes.ok && timeBlocksRes.ok && goalsRes.ok) {
          const tasks = await tasksRes.json()
          const habits = await habitsRes.json()
          const timeBlocks = await timeBlocksRes.json()
          const goals = await goalsRes.json()

          setStats({
            tasksCompleted: tasks.completed,
            tasksTotal: tasks.total,
            habitsCompleted: habits.completed,
            habitsTotal: habits.total,
            focusHours: timeBlocks.focusHours,
            goalsProgress: goals.progress,
          })
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
        // Use placeholder data if API fails
        setStats({
          tasksCompleted: 5,
          tasksTotal: 12,
          habitsCompleted: 3,
          habitsTotal: 5,
          focusHours: 4.5,
          goalsProgress: 65,
        })
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="gradient-card glow-accent">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Tasks</CardTitle>
          <ListTodo className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.tasksCompleted}/{stats.tasksTotal}
          </div>
          <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${Math.round((stats.tasksCompleted / Math.max(stats.tasksTotal, 1)) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round((stats.tasksCompleted / Math.max(stats.tasksTotal, 1)) * 100)}% completed
          </p>
        </CardContent>
      </Card>

      <Card className="gradient-card glow-accent">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Habits</CardTitle>
          <CheckCircle className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.habitsCompleted}/{stats.habitsTotal}
          </div>
          <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${Math.round((stats.habitsCompleted / Math.max(stats.habitsTotal, 1)) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round((stats.habitsCompleted / Math.max(stats.habitsTotal, 1)) * 100)}% completed today
          </p>
        </CardContent>
      </Card>

      <Card className="gradient-card glow-accent">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Focus Time</CardTitle>
          <Clock className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.focusHours}h</div>
          <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${Math.min(100, (stats.focusHours / 8) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Today's focused work</p>
        </CardContent>
      </Card>

      <Card className="gradient-card glow-accent">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Goals Progress</CardTitle>
          <Target className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.goalsProgress}%</div>
          <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${stats.goalsProgress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Average completion rate</p>
        </CardContent>
      </Card>
    </div>
  )
}
