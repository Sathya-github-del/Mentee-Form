import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Alert from './Alert';

const ProtectedRoute = ({ children, userType }) => {
    const [redirecting, setRedirecting] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const token = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('userType');

    useEffect(() => {
        if (!token || storedUserType !== userType) {
            setShowAlert(true);
            // First show the alert
            setTimeout(() => {
                // Then start redirecting
                setRedirecting(true);
            }, 2000);
        }
    }, [token, storedUserType, userType]);

    if (!token || storedUserType !== userType) {
        return (
            <div style={{ position: 'relative', minHeight: '100vh' }}>
                {showAlert && (
                    <Alert
                        message={`Please login as ${userType} to access this page`}
                        type="error"
                    />
                )}
                {redirecting && <Navigate to={userType === 'mentee' ? '/login' : '/mentor/login'} />}
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
