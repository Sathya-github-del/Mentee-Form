import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Alert from './Alert'

const MentorRegister = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    expertise: [],
    yearsOfExperience: "",
    currentRole: "",
    company: "",
    linkedIn: "",
    github: "",
    bio: "",
    availability: "",
    preferredMenteeLevel: "",
    expectations: "",
    mentorshipStyle: "",
    portfolio: "",
    otherExpertise: "", // Add this new field
    pastMentorshipExperience: "",
    certificates: "", // Will store comma-separated certificates
    resume: null, // Add this new field
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate();

  const expertiseOptions = [
    "Frontend Development",
    "Backend Development",
    "Full Stack Development",
    "Mobile Development",
    "DevOps",
    "Cloud Computing",
    "Data Science",
    "Machine Learning",
    "UI/UX Design",
    "Product Management",
    "Other"
  ]

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleExpertiseChange = (e) => {
    const value = e.target.value;
    if (value === "Other" && !formData.expertise.includes("Other")) {
      // When "Other" is selected, add it and clear otherExpertise
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, value],
        otherExpertise: ""
      }));
    } else if (value === "Other" && formData.expertise.includes("Other")) {
      // When "Other" is unselected, remove it and clear otherExpertise
      setFormData(prev => ({
        ...prev,
        expertise: prev.expertise.filter(item => item !== "Other"),
        otherExpertise: ""
      }));
    } else {
      // Handle other expertise options normally
      setFormData(prev => ({
        ...prev,
        expertise: prev.expertise.includes(value)
          ? prev.expertise.filter(item => item !== value)
          : [...prev.expertise, value]
      }));
    }
  };

  // Add new handler for file upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData({ ...formData, resume: file });
      setSelectedFile(file);
      // Create preview URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
      setError("");
    } else {
      setError("Please upload a PDF file");
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handlePreviewResume = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    // Handle each field properly
    Object.keys(formData).forEach(key => {
      if (key === 'expertise') {
        // Convert array to string for FormData
        formDataToSend.append('expertise', JSON.stringify(formData[key]));
      } else if (key === 'resume' && formData[key]) {
        // Append resume file if it exists
        formDataToSend.append('resume', formData[key]);
      } else {
        // Handle all other fields
        formDataToSend.append(key, formData[key] || '');
      }
    });

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/mentor/register", {
        method: "POST",
        body: formDataToSend,
        // Remove the Content-Type header - it will be set automatically with FormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      navigate('/mentor/login');
    } catch (error) {
      setError(error.message || "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    margin: "10px 0",
    padding: "10px",
    width: "100%",
    boxSizing: "border-box",
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>Mentor Registration</h2>
      <Alert message={error} type="error" />
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
        {/* Basic Information */}
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
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
          style={inputStyle}
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
          style={inputStyle}
        />

        {/* Professional Information */}
        <input
          type="text"
          name="currentRole"
          value={formData.currentRole}
          onChange={handleChange}
          placeholder="Current Role"
          required
          style={inputStyle}
        />
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder="Company"
          required
          style={inputStyle}
        />
        <input
          type="number"
          name="yearsOfExperience"
          value={formData.yearsOfExperience}
          onChange={handleChange}
          placeholder="Years of Experience"
          required
          style={inputStyle}
        />

        {/* Expertise Selection */}
        <div style={{ margin: "10px 0" }}>
          <label>Areas of Expertise:</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {expertiseOptions.map(option => (
              <label key={option} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <input
                  type="checkbox"
                  value={option}
                  checked={formData.expertise.includes(option)}
                  onChange={handleExpertiseChange}
                />
                {option}
              </label>
            ))}
          </div>

          {/* Conditional input field for Other expertise */}
          {formData.expertise.includes("Other") && (
            <input
              type="text"
              name="otherExpertise"
              value={formData.otherExpertise}
              onChange={handleChange}
              placeholder="Please specify your expertise"
              required
              style={{
                ...inputStyle,
                marginTop: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "white"
              }}
            />
          )}
        </div>

        {/* Profile Links */}
        <input
          type="url"
          name="linkedIn"
          value={formData.linkedIn}
          onChange={handleChange}
          placeholder="LinkedIn Profile URL"
          required
          style={inputStyle}
        />
        <input
          type="url"
          name="github"
          value={formData.github}
          onChange={handleChange}
          placeholder="GitHub Profile URL"
          required
          style={inputStyle}
        />
        <input
          type="url"
          name="portfolio"
          value={formData.portfolio}
          onChange={handleChange}
          placeholder="Portfolio Website URL"
          style={inputStyle}
        />

        {/* Mentorship Details */}
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Brief Bio"
          required
          style={{ ...inputStyle, minHeight: "100px" }}
        />
        <select
          name="availability"
          value={formData.availability}
          onChange={handleChange}
          required
          style={inputStyle}
        >
          <option value="">Select Availability</option>
          <option value="1-2">1-2 hours/week</option>
          <option value="3-5">3-5 hours/week</option>
          <option value="5+">5+ hours/week</option>
        </select>
        <select
          name="preferredMenteeLevel"
          value={formData.preferredMenteeLevel}
          onChange={handleChange}
          required
          style={inputStyle}
        >
          <option value="">Preferred Mentee Level</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Any">Any Level</option>
        </select>
        <textarea
          name="expectations"
          value={formData.expectations}
          onChange={handleChange}
          placeholder="What do you expect from your mentees?"
          required
          style={{ ...inputStyle, minHeight: "100px" }}
        />
        <textarea
          name="mentorshipStyle"
          value={formData.mentorshipStyle}
          onChange={handleChange}
          placeholder="Describe your mentorship style"
          required
          style={{ ...inputStyle, minHeight: "100px" }}
        />

        {/* New fields for past mentorship experience and certificates */}
        <textarea
          name="pastMentorshipExperience"
          value={formData.pastMentorshipExperience}
          onChange={handleChange}
          placeholder="Any past mentorship experience? (Optional)"
          style={{ ...inputStyle, minHeight: "100px" }}
        />
        <textarea
          name="certificates"
          value={formData.certificates}
          onChange={handleChange}
          placeholder="List any relevant certificates (Optional, separate with commas)"
          style={{ ...inputStyle, minHeight: "100px" }}
        />

        {/* Add before the submit button */}
        <div style={{ margin: "10px 0" }}>
          <label
            htmlFor="resume"
            style={{
              display: "block",
              marginBottom: "5px"
            }}
          >
            Resume (PDF only)
          </label>
          <input
            type="file"
            id="resume"
            accept=".pdf"
            onChange={handleFileChange}
            style={inputStyle}
          />
          {selectedFile && (
            <div style={{
              marginTop: "10px",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <span>{selectedFile.name}</span>
              <button
                type="button"
                onClick={handlePreviewResume}
                style={{
                  padding: "5px 10px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Preview Resume
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "10px",
            backgroundColor: "#f2232d",
            color: "white",
            border: "none",
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? "Registering..." : "Register as Mentor"}
        </button>
      </form>
    </div>
  );
};

export default MentorRegister;

