import React, { useEffect, useState } from "react";
import axios from "axios";
import { appUrl } from "../signUp/SignUp";
import { useNavigate } from "react-router-dom";
import "./Onboarding.css";


const Onboarding = () => {
  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    Mobile: "",
    Workflow: "",
    Initiator: "",
    InitiatedOn: "",
    HireDate: "",
    Status: "Completed",
    AssignedTo: "",
    Progress: ""
  });
  const [onboardings, setOnboardings] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showForm, setShowForm] = useState(false); 
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showOnboardings, setShowOnboardings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSearchActive) {
      handleSearchOnboarding(page);
    } else {
      fetchOnboardings(page);
    }
  }, [page, isSearchActive]);

  const fetchOnboardings = async () => {
    try {
      const response = await axios.get(`${appUrl}/onboarding/all?page=${page}&limit=${limit}`);
      setOnboardings(response.data.onboarding);
      setTotalPages(Math.ceil(response.data.totalCount / limit));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching onboardings:", error);
      alert("Failed to fetch onboardings");
      setLoading(false);
    }
  };

  const handleSearchOnboarding = async (currentPage = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(`${appUrl}/onboarding/search`, {
        params: {
          searchValue: searchQuery,
          page: currentPage,
          pageSize: limit,
        },
      });
      setSearchResults(response.data.onboarding || []);
      setTotalPages(Math.ceil(response.data.totalCount / limit));
      setShowOnboardings(true);
      setPage(currentPage);
      setLoading(false);
    } catch (error) {
      console.error("Error searching onboardings:", error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditMode) {
      await handleUpdateOnboarding(editId);
    } else {
      await handleCreateOnboarding();
    }
  };

  const handleCreateOnboarding = async () => {
    try {
      const response = await axios.post(`${appUrl}/onboarding`, formData);
      console.log("Onboarding created:", response.data);
      alert("Onboarding created successfully");
      fetchOnboardings();
      setShowForm(false);
    } catch (error) {
      console.error("Error creating onboarding:", error);
      alert("Failed to create onboarding");
    }
  };

  const handleUpdateOnboarding = async (onboardingId) => {
    try {
      const response = await axios.put(`${appUrl}/onboarding/${onboardingId}`, formData);
      console.log("Onboarding updated:", response.data);
      alert("Onboarding updated successfully");
      fetchOnboardings();
      setShowForm(false);
    } catch (error) {
      console.error("Error updating onboarding:", error);
      alert("Failed to update onboarding");
    }
  };

  const handleDeleteOnboarding = async (id) => {
    try {
      const response = await axios.delete(`${appUrl}/onboarding/${id}`);
      console.log("Onboarding deleted:", response.data);
      alert("Onboarding deleted successfully");
      fetchOnboardings();
    } catch (error) {
      console.error("Error deleting onboarding:", error);
      alert("Failed to delete onboarding");
    }
  };

  const handleCreateOnboardingClick = () => {
    setShowForm(true);
    setIsEditMode(false);
    setShowOnboardings(false);
    setFormData({
      FirstName: "",
      LastName: "",
      Email: "",
      Mobile: "",
      Workflow: "",
      Initiator: "",
      InitiatedOn: "",
      HireDate: "",
      Status: "Completed",
      AssignedTo: "",
      Progress: ""
    });
  };

  const handleFindAllOnboardings = () => {
    setShowOnboardings(true);
    setShowForm(false);
    fetchOnboardings();
  };

  const handleEditOnboarding = (onboarding) => {
    setFormData({
      FirstName: onboarding.FirstName,
      LastName: onboarding.LastName,
      Email: onboarding.Email,
      Mobile: onboarding.Mobile,
      Workflow: onboarding.Workflow,
      Initiator: onboarding.Initiator,
      InitiatedOn: onboarding.InitiatedOn,
      HireDate: onboarding.HireDate,
      Status: onboarding.Status,
      AssignedTo: onboarding.AssignedTo,
      Progress: onboarding.Progress
    });
    setIsEditMode(true);
    setEditId(onboarding.Code);
    setShowForm(true);
    setShowOnboardings(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  // Utility function to format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA");
  };

  const handleEmployeeDetails = (employeeId) => {
    console.log("Employee ID:", employeeId); // Add this line
    navigate(`/employees/${employeeId}`);
  };

  return (
    <div>
      {showForm ? (
        <div className="add-onboarding-form">
          <h1 className="header-Onboarding">{isEditMode ? "Edit Onboarding" : "Add Onboarding"}</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              id="FirstName"
              name="FirstName"
              placeholder="First Name"
              value={formData.FirstName}
              onChange={handleChange}
              className="onboarding-input-styles"
            />
            <input
              type="text"
              id="LastName"
              name="LastName"
              placeholder="Last Name"
              value={formData.LastName}
              onChange={handleChange}
              className="onboarding-input-styles"
            />
            <input
              type="email"
              id="Email"
              name="Email"
              placeholder="Email"
              value={formData.Email}
              onChange={handleChange}
              className="onboarding-input-styles"
            />
            <input
              type="text"
              id="Mobile"
              name="Mobile"
              placeholder="Mobile"
              value={formData.Mobile}
              onChange={handleChange}
              className="onboarding-input-styles"
            />
            <input
              type="text"
              id="Workflow"
              name="Workflow"
              placeholder="Workflow"
              value={formData.Workflow}
              onChange={handleChange}
              className="onboarding-input-styles"
            />
            <input
              type="text"
              id="Initiator"
              name="Initiator"
              placeholder="Initiator"
              value={formData.Initiator}
              onChange={handleChange}
              className="onboarding-input-styles"
            />
            <label htmlFor="InitiatedOn" className="onboardinglabelDate">
                InitiatedOn:
            </label>
            <input
              type="date"
              id="InitiatedOn"
              name="InitiatedOn"
              placeholder="Initiated On"
              value={formData.InitiatedOn}
              onChange={handleChange}
              className="onboarding-inputDate-styles"
            />
            <label htmlFor="HireDate" className="onboardinglabelDate">
            HireDate:
            </label>
            <input
              type="date"
              id="HireDate"
              name="HireDate"
              placeholder="Hire Date"
              value={formData.HireDate}
              onChange={handleChange}
              className="onboarding-inputDates-styles"
            />
            <label htmlFor="Status" className="onboarding-labelStatus">
              Status:
            </label>
            <select
              id="Status"
              name="Status"
              value={formData.Status}
              onChange={handleChange}
              className="onboarding-select-styles"
            >
              <option value="Pending">Pending</option>
              <option value="InProgress">InProgress</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
            <input
              type="text"
              id="AssignedTo"
              name="AssignedTo"
              placeholder="Assigned To"
              value={formData.AssignedTo}
              onChange={handleChange}
              className="onboarding-input-styles"
            />
            <input
              type="text"
              id="Progress"
              name="Progress"
              placeholder="Progress"
              value={formData.Progress}
              onChange={handleChange}
              className="onboarding-input-styles"
            />
            <div>
            <button type="submit" className="onboarding-submit-button">{isEditMode ? "Update Onboarding" : "Create Onboarding"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="onboarding-cancel-button">Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <button onClick={handleBack} className="AddOnboarding-back-button">Back</button>
          <button onClick={handleCreateOnboardingClick} className="AddOnboarding-button">Create Onboarding</button>
          <button onClick={handleFindAllOnboardings} className="FnndOnboarding-button">Find All Onboardings</button>
          <button onClick={() => setShowSearch(!showSearch)} className="SearchOnboarding-button">Search Onboardings</button>
        </div>
      )}
      {showSearch && (
        <div className="onboarding-search-form">
          <input
            type="text"
            placeholder="Search Onboardings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="onboardings-Search-button"
          />
          <button onClick={() =>{
            setIsSearchActive(true); // Set search active
            handleSearchOnboarding(page);
            }} className="handleSearchOnboarding-button">Search</button>
          {/* <button onClick={() => { setSearchQuery(""); setIsSearchActive(false); }} className="clearSearchOnboarding-button">Clear Search</button> */}
        </div>
      )}
      {showOnboardings && onboardings.length > 0 &&(
            <div>
              <h1 className="onboardingsTitle">{isSearchActive ? "Search Results" : "All Onboardings"}</h1>
              <table className="onboardings-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Workflow</th>
                    <th>Initiator</th>
                    <th>Initiated On</th>
                    <th>Hire Date</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Progress</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(isSearchActive ? searchResults : onboardings).map((onboarding) => (
                    <tr key={onboarding.Code}>
                      <td>{onboarding.Code}</td>
                      <td>{onboarding.FirstName}</td>
                      <td>{onboarding.LastName}</td>
                      <td>{onboarding.Email}</td>
                      <td>{onboarding.Mobile}</td>
                      <td>{onboarding.Workflow}</td>
                      <td>{onboarding.Initiator}</td>
                      <td>{formatDate(onboarding.InitiatedOn)}</td>
                      <td>{formatDate(onboarding.HireDate)}</td>
                      <td>{onboarding.Status}</td>
                      <td onClick={() => handleEmployeeDetails(onboarding.AssignedTo)} style={{ cursor: 'pointer', color: 'blue' }}>{onboarding.AssignedTo}</td>
                      {/* <td>{onboarding.AssignedTo}</td> */}
                      <td>{onboarding.Progress}</td>
                      <td>
                        <button onClick={() => handleEditOnboarding(onboarding)}>Update</button>
                        <button onClick={() => handleDeleteOnboarding(onboarding.Code)} className="handleDeleteOnboarding">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination">
                <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
                  Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
  );
};

export default Onboarding;
