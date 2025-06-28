# Trackono-Timetricon: Complete Technical Implementation Guide

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Core Features Implementation](#core-features-implementation)
3. [Advanced Features](#advanced-features)
4. [Integration Features](#integration-features)
5. [Administrative Features](#administrative-features)
6. [Data Models & Database Design](#data-models--database-design)
7. [API Specifications](#api-specifications)
8. [Security & Performance](#security--performance)

---

## System Architecture Overview

### Tech Stack Recommendations
- **Backend**: Node.js with Express.js / Python with FastAPI
- **Database**: PostgreSQL (primary), Redis (caching/sessions)
- **Frontend**: React.js with TypeScript
- **Desktop**: Electron
- **Mobile**: React Native
- **Real-time**: WebSocket (Socket.io)
- **Queue**: Bull Queue with Redis
- **Deployment**: Docker + Kubernetes
- **Monitoring**: Prometheus + Grafana

### Microservices Architecture
```
├── Timer Service (Core timing logic)
├── Task Management Service
├── Integration Service (External APIs)
├── Notification Service
├── Analytics Service
├── User Management Service
├── Admin Service
└── Billing Service
```

---

## Core Features Implementation

### 1. Smart Timer Engine

#### 1.1 Multiple Timer Modes

**User Flow:**
1. User opens app → Timer selection screen appears
2. User selects timer type (Pomodoro/Countdown/Stopwatch/Custom)
3. User configures timer settings
4. Timer starts → Real-time updates → Completion notification

**Technical Implementation:**

```javascript
// Timer Engine Algorithm
class TimerEngine {
  constructor(type, duration, breaks) {
    this.type = type;
    this.duration = duration;
    this.breaks = breaks;
    this.currentTime = 0;
    this.isRunning = false;
    this.intervalId = null;
  }

  start() {
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000);
    
    // Log start event
    this.logEvent('timer_start', {
      type: this.type,
      duration: this.duration,
      timestamp: Date.now()
    });
  }

  tick() {
    if (this.type === 'stopwatch') {
      this.currentTime++;
    } else {
      this.currentTime--;
      if (this.currentTime <= 0) {
        this.complete();
      }
    }
    
    // Send real-time update via WebSocket
    this.broadcastUpdate();
    
    // Check for idle detection
    this.checkIdleStatus();
  }

  pause(reason) {
    this.isRunning = false;
    clearInterval(this.intervalId);
    
    // Log pause with reason
    this.logEvent('timer_pause', {
      reason: reason,
      elapsed: this.getElapsedTime(),
      timestamp: Date.now()
    });
  }
}
```

**Database Schema:**
```sql
CREATE TABLE timer_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  timer_type VARCHAR(50),
  duration_seconds INTEGER,
  elapsed_seconds INTEGER,
  status VARCHAR(20), -- running, paused, completed, cancelled
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  pause_reason TEXT,
  task_id UUID REFERENCES tasks(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Benefits:**
- Flexible timer options cater to different productivity styles
- Detailed logging enables analytics and improvements
- Real-time updates keep users engaged

#### 1.2 Force Start Timer on Login

**User Flow:**
1. User logs in → System checks enforcement settings
2. If enforcement enabled → Timer selection modal appears (cannot be dismissed)
3. User must start timer to access main application
4. Timer runs in background while user works

**Algorithm:**
```javascript
// Login Enforcement Algorithm
class LoginEnforcement {
  async handleLogin(userId) {
    const user = await this.getUserWithSettings(userId);
    const enforcementSettings = await this.getEnforcementSettings(user.organizationId);
    
    if (enforcementSettings.forceTimerOnLogin) {
      // Check if user has active timer
      const activeTimer = await this.getActiveTimer(userId);
      
      if (!activeTimer) {
        return {
          requireTimer: true,
          allowedActions: ['timer_start', 'logout'],
          message: 'Please start your timer to continue working'
        };
      }
    }
    
    return { requireTimer: false };
  }
  
  async validateAction(userId, action) {
    const activeTimer = await this.getActiveTimer(userId);
    const restrictedActions = await this.getRestrictedActions(userId);
    
    if (restrictedActions.includes(action) && !activeTimer) {
      throw new Error('Timer must be active to perform this action');
    }
  }
}
```

**Benefits:**
- Ensures consistent time tracking across organization
- Prevents "forgotten timer" scenarios
- Improves billing accuracy

#### 1.3 Idle Detection & Auto-Pause

**User Flow:**
1. User is working with active timer
2. System detects no activity for X minutes (configurable)
3. Modal appears: "We noticed you've been idle. What would you like to do?"
4. Options: Continue timer, Pause timer, Take break
5. If no response in 2 minutes → Auto-pause with "idle" reason

**Algorithm:**
```javascript
// Idle Detection Algorithm
class IdleDetector {
  constructor(thresholdMinutes = 5) {
    this.threshold = thresholdMinutes * 60 * 1000;
    this.lastActivity = Date.now();
    this.checkInterval = 30000; // Check every 30 seconds
    this.warningShown = false;
  }

  startMonitoring() {
    // Listen for user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
      .forEach(event => {
        document.addEventListener(event, () => {
          this.lastActivity = Date.now();
          this.warningShown = false;
        });
      });

    // Monitor for inactivity
    setInterval(() => {
      this.checkIdleStatus();
    }, this.checkInterval);
  }

  checkIdleStatus() {
    const idleTime = Date.now() - this.lastActivity;
    
    if (idleTime > this.threshold && !this.warningShown) {
      this.showIdleWarning();
      this.warningShown = true;
    }
    
    if (idleTime > this.threshold + 120000) { // 2 minutes after warning
      this.autoPauseTimer('idle_timeout');
    }
  }

  showIdleWarning() {
    // Show modal with options
    const modal = new IdleModal({
      onContinue: () => this.resetIdleTimer(),
      onPause: () => this.pauseTimer('user_requested'),
      onBreak: () => this.startBreakTimer()
    });
    modal.show();
  }
}
```

### 2. Task & Project Tracking

#### 2.1 Task Assignment & Time Allocation

**User Flow:**
1. User starts timer → "What are you working on?" prompt
2. User can either:
   - Select from recent tasks
   - Search existing tasks
   - Create new task
   - Link to external ticket (Jira/Trello)
3. Timer starts with task association
4. All time logged against selected task

**Implementation:**
```javascript
// Task Management System
class TaskManager {
  async createTask(data) {
    const task = await Task.create({
      title: data.title,
      description: data.description,
      projectId: data.projectId,
      userId: data.userId,
      estimatedHours: data.estimatedHours,
      priority: data.priority,
      externalId: data.externalId, // For Jira/Trello integration
      externalSource: data.externalSource
    });
    
    // If linked to external source, sync details
    if (data.externalId) {
      await this.syncExternalTask(task.id, data.externalSource, data.externalId);
    }
    
    return task;
  }

  async assignTimerToTask(timerId, taskId) {
    // Update timer with task association
    await TimerSession.update(
      { taskId: taskId },
      { where: { id: timerId } }
    );
    
    // Update task's total time
    await this.updateTaskTime(taskId);
    
    // Notify relevant stakeholders
    await this.notifyTaskUpdate(taskId, 'time_logged');
  }

  async getTaskRecommendations(userId) {
    // AI-powered task recommendations based on:
    // - Recent tasks
    // - Project priorities
    // - Time of day patterns
    // - Upcoming deadlines
    
    const recentTasks = await this.getRecentTasks(userId, 10);
    const urgentTasks = await this.getUrgentTasks(userId);
    const patternsBasedTasks = await this.getPatternBasedTasks(userId);
    
    return {
      recent: recentTasks,
      urgent: urgentTasks,
      recommended: patternsBasedTasks
    };
  }
}
```

**Database Schema:**
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects(id),
  user_id UUID REFERENCES users(id),
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2) DEFAULT 0,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'pending',
  external_id VARCHAR(255),
  external_source VARCHAR(50),
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE timer_task_associations (
  timer_session_id UUID REFERENCES timer_sessions(id),
  task_id UUID REFERENCES tasks(id),
  time_allocated_seconds INTEGER,
  PRIMARY KEY (timer_session_id, task_id)
);
```

#### 2.2 Project-Level Reporting

**User Flow:**
1. User/Admin navigates to Projects dashboard
2. Selects project → Detailed time breakdown appears
3. Views: Total time, Billable vs Non-billable, Task breakdown, Team member contributions
4. Can export reports or generate invoices

**Algorithm:**
```javascript
// Project Analytics Engine
class ProjectAnalytics {
  async generateProjectReport(projectId, dateRange) {
    const baseQuery = `
      SELECT 
        t.title as task_title,
        ts.duration_seconds,
        ts.start_time,
        ts.end_time,
        u.name as user_name,
        p.hourly_rate,
        p.is_billable
      FROM timer_sessions ts
      JOIN tasks t ON ts.task_id = t.id
      JOIN users u ON ts.user_id = u.id
      JOIN projects p ON t.project_id = p.id
      WHERE p.id = $1 
      AND ts.start_time BETWEEN $2 AND $3
      AND ts.status = 'completed'
    `;
    
    const rawData = await db.query(baseQuery, [
      projectId, 
      dateRange.start, 
      dateRange.end
    ]);
    
    return this.processProjectData(rawData);
  }

  processProjectData(rawData) {
    const report = {
      totalHours: 0,
      billableHours: 0,
      nonBillableHours: 0,
      totalCost: 0,
      taskBreakdown: {},
      userBreakdown: {},
      dailyBreakdown: {}
    };

    rawData.forEach(entry => {
      const hours = entry.duration_seconds / 3600;
      const cost = hours * (entry.hourly_rate || 0);
      
      report.totalHours += hours;
      
      if (entry.is_billable) {
        report.billableHours += hours;
        report.totalCost += cost;
      } else {
        report.nonBillableHours += hours;
      }
      
      // Task breakdown
      if (!report.taskBreakdown[entry.task_title]) {
        report.taskBreakdown[entry.task_title] = {
          hours: 0,
          cost: 0,
          sessions: 0
        };
      }
      report.taskBreakdown[entry.task_title].hours += hours;
      report.taskBreakdown[entry.task_title].cost += cost;
      report.taskBreakdown[entry.task_title].sessions += 1;
      
      // User breakdown
      if (!report.userBreakdown[entry.user_name]) {
        report.userBreakdown[entry.user_name] = {
          hours: 0,
          cost: 0,
          tasks: new Set()
        };
      }
      report.userBreakdown[entry.user_name].hours += hours;
      report.userBreakdown[entry.user_name].cost += cost;
      report.userBreakdown[entry.user_name].tasks.add(entry.task_title);
      
      // Daily breakdown
      const date = entry.start_time.toISOString().split('T')[0];
      if (!report.dailyBreakdown[date]) {
        report.dailyBreakdown[date] = { hours: 0, cost: 0 };
      }
      report.dailyBreakdown[date].hours += hours;
      report.dailyBreakdown[date].cost += cost;
    });
    
    return report;
  }
}
```

### 3. Developer Tool Integration

#### 3.1 IDE Integration (VS Code/JetBrains)

**User Flow:**
1. Developer opens VS Code/JetBrains IDE
2. Trackono plugin detects IDE launch
3. If no timer running → Prompt appears: "Start timer for [detected project]?"
4. Timer starts automatically when developer begins coding
5. Timer pauses when IDE is idle/closed

**VS Code Extension Implementation:**
```javascript
// VS Code Extension - extension.js
const vscode = require('vscode');
const TrackingClient = require('./trackingClient');

class VSCodeIntegration {
  constructor() {
    this.trackingClient = new TrackingClient();
    this.isTracking = false;
    this.currentProject = null;
    this.idleTimeout = null;
  }

  activate(context) {
    // Register commands
    const startCommand = vscode.commands.registerCommand(
      'trackono.startTimer', 
      () => this.startTimer()
    );
    
    const stopCommand = vscode.commands.registerCommand(
      'trackono.stopTimer', 
      () => this.stopTimer()
    );

    // Listen for document changes
    const documentChangeListener = vscode.workspace.onDidChangeTextDocument(
      (event) => this.handleDocumentChange(event)
    );

    // Listen for active editor changes
    const editorChangeListener = vscode.window.onDidChangeActiveTextEditor(
      (editor) => this.handleEditorChange(editor)
    );

    // Register status bar
    this.createStatusBar();

    context.subscriptions.push(
      startCommand, 
      stopCommand, 
      documentChangeListener, 
      editorChangeListener
    );
  }

  async handleDocumentChange(event) {
    if (!this.isTracking) {
      const shouldAutoStart = await this.shouldAutoStartTimer();
      if (shouldAutoStart) {
        this.startTimer();
      }
    }
    
    // Reset idle timer
    this.resetIdleTimer();
    
    // Log activity
    await this.trackingClient.logActivity({
      type: 'code_edit',
      file: event.document.fileName,
      language: event.document.languageId,
      changes: event.contentChanges.length
    });
  }

  async detectCurrentProject() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) return null;

    // Try to detect from git
    try {
      const gitConfig = await this.readGitConfig(workspaceFolder.uri.fsPath);
      return {
        name: gitConfig.repositoryName,
        path: workspaceFolder.uri.fsPath,
        type: 'git'
      };
    } catch (error) {
      // Fallback to folder name
      return {
        name: workspaceFolder.name,
        path: workspaceFolder.uri.fsPath,
        type: 'folder'
      };
    }
  }

  async startTimer() {
    const project = await this.detectCurrentProject();
    const activeEditor = vscode.window.activeTextEditor;
    
    const timerData = {
      project: project,
      context: {
        ide: 'vscode',
        file: activeEditor?.document.fileName,
        language: activeEditor?.document.languageId
      }
    };

    const timer = await this.trackingClient.startTimer(timerData);
    this.isTracking = true;
    this.updateStatusBar('Running');
    
    // Start idle detection
    this.startIdleDetection();
  }
}
```

#### 3.2 Git Integration

**User Flow:**
1. Developer makes git commit
2. System detects commit with active timer
3. Commit message is tagged with time information
4. Time log is associated with commit hash
5. Reports can show time spent per commit/feature

**Implementation:**
```javascript
// Git Hook Integration
class GitIntegration {
  setupGitHooks(projectPath) {
    const preCommitHook = `#!/bin/sh
# Trackono Git Integration
node ${__dirname}/git-pre-commit.js
`;
    
    const postCommitHook = `#!/bin/sh
# Trackono Git Integration  
node ${__dirname}/git-post-commit.js
`;

    fs.writeFileSync(`${projectPath}/.git/hooks/pre-commit`, preCommitHook);
    fs.writeFileSync(`${projectPath}/.git/hooks/post-commit`, postCommitHook);
    
    // Make executable
    fs.chmodSync(`${projectPath}/.git/hooks/pre-commit`, '755');
    fs.chmodSync(`${projectPath}/.git/hooks/post-commit`, '755');
  }

  async handlePreCommit() {
    const activeTimer = await this.getActiveTimer();
    
    if (!activeTimer) {
      // Prompt user to start timer
      const response = await this.promptTimerStart();
      if (!response.startTimer) {
        console.log('Commit blocked: Timer required for commits');
        process.exit(1);
      }
    }
    
    // Log pre-commit activity
    await this.logActivity({
      type: 'git_commit_start',
      timerId: activeTimer.id,
      timestamp: Date.now()
    });
  }

  async handlePostCommit() {
    const commitHash = await this.getLatestCommitHash();
    const commitMessage = await this.getCommitMessage(commitHash);
    const activeTimer = await this.getActiveTimer();
    
    if (activeTimer) {
      // Associate commit with timer session
      await this.associateCommitWithTimer({
        commitHash,
        commitMessage,
        timerId: activeTimer.id,
        elapsedTime: activeTimer.elapsedTime
      });
      
      // Add time info to commit message if configured
      if (this.config.tagCommitsWithTime) {
        await this.amendCommitMessage(commitHash, commitMessage, activeTimer);
      }
    }
  }

  async generateCommitReport(projectId, dateRange) {
    const query = `
      SELECT 
        gc.commit_hash,
        gc.commit_message,
        gc.committed_at,
        ts.duration_seconds,
        ts.task_id,
        t.title as task_title,
        u.name as developer_name
      FROM git_commits gc
      JOIN timer_sessions ts ON gc.timer_session_id = ts.id
      JOIN tasks t ON ts.task_id = t.id
      JOIN users u ON ts.user_id = u.id
      WHERE gc.project_id = $1
      AND gc.committed_at BETWEEN $2 AND $3
      ORDER BY gc.committed_at DESC
    `;
    
    const commits = await db.query(query, [
      projectId, 
      dateRange.start, 
      dateRange.end
    ]);
    
    return this.analyzeCommitPatterns(commits);
  }
}
```

### 4. Enforcement Features

#### 4.1 Action Blocking System

**User Flow:**
1. Developer attempts restricted action (e.g., git push, deploy)
2. System checks if timer is active
3. If no timer → Action blocked with message: "Please start your timer first"
4. User starts timer → Action proceeds
5. All blocked actions are logged for compliance

**Algorithm:**
```javascript
// Action Enforcement System
class ActionEnforcement {
  constructor() {
    this.restrictedActions = new Map();
    this.loadEnforcementRules();
  }

  loadEnforcementRules() {
    // Load from database or config
    this.restrictedActions.set('git_push', {
      enabled: true,
      message: 'Timer must be active to push code',
      bypassRoles: ['admin', 'manager']
    });
    
    this.restrictedActions.set('deploy', {
      enabled: true,
      message: 'Timer required for deployment actions',
      bypassRoles: ['admin', 'devops']
    });
    
    this.restrictedActions.set('production_access', {
      enabled: true,
      message: 'Timer required for production access',
      bypassRoles: ['admin']
    });
  }

  async validateAction(userId, action, context = {}) {
    const rule = this.restrictedActions.get(action);
    if (!rule || !rule.enabled) {
      return { allowed: true };
    }

    // Check if user has bypass role
    const user = await this.getUser(userId);
    if (rule.bypassRoles.includes(user.role)) {
      return { allowed: true, reason: 'bypass_role' };
    }

    // Check if timer is active
    const activeTimer = await this.getActiveTimer(userId);
    if (!activeTimer) {
      // Log blocked action
      await this.logBlockedAction({
        userId,
        action,
        context,
        timestamp: Date.now(),
        reason: 'no_active_timer'
      });

      return {
        allowed: false,
        message: rule.message,
        suggestedAction: 'start_timer'
      };
    }

    // Log allowed action
    await this.logAllowedAction({
      userId,
      action,
      context,
      timerId: activeTimer.id,
      timestamp: Date.now()
    });

    return { allowed: true, timerId: activeTimer.id };
  }

  // CLI Tool Integration
  createCLIWrapper(command) {
    return `#!/bin/bash
# Trackono CLI Wrapper for ${command}

# Check if action is allowed
VALIDATION_RESULT=$(curl -s -X POST http://localhost:8080/api/validate-action \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $TRACKONO_TOKEN" \\
  -d '{
    "action": "'${command}'",
    "context": {
      "pwd": "'$(pwd)'",
      "args": "'$@'"
    }
  }')

ALLOWED=$(echo $VALIDATION_RESULT | jq -r '.allowed')

if [ "$ALLOWED" != "true" ]; then
  MESSAGE=$(echo $VALIDATION_RESULT | jq -r '.message')
  echo "❌ Action blocked: $MESSAGE"
  echo "💡 Start your timer first: trackono start"
  exit 1
fi

# Execute original command
${command} "$@"
`;
  }
}
```

#### 4.2 Smart Nudging System

**User Flow:**
1. System detects user inactivity or timer-less work
2. Progressive nudging starts:
   - Gentle notification (5 min)
   - Persistent reminder (15 min)
   - Action blocking (30 min)
3. User can snooze notifications or start timer
4. ML learns user patterns to optimize nudging timing

**Implementation:**
```javascript
// Intelligent Nudging System
class NudgingSystem {
  constructor() {
    this.nudgeLevels = [
      { delay: 5 * 60 * 1000, type: 'gentle', persistent: false },
      { delay: 15 * 60 * 1000, type: 'reminder', persistent: true },
      { delay: 30 * 60 * 1000, type: 'enforcement', persistent: true }
    ];
    this.userPatterns = new Map();
  }

  async startNudging(userId) {
    const userProfile = await this.getUserNudgeProfile(userId);
    const customizedNudges = this.customizeNudges(userProfile);
    
    customizedNudges.forEach((nudge, index) => {
      setTimeout(() => {
        this.sendNudge(userId, nudge, index);
      }, nudge.delay);
    });
  }

  async sendNudge(userId, nudge, level) {
    const user = await this.getUser(userId);
    
    // Check if user started timer since nudge was scheduled
    const activeTimer = await this.getActiveTimer(userId);
    if (activeTimer) {
      return; // Cancel nudge
    }

    const nudgeData = {
      userId,
      level,
      type: nudge.type,
      message: this.generateNudgeMessage(user, nudge),
      channels: this.selectNudgeChannels(user, nudge),
      timestamp: Date.now()
    };

    // Send across multiple channels
    await Promise.all([
      this.sendDesktopNotification(nudgeData),
      this.sendSlackMessage(nudgeData),
      this.sendEmailReminder(nudgeData),
      this.updateDashboard(nudgeData)
    ]);

    // Log nudge for analytics
    await this.logNudge(nudgeData);

    // Learn from user response
    setTimeout(() => {
      this.analyzeNudgeResponse(userId, nudgeData);
    }, 5 * 60 * 1000); // Check response after 5 minutes
  }

  generateNudgeMessage(user, nudge) {
    const messages = {
      gentle: [
        `Hi ${user.firstName}! Just a friendly reminder to start your timer 🕒`,
        `Ready to track your awesome work? Start your timer! ⏰`,
        `Your productivity insights are waiting! Start timer 📊`
      ],
      reminder: [
        `${user.firstName}, you've been working for 15 minutes without a timer. Let's track this time! ⏱️`,
        `Don't lose track of your hard work! Please start your timer 🎯`,
        `Your team is counting on accurate time tracking. Please start timer 📈`
      ],
      enforcement: [
        `Timer is required to continue working. Please start now. 🚨`,
        `Your access will be limited until timer is started. ⛔`,
        `Compliance requires active time tracking. Start timer immediately. 📋`
      ]
    };

    const typeMessages = messages[nudge.type];
    return typeMessages[Math.floor(Math.random() * typeMessages.length)];
  }

  async customizeNudges(userProfile) {
    // AI-powered nudge customization based on:
    // - Historical response patterns
    // - Productivity peaks/valleys  
    // - Role and team requirements
    // - Personal preferences

    const baseNudges = [...this.nudgeLevels];
    
    // Adjust timing based on user patterns
    if (userProfile.preferredNudgeDelay) {
      baseNudges.forEach(nudge => {
        nudge.delay *= userProfile.preferredNudgeDelay;
      });
    }

    // Adjust intensity based on role
    if (userProfile.role === 'senior' || userProfile.role === 'lead') {
      baseNudges[0].type = 'gentle';
      baseNudges[1].type = 'gentle';
      // More autonomous roles get gentler nudges
    }

    return baseNudges;
  }
}
```

### 5. Productivity Insights & Reporting

#### 5.1 Advanced Analytics Engine

**User Flow:**
1. User opens Analytics dashboard
2. Selects time period and metrics
3. Interactive charts show:
   - Focus vs Distraction time
   - Productivity patterns by hour/day
   - Task completion efficiency
   - Burnout risk indicators
4. AI provides insights and recommendations

**Algorithm:**
```javascript
// Advanced Analytics Engine
class ProductivityAnalytics {
  async generateInsights(userId, dateRange) {
    const rawData = await this.collectUserData(userId, dateRange);
    const insights = {
      focusAnalysis: await this.analyzeFocusPatterns(rawData),
      productivityTrends: await this.analyzeProductivityTrends(rawData),
      burnoutRisk: await this.calculateBurnoutRisk(rawData),
      recommendations: await this.generateRecommendations(rawData),
      comparisons: await this.generateComparisons(userId, rawData)
    };
    
    return insights;
  }

  async analyzeFocusPatterns(data) {
    const sessions = data.timerSessions;
    const activities = data.activities;
    
    // Calculate focus scores for each session
    const focusScores = sessions.map(session => {
      const sessionActivities = activities.filter(a => 
        a.timestamp >= session.startTime && 
        a.timestamp <= session.endTime
      );
      
      return this.calculateFocusScore(session, sessionActivities);
    });
    
    // Identify patterns
    const patterns = {
      bestFocusHours: this.identifyBestFocusHours(sessions, focusScores),
      focusByTaskType: this.analyzeFocusByTaskType(sessions, focusScores),
      distractionSources: this.identifyDistractionSources(activities),
      focusTrends: this.calculateFocusTrends(sessions, focusScores)
    };
    
    return patterns;
  }

  calculateFocusScore(session, activities) {
    const totalDuration = session.duration;
    const focusedTime = this.calculateFocusedTime(activities);
    const interruptionCount = this.countInterruptions(activities);
    const contextSwitches = this.countContextSwitches(activities);
    
    // Focus score algorithm (0-100)
    let score = 100;
    
    // Penalize for low focus time ratio
    const focusRatio = focusedTime / totalDuration;
    score *= focusRatio;
    
    // Penalize for interruptions
    score -= interruptionCount * 5;
    
    // Penalize for context switches
    score -= contextSwitches * 3;
    
    // Bonus for long uninterrupted periods
    const longestFocusPeriod = this.getLongestFocusPeriod(activities);
    if (longestFocusPeriod > 25 * 60 * 1000) { // 25 minutes
      score += 10; // Deep work bonus
    }
    
    return Math.max(0, Math.min(100, score));
  }

  async generateRecommendations(data) {
    const recommendations = [];
    
    // Analyze work patterns
    const peakHours = this.identifyPeakProductivityHours(data);
    const lowEnergyPeriods = this.identifyLowEnergyPeriods(data);
    const breakPatterns = this.analyzeBreakPatterns(data);
    
    // Generate personalized recommendations
    if (peakHours.length > 0) {
      recommendations.push({
        type: 'optimization',
        title: 'Schedule Complex Tasks During Peak Hours',
        description: `You're most productive between ${peakHours.join(', ')}. Schedule your most challenging tasks during these hours.`,
        impact: 'high',
        effort: 'low'
      });
    }
    
    if (breakPatterns.averageBreakLength < 5) {
      recommendations.push({
        type: 'wellness',
        title: 'Take Longer Breaks',
        description: 'Your breaks average only ${breakPatterns.averageBreakLength} minutes. Consider 10-15 minute breaks for better recovery.',
        impact: 'medium',
        effort: 'low'
      });
    }
    
    return recommendations;
  }

  async calculateBurnoutRisk(data) {
    const factors = {
      overworkHours: this.calculateOverworkHours(data),
      breakDeficit: this.calculateBreakDeficit(data),
      weekendWork: this.calculateWeekendWork(data),
      lateNightWork: this.calculateLateNightWork(data),
      productivityDecline: this.calculateProductivityDecline(data)
    };
    
    // Weighted risk calculation
    const riskScore = (
      factors.overworkHours * 0.3 +
      factors.breakDeficit * 0.2 +
      factors.weekendWork * 0.2 +
      factors.lateNightWork * 0.15 +
      factors.productivityDecline * 0.15
    );
    
    return {
      score: riskScore,
      level: this.getRiskLevel(riskScore),
      factors: factors,
      recommendations: this.getBurnoutRecommendations(riskScore, factors)
    };
  }
}
```

#### 5.2 Real-time Dashboard & Visualization

**User Flow:**
1. User opens dashboard → Real-time metrics load
2. Interactive charts show current day progress
3. Filters allow drilling down by project/task/team member
4. Live updates as team members start/stop timers
5. Export options for reports and presentations

**Implementation:**
```javascript
// Real-time Dashboard System
class DashboardEngine {
  constructor() {
    this.websocketConnections = new Map();
    this.metricsCache = new Map();
    this.updateInterval = 30000; // 30 seconds
  }

  async initializeDashboard(userId, organizationId) {
    const dashboardData = {
      personalMetrics: await this.getPersonalMetrics(userId),
      teamMetrics: await this.getTeamMetrics(organizationId),
      projectMetrics: await this.getProjectMetrics(organizationId),
      realTimeActivity: await this.getRealTimeActivity(organizationId)
    };
    
    // Start real-time updates
    this.startRealTimeUpdates(userId, organizationId);
    
    return dashboardData;
  }

  async getPersonalMetrics(userId) {
    const today = new Date();
    const thisWeek = this.getWeekRange(today);
    const thisMonth = this.getMonthRange(today);
    
    const [todayStats, weekStats, monthStats] = await Promise.all([
      this.getUserStats(userId, { start: today, end: today }),
      this.getUserStats(userId, thisWeek),
      this.getUserStats(userId, thisMonth)
    ]);
    
    return {
      today: {
        totalTime: todayStats.totalSeconds,
        focusTime: todayStats.focusSeconds,
        tasks: todayStats.tasksCompleted,
        efficiency: todayStats.efficiencyScore
      },
      week: {
        totalTime: weekStats.totalSeconds,
        dailyAverage: weekStats.totalSeconds / 7,
        productivityTrend: this.calculateTrend(weekStats.dailyBreakdown)
      },
      month: {
        totalTime: monthStats.totalSeconds,
        weeklyComparison: this.compareWeeks(monthStats.weeklyBreakdown),
        goals: await this.getGoalProgress(userId, thisMonth)
      }
    };
  }

  async getRealTimeActivity(organizationId) {
    const activeUsers = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.avatar_url,
        ts.id as timer_id,
        ts.start_time,
        ts.duration_seconds,
        t.title as current_task,
        p.name as project_name
      FROM users u
      JOIN timer_sessions ts ON u.id = ts.user_id
      LEFT JOIN tasks t ON ts.task_id = t.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE u.organization_id = $1
      AND ts.status = 'running'
      AND ts.start_time > NOW() - INTERVAL '12 hours'
      ORDER BY ts.start_time DESC
    `, [organizationId]);
    
    return activeUsers.map(user => ({
      ...user,
      currentDuration: Date.now() - new Date(user.start_time).getTime(),
      status: this.getUserStatus(user)
    }));
  }

  startRealTimeUpdates(userId, organizationId) {
    const updateLoop = async () => {
      try {
        const updates = {
          personalMetrics: await this.getPersonalMetrics(userId),
          teamActivity: await this.getRealTimeActivity(organizationId),
          notifications: await this.getRecentNotifications(userId)
        };
        
        // Broadcast to connected clients
        this.broadcastUpdate(organizationId, updates);
        
      } catch (error) {
        console.error('Dashboard update error:', error);
      }
    };
    
    // Initial update
    updateLoop();
    
    // Schedule regular updates
    setInterval(updateLoop, this.updateInterval);
  }

  broadcastUpdate(organizationId, data) {
    const connections = this.websocketConnections.get(organizationId) || [];
    const message = JSON.stringify({
      type: 'dashboard_update',
      data: data,
      timestamp: Date.now()
    });
    
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }
}
```

### 6. Gamification and Motivation

#### 6.1 Achievement System

**User Flow:**
1. User completes timer session/task
2. System checks for achievement triggers
3. If achievement unlocked → Celebration notification appears
4. Achievement added to user profile
5. Leaderboard updates in real-time
6. Social sharing options available

**Algorithm:**
```javascript
// Gamification Achievement System
class AchievementEngine {
  constructor() {
    this.achievements = this.loadAchievements();
    this.streakCalculator = new StreakCalculator();
    this.leaderboardManager = new LeaderboardManager();
  }

  loadAchievements() {
    return {
      // Time-based achievements
      'first_timer': {
        name: 'Getting Started',
        description: 'Start your first timer',
        icon: '🚀',
        points: 10,
        trigger: 'timer_start',
        condition: (user, data) => user.totalTimerSessions === 1
      },
      
      'pomodoro_master': {
        name: 'Pomodoro Master',
        description: 'Complete 25 Pomodoro sessions',
        icon: '🍅',
        points: 100,
        trigger: 'timer_complete',
        condition: (user, data) => 
          user.completedPomodoros >= 25 && data.timerType === 'pomodoro'
      },
      
      'deep_focus': {
        name: 'Deep Focus',
        description: 'Work for 2+ hours without interruption',
        icon: '🧠',
        points: 150,
        trigger: 'timer_complete',
        condition: (user, data) => 
          data.duration >= 7200 && data.interruptions === 0
      },
      
      // Streak achievements
      'week_warrior': {
        name: 'Week Warrior',
        description: 'Track time for 7 consecutive days',
        icon: '⚔️',
        points: 200,
        trigger: 'daily_summary',
        condition: (user, data) => user.currentStreak >= 7
      },
      
      'consistency_king': {
        name: 'Consistency King',
        description: 'Track time for 30 consecutive days',
        icon: '👑',
        points: 500,
        trigger: 'daily_summary',
        condition: (user, data) => user.currentStreak >= 30
      },
      
      // Productivity achievements
      'task_terminator': {
        name: 'Task Terminator',
        description: 'Complete 10 tasks in a single day',
        icon: '🎯',
        points: 120,
        trigger: 'task_complete',
        condition: (user, data) => data.tasksCompletedToday >= 10
      },
      
      'efficiency_expert': {
        name: 'Efficiency Expert',
        description: 'Maintain 90%+ focus score for a week',
        icon: '⚡',
        points: 300,
        trigger: 'weekly_summary',
        condition: (user, data) => data.weeklyFocusScore >= 90
      },
      
      // Team achievements
      'team_player': {
        name: 'Team Player',
        description: 'Be part of a team that logs 100+ hours in a week',
        icon: '🤝',
        points: 80,
        trigger: 'weekly_team_summary',
        condition: (user, data) => data.teamWeeklyHours >= 100
      },
      
      // Special achievements
      'night_owl': {
        name: 'Night Owl',
        description: 'Log 10+ hours between 10 PM and 6 AM',
        icon: '🦉',
        points: 75,
        trigger: 'weekly_summary',
        condition: (user, data) => data.nightHours >= 10
      },
      
      'early_bird': {
        name: 'Early Bird',
        description: 'Start timer before 6 AM for 5 consecutive days',
        icon: '🐦',
        points: 100,
        trigger: 'daily_summary',
        condition: (user, data) => data.earlyStartStreak >= 5
      }
    };
  }

  async processAchievements(userId, trigger, data) {
    const user = await this.getUserAchievementData(userId);
    const newAchievements = [];
    
    for (const [key, achievement] of Object.entries(this.achievements)) {
      if (achievement.trigger === trigger && !user.unlockedAchievements.includes(key)) {
        if (achievement.condition(user, data)) {
          await this.unlockAchievement(userId, key, achievement);
          newAchievements.push({ key, ...achievement });
        }
      }
    }
    
    if (newAchievements.length > 0) {
      await this.celebrateAchievements(userId, newAchievements);
      await this.updateLeaderboards(userId, newAchievements);
    }
    
    return newAchievements;
  }

  async unlockAchievement(userId, achievementKey, achievement) {
    // Save to database
    await db.query(`
      INSERT INTO user_achievements (user_id, achievement_key, unlocked_at, points)
      VALUES ($1, $2, NOW(), $3)
    `, [userId, achievementKey, achievement.points]);
    
    // Update user total points
    await db.query(`
      UPDATE users 
      SET total_points = total_points + $2,
          level = FLOOR(SQRT(total_points + $2) / 10) + 1
      WHERE id = $1
    `, [userId, achievement.points]);
    
    // Log achievement event
    await this.logEvent({
      type: 'achievement_unlocked',
      userId,
      achievementKey,
      points: achievement.points,
      timestamp: Date.now()
    });
  }

  async celebrateAchievements(userId, achievements) {
    const user = await this.getUser(userId);
    
    // Create celebration notification
    const notification = {
      type: 'achievement_celebration',
      title: achievements.length > 1 ? 'Multiple Achievements Unlocked!' : 'Achievement Unlocked!',
      message: achievements.map(a => `${a.icon} ${a.name}`).join('\n'),
      achievements: achievements,
      showConfetti: true,
      autoClose: false
    };
    
    // Send to user
    await this.notificationService.send(userId, notification);
    
    // Optional: Share to team channel
    if (user.shareAchievements) {
      await this.shareToTeam(userId, achievements);
    }
  }
}
```

#### 6.2 Leaderboard & Competition System

**User Flow:**
1. User views leaderboards (daily/weekly/monthly/all-time)
2. Different categories: Hours logged, Tasks completed, Streak length, Focus score
3. Team competitions with group challenges
4. Optional participation in organization-wide competitions
5. Recognition system for top performers

**Implementation:**
```javascript
// Dynamic Leaderboard System
class LeaderboardManager {
  constructor() {
    this.leaderboardTypes = [
      'daily_hours', 'weekly_hours', 'monthly_hours',
      'daily_tasks', 'weekly_tasks', 'monthly_tasks',
      'current_streak', 'longest_streak',
      'focus_score', 'efficiency_rating',
      'team_collaboration', 'early_bird_starts'
    ];
    this.updateInterval = 5 * 60 * 1000; // 5 minutes
  }

  async generateLeaderboards(organizationId, type = 'weekly_hours') {
    const timeRange = this.getTimeRange(type);
    const query = this.buildLeaderboardQuery(type, timeRange);
    
    const results = await db.query(query, [organizationId, timeRange.start, timeRange.end]);
    
    return {
      type: type,
      period: timeRange,
      rankings: results.map((row, index) => ({
        rank: index + 1,
        userId: row.user_id,
        name: row.user_name,
        avatar: row.avatar_url,
        score: row.score,
        trend: row.trend, // up/down/same from last period
        badge: this.getBadge(index + 1),
        details: this.getScoreDetails(type, row)
      })),
      myRank: this.findUserRank(results, userId),
      totalParticipants: results.length
    };
  }

  buildLeaderboardQuery(type, timeRange) {
    const baseQuery = `
      WITH user_stats AS (
        SELECT 
          u.id as user_id,
          u.name as user_name,
          u.avatar_url,
    `;
    
    switch (type) {
      case 'weekly_hours':
        return baseQuery + `
          SUM(ts.duration_seconds) / 3600.0 as score,
          COUNT(ts.id) as sessions_count,
          COUNT(DISTINCT DATE(ts.start_time)) as active_days
        FROM users u
        LEFT JOIN timer_sessions ts ON u.id = ts.user_id
        WHERE u.organization_id = $1
        AND ts.start_time BETWEEN $2 AND $3
        AND ts.status = 'completed'
        GROUP BY u.id, u.name, u.avatar_url
        ORDER BY score DESC NULLS LAST
        `;
        
      case 'focus_score':
        return baseQuery + `
          AVG(ts.focus_score) as score,
          COUNT(ts.id) as sessions_count,
          SUM(ts.duration_seconds) / 3600.0 as total_hours
        FROM users u
        LEFT JOIN timer_sessions ts ON u.id = ts.user_id
        WHERE u.organization_id = $1
        AND ts.start_time BETWEEN $2 AND $3
        AND ts.status = 'completed'
        AND ts.focus_score IS NOT NULL
        GROUP BY u.id, u.name, u.avatar_url
        HAVING COUNT(ts.id) >= 5  -- Minimum sessions for ranking
        ORDER BY score DESC
        `;
        
      case 'current_streak':
        return `
        SELECT 
          u.id as user_id,
          u.name as user_name,
          u.avatar_url,
          u.current_streak as score,
          u.longest_streak,
          u.last_activity_date
        FROM users u
        WHERE u.organization_id = $1
        AND u.current_streak > 0
        ORDER BY score DESC, u.longest_streak DESC
        `;
    }
  }

  async createTeamChallenge(organizationId, challengeData) {
    const challenge = await db.query(`
      INSERT INTO team_challenges (
        organization_id, 
        name, 
        description, 
        type, 
        target_value, 
        start_date, 
        end_date,
        reward_points,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      organizationId,
      challengeData.name,
      challengeData.description,
      challengeData.type,
      challengeData.targetValue,
      challengeData.startDate,
      challengeData.endDate,
      challengeData.rewardPoints,
      challengeData.createdBy
    ]);
    
    // Notify all team members
    await this.notifyTeamChallenge(organizationId, challenge);
    
    return challenge;
  }

  async updateChallengeProgress(challengeId) {
    const challenge = await this.getChallenge(challengeId);
    const progress = await this.calculateChallengeProgress(challenge);
    
    await db.query(`
      UPDATE team_challenges 
      SET current_progress = $2, updated_at = NOW()
      WHERE id = $1
    `, [challengeId, progress.current]);
    
    // Check if challenge completed
    if (progress.current >= challenge.target_value && challenge.status === 'active') {
      await this.completeChal lenge(challengeId);
    }
    
    return progress;
  }
}
```

### 7. Integration Features

#### 7.1 External Tool Integration Framework

**User Flow:**
1. Admin navigates to Integrations page
2. Selects tool to integrate (Jira, Slack, GitHub, etc.)
3. Completes OAuth flow or enters API credentials
4. Configures integration settings (sync frequency, data mapping)
5. Integration becomes active for all team members
6. Data flows bidirectionally between systems

**Framework Implementation:**
```javascript
// Universal Integration Framework
class IntegrationFramework {
  constructor() {
    this.integrations = new Map();
    this.webhookHandlers = new Map();
    this.syncScheduler = new SyncScheduler();
  }

  registerIntegration(name, integrationClass) {
    this.integrations.set(name, integrationClass);
  }

  async enableIntegration(organizationId, integrationType, config) {
    const IntegrationClass = this.integrations.get(integrationType);
    if (!IntegrationClass) {
      throw new Error(`Integration type ${integrationType} not supported`);
    }

    const integration = new IntegrationClass(config);
    
    // Test connection
    await integration.testConnection();
    
    // Save configuration
    await db.query(`
      INSERT INTO organization_integrations (
        organization_id, 
        integration_type, 
        config, 
        status,
        enabled_at
      ) VALUES ($1, $2, $3, 'active', NOW())
      ON CONFLICT (organization_id, integration_type) 
      DO UPDATE SET 
        config = $3, 
        status = 'active', 
        enabled_at = NOW()
    `, [organizationId, integrationType, JSON.stringify(config)]);
    
    // Setup webhooks if supported
    if (integration.supportsWebhooks) {
      await integration.setupWebhooks();
    }
    
    // Schedule initial sync
    await this.syncScheduler.scheduleSync(organizationId, integrationType);
    
    return { success: true, integration: integration };
  }
}

// JIRA Integration Implementation
class JiraIntegration {
  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.email = config.email;
    this.apiToken = config.apiToken;
    this.projectKeys = config.projectKeys || [];
    this.client = new JiraClient({
      host: this.baseUrl,
      username: this.email,
      password: this.apiToken
    });
  }

  async testConnection() {
    try {
      await this.client.getCurrentUser();
      return { success: true };
    } catch (error) {
      throw new Error(`JIRA connection failed: ${error.message}`);
    }
  }

  async syncTasks(organizationId) {
    const syncResults = {
      imported: 0,
      updated: 0,
      errors: []
    };

    for (const projectKey of this.projectKeys) {
      try {
        const issues = await this.client.searchJira(
          `project = ${projectKey} AND updated >= -7d`,
          {
            fields: ['summary', 'description', 'assignee', 'status', 'priority', 'updated'],
            maxResults: 100
          }
        );

        for (const issue of issues.issues) {
          const taskData = this.mapJiraIssueToTask(issue, organizationId);
          const result = await this.upsertTask(taskData);
          
          if (result.created) {
            syncResults.imported++;
          } else {
            syncResults.updated++;
          }
        }
      } catch (error) {
        syncResults.errors.push(`Project ${projectKey}: ${error.message}`);
      }
    }

    return syncResults;
  }

  mapJiraIssueToTask(issue, organizationId) {
    return {
      externalId: issue.key,
      externalSource: 'jira',
      title: issue.fields.summary,
      description: issue.fields.description || '',
      status: this.mapJiraStatus(issue.fields.status.name),
      priority: this.mapJiraPriority(issue.fields.priority?.name),
      assigneeEmail: issue.fields.assignee?.emailAddress,
      organizationId: organizationId,
      updatedAt: new Date(issue.fields.updated)
    };
  }

  async setupWebhooks() {
    const webhookUrl = `${process.env.APP_URL}/api/webhooks/jira`;
    
    const webhook = await this.client.createWebhook({
      name: 'Trackono Integration',
      url: webhookUrl,
      events: [
        'jira:issue_created',
        'jira:issue_updated',
        'jira:issue_deleted'
      ]
    });

    return webhook;
  }

  async handleWebhook(payload) {
    const { issue, webhookEvent } = payload;
    
    switch (webhookEvent) {
      case 'jira:issue_created':
      case 'jira:issue_updated':
        await this.syncSingleIssue(issue.key);
        break;
        
      case 'jira:issue_deleted':
        await this.markTaskDeleted(issue.key);
        break;
    }
  }
}

// Slack Integration Implementation  
class SlackIntegration {
  constructor(config) {
    this.botToken = config.botToken;
    this.signingSecret = config.signingSecret;
    this.client = new WebClient(this.botToken);
  }

  async testConnection() {
    try {
      const auth = await this.client.auth.test();
      return { success: true, teamName: auth.team };
    } catch (error) {
      throw new Error(`Slack connection failed: ${error.message}`);
    }
  }

  async sendTimerReminder(userId, message) {
    const user = await this.getUserSlackId(userId);
    if (!user.slackId) return;

    await this.client.chat.postMessage({
      channel: user.slackId,
      text: message,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: message
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Start Timer'
              },
              action_id: 'start_timer',
              style: 'primary'
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Snooze 15 min'
              },
              action_id: 'snooze_reminder'
            }
          ]
        }
      ]
    });
  }

  async handleSlashCommand(command, userId) {
    switch (command.command) {
      case '/timer':
        return await this.handleTimerCommand(command, userId);
      case '/status':
        return await this.handleStatusCommand(command, userId);
      case '/report':
        return await this.handleReportCommand(command, userId);
    }
  }

  async handleTimerCommand(command, userId) {
    const args = command.text.split(' ');
    const action = args[0];

    switch (action) {
      case 'start':
        const timer = await this.timerService.startTimer(userId, {
          source: 'slack',
          taskName: args.slice(1).join(' ') || 'Slack Timer'
        });
        return {
          text: `⏱️ Timer started! Currently tracking: ${timer.taskName}`,
          response_type: 'ephemeral'
        };
        
      case 'stop':
        const stoppedTimer = await this.timerService.stopTimer(userId);
        const duration = this.formatDuration(stoppedTimer.duration);
        return {
          text: `✅ Timer stopped! You worked for ${duration}`,
          response_type: 'ephemeral'
        };
        
      case 'status':
        const activeTimer = await this.timerService.getActiveTimer(userId);
        if (activeTimer) {
          const elapsed = this.formatDuration(activeTimer.elapsedTime);
          return {
            text: `⏰ Currently tracking: ${activeTimer.taskName} (${elapsed})`,
            response_type: 'ephemeral'
          };
        } else {
          return {
            text: '⏸️ No active timer',
            response_type: 'ephemeral'
          };
        }
    }
  }
}
```

### 8. Administrative Features

#### 8.1 Organization Management System

**User Flow:**
1. Admin logs into admin panel
2. Dashboard shows organization overview: active users, total time, projects
3. Admin can manage users, configure policies, view reports
4. Enforcement settings can be applied globally or per team
5. Billing and usage analytics available

**Implementation:**
```javascript
// Organization Management System
class OrganizationManager {
  async getOrganizationDashboard(organizationId) {
    const [stats, activeUsers, projects, recentActivity] = await Promise.all([
      this.getOrganizationStats(organizationId),
      this.getActiveUsers(organizationId),
      this.getProjectsSummary(organizationId),
      this.getRecentActivity(organizationId)
    ]);

    return {
      stats,
      activeUsers,
      projects,
      recentActivity,
      compliance: await this.getComplianceMetrics(organizationId)
    };
  }

