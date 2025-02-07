import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from './Alert';
import './MenteeDashboard.css';
import { API_BASE_URL } from '../config';

const ProgressTimeline = ({ currentStatus, courseAssigned }) => {
    const steps = [
        { id: 1, name: 'Registration', status: 'completed' },
        { id: 2, name: 'Form Submission', status: 'completed' },
        { id: 3, name: 'Mentor Assignment', status: currentStatus === 'assigned' || currentStatus === 'approved' ? 'completed' : 'active' },
        { id: 4, name: 'Course Assignment', status: courseAssigned ? 'completed' : currentStatus === 'assigned' ? 'active' : 'pending' },
        { id: 5, name: 'Course Completion', status: currentStatus === 'completed' ? 'completed' : 'pending' }
    ];

    return (
        <div className="mentee-progress">
            <h3>Your Journey Progress</h3>
            <div className="progress-line">
                {steps.map((step, index) => (
                    <div key={step.id} className={`progress-step ${step.status}`}>
                        <div className="step-circle">
                            {step.status === 'completed' && '✓'}
                            {step.status === 'active' && '•'}
                        </div>
                        <div className="step-label">{step.name}</div>
                        {index < steps.length - 1 && <div className="connecting-line" />}
                    </div>
                ))}
            </div>
        </div>
    );
};

const MenteeDashboard = () => {
    const [applicationData, setApplicationData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [photoUrl, setPhotoUrl] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMenteeApplication();
    }, []);

    const fetchMenteeApplication = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/mentee/my-application`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setApplicationData(data);
                if (data?.photoPath) {
                    fetchPhoto(data._id);
                }
            } else {
                setError("Failed to fetch application data");
            }
        } catch (error) {
            setError("Network error");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPhoto = async (applicationId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/mentor/download/photo/${applicationId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const blob = await response.blob();
                setPhotoUrl(URL.createObjectURL(blob));
            }
        } catch (error) {
            console.error('Error fetching photo:', error);
        }
    };

    if (isLoading) return (
        <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading your dashboard...</p>
        </div>
    );

    if (error) return <Alert message={error} type="error" />;

    return (
        <div className="mentee-dashboard">
            <nav className="dashboard-nav">
                <h1>Mentee Dashboard</h1>
                <button onClick={() => navigate('/')} className="nav-button">
                    Back to Home
                </button>
            </nav>

            {applicationData ? (
                <div className="dashboard-content">
                    <ProgressTimeline
                        currentStatus={applicationData.status}
                        courseAssigned={!!applicationData.assignedCourse}
                    />
                    <div className="profile-section">
                        <div className="profile-header">
                            {photoUrl && (
                                <div className="profile-photo-container">
                                    <img src={photoUrl} alt="Profile" className="profile-photo" />
                                </div>
                            )}
                            <div className="profile-info">
                                <h2>{applicationData.fullName}</h2>
                                <p className="email">{applicationData.email}</p>
                                <div className="status-badge" data-status={applicationData.status}>
                                    {applicationData.status.toUpperCase()}
                                </div>
                            </div>
                        </div>

                        {applicationData.assignedCourse && (
                            <div className="course-section">
                                <h3>Assigned Course</h3>
                                <div className="course-card">
                                    <h4>{applicationData.courseName}</h4>
                                    <button className="start-course-btn">
                                        Start Learning
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="details-section">
                            <h3>Application Details</h3>
                            <div className="details-grid">
                                <div className="detail-item">
                                    <label>Experience Level</label>
                                    <span>{applicationData.experienceLevel}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Education</label>
                                    <span>{applicationData.education}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Phone</label>
                                    <span>{applicationData.phone}</span>
                                </div>
                            </div>

                            <div className="goals-section">
                                <h4>Mentorship Goals</h4>
                                <p>{applicationData.mentorshipGoals}</p>
                            </div>

                            <div className="skills-section">
                                <div className="skills-known">
                                    <h4>Skills Known</h4>
                                    <p>{applicationData.skillsKnown}</p>
                                </div>
                                <div className="skills-improve">
                                    <h4>Skills to Improve</h4>
                                    <p>{applicationData.skillsToImprove}</p>
                                </div>
                            </div>

                            <div className="links-section">
                                {applicationData.linkedin && (
                                    <a href={applicationData.linkedin} target="_blank" rel="noopener noreferrer" className="profile-link linkedin">
                                        LinkedIn Profile
                                    </a>
                                )}
                                {applicationData.github && (
                                    <a href={applicationData.github} target="_blank" rel="noopener noreferrer" className="profile-link github">
                                        GitHub Profile
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="no-application">
                    <p>No application found. Please submit an application first.</p>
                    <button onClick={() => navigate('/mentee/application')} className="submit-app-btn">
                        Submit Application
                    </button>
                </div>
            )}
        </div>
    );
};

export default MenteeDashboard;
