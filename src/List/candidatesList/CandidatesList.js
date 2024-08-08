import React, { useEffect, useState } from "react";
import axios from "axios";
import { appUrl } from "../../signUp/SignUp";
import { useNavigate,useParams } from "react-router-dom";
import "./CandidatesList.css";


const CandidatesList = () => {
    const { candidateId } = useParams(); // Get candidateId from URL parameters
    const [candidate, setCandidate] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const response = await axios.get(`${appUrl}/candidates/${candidateId}`);
        setCandidate(response.data); // Set the candidate data to the state
      } catch (error) {
        console.error("Error fetching candidate details:", error);
      }
    };

    fetchCandidate();
  }, [candidateId]);

  const handleBack = () => {
    navigate("/dashboard"); // Adjust this route as needed
  };

  const handleEditCandidate = () => {
    // Navigate to an edit page with candidate details
    navigate(`/candidates`);
  };

  const handleDeleteCandidate = async (id) => {
    navigate("/candidates");
  };

  if (!candidate) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>
        <button type="button" onClick={handleBack} className="backButton">
          Back
        </button>
      </div>
      <table className="CandidatesList-table">
        <thead>
          <tr>
            <th>CandidateID</th>
            <th>FirstName</th>
            <th>LastName</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Resume</th>
            <th>Skills</th>
            <th>Status</th>
            <th>WorkExperience</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{candidate.CandidateID}</td>
            <td>{candidate.FirstName}</td>
            <td>{candidate.LastName}</td>
            <td>{candidate.Email}</td>
            <td>{candidate.Phone}</td>
            <td>{candidate.Resume}</td>
            <td>{candidate.Skills}</td>
            <td>{candidate.Status}</td>
            <td>{candidate.WorkExperience}</td>
            <td>
              <button
                onClick={handleEditCandidate}
                className="update-candidates-button"
              >
                Update
              </button>
              <button
                onClick={handleDeleteCandidate}
                className="delete-candidates-button"
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

export default CandidatesList;