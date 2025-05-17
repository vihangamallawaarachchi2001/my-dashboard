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
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns"
import { CalendarIcon, Clock, Plus, Trash2 } from "lucide-react"
import type { TimeBlock } from "@/lib/types"

export default function TimeBlocksPage() {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTimeBlock, setNewTimeBlock] = useState({
    title: "",
    category: "work",
    startTime: "",
    endTime: "",
  })

  useEffect(() => {
    fetchTimeBlocks()
  }, [selectedDate])

  const fetchTimeBlocks = async () => {
    try {
      setLoading(true)

      // Format date for API
      const dateStr = selectedDate.toISOString().split("T")[0]

      const res = await fetch(`/api/time-blocks?date=${dateStr}`)
      if (res.ok) {
        const data = await res.json()
        setTimeBlocks(data)
      }
    } catch (error) {
      console.error("Failed to fetch time blocks:", error)
      // Use placeholder data if API fails
      const now = new Date()
      setTimeBlocks([
        {
          _id: "1",
          title: "Deep work: Project planning",
          category: "work",
          startTime: new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            9,
            0,
          ).toISOString(),
          endTime: new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            11,
            0,
          ).toISOString(),
        },
        {
          _id: "2",
          title: "Study: Algorithm practice",
          category: "study",
          startTime: new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            13,
            0,
          ).toISOString(),
          endTime: new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            15,
            0,
          ).toISOString(),
        },
        {
          _id: "3",
          title: "Startup: Customer research",
          category: "startup",
          startTime: new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            16,
            0,
          ).toISOString(),
          endTime: new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            18,
            0,
          ).toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewTimeBlock({ ...newTimeBlock, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewTimeBlock({ ...newTimeBlock, [name]: value })
  }

  const handleCreateTimeBlock = async () => {
    try {
      // Format date and times for API
      const date = selectedDate.toISOString().split("T")[0]

      const [startHour, startMinute] = newTimeBlock.startTime.split(":")
      const [endHour, endMinute] = newTimeBlock.endTime.split(":")

      const startTime = new Date(selectedDate)
      startTime.setHours(Number.parseInt(startHour), Number.parseInt(startMinute), 0, 0)

      const endTime = new Date(selectedDate)
      endTime.setHours(Number.parseInt(endHour), Number.parseInt(endMinute), 0, 0)

      const timeBlockData = {
        title: newTimeBlock.title,
        category: newTimeBlock.category,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      }

      const res = await fetch("/api/time-blocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(timeBlockData),
      })

      if (res.ok) {
        // Reset form and close dialog
        setNewTimeBlock({
          title: "",
          category: "work",
          startTime: "",
          endTime: "",
        })
        setIsDialogOpen(false)

        // Refresh time blocks
        fetchTimeBlocks()
      }
    } catch (error) {
      console.error("Failed to create time block:", error)
    }
  }

  const handleDeleteTimeBlock = async (timeBlockId: string) => {
    try {
      const res = await fetch(`/api/time-blocks/${timeBlockId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        // Remove time block from state
        setTimeBlocks(timeBlocks.filter((block) => block._id !== timeBlockId))
      }
    } catch (error) {
      console.error("Failed to delete time block:", error)
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const isCurrentTimeBlock = (startTime: string, endTime: string) => {
    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(endTime)
    return now >= start && now <= end
  }

  // Generate week days for navigation
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }) // Start from Monday
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Time Blocks
          </h1>
          <p className="text-muted-foreground">Schedule your day with time blocking</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20">
              <Plus className="mr-2 h-4 w-4" />
              Add Time Block
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Time Block</DialogTitle>
              <DialogDescription>Schedule a focused time block for your day.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="title"
                  name="title"
                  value={newTimeBlock.title}
                  onChange={handleInputChange}
                  placeholder="Time block title"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category
                </label>
                <Select value={newTimeBlock.category} onValueChange={(value) => handleSelectChange("category", value)}>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="startTime" className="text-sm font-medium">
                    Start Time
                  </label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="time"
                    value={newTimeBlock.startTime}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="endTime" className="text-sm font-medium">
                    End Time
                  </label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    value={newTimeBlock.endTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="date" className="text-sm font-medium">
                  Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTimeBlock}>Create Time Block</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex overflow-x-auto pb-2 space-x-2">
        {weekDays.map((day) => (
          <Button
            key={day.toISOString()}
            variant={isSameDay(day, selectedDate) ? "default" : "outline"}
            className="min-w-[100px]"
            onClick={() => setSelectedDate(day)}
          >
            <div className="flex flex-col items-center">
              <span className="text-xs">{format(day, "EEE")}</span>
              <span className="text-lg font-bold">{format(day, "d")}</span>
            </div>
          </Button>
        ))}
      </div>

      <Card className="gradient-card glow-accent">
        <CardHeader>
          <CardTitle>Schedule for {format(selectedDate, "EEEE, MMMM d, yyyy")}</CardTitle>
          <CardDescription>Your time blocks for the day</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">Loading schedule...</div>
          ) : timeBlocks.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              No time blocks scheduled for this day. Plan your day!
            </div>
          ) : (
            <div className="space-y-4">
              {/* Time grid */}
              <div className="grid grid-cols-[60px_1fr] gap-2">
                {/* Time labels */}
                <div className="space-y-16 pt-6">
                  {Array.from({ length: 15 }, (_, i) => i + 7).map((hour) => (
                    <div key={hour} className="text-xs text-muted-foreground text-right pr-2">
                      {hour}:00
                    </div>
                  ))}
                </div>

                {/* Time blocks */}
                <div className="relative border-l min-h-[600px]">
                  {timeBlocks
                    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                    .map((block) => {
                      const startTime = new Date(block.startTime)
                      const endTime = new Date(block.endTime)

                      // Calculate position and height
                      const startHour = startTime.getHours() + startTime.getMinutes() / 60
                      const endHour = endTime.getHours() + endTime.getMinutes() / 60
                      const top = (startHour - 7) * 64 // 7am is the start, 64px per hour
                      const height = (endHour - startHour) * 64

                      return (
                        <div
                          key={block._id}
                          className={`absolute left-2 right-2 rounded-md p-2 ${getCategoryClass(block.category)} ${
                            isCurrentTimeBlock(block.startTime, block.endTime)
                              ? "ring-2 ring-primary ring-offset-1 ring-offset-background glow-primary"
                              : ""
                          }`}
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                          }}
                        >
                          <div className="flex justify-between items-start h-full">
                            <div className="flex flex-col h-full">
                              <span className="font-medium truncate">{block.title}</span>
                              <div className="flex items-center text-xs mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTime(block.startTime)} - {formatTime(block.endTime)}
                              </div>
                              <div className="text-xs mt-auto capitalize">{block.category}</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTimeBlock(block._id)}
                              className="text-muted-foreground hover:text-destructive h-6 w-6"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
