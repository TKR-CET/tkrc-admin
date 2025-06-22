import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import './Homepage.css';


const Homepage = () => {
    const imagesLoader = [
        "/images/campus.webp",
        "/images/collage4.jpg",
        "/images/collage2.jpg",
        "/images/collage1.jpg"
    ];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // State for login inputs and response messages
    const [loginId, setLoginId] = useState("RA100");
    const [password, setPassword] = useState("RA100");
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
            const response = await axios.post("https://tkrc-backend.vercel.app/faculty/Adminlogin", { loginId, password });
            
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
            {/* Campus Image Section */}
<div className="campus-image-container">
  <img src="/images/campus.webp" alt="Campus View" className="campus-image" />
</div>

            {/* About Section */}
            <section className="about-section">
                <h3 className="section-heading">About TKRCET</h3>
                <p className="about-content">
                    TKR College of Engineering and Technology - a modern temple of learning, an off shoot of the TKR Educational Society was established in the year 2002 in a sprawling, lush green 20 acre campus at Meerpet, Hyderabad. The college provides a serene and tranquil environment to the students, boosting their mental potential and preparing them in all aspects to face the cut- throat global competition with a smile on the face and emerge victorious.

                    Sri Teegala Krishna Reddy, the Mayor of Hyderabad, is the founder chairman of TKR Educational Society. A Philanthropist by nature, "the friend of man, to vice alone of foe", and an urge to see our students excelling themselves in all fields prompted him to start the educational society; making it easy for education to be within arm's length of even a rural student and providing them with an independent and easy in the for pursuing their dreams and making them come true and in the process upholding moral and ethical values.
                    
                    The person puts in all his efforts to see the students excelling themselves and takes great pride in watching them carve out a niche for themselves is none other than Dr. T. Harinath Reddy, the Secretary of the college. A calm and serene countenance with sharp, twinkling eyes, he is the pivotal of encouragement and is always on the look out for avenues, which would provide the wherewithal for developing a cutting edge to their capabilities and potentialities.
                    
                    The college is headed by eminent principal Dr. D. V. Ravi Shankar. He obtained his AMIE in Mechanical Engineering, M.Tech and Ph.D from JNT University, Hyderabad. He published various research papers in national and international journals.
                    
                    The College is affiliated to Jawaharlal Nehru Technological University Kukatpally, Hyderabd. It has been approved by AICTE, New Delhi and the State Government of Telangana and has been sanctioned seven UG courses - Civil Engineering, Electrical & Electronics Engineering, Computer Science & Engineering, Electronics & Communication Engineering, Mechanical Engineering and PG Courses - M.Tech in CSE, PE & MBA. In addition the College is running second shift Polytechnic in the branches - CIVIL, EEE, MECH, ECE & CSE.
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
