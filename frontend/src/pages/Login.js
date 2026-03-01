import React, { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await API.post("/users/login", {
        email,
        password,
      });

      const token = response.data.token;

      localStorage.setItem("token", token);
      localStorage.setItem("userName", response.data.user.name);   
      localStorage.setItem("userEmail", response.data.user.email); 
      navigate("/dashboard");
    } catch (err) {
      setError("Login failed. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login__card">
        <h1 className="login__title">Welcome back</h1>
        <p className="login__subtitle">Sign in to your finance tracker</p>

        <form onSubmit={handleLogin} className="login__form">
          {error && (
            <div className={`login__error login__error--visible`}>{error}</div>
          )}

          <div className="login__field">
            <label htmlFor="email" className="login__label">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login__input"
              required
              disabled={loading}
            />
          </div>

          <div className="login__field">
            <label htmlFor="password" className="login__label">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login__input"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="login__submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="login__switch">
            Don't have an account?{" "}
            <Link to="/register" className="login__link">
              Create account
            </Link>
          </p>
          <Link to="/" className="login__back">
            ← Back to home
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Login;
