import * as React from "react"
import {
  Clock,
  Hourglass,
  BarChart3 as BarChart,
  HelpCircle,
  Settings as Gear,
  Home as Dashboard,
  Users,
  TrendingUp,
  Timer,
  Sliders as Settings,
} from "lucide-react";

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Professional timer app data
const data = {
  user: {
    name: "Nabeel",
    email: "se.muhammadnabeel@gmail.com",
    avatar: "/avatars/professional.jpg",
  },
  teams: [
    {
      name: "Nabeel Inc.",
      logo: Clock,
      plan: "Enterprise",
    },
    {
      name: "Precision Timing Co.",
      logo: Hourglass,
      plan: "Business",
    },
    {
      name: "TimeTrackers",
      logo: Clock,
      plan: "Startup",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: Dashboard,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/",
        },
        {
          title: "Analytics",
          url: "/analytics",
        },
        {
          title: "Active Timers",
          url: "/timers",
        },
      ],
    },
    {
      title: "Timer Setup",
      url: "/setup",
      icon: Settings,
      isActive: false,
      items: [
        {
          title: "Create Timer",
          url: "/setup/create",
        },
        {
          title: "Saved Templates",
          url: "/setup/templates",
        },
        {
          title: "Timer Preferences",
          url: "/setup/preferences",
        },
      ],
    },
    {
      title: "Reports",
      url: "/reports",
      icon: BarChart,
      items: [
        {
          title: "Daily Report",
          url: "/reports/daily",
        },
        {
          title: "Weekly Report",
          url: "/reports/weekly",
        },
        {
          title: "Custom Report",
          url: "/reports/custom",
        },
      ],
    },
    {
      title: "Help",
      url: "/help",
      icon: HelpCircle,
      items: [
        {
          title: "Getting Started",
          url: "/help/start",
        },
        {
          title: "FAQs",
          url: "/help/faqs",
        },
        {
          title: "Support",
          url: "/help/support",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Gear,
      items: [
        {
          title: "Profile",
          url: "/settings/profile",
        },
        {
          title: "Notifications",
          url: "/settings/notifications",
        },
        {
          title: "Subscription",
          url: "/settings/subscription",
        },
        {
          title: "Privacy",
          url: "/settings/privacy",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Time Optimization",
      url: "/projects/optimization",
      icon: Timer,
    },
    {
      name: "Team Collaboration",
      url: "/projects/collaboration",
      icon: Users,
    },
    {
      name: "Productivity Insights",
      url: "/projects/insights",
      icon: TrendingUp,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
