import React from "react";
import { Routes, Route } from "react-router-dom";
import Homepage from "./Homepage/Homepage.jsx";
import Mainpage from "./Mainpage/Mainpage.jsx";

import AddFacultyForm from "./Pages/Faculty/AddFaculty/AddFacultyForm.jsx";
import FacultyList from "./Pages/Faculty/FacultyDetails/FacultyList.jsx";
import FacultyTable from "./Pages/Faculty/FacultyTable/FacultyTable.jsx";
import AddStudent from "./Pages/Student/AddStudent/AddStudent.jsx";
import FetchStudents from "./Pages/Student/StudentDetails/FetchStudents.jsx";
import FetchTimetable from "./Pages/Section/SectionTimetable/FetchTimetable.jsx";
import AttendanceSummary from "./Pages/Attendance/SectionAttendance/AttendanceSummary.jsx";
import GrantPermission from "./Pages/EditOption/GrantPermission.jsx";
import PermissionList from "./Pages/EditOption/PermissionList.jsx";
import StudentAttendance from "./Pages/Attendance/StudentAttendance/StudentAttendance.jsx";
import DailyAttendance from "./Pages/Attendance/DailyAttendance/DailyAttendance.jsx";
import Sample from "./Componentents/Sample.jsx";

function App() {
  return (
    <>
      <Routes>
        {/* Homepage route */}
        <Route path="/" element={<Homepage />} />

        {/* Mainpage layout with nested routes */}
        <Route path="/main/*" element={<Mainpage />}>
          {/* Default route inside /main/ */}
          <Route index element={<Sample />} />
          
          {/* Other nested routes */}
          <Route path="addfaculty" element={<AddFacultyForm />} />
          <Route path="facultylist" element={<FacultyList />} />
          <Route path="facultytable" element={<FacultyTable />} />
          <Route path="addstudent" element={<AddStudent />} />
          <Route path="studentDetails" element={<FetchStudents />} />
          <Route path="studentTable" element={<FetchTimetable />} />
          <Route path="attendance" element={<AttendanceSummary />} />
          <Route path="grant" element={<GrantPermission />} />
          <Route path="student" element={<StudentAttendance />} />
          <Route path="daily" element={<DailyAttendance />} />
          <Route path="permission" element={<PermissionList />} />
          <Route path="sample" element={<Sample />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;