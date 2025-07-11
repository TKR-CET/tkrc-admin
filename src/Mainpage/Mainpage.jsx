import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Mainpage.css";

const Mainpage = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  const facultyId = localStorage.getItem("facultyId");

  useEffect(() => {
    const fetchFacultyRole = async () => {
      if (!facultyId) return;
      try {
        const response = await axios.get(
          `https://tkrc-backend.vercel.app/faculty/facultyprofile/${facultyId}`
        );
        setRole(response.data.role);
      } catch (error) {
        console.error("Error fetching faculty details:", error);
      }
    };
    fetchFacultyRole();
  }, [facultyId]);

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("facultyId");
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
