import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from './Alert'
import ResumeDownload from './ResumeDownload';

const AdminDashboard = () => {
    const [mentors, setMentors] = useState([])
    const [applications, setApplications] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [mentorsRes, applicationsRes] = await Promise.all([
                fetch('http://localhost:5000/api/admin/mentors', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
                }),
                fetch('http://localhost:5000/api/admin/applications', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
                })
            ]);

            const [mentorsData, applicationsData] = await Promise.all([
                mentorsRes.json(),
                applicationsRes.json()
            ]);

            setMentors(mentorsData);
            setApplications(applicationsData);
        } catch (error) {
            setError("Failed to fetch data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproveMentor = async (mentorId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/approve-mentor/${mentorId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });
            if (response.ok) {
                setSuccessMessage("Mentor approved successfully");
                fetchData(); // Refresh data
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (error) {
            setError("Failed to approve mentor");
            setTimeout(() => setError(""), 3000);
        }
    };

    const handleAssignMentee = async (applicationId, mentorId) => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/assign-mentee', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify({ applicationId, mentorId })
            });
            if (response.ok) {
                setSuccessMessage("Mentee assigned successfully");
                fetchData(); // Refresh data
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (error) {
            setError("Failed to assign mentee");
            setTimeout(() => setError(""), 3000);
        }
    };

    const handleDeleteAllData = async () => {
        if (window.confirm('Are you sure you want to delete ALL data? This action cannot be undone!')) {
            try {
                const response = await fetch('http://localhost:5000/api/admin/delete-all-data', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                    }
                });

                if (response.ok) {
                    setSuccessMessage("All data deleted successfully");
                    // Reset local state
                    setMentors([]);
                    setApplications([]);
                    setTimeout(() => setSuccessMessage(""), 3000);
                } else {
                    setError("Failed to delete data");
                    setTimeout(() => setError(""), 3000);
                }
            } catch (error) {
                setError("Failed to delete data");
                setTimeout(() => setError(""), 3000);
            }
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", backgroundColor: '#fff' }}>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px"
            }}>
                <h1>Admin Dashboard</h1>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={() => navigate('/admin/all-data')}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#17a2b8",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }}
                    >
                        View All Data
                    </button>
                    <button
                        onClick={handleDeleteAllData}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#dc3545",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }}
                    >
                        Delete All Data
                    </button>
                    <button onClick={() => navigate('/')} style={{ padding: "10px 20px" }}>
                        Back to Home
                    </button>
                </div>
            </div>

            <Alert message={error} type="error" />
            <Alert message={successMessage} type="success" />

            {/* Pending Approvals Section */}
            <section style={{ marginBottom: "40px" }}>
                <h2>Pending Mentor Approvals</h2>
                <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
                    {mentors.filter(m => !m.isApproved).map(mentor => (
                        <div key={mentor._id} style={{
                            border: "1px solid rgba(255,255,255,0.1)",
                            padding: "15px",
                            borderRadius: "8px",
                            backgroundColor: "rgba(0,0,0,0.2)"
                        }}>
                            <h3>{mentor.fullName}</h3>
                            <p><strong>Email:</strong> {mentor.email}</p>
                            <p><strong>Full Name:</strong> {mentor.fullName}</p>
                            <p><strong>Expertise:</strong> {mentor.expertise.join(', ')}</p>
                            <p><strong>Years of Experience:</strong> {mentor.yearsOfExperience}</p>
                            <p><strong>Current Role:</strong> {mentor.currentRole}</p>
                            <p><strong>Company:</strong> {mentor.company}</p>
                            <p><strong>LinkedIn:</strong> <a href={mentor.linkedIn} target="_blank" rel="noopener noreferrer">{mentor.linkedIn}</a></p>
                            <p><strong>Github:</strong> <a href={mentor.github} target="_blank" rel="noopener noreferrer">{mentor.github}</a></p>
                            <p><strong>Bio:</strong> {mentor.bio}</p>
                            <p><strong>Availability:</strong> {mentor.availability}</p>
                            <p><strong>Preferred Mentee Level:</strong> {mentor.preferredMenteeLevel}</p>
                            <p><strong>Expectations:</strong> {mentor.expectations}</p>
                            <p><strong>Mentorship Style:</strong> {mentor.mentorshipStyle}</p>
                            <p><strong>Portfolio:</strong> <a href={mentor.portfolio} target="_blank" rel="noopener noreferrer">{mentor.portfolio}</a></p>
                            <p><strong>Other Expertise:</strong> {mentor.otherExpertise}</p>
                            {mentor.pastMentorshipExperience && (
                                <p><strong>Past Mentorship Experience:</strong> {mentor.pastMentorshipExperience}</p>
                            )}
                            {mentor.certificates && (
                                <p><strong>Certificates:</strong> {mentor.certificates}</p>
                            )}
                            {mentor.resume && (
                                <div style={{ margin: "10px 0" }}>
                                    <strong>Resume:</strong>{" "}
                                    <ResumeDownload filename={mentor.resume} />
                                </div>
                            )}
                            <button
                                onClick={() => handleApproveMentor(mentor._id)}
                                style={{
                                    backgroundColor: "#28a745",
                                    color: "white",
                                    border: "none",
                                    padding: "8px 16px",
                                    borderRadius: "4px",
                                    cursor: "pointer"
                                }}
                            >
                                Approve Mentor
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Mentee Assignment Section */}
            <section>
                <h2>Pending Mentee Applications</h2>
                <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
                    {applications.filter(app => app.status === 'pending').map(app => (
                        <div key={app._id} style={{
                            border: "1px solid rgba(255,255,255,0.1)",
                            padding: "15px",
                            borderRadius: "8px",
                            backgroundColor: "rgba(0,0,0,0.2)"
                        }}>
                            <h3>{app.fullName}</h3>
                            <p><strong>Experience:</strong> {app.experienceLevel}</p>
                            <p><strong>Goals:</strong> {app.mentorshipGoals}</p>
                            <select
                                onChange={(e) => handleAssignMentee(app._id, e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "8px",
                                    marginTop: "10px",
                                    backgroundColor: "#333",
                                    color: "white",
                                    border: "1px solid rgba(255,255,255,0.2)"
                                }}
                            >
                                <option value="">Select Mentor</option>
                                {mentors
                                    .filter(m => m.isApproved)
                                    .map(mentor => (
                                        <option key={mentor._id} value={mentor._id}>
                                            {mentor.fullName} - {mentor.expertise.join(', ')}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                    ))}
                </div>
            </section >
        </div >
    );
};

export default AdminDashboard;
