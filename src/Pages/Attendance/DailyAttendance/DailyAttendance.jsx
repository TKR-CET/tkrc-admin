import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DailyAttendance.css";

const AttendanceSummary = () => {
  const years = ["B.Tech I", "B.Tech II", "B.Tech III", "B.Tech IV"];
  const departments = ["CSD", "CSE", "EEE", "ECE", "CIVIL", "ME", "CSM"];
  const sections = ["A", "B", "C"];

  const periodTimings = [
    "9:40 - 10:40",
    "10:40 - 11:40",
    "11:40 - 12:40",
    "1:20 - 2:20",
    "2:20 - 3:20",
    "3:20 - 4:20",
  ];

  const [year, setYear] = useState(years[0]);
  const [department, setDepartment] = useState(departments[0]);
  const [section, setSection] = useState(sections[0]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const [subjects, setSubjects] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [userDepartment, setUserDepartment] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetchUserDepartment();
  }, []);

  useEffect(() => {
    fetchSubjectsForDay();
  }, [year, department, section, date]); // Auto-fetch subjects on change

  const fetchUserDepartment = async () => {
    const facultyId = localStorage.getItem("facultyId");
    if (facultyId) {
      try {
        const response = await axios.get(
          `https://tkrcet-backend-g3zu.onrender.com/faculty/facultyprofile/${facultyId}`
        );
        const department = response.data.department.toUpperCase();
        setUserDepartment(department);
        setDepartment(department !== "ALL" ? department : departments[0]);
      } catch (error) {
        console.error("Error fetching user department:", error);
      }
    }
  };

  const fetchSubjectsForDay = async () => {
    try {
      const response = await axios.get(
        `https://tkrcet-backend-g3zu.onrender.com/Section/subjects-day/${year}/${department}/${section}/${date}`
      );
      setSubjects(response.data.periods || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setSubjects([]);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await axios.get(
        `https://tkrcet-backend-g3zu.onrender.com/Attendance/section-summary-all`,
        { params: { year, department, section, date } }
      );
      setAttendanceData(response.data.attendance || {});
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendanceData({});
    }
  };

  const handleShowPopup = (period) => {
    setSelectedPeriod(period);
    setShowPopup(true);
  };

  return (
    <div className="attendance-container">
      <h2 className="attendance-title">Attendance Summary</h2>

      {/* Input Fields in a Single Row */}
      <div className="attendance-inputs">
        <label>Year:</label>
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          {years.map((yr) => (
            <option key={yr} value={yr}>{yr}</option>
          ))}
        </select>

        <label>Department:</label>
        <select 
          value={department} 
          onChange={(e) => setDepartment(e.target.value)}
          disabled={userDepartment !== "ALL"}
        >
          {userDepartment === "ALL" ? (
            departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))
          ) : (
            <option>{userDepartment}</option>
          )}
        </select>

        <label>Section:</label>
        <select value={section} onChange={(e) => setSection(e.target.value)}>
          {sections.map((sec) => (
            <option key={sec} value={sec}>{sec}</option>
          ))}
        </select>

        <label>Date:</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <button onClick={fetchAttendance}>Fetch Attendance</button>
      </div>

      {/* Attendance Table */}
      <div className="attendance-table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Timing - Fetched Subject</th>
              <th>Attendance Subject</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {periodTimings.map((timing, index) => {
              const subjectData = subjects[index] || {};
              const periodKey = Object.keys(attendanceData).find((p) => p.startsWith(`Period ${index + 1}`));
              const periodData = attendanceData[periodKey] || {};
              const attendanceSubject = periodKey ? periodKey.split(" - ")[1] : "Not Taken";

              const presentCount = periodData.presentCount !== undefined ? periodData.presentCount : "Not Taken";
              const absentCount = periodData.absentCount !== undefined ? periodData.absentCount : "Not Taken";
              const totalStrength = presentCount !== "Not Taken" && absentCount !== "Not Taken" ? presentCount + absentCount : "Not Taken";

              return (
                <tr key={index}>
                  <td>{`${timing} - ${subjectData.subject || "Not Available"}`}</td>
                  <td className={periodKey ? "" : "not-taken"}>{attendanceSubject}</td>
                  <td className={periodKey ? "clickable" : "not-taken"} onClick={periodKey ? () => handleShowPopup(periodData) : null}>
                    {presentCount}
                  </td>
                  <td className={periodKey ? "clickable" : "not-taken"} onClick={periodKey ? () => handleShowPopup(periodData) : null}>
                    {absentCount}
                  </td>
                  <td className="total-strength">{totalStrength}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Attendance Details Popup */}
      {showPopup && selectedPeriod && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h3>Attendance Details</h3>
            <h4>Present Students</h4>
            <p>{selectedPeriod.presentRollNumbers?.join(", ") || "No Data"}</p>

            <h4>Absent Students</h4>
            <p>{selectedPeriod.absentRollNumbers?.join(", ") || "No Data"}</p>

            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceSummary;