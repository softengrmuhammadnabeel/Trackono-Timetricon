import React from "react";
// import reactLogo from "./assets/react.svg";
// import { invoke } from "@tauri-apps/api/core";
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import "./App.css";
import DashboardLayout from "./dashboard/Layout";
import DashboardHomePage from "./dashboard/index";
// import DashboardSecondPage from "./dashboard/SecondPage";

function App() {
  // const [greetMsg, setGreetMsg] = useState("");
  // const [name, setName] = useState("");

  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  //   setGreetMsg(await invoke("greet", { name }));
  // }

  const DashboardAnalyticsPage = () => <h1>Analytics</h1>;
  const DashboardTimersPage = () => <h1>Active Timers</h1>;

  // const TimerSetupPage = () => <h1>Timer Setup</h1>;
  const TimerCreatePage = () => <h1>Create Timer</h1>;
  const TimerTemplatesPage = () => <h1>Saved Templates</h1>;
  const TimerPreferencesPage = () => <h1>Timer Preferences</h1>;

  // const ReportsPage = () => <h1>Reports</h1>;
  const ReportsDailyPage = () => <h1>Daily Report</h1>;
  const ReportsWeeklyPage = () => <h1>Weekly Report</h1>;
  const ReportsCustomPage = () => <h1>Custom Report</h1>;

  // const HelpPage = () => <h1>Help</h1>;
  const HelpGettingStartedPage = () => <h1>Getting Started</h1>;
  const HelpFAQsPage = () => <h1>FAQs</h1>;
  const HelpSupportPage = () => <h1>Support</h1>;

  // const SettingsPage = () => <h1>Settings</h1>;
  const SettingsProfilePage = () => <h1>Profile</h1>;
  const SettingsNotificationsPage = () => <h1>Notifications</h1>;
  const SettingsSubscriptionPage = () => <h1>Subscription</h1>;
  const SettingsPrivacyPage = () => <h1>Privacy</h1>;

  const ProjectOptimizationPage = () => <h1>Time Optimization</h1>;
  const ProjectCollaborationPage = () => <h1>Team Collaboration</h1>;
  const ProjectInsightsPage = () => <h1>Productivity Insights</h1>;

  React.useEffect(() => {
    const preventScroll = () => {
      document.body.style.overflow = "hidden";
    };

    preventScroll();

    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  return (
    // <><h2>Hello</h2></>
      
    <Router basename="/">

      <Routes>
        {/* Main Navigation */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<DashboardHomePage />} />
          <Route path="analytics" element={<DashboardAnalyticsPage />} />
          <Route path="timers" element={<DashboardTimersPage />} />
        </Route>

        <Route path="/setup" element={<DashboardLayout />}>
          <Route path="create" element={<TimerCreatePage />} />
          <Route path="templates" element={<TimerTemplatesPage />} />
          <Route path="preferences" element={<TimerPreferencesPage />} />
        </Route>

        <Route path="/reports" element={<DashboardLayout />}>
          <Route path="daily" element={<ReportsDailyPage />} />
          <Route path="weekly" element={<ReportsWeeklyPage />} />
          <Route path="custom" element={<ReportsCustomPage />} />
        </Route>

        <Route path="/help" element={<DashboardLayout />}>
          <Route path="start" element={<HelpGettingStartedPage />} />
          <Route path="faqs" element={<HelpFAQsPage />} />
          <Route path="support" element={<HelpSupportPage />} />
        </Route>

        <Route path="/settings" element={<DashboardLayout />}>
          <Route path="profile" element={<SettingsProfilePage />} />
          <Route path="notifications" element={<SettingsNotificationsPage />} />
          <Route path="subscription" element={<SettingsSubscriptionPage />} />
          <Route path="privacy" element={<SettingsPrivacyPage />} />
        </Route>

        {/* Projects */}
        <Route path="/projects/optimization" element={<ProjectOptimizationPage />} />
        <Route path="/projects/collaboration" element={<ProjectCollaborationPage />} />
        <Route path="/projects/insights" element={<ProjectInsightsPage />} />
      </Routes>
    </Router>


  );
}

export default App;
