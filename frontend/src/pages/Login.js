
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

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userName", response.data.user.name);
      localStorage.setItem("userEmail", response.data.user.email);
      localStorage.setItem("userCreatedAt", response.data.user.createdAt);

      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please check your email and password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* LEFT PANEL */}

      <div className="login-left">

        <div className="login-logo">

          <div className="logo-box">
            F
          </div>

          <div>

            <h1>FINOVA</h1>

            <p>SMART FINANCE</p>

          </div>

        </div>

        <h2>
          Control your money
          <br />
          with confidence.
        </h2>

        <p>
          Track expenses, monitor budgets, receive AI-powered insights,
          and make smarter financial decisions every day.
        </p>

        <div className="login-features">

          <div>✓ AI Spending Insights</div>

          <div>✓ Smart Budget Planner</div>

          <div>✓ Interactive Analytics</div>

          <div>✓ Secure Cloud Storage</div>

        </div>

      </div>

      {/* RIGHT PANEL */}

      <div className="login-right">

        <div className="login">

          <div className="login__card">

            <h1 className="login__title">
              Welcome Back
            </h1>

            <p className="login__subtitle">
              Sign in to continue to Finova
            </p>

            <form
              onSubmit={handleLogin}
              className="login__form"
            >

              {error && (
                <div className="login__error login__error--visible">
                  {error}
                </div>
              )}

              <div className="login__field">

                <label className="login__label">
                  Email
                </label>

                <input
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

                <label className="login__label">
                  Password
                </label>

                <input
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
                {loading ? "Signing In..." : "Sign In"}
              </button>

              <p className="login__switch">

                Don't have an account?{" "}

                <Link
                  to="/register"
                  className="login__link"
                >
                  Create Account
                </Link>

              </p>

              <Link
                to="/"
                className="login__back"
              >
                ← Back to Home
              </Link>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;