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
      <div className="container">
        <Navbar token={token} logout={logout} />
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/users/register" element={<Register />} />
          <Route path="/workouts" element={<Workouts/>}/>
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/workout_builder" element={<WorkoutBuilder/>}/>
        </Routes>
        {/* <Footer></Footer> */}
      </div>
  );
}

export default App;
