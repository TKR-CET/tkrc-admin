import React, { useState } from "react";
import axios from "axios";
import "./AddFacultyForm.css"; 

const AddFacultyForm = () => {
  // 1. Cleaned up state: No more 'timetable' field here!
  const [formData, setFormData] = useState({
    name: "",
    facultyId: "",
    role: "faculty", 
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

    // Validate 10-digit phone number dynamically
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

      // 2. FIXED API URL: Points to the correct /faculty/addfaculty route!
      const response = await axios.post(
        "https://tkrc-backend.vercel.app/faculty/addfaculty", 
        data,
        { 
          headers: { 
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}` 
          } 
        }
      );

      setResponseMessage(response.data.message || "Faculty created! Timetable will populate when Section is uploaded.");
      
      // Clear form on success
      setFormData({
        name: "", facultyId: "", role: "faculty", department: "", subject: "", designation: "",
        qualification: "", experience: "", areaOfInterest: "", jntuId: "", phoneNumber: "", password: "",
      });
      setImage(null);
      
      // Clear out the file input visually
      document.getElementById("image").value = "";

    } catch (error) {
      console.error("Upload Error:", error);
      setResponseMessage(error.response?.data?.message || "Error adding faculty. Please check your connection.");
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
            {name === "phoneNumber" && phoneError && <p className="error-message" style={{color: "red", fontSize: "0.85rem", marginTop: "5px"}}>{phoneError}</p>}
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

      {responseMessage && (
        <p className="response-message" style={{ color: responseMessage.includes("Error") ? "red" : "green", marginTop: "15px", textAlign: "center", fontWeight: "bold" }}>
          {responseMessage}
        </p>
      )}
    </div>
  );
};

export default AddFacultyForm;
