import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Alert from './Alert';

const AdminProtectedRoute = ({ children }) => {
    const [redirecting, setRedirecting] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const token = localStorage.getItem('adminToken');
    const userType = localStorage.getItem('userType');

    useEffect(() => {
        if (!token || userType !== 'admin') {
            setShowAlert(true);
            setTimeout(() => {
                setRedirecting(true);
            }, 2000);
        }
    }, [token, userType]);

    if (!token || userType !== 'admin') {
        return (
            <div style={{ position: 'relative', minHeight: '100vh' }}>
                {showAlert && (
                    <Alert
                        message="Admin access required. Please login as administrator."
                        type="error"
                    />
                )}
                {redirecting && <Navigate to="/admin/login" />}
            </div>
        );
    }

    return children;
};

export default AdminProtectedRoute;
