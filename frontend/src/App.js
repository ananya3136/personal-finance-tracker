import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import BudgetPlanner from "./pages/BudgetPlanner";
import{ ThemeProvider} from "./pages/ThemeContext";
import "./pages/themes.css";
import Profile from "./pages/Profile";
function App() {
  return (
    <ThemeProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-transaction" element={<AddTransaction />} />
        <Route path="/budget" element={<BudgetPlanner />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
    </ThemeProvider>
  );
}

export default App;
