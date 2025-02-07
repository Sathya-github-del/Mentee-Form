import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
const AllData = () => {
    const [data, setData] = useState({
        mentors: [],
        mentees: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchCredentials();
    }, []);

    const fetchCredentials = async () => {
        try {
            const [mentorsRes, menteesRes] = await Promise.all([
                fetch('${API_BASE_URL}/api/admin/mentor-credentials', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
                }),
                fetch('${API_BASE_URL}/api/admin/mentee-credentials', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
                })
            ]);

            const [mentors, mentees] = await Promise.all([
                mentorsRes.json(),
                menteesRes.json()
            ]);

            setData({ mentors, mentees });
        } catch (error) {
            setError("Failed to fetch credentials");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                <h1>Login Credentials</h1>
                <button onClick={() => navigate('/admin/dashboard')}
                    style={{ padding: "10px" }}>
                    Back to Dashboard
                </button>
            </div>

            {/* Mentors Section */}
            <section style={{ marginBottom: "40px" }}>
                <h2>Mentor Credentials ({data.mentors.length})</h2>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f8f9fa" }}>
                                <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
                                <th style={{ padding: "12px", textAlign: "left" }}>Name</th>
                                <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.mentors.map(mentor => (
                                <tr key={mentor._id} style={{ borderBottom: "1px solid #dee2e6" }}>
                                    <td style={{ padding: "12px" }}>{mentor.email}</td>
                                    <td style={{ padding: "12px" }}>{mentor.fullName}</td>
                                    <td style={{ padding: "12px" }}>
                                        {mentor.isApproved ?
                                            <span style={{ color: "green" }}>Active</span> :
                                            <span style={{ color: "orange" }}>Pending</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Mentees Section */}
            <section>
                <h2>Mentee Credentials ({data.mentees.length})</h2>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ backgroundColor: "#f8f9fa" }}>
                                <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
                                <th style={{ padding: "12px", textAlign: "left" }}>Username</th>
                                <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.mentees.map(mentee => (
                                <tr key={mentee._id} style={{ borderBottom: "1px solid #dee2e6" }}>
                                    <td style={{ padding: "12px" }}>{mentee.email}</td>
                                    <td style={{ padding: "12px" }}>{mentee.username}</td>
                                    <td style={{ padding: "12px" }}>
                                        {mentee.assignedMentor ?
                                            <span style={{ color: "green" }}>Assigned</span> :
                                            <span style={{ color: "blue" }}>Unassigned</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AllData;
