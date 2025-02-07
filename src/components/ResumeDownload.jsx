import React from 'react';
import { API_BASE_URL } from '../config';

const ResumeDownload = ({ filename }) => {
    const handleDownload = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/mentor/resume/${filename}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (response.ok) {
                // Create a blob from the response
                const blob = await response.blob();
                // Create a temporary URL for the blob
                const url = window.URL.createObjectURL(blob);
                // Create a temporary link element
                const link = document.createElement('a');
                link.href = url;
                link.download = filename; // Set the download filename
                document.body.appendChild(link);
                link.click();
                // Cleanup
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                console.error('Failed to download resume');
            }
        } catch (error) {
            console.error('Error downloading resume:', error);
        }
    };

    return (
        <button
            onClick={handleDownload}
            style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px"
            }}
        >
            <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M8 12L3 7H13L8 12Z"
                    fill="currentColor"
                />
                <path
                    d="M8 4V12M4 14H12"
                    stroke="currentColor"
                    strokeWidth="2"
                />
            </svg>
            Download Resume
        </button>
    );
};

export default ResumeDownload;
