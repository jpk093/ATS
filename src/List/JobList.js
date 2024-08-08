import React, { useEffect, useState } from "react";
import axios from "axios";
import { appUrl } from "../signUp/SignUp";
import { useNavigate,useParams } from "react-router-dom";
import "./JobList.css";

const JobList = () => {
  const { jobId } = useParams();
  // console.log(jobId);
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await axios.get(`${appUrl}/jobs/${jobId}`);
        setJobs([response.data]); // Set the job data to the state
      } catch (error) {
        console.error("Error fetching job details:", error);
      }
    };

    fetchJobDetails();
  }, []);

  const handleEditJob = () => {
    // Navigate to an edit page with candidate details
    navigate(`/jobs`);
  };

  const handleDeleteJob = async (id) => {
    navigate("/jobs");
  };
  // Utility function to format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA");
  };
  const handleBack = () => {
    navigate("/dashboard"); // Adjust this route as needed
  };
  return (
    <div>
      <div>
      <button type="button" onClick={handleBack} className="JobList-backButton">
          Back
      </button>
      </div>
      <table className="JobList-table">
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
                onClick={handleEditJob}
                className="update-jobs-button"
              >
                Update
              </button>
              <button
                onClick={handleDeleteJob}
                className="delete-jobs-button"
              >
                Delete
              </button>
            </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default JobList;
