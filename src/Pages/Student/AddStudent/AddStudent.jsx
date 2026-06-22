import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import "./AddStudent.css";

const AddStudent = () => {
  const [excelData, setExcelData] = useState([]);
  const [year, setYear] = useState("B.Tech I");
  const [department, setDepartment] = useState("CSD");
  const [section, setSection] = useState("A");
  const [responseMessage, setResponseMessage] = useState("");
  
  // New state to toggle the format image visibility
  const [showFormatImage, setShowFormatImage] = useState(false);

  const token = localStorage.getItem("token"); // Retrieve JWT token

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      setExcelData(data);
    };

    reader.readAsBinaryString(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!excelData.length) {
      setResponseMessage("Please upload an Excel file.");
      return;
    }

    try {
      const studentsWithExtraData = excelData.map((student) => ({
        ...student,
        role: "student",
      }));

      const formData = new FormData();
      formData.append("students", JSON.stringify(studentsWithExtraData));

      // UPDATED TO VERCEL URL
      const apiUrl = `https://tkrc-backend.vercel.app/Section/${year}/${department}/${section}/students`;

      const response = await axios.post(apiUrl, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}` // Attach Token
        },
      });

      setResponseMessage(response.data.message || "Students added successfully!");
    } catch (err) {
      setResponseMessage(err.response?.data?.message || "Failed to add students.");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Bulk Add Students</h2>
      <form onSubmit={handleSubmit} className="student-form">
        <div className="form-group">
          <label>Year:</label>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="B.Tech I">B.Tech I</option>
            <option value="B.Tech II">B.Tech II</option>
            <option value="B.Tech III">B.Tech III</option>
            <option value="B.Tech IV">B.Tech IV</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Department:</label>
          <select value={department} onChange={(e) => setDepartment(e.target.value)}>
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
          <select value={section} onChange={(e) => setSection(e.target.value)}>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Upload Excel File:</label>
          <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} required />
          <small style={{display: "block", marginTop: "5px", color: "#888"}}>
            <span 
              onClick={() => setShowFormatImage(!showFormatImage)} 
              style={{ color: "#007BFF", cursor: "pointer", textDecoration: "underline", fontWeight: "bold" }}
            >
              {showFormatImage ? "Hide Expected Format" : "View Expected Format"}
            </span>
          </small>
          
          {/* Conditionally rendered image container */}
          {showFormatImage && (
            <div style={{ marginTop: "15px", textAlign: "center" }}>
              <p style={{ fontSize: "12px", color: "#555", marginBottom: "5px" }}>Reference Image for Excel Columns:</p>
              <img 
                src="https://res.cloudinary.com/dppiuypop/image/upload/v1782106360/uploads/wehrog173lwlfwjszoqg.png" 
                alt="Expected Student Excel Format" 
                style={{ maxWidth: "100%", height: "auto", border: "1px solid #ccc", borderRadius: "4px" }}
              />
            </div>
          )}
        </div>
        
        <button type="submit" className="submit-button">Upload Students</button>
      </form>
      
      {responseMessage && (
        <p className="response-message" style={{color: responseMessage.includes("success") ? "green" : "red"}}>
          {responseMessage}
        </p>
      )}
    </div>
  );
};

export default AddStudent;
