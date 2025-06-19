import React, { useState, useEffect } from "react";
import axios from "axios";
import "./GrantPermission.css";

const GrantPermission = () => {
  const [facultyDepartment, setFacultyDepartment] = useState("");
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState("");

  const [editYear, setEditYear] = useState("B.Tech I");
  const [editDepartment, setEditDepartment] = useState("CSD");
  const [editSection, setEditSection] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTimeDate, setStartTimeDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTimeDate, setEndTimeDate] = useState("");
  const [endTime, setEndTime] = useState("");

  const years = ["B.Tech I", "B.Tech II", "B.Tech III", "B.Tech IV"];
  const departments = ["CSD", "CSE", "CSM", "EEE", "ECE", "CIVIL", "ME"];

  useEffect(() => {
    if (facultyDepartment) {
      axios
        .get(`https://tkrc-backend.vercel.app/faculty/department/${facultyDepartment}`)
        .then((response) => {
          setFacultyList(response.data);
          setSelectedFaculty("");
        })
        .catch((error) => console.error("Error fetching faculty:", error));
    } else {
      setFacultyList([]);
      setSelectedFaculty("");
    }
  }, [facultyDepartment]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFaculty || !editSection || !startDate || !endDate || !startTimeDate || !startTime || !endTimeDate || !endTime) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      // Convert startDate and endDate to Date format (00:00:00 UTC)
      const formattedStartDate = new Date(startDate);
      formattedStartDate.setUTCHours(0, 0, 0, 0);

      const formattedEndDate = new Date(endDate);
      formattedEndDate.setUTCHours(0, 0, 0, 0);

      // Combine startTimeDate with startTime to form a full Date-Time
      const formattedStartTime = new Date(`${startTimeDate}T${startTime}`);
      const formattedEndTime = new Date(`${endTimeDate}T${endTime}`);

      const requestData = {
        facultyId: selectedFaculty,
        year: editYear,
        department: editDepartment,
        section: editSection,
        startDate: formattedStartDate.toISOString(),
        endDate: formattedEndDate.toISOString(),
        startTime: formattedStartTime.toISOString(),
        endTime: formattedEndTime.toISOString(),
      };

      console.log("Sending Request:", requestData);

      const response = await axios.post(
        "https://tkrc-backend.vercel.app/Attendance/grantEditPermission",
        requestData,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Response:", response.data);
      alert("Edit permission granted successfully!");

      // **Verify if permission is granted**
      setTimeout(async () => {
        try {
          const checkResponse = await axios.get(
            `https://tkrc-backend.vercel.app/Attendance/checkEditPermission?facultyId=${selectedFaculty}&year=${encodeURIComponent(editYear)}&department=${encodeURIComponent(editDepartment)}&section=${encodeURIComponent(editSection)}&date=${startDate}`
          );
          console.log("Permission Check Response:", checkResponse.data);
          alert(`Permission Check Response:\n${JSON.stringify(checkResponse.data, null, 2)}`);
        } catch (checkError) {
          console.error("Error checking permission:", checkError);
          alert("Failed to verify granted permission.");
        }
      }, 2000);
    } catch (error) {
      console.error("Error granting edit permission:", error);
      alert(`Failed to grant edit permission.\nError: ${error.message}`);
    }
  };

  return (
    <div className="form-container">
      <h2>Grant Edit Permission</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Faculty Department:</label>
          <select value={facultyDepartment} onChange={(e) => setFacultyDepartment(e.target.value)}>
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Faculty:</label>
          <select value={selectedFaculty} onChange={(e) => setSelectedFaculty(e.target.value)} disabled={!facultyList.length}>
            <option value="">Select Faculty</option>
            {facultyList.map((faculty) => (
              <option key={faculty.facultyId} value={faculty.facultyId}>
                {faculty.facultyId} - {faculty.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Year:</label>
          <select value={editYear} onChange={(e) => setEditYear(e.target.value)}>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Department:</label>
          <select value={editDepartment} onChange={(e) => setEditDepartment(e.target.value)}>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Section:</label>
          <input type="text" value={editSection} onChange={(e) => setEditSection(e.target.value)} placeholder="Enter section" required />
        </div>

        <div className="form-group">
          <label>Start Date:</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>End Date:</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Start Time (Date & Time):</label>
          <input type="date" value={startTimeDate} onChange={(e) => setStartTimeDate(e.target.value)} required />
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>End Time (Date & Time):</label>
          <input type="date" value={endTimeDate} onChange={(e) => setEndTimeDate(e.target.value)} required />
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        </div>

        <button type="submit" className="submit-button">Grant Permission</button>
      </form>
    </div>
  );
};

export default GrantPermission;
