import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Workouts from "./components/Workouts/Workouts";
import Profile from "./components/Profile/Profile";
import WorkoutBuilder from "./components/WorkoutBuilder/WorkoutBuilder";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const logout = () => {
    setToken(undefined);
    localStorage.removeItem("token");
  };

  return (
    <div className="app-container">
      <Navbar token={token} logout={logout} />

      <div className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/workout_builder" element={<WorkoutBuilder />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/users/register" element={<Register />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;
