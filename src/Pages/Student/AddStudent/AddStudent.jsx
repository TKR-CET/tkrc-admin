import React, { useState } from "react";
import axios from "axios";
import "./AddStudent.css"; // Import the professional CSS file

const AddStudent = () => {
  const [formData, setFormData] = useState({
    rollNumber: "",
    name: "",
    fatherName: "",
    mobileNumber: "",
    fatherMobileNumber: "",
    password: "",
    role: "student",
    year: "B.Tech I",
    department: "CSD",
    section: "A",
  });

  const [image, setImage] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      const studentData = {
        rollNumber: formData.rollNumber,
        name: formData.name,
        fatherName: formData.fatherName,
        mobileNumber: formData.mobileNumber,
        fatherMobileNumber: formData.fatherMobileNumber,
        password: formData.password,
        role: formData.role,
      };

      data.append("students", JSON.stringify([studentData]));
      if (image) data.append("image", image);

      const apiUrl = `https://tkrcet-backend-g3zu.onrender.com/Section/${formData.year}/${formData.department}/${formData.section}/students`;

      const response = await axios.post(apiUrl, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResponseMessage(response.data.message);
    } catch (error) {
      setResponseMessage(error.response?.data?.message || "Failed to add student");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Add Student</h2>
      <form onSubmit={handleSubmit} className="student-form">
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
          <select name="department" value={formData.department} onChange={handleChange}>
            <option value="CSD">CSD</option>
            <option value="CSE">CSE</option>
            <option value="EEE">EEE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="CIVIL">CIVIL</option>
            <option value="ME">ME</option>
            <option value="CSM">CSM</option>
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
        <div className="form-group">
          <label>Roll Number:</label>
          <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Father Name:</label>
          <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Mobile Number:</label>
          <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Father's Mobile Number:</label>
          <input type="tel" name="fatherMobileNumber" value={formData.fatherMobileNumber} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Role:</label>
          <input type="text" name="role" value={formData.role} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Profile Image:</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        <button type="submit" className="submit-button">Add Student</button>
      </form>
      {responseMessage && <p className="response-message">{responseMessage}</p>}
    </div>
  );
};

export default AddStudent;