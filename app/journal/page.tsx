"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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
import { format } from "date-fns"
import { CalendarIcon, Plus, Smile, Frown, Meh } from "lucide-react"
import type { JournalEntry } from "@/lib/types"

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString(),
    content: "",
    mood: "neutral",
    lessons: [""],
  })
  const [date, setDate] = useState<Date | undefined>(new Date())

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/journal")
      if (res.ok) {
        const data = await res.json()
        setEntries(data)
      }
    } catch (error) {
      console.error("Failed to fetch journal entries:", error)
      // Use placeholder data if API fails
      setEntries([
        {
          _id: "1",
          date: new Date().toISOString(),
          content:
            "Today was productive. I completed the main feature for our project and received positive feedback from the team.",
          mood: "happy",
          lessons: [
            "Breaking down tasks makes them more manageable",
            "Regular communication improves team coordination",
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          _id: "2",
          date: new Date(Date.now() - 86400000).toISOString(), // yesterday
          content:
            "Struggled with a complex bug today. After hours of debugging, I found that it was a simple typo in the configuration.",
          mood: "frustrated",
          lessons: ["Take breaks when stuck on a problem", "Double-check configurations before deployment"],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewEntry({ ...newEntry, [name]: value })
  }

  const handleLessonChange = (index: number, value: string) => {
    const updatedLessons = [...newEntry.lessons]
    updatedLessons[index] = value
    setNewEntry({ ...newEntry, lessons: updatedLessons })
  }

  const addLesson = () => {
    setNewEntry({ ...newEntry, lessons: [...newEntry.lessons, ""] })
  }

  const removeLesson = (index: number) => {
    const updatedLessons = [...newEntry.lessons]
    updatedLessons.splice(index, 1)
    setNewEntry({ ...newEntry, lessons: updatedLessons })
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDate(date)
      setNewEntry({ ...newEntry, date: date.toISOString() })
    }
  }

  const handleMoodSelect = (mood: string) => {
    setNewEntry({ ...newEntry, mood })
  }

  const handleCreateEntry = async () => {
    try {
      // Filter out empty lessons
      const filteredLessons = newEntry.lessons.filter((lesson) => lesson.trim() !== "")

      const entryData = {
        ...newEntry,
        lessons: filteredLessons,
      }

      const res = await fetch("/api/journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entryData),
      })

      if (res.ok) {
        // Reset form and close dialog
        setNewEntry({
          date: new Date().toISOString(),
          content: "",
          mood: "neutral",
          lessons: [""],
        })
        setDate(new Date())
        setIsDialogOpen(false)

        // Refresh entries
        fetchEntries()
      }
    } catch (error) {
      console.error("Failed to create journal entry:", error)
    }
  }

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "happy":
        return <Smile className="h-5 w-5 text-green-500" />
      case "neutral":
        return <Meh className="h-5 w-5 text-yellow-500" />
      case "frustrated":
        return <Frown className="h-5 w-5 text-red-500" />
      default:
        return <Meh className="h-5 w-5 text-yellow-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Journal
          </h1>
          <p className="text-muted-foreground">Record your daily reflections and lessons learned</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20">
              <Plus className="mr-2 h-4 w-4" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Journal Entry</DialogTitle>
              <DialogDescription>Record your thoughts, reflections, and lessons learned for the day.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="date" className="text-sm font-medium">
                    Date
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
                <div className="grid gap-2">
                  <label htmlFor="mood" className="text-sm font-medium">
                    Mood
                  </label>
                  <Select value={newEntry.mood} onValueChange={(value) => handleMoodSelect(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="happy">
                        <div className="flex items-center">
                          <Smile className="mr-2 h-4 w-4 text-green-500" />
                          Happy
                        </div>
                      </SelectItem>
                      <SelectItem value="neutral">
                        <div className="flex items-center">
                          <Meh className="mr-2 h-4 w-4 text-yellow-500" />
                          Neutral
                        </div>
                      </SelectItem>
                      <SelectItem value="frustrated">
                        <div className="flex items-center">
                          <Frown className="mr-2 h-4 w-4 text-red-500" />
                          Frustrated
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Journal Entry
                </label>
                <Textarea
                  id="content"
                  name="content"
                  value={newEntry.content}
                  onChange={handleInputChange}
                  placeholder="Write your thoughts, reflections, and experiences for the day..."
                  className="min-h-[200px]"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Lessons Learned</label>
                  <Button type="button" variant="outline" size="sm" onClick={addLesson}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Lesson
                  </Button>
                </div>
                {newEntry.lessons.map((lesson, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={lesson}
                      onChange={(e) => handleLessonChange(index, e.target.value)}
                      placeholder="What did you learn today?"
                    />
                    {newEntry.lessons.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeLesson(index)}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateEntry}>Save Entry</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center p-4">Loading journal entries...</div>
        ) : entries.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No journal entries found. Create your first entry!
          </div>
        ) : (
          entries.map((entry) => {
            const entryDate = new Date(entry.date)

            return (
              <Card key={entry._id} className="gradient-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{format(entryDate, "EEEE, MMMM d, yyyy")}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getMoodIcon(entry.mood)}
                      <span className="text-sm capitalize">{entry.mood}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="whitespace-pre-wrap">{entry.content}</div>

                  {entry.lessons && entry.lessons.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Lessons Learned:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {entry.lessons.map((lesson, index) => (
                          <li key={index} className="text-sm">
                            {lesson}
                          </li>
                        ))}
                      </ul>
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
