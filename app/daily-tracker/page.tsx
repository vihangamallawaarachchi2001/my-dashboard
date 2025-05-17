"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { CalendarIcon, Plus, X } from "lucide-react"
import type { DailyLog } from "@/lib/types"

export default function DailyTrackerPage() {
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newLog, setNewLog] = useState({
    date: new Date().toISOString().split("T")[0],
    sleep: 7,
    energy: 7,
    mood: "neutral",
    distractions: [""],
    timeSpent: [
      { category: "work", minutes: 240 },
      { category: "study", minutes: 120 },
      { category: "startup", minutes: 60 },
      { category: "personal", minutes: 120 },
    ],
  })

  useEffect(() => {
    fetchLogs()
  }, [selectedDate])

  const fetchLogs = async () => {
    try {
      setLoading(true)

      // Format date for API
      const dateStr = selectedDate.toISOString().split("T")[0]

      const res = await fetch(`/api/daily-tracker?date=${dateStr}`)
      if (res.ok) {
        const data = await res.json()
        if (data.length > 0) {
          setLogs(data)
        } else {
          // No log for this date
          setLogs([])
        }
      }
    } catch (error) {
      console.error("Failed to fetch daily logs:", error)
      // Use placeholder data if API fails
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewLog({ ...newLog, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewLog({ ...newLog, [name]: value })
  }

  const handleSliderChange = (name: string, value: number[]) => {
    setNewLog({ ...newLog, [name]: value[0] })
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      setNewLog({ ...newLog, date: date.toISOString().split("T")[0] })
    }
  }

  const handleDistractionChange = (index: number, value: string) => {
    const updatedDistractions = [...newLog.distractions]
    updatedDistractions[index] = value
    setNewLog({ ...newLog, distractions: updatedDistractions })
  }

  const addDistraction = () => {
    setNewLog({ ...newLog, distractions: [...newLog.distractions, ""] })
  }

  const removeDistraction = (index: number) => {
    const updatedDistractions = [...newLog.distractions]
    updatedDistractions.splice(index, 1)
    setNewLog({ ...newLog, distractions: updatedDistractions })
  }

  const handleTimeSpentChange = (index: number, field: string, value: string | number) => {
    const updatedTimeSpent = [...newLog.timeSpent]
    updatedTimeSpent[index] = { ...updatedTimeSpent[index], [field]: value }
    setNewLog({ ...newLog, timeSpent: updatedTimeSpent })
  }

  const handleCreateLog = async () => {
    try {
      // Filter out empty distractions
      const filteredDistractions = newLog.distractions.filter((distraction) => distraction.trim() !== "")

      const logData = {
        ...newLog,
        distractions: filteredDistractions,
      }

      const res = await fetch("/api/daily-tracker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logData),
      })

      if (res.ok) {
        // Reset form and close dialog
        setNewLog({
          date: new Date().toISOString().split("T")[0],
          sleep: 7,
          energy: 7,
          mood: "neutral",
          distractions: [""],
          timeSpent: [
            { category: "work", minutes: 240 },
            { category: "study", minutes: 120 },
            { category: "startup", minutes: 60 },
            { category: "personal", minutes: 120 },
          ],
        })
        setIsDialogOpen(false)

        // Refresh logs
        fetchLogs()
      }
    } catch (error) {
      console.error("Failed to create daily log:", error)
    }
  }

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case "happy":
        return "😊"
      case "neutral":
        return "😐"
      case "frustrated":
        return "😣"
      case "tired":
        return "😴"
      case "energetic":
        return "⚡"
      default:
        return "😐"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "work":
        return "bg-purple-500"
      case "study":
        return "bg-blue-500"
      case "startup":
        return "bg-orange-500"
      case "personal":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatMinutesToHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins > 0 ? `${mins}m` : ""}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Daily Tracker
          </h1>
          <p className="text-muted-foreground">Track your daily metrics and activities</p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} initialFocus />
            </PopoverContent>
          </Popover>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20">
                <Plus className="mr-2 h-4 w-4" />
                Log Day
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Daily Log</DialogTitle>
                <DialogDescription>
                  Track your daily metrics to identify patterns and improve productivity.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="date" className="text-sm font-medium">
                    Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(selectedDate, "MMM d, yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="sleep" className="text-sm font-medium">
                      Sleep (hours): {newLog.sleep}
                    </label>
                  </div>
                  <Slider
                    id="sleep"
                    min={0}
                    max={12}
                    step={0.5}
                    value={[newLog.sleep]}
                    onValueChange={(value) => handleSliderChange("sleep", value)}
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="energy" className="text-sm font-medium">
                      Energy Level (1-10): {newLog.energy}
                    </label>
                  </div>
                  <Slider
                    id="energy"
                    min={1}
                    max={10}
                    step={1}
                    value={[newLog.energy]}
                    onValueChange={(value) => handleSliderChange("energy", value)}
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="mood" className="text-sm font-medium">
                    Mood
                  </label>
                  <Select value={newLog.mood} onValueChange={(value) => handleSelectChange("mood", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="happy">
                        <div className="flex items-center">
                          <span className="mr-2">😊</span>
                          Happy
                        </div>
                      </SelectItem>
                      <SelectItem value="neutral">
                        <div className="flex items-center">
                          <span className="mr-2">😐</span>
                          Neutral
                        </div>
                      </SelectItem>
                      <SelectItem value="frustrated">
                        <div className="flex items-center">
                          <span className="mr-2">😣</span>
                          Frustrated
                        </div>
                      </SelectItem>
                      <SelectItem value="tired">
                        <div className="flex items-center">
                          <span className="mr-2">😴</span>
                          Tired
                        </div>
                      </SelectItem>
                      <SelectItem value="energetic">
                        <div className="flex items-center">
                          <span className="mr-2">⚡</span>
                          Energetic
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Distractions</label>
                    <Button type="button" variant="outline" size="sm" onClick={addDistraction}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  {newLog.distractions.map((distraction, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={distraction}
                        onChange={(e) => handleDistractionChange(index, e.target.value)}
                        placeholder="What distracted you today?"
                      />
                      {newLog.distractions.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeDistraction(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium">Time Spent (minutes)</label>
                  <div className="space-y-3">
                    {newLog.timeSpent.map((time, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-24">
                          <span className="text-sm capitalize">{time.category}:</span>
                        </div>
                        <Input
                          type="number"
                          value={time.minutes}
                          onChange={(e) => handleTimeSpentChange(index, "minutes", Number.parseInt(e.target.value))}
                          className="w-20"
                        />
                        <span className="text-sm">min</span>
                        <span className="text-xs text-muted-foreground">({formatMinutesToHours(time.minutes)})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateLog}>Save Log</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-4">Loading daily log...</div>
      ) : logs.length === 0 ? (
        <Card className="gradient-card glow-accent">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-medium">No log for {format(selectedDate, "MMMM d, yyyy")}</h3>
              <p className="text-muted-foreground">Track your day to improve productivity and identify patterns.</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Log This Day
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {logs.map((log) => (
            <div key={log._id} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Metrics</CardTitle>
                  <CardDescription>Your metrics for {format(new Date(log.date), "MMMM d, yyyy")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center justify-center p-3 bg-secondary/30 rounded-md">
                      <span className="text-sm text-muted-foreground">Sleep</span>
                      <span className="text-2xl font-bold">{log.sleep}h</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-secondary/30 rounded-md">
                      <span className="text-sm text-muted-foreground">Energy</span>
                      <span className="text-2xl font-bold">{log.energy}/10</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-secondary/30 rounded-md">
                      <span className="text-sm text-muted-foreground">Mood</span>
                      <span className="text-2xl">{getMoodEmoji(log.mood)}</span>
                    </div>
                  </div>

                  {log.distractions && log.distractions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Distractions:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {log.distractions.map((distraction, index) => (
                          <li key={index} className="text-sm">
                            {distraction}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Time Distribution</CardTitle>
                  <CardDescription>How you spent your time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {log.timeSpent && log.timeSpent.length > 0 ? (
                      <>
                        <div className="h-4 w-full rounded-full overflow-hidden flex">
                          {log.timeSpent.map((time, index) => {
                            const totalMinutes = log.timeSpent.reduce((sum, t) => sum + t.minutes, 0)
                            const percentage = totalMinutes > 0 ? (time.minutes / totalMinutes) * 100 : 0

                            return (
                              <div
                                key={index}
                                className={`${getCategoryColor(time.category)}`}
                                style={{ width: `${percentage}%` }}
                              />
                            )
                          })}
                        </div>

                        <div className="grid gap-2">
                          {log.timeSpent.map((time, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-2 ${getCategoryColor(time.category)}`} />
                                <span className="text-sm capitalize">{time.category}</span>
                              </div>
                              <div className="text-sm">{formatMinutesToHours(time.minutes)}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-muted-foreground">No time data recorded</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
