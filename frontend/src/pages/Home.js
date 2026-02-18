import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="home__content">
        <div className="home__hero">
          <h1 className="home__title">
            Take control of your
            <span className="home__title-accent"> finances</span>
          </h1>
          <p className="home__subtitle">
            Track expenses, predict spending, and stay financially healthy. 
            Your personal finance companion, built for clarity.
          </p>
          <div className="home__cta">
            <button
              className="home__btn home__btn--primary"
              onClick={() => navigate("/register")}
              type="button"
            >
              Create free account
            </button>
            <button
              className="home__btn home__btn--secondary"
              onClick={() => navigate("/login")}
              type="button"
            >
              Sign in
            </button>
          </div>
        </div>

        <div className="home__features">
          <div className="home__feature">
            <span className="home__feature-icon">📊</span>
            <h3>Track spending</h3>
            <p>Log expenses and income in one place</p>
          </div>
          <div className="home__feature">
            <span className="home__feature-icon">🔮</span>
            <h3>Smart predictions</h3>
            <p>See projected spending before month-end</p>
          </div>
          <div className="home__feature">
            <span className="home__feature-icon">✓</span>
            <h3>Stay on track</h3>
            <p>Budget alerts keep you in control</p>
          </div>
        </div>

        <div className="home__footer-cta">
          <p>Already have an account?</p>
          <button
            className="home__link"
            onClick={() => navigate("/login")}
            type="button"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
