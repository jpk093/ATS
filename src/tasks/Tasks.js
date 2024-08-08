import React, { useEffect, useState } from "react";
import axios from "axios";
import { appUrl } from "../signUp/SignUp";
import { useNavigate } from "react-router-dom";
import "./Tasks.css";

const Tasks = () => {
  const [formData, setFormData] = useState({
    Title: "",
    TaskCategory: '',
    CreatedBy: "",
    DueDate: "",
    Priority: "MEDIUM",
    Status: "OPEN",
    Reminder: "FALSE",
    AssignedTo: "",
  });
  const [tasks, setTasks] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showForm, setShowForm] = useState(false); // State to control form visibility
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showTasks, setShowTasks] = useState(false); // New state to control tasks table visibility
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false); // Added state
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // Fetch all tasks on component mount
  useEffect(() => {
    if (isSearchActive) {
      handleSearchTasks(page);
    } else {
      fetchTasks(page);
    }
  }, [page, isSearchActive]);

  // Fetch all tasks from backend
  const fetchTasks = async () => {
    // setLoading(true);
    try {
      const response = await axios.get(
        `${appUrl}/tasks/all?page=${page}&limit=${limit}`
      );
      setTasks(response.data.tasks);
      setTotalPages(Math.ceil(response.data.totalCount / limit));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      alert("Failed to fetch tasks");
      setLoading(false);
    }
  };

  const handleSearchTasks = async (currentPage = 1) => {
    setLoading(true);
    try{
      const response = await axios.get(`${appUrl}/tasks/search`, {
        params: {
          searchValue: searchQuery,
          page: currentPage,
          pageSize: limit,
        },
      })
        setSearchResults(response.data.tasks || []); // Adjust based on response structure
        setTotalPages(Math.ceil(response.data.totalCount / limit));
        setShowTasks(true); // Show tasks if not already visible
        setPage(currentPage); // Set current page
        setLoading(false);
      } catch(error) {
        console.error("Error searching tasks:", error);
        setLoading(false); // Set loading state to false
      }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  // Handle form submission to create a new task
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditMode) {
      await handleUpdateTask(editId);
    } else {
      await handleCreateTask();
    }
  }
    //   try {
    //     const response = await axios.post(`${appUrl}/tasks`, formData);
    //     console.log("Task created:", response.data);
    //     alert("Task created successfully"); // Display alert upon success
    //     fetchTasks();
    //     setShowForm(false);
    //   } catch (error) {
    //     console.error("Error creating task:", error);
    //     alert("Failed to create task"); // Display alert upon failure
    //   }
    // }
  // Create a new task
  const handleCreateTask = async () => {
    try {
      const response = await axios.post(`${appUrl}/tasks`, formData);
      console.log("Task created:", response.data);
      alert("Task created successfully");
      fetchTasks();
      setShowForm(false);
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task");
    }
  };

  // Update an existing task
  const handleUpdateTask = async (taskId) => {
    try {
      const response = await axios.put(`${appUrl}/tasks/${taskId}`, formData);
      console.log("Task updated:", response.data);
      alert("Task updated successfully");
      fetchTasks();
      setShowForm(false);
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task");
    }
  };

  // Delete a task
  const handleDeleteTask = async (id) => {
    try {
      const response = await axios.delete(`${appUrl}/tasks/${id}`);
      console.log("Task deleted:", response.data);
      alert("Task deleted successfully");
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task");
    }
  };
  // Display the form for adding new tasks
  const handleCreateTaskClick = () => {
    setShowForm(true); // Display the form
    setIsEditMode(false);
    setShowTasks(false);
    setFormData({
      Title: "",
      TaskCategory: "",
      CreatedBy: "",
      DueDate: "",
      Priority: "MEDIUM",
      Status: "OPEN",
      Reminder: "FALSE",
      AssignedTo: "",
    });
  };

  // Handle showing all tasks
  const handleFindAllTasks = () => {
    setShowTasks(true);
    setShowForm(false);
    fetchTasks();
  };

  const handleEditTask = (task) => {
    setFormData({
      Title: task.Title,
      TaskCategory: task.TaskCategory,
      CreatedBy: task.CreatedBy,
      DueDate: formatDate(task.DueDate),
      Priority: task.Priority,
      Status: task.Status,
      Reminder: task.Reminder,
      AssignedTo: task.AssignedTo,
    });
    setIsEditMode(true);
    setEditId(task.TaskID);
    setShowForm(true);
    setShowTasks(false);
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
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleEmployeeDetails = (employeeId) => {
    console.log("Employee ID:", employeeId); // Add this line
    navigate(`/employees/${employeeId}`);
  };
  return (
    <div>
      {showForm ? (
        <div className="add-task-form">
          <h1 className="header-Task">{isEditMode ? "Edit Task" : "Add Task"}</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              id="Title"
              name="Title"
              placeholder="Title"
              value={formData.Title}
              onChange={handleChange}
              className="task-input-styles"
            />
            <input
              type="text"
              id="TaskCategory"
              name="TaskCategory"
              placeholder="Task Category"
              value={formData.TaskCategory}
              onChange={handleChange}
              className="task-input-styles"
            />
            <input
              type="text"
              id="AssignedTo"
              name="AssignedTo"
              placeholder="Assigned To"
              value={formData.AssignedTo}
              onChange={handleChange}
              className="task-input-styles"
            />
            <input
              type="text"
              id="CreatedBy"
              name="CreatedBy"
              placeholder="Created By"
              value={formData.CreatedBy}
              onChange={handleChange}
              className="task-input-styles"
            />
            <label htmlFor="DueDate" className="DueDate">
              Due Date:
            </label>
            <input
              type="date"
              id="DueDate"
              name="DueDate"
              placeholder="Due Date"
              value={formData.DueDate}
              onChange={handleChange}
              className="inputTask-Date-styles"
            />
            <label htmlFor="Status" className="labelStatus">
              Status:
            </label>
            <select
              id="Status"
              name="Status"
              value={formData.Status}
              onChange={handleChange}
              className="task-select-styles"
            >
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="PENDING">PENDING</option>
              <option value="COMPLETED">COMPLETED</option>

            </select>
            <label htmlFor="Priority" className="labelPriority">
              Priority:
            </label>
            <select
              id="Priority"
              name="Priority"
              value={formData.Priority}
              onChange={handleChange}
              className="task-select-styles"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
            <label htmlFor="Reminder" className="labelReminder">
              Reminder:
            </label>
            <select
              id="Reminder"
              name="Reminder"
              value={formData.Reminder}
              onChange={handleChange}
              className="task-select-styles-reminder"
            >
              <option value="TRUE">TRUE</option>
              <option value="FALSE">FALSE</option>
            </select>
            {/* <textarea
              id="Reminder"
              name="Reminder"
              placeholder="Reminder"
              value={formData.Reminder}
              onChange={handleChange}
              className="task-textarea-styles"
            /> */}
        <div>
            <button type="submit" className="Add-Task">
              {isEditMode ? "Update Task" : "Create Task"}
            </button>
         
          <button onClick={() => setShowForm(false)} className="task-cancle-button">
            Cancel
          </button>
          </div>
          </form>
        </div>
      ) : (
        <div>
            <button onClick={handleBack} className="task-backButton">
              Back
            </button>
            <button onClick={handleCreateTaskClick} className="add-Task">
              Add Task
            </button>
            <button onClick={handleFindAllTasks} className="viewTask">
              Find All Tasks
            </button>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="searchTask"
            >
              Search Tasks
            </button> 
          </div>
          )}
          {showSearch && (
            <div className="task-search-form">
              <input
                type="text"
                placeholder="Search Tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="tasks-search-test"
              />
              <button
                onClick={() => {
                  handleSearchTasks(page); 
                  setIsSearchActive(true); 
                }}
                className="task-search-button"
              >
                Search
              </button>
              {/* <button
                onClick={() => {
                  setIsSearchActive(false);
                  setSearchQuery("");
                  fetchTasks(1); // Fetch all tasks and reset search
                  setShowTasks(false); // Hide tasks initially
                }}
                className="task-reset-button"
              >
                Reset
              </button> */}
            </div>
          )}
          {showTasks && (
            <div>
                <h1 className="title-Task">{isSearchActive ? "Search Results" : "All Tasks"}</h1>
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Task ID</th>
                    <th>Title</th>
                      <th>Task Category</th>
                      <th>Created By</th>
                      <th>Due Date</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Reminder</th>
                      <th>Assigned To</th>
                      <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                {(isSearchActive ? searchResults : tasks).map((task, index) => (
                  //{tasks.map((task) => (
                    <tr key={index}>
                      <td>{task.TaskID}</td>
                      <td>{task.Title}</td>
                        <td>{task.TaskCategory}</td>
                        <td>{task.CreatedBy}</td>
                        <td>{formatDate(task.DueDate)}</td>
                        <td>{task.Priority}</td>
                        <td>{task.Status}</td>
                        <td>{task.Reminder}</td>
                        <td onClick={() => handleEmployeeDetails(task.AssignedTo)} style={{ cursor: 'pointer', color: 'blue' }}>{task.AssignedTo}</td>
                      <td>
                        <button
                          onClick={() => handleEditTask(task)}
                          className="update-task-button"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.TaskID)}
                          className="delete-task-button"
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
                <span>
                  Page {page} of {totalPages}
                </span>
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

export default Tasks;
