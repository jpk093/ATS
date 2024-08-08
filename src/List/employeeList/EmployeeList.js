import React, { useEffect, useState } from "react";
import axios from "axios";
import { appUrl } from "../../signUp/SignUp"; // Assuming appUrl is defined in this module
import { useNavigate, useParams } from "react-router-dom";
import "./EmployeeList.css"; // Make sure the CSS file name matches

const EmployeeList = () => {
    const { employeeId } = useParams(); // Get employeeId from URL parameters
  const [employee, setEmployee] = useState(null); // Set employee data state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(`${appUrl}/employees/${employeeId}`);
        setEmployee(response.data); // Set the employee data to the state
      } catch (error) {
        console.error("Error fetching employee details:", error);
      }
    };

    fetchEmployee();
  }, [employeeId]);

  const handleBack = () => {
    navigate("/dashboard"); // Adjust this route as needed
  };

  const handleEditEmployee = () => {
    // Navigate to an edit page with employee details
    navigate(`/employees`);
  };

  const handleDeleteEmployee = async () => {
      navigate("/employees");
  };

  if (!employee) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>
        <button type="button" onClick={handleBack} className="employees-backButton">
          Back
        </button>
      </div>
      <table className="EmployeesDetails-table">
        <thead>
          <tr>
            <th>EmployeeID</th>
            <th>EmployeeName</th>
            <th>Email</th>
            <th>EmploymentType</th>
            <th>Department</th>
            <th>ReportingTo</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{employee.EmployeeID}</td>
            <td>{employee.EmployeeName}</td>
            <td>{employee.Email}</td>
            <td>{employee.EmploymentType}</td>
            <td>{employee.Department}</td>
            <td>{employee.ReportingTo}</td>
            <td>
              <button
                onClick={handleEditEmployee}
                className="update-employee-button"
              >
                Update
              </button>
              <button
                onClick={handleDeleteEmployee}
                className="delete-employee-button"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeList;