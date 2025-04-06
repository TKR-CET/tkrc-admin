import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FacultyTable.css";

const FacultyTable = () => {
    const [department, setDepartment] = useState("EEE"); // Default Department
    const [facultyList, setFacultyList] = useState([]);
    const [facultyId, setFacultyId] = useState("");
    const [facultyDetails, setFacultyDetails] = useState(null);
    const [timetable, setTimetable] = useState([]);
    const [error, setError] = useState("");
    const [userDepartment, setUserDepartment] = useState("");

    useEffect(() => {
        fetchUserDepartment();
    }, []);

    useEffect(() => {
        if (userDepartment) {
            fetchFacultyByDepartment(userDepartment !== "ALL" ? userDepartment : department);
        }
    }, [userDepartment, department]);

    const fetchUserDepartment = async () => {
        const facultyId = localStorage.getItem("facultyId");
        if (facultyId) {
            try {
                const response = await axios.get(
                    `https://tkrcet-backend-g3zu.onrender.com/faculty/facultyprofile/${facultyId}`
                );
                const department = response.data.department.toUpperCase();
                setUserDepartment(department);
                setDepartment(department !== "ALL" ? department : "CSD"); // Default to first available
            } catch (error) {
                console.error("Error fetching user department:", error);
            }
        }
    };

    const fetchFacultyByDepartment = async (dept) => {
        try {
            const response = await axios.get(
                `https://tkrcet-backend-g3zu.onrender.com/faculty/department/${dept}`
            );
            setFacultyList(response.data || []);
            setFacultyId(""); // Reset faculty selection
        } catch (error) {
            console.error("Error fetching faculty list:", error);
            setFacultyList([]);
        }
    };

    const fetchFacultyData = async () => {
        setError("");
        setFacultyDetails(null);
        setTimetable([]);

        if (!facultyId) {
            setError("Please select a faculty.");
            return;
        }

        try {
            // Fetch Faculty Profile
            const facultyResponse = await axios.get(
                `https://tkrcet-backend-g3zu.onrender.com/faculty/facultyId/${facultyId}`
            );
            setFacultyDetails(facultyResponse.data);

            // Fetch Faculty Timetable
            const timetableResponse = await axios.get(
                `https://tkrcet-backend-g3zu.onrender.com/faculty/facultyId/${facultyId}/timetable`
            );

            if (timetableResponse.data?.timetable?.length > 0) {
                setTimetable(timetableResponse.data.timetable);
            } else {
                setError("No timetable data available for this faculty.");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to fetch faculty data. Please try again.");
        }
    };

    const handleImageError = (e) => {
        e.target.src = "/images/logo.png";
    };

    // Merge consecutive periods with the same subject
    const processPeriods = (periods) => {
        const mergedPeriods = [];
        let i = 0;

        while (i < periods.length) {
            let span = 1;
            while (
                i + span < periods.length &&
                periods[i] &&
                periods[i + span] &&
                periods[i].subject === periods[i + span].subject
            ) {
                span++;
            }

            mergedPeriods.push({ period: periods[i], span });
            i += span;
        }

        return mergedPeriods;
    };

    const currentYear = new Date().getFullYear(); // Get the current year

    return (
        <div className="faculty-table-container">
            <h2>Faculty Timetable</h2>

            {/* Department Selection */}
            <div className="input-container">
                <label>Department:</label>
                <select 
                    value={department} 
                    onChange={(e) => setDepartment(e.target.value)}
                    disabled={userDepartment !== "ALL"}
                >
                    {userDepartment === "ALL" ? (
                        <>
                            <option value="CSD">CSD</option>
                            <option value="CSE">CSE</option>
                            <option value="EEE">EEE</option>
                            <option value="ECE">ECE</option>
                            <option value="CIVIL">CIVIL</option>
                            <option value="ME">ME</option>
                            <option value="CSM">CSM</option>
                        </>
                    ) : (
                        <option>{userDepartment}</option>
                    )}
                </select>
            </div>

            {/* Faculty Selection Dropdown */}
            <div className="input-container">
                <label>Faculty:</label>
                <select value={facultyId} onChange={(e) => setFacultyId(e.target.value)}>
                    <option value="">Select Faculty</option>
                    {facultyList.map((faculty) => (
                        <option key={faculty.facultyId} value={faculty.facultyId}>
                            {faculty.name} ({faculty.facultyId})
                        </option>
                    ))}
                </select>
                <button onClick={fetchFacultyData}>View Timetable</button>
            </div>

            {error && <p className="error-message">{error}</p>}

            {/* Faculty Details Section */}
            {facultyDetails && (
                <section className="faculty-profile">
                    <table className="profile-table">
                        <tbody>
                            <tr>
                                <td className="label">Name</td>
                                <td>{facultyDetails.name || "N/A"}</td>
                                <td className="profile-image-cell" rowSpan={3}>
                                    <img
                                        src={facultyDetails.image || "/images/logo.png"}
                                        alt={`${facultyDetails.name || "Faculty"} Profile`}
                                        className="profile-image"
                                        onError={handleImageError}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="label">Department</td>
                                <td>{facultyDetails.department || "N/A"}</td>
                            </tr>
                            <tr>
                                <td className="label">Designation</td>
                                <td>{facultyDetails.designation || "N/A"}</td>
                            </tr>
                        </tbody>
                    </table>
                </section>
            )}

            {/* Timetable Section */}
            <h2 className="timetable-heading">Time Table - ODD Semester ({currentYear}-{currentYear + 1})</h2>
            <section className="timetable-content">
                {timetable.length === 0 ? (
                    <p className="no-data">No timetable data available.</p>
                ) : (
                    <table className="timetable-table">
                        <thead>
                            <tr>
                                <th>DAY</th>
                                <th>9:40-10:40</th>
                                <th>10:40-11:40</th>
                                <th>11:40-12:40</th>
                                <th>12:40-1:20</th>
                                <th>1:20-2:20</th>
                                <th>2:20-3:20</th>
                                <th>3:20-4:20</th>
                            </tr>
                        </thead>
                        <tbody>
                            {timetable.map((dayData, index) => {
                                const periods = [...Array(7)].map((_, i) =>
                                    dayData.periods.find((p) => p.periodNumber === i + 1) || null
                                );

                                const periodsBeforeLunch = processPeriods(periods.slice(0, 3));
                                const periodsAfterLunch = processPeriods(periods.slice(4));

                                return (
                                    <tr key={index}>
                                        <td className="day-cell">{dayData.day || "N/A"}</td>
                                        {periodsBeforeLunch.map((merged, i) => (
                                            <td key={i} colSpan={merged.span}>{merged.period ? `${merged.period.subject} (${merged.period.year}, ${merged.period.section})` : ""}</td>
                                        ))}
                                        <td className="lunch-cell">LUNCH</td>
                                        {periodsAfterLunch.map((merged, i) => (
                                            <td key={i + 4} colSpan={merged.span}>{merged.period ? `${merged.period.subject} (${merged.period.year}, ${merged.period.section})` : ""}</td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
};

export default FacultyTable;
