import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FetchStudents.css"; // Import CSS file

const FetchStudents = () => {
  const [formData, setFormData] = useState({
    year: "B.Tech I",
    department: "CSD",
    section: "A",
  });

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [userDepartment, setUserDepartment] = useState(""); // Stores user's department
  const [userRole, setUserRole] = useState(""); // Stores user's role

  useEffect(() => {
    const fetchUserDetails = async () => {
      const loginId = localStorage.getItem("facultyId");
      if (loginId) {
        try {
          const response = await axios.get(
            `https://tkrcet-backend-g3zu.onrender.com/faculty/facultyprofile/${loginId}`
          );
          const { department, role } = response.data;
          setUserDepartment(department.toUpperCase());
          setUserRole(role.toUpperCase()); // Normalize role to uppercase

          // Restrict department selection if user doesn't have "ALL" access
          if (department.toUpperCase() !== "ALL") {
            setFormData((prevData) => ({
              ...prevData,
              department: department.toUpperCase(),
            }));
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      }
    };

    fetchUserDetails();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    setDeleteMessage("");
    setStudents([]);

    const apiUrl = `https://tkrcet-backend-g3zu.onrender.com/Section/${formData.year}/${formData.department}/${formData.section}/students`;

    try {
      const response = await axios.get(apiUrl);
      if (response.data.students) {
        setStudents(response.data.students);
      } else {
        setError("No students found.");
      }
    } catch (err) {
      setError("Failed to fetch students. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (rollNumber) => {
    if (!window.confirm(`Are you sure you want to delete student ${rollNumber}?`)) return;

    try {
      await axios.delete(`https://tkrcet-backend-g3zu.onrender.com/Section/students/${rollNumber}`);
      setStudents(students.filter((student) => student.rollNumber !== rollNumber));
      setDeleteMessage(`Student ${rollNumber} deleted successfully.`);
    } catch (err) {
      setError(`Failed to delete student ${rollNumber}.`);
    }
  };

  return (
    <div className="fetch-container">
      <h2 className="fetch-title">Student Details</h2>
      
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
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
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

      <button onClick={fetchStudents} className="fetch-button">Submit</button>

      {/* Messages */}
      {loading && <p className="loading-message">Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      {deleteMessage && <p className="success-message">{deleteMessage}</p>}

      {/* Display Students */}
      {students.length > 0 && (
        <div className="student-list">
          <h3>Student List</h3>
          {students.map((student) => (
            <div key={student._id} className="student-table-container">
              <table className="student-table">
                <thead>
                  <tr>
                    <th colSpan="3">Student Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Roll Number</strong></td>
                    <td>{student.rollNumber}</td>
                    <td rowSpan="4">
                      <img src={student.image} alt="Student" className="student-img" />
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Name</strong></td>
                    <td>{student.name}</td>
                  </tr>
                  <tr>
                    <td><strong>Father Name</strong></td>
                    <td>{student.fatherName}</td>
                  </tr>
                  <tr>
                    <td><strong>Mobile</strong></td>
                    <td>{student.mobileNumber}</td>
                  </tr>
                  <tr>
                    <td><strong>Father Mobile</strong></td>
                    <td>{student.fatherMobileNumber}</td>
                    {/* Hide delete button if user is HOD */}
                    {userRole !== "HOD" && (
                      <td className="delete-cell">
                        <button onClick={() => deleteStudent(student.rollNumber)} className="delete-button">
                          ❌ Delete
                        </button>
                      </td>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FetchStudents;