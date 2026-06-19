import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Mainpage.css";

const Mainpage = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  // Retrieve the secure details from localStorage
  const facultyId = localStorage.getItem("facultyId");
  const loginId = localStorage.getItem("loginId"); 
  const token = localStorage.getItem("token"); // Get JWT

  useEffect(() => {
    const fetchFacultyRole = async () => {
      // Ensure we have the necessary IDs and Token before making the request
      if (!loginId || !token) return;
      
      try {
        // Updated to the new /admin endpoint and attached the JWT token
        const response = await axios.get(
          `https://tkrc-backend.vercel.app/admin/facultyprofile/${loginId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setRole(response.data.role);
      } catch (error) {
        console.error("Error fetching faculty details:", error);
        // Automatically log out if the token has expired or is invalid
        if (error.response && error.response.status === 401) {
          handleLogout();
        }
      }
    };
    fetchFacultyRole();
  }, [loginId, token]);

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    // Clear ALL secure items from localStorage on logout
    localStorage.removeItem("facultyId");
    localStorage.removeItem("loginId");
    localStorage.removeItem("token");
    localStorage.removeItem("studentId");
    navigate("/");
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="main-container">
      {/* Header Section */}
      <header className="header">
        <h1 id="h1">TKRCET</h1>
        <button className="menu-button" onClick={toggleSidebar}>
          {sidebarOpen ? "✖" : "☰"}
        </button>
      </header>

      {/* Wrapper for Sidebar and Content */}
      <div className="wrapper">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <h2 className="sidebar-title">Academic Activities</h2>
          <ul className="menu">
            {/* Faculty */}
            <li className={activeMenu === "faculty" ? "active" : ""}>
              <span onClick={() => toggleMenu("faculty")}>Faculty</span>
              <ul className="submenu">
                {role !== "HOD" && role !== "hod" && (
                  <>
                    <li><Link to="/main/addfaculty" onClick={closeSidebar}>Add Faculty</Link></li>
                    <li><Link to="/main/facultylist" onClick={closeSidebar}>Faculty Details</Link></li>
                  </>
                )}
                <li><Link to="/main/facultytable" onClick={closeSidebar}>Faculty Timetable</Link></li>
              </ul>
            </li>

            {/* Student - HIDDEN FOR HOD */}
            {role !== "HOD" && role !== "hod" && (
              <li className={activeMenu === "student" ? "active" : ""}>
                <span onClick={() => toggleMenu("student")}>Student</span>
                <ul className="submenu">
                  <li><Link to="/main/addstudent" onClick={closeSidebar}>Add Students</Link></li>
                  <li><Link to="/main/studentDetails" onClick={closeSidebar}>Student Details</Link></li>
                </ul>
              </li>
            )}

            {/* Section Timetable */}
            <li><Link to="/main/studentTable" onClick={closeSidebar}>Section Timetable</Link></li>

            {/* Edit Option Enabling */}
            {role !== "HOD" && role !== "hod" && (
              <li className={activeMenu === "editOption" ? "active" : ""}>
                <span onClick={() => toggleMenu("editOption")}>Edit Option</span>
                <ul className="submenu">
                  <li><Link to="/main/grant" onClick={closeSidebar}>Grant Permissions</Link></li>
                  <li><Link to="/main/permission" onClick={closeSidebar}>Permissions List</Link></li>
                </ul>
              </li>
            )}

            {/* Attendance */}
            <li className={activeMenu === "attendance" ? "active" : ""}>
              <span onClick={() => toggleMenu("attendance")}>Attendance</span>
              <ul className="submenu">
                <li><Link to="/main/attendance" onClick={closeSidebar}>Section Attendance</Link></li>
                <li><Link to="/main/student" onClick={closeSidebar}>Student Attendance</Link></li>
                <li><Link to="/main/daily" onClick={closeSidebar}>Daily Attendance</Link></li>
              </ul>
            </li>

            {/* Logout */}
            <li>
              <button className="logout-button" onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </aside>

        {/* Content Section */}
        <main className="content-section">
          <div className="content-wrapper">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Mainpage;
