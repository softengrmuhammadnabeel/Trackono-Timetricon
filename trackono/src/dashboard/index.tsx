import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Play,
  Pause,
  Clock,
  Target,
  TrendingUp,
  Coffee,
  Award,
  Brain,
  Moon,
  Sun,
  Timer,
  Calendar,
  GitBranch,
  Zap,
  Heart,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Trophy,
  Music,
  BadgeQuestionMarkIcon
} from "lucide-react";
import useContinuousScreenshots from '@/hooks/use-continousScreenshots';

export default function DashboardHomePage() {
  const [timerActive, setTimerActive] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [pomodoroCount, setPomodoroCount] = useState(3);
  const [streak, setStreak] = useState(12);

  
  useContinuousScreenshots(timerActive, 3000); // Pass timerActive to control the behavior
  // useContinuousScreenshots(); // Pass timerActive to control the behavior
  // Timer simulation
  useEffect(() => {
    if (timerActive) {
      const interval = setInterval(() => {
        const now = new Date();
        setCurrentTime(now.toLocaleTimeString());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerActive]);

  const timerModes = [
    { name: "Pomodoro", icon: Timer, color: "bg-red-500" },
    { name: "Deep Work", icon: Brain, color: "bg-blue-500" },
    { name: "Break", icon: Coffee, color: "bg-green-500" },
    { name: "Meeting", icon: Calendar, color: "bg-purple-500" }
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">

      {/* Header */}
      <header className="flex items-center justify-between p-6 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-full">
            <BadgeQuestionMarkIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Trackono</h1>
            <p className="text-blue-100">AI-Powered Productivity Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="text-white hover:bg-white/20"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button> */}

          <Button
            size="lg"
            onClick={() => setTimerActive(!timerActive)}
            className={`flex items-center gap-2 px-6 py-3 ${timerActive
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
              } text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg`}
          >
            {timerActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            {timerActive ? 'Pause Timer' : 'Start Timer'}
          </Button>
        </div>
      </header>

      {/* AI Productivity Coach Alert */}
      <Alert className="border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/50">
        <Brain className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <strong>AI Coach:</strong> Your peak productivity window is 9-11 AM. Consider scheduling deep work tasks now!
        </AlertDescription>
      </Alert>

      {/* Active Timer Display */}
      {timerActive && (
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Active Session - Deep Work Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-mono font-bold">{currentTime}</div>
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                <span className="text-sm">Lo-fi Focus Music</span>
              </div>
            </div>
            <Progress value={65} className="mt-4 bg-white/20" />
            <p className="text-sm mt-2 opacity-90">25 minutes remaining in current focus block</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Timer Modes */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {timerModes.map((mode, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300 dark:hover:border-blue-600">
            <CardContent className="flex flex-col items-center p-4">
              <div className={`p-3 rounded-full ${mode.color} text-white mb-2`}>
                <mode.icon className="h-6 w-6" />
              </div>
              <span className="font-medium">{mode.name}</span>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Enhanced Productivity Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              Time Tracked Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-3xl font-bold mb-2">6h 45m</h2>
            <Progress value={84} className="bg-white/20" />
            <p className="text-xs mt-2 opacity-90">84% of daily goal</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              Tasks Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-3xl font-bold mb-2">15</h2>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white">
                +3 from yesterday
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4" />
              Focus Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-3xl font-bold mb-2">92%</h2>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Excellent focus today!</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Flame className="h-4 w-4" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h2 className="text-3xl font-bold mb-2">{streak} days</h2>
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              <span className="text-xs">Personal best!</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Gamification & Wellness */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Achievements & Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <div>
                  <p className="font-medium">Deep Work Champion</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">3+ hour focus session</p>
                </div>
              </div>
              <Badge variant="secondary">New!</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Flame className="h-6 w-6 text-orange-500" />
                <div>
                  <p className="font-medium">Consistency Master</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">12-day streak</p>
                </div>
              </div>
              <Badge variant="outline">Achieved</Badge>
            </div>

            <div className="text-center pt-4">
              <Button variant="outline" className="w-full">
                View All Achievements
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Wellness & Mood Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Today's Mood</span>
              <div className="flex gap-1">
                {['😊', '😐', '😔', '😤', '😴'].map((emoji, i) => (
                  <button key={i} className="text-lg hover:scale-110 transition-transform">
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Energy Level</span>
                <span className="text-green-600 dark:text-green-400">High</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>

            <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <Heart className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm text-green-800 dark:text-green-200">
                Great job maintaining work-life balance! Consider a 10-minute walk break.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>

      {/* Developer Integration Status */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <GitBranch className="h-4 w-4" />
              Git Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Commits Today</span>
                <Badge variant="outline">12</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Branch</span>
                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">feature/timer-ui</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Auto-tracking</span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4" />
              IDE Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">VS Code</span>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Connected</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Last Activity</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">2 min ago</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Auto-pause</span>
                <Badge variant="outline">Enabled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4" />
              Project Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Project</span>
                <Badge variant="outline">TimeTracker Pro</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Billable Hours</span>
                <span className="text-sm font-medium">5.5h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sprint Progress</span>
                <span className="text-sm text-green-600 dark:text-green-400">73%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Enhanced Quick Actions */}
      <section className="flex flex-wrap gap-4 justify-center">
        <Button variant="outline" size="lg" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Analytics Dashboard
        </Button>
        <Button variant="outline" size="lg" className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          Create Task
        </Button>
        <Button variant="outline" size="lg" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Manage Projects
        </Button>
        <Button variant="outline" size="lg" className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Enforcement Settings
        </Button>
      </section>

      {/* AI Insights Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-600" />
          AI Productivity Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Pattern Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950 to-purple-950 rounded-lg flex items-center justify-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Focus time visualization chart</p>
                </div>
                <p className="text-sm">
                  Your peak productivity occurs between 10 AM - 12 PM. Consider scheduling complex tasks during this window.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Break Reminder</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">You've been coding for 90 minutes. Take a 5-minute break soon.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Schedule Optimization</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Block 2-3 PM for deep work based on your energy patterns.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pomodoro Counter */}
      <Card className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Today's Pomodoro Sessions</h3>
            <div className="flex items-center gap-2">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full ${i < pomodoroCount ? 'bg-white' : 'bg-white/30'
                    }`}
                />
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{pomodoroCount}</p>
            <p className="text-sm opacity-90">Completed</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}