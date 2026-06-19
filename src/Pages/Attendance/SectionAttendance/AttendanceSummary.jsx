import React, { useState, useEffect } from "react";
import "./AttendanceSummary.css"; 

const AttendanceSummary = () => {
  const [year, setYear] = useState("B.Tech I");
  const [department, setDepartment] = useState("CSD");
  const [section, setSection] = useState("A");
  const [attendanceData, setAttendanceData] = useState([]);
  const [userDepartment, setUserDepartment] = useState("");

  const token = localStorage.getItem("token"); // Retrieve JWT
  const loginId = localStorage.getItem("loginId") || localStorage.getItem("facultyId");

  useEffect(() => {
    fetchUserDepartment();
  }, []);

  const fetchUserDepartment = async () => {
    if (loginId) {
      try {
        const response = await fetch(
          `https://tkrc-backend.vercel.app/admin/facultyprofile/${loginId}`, {
            headers: { Authorization: `Bearer ${token}` } // Attach Token
          }
        );
        const data = await response.json();
        if (data.department) {
          const dept = data.department.toUpperCase(); 
          setUserDepartment(dept);
          setDepartment(dept !== "ALL" ? dept : "CSD"); 
        }
      } catch (error) {
        console.error("Error fetching user department:", error);
      }
    }
  };

  const fetchAttendance = async () => {
    const url = `https://tkrc-backend.vercel.app/Attendance/section-record?year=${year}&department=${department}&section=${section}`;
    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` } // Attach Token
      });
      const data = await response.json();
      setAttendanceData(data.attendanceSummary || []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  return (
    <div className="attendance-container">
      <h2 className="attendance-title">Section Attendance Summary</h2>

      <div className="form-group">
        <label>Year:</label>
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option>B.Tech I</option>
          <option>B.Tech II</option>
          <option>B.Tech III</option>
          <option>B.Tech IV</option>
        </select>

        <label>Department:</label>
        <select 
          value={department} 
          onChange={(e) => setDepartment(e.target.value)}
          disabled={userDepartment !== "ALL"}
        >
          {userDepartment === "ALL" ? (
            <>
              <option>CSD</option>
              <option>CSE</option>
              <option>EEE</option>
              <option>ECE</option>
              <option>ME</option>
              <option>CIVIL</option>
              <option>CSM</option>
            </>
          ) : (
            <option>{userDepartment}</option>
          )}
        </select>

        <label>Section:</label>
        <select value={section} onChange={(e) => setSection(e.target.value)}>
          <option>A</option>
          <option>B</option>
          <option>C</option>
        </select>

        <button className="fetch-button" onClick={fetchAttendance}>
          Fetch Attendance
        </button>
      </div>

      {attendanceData.length > 0 && (
        <div className="attendance-table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Name</th>
                <th>Classes Conducted</th>
                <th>Classes Attended</th>
                <th>Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((student) => (
                <tr key={student.rollNumber}>
                  <td>{student.rollNumber}</td>
                  <td>{student.name}</td>
                  <td>{student.totalClassesConducted}</td>
                  <td>{student.totalClassesAttended}</td>
                  <td className={student.attendancePercentage < 75 ? "low-attendance" : ""}>
                    {student.attendancePercentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceSummary;