  async getOrganizationStats(organizationId) {
    const query = `
      WITH date_series AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '30 days',
          CURRENT_DATE,
          '1 day'::interval
        )::date as date
      ),
      daily_stats AS (
        SELECT 
          DATE(ts.start_time) as date,
          COUNT(DISTINCT ts.user_id) as active_users,
          SUM(ts.duration_seconds) / 3600.0 as total_hours,
          COUNT(ts.id) as total_sessions,
          COUNT(DISTINCT ts.task_id) as unique_tasks
        FROM timer_sessions ts
        JOIN users u ON ts.user_id = u.id
        WHERE u.organization_id = $1
        AND ts.start_time >= CURRENT_DATE - INTERVAL '30 days'
        AND ts.status = 'completed'
        GROUP BY DATE(ts.start_time)
      )
      SELECT 
        ds.date,
        COALESCE(daily_stats.active_users, 0) as active_users,
        COALESCE(daily_stats.total_hours, 0) as total_hours,
        COALESCE(daily_stats.total_sessions, 0) as total_sessions,
        COALESCE(daily_stats.unique_tasks, 0) as unique_tasks
      FROM date_series ds
      LEFT JOIN daily_stats ON ds.date = daily_stats.date
      ORDER BY ds.date
    `;
    
    const dailyStats = await db.query(query, [organizationId]);
    
    const totalStats = await db.query(`
      SELECT 
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT CASE WHEN u.last_activity >= CURRENT_DATE - INTERVAL '7 days' THEN u.id END) as active_last_7_days,
        SUM(CASE WHEN ts.start_time >= CURRENT_DATE THEN ts.duration_seconds ELSE 0 END) / 3600.0 as today_hours,
        SUM(CASE WHEN ts.start_time >= CURRENT_DATE - INTERVAL '7 days' THEN ts.duration_seconds ELSE 0 END) / 3600.0 as week_hours,
        COUNT(DISTINCT p
