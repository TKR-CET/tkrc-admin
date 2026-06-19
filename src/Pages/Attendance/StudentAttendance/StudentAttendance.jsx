import React, { useState, useEffect } from "react";
import "./StudentAttendance.css"; 

const StudentAttendance = () => {
  const [rollNo, setRollNo] = useState("");
  const [studentInfo, setStudentInfo] = useState(null);
  const [attendanceInfo, setAttendanceInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
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
          setUserDepartment(data.department.toUpperCase()); 
        }
      } catch (error) {
        console.error("Error fetching user department:", error);
      }
    }
  };

  const handleFetch = async () => {
    const cleanRollNo = rollNo.trim(); // Remove accidental spaces
    
    if (!cleanRollNo) {
      setErrorMsg("Please enter a Roll Number.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setStudentInfo(null);
    setAttendanceInfo(null);

    try {
      // 1. Fetch Student Details
      const studentRes = await fetch(`https://tkrcet-backend-g3zu.onrender.com/Section/${encodeURIComponent(cleanRollNo)}`, {
        headers: { Authorization: `Bearer ${token}` } // Attach Token
      });
      const studentData = await studentRes.json();

      if (!studentRes.ok || !studentData || !studentData.student) {
        setErrorMsg(studentData.message || "Failed to retrieve student profile.");
        setIsLoading(false);
        return;
      }

      // Check if faculty has access to this student's department
      if (userDepartment !== "ALL" && studentData.student.department.toUpperCase() !== userDepartment) {
        setErrorMsg("You are not authorized to view this student's attendance.");
        setIsLoading(false);
        return;
      }

      setStudentInfo(studentData.student);
      
      // Grab the EXACT roll number from the database to prevent case-sensitivity issues
      const exactDbRollNumber = studentData.student.rollNumber;

      // 2. Fetch Attendance Data
      const attendanceRes = await fetch(
        `https://tkrc-backend.vercel.app/Attendance/student-record?rollNumber=${encodeURIComponent(exactDbRollNumber)}`, {
          headers: { Authorization: `Bearer ${token}` } // Attach Token
        }
      );
      const attendanceData = await attendanceRes.json();

      // If the backend returns an error (like 404 Not Found), show the REAL error message
      if (!attendanceRes.ok) {
        setErrorMsg(attendanceData.message || "Failed to retrieve attendance data.");
        setIsLoading(false);
        return;
      }

      // Ensure the structure is correct
      if (!attendanceData || !attendanceData.subjectSummary || !attendanceData.dailySummary) {
        setErrorMsg("Attendance data format is invalid or missing.");
        setIsLoading(false);
        return;
      }

      console.log("Attendance Data:", attendanceData); 
      setAttendanceInfo(attendanceData);
      
    } catch (error) {
      console.error("Fetch Error:", error);
      setErrorMsg("A network error occurred while retrieving data.");
    } finally {
      setIsLoading(false);
    }
  };

  // Safe percentage calculation to prevent NaN% when dividing by zero
  const calculateTotalPercentage = () => {
    if (!attendanceInfo || !attendanceInfo.subjectSummary) return "0.00";
    const totalConducted = attendanceInfo.subjectSummary.reduce((sum, sub) => sum + sub.classesConducted, 0);
    const totalAttended = attendanceInfo.subjectSummary.reduce((sum, sub) => sum + sub.classesAttended, 0);
    
    return totalConducted > 0 ? ((totalAttended / totalConducted) * 100).toFixed(2) : "0.00";
  };

  return (
    <div className="main-container">
      <h2 className="heading">Student Information</h2>
      <div className="input-section">
        <input
          type="text"
          placeholder="Enter Roll Number"
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
          className="input-box"
          onKeyDown={(e) => e.key === 'Enter' && handleFetch()} // Allows pressing Enter to search
        />
        <button onClick={handleFetch} className="fetch-btn">Search</button>
      </div>

      {isLoading && <h3 className="loading-msg">Loading...</h3>}
      {errorMsg && <h3 className="error-msg" style={{color: "red"}}>{errorMsg}</h3>}

      {studentInfo && !errorMsg && (
        <div className="table-wrapper">
          <h3>Student Details</h3>
          <table className="info-table">
            <tbody>
              <tr>
                <th>Roll No.</th>
                <td>{studentInfo.rollNumber}</td>
                <td rowSpan="4" className="image-column">
                  <img src={studentInfo.image} alt="Student" className="student-pic" />
                </td>
              </tr>
              <tr>
                <th>Name</th>
                <td>{studentInfo.name}</td>
              </tr>
              <tr>
                <th>Father's Name</th>
                <td>{studentInfo.fatherName}</td>
              </tr>
              <tr>
                <th>Department</th>
                <td>{`${studentInfo.year} ${studentInfo.department} ${studentInfo.section}`}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {attendanceInfo && !errorMsg && (
        <>
          <div className="table-wrapper">
            <h3>Attendance Overview</h3>
            <table className="info-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Classes Held</th>
                  <th>Classes Attended</th>
                  <th>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {attendanceInfo.subjectSummary.map((subject, index) => (
                  <tr key={index}>
                    <td>{subject.subject}</td>
                    <td>{subject.classesConducted}</td>
                    <td>{subject.classesAttended}</td>
                    <td>{subject.percentage}%</td>
                  </tr>
                ))}
                <tr>
                  <td><b>Total</b></td>
                  <td><b>{attendanceInfo.subjectSummary.reduce((sum, sub) => sum + sub.classesConducted, 0)}</b></td>
                  <td><b>{attendanceInfo.subjectSummary.reduce((sum, sub) => sum + sub.classesAttended, 0)}</b></td>
                  <td id="overall">
                    <b>{calculateTotalPercentage()}%</b>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="daily-attendance">
            <h2>Daily Attendance</h2>
            <table className="t2">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>9:40 - 10:40</th>
                  <th>10:40 - 11:40</th>
                  <th>11:40 - 12:40</th>
                  <th>1:20 - 2:20</th>
                  <th>2:20 - 3:20</th>
                  <th>3:20 - 4:20</th>
                  <th>Total</th>
                  <th>Attended</th>
                </tr>
              </thead>
              <tbody>
                {attendanceInfo.dailySummary &&
                  Object.entries(attendanceInfo.dailySummary).map(([date, data], index) => (
                    <tr key={index}>
                      <td>{date}</td>
                      {[1, 2, 3, 4, 5, 6].map((period) => {
                        const periodData = data.periods?.[period];
                        return (
                          <td
                            key={period}
                            className={periodData?.status === "present" ? "present-cell" : "absent-cell"}
                          >
                            {periodData?.subject || "-"}
                          </td>
                        );
                      })}
                      <td>{data.total}</td>
                      <td>{data.attended}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentAttendance;
