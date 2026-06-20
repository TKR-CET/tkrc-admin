import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FetchStudents.css"; 

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
  const [userDepartment, setUserDepartment] = useState(""); 
  const [userRole, setUserRole] = useState(""); 

  const token = localStorage.getItem("token"); // Retrieve JWT token
  const loginId = localStorage.getItem("loginId") || localStorage.getItem("facultyId");

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (loginId) {
        try {
          const response = await axios.get(
            `https://tkrc-backend.vercel.app/admin/facultyprofile/${loginId}`, {
              headers: { Authorization: `Bearer ${token}` } // Attach Token
            }
          );
          const { department, role } = response.data;
          setUserDepartment(department.toUpperCase());
          setUserRole(role.toUpperCase()); 

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
  }, [loginId, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    setDeleteMessage("");
    setStudents([]);

    // UPDATED TO VERCEL URL
    const apiUrl = `https://tkrc-backend.vercel.app/Section/${formData.year}/${formData.department}/${formData.section}/students`;

    try {
      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` } // Attach Token
      });
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
      // UPDATED TO VERCEL URL
      await axios.delete(`https://tkrc-backend.vercel.app/Section/students/${rollNumber}`, {
        headers: { Authorization: `Bearer ${token}` } // Attach Token
      });
      setStudents(students.filter((student) => student.rollNumber !== rollNumber));
      setDeleteMessage(`Student ${rollNumber} deleted successfully.`);
    } catch (err) {
      setError(`Failed to delete student ${rollNumber}.`);
    }
  };

  return (
    <div className="fetch-container">
      <h2 className="fetch-title">Student Details</h2>

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

      {loading && <p className="loading-message">Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      {deleteMessage && <p className="success-message">{deleteMessage}</p>}

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
