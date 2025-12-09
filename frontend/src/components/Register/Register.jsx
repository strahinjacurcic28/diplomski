// src/components/Register/Register.jsx
import { useState } from "react";
import { apiRequest } from "../../api/Api";
import './Register.css'

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    gender: "",
    date_of_birth: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await apiRequest("/users/register", "POST", formData);
      setMessage(res.message || "User registered successfully");
      setFormData({
        username: "",
        email: "",
        password: "",
        gender: "",
        date_of_birth: "",
      });
    } catch (err) {
      setError(err.error || "Registration failed");
    }
  };

  return (
    <div className="register-wrapper">

    <div className="register-container">
      <h2 className="register-title">Register</h2>

      {message && <p className="register-message success">{message}</p>}
      {error && <p className="register-message error">{error}</p>}

      <form className="register-form" onSubmit={handleSubmit}>
        <input
          className="register-input"
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <input
          className="register-input"
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          className="register-input"
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <select
          className="register-select"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <input
          className="register-input"
          type="date"
          name="date_of_birth"
          value={formData.date_of_birth}
          onChange={handleChange}
        />

        <button className="register-button" type="submit">Register</button>
      </form>
    </div>
    </div>

  );
};

export default Register;
