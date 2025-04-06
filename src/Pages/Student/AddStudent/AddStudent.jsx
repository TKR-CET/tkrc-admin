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

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
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

      const apiUrl = `https://tkrcet-backend-g3zu.onrender.com/Section/${year}/${department}/${section}/students`;

      const response = await axios.post(apiUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
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
        </div>
        <button type="submit" className="submit-button">Upload Students</button>
      </form>
      {responseMessage && <p className="response-message">{responseMessage}</p>}
    </div>
  );
};

export default AddStudent;
