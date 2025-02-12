import React, { useState, useEffect } from "react";
import "./StudentAttendance.css"; // Updated CSS filename

const StudentAttendance = () => {
  const [rollNo, setRollNo] = useState("");
  const [studentInfo, setStudentInfo] = useState(null);
  const [attendanceInfo, setAttendanceInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [userDepartment, setUserDepartment] = useState("");

  useEffect(() => {
    fetchUserDepartment();
  }, []);

  const fetchUserDepartment = async () => {
    const facultyId = localStorage.getItem("facultyId");
    if (facultyId) {
      try {
        const response = await fetch(
          `https://tkrcet-backend-g3zu.onrender.com/faculty/facultyprofile/${facultyId}`
        );
        const data = await response.json();
        setUserDepartment(data.department.toUpperCase()); // Normalize to uppercase
      } catch (error) {
        console.error("Error fetching user department:", error);
      }
    }
  };

  const handleFetch = async () => {
    if (!rollNo) {
      setErrorMsg("Please enter a Roll Number.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setStudentInfo(null);
    setAttendanceInfo(null);

    try {
      // Fetch Student Details
      const studentRes = await fetch(`https://tkrcet-backend-g3zu.onrender.com/Section/${rollNo}`);
      const studentData = await studentRes.json();

      if (!studentData || !studentData.student) {
        setErrorMsg("Failed to retrieve student data.");
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

      // Fetch Attendance Data
      const attendanceRes = await fetch(
        `https://tkrcet-backend-g3zu.onrender.com/Attendance/student-record?rollNumber=${rollNo}`
      );
      const attendanceData = await attendanceRes.json();

      if (!attendanceData || !attendanceData.subjectSummary || !attendanceData.dailySummary) {
        setErrorMsg("Failed to retrieve attendance data.");
        setIsLoading(false);
        return;
      }

      setAttendanceInfo(attendanceData);
    } catch (error) {
      setErrorMsg("Error retrieving student or attendance data.");
    } finally {
      setIsLoading(false);
    }
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
        />
        <button onClick={handleFetch} className="fetch-btn">Search</button>
      </div>

      {isLoading && <h3 className="loading-msg">Loading...</h3>}
      {errorMsg && <h3 className="error-msg">{errorMsg}</h3>}

      {studentInfo && (
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

      {attendanceInfo && (
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
                    <b>
                      {(
                        (attendanceInfo.subjectSummary.reduce((sum, sub) => sum + sub.classesAttended, 0) /
                          attendanceInfo.subjectSummary.reduce((sum, sub) => sum + sub.classesConducted, 0)) *
                        100
                      ).toFixed(2)}%
                    </b>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>


        </>
      )}
    </div>
  );
};

export default StudentAttendance;