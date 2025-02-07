import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom';
import Alert from './Alert'; // Add this import
import { API_BASE_URL } from '../config';

const MentorForm = () => {
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate();
  const [mediaModal, setMediaModal] = useState({
    isOpen: false,
    type: null,
    url: null
  });
  const [selectedCourse, setSelectedCourse] = useState({});
  const [successMessage, setSuccessMessage] = useState(""); // Add this state

  const availableCourses = [
    { id: 1, name: "Web Development Fundamentals", duration: "8 weeks" },
    { id: 2, name: "Advanced JavaScript", duration: "12 weeks" },
    { id: 3, name: "React Development", duration: "10 weeks" },
    { id: 4, name: "Backend Development", duration: "12 weeks" },
    { id: 5, name: "Full Stack Development", duration: "16 weeks" },
    { id: 6, name: "Machine Learning", duration: "12 weeks" },
    { id: 7, name: "Data Science", duration: "16 weeks" },
    { id: 8, name: "Cloud Computing", duration: "12 weeks" },
    { id: 9, name: "Cyber Security", duration: "12 weeks" },
    { id: 10, name: "DevOps", duration: "12 weeks" },
    { id: 11, name: "Digital Marketing", duration: "12 weeks" },
    { id: 12, name: "UI/UX Design", duration: "12 weeks" },
  ];

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/mentor/applications`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setApplications(data)
        } else {
          const data = await response.json()
          setError(data.error || "Failed to fetch applications")
        }
      } catch (error) {
        setError("Network error while fetching applications")
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplications()
  }, [])

  const handleDownload = async (fileType, applicationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/mentor/download/${fileType}/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        // Handle file download
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${fileType}-${applicationId}.${fileType === 'resume' ? 'pdf' : 'file'}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        alert('Failed to download file')
      }
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  const handleViewMedia = async (type, applicationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/mentor/download/${type}/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setMediaModal({
          isOpen: true,
          type,
          url
        });
      } else {
        alert('Failed to load media');
      }
    } catch (error) {
      console.error(`Error loading ${type}:`, error);
    }
  };

  const closeModal = () => {
    if (mediaModal.url) {
      URL.revokeObjectURL(mediaModal.url);
    }
    setMediaModal({ isOpen: false, type: null, url: null });
  };

  const handleApproveApplication = async (applicationId, courseId) => {
    if (!courseId) {
      setError("Please select a course first");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/mentor/approve-application`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          applicationId,
          courseId,
          courseName: availableCourses.find(c => c.id === parseInt(courseId))?.name
        })
      });

      if (!response.ok) {
        throw new Error('Failed to approve application');
      }

      const data = await response.json();

      setApplications(apps =>
        apps.map(app =>
          app._id === applicationId
            ? { ...app, status: 'approved', assignedCourse: courseId }
            : app
        )
      );
      setSuccessMessage(data.message || "Application approved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || "Failed to approve application");
      setTimeout(() => setError(""), 3000);
    }
  };

  if (isLoading) return <div>Loading...</div>
  if (error) return <div style={{ color: "red" }}>{error}</div>

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      {/* Add Alert components */}
      {error && <Alert message={error} type="error" />}
      {successMessage && <Alert message={successMessage} type="success" />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Mentee Applications</h2>
        <button
          onClick={() => navigate('/')}
          style={{ padding: "5px 10px" }}
        >
          Back to Home
        </button>
      </div>
      {applications.map((app) => (
        <div key={app._id} style={{
          border: "1px solid #e1e1e1",
          borderRadius: "8px",
          padding: "20px",
          margin: "15px 0",
          backgroundColor: "#fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          display: "flex",
          justifyContent: "space-between"
        }}>
          <div className="application-details" style={{ flex: "1" }}>
            <h3 style={{
              color: "#2c3e50",
              marginBottom: "15px",
              fontSize: "1.5rem"
            }}>{app.fullName}</h3>

            {/* Add social links section */}
            <div style={{
              display: "flex",
              gap: "10px",
              marginBottom: "15px"
            }}>
              {app.github && (
                <a
                  href={app.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "8px 15px",
                    backgroundColor: "#24292e",
                    color: "white",
                    borderRadius: "4px",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}
                >
                  <i className="fab fa-github"></i> GitHub Profile
                </a>
              )}
              {app.linkedin && (
                <a
                  href={app.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "8px 15px",
                    backgroundColor: "#0077b5",
                    color: "white",
                    borderRadius: "4px",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px"
                  }}
                >
                  <i className="fab fa-linkedin"></i> LinkedIn Profile
                </a>
              )}
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "15px",
              marginBottom: "20px"
            }}>
              <div className="detail-item">
                <strong>Education:</strong> {app.education}
              </div>
              <div className="detail-item">
                <strong>Experience:</strong> {app.experienceLevel}
              </div>
              <div className="detail-item">
                <strong>Email:</strong> {app.email}
              </div>
              <div className="detail-item">
                <strong>Phone:</strong> {app.phone}
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <h4 style={{ color: "#34495e", marginBottom: "8px" }}>Goals & Skills</h4>
              <p><strong>Mentorship Goals:</strong> {app.mentorshipGoals}</p>
              <p><strong>Skills to Improve:</strong> {app.skillsToImprove}</p>
            </div>
          </div>

          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginLeft: "20px",
            minWidth: "150px"
          }}>
            <button
              onClick={() => handleDownload("resume", app._id)}
              style={{
                padding: "8px 15px",
                backgroundColor: "#3498db",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                transition: "background 0.3s ease"
              }}
            >
              Download Resume
            </button>
            <button
              onClick={() => handleViewMedia("photo", app._id)}
              style={{
                padding: "8px 15px",
                backgroundColor: "#2ecc71",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                transition: "background 0.3s ease"
              }}
            >
              View Photo
            </button>
            <button
              onClick={() => handleViewMedia("video", app._id)}
              style={{
                padding: "8px 15px",
                backgroundColor: "#e74c3c",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                transition: "background 0.3s ease"
              }}
            >
              View Video
            </button>
          </div>
          {app.status !== 'approved' && (
            <div style={{ marginTop: "20px", padding: "15px", borderTop: "1px solid #eee" }}>
              <h4>Approve Application</h4>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <select
                  value={selectedCourse[app._id] || ''}
                  onChange={(e) => setSelectedCourse({
                    ...selectedCourse,
                    [app._id]: e.target.value
                  })}
                  style={{
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    flex: "1"
                  }}
                >
                  <option value="">Select Course to Assign</option>
                  {availableCourses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.duration})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleApproveApplication(app._id, selectedCourse[app._id])}
                  disabled={!selectedCourse[app._id]}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: !selectedCourse[app._id] ? "#ccc" : "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: !selectedCourse[app._id] ? "not-allowed" : "pointer"
                  }}
                >
                  Approve & Assign Course
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {mediaModal.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            position: 'relative',
            maxWidth: '90%',
            maxHeight: '90%',
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
            {mediaModal.type === 'photo' && (
              <img
                src={mediaModal.url}
                alt="Applicant"
                style={{
                  maxWidth: '100%',
                  maxHeight: 'calc(90vh - 40px)',
                  objectFit: 'contain'
                }}
              />
            )}
            {mediaModal.type === 'video' && (
              <video
                controls
                style={{
                  maxWidth: '100%',
                  maxHeight: 'calc(90vh - 40px)'
                }}
              >
                <source src={mediaModal.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MentorForm

