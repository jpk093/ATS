import React, { useEffect, useState } from "react";
import axios from "axios";
import { appUrl } from "../signUp/SignUp";
import { useNavigate } from "react-router-dom";
import "./Interviews.css";

const Interviews = () => {
  const [formData, setFormData] = useState({
    Title: "",
    InterviewStartDate: "",
    InterviewEndDate: "",
    InterviewTime: "",
    TimeZone: "",
    InterviewDateTime: "",
    AccountName: "",
    Interviewer: "",
    InterviewStage: "",
    SubmissionID: "",
    SubmissionStage: "",
    EndClient: "",
    InterviewRecipient: "",
    ScheduledBy: "",
    Status: "Scheduled",
    Location: "",
    ScheduledOn: "",
    DueIn: "",
  });
  const [interviews, setInterviews] = useState([]);
  const [showForm, setShowForm] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showInterviews, setShowInterviews] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
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
      handleSearchInterviews(page);
    } else {
      fetchInterviews(page);
    }
  }, [page, isSearchActive]);

  //Fetch all interviews fron backend
  const fetchInterviews = async () => {
    try {
      const response = await axios.get(`${appUrl}/interviews?page=${page}&limit=${limit}`);
      setInterviews(response.data.interviews);
      setTotalPages(Math.ceil(response.data.totalCount/limit))
    } catch (error) {
      console.error("Error fetching interviews:", error);
      alert("Failed to fetch interviews");
    }
  };

  const handleSearchInterviews = (currentPage = 1) => {
    setLoading(true);
    axios.get(`${appUrl}/interviews/search`, {
      params: {
        searchValue: searchQuery,
        page: currentPage,
        pageSize: limit,
      },
    })
    .then((response) => {
      console.log("Search Results:", response.data); // Check response structure
      setSearchResults(response.data.interviews || []); // Adjust based on response structure
      setTotalPages(Math.ceil(response.data.totalCount / limit));
      setShowInterviews(true); // Show requisitions if not already visible
      setPage(currentPage); // Set current page
      //setTotalCount(response.data.totalCount || 0); // Set total count for pagination
      //setLoading(false); // Set loading state to false
    })
    .catch((error) => {
      console.error("Error searching interviews:", error);
      setLoading(false); // Set loading state to false
    });
  }
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  //Handle from submissions to create or update an interview
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditMode) {
      handleUpdateInterview(editId);
    } else {
      try {
        const response = await axios.post(`${appUrl}/interviews`, formData);
        console.log("INterview created:", response.data);
        alert("Interview created successfully");
        fetchInterviews();
        setShowForm(false);
      } catch (error) {
        console.error("Error creating interview:", error);
        alert("Failed to create interview");
      }
    }
  };

  //Display the form for adding new interview
  const handleCreateInterviews = () => {
    setShowForm(true);
    setIsEditMode(false);
    setShowInterviews(false);
    setFormData({
      Title: "",
      InterviewStartDate: "",
      InterviewEndDate: "",
      InterviewTime: "",
      TimeZone: "",
      InterviewDateTime: "",
      AccountName: "",
      Interviewer: "",
      InterviewStage: "",
      SubmissionID: "",
      SubmissionStage: "",
      EndClient: "",
      InterviewRecipient: "",
      ScheduledBy: "",
      Status: "Scheduled",
      Location: "",
      ScheduledOn: "",
      DueIn: "",
    });
  };

  //Navigate back to dashboard or previous page
  const handleBack = () => {
    navigate("/dashboard");
  };

  // Utility function to format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA");
  };
 // Utility function to format times
