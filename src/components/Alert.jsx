const Alert = ({ message, type }) => {
    const styles = {
        container: {
            padding: "15px 20px",
            borderRadius: "4px",
            backgroundColor: type === "error" ? "#f8d7da" : "#d4edda",
            color: type === "error" ? "#721c24" : "#155724",
            border: `1px solid ${type === "error" ? "#f5c6cb" : "#c3e6cb"}`,
            display: message ? "block" : "none",
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            minWidth: "300px",
            textAlign: "center",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            animation: message ? "slideUp 0.5s ease-out forwards" : "none"
        },
        "@keyframes slideUp": {
            "0%": {
                transform: "translateX(-50%) translateY(100%)",
                opacity: 0
            },
            "100%": {
                transform: "translateX(-50%) translateY(0)",
                opacity: 1
            }
        }
    };

    // Add keyframes to document
    if (!document.querySelector('#alert-keyframes')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'alert-keyframes';
        styleSheet.textContent = `
            @keyframes slideUp {
                0% {
                    transform: translateX(-50%) translateY(100%);
                    opacity: 0;
                }
                100% {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styleSheet);
    }

    return (
        <div style={styles.container}>
            {message}
        </div>
    );
};

export default Alert;
