"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RefreshCw } from "lucide-react"

export function DashboardHeader() {
  const [date, setDate] = useState(new Date())
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(25 * 60) // 25 minutes in seconds
  const [timerType, setTimerType] = useState<"focus" | "break">("focus")

  // Update date every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setDate(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Pomodoro timer
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1)
      }, 1000)
    } else if (timerSeconds === 0) {
      // Timer finished
      if (timerType === "focus") {
        // Switch to break
        setTimerType("break")
        setTimerSeconds(5 * 60) // 5 minute break

        // Show notification
        if (Notification.permission === "granted") {
          new Notification("Time for a break!", {
            body: "Take 5 minutes to rest and recharge.",
          })
        }
      } else {
        // Switch back to focus
        setTimerType("focus")
        setTimerSeconds(25 * 60) // 25 minute focus

        // Show notification
        if (Notification.permission === "granted") {
          new Notification("Break finished!", {
            body: "Time to get back to work.",
          })
        }
      }
      setIsTimerRunning(false)
    }

    return () => clearInterval(interval)
  }, [isTimerRunning, timerSeconds, timerType])

  // Request notification permission
  useEffect(() => {
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission()
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning)
  }

  const resetTimer = () => {
    setIsTimerRunning(false)
    setTimerSeconds(timerType === "focus" ? 25 * 60 : 5 * 60)
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          {date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <Card className="w-full md:w-auto gradient-card glow-accent">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-primary">{timerType === "focus" ? "Focus Time" : "Break Time"}</span>
            <span className="text-2xl font-bold">{formatTime(timerSeconds)}</span>
          </div>
          <div className="flex gap-2">
            <Button
              size="icon"
              className={
                isTimerRunning
                  ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-400"
                  : "bg-primary/20 text-primary hover:bg-primary/30"
              }
              onClick={toggleTimer}
            >
              {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="border-muted-foreground/30 hover:bg-secondary"
              onClick={resetTimer}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
