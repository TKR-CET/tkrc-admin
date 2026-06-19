import React, { useEffect, useState } from "react";
import "./PermissionList.css";

const PermissionsList = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDepartment, setUserDepartment] = useState("");

  const token = localStorage.getItem("token"); // Retrieve JWT token
  const loginId = localStorage.getItem("loginId") || localStorage.getItem("facultyId");

  useEffect(() => {
    fetchUserDepartment();
  }, []);

  // Consolidated countdown timer hook
  useEffect(() => {
    const interval = setInterval(() => {
      setPermissions((prevPermissions) =>
        prevPermissions.map((perm) => ({
          ...perm,
          timeRemaining: calculateTimeRemaining(perm.endTime),
        }))
      );
    }, 1000); // Update countdown every second

    return () => clearInterval(interval);
  }, []); // Run once on mount, updates state cleanly

  const calculateTimeRemaining = (endTime) => {
    if (!endTime) return "Expired";

    const endDateTime = new Date(endTime).getTime(); // Use only endTime since it's a full timestamp
    const now = new Date().getTime();
    const diff = endDateTime - now;

    if (isNaN(endDateTime) || diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const fetchUserDepartment = async () => {
    if (loginId) {
      try {
        const response = await fetch(
          `https://tkrc-backend.vercel.app/admin/facultyprofile/${loginId}`, {
            headers: { Authorization: `Bearer ${token}` } // Attach Token
          }
        );
        const data = await response.json();
        if (data && data.department) {
          const department = data.department.toUpperCase(); 
          setUserDepartment(department);
          fetchPermissions(department);
        }
      } catch (error) {
        console.error("Error fetching user department:", error);
      }
    }
  };

  const fetchPermissions = async (department) => {
    try {
      const response = await fetch(
        "https://tkrc-backend.vercel.app/Attendance/edit-permissions", {
          headers: { Authorization: `Bearer ${token}` } // Attach Token
        }
      );
      const data = await response.json();
      if (data.success) {
        const updatedPermissions = data.data.map((perm) => {
          return {
            ...perm,
            timeRemaining: calculateTimeRemaining(perm.endTime), // Only use `endTime`
          };
        });
        setPermissions(
          department === "ALL" ? updatedPermissions : updatedPermissions.filter((perm) => perm.department === department)
        );
      } else {
        setError("Failed to fetch data");
      }
    } catch (err) {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const deletePermission = async (id) => {
    if (!window.confirm("Are you sure you want to delete this permission?")) return;

    try {
      const response = await fetch(
        `https://tkrc-backend.vercel.app/Attendance/permissions/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` } // Attach Token
        }
      );
      const data = await response.json();
      if (data.success) {
        setPermissions((prev) => prev.filter((permission) => permission._id !== id));
      } else {
        alert("Failed to delete permission");
      }
    } catch (err) {
      alert("Error deleting permission");
    }
  };

  const cancelPermission = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this permission?")) return;

    try {
      const response = await fetch(
        `https://tkrc-backend.vercel.app/Attendance/permissions/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` } // Attach Token
        }
      );
      const data = await response.json();
      if (data.success) {
        setPermissions((prev) => prev.filter((permission) => permission._id !== id));
      } else {
        alert("Failed to cancel permission");
      }
    } catch (err) {
      alert("Error canceling permission");
    }
  };

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="container">
      <h2 className="title">Edit Permissions</h2>
      <div className="table-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th>Faculty ID</th>
              <th>Year</th>
              <th>Department</th>
              <th>Section</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Time Remaining for Edit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((permission) => (
              <tr key={permission._id}>
                <td>{permission.facultyId}</td>
                <td>{permission.year}</td>
                <td>{permission.department}</td>
                <td>{permission.section}</td>
                <td>{new Date(permission.startDate).toLocaleDateString()}</td>
                <td>{new Date(permission.endDate).toLocaleDateString()}</td>

                <td className={permission.timeRemaining === "Expired" ? "expired" : "countdown"}>
                  {permission.timeRemaining}
                </td>
                <td>
                  {permission.timeRemaining === "Expired" ? (
                    <button className="delete-btn" onClick={() => deletePermission(permission._id)}>
                      Delete
                    </button>
                  ) : (
                    <button className="cancel-btn" onClick={() => cancelPermission(permission._id)}>
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PermissionsList;
