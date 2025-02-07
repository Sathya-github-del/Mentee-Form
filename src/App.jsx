import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
import Register from "./components/Register"
import Login from "./components/Login"
import MenteeApplication from "./components/MenteeApplication"
import MentorRegister from "./components/MentorRegister"
import MentorLogin from "./components/MentorLogin"
import MentorForm from "./components/MentorForm"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminLogin from "./components/AdminLogin"
import AdminDashboard from "./components/AdminDashboard"
import AdminProtectedRoute from "./components/AdminProtectedRoute"
import AllData from './components/AllData';
import MenteeDashboard from './components/MenteeDashboard';
import './App.css'

const HomePage = () => (
  <div className="hero-content">
    <h1>Welcome to the Mentorship Platform</h1>
    <p className="hero-subtitle">Connect, Learn, and Grow with Industry Professionals</p>
    <div className="cards-container">
      <div className="card mentee-card">
        <h2>Looking for Guidance?</h2>
        <p>Join as a Mentee to get personalized mentorship</p>
        <div className="button-group">
          <Link to="/register">
            <button className="btn primary" style={{ backgroundColor: "#007bff" }}>Register</button>
          </Link>
          <Link to="/login">
            <button className="btn secondary" style={{ backgroundColor: "#007bff" }}>Login</button>
          </Link>
        </div>
      </div>
      <div className="card mentor-card">
        <h2>Want to Share Knowledge?</h2>
        <p>Join as a Mentor to guide aspiring professionals</p>
        <div className="button-group">
          <Link to="/mentor/register">
            <button className="btn primary" style={{ backgroundColor: "#f2232d" }}>Register</button>
          </Link>
          <Link to="/mentor/login">
            <button className="btn secondary" style={{ backgroundColor: "#f2232d" }}>Login</button>
          </Link>
        </div>
      </div>
    </div>
    <div style={{ marginTop: "20px" }}>
      <Link to="/admin/login">
        <button className="btn secondary" style={{ backgroundColor: "green" }}>Admin Access</button>
      </Link>
    </div>
  </div>
)

const App = () => {
  return (
    <div className="app-container">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mentee/application" element={
            <ProtectedRoute userType="mentee">
              <MenteeApplication />
            </ProtectedRoute>
          } />
          <Route path="/mentor/register" element={<MentorRegister />} />
          <Route path="/mentor/login" element={<MentorLogin />} />
          <Route path="/mentor/form" element={
            <ProtectedRoute userType="mentor">
              <MentorForm />
            </ProtectedRoute>
          } />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/all-data" element={
            <AdminProtectedRoute>
              <AllData />
            </AdminProtectedRoute>
          } />
          <Route path="/mentee/dashboard" element={
            <ProtectedRoute userType="mentee">
              <MenteeDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </div>
  )
}

export default App

