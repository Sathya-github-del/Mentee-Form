import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Alert from './Alert'

const AdminLogin = () => {
    const [pin, setPin] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        try {
            const response = await fetch("http://localhost:5000/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pin }),
            })
            const data = await response.json()

            if (response.ok) {
                setSuccessMessage("Admin access granted! Redirecting...")
                localStorage.setItem('adminToken', data.token)
                localStorage.setItem('userType', 'admin')
                setTimeout(() => {
                    navigate('/admin/dashboard')
                }, 2000)
            } else {
                setError(data.error || "Invalid PIN")
            }
        } catch (error) {
            setError("Network error. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
            <h2 style={{ textAlign: "center" }}>Admin Access</h2>
            {process.env.NODE_ENV === 'development' && (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '10px',
                    marginBottom: '20px',
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff'
                }}>
                    <p style={{ margin: 0 }}>
                        <strong>Admin PIN:</strong> 123456
                    </p>
                </div>
            )}
            <Alert message={error} type="error" />
            <Alert message={successMessage} type="success" />
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
                <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter Admin PIN"
                    maxLength="6"
                    pattern="[0-9]{6}"
                    required
                    style={{
                        margin: "10px 0",
                        padding: "10px",
                        fontSize: "20px",
                        textAlign: "center",
                        letterSpacing: "0.3em"
                    }}
                />
                <button
                    type="submit"
                    disabled={isLoading || pin.length !== 6}
                    style={{
                        padding: "10px",
                        backgroundColor: "green",
                        color: "white",
                        border: "none",
                        opacity: (isLoading || pin.length !== 6) ? 0.7 : 1
                    }}
                >
                    {isLoading ? "Verifying..." : "Access Dashboard"}
                </button>
            </form>
        </div>
    )
}

export default AdminLogin
