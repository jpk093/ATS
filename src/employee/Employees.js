import React, { useEffect, useState } from "react";
import axios from "axios";
import { appUrl } from "../signUp/SignUp";
import { useNavigate } from "react-router-dom";
import "./Employees.css";

const Employees = () => {
  const [formData, setFormData] = useState({
    EmployeeName: "",
    Email: "",
    EmploymentType: "",
    Department: "",
    ReportingTo: "",
  });
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showEmployees, setShowEmployees] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, [page]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${appUrl}/employees?page=${page}&limit=10`);
      setEmployees(response.data.employees);
      setTotalPages(Math.ceil(response.data.totalCount/10))
    } catch (error) {
      console.error("Error fetching employees:", error);
      alert("Failed to fetch employees");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditMode) {
      handleUpdateEmployee(editId);
    } else {
      try {
        const response = await axios.post(`${appUrl}/employees`, formData);
        console.log("Employee created:", response.data);
        alert("Employee created successfully");
        fetchEmployees();
        setShowForm(false);
      } catch (error) {
        console.error("Error creating employee:", error);
        alert("Failed to create employee");
      }
    }
  };
  const handleCreateEmployee = () => {
    setShowForm(true);
    setIsEditMode(false);
    setShowEmployees(false);
    setFormData({
      EmployeeName: "",
      Email: "",
      EmploymentType: "",
      Department: "",
      ReportingTo: "",
    });
  };
  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleUpdateEmployee = async (empployeeId) => {
    try {
      const response = await axios.put(
        `${appUrl}/employees/${empployeeId}`,
        formData
      );
      console.log("Employee updated:", response.data);
      alert("Employee updated successfully");
      fetchEmployees();
      setShowForm(false);
    } catch (error) {
      console.error("Error updating employee:", error);
      alert("Failed to update employee");
    }
  };
  const handleDeleteEmployee = async (id) => {
    try {
      const response = await axios.delete(`${appUrl}/employees/${id}`);
      console.log("Employee deleted:", response.data);
      alert("Employee deleted successfully");
      fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Failed to delete employee");
    }
  };

  const handleFindAllEmployees = () => {
    setShowEmployees(true);
    setShowForm(false);
    fetchEmployees();
  };

  const handleEditEmployee = (employee) => {
    setFormData({
      EmployeeName: employee.EmployeeName,
      Email: employee.Email,
      EmploymentType: employee.EmploymentType,
      Department: employee.Department,
      ReportingTo: employee.ReportingTo,
    });
    setIsEditMode(true);
    setEditId(employee.EmployeeID);
    setShowForm(true);
    setShowEmployees(false);
  };
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  return (
    <div>
      {showForm ? (
        <div className="add-employee-form">
          <h1 className="employeeHeader">
            {isEditMode ? "Edit Employee" : "Add Employee"}
          </h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              id="EmployeeName"
              name="EmployeeName"
              placeholder="Employee Name"
              value={formData.EmployeeName}
              onChange={handleChange}
              className="employee-input-styles"
            />
            <input
              type="email"
              id="Email"
              name="Email"
              placeholder="Email"
              value={formData.Email}
              onChange={handleChange}
              className="employee-input-styles"
            />
            <input
              type="text"
              id="EmploymentType"
              name="EmploymentType"
              placeholder="Employment Type"
              value={formData.EmploymentType}
              onChange={handleChange}
              className="employee-input-styles"
            />
            <input
              type="text"
              id="Department"
              name="Department"
              placeholder="Department"
              value={formData.Department}
              onChange={handleChange}
              className="employee-input-styles"
            />
            <input
              type="text"
              id="ReportingTo"
              name="ReportingTo"
              placeholder="Reporting To"
              value={formData.ReportingTo}
              onChange={handleChange}
              className="employee-input-styles"
            />
            <div>
              <button type="submit" className="employee-submit">
                {isEditMode ? "Update Employee" : "Add Employee"}
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="employee-back-button"
              >
                Back
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="employee-cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <button onClick={handleBack} className="employee-back-button">
            Back
          </button>
          <button
            onClick={handleCreateEmployee}
            className="employee-create-button"
          >
            Create Employee
          </button>
          <button
            onClick={handleFindAllEmployees}
            className="employee-find-button"
          >
            Find All Employees
          </button>

          {showEmployees && (
            <div>
              <h1 className="employeeHeader">All Employees</h1>
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>EmployeeID</th>
                    <th>Employee Name</th>
                    <th>Email</th>
                    <th>Employment Type</th>
                    <th>Department</th>
                    <th>Reporting To</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.EmployeeID}>
                      <td>{employee.EmployeeID}</td>
                      <td>{employee.EmployeeName}</td>
                      <td>{employee.Email}</td>
                      <td>{employee.EmploymentType}</td>
                      <td>{employee.Department}</td>
                      <td>{employee.ReportingTo}</td>
                      <td>
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          className="employee-edit-button"
                        >
                          Update
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteEmployee(employee.EmployeeID)
                          }
                          className="employee-delete-button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div>
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </button>
            <span> Page {page} of {totalPages} </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default Employees;
