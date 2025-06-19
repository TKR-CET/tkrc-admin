import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FetchTimetable.css"; // Import CSS file

const FetchTimetable = () => {
  const [formData, setFormData] = useState({
    year: "B.Tech I",
    department: "CSD",
    section: "A",
  });

  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userDepartment, setUserDepartment] = useState(""); // Stores user's department

  const timeSlots = [
    "9:40-10:40",
    "10:40-11:40",
    "11:40-12:40",
    "12:40-1:20",
    "1:20-2:20",
    "2:20-3:20",
    "3:20-4:20",
  ];

  useEffect(() => {
    const fetchUserDepartment = async () => {
      const loginId = localStorage.getItem("facultyId");
      if (loginId) {
        try {
          const response = await axios.get(
            `https://tkrc-backend.vercel.app/faculty/facultyprofile/${loginId}`
          );
          const department = response.data.department.toUpperCase(); // Normalize to uppercase
          setUserDepartment(department);

          // Restrict department selection if user doesn't have "ALL" access
          if (department !== "ALL") {
            setFormData((prevData) => ({
              ...prevData,
              department: department,
            }));
          }
        } catch (error) {
          console.error("Error fetching user department:", error);
        }
      }
    };

    fetchUserDepartment();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchTimetable = async () => {
    setLoading(true);
    setError("");
    setTimetable([]);

    const apiUrl = `https://tkrcet-backend-g3zu.onrender.com/Section/${formData.year}/${formData.department}/${formData.section}/timetable`;

    try {
      const response = await axios.get(apiUrl);
      if (response.data.timetable) {
        setTimetable(response.data.timetable);
      } else {
        setError("No timetable found.");
      }
    } catch (err) {
      setError("Failed to fetch timetable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="timetable-container">
      <h2 className="timetable-title">Timetable</h2>

      {/* Dropdowns for Year, Department, and Section */}
      <div className="form-group">
        <label>Year:</label>
        <select name="year" value={formData.year} onChange={handleChange}>
          <option value="B.Tech I">B.Tech I</option>
          <option value="B.Tech II">B.Tech II</option>
          <option value="B.Tech III">B.Tech III</option>
          <option value="B.Tech IV">B.Tech IV</option>
        </select>
      </div>

      <div className="form-group">
        <label>Department:</label>
        <select
          name="department"
          value={formData.department}
          onChange={handleChange}
          disabled={userDepartment !== "ALL"} // Disable if user has department restrictions
        >
          {userDepartment === "ALL" ? (
            <>
              <option value="CSD">CSD</option>
              <option value="CSE">CSE</option>
              <option value="EEE">EEE</option>
              <option value="ECE">ECE</option>
              <option value="IT">IT</option>
              <option value="CIVIL">CIVIL</option>
              <option value="ME">ME</option>
              <option value="CSM">CSM</option>
            </>
          ) : (
            <option value={userDepartment}>{userDepartment}</option>
          )}
        </select>
      </div>

      <div className="form-group">
        <label>Section:</label>
        <select name="section" value={formData.section} onChange={handleChange}>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
      </div>

      <button onClick={fetchTimetable} className="fetch-button">Fetch Timetable</button>

      {/* Messages */}
      {loading && <p className="loading-message">Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      {/* Display Timetable in Table Format */}
      {timetable.length > 0 && (
        <div className="timetable-table-container">
          <h3>Timetable</h3>
          <table className="timetable-table">
            <thead>
              <tr>
                <th>DAY</th>
                {timeSlots.map((slot, index) => (
                  <th key={index}>{slot}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timetable.map((day) => (
                <tr key={day._id}>
                  <td className="day-column">{day.day}</td>
                  {timeSlots.map((_, periodIndex) => {
                    const period = day.periods.find((p) => p.periodNumber === periodIndex + 1);
                    return (
                      <td key={periodIndex} className="period-column">
                        {period ? period.subject : periodIndex === 3 ? <strong>LUNCH</strong> : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FetchTimetable;
