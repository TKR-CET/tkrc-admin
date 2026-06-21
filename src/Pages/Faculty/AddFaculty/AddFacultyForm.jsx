import React, { useState } from "react";
import axios from "axios";
import "./AddFacultyForm.css"; 

const AddFacultyForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    facultyId: "",
    role: "faculty", // Defaulted to faculty
    department: "",
    subject: "",
    designation: "",
    qualification: "",
    experience: "",
    areaOfInterest: "",
    jntuId: "",
    phoneNumber: "", 
    password: "",
  });

  const [image, setImage] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const token = localStorage.getItem("token"); // Retrieve Admin JWT token

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(value)) {
        setPhoneError("Invalid phone number format (must be 10 digits)");
      } else {
        setPhoneError("");
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (phoneError) return; 

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (image) data.append("image", image);

      // UPDATED TO SECURE VERCEL URL
      const response = await axios.post(
        "https://tkrc-backend.vercel.app/admin/addfacultyprofile", 
        data,
        { 
          headers: { 
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}` 
          } 
        }
      );

      setResponseMessage(response.data.message || "Faculty created! Timetable will populate on Section upload.");
      
      // Optional: Clear form on success
      setFormData({
        name: "", facultyId: "", role: "faculty", department: "", subject: "", designation: "",
        qualification: "", experience: "", areaOfInterest: "", jntuId: "", phoneNumber: "", password: "",
      });
      setImage(null);
    } catch (error) {
      setResponseMessage(error.response?.data?.message || "Error adding faculty");
    }
  };

  return (
    <div className="add-faculty-container">
      <h2>Add Faculty Profile</h2>
      <form onSubmit={handleSubmit} className="faculty-form">
        {[
          { label: "Name", name: "name", type: "text" },
          { label: "Faculty ID", name: "facultyId", type: "text" },
          { label: "Role", name: "role", type: "text" },
          { label: "Department", name: "department", type: "text" },
          { label: "Subject", name: "subject", type: "text" },
          { label: "Designation", name: "designation", type: "text" },
          { label: "Qualification", name: "qualification", type: "text" },
          { label: "Experience (in years)", name: "experience", type: "text" },
          { label: "Area of Interest (comma-separated)", name: "areaOfInterest", type: "text" },
          { label: "JNTU ID", name: "jntuId", type: "text" },
          { label: "Phone Number", name: "phoneNumber", type: "text" }, 
          { label: "Password", name: "password", type: "password" },
        ].map(({ label, name, type }) => (
          <div className="input-group" key={name}>
            <label htmlFor={name}>{label}:</label>
            <input
              type={type}
              id={name}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              required
            />
            {name === "phoneNumber" && phoneError && <p className="error-message" style={{color: "red"}}>{phoneError}</p>}
          </div>
        ))}

        <div className="input-group">
          <label htmlFor="image">Profile Image:</label>
          <input type="file" id="image" accept="image/*" onChange={handleImageChange} />
        </div>

        <button type="submit" className="submit-btn" disabled={phoneError}>
          Create Faculty Profile
        </button>
      </form>

      {responseMessage && <p className="response-message">{responseMessage}</p>}
    </div>
  );
};

export default AddFacultyForm;
