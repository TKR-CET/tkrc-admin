import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import "./AddStudent.css"; // Reusing your existing form CSS

const AddSectionTimetable = () => {
  const [excelData, setExcelData] = useState([]);
  const [year, setYear] = useState("B.Tech I");
  const [department, setDepartment] = useState("CSD");
  const [section, setSection] = useState("A");
  const [responseMessage, setResponseMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem("token"); // Retrieve Admin JWT token

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
      setResponseMessage("Please upload a valid Excel file first.");
      return;
    }

    setIsLoading(true);
    setResponseMessage("");

    try {
      // Parse the flat Excel data into the required nested JSON structure
      const formattedTimetable = [];

      excelData.forEach((row) => {
        if (!row.Day) return; // Skip empty rows

        const periods = [];
        // Loop through 7 potential periods in the row
        for (let i = 1; i <= 7; i++) {
          const subject = row[`Period ${i} Subject`];
          const facultyId = row[`Period ${i} FacultyId`];

          if (subject) {
            periods.push({
              periodNumber: i,
              subject: subject,
              facultyId: facultyId ? String(facultyId).trim() : null,
            });
          }
        }

        if (periods.length > 0) {
          formattedTimetable.push({
            day: row.Day.trim(),
            periods: periods,
          });
        }
      });

      if (formattedTimetable.length === 0) {
        throw new Error("Could not parse periods. Ensure your Excel headers match the required format.");
      }

      // Send to the upgraded auto-syncing backend
      const apiUrl = `https://tkrc-backend.vercel.app/Section/${year}/${department}/${section}/timetable`;

      const response = await axios.post(apiUrl, formattedTimetable, {
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
      });

      setResponseMessage(response.data.message || "Timetable Auto-Synced successfully!");
    } catch (err) {
      setResponseMessage(err.response?.data?.message || err.message || "Failed to upload timetable.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Upload Section Timetable</h2>
      <p style={{textAlign: "center", marginBottom: "20px", color: "#555"}}>
        Uploading this timetable will automatically assign classes to the respective Faculty's schedules.
      </p>
      
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
            Expected Headers: <b>Day, Period 1 Subject, Period 1 FacultyId, Period 2 Subject...</b>
          </small>
        </div>

        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? "Syncing..." : "Upload & Sync Timetable"}
        </button>
      </form>

      {responseMessage && (
        <p className="response-message" style={{color: responseMessage.includes("success") ? "green" : "red"}}>
          {responseMessage}
        </p>
      )}
    </div>
  );
};

export default AddSectionTimetable;
