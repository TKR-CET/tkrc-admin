import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "./FacultyTable.css";

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
    phoneNumber: "",
    password: "",
  });

  const [timetable, setTimetable] = useState([]);
  const [image, setImage] = useState(null);
  const [timetableError, setTimetableError] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [phoneError, setPhoneError] = useState("");

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

  const handleTimetableUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    const data = evt.target.result;
    const workbook = XLSX.read(data, { type: "binary" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet);

    const formatted = json.map((row) => {
      const day = row.Day;
      const periods = [];

      for (let i = 1; i <= 6; i++) {
        const raw = row[`P${i}`];
        if (raw && typeof raw === "string") {
          const [subject, year, department, section] = raw.split("-").map((val) => val?.trim());
          if (subject && year && department && section) {
            periods.push({
              periodNumber: i,
              subject,
              year,
              department,
              section,
            });
          }
        }
      }

      return { day, periods };
    });

    setTimetable(formatted);
    setTimetableError("");
  };

  reader.onerror = () => {
    setTimetableError("Failed to read the file.");
  };

  reader.readAsBinaryString(file);
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (phoneError) return;

    if (!Array.isArray(timetable) || timetable.length === 0) {
      setTimetableError("Please upload a valid timetable Excel file.");
      return;
    }

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      data.append("timetable", JSON.stringify(timetable));
      if (image) data.append("image", image);

      const response = await axios.post(
        "https://tkrcet-backend-g3zu.onrender.com/faculty/addfaculty",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setResponseMessage(response.data.message);
    } catch (err) {
      setResponseMessage(err.response?.data?.message || "Error adding faculty.");
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
          { label: "Experience", name: "experience", type: "text" },
          { label: "Area of Interest", name: "areaOfInterest", type: "text" },
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
            {name === "phoneNumber" && phoneError && <p className="error-message">{phoneError}</p>}
          </div>
        ))}

        <div className="input-group">
          <label htmlFor="timetable">Upload Timetable (XLS/XLSX):</label>
          <input type="file" accept=".xlsx, .xls" onChange={handleTimetableUpload} />
          {timetableError && <p className="error-message">{timetableError}</p>}
        </div>

        <div className="input-group">
          <label htmlFor="image">Profile Image:</label>
          <input type="file" id="image" accept="image/*" onChange={handleImageChange} />
        </div>

        <button type="submit" className="submit-btn" disabled={phoneError || timetableError}>
          Add Faculty
        </button>
      </form>

      {responseMessage && <p className="response-message">{responseMessage}</p>}
    </div>
  );
};

export default AddFacultyForm;
