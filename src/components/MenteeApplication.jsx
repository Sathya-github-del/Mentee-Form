import { useState } from "react"
import Alert from './Alert'
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const MenteeApplication = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    education: "",
    email: "",
    phone: "",
    mentorshipGoals: "",
    skillsKnown: "",
    skillsToImprove: "",
    experienceLevel: "",
    whyMentorship: "",
    linkedin: "",
    github: "",
  })

  const [resume, setResume] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [video, setVideo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    const fileType = e.target.name

    if (fileType === "resume" && file.size > 10 * 1024 * 1024) {
      alert("Resume file size should not exceed 10MB")
      return
    }

    if (fileType === "photo" && file.size > 10 * 1024 * 1024) {
      alert("Photo file size should not exceed 10MB")
      return
    }

    if (fileType === "video") {
      const video = document.createElement("video")
      video.preload = "metadata"

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        if (video.duration < 30 || video.duration > 180) {
          alert("Video duration should be between 30 seconds and 3 minutes")
          return
        }
        setVideo(file)
      }

      video.src = URL.createObjectURL(file)
    } else {
      if (fileType === "resume") setResume(file)
      if (fileType === "photo") setPhoto(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccessMessage("")
    const formDataToSend = new FormData()
    Object.keys(formData).forEach((key) => formDataToSend.append(key, formData[key]))
    formDataToSend.append("resume", resume)
    formDataToSend.append("photo", photo)
    formDataToSend.append("video", video)

    try {
      const response = await fetch(`${API_BASE_URL}/api/mentee/application`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend,
      })
      if (response.ok) {
        setSuccessMessage("Application submitted successfully!")
        setTimeout(() => {
          setSuccessMessage("")
          // Optionally redirect or clear form here
        }, 5000)
      } else {
        const data = await response.json()
        setError(data.error || "Application submission failed. Please try again.")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const inputStyle = {
    margin: "10px 0",
    padding: "10px",
    width: "100%",
    boxSizing: "border-box",
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ textAlign: "center" }}>Mentee Application</h2>
        <button
          onClick={() => navigate('/')}
          style={{ padding: "10px 10px", marginLeft: '-10vw' }}
        >
          Back to Home
        </button>
      </div>
      <Alert message={error} type="error" />
      <Alert message={successMessage} type="success" />
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Full Name"
          required
          style={inputStyle}
        />
        <input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          placeholder="Date of Birth"
          required
          style={inputStyle}
        />
        <input
          type="text"
          name="education"
          value={formData.education}
          onChange={handleChange}
          placeholder="Education"
          required
          style={inputStyle}
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
          style={inputStyle}
        />
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+91"
          required
          maxLength={10}
          style={inputStyle}
        />
        <textarea
          name="mentorshipGoals"
          value={formData.mentorshipGoals}
          onChange={handleChange}
          placeholder="Mentorship Goals"
          required
          style={{ ...inputStyle, minHeight: "100px" }}
        />
        <textarea
          name="skillsKnown"
          value={formData.skillsKnown}
          onChange={handleChange}
          placeholder="Skills You Know"
          required
          style={{ ...inputStyle, minHeight: "100px" }}
        />
        <textarea
          name="skillsToImprove"
          value={formData.skillsToImprove}
          onChange={handleChange}
          placeholder="Skills to Improve"
          required
          style={{ ...inputStyle, minHeight: "100px" }}
        />
        <select
          name="experienceLevel"
          value={formData.experienceLevel}
          onChange={handleChange}
          required
          style={inputStyle}
        >
          <option value="">Select Experience Level</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        <textarea
          name="whyMentorship"
          value={formData.whyMentorship}
          onChange={handleChange}
          placeholder="Why do you want mentorship?"
          required
          style={{ ...inputStyle, minHeight: "100px" }}
        />
        <input
          type="url"
          name="linkedin"
          value={formData.linkedin}
          onChange={handleChange}
          placeholder="LinkedIn Profile URL"
          style={inputStyle}
        />
        <input
          type="url"
          name="github"
          value={formData.github}
          onChange={handleChange}
          placeholder="GitHub Profile URL"
          style={inputStyle}
        />
        <label>Upload Resume(Upto 10MB):</label>
        <input
          type="file"
          name="resume"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx"
          required
          style={inputStyle}
        />
        <label>Upload Photo(Upto 10MB):</label>
        <input type="file" name="photo" onChange={handleFileChange} accept="image/*" required style={inputStyle} />
        <label>Upload Self Introduction video:</label>
        <input type="file" name="video" onChange={handleFileChange} accept="video/*" required style={inputStyle} />
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  )
}

export default MenteeApplication

