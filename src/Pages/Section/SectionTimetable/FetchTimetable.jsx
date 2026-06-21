import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FetchTimetable.css"; 

const FetchTimetable = () => {
  const [formData, setFormData] = useState({
    year: "B.Tech I",
    department: "CSD",
    section: "A",
  });

  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userDepartment, setUserDepartment] = useState(""); 

  const timeSlots = [
    "9:40-10:40",
    "10:40-11:40",
    "11:40-12:40",
    "12:40-1:20", // Index 3 is Lunch
    "1:20-2:20",
    "2:20-3:20",
    "3:20-4:20",
  ];

  const token = localStorage.getItem("token"); 
  const loginId = localStorage.getItem("loginId") || localStorage.getItem("facultyId");

  useEffect(() => {
    const fetchUserDepartment = async () => {
      if (loginId) {
        try {
          const response = await axios.get(
            `https://tkrc-backend.vercel.app/admin/facultyprofile/${loginId}`, {
              headers: { Authorization: `Bearer ${token}` } 
            }
          );
          const department = response.data.department.toUpperCase(); 
          setUserDepartment(department);

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
  }, [loginId, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchTimetable = async () => {
    setLoading(true);
    setError("");
    setTimetable([]);

    const apiUrl = `https://tkrc-backend.vercel.app/Section/${formData.year}/${formData.department}/${formData.section}/timetable`;

    try {
      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` } 
      });
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
          disabled={userDepartment !== "ALL"} 
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

      {loading && <p className="loading-message">Loading...</p>}
      {error && <p className="error-message" style={{color: "red"}}>{error}</p>}

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
                <tr key={day._id || day.day}>
                  <td className="day-column" style={{ fontWeight: "bold" }}>{day.day}</td>
                  {timeSlots.map((_, periodIndex) => {

                    // Hardcode Lunch at Index 3
                    if (periodIndex === 3) {
                      return (
                        <td key={periodIndex} className="period-column" style={{ backgroundColor: "#ffefc1", fontWeight: "bold" }}>
                          LUNCH
                        </td>
                      );
                    }

                    // Fix mapping: Before lunch (indices 0,1,2) maps to DB periods 1,2,3. 
                    // After lunch (indices 4,5,6) maps to DB periods 4,5,6.
                    const dbPeriodNumber = periodIndex < 3 ? periodIndex + 1 : periodIndex;
                    const period = day.periods.find((p) => p.periodNumber === dbPeriodNumber);

                    return (
                      <td key={periodIndex} className="period-column">
                        {period ? (
                          <div style={{ lineHeight: "1.4" }}>
                            <strong>{period.subject}</strong>
                            {period.facultyName && period.facultyName !== "Unknown" && (
                              <>
                                <br />
                                <span style={{ fontSize: "0.85em", color: "#555" }}>
                                  {period.facultyName}
                                </span>
                              </>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: "#ccc" }}>-</span>
                        )}
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
