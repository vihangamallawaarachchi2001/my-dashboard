import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardCards } from "@/components/dashboard-cards"
import { TasksOverview } from "@/components/tasks-overview"
import { HabitsOverview } from "@/components/habits-overview"
import { TimeBlockOverview } from "@/components/time-block-overview"

export default function Home() {
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <DashboardCards />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TasksOverview />
        <HabitsOverview />
      </div>
      <TimeBlockOverview />
    </div>
  )
}
