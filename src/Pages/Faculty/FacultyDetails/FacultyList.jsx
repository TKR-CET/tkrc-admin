import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FacultyList.css"; // Import CSS file

const FacultyList = () => {
  const departments = ["CSE", "CSD", "IT", "ECE", "EEE", "MECH", "CIVIL"];

  const [department, setDepartment] = useState("");
  const [userDepartment, setUserDepartment] = useState("");
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserDepartment();
  }, []);

  useEffect(() => {
    if (department) {
      fetchFaculties();
    }
  }, [department]);

  const fetchUserDepartment = async () => {
    const facultyId = localStorage.getItem("facultyId");
    if (facultyId) {
      try {
        const response = await axios.get(
          `https://tkrcet-backend-g3zu.onrender.com/faculty/facultyprofile/${facultyId}`
        );
        const dept = response.data.department.toUpperCase();
        setUserDepartment(dept);
        setDepartment(dept !== "ALL" ? dept : departments[0]);
      } catch (error) {
        console.error("Error fetching user department:", error);
      }
    }
  };

  const fetchFaculties = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `https://tkrcet-backend-g3zu.onrender.com/faculty/department/${department}`
      );
      const filteredData = response.data.map(({ timetable, ...rest }) => rest);
      setFaculties(filteredData);
    } catch (error) {
      setError("Error fetching faculty data");
      console.error("Error fetching faculty:", error);
    }

    setLoading(false);
  };

  const deleteFaculty = async (facultyId) => {
    if (!window.confirm("Are you sure you want to delete this faculty?")) return;

    try {
      await axios.delete(`https://tkrcet-backend-g3zu.onrender.com/faculty/delete/${facultyId}`);
      setFaculties(faculties.filter((faculty) => faculty.facultyId !== facultyId));
      alert("Faculty deleted successfully!");
    } catch (error) {
      console.error("Error deleting faculty:", error);
      alert("Failed to delete faculty.");
    }
  };

  return (
    <div className="faculty-container">
      <h2 className="title">Faculty List by Department</h2>

      {/* Department Selection */}
      <div className="department-select">
        <label htmlFor="department">Select Department:</label>
        <select
          id="department"
          className="select-input"
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
      </div>

      {/* Display Results */}
      {loading ? (
        <p className="loading">Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : faculties.length > 0 ? (
        faculties.map((faculty, index) => (
          <div key={faculty._id} className="faculty-card">
            <table className="faculty-table">
              <tbody>
                <tr>
                  <td className="table-heading">#</td>
                  <td>{index + 1}</td>
                </tr>
                <tr>
                  <td className="table-heading">Name</td>
                  <td>{faculty.name}</td>
                  <td rowSpan="7" className="faculty-image-container">
                    <img className="faculty-image" src={faculty.image} alt={faculty.name} />
                  </td>
                </tr>
                <tr>
                  <td className="table-heading">Faculty ID</td>
                  <td>{faculty.facultyId}</td>
                </tr>
                <tr>
                  <td className="table-heading">Designation</td>
                  <td>{faculty.designation}</td>
                </tr>
                <tr>
                  <td className="table-heading">Qualification</td>
                  <td>{faculty.qualification}</td>
                </tr>
                <tr>
                  <td className="table-heading">Experience</td>
                  <td>{faculty.experience}</td>
                </tr>
                <tr>
                  <td className="table-heading">Area of Interest</td>
                  <td>{faculty.areaOfInterest.join(", ")}</td>
                </tr>
                <tr>
                  <td className="table-heading">JNTU ID</td>
                  <td>{faculty.jntuId}</td>
                </tr>
              </tbody>
            </table>
            <button className="delete-button" onClick={() => deleteFaculty(faculty.facultyId)}>Delete</button>
          </div>
        ))
      ) : (
        <p className="no-faculties">No faculties found for {department}</p>
      )}
    </div>
  );
};

export default FacultyList;