const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };
  

    // Utility function to format date and time
    const formatDateTime = (dateTimeString) => {
        const dateTime = new Date(dateTimeString);
        return dateTime.toLocaleString("en-CA", {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }).replace(",", "");
      };

  //Update an existing interview
  const handleUpdateInterview = async (interviewId) => {
    try {
      const response = await axios.put(
        `${appUrl}/interviews/${interviewId}`,
        formData
      );
      console.log("Interview updated:", response.data);
      alert("Interview updated successfully");
      fetchInterviews();
      setShowForm(false);
    } catch (error) {
      console.error("Error updating interview:", error);
      alert("Failed to update interview");
    }
  };

  //Delete an interview
  const handleDeleteInterview = async (id) => {
    try {
      const response = await axios.delete(`${appUrl}/interviews/${id}`);
      console.log("Interview deleted:", response.data);
      alert("Interview deleted successfully");
      fetchInterviews();
    } catch (error) {
      console.error("Error deleting interview:", error);
      alert("Failed to delete interview");
    }
  };

  //fetch all interviews and display
  const handleFindAllInterviews = () => {
    setShowInterviews(true);
    setShowForm(false);
    fetchInterviews();
  };

  //Edit an existing interview
  const handleEditInterview = (interview) => {
    setFormData({
      Title: interview.Title,
      InterviewStartDate: interview.InterviewStartDate,
      InterviewEndDate: interview.InterviewEndDate,
      InterviewTime: interview.InterviewTime,
      TimeZone: interview.TimeZone,
      InterviewDateTime: interview.InterviewDateTime,
      AccountName: interview.AccountName,
      Interviewer: interview.Interviewer,
      InterviewStage: interview.InterviewStage,
      SubmissionID: interview.SubmissionID,
      SubmissionStage: interview.SubmissionStage,
      EndClient: interview.EndClient,
      InterviewRecipient: interview.InterviewRecipient,
      ScheduledBy: interview.ScheduledBy,
      Status: interview.Status,
      Location: interview.Location,
      ScheduledOn: interview.ScheduledOn,
      DueIn: interview.DueIn,
    });
    setIsEditMode(true);
    setEditId(interview.InterviewID);
    setShowForm(true);
    setShowInterviews(false);
  };
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  const handleSubmissionDetails = (submissionId) => {
    console.log("Submission ID:", submissionId); // Add this line
    navigate(`/submissions/${submissionId}`);
  };
  
  return (
    <div>
      {showForm ? (
        <div className="add-interview-form">
          <h1 className="interviewHeader">
            {isEditMode ? "Edit Interview" : "Add Interview"}
          </h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              id="Title"
              name="Title"
              placeholder="Title"
              value={formData.Title}
              onChange={handleChange}
              className="interview-input-styles"
            />
            <label htmlFor="InterviewStartDate" className="interview-labelDate">
            InterviewStartDate:
            </label>
            <input
              type="date"
              id="InterviewStartDate"
              name="InterviewStartDate"
              placeholder="Interview Start Date"
              value={formData.InterviewStartDate}
              onChange={handleChange}
              className="interview-date-styles"
            />
            <label htmlFor="InterviewEndDate" className="interview-labelDate">
            InterviewEndDate:
            </label>
            <input
              type="date"
              id="InterviewEndDate"
              name="InterviewEndDate"
              placeholder="Interview End Date"
              value={formData.InterviewEndDate}
              onChange={handleChange}
              className="interview-date-styles"
            />
            <label htmlFor="InterviewTime" className="interview-labelDate">
            InterviewTime:
            </label>
            <input
              type="time"
              id="InterviewTime"
              name="InterviewTime"
              placeholder="Interview Time"
              value={formData.InterviewTime}
              onChange={handleChange}
              className="interview-time-styles"
            />
            <input
              type="text"
              id="TimeZone"
              name="TimeZone"
              placeholder="Time Zone"
              value={formData.TimeZone}
              onChange={handleChange}
              className="interview-input-styles"
            />
            <label htmlFor="InterviewDateTime" className="interview-labelDate">
            InterviewDateTime:
            </label>
            <input
              type="datetime-local"
              id="InterviewDateTime"
              name="InterviewDateTime"
              placeholder="Interview DateTime"
              value={formData.InterviewDateTime}
              onChange={handleChange}
              className="interview-date-styles"
            />
            <input
              type="text"
              id="AccountName"
              name="AccountName"
              placeholder="Account Name"
              value={formData.AccountName}
              onChange={handleChange}
              className="interview-input-styles"
            />
            <input
              type="text"
              id="Interviewer"
              name="Interviewer"
              placeholder="Interviewer"
              value={formData.Interviewer}
              onChange={handleChange}
              className="interview-input-styles"
            />
            <input
              type="text"
              id="InterviewStage"
              name="InterviewStage"
              placeholder="Interview Stage"
              value={formData.InterviewStage}
              onChange={handleChange}
              className="interview-input-styles"
            />
            <input
              type="text"
              id="SubmissionID"
              name="SubmissionID"
              placeholder="Submission ID"
              value={formData.SubmissionID}
              onChange={handleChange}
              className="interview-input-styles"
            />
            <input
              type="text"
              id="SubmissionStage"
              name="SubmissionStage"
              placeholder="Submission Stage"
              value={formData.SubmissionStage}
              onChange={handleChange}
              className="interview-input-styles"
            />
            <input
              type="text"
              id="EndClient"
              name="EndClient"
              placeholder="End Client"
              value={formData.EndClient}
              onChange={handleChange}
              className="interview-input-styles"
            />
            <input
              type="text"
              id="InterviewRecipient"
              name="InterviewRecipient"
              placeholder="Interview Recipient"
              value={formData.InterviewRecipient}
              onChange={handleChange}
              className="interview-input-styles"
            />
            <input
              type="text"
              id="ScheduledBy"
              name="ScheduledBy"
              placeholder="Scheduled By"
              value={formData.ScheduledBy}
              onChange={handleChange}
              className="interview-input-styles"
            />
            <select
              id="Status"
              name="Status"
              value={formData.Status}
              onChange={handleChange}
              className="interview-select-styles"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <input
              type="text"
              id="Location"
              name="Location"
              placeholder="Location"
              value={formData.Location}
              onChange={handleChange}
              className="interview-input-styles"
            />
            <label htmlFor="ScheduledOn" className="interview-labelDate">
            ScheduledOn:
            </label>
            <input
              type="date"
              id="ScheduledOn"
              name="ScheduledOn"
              placeholder="Scheduled On"
              value={formData.ScheduledOn}
              onChange={handleChange}
              className="interview-Scheduled-styles"
            />
            <input
              type="number"
              id="DueIn"
              name="DueIn"
              placeholder="Due In"
              value={formData.DueIn}
              onChange={handleChange}
              className="interview-input-styles"
            />
            <div>
            <button type="submit" className="interview-submit">{isEditMode ? "Update Interview" : "Add Interview"} </button>
            {/* <button type="button" onClick={handleBack} className="interview-back-button">Back</button> */}
            <button onClick={() => setShowForm(false)} className="interview-cancle-button">Cancel</button>
            </div>
          </form>
          
        </div>
      ) : (
        <div>
          <button onClick={handleBack} className="interview-back-button">
            Back
          </button>
          <button
            onClick={handleCreateInterviews}
            className="interview-create-button"
          >
            Create Interview
          </button>
          <button onClick={handleFindAllInterviews} className="interview-find-button">Find All Interviews</button>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="searchInterviews"
          >
            Search Interviews
          </button>
          {showSearch && (
        <div className="interviews-header-right">
          <input
            type="text"
            placeholder="Search interviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="interview-search-text"
          />
          <button
            onClick={() => {
              setIsSearchActive(true); // Set search active
              handleSearchInterviews(page);
            }}
            className="interviews-Search-button"
          >
            Search
          </button>
        </div>
      )}
          {showInterviews  && interviews.length> 0 &&(
            <div>
              {/* <h1 className="interviewHeader">All Interviews</h1> */}
              <h1 className="title">{isSearchActive ? "Search Results" : "All Interviews"}</h1>
              <table className="interview-table">
                <thead>
                  <tr>
                    <th>InterviewID</th>
                    <th>Title</th>
                    <th>Interview Start Date</th>
                    <th>Interview End Date</th>
                    <th>Interview Time</th>
                    <th>Time Zone</th>
                    <th>Interview DateTime</th>
                    <th>Account Name</th>
                    <th>Interviewer</th>
                    <th>Interview Stage</th>
                    <th>Submission ID</th>
                    <th>Submission Stage</th>
                    <th>End Client</th>
                    <th>Interview Recipient</th>
                    <th>Scheduled By</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Scheduled On</th>
                    <th>Due In</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* {interviews.map((interview) => ( */}
                  {(isSearchActive ? searchResults : interviews).map((interview, index) => (
                    <tr key={interview.InterviewID}>
                      <td>{interview.InterviewID}</td>
                      <td>{interview.Title}</td>
                      <td>{formatDate(interview.InterviewStartDate)}</td>
                      <td>{formatDate(interview.InterviewEndDate)}</td>
                      <td>{formatTime(interview.InterviewTime)}</td>
                      <td>{interview.TimeZone}</td>
                      <td>{formatDateTime(interview.InterviewDateTime)}</td>
                      <td>{interview.AccountName}</td>
                      <td>{interview.Interviewer}</td>
                      <td>{interview.InterviewStage}</td>
                      <td onClick={() => handleSubmissionDetails(interview.SubmissionID)} style={{ cursor: 'pointer', color: 'blue' }}>{interview.SubmissionID}</td>
                      {/* <td>{interview.SubmissionID}</td> */}
                      <td>{interview.SubmissionStage}</td>
                      <td>{interview.EndClient}</td>
                      <td>{interview.InterviewRecipient}</td>
                      <td>{interview.ScheduledBy}</td>
                      <td>{interview.Status}</td>
                      <td>{interview.Location}</td>
                      <td>{formatDate(interview.ScheduledOn)}</td>
                      <td>{interview.DueIn}</td>
                      <td>
                        <button onClick={() => handleEditInterview(interview)} className="update-interview-button">Update</button>
                        <button onClick={() =>handleDeleteInterview(interview.InterviewID)} className="delete-interview-button">Delete</button>
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
export default Interviews;
