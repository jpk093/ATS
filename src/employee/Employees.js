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
  const [searchResults, setSearchResults] = useState([])
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showEmployees, setShowEmployees] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false); // Added state
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSearchActive) {
      handleSearchEmployees(page);
    } else {
      fetchEmployees(page);
    }
  }, [page, isSearchActive]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${appUrl}/employees?page=${page}&limit=${limit}`);
      setEmployees(response.data.employees);
      setTotalPages(Math.ceil(response.data.totalCount/limit))
    } catch (error) {
      console.error("Error fetching employees:", error);
      alert("Failed to fetch employees");
    }
  };

  const handleSearchEmployees =(currentPage = 1) => {
    setLoading(true);
    axios.get(`${appUrl}/employees/search`, {
      params: {
        searchValue: searchQuery,
        page: currentPage,
        pageSize: limit,
      },
    })
    .then((response) => {
      console.log("Search Results:", response.data); // Check response structure
      setSearchResults(response.data.employees || []); // Adjust based on response structure
      setTotalPages(Math.ceil(response.data.totalCount / limit));
      setShowEmployees(true); 
      setPage(currentPage); // Set current page
      
    })
    .catch((error) => {
      console.error("Error searching employees:", error);
      setLoading(false); // Set loading state to false
    });
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
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
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
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
              {/* <button
                type="button"
                onClick={handleBack}
                className="employee-back-button"
              >
                Back
              </button> */}
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
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="searchEmployees"
          >
            Search Employees
          </button>
          {showSearch && (
        <div className="employees-header-right">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="employees-search-text"
          />
          <button
            onClick={() => {
              setIsSearchActive(true); // Set search active
              handleSearchEmployees(page);
            }}
            className="employees-Search-button"
          >
            Search
          </button>
        </div>
      )}
          {showEmployees && employees.length > 0 && (
            <div>
              {/* <h1 className="employeeHeader">All Employees</h1> */}
              <h1 className="employeeHeader">{isSearchActive ? "Search Results" : "All Employees"}</h1>
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
                  {/* {employees.map((employee) => ( */}
                  {(isSearchActive ? searchResults : employees).map((employee, index) => (
                      <tr key={index}>
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
