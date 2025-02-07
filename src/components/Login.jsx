import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Alert from './Alert'

const Login = () => {
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
      const response = await fetch("http://localhost:5000/api/mentee/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (response.ok) {
        setSuccessMessage("Login successful! Redirecting...")
        localStorage.setItem('token', data.token)
        localStorage.setItem('userType', data.userType)

        // Check if user has submitted application
        const applicationCheck = await fetch("http://localhost:5000/api/mentee/check-application", {
          headers: {
            'Authorization': `Bearer ${data.token}`
          }
        });
        const applicationData = await applicationCheck.json();

        setTimeout(() => {
          // Redirect based on whether application exists
          if (applicationData.hasApplication) {
            navigate('/mentee/dashboard');
          } else {
            navigate('/mentee/application');
          }
        }, 2000);
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
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundImage: 'url(src/assets/menteelogin.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div style={{
        maxWidth: "400px",
        width: "100%",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Mentee Login</h2>
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
          {error && <div style={{ color: "red", margin: "10px 0" }}>{error}</div>}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: "10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login

