// src/components/Login.js
import { useState, useContext } from "react";
import { apiRequest } from "../../api/Api"; // 2 levels up from components/Register/
import './Login.css'
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Button from "../Button/Button";

export default function Login({ onLogin }) {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest("/login", "POST", form);
      login(res.token)
      setMessage("Login successful!");
      navigate('/')

    } catch (err) {
      setMessage(err.error || "Login failed");
    }
  };

  return (

    <div className="login-wrapper">

    <div className="login-container">
      <h2 className="login-title">Login</h2>

      <form className="login-form" onSubmit={handleSubmit}>
        <input
          className="login-input"
          name="username"
          placeholder="Username"
          onChange={handleChange}
          required
        />
        <input
          className="login-input"
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <Button variant="login-button" type="submit">Login</Button>
      </form>

      <p className="login-message">{message}</p>
    </div>
    </div>

  );
}
