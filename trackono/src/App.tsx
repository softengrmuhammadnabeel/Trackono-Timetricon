import React from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import "./App.css";
import DashboardLayout from "./dashboard/Layout";
import DashboardHomePage from "./dashboard/index";
import DashboardSecondPage from "./dashboard/SecondPage";

function App() {
  // const [greetMsg, setGreetMsg] = useState("");
  // const [name, setName] = useState("");

  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  //   setGreetMsg(await invoke("greet", { name }));
  // }
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
    <Router basename="/">

      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<DashboardHomePage />} />
          <Route path="second" element={<DashboardSecondPage />} />
        </Route>
      </Routes>
    </Router>

  );
}

export default App;
