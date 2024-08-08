import React, { useEffect, useState } from "react";
import axios from "axios";
import { appUrl } from "../../signUp/SignUp";
import { useNavigate, useParams } from "react-router-dom";
import "./SubmissionList.css";

const SubmissionList = () => {
  const { submissionId } = useParams(); // Get submissionId from URL parameters
  const [submission, setSubmission] = useState(null); // Set submission data state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await axios.get(`${appUrl}/submissions/${submissionId}`);
        setSubmission(response.data); // Set the submission data to the state
      } catch (error) {
        console.error("Error fetching submission details:", error);
      }
    };

    fetchSubmission();
  }, [submissionId]);

  const handleBack = () => {
    navigate("/dashboard"); // Adjust this route as needed
  };

  const handleEditSubmission = () => {
    // Navigate to an edit page with submission details
    navigate(`/submissions`);
  };

  const handleDeleteSubmission = async () => {
      navigate("/submissions");
  };

  if (!submission) {
    return <div>Loading...</div>;
  }

  const handleJobDetails = (jobId) => {
    console.log("Job ID:", jobId); // Add this line
    navigate(`/jobs/${jobId}`);
  };
  const handleCandidateDetails=(candidateId) => {
    console.log("Candidate ID:", candidateId); // Add this line
    navigate(`/candidates/${candidateId}`);
  }
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA");
  };
 
  return (
    <div>
      <div>
        <button type="button" onClick={handleBack} className="submission-backButton">
          Back
        </button>
      </div>
      <table className="SubmissionDetails-table">
        <thead>
          <tr>
            <th>SubmissionID</th>
            <th>FirstName</th>
            <th>LastName</th>
            <th>CandidateID</th>
            <th>JobID</th>  
            <th>JobTitle</th>
            <th>Client</th>
            <th>Status</th>
            <th>CandidateCTCType</th>
            <th>CandidateCTC</th>
            <th>City</th>
            <th>State</th>
            <th>JobHiringType</th>
            <th>Submitter</th>
            <th>SubmittedDate</th>
            <th>ReasonForRejection</th>
            <th>RejectionComments</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
        <tr>
            <td>{submission.SubmissionID}</td>
            <td>{submission.FirstName}</td>
            <td>{submission.LastName}</td>
            <td onClick={() => handleCandidateDetails(submission.CandidateID)} style={{ cursor: 'pointer', color: 'blue' }}>{submission.CandidateID}</td>
                  
                  <td onClick={() => handleJobDetails(submission.JobID)} style={{ cursor: 'pointer', color: 'blue' }}>{submission.JobID}</td>
            {/* <td>{submission.CandidateID}</td>
            <td>{submission.JobID}</td>   */}
            <td>{submission.JobTitle}</td>
            <td>{submission.Client}</td>
            <td>{submission.Status}</td>
            <td>{submission.CandidateCTCType}</td>
            <td>{submission.CandidateCTC}</td>
            <td>{submission.City}</td>
            <td>{submission.State}</td>
            <td>{submission.JobHiringType}</td>
            <td>{submission.Submitter}</td>
            <td>{formatDate(submission.SubmittedDate)}</td>
            <td>{submission.ReasonForRejection}</td>
            <td>{submission.RejectionComments}</td>
            <td>
              <button
                onClick={handleEditSubmission}
                className="update-submission-button"
              >
                Update
              </button>
              <button
                onClick={handleDeleteSubmission}
                className="delete-submission-button"
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

export default SubmissionList ;
    ;
