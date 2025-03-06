import React, { useState } from "react";
import axios from "axios";
import "./AddFacultyForm.css"; // Import professional styles

const AddFacultyForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    facultyId: "",
    role: "",
    department: "",
    subject: "",
    designation: "",
    qualification: "",
    experience: "",
    areaOfInterest: "",
    jntuId: "",
    phoneNumber: "", // New field added
    password: "",
    timetable: "",
  });

  const [image, setImage] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [timetableError, setTimetableError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate phone number format (Optional, assumes a 10-digit number)
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

    if (phoneError) return; // Prevent submission if phone number is invalid

    try {
      const parsedTimetable = JSON.parse(formData.timetable);
      if (!Array.isArray(parsedTimetable)) {
        setTimetableError("Timetable must be an array");
        return;
      }
      setTimetableError("");

      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (image) data.append("image", image);

      const response = await axios.post(
        "https://tkrcet-backend-g3zu.onrender.com/faculty/addfaculty",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setResponseMessage(response.data.message);
    } catch (error) {
      if (error instanceof SyntaxError) {
        setTimetableError("Invalid JSON format for timetable");
      } else {
        setResponseMessage(error.response?.data?.message || "Error adding faculty");
      }
    }
  };

  return (
    <div className="add-faculty-container">
      <h2>Add Faculty</h2>
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
          { label: "Phone Number", name: "phoneNumber", type: "text" }, // New field
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
            {name === "phoneNumber" && phoneError && <p className="error-message">{phoneError}</p>}
          </div>
        ))}

        <div className="input-group">
          <label htmlFor="timetable">Timetable:</label>
          <textarea
            id="timetable"
            name="timetable"
            value={formData.timetable}
            onChange={handleChange}
            placeholder='[{ "day": "Monday", "periods": [...] }, ...]'
            required
          />
          {timetableError && <p className="error-message">{timetableError}</p>}
        </div>

        <div className="input-group">
          <label htmlFor="image">Profile Image:</label>
          <input type="file" id="image" accept="image/*" onChange={handleImageChange} />
        </div>

        <button type="submit" className="submit-btn" disabled={timetableError || phoneError}>
          Add Faculty
        </button>
      </form>

      {responseMessage && <p className="response-message">{responseMessage}</p>}
    </div>
  );
};

export default AddFacultyForm;