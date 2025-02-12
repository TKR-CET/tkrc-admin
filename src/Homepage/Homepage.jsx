import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import './Homepage.css';
import VideoSection from "../VideoSection/VideoSection.jsx";

const Homepage = () => {
    const imagesLoader = [
        "/images/campus.webp",
        "/images/collage4.jpg",
        "/images/collage2.jpg",
        "/images/collage1.jpg"
    ];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // State for login inputs and response messages
    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate(); // For redirecting after login

    useEffect(() => {
        const imageInterval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imagesLoader.length);
        }, 5000);
        return () => clearInterval(imageInterval);
    }, []);

    const handleLogin = async () => {
        try {
            const response = await axios.post("https://tkrcet-backend-g3zu.onrender.com/faculty/Adminlogin", { loginId, password });
            
            // Store login ID in localStorage
            localStorage.setItem("facultyId", loginId);
            
            alert("Login successful!");
            navigate("/main"); // Redirect to main page
        } catch (error) {
            setError(error.response?.data?.message || "Login failed. Please try again.");
        }
    };

    return (
        <div className="homepage-main">
            {/* Header */}
            <header className="homepage-header-section">
                <img id="homepage-logo" src="/images/logo.png" alt="TKRCET Logo" />
                <h3 className="header-title">T.K.R COLLEGE OF ENGINEERING & TECHNOLOGY</h3>
            </header>

            {/* Image Carousel */}
            <VideoSection />

            {/* About Section */}
            <section className="about-section">
                <h3 className="section-heading">About TKRCET</h3>
                <p className="about-content">
                    TKR College of Engineering and Technology - a modern temple of learning, an offshoot of the TKR Educational Society was established in 2002...
                </p>
            </section>

            {/* Login Section */}
            <section className="login-section">
                <h3 className="section-heading">Faculty Login</h3>
                <input
                    className="login-input"
                    type="text"
                    placeholder="Login ID"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    required
                />
                <input
                    className="login-input"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && <p className="error-message">{error}</p>}
                <button className="login-button" onClick={handleLogin}>Login</button>
            </section>

            {/* Footer */}
            <footer className="main-footer">
                <p className="footer-text">Copyright © 2024 TKR College of Engineering & Technology. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default Homepage;