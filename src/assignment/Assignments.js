import React, { useEffect, useState } from "react";
import axios from "axios";
import { appUrl } from "../signUp/SignUp";
import { useNavigate } from "react-router-dom";
import "./Assignments.css";

const Assignments = () => {
  const [formData, setFormData] = useState({
    EmployeeID: "",
    AssignmentTitle: "",
    JobID: "",
    ProjectName: "",
    ProjectType: "",
    Client: "",
    StartDate: "",
    EndDate: "",
    Status: "Active",
    WorkLocationCity: "",
    WorkLocationState: "",
  });
  const [assignments, setAssignments] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showAssignments, setShowAssignments] = useState(false);
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
      handleSearchAssignments(page);
    } else {
      fetchAssignments(page);
    }
  }, [page, isSearchActive]);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(`${appUrl}/assignments?page=${page}&limit=${limit}`);
      setAssignments(response.data.assignments);
      setTotalPages(Math.ceil(response.data.totalCount/limit))
      setLoading(false);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      alert("Failed to fetch assignments");
    }
  };

  const handleSearchAssignments =(currentPage = 1) => {
    setLoading(true);
    axios.get(`${appUrl}/assignments/search`, {
      params: {
        searchValue: searchQuery,
        page: currentPage,
        pageSize: limit,
      },
    })
    .then((response) => {
      console.log("Search Results:", response.data); // Check response structure
      setSearchResults(response.data.assignments || []); // Adjust based on response structure
      setTotalPages(Math.ceil(response.data.totalCount / limit));
      setShowAssignments(true); // Show assignments if not already visible
      setPage(currentPage); // Set current page
    })
    .catch((error) => {
      console.error("Error searching assignments:", error);
      setLoading(false); // Set loading state to false
    });
  }
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
      handleUpdateAssignments(editId);
    } else {
      try {
        const response = await axios.post(`${appUrl}/assignments`, formData);
        console.log("Assignment created:", response.data);
        alert("Assignment created successfully");
        fetchAssignments();
        setShowForm(false);
      } catch (error) {
        console.error("Error creating assignment:", error);
        alert("Failed to create assignment");
      }
    }
  };
  const handleCreateAssignment = () => {
    setShowForm(true);
    setIsEditMode(false);
    setShowAssignments(false);
    setFormData({
      EmployeeID: "",
      AssignmentTitle: "",
      JobID: "",
      ProjectName: "",
      ProjectType: "",
      Client: "",
      StartDate: "",
      EndDate: "",
      Status: "Active",
      WorkLocationCity: "",
      WorkLocationState: "",
    })
  }
  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleUpdateAssignments = async(assignmentId) => {
    try{
        const response = await axios.put(`${appUrl}/assignments/${assignmentId}`, formData);
        console.log("Assignment updated:",response.data);
        alert("Assignment updated successfully");
        fetchAssignments();
        setShowForm(false);
    }catch (error) {
        console.error("Error updating assignment:", error);
        alert("Failed to update assignment");
      }
  }
  const handleDeleteAssignment = async(id) =>{
    try{
    const response = await axios.delete(`${appUrl}/assignments/${id}`);
    console.log("Assignment deleted:", response.data);
      alert("Assignment deleted successfully");
      fetchAssignments();
    } catch (error) {
      console.error("Error deleting assignment:", error);
      alert("Failed to delete assignment");
    }
  }
  const handleFindAllAssignments = () => {
    setShowAssignments(true);
    setShowForm(false);
    fetchAssignments();
  };
  const handleEditAssignment = (assignment) => {
    setFormData({
      EmployeeID: assignment.EmployeeID,
      AssignmentTitle: assignment.AssignmentTitle,
      JobID: assignment.JobID,
      ProjectName: assignment.ProjectName,
      ProjectType: assignment.ProjectType,
      Client: assignment.Client,
      StartDate: assignment.StartDate,
      EndDate: assignment.EndDate,
      Status: assignment.Status,
      WorkLocationCity: assignment.WorkLocationCity,
      WorkLocationState: assignment.WorkLocationState,
    });
    setIsEditMode(true);
    setEditId(assignment.AssignmentID);
    setShowForm(true);
    setShowAssignments(false);
  };
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA");
  };
  const handleJobDetails = (jobId) => {
    console.log("Job ID:", jobId); // Add this line
    navigate(`/jobs/${jobId}`);
  };
  const handleEmployeeDetails = (employeeId) => {
    console.log("Employee ID:", employeeId); // Add this line
    navigate(`/employees/${employeeId}`);
  };

  return (
    <div>
      {showForm ? (
        <div className="add-assignment-form">
          <h1 className="assignmentHeader">
            {isEditMode ? "Edit Assignment" : "Add Assignment"}
          </h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              id="EmployeeID"
              name="EmployeeID"
              placeholder="Employee ID"
              value={formData.EmployeeID}
              onChange={handleChange}
              className="assignment-input-styles"
            />
            <input
              type="text"
              id="AssignmentTitle"
              name="AssignmentTitle"
              placeholder="Assignment Title"
              value={formData.AssignmentTitle}
              onChange={handleChange}
              className="assignment-input-styles"
            />
            <input
              type="text"
              id="JobID"
              name="JobID"
              placeholder="Job ID"
              value={formData.JobID}
              onChange={handleChange}
              className="assignment-input-styles"
            />
            <input
              type="text"
              id="ProjectName"
              name="ProjectName"
              placeholder="Project Name"
              value={formData.ProjectName}
              onChange={handleChange}
              className="assignment-input-styles"
            />
            <input
              type="text"
              id="ProjectType"
              name="ProjectType"
              placeholder="Project Type"
              value={formData.ProjectType}
              onChange={handleChange}
              className="assignment-input-styles"
            />
            <input
              type="text"
              id="Client"
              name="Client"
              placeholder="Client"
              value={formData.Client}
              onChange={handleChange}
              className="assignment-input-styles"
            />
            <label htmlFor="StartDate" className="interview-labelDate">
            StartDate:
            </label>
            <input
              type="date"
              id="StartDate"
              name="StartDate"
              value={formData.StartDate}
              onChange={handleChange}
              className="assignment-Date-styles"
            />
            <label htmlFor="EndDate" className="interview-labelDate">
            EndDate:
            </label>
            <input
              type="date"
              id="EndDate"
              name="EndDate"
              value={formData.EndDate}
              onChange={handleChange}
              className="assignment-Date-styles"
            />
            <input
              type="text"
              id="WorkLocationCity"
              name="WorkLocationCity"
              placeholder="Work Location City"
              value={formData.WorkLocationCity}
              onChange={handleChange}
              className="assignment-input-styles"
            />
            <input
              type="text"
              id="WorkLocationState"
              name="WorkLocationState"
              placeholder="Work Location State"
              value={formData.WorkLocationState}
              onChange={handleChange}
              className="assignment-input-styles"
            />
            <select
              id="Status"
              name="Status"
              value={formData.Status}
              onChange={handleChange}
              className="assignment-select-styles"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <div>
              <button type="submit" className="assignment-submit">
                {isEditMode ? "Update Assignment" : "Add Assignment"}
              </button>
              {/* <button
                type="button"
                onClick={handleBack}
                className="assignment-back-button"
              >
                Back
              </button> */}
              <button
                onClick={() => setShowForm(false)}
                className="assignment-cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <button onClick={handleBack} className="assignment-back-button">
            Back
          </button>
          <button
            onClick={handleCreateAssignment}
            className="assignment-create-button"
          >
            Create Assignment
          </button>
          <button
            onClick={handleFindAllAssignments}
            className="assignment-find-button"
          >
            Find All Assignments
          </button>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="searchAssignments"
          >
            Search Assignments
          </button>
          {showSearch && (
        <div className="assignments-header-right">
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="assignments-search-text"
          />
          <button
            onClick={() => {
              setIsSearchActive(true); // Set search active
              handleSearchAssignments(page);
            }}
            className="assignments-Search-button"
          >
            Search
          </button>
        </div>
      )}
          {showAssignments && assignments.length > 0 && (
            <div>
              {/* <h1 className="assignmentHeader">All Assignments</h1> */}
              <h1 className="title">{isSearchActive ? "Search Results" : "All Assignments"}</h1>
              <table className="assignment-table">
                <thead>
                  <tr>
                    <th>AssignmentID</th>
                    <th>EmployeeID</th>
                    <th>Assignment Title</th>
                    <th>JobID</th>
                    <th>Project Name</th>
                    <th>Project Type</th>
                    <th>Client</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Work Location City</th>
                    <th>Work Location State</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* {assignments.map((assignment) => ( */}
                  {(isSearchActive ? searchResults : assignments).map((assignment, index) => (
                     <tr key={index}>
                      <td>{assignment.AssignmentID}</td>
                      <td onClick={() => handleEmployeeDetails(assignment.EmployeeID)} style={{ cursor: 'pointer', color: 'blue' }}>{assignment.EmployeeID}</td>
                      {/* <td>{assignment.EmployeeID}</td> */}
                      <td>{assignment.AssignmentTitle}</td>
                      <td onClick={() => handleJobDetails(assignment.JobID)} style={{ cursor: 'pointer', color: 'blue' }}>{assignment.JobID}</td>
                      {/* <td>{assignment.JobID}</td> */}
                      <td>{assignment.ProjectName}</td>
                      <td>{assignment.ProjectType}</td>
                      <td>{assignment.Client}</td>
                      <td>{formatDate(assignment.StartDate)}</td>
                      <td>{formatDate(assignment.EndDate)}</td>
                      <td>{assignment.Status}</td>
                      <td>{assignment.WorkLocationCity}</td>
                      <td>{assignment.WorkLocationState}</td>
                      <td>
                        <button
                          onClick={() => handleEditAssignment(assignment)}
                          className="assignment-edit-button"
                        >
                          Update
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteAssignment(assignment.AssignmentID)
                          }
                          className="assignment-delete-button"
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

export default Assignments;
