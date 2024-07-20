import React, { useEffect, useState } from "react";
import axios from "axios";
import { appUrl } from "../signUp/SignUp";
import { useNavigate } from "react-router-dom";
import "./Candidates.css";

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    Phone: "",
    Resume: "",
    Skills: "",
    Status: "Active",
    WorkExperience: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showCandidates, setShowCandidates] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get(`${appUrl}/candidates`);
      setCandidates(response.data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      alert("Failed to fetch candidates");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     setFormData({
//       ...formData,
//       Resume: file,
//     });
//   };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditMode) {
      handleUpdateCandidates(editId);
    } else {
      try {
        const response = await axios.post(`${appUrl}/candidates`, formData);
        console.log("Candidate created:", response.data);
        alert("Candidate created successfully");
        fetchCandidates();
        setFormData({
          FirstName: "",
          LastName: "",
          Email: "",
          Phone: "",
          Resume: "",
          Skills: "",
          Status: "Active",
          WorkExperience: "",
        });
        setShowForm(false);
      } catch (error) {
        console.error("Error creating candidate:", error);
        alert("Failed to create candidate");
      }
    }
  };

  const handleUpdateCandidates = async (candidateId) => {
    try {
      const response = await axios.put(
        `${appUrl}/candidates/${candidateId}`,
        formData
      );
      console.log("Candidate updated:", response.data);
      alert("Candidate updated successfully");
      fetchCandidates();
      setIsEditMode(false);
      setShowForm(false);
    } catch (error) {
      console.error("Error updating candidate:", error);
      alert("Failed to update candidate");
    }
  };
  const handleDeleteCandidates = async (id) => {
    try {
      const response = await axios.delete(`${appUrl}/candidates/${id}`);
      console.log("Candidate deleted:", response.data);
      alert("Candidate deleted successfully");
      fetchCandidates();
    } catch (error) {
      console.error("Error deleting candidate:", error);
      alert("Failed to delete candidate");
    }
  };

  const handleEditCandidates = (candidate) => {
    setIsEditMode(true);
    setEditId(candidate.CandidateID);
    setShowForm(true);
    setShowCandidates(false);
    setFormData({
      FirstName: candidate.FirstName,
      LastName: candidate.LastName,
      Email: candidate.Email,
      Phone: candidate.Phone || "",
      Resume: candidate.Resume || "",
      Skills: candidate.Skills || "",
      Status: candidate.Status || "Active",
      WorkExperience: candidate.WorkExperience || "",
    });
  };
  // Navigate back to dashboard or previous page
  const handleBack = () => {
    navigate("/dashboard"); // Adjust this route as needed
  };
  const handleCreateCandidates = () => {
    setIsEditMode(false);
    setEditId(null);
    setFormData({
      FirstName: "",
      LastName: "",
      Email: "",
      Phone: "",
      Resume: "",
      Skills: "",
      Status: "Active",
      WorkExperience: "",
    });
    setShowForm(true);
  };
  // Utility function to format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA");
  };
  const handleFindAllCandidates = () => {
    setShowCandidates(true);
    setShowForm(false);
    fetchCandidates(); // Fetch all candidates
  };
  return (
    <div>
      {showForm ? (
        <div className="add-candidate-form">
          <h1 className="header">
            {isEditMode ? "Edit Candidate" : "Add Candidate"}
          </h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              id="FirstName"
              name="FirstName"
              placeholder="First Name"
              value={formData.FirstName}
              onChange={handleChange}
              className="input-styles"
            />
            <input
              type="text"
              id="LastName"
              name="LastName"
              placeholder="Last Name"
              value={formData.LastName}
              onChange={handleChange}
              className="input-styles"
            />
            <input
              type="email"
              id="Email"
              name="Email"
              placeholder="Email"
              value={formData.Email}
              onChange={handleChange}
              className="input-styles"
            />
            <input
              type="text"
              id="Phone"
              name="Phone"
              placeholder="Phone"
              value={formData.Phone}
              onChange={handleChange}
              className="input-styles"
            />
            
            <input
              type="file"
              id="Resume"
              name="Resume"
              placeholder="Resume"
              value={formData.Resume}
              onChange={handleChange}
              className="input-styles"
            />
            <textarea
              id="Skills"
              name="Skills"
              placeholder="Skills"
              value={formData.Skills}
              onChange={handleChange}
              className="input-textarea"
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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <textarea
              id="WorkExperience"
              name="WorkExperience"
              placeholder="Work Experience"
              value={formData.WorkExperience}
              onChange={handleChange}
              className="input-textarea"
            />
            <div>
              <button type="submit" className="CreateCandidates">
                {isEditMode ? "Update Candidate" : "Create Candidate"}
              </button>
              <button type="button" onClick={handleBack} className="backButton">
                Back
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <button type="button" onClick={handleBack} className="backButton">
            Back
          </button>
          <button
            type="button"
            onClick={handleCreateCandidates}
            className="CreateCandidates"
          >
            Create Candidates
          </button>

          <button onClick={handleFindAllCandidates} className="findCandidates">
            Find All Candidates
          </button>
        </div>
      )}
      {showCandidates && candidates.length > 0 && (
        <div>
          <h1 className="headerCandidates">All Candidates</h1>
          <table className="candidate-table">
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
              {candidates.map((candidate, index) => (
                <tr key={index}>
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
                      onClick={() => handleEditCandidates(candidate)}
                      className="update-button"
                    >
                      Update
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteCandidates(candidate.CandidateID)
                      }
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default Candidates;
