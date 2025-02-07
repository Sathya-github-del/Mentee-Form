import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Alert from './Alert'

const MentorLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccessMessage("")
    try {
      const response = await fetch("http://localhost:5000/api/mentor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (response.ok) {
        setSuccessMessage("Login successful! Redirecting...")
        localStorage.setItem('token', data.token)
        localStorage.setItem('userType', data.userType)
        setTimeout(() => {
          navigate('/mentor/form')
        }, 5000) // Changed to 5 seconds
      } else {
        setError(data.error || "Login failed. Please check your credentials.")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>Mentor Login</h2>
      <Alert message={error} type="error" />
      <Alert message={successMessage} type="success" />
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
          style={{ margin: "10px 0", padding: "10px" }}
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
          style={{ margin: "10px 0", padding: "10px" }}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" style={{ padding: "10px", backgroundColor: "#f2232d", color: "white", border: "none" }} disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login as Mentor"}
        </button>
      </form>
    </div>
  )
}

export default MentorLogin

