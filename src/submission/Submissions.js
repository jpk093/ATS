import React, { useEffect, useState } from "react";
import axios from "axios";
import { appUrl } from "../signUp/SignUp";
import { useNavigate } from "react-router-dom";
import "./Submissions.css";

const Submissions = () => {
  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    CandidateID: "",
    JobID: "",
    JobTitle: "",
    Client: "",
    Status: "SUBMITTED",
    CandidateCTCType: "",
    CandidateCTC: "",
    City: "",
    State: "",
    JobHiringType: "",
    Submitter: "",
    SubmittedDate: "",
    ReasonForRejection: "",
    RejectionComments: "",
  });
  const [submissions, setSubmissions] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showForm, setShowForm] = useState(null);
  const [isEditMode, SetIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false); // Added state
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();


 useEffect(() => {
  if (isSearchActive) {
    handleSearchSubmissions(page);
  } else {
    fetchSubmissions(page);
  }
}, [page, isSearchActive]);

  //Fetch all submissions from backend
  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(`${appUrl}/submissions?page=${page}&limit=${limit}`);
      setSubmissions(response.data.submissions);
      setTotalPages(Math.ceil(response.data.totalCount/limit))
      setLoading(false);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      alert("Failed to fetch submissions");
    }
  };
const handleSearchSubmissions = (currentPage = 1) => {
  setLoading(true);
    axios.get(`${appUrl}/submissions/search`, {
      params: {
        searchValue: searchQuery,
        page: currentPage,
        pageSize: limit,
      },
    })
    .then((response) => {
      console.log("Search Results:", response.data); // Check response structure
      setSearchResults(response.data.submissions || []); // Adjust based on response structure
      setTotalPages(Math.ceil(response.data.totalCount / limit));
      setShowSubmissions(true); // Show requisitions if not already visible
      setPage(currentPage); // Set current page
    })
    .catch((error) => {
      console.error("Error searching submissions:", error);
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

  //Handle from submissions to create or update a submissions
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditMode) {
      handleUpdateSubmission(editId);
    } else {
      try {
        const response = await axios.post(`${appUrl}/submissions`, formData);
        console.log("Submission created:", response.data);
        alert("Submission created successfully");
        fetchSubmissions();
        setShowForm(false);
      } catch (error) {
        console.error("Error creating submission:", error);
        alert("Failed to create submission");
      }
    }
  };

  //Display the form for adding new submissions
  const handleCreateSubmissions = () => {
    setShowForm(true);
    SetIsEditMode(false);
    setShowSubmissions(false);
    setFormData({
      FirstName: "",
      LastName: "",
      CandidateID: "",
      JobID: "",
      JobTitle: "",
      Client: "",
      Status: "SUBMITTED",
      CandidateCTCType: "",
      CandidateCTC: "",
      City: "",
      State: "",
      JobHiringType: "",
      Submitter: "",
      SubmittedDate: "",
      ReasonForRejection: "",
      RejectionComments: "",
    });
  };
  // Navigate back to dashboard or previous page
  const handleBack = () => {
    navigate("/dashboard");
  };
  //Utility function to format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA");
  };
  //Update an existing submission
  const handleUpdateSubmission = async (submissionId) => {
    try {
      const response = await axios.put(
        `${appUrl}/submissions/${submissionId}`,
        formData
      );
      console.log("Submission updated:", response.data);
      alert("Submission updated successfully");
      fetchSubmissions();
      setShowForm(false);
    } catch (error) {
      console.error("Error updating submission:", error);
      alert("Failed to update submission");
    }
  };
  //Delete a submission
  const handleDeleteSubmission = async (id) => {
    try {
      const response = await axios.delete(`${appUrl}/submissions/${id}`);
      console.log("Submission deleted:", response.data);
      alert("Sbmission deleted successfully");
      fetchSubmissions();
    } catch (error) {
      console.error("Error deleting submission:", error);
      alert("Failed to delete submission");
    }
  };
  //Handle showing all submissions
  const handleFindAllSubmissions = () => {
    setShowSubmissions(true);
    setShowForm(false);
    fetchSubmissions();
  };
  //Handle editing a submission
  const handleEditSubmissions = (submission) => {
    setFormData({
      FirstName: submission.FirstName,
      LastName: submission.LastName,
      CandidateID: submission.CandidateID,
      JobID: submission.JobID,
      JobTitle: submission.JobTitle,
      Client: submission.Client,
      Status: submission.Status,
      CandidateCTCType: submission.CandidateCTCType,
      CandidateCTC: submission.CandidateCTC,
      City: submission.City,
      State: submission.State,
      JobHiringType: submission.JobHiringType,
      Submitter: submission.Submitter,
      SubmittedDate: formatDate(submission.SubmittedDate),
      ReasonForRejection: submission.ReasonForRejection,
      RejectionComments: submission.RejectionComments,
    });
    SetIsEditMode(true);
    setEditId(submission.SubmissionID);
    setShowForm(true);
    setShowSubmissions(false);
  };
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  return (
    <div>
      {showForm ? (
        <div className="add-submission-form">
          <h1 className="submissionHeader">
            {isEditMode ? "Edit Submission" : "Add Submission"}
          </h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              id="FirstName"
              name="FirstName"
              placeholder="First Name"
              value={formData.FirstName}
              onChange={handleChange}
              className="submission-input-styles"
            />
            <input
              type="text"
              id="LastName"
              name="LastName"
              placeholder="Last Name"
              value={formData.LastName}
              onChange={handleChange}
              className="submission-input-styles"
            />
            <input
              type="text"
              id="CandidateID"
              name="CandidateID"
              placeholder="Candidate ID"
              value={formData.CandidateID}
              onChange={handleChange}
              className="submission-input-styles"
            />
            <input
              type="text"
              id="JobID"
              name="JobID"
              placeholder="Job ID"
              value={formData.JobID}
              onChange={handleChange}
              className="submission-input-styles"
            />
            <input
              type="text"
              id="JobTitle"
              name="JobTitle"
              placeholder="Job Title"
              value={formData.JobTitle}
              onChange={handleChange}
              className="submission-input-styles"
            />
            <input
              type="text"
              id="Client"
              name="Client"
              placeholder="Client"
              value={formData.Client}
              onChange={handleChange}
              className="submission-input-styles"
            />
            <label htmlFor="SubmittedDate" className="SubmittedDate">
              Submitted Date:
            </label>
            <input
              type="date"
              id="SubmittedDate"
              name="SubmittedDate"
              value={formData.SubmittedDate}
              onChange={handleChange}
              className="inputSubmissionDate-styles"
            />
            <label htmlFor="Status" className="labelStatus">
              Status:
            </label>
            <select
              id="Status"
              name="Status"
              value={formData.Status}
              onChange={handleChange}
              className="submission-select-styles"
            >
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="INTERVIEWED">INTERVIEWED</option>
              <option value="OFFERED">OFFERED</option>
              <option value="HIRED">HIRED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
            <input
              type="text"
              id="CandidateCTCType"
              name="CandidateCTCType"
              placeholder="Candidate CTC Type"
              value={formData.CandidateCTCType}
              onChange={handleChange}
              className="submission-input-styles"
            />
            <input
              type="text"
              id="CandidateCTC"
              name="CandidateCTC"
              placeholder="Candidate CTC"
              value={formData.CandidateCTC}
              onChange={handleChange}
              className="submission-input-styles"
            />
            <input
              type="text"
              id="City"
              name="City"
              placeholder="City"
              value={formData.City}
              onChange={handleChange}
              className="submission-input-styles"
            />
            <input
              type="text"
              id="State"
              name="State"
              placeholder="State"
              value={formData.State}
              onChange={handleChange}
              className="submission-input-styles"
            />
            <input
              type="text"
              id="JobHiringType"
              name="JobHiringType"
              placeholder="Job Hiring Type"
              value={formData.JobHiringType}
              onChange={handleChange}
              className="submission-input-styles"
            />
            <input
              type="text"
              id="Submitter"
              name="Submitter"
              placeholder="Submitter"
              value={formData.Submitter}
              onChange={handleChange}
              className="submission-input-styles"
            />
            <textarea
              id="ReasonForRejection"
              name="ReasonForRejection"
              placeholder="Reason For Rejection"
              value={formData.ReasonForRejection}
              onChange={handleChange}
              className="submission-input-textarea"
            ></textarea>
            <textarea
              id="RejectionComments"
              name="RejectionComments"
              placeholder="Rejection Comments"
              value={formData.RejectionComments}
              onChange={handleChange}
              className="submission-input-textarea"
            ></textarea>
            <div className="submissionBtton">
              <button type="submit" className="AddSubmission">
                {isEditMode ? "Update Submission" : "Add Submission"}
              </button>
              {/* <button type="button" onClick={handleBack} className="backButton">
                Back
              </button> */}
              <button onClick={() => setShowForm(false)} className="Submission-cancle-button">Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="backButtonSubmission"
          >
            Back
          </button>
          <button
            onClick={handleCreateSubmissions}
            className="createSubmissions"
          >
            Create Submissions
          </button>
          <button
            onClick={handleFindAllSubmissions}
            className="findSubmissions"
          >
            Find All Submissions
          </button>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="searchSubmissions"
          >
            Search Submissions
          </button>
        </div>
      )}
      {showSearch && (
        <div className="submissions-header-right">
          <input
            type="text"
            placeholder="Search submissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={() => {
              setIsSearchActive(true); // Set search active
              handleSearchSubmissions(page);
            }}
            className="submissions-Search-button"
          >
            Search
          </button>
        </div>
      )}
      {showSubmissions && submissions.length > 0 && (
        <div>
          {/* <h1 className="handleSubmissions">All Submissions</h1> */}
          <h1 className="handleSubmissions">{isSearchActive ? "Search Results" : "All Submissions"}</h1>
          <table className="submission-table">
            <thead>
              <tr>
                <th>SubmissionID</th>
                <th>FirstName</th>
                <th>LastName</th>
                <th>CandidateID</th>
                <th>JobID</th>
                <th>JobTitle</th>
                <th>Client</th>
                <th>SubmittedDate</th>
                <th>Status</th>
                <th>CandidateCTCType</th>
                <th>CandidateCTC</th>
                <th>City</th>
                <th>State</th>
                <th>JobHiringType</th>
                <th>Submitter</th>
                <th>ReasonForRejection</th>
                <th>RejectionComments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
            {(isSearchActive ? searchResults : submissions).map((submission, index) => (
              //{submissions.map((submission, index) => (
                <tr key={index}>
                  <td>{submission.SubmissionID}</td>
                  <td>{submission.FirstName}</td>
                  <td>{submission.LastName}</td>
                  <td>{submission.CandidateID}</td>
                  <td>{submission.JobID}</td>
                  <td>{submission.JobTitle}</td>
                  <td>{submission.Client}</td>
                  <td>{formatDate(submission.SubmittedDate)}</td>
                  <td>{submission.Status}</td>
                  <td>{submission.CandidateCTCType}</td>
                  <td>{submission.CandidateCTC}</td>
                  <td>{submission.City}</td>
                  <td>{submission.State}</td>
                  <td>{submission.JobHiringType}</td>
                  <td>{submission.Submitter}</td>
                  <td>{submission.ReasonForRejection}</td>
                  <td>{submission.RejectionComments}</td>
                  <td>
                    <button
                      onClick={() => handleEditSubmissions(submission)}
                      className="update-button-submission"
                    >
                      Update
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteSubmission(submission.SubmissionID)
                      }
                      className="delete-button-submission"
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
export default Submissions;
