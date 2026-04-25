import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Invalid credentials");

      const data = await res.json();
      localStorage.setItem("authUser", JSON.stringify(data));

      if (data.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      {/* Left Section */}
      <div className="left">
        <img src="/college.png" alt="Campus" />
        <div className="overlay">
          <h1>Empowering Education Through Results</h1>
          <p>Secure, fast and reliable system</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="right">
        <div className="login-card">
          <h2>Welcome Back!</h2>
          <p className="subtitle">Sign in to access the Result System</p>

          {error && <div className="error">{error}</div>}

           <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <button type="submit">Login</button>
          </form>

          <p className="footer-text">
            Admins manage results. Users view/download results.
          </p>
        </div>
      </div>
      </div>
  );
}
