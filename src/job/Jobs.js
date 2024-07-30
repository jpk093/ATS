import React, { useEffect, useState } from "react";
import axios from "axios";
import { appUrl } from "../signUp/SignUp";
import { useNavigate } from "react-router-dom";
import "./Jobs.css";

const Jobs = () => {
  const [jobData, setJobData] = useState({
    JobTitle: "",
    Description: "",
    Department: "",
    Location: "",
    EmploymentType: "",
    Salary: "",
    RequiredExperience: "",
    SkillsRequired: "",
    Openings: "",
    Status: "Open",
    PostedDate: "",
    ClosingDate: "",
  });
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showJobs, setShowJobs] = useState(false);
  const [editMode, setEditMode] = useState(false); // State to control if editing
  const [currentJobId, setCurrentJobId] = useState(null); // State to track job being edited
  // const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [showSearch, setShowSearch] = useState(false); // State to control search input visibility
  // const [jobID, setJobID] = useState(""); // New state for JobID search
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  //Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData((prevState) => ({ ...prevState, [name]: value }));
  };
  const handleJob = (e) => {
    e.preventDefault();
    // Validate form data
    const {
      JobTitle,
      Description,
      Department,
      Location,
      EmploymentType,
      Salary,
      RequiredExperience,
      SkillsRequired,
      Openings,
      PostedDate,
      ClosingDate,
    } = jobData;
    if (
      !JobTitle ||
      !Description ||
      !Department ||
      !Location ||
      !EmploymentType ||
      !Salary ||
      !RequiredExperience ||
      !SkillsRequired ||
      !Openings ||
      !PostedDate ||
      !ClosingDate
    ) {
      alert("Please fill in all fields.");
      return;
    }
    if (editMode) {
      handleUpdateJob(currentJobId);
    } else {
      // Send the job data to the backend
      axios
        .post(`${appUrl}/jobs`, jobData)
        .then((response) => {
          alert("Job created successfully!");
          setJobData({
            JobTitle: "",
            Description: "",
            Department: "",
            Location: "",
            EmploymentType: "",
            Salary: "",
            RequiredExperience: "",
            SkillsRequired: "",
            Openings: "",
            Status: "Open",
            PostedDate: "",
            ClosingDate: "",
          });
          setShowForm(false);
          handleFindAllJobs(page);
        })
        .catch((error) => {
          console.error("Error creating job:", error);
          alert("Failed to create job.");
        });
    }
  };

  const handleFindAllJobs = (currentPage = 1) => {
    setLoading(true);
    axios
      .get(`${appUrl}/jobs/all`,{
        params:{
          page:currentPage,
          limit:limit
        }
      })
      .then((response) => {
        setJobs(response.data.jobs);
        setShowJobs(true);
        setPage(currentPage);
        setTotalCount(response.data.totalCount); // Update total jobs count
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching jobs:", error);
        setLoading(false);
      });
  };


  // Utility function to format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA");
  };
  const handleUpdateJob = (jobId) => {
    axios
      .put(`${appUrl}/jobs/${jobId}`, jobData)
      .then((response) => {
        alert("Job updated successfully!");
        setShowForm(false);
        setEditMode(false);
        handleFindAllJobs(page);
      })
      .catch((error) => {
        console.error("Error updating jobs:", error);
        alert("Failed to update job.");
      });
  };
  const handleDeleteJob = (jobId) => {
    axios
      .delete(`${appUrl}/jobs/${jobId}`)
      .then((response) => {
        alert("Job deleted successfully !");
        setJobs(jobs.filter((job) => job.JobID !== jobId));
      })
      .catch((error) => {
        console.error("Error deleting job:", error);
        alert("Failed to delete job.");
      });
  };
  const handleEditJob = (job) => {
    setJobData({
      JobTitle: job.JobTitle,
      Description: job.Description,
      Department: job.Department,
      Location: job.Location,
      EmploymentType: job.EmploymentType,
      Salary: job.Salary,
      RequiredExperience: job.RequiredExperience,
      SkillsRequired: job.SkillsRequired,
      Openings: job.Openings,
      Status: job.Status,
      PostedDate: formatDate(job.PostedDate),
      ClosingDate: formatDate(job.ClosingDate),
    });
    setEditMode(true);
    setCurrentJobId(job.JobID);
    setShowForm(true);
  };
  const handleBack = () => {
    navigate("/dashboard"); // Adjust this route as needed
  };
  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      handleFindAllJobs(newPage);
    }
  };
  // Calculate total pages
  const totalPages = Math.ceil(totalCount / limit);
  return (
    <div className="ats-container">
      <button onClick={handleBack} className="back-button">
        Back
      </button>
      <button
        onClick={() => {
          setShowForm(true);
          setEditMode(false);
        }}
        className="job-button"
      >
        Add Job
      </button>
      <button onClick={() =>handleFindAllJobs(page)} className="job-button">
        Find All Job
      </button>
      {showForm && (
        <div>
          <h1 className="header">{editMode ? "Edit Job" : "Add New Job"}</h1>
          <form onSubmit={handleJob} className="form-page">
            <input
              type="text"
              name="JobTitle"
              value={jobData.JobTitle}
              onChange={handleChange}
              placeholder="Job Title"
              className="job-styles"
              required
            />
            <textarea
              name="Description"
              value={jobData.Description}
              onChange={handleChange}
              placeholder="Job Description"
              className="input1-textarea"
              required
            />
            <input
              type="text"
              name="Department"
              value={jobData.Department}
              onChange={handleChange}
              placeholder="Department"
              className="job-styles"
              required
            />
            <input
              type="text"
              name="Location"
              value={jobData.Location}
              onChange={handleChange}
              placeholder="Location"
              className="job-styles"
              required
            />
            <input
              type="text"
              name="EmploymentType"
              value={jobData.EmploymentType}
              onChange={handleChange}
              placeholder="Employment Type"
              className="job-styles"
              required
            />
            <input
              type="number"
              name="Salary"
              value={jobData.Salary}
              onChange={handleChange}
              placeholder="Salary"
              className="job-styles"
              required
            />
            <input
              type="number"
              name="RequiredExperience"
              value={jobData.RequiredExperience}
              onChange={handleChange}
              placeholder="Required Experience (years)"
              className="job-styles"
              required
            />
            <textarea
              name="SkillsRequired"
              value={jobData.SkillsRequired}
              onChange={handleChange}
              placeholder="Skills Required"
              className="input1-textarea"
              required
            />
            <input
              type="number"
              name="Openings"
              value={jobData.Openings}
              onChange={handleChange}
              placeholder="Openings"
              className="job-styles"
              required
            />
            <input
              type="test"
              name="Status"
              value={jobData.Status}
              onChange={handleChange}
              placeholder="Status"
              className="job-styles"
              required
            />
            <label htmlFor="PostedDate" className="PostedDate">
            PostedDate:
            </label>
            <input
              type="date"
              name="PostedDate"
              value={jobData.PostedDate}
              onChange={handleChange}
              className="date-styles"
              required
            />
            <label htmlFor="ClosingDate" className="ClosingDate">
            ClosingDate:
            </label>
            <input
              type="date"
              name="ClosingDate"
              value={jobData.ClosingDate}
              onChange={handleChange}
              className="date-styles"
              required
            />
            <br />
            <button type="submit" className="add-button">
              {editMode ? "Update Job" : "Add Job"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="cancle-button"
            >
              Cancel
            </button>
          </form>
        </div>
      )}
      {loading ? (
        <p></p>
      ) : (
      // {jobs.length > 0 && showJobs && (
        showJobs && (
        <div>
          <h1 className="title">All Jobs</h1>
          <table className="job-table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>JobTitle</th>
                <th>Description</th>
                <th>Department</th>
                <th>Location</th>
                <th>Employment Type</th>
                <th>Salary</th>
                <th>Required Experience</th>
                <th>Skills Required</th>
                <th>Openings</th>
                <th>Status</th>
                <th>PostedDate</th>
                <th>ClosingDate</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, index) => (
                <tr key={index}>
                  <td>{job.JobID}</td>
                  <td>{job.JobTitle}</td>
                  <td>{job.Description}</td>
                  <td>{job.Department}</td>
                  <td>{job.Location}</td>
                  <td>{job.EmploymentType}</td>
                  <td>{job.Salary}</td>
                  <td>{job.RequiredExperience}</td>
                  <td>{job.SkillsRequired}</td>
                  <td>{job.Openings}</td>
                  <td>{job.Status}</td>
                  <td>{formatDate(job.PostedDate)}</td>
                  <td>{formatDate(job.ClosingDate)}</td>
                  <td>
                    <button
                      onClick={() => handleEditJob(job)}
                      className="update-jobs-button"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.JobID)}
                      className="delete-jobs-button"
                    >
                      Delete{" "}
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
        )
      )}
    </div>
  );
};

export default Jobs;
