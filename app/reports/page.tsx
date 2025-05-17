"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("tasks")
  const [timeRange, setTimeRange] = useState("week")
  const [taskData, setTaskData] = useState<any[]>([])
  const [habitData, setHabitData] = useState<any[]>([])
  const [timeData, setTimeData] = useState<any[]>([])
  const [goalData, setGoalData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportData()
  }, [timeRange])

  const fetchReportData = async () => {
    try {
      setLoading(true)

      // In a real app, we would fetch data from the API based on the time range
      // For now, we'll use mock data

      // Task completion data
      setTaskData([
        { day: "Mon", completed: 5, total: 8 },
        { day: "Tue", completed: 7, total: 10 },
        { day: "Wed", completed: 4, total: 6 },
        { day: "Thu", completed: 6, total: 9 },
        { day: "Fri", completed: 8, total: 12 },
        { day: "Sat", completed: 3, total: 5 },
        { day: "Sun", completed: 2, total: 4 },
      ])

      // Habit streak data
      setHabitData([
        { name: "Morning meditation", streak: 12, category: "personal" },
        { name: "Read technical articles", streak: 8, category: "work" },
        { name: "Exercise", streak: 5, category: "personal" },
        { name: "Code review", streak: 15, category: "work" },
        { name: "Journal", streak: 20, category: "personal" },
      ])

      // Time spent data
      setTimeData([
        { category: "Work", hours: 25 },
        { category: "Study", hours: 15 },
        { category: "Startup", hours: 10 },
        { category: "Personal", hours: 8 },
      ])

      // Goal progress data
      setGoalData([
        { name: "Learn React Native", progress: 75, category: "study" },
        { name: "Launch MVP", progress: 40, category: "startup" },
        { name: "Complete course", progress: 90, category: "study" },
        { name: "Improve test coverage", progress: 60, category: "work" },
      ])
    } catch (error) {
      console.error("Failed to fetch report data:", error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Reports
          </h1>
          <p className="text-muted-foreground">Analyze your productivity and progress</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
            <SelectItem value="quarter">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="time">Time Spent</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card className="gradient-card glow-accent">
            <CardHeader>
              <CardTitle>Task Completion</CardTitle>
              <CardDescription>Daily task completion rate over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {loading ? (
                <div className="flex justify-center items-center h-full">Loading chart data...</div>
              ) : (
                <ChartContainer
                  className="bg-secondary/20 rounded-lg p-4"
                  config={{
                    completed: {
                      label: "Completed",
                      color: "hsl(var(--chart-1))",
                    },
                    total: {
                      label: "Total",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={taskData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
                      <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="gradient-card glow-accent">
              <CardHeader>
                <CardTitle>Task Categories</CardTitle>
                <CardDescription>Distribution of tasks by category</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                {loading ? (
                  <div className="flex justify-center items-center h-full">Loading chart data...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Work", value: 12 },
                          { name: "Study", value: 8 },
                          { name: "Startup", value: 5 },
                          { name: "Personal", value: 7 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: "Work", value: 12 },
                          { name: "Study", value: 8 },
                          { name: "Startup", value: 5 },
                          { name: "Personal", value: 7 },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="gradient-card glow-accent">
              <CardHeader>
                <CardTitle>Task Priority</CardTitle>
                <CardDescription>Distribution of tasks by Eisenhower Matrix</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                {loading ? (
                  <div className="flex justify-center items-center h-full">Loading chart data...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Do", value: 15 },
                          { name: "Schedule", value: 10 },
                          { name: "Delegate", value: 8 },
                          { name: "Eliminate", value: 5 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: "Do", value: 15 },
                          { name: "Schedule", value: 10 },
                          { name: "Delegate", value: 8 },
                          { name: "Eliminate", value: 5 },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="habits" className="space-y-4">
          <Card className="gradient-card glow-accent">
            <CardHeader>
              <CardTitle>Habit Streaks</CardTitle>
              <CardDescription>Current streak length for each habit</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {loading ? (
                <div className="flex justify-center items-center h-full">Loading chart data...</div>
              ) : (
                <ChartContainer
                  className="bg-secondary/20 rounded-lg p-4"
                  config={{
                    streak: {
                      label: "Streak (days)",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={habitData.sort((a, b) => b.streak - a.streak)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="streak" fill="var(--color-streak)" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card className="gradient-card glow-accent">
            <CardHeader>
              <CardTitle>Habit Completion Rate</CardTitle>
              <CardDescription>Daily habit completion percentage over time</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              {loading ? (
                <div className="flex justify-center items-center h-full">Loading chart data...</div>
              ) : (
                <ChartContainer
                  className="bg-secondary/20 rounded-lg p-4"
                  config={{
                    rate: {
                      label: "Completion Rate (%)",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { day: "Mon", rate: 80 },
                        { day: "Tue", rate: 90 },
                        { day: "Wed", rate: 70 },
                        { day: "Thu", rate: 85 },
                        { day: "Fri", rate: 95 },
                        { day: "Sat", rate: 60 },
                        { day: "Sun", rate: 75 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" />
                      <YAxis domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="rate" stroke="var(--color-rate)" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <Card className="gradient-card glow-accent">
            <CardHeader>
              <CardTitle>Time Distribution</CardTitle>
              <CardDescription>Hours spent by category</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {loading ? (
                <div className="flex justify-center items-center h-full">Loading chart data...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={timeData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="hours"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {timeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} hours`, "Time Spent"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="gradient-card glow-accent">
            <CardHeader>
              <CardTitle>Daily Focus Hours</CardTitle>
              <CardDescription>Hours of focused work per day</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              {loading ? (
                <div className="flex justify-center items-center h-full">Loading chart data...</div>
              ) : (
                <ChartContainer
                  className="bg-secondary/20 rounded-lg p-4"
                  config={{
                    hours: {
                      label: "Focus Hours",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { day: "Mon", hours: 5.5 },
                        { day: "Tue", hours: 6.2 },
                        { day: "Wed", hours: 4.8 },
                        { day: "Thu", hours: 7.0 },
                        { day: "Fri", hours: 5.5 },
                        { day: "Sat", hours: 3.0 },
                        { day: "Sun", hours: 2.5 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="hours" fill="var(--color-hours)" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card className="gradient-card glow-accent">
            <CardHeader>
              <CardTitle>Goal Progress</CardTitle>
              <CardDescription>Progress towards SMART goals</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {loading ? (
                <div className="flex justify-center items-center h-full">Loading chart data...</div>
              ) : (
                <ChartContainer
                  className="bg-secondary/20 rounded-lg p-4"
                  config={{
                    progress: {
                      label: "Progress (%)",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={goalData.sort((a, b) => b.progress - a.progress)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" width={150} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="progress" fill="var(--color-progress)" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="gradient-card glow-accent">
              <CardHeader>
                <CardTitle>Goals by Category</CardTitle>
                <CardDescription>Distribution of goals by category</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                {loading ? (
                  <div className="flex justify-center items-center h-full">Loading chart data...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Work", value: 3 },
                          { name: "Study", value: 5 },
                          { name: "Startup", value: 2 },
                          { name: "Personal", value: 4 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: "Work", value: 3 },
                          { name: "Study", value: 5 },
                          { name: "Startup", value: 2 },
                          { name: "Personal", value: 4 },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="gradient-card glow-accent">
              <CardHeader>
                <CardTitle>Goal Completion Trend</CardTitle>
                <CardDescription>Monthly goal completion rate</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                {loading ? (
                  <div className="flex justify-center items-center h-full">Loading chart data...</div>
                ) : (
                  <ChartContainer
                    className="bg-secondary/20 rounded-lg p-4"
                    config={{
                      rate: {
                        label: "Completion Rate (%)",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { month: "Jan", rate: 60 },
                          { month: "Feb", rate: 65 },
                          { month: "Mar", rate: 70 },
                          { month: "Apr", rate: 75 },
                          { month: "May", rate: 80 },
                          { month: "Jun", rate: 85 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" />
                        <YAxis domain={[0, 100]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="rate"
                          stroke="var(--color-rate)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
