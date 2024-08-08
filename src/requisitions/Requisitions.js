import React, { useEffect, useState } from "react";
import axios from "axios";
import { appUrl } from "../signUp/SignUp";
import { useNavigate } from "react-router-dom";
import "./Requisitions.css";
import JobList from "../List/JobList";
import { Link } from 'react-router-dom';

const Requisitions = () => {
  const [formData, setFormData] = useState({
    JobID: "",
    JobTitle: "",
    Department: "",
    HiringManager: "",
    CreatedBy: "",
    CreationDate: "",
    Status: "OPEN",
    Priority: "MEDIUM",
    PositionType: "FULL_TIME",
    RequiredSkills: "",
    EducationRequirements: "",
    ExperienceRequirements: "",
    JobDescription: "",
    ApprovalDate: "",
    ClosedDate: "",
  });
  const [requisitions, SetRequisitions] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showForm, setShowForm] = useState(false); // State to control form visibility
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showRequisitions, setShowRequisitions] = useState(false); // New state to control requisitions table visibility
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false); // Added state
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const navigate = useNavigate();

  // //Fetch all requisitions on component mount
  useEffect(() => {
    if (isSearchActive) {
      handleSearchRequisitions(page);
    } else {
      fetchRequisitions(page);
    }
  }, [page, isSearchActive]);

  //Fetch all requisitions from backend
  const fetchRequisitions = async () => {
    try {
      const response = await axios.get(
        `${appUrl}/requisitions?page=${page}&limit=${limit}`
      );
      SetRequisitions(response.data.requisitions);
      setTotalPages(Math.ceil(response.data.totalCount / limit));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching requisitions:", error);
      alert("Failed to fetch requisitions");
    }
  };

  const handleSearchRequisitions =(currentPage = 1) => {
    setLoading(true);
    axios.get(`${appUrl}/requisitions/search`, {
      params: {
        searchValue: searchQuery,
        page: currentPage,
        pageSize: limit,
      },
    })
    .then((response) => {
      console.log("Search Results:", response.data); // Check response structure
      setSearchResults(response.data.requisitions || []); // Adjust based on response structure
      setTotalPages(Math.ceil(response.data.totalCount / limit));
      setShowRequisitions(true); // Show requisitions if not already visible
      setPage(currentPage); // Set current page
      //setTotalCount(response.data.totalCount || 0); // Set total count for pagination
      //setLoading(false); // Set loading state to false
    })
    .catch((error) => {
      console.error("Error searching requisitions:", error);
      setLoading(false); // Set loading state to false
    });
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };
  // Handle form submission to create a new requisition
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditMode) {
      handleUpdate(editId);
    } else {
      try {
        const response = await axios.post(`${appUrl}/requisitions`, formData);
        console.log("Requisition created:", response.data);
        alert("Requisition created successfully"); // Display alert upon success
        fetchRequisitions();
        setShowForm(false);
      } catch (error) {
        console.error("Error creating requisition:", error);
        alert("Failed to create requisition"); // Display alert upon failure
      }
    }
  };
  // Display the form for adding new requisitions
  const handleCreateRequisitions = () => {
    setShowForm(true); // Display the form
    setIsEditMode(false);
    setShowRequisitions(false);
    setFormData({
      JobID: "",
      JobTitle: "",
      Department: "",
      HiringManager: "",
      CreatedBy: "",
      CreationDate: "",
      Status: "OPEN",
      Priority: "MEDIUM",
      PositionType: "FULL_TIME",
      RequiredSkills: "",
      EducationRequirements: "",
      ExperienceRequirements: "",
      JobDescription: "",
      ApprovalDate: "",
      ClosedDate: "",
    });
  };
  // Navigate back to dashboard or previous page
  const handleBack = () => {
    navigate("/dashboard"); // Adjust this route as needed
  };

  // Utility function to format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA");
  };
  // Update an existing requisition
  const handleUpdate = async (requisitionId) => {
    try {
      const response = await axios.put(
        `${appUrl}/requisitions/${requisitionId}`,
        formData
      );
      console.log("Requisition updated:", response.data);
      alert("Requisition updated successfully");
      // Refresh requisitions after updating
      fetchRequisitions();
      setShowForm(false);
    } catch (error) {
      console.error("Error updating requisition:", error);
      alert("Failed to update requisition");
    }
  };
  // Delete a requisition
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${appUrl}/requisitions/${id}`);
      console.log("Requisition deleted:", response.data);
      alert("Requisition deleted successfully");
      // Refresh requisitions after deleting
      fetchRequisitions();
    } catch (error) {
      console.error("Error deleting requisition:", error);
      alert("Failed to delete requisition");
    }
  };
  // Handle showing all requisitions
  const handleFindAllRequisitions = () => {
    setShowRequisitions(true);
    setShowForm(false);
    fetchRequisitions();
  };
  const handleEditRequisitions = (requisition) => {
    setFormData({
      JobID: requisition.JobID,
      JobTitle: requisition.JobTitle,
      Department: requisition.Department,
      HiringManager: requisition.HiringManager,
      CreatedBy: requisition.CreatedBy,
      CreationDate: formatDate(requisition.CreationDate),
      Status: requisition.Status,
      Priority: requisition.Priority,
      PositionType: requisition.PositionType,
      RequiredSkills: requisition.RequiredSkills,
      EducationRequirements: requisition.EducationRequirements,
      ExperienceRequirements: requisition.ExperienceRequirements,
      JobDescription: requisition.JobDescription,
      ApprovalDate: formatDate(requisition.ApprovalDate),
      ClosedDate: formatDate(requisition.ClosedDate),
    });
    setIsEditMode(true);
    setEditId(requisition.RequisitionID);
    setShowForm(true);
    setShowRequisitions(false);
  };
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  // const handleJobDetails = (jobId) => {
  //   axios
  //     .get(`${appUrl}/jobs/${jobId}`)
  //     .then((response) => {
  //       console.log("Job details:", response.data);
  //       setSelectedJob(response.data); // Set the selected job details
  //       setShowJobModal(true); // Show the job modal
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching job details:", error);
  //     });
  // };
  // const closeModal = () => {
  //   setShowJobModal(false);
  //   setSelectedJob(null);
  // };
  const handleJobDetails = (jobId) => {
    console.log("Job ID:", jobId); // Add this line
    navigate(`/jobs/${jobId}`);
  };
  
  return (
    <div>
      {showForm ? (
        <div className="add-requisition-form">
          <h1 className="header">
            {isEditMode ? "Edit Requisitions" : "Add Requisitions"}
          </h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              id="JobID"
              name="JobID"
              placeholder="Job ID"
              value={formData.JobID}
              onChange={handleChange}
              className="input-styles"
            />
            <input
              type="text"
              id="JobTitle"
              name="JobTitle"
              placeholder="Job Title"
              value={formData.JobTitle}
              onChange={handleChange}
              className="input-styles"
            />

            <input
              type="text"
              id="Department"
              name="Department"
              placeholder="Department"
              value={formData.Department}
              onChange={handleChange}
              className="input-styles"
            />
            <input
              type="text"
              id="HiringManager"
              name="HiringManager"
              placeholder="Hiring Manager"
              value={formData.HiringManager}
              onChange={handleChange}
              className="input-styles"
            />
            <input
              type="text"
              id="CreatedBy"
              name="CreatedBy"
              placeholder="Created By"
              value={formData.CreatedBy}
              onChange={handleChange}
              className="input-styles"
            />
            <label htmlFor="CreationDate" className="labelDate">
              CreationDate:
            </label>
            <input
              type="date"
              id="CreationDate"
              name="CreationDate"
              placeholder="Creation Date"
              value={formData.CreationDate}
              onChange={handleChange}
              className="inputDate-styles"
            />
            <label htmlFor="Status" className="labelStatus">
              Status:
            </label>
            <select
              id="Status"
              name="Status"
              value={formData.Status}
              onChange={handleChange}
              className="select-styles"
            >
              <option value="OPEN">OPEN</option>
              <option value="CLOSED">CLOSED</option>
              <option value="PENDING">PENDING</option>
            </select>
            <label htmlFor="Priority" className="labelPriority">
              Priority:
            </label>
            <select
              id="Priority"
              name="Priority"
              value={formData.Priority}
              onChange={handleChange}
              className="select-styles"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
            <label htmlFor="PositionType" className="labelPositionType">
              PositionType:
            </label>
            <select
              id="PositionType"
              name="PositionType"
              value={formData.PositionType}
              onChange={handleChange}
              className="selectPositionType-styles"
            >
              <option value="FULL_TIME">FULL_TIME</option>
              <option value="PART_TIME">PART_TIME</option>
              <option value="CONTRACT">CONTRACT</option>
            </select>
            <textarea
              id="RequiredSkills"
              name="RequiredSkills"
              placeholder="Required Skills"
              value={formData.RequiredSkills}
              onChange={handleChange}
              className="input-textarea"
            ></textarea>
            <input
              type="text"
              id="EducationRequirements"
              name="EducationRequirements"
              placeholder="Education Requirements"
              value={formData.EducationRequirements}
              onChange={handleChange}
              className="input-styles"
            />
            <textarea
              id="ExperienceRequirements"
              name="ExperienceRequirements"
              placeholder="Experience Requirements"
              value={formData.ExperienceRequirements}
              onChange={handleChange}
              className="input-textarea"
            ></textarea>
            <textarea
              id="JobDescription"
              name="JobDescription"
              placeholder="Job Description"
              value={formData.JobDescription}
              onChange={handleChange}
              className="input-textarea"
            ></textarea>
            <label htmlFor="ApprovalDate" className="labelDate">
              ApprovalDate:
            </label>
            <input
              type="date"
              id="ApprovalDate"
              name="ApprovalDate"
              placeholder="ApprovalDate"
              value={formData.ApprovalDate}
              onChange={handleChange}
              className="inputDate-styles"
            />
            <label htmlFor="ClosedDate" className="labelDate">
              ClosedDate:
            </label>
            <input
              type="date"
              id="ClosedDate"
              name="ClosedDate"
              placeholder="ClosedDate"
              value={formData.ClosedDate}
              onChange={handleChange}
              className="inputDate-styles"
            />
            <div>
              <button type="submit" className="AddRequisition">
                {isEditMode ? "Update Requisition" : "Add Requisition"}
              </button>
              {/* <button type="button" onClick={handleBack} className="backButton">
                Back
              </button> */}
              <button onClick={() => setShowForm(false)} className="requisition-cancle-button">Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <button type="button" onClick={handleBack} className="backButton">
            Back
          </button>
          <button
            onClick={handleCreateRequisitions}
            className="CreateRequisitions"
          >
            Create Requisitions
          </button>
          <button
            onClick={handleFindAllRequisitions}
            className="findRequisitions"
          >
            Find All Requisitions
          </button>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="searchRequisitions"
          >
            Search Requisitions
          </button>
        </div>
      )}
      {showSearch && (
        <div className="requisitions-header-right">
          <input
            type="text"
            placeholder="Search requisitions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="requisitions-Search-text"
          />
          <button
            onClick={() => {
              setIsSearchActive(true); // Set search active
              handleSearchRequisitions(page);
            }}
            className="requisitions-Search-button"
          >
            Search
          </button>
        </div>
      )}
      
      {showRequisitions && requisitions.length > 0 && (
        <div>
          {/* <h1 className="headerRequisitions">All Requisitions</h1> */}
          <h1 className="title">{isSearchActive ? "Search Results" : "All Requisitions"}</h1>
          <table className="requisition-table">
            <thead>
              <tr>
                <th>RequisitionID</th>
                <th>JobID</th>
                <th>JobTitle</th>
                <th>Department</th>
                <th>HiringManager</th>
                <th>CreatedBy</th>
                <th>CreationDate</th>
                <th>Status</th>
                <th>Priority</th>
                <th>PositionType</th>
                <th>RequiredSkills</th>
                <th>EducationRequirements</th>
                <th>ExperienceRequirements</th>
                <th>JobDescription</th>
                <th>ApprovalDate</th>
                <th>ClosedDate</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            {(isSearchActive ? searchResults : requisitions).map((requisition, index) => (
              // {requisitions.map((requisition, index) => (
                <tr key={index}>
                  <td>{requisition.RequisitionID}</td>
                  <td onClick={() => handleJobDetails(requisition.JobID)} style={{ cursor: 'pointer', color: 'blue' }}>{requisition.JobID}</td>
                  <td>{requisition.JobTitle}</td>
                  <td>{requisition.Department}</td>
                  <td>{requisition.HiringManager}</td>
                  <td>{requisition.CreatedBy}</td>
                  <td>{formatDate(requisition.CreationDate)}</td>
                  <td>{requisition.Status}</td>
                  <td>{requisition.Priority}</td>
                  <td>{requisition.PositionType}</td>
                  <td>{requisition.RequiredSkills}</td>
                  <td>{requisition.EducationRequirements}</td>
                  <td>{requisition.ExperienceRequirements}</td>
                  <td>{requisition.JobDescription}</td>
                  <td>{formatDate(requisition.ApprovalDate)}</td>
                  <td>{formatDate(requisition.ClosedDate)}</td>
                  <td>
                    <button
                      onClick={() => handleEditRequisitions(requisition)}
                      className="update-requisition-button"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(requisition.RequisitionID)}
                      className="delete-requisition-button"
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
  );
};
export default Requisitions;
