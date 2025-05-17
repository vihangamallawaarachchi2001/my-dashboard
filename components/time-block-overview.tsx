"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import type { TimeBlock } from "@/lib/types"

export function TimeBlockOverview() {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTimeBlocks = async () => {
      try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const res = await fetch(`/api/time-blocks?date=${today.toISOString()}`)
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
            startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0).toISOString(),
            endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0).toISOString(),
          },
          {
            _id: "2",
            title: "Study: Algorithm practice",
            category: "study",
            startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 0).toISOString(),
            endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0).toISOString(),
          },
          {
            _id: "3",
            title: "Startup: Customer research",
            category: "startup",
            startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0).toISOString(),
            endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0).toISOString(),
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchTimeBlocks()
  }, [])

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

  return (
    <Card className="gradient-card glow-accent">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>Your time blocks for today</CardDescription>
        </div>
        <Link href="/time-blocks">
          <Button size="sm" className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Time Block
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">Loading schedule...</div>
        ) : timeBlocks.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No time blocks scheduled for today. Plan your day!
          </div>
        ) : (
          <div className="space-y-3">
            {timeBlocks
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
              .map((block) => (
                <div
                  key={block._id}
                  className={`p-3 rounded-md ${getCategoryClass(block.category)} ${
                    isCurrentTimeBlock(block.startTime, block.endTime)
                      ? "ring-2 ring-primary ring-offset-1 ring-offset-background glow-primary"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{block.title}</span>
                    <span className="text-sm">
                      {formatTime(block.startTime)} - {formatTime(block.endTime)}
                    </span>
                  </div>
                  <div className="text-xs mt-1 capitalize">{block.category}</div>
                  {isCurrentTimeBlock(block.startTime, block.endTime) && (
                    <div className="text-xs font-medium mt-1 text-primary">Current</div>
                  )}
                </div>
              ))}
            <div className="pt-2">
              <Link href="/time-blocks">
                <Button variant="link" className="p-0 h-auto text-primary">
                  View full schedule
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
