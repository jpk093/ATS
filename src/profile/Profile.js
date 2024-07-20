import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { appUrl } from "../signUp/SignUp";
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const id = user.id;
        console.log("In frontend ", id);
        // Fetch the user profile using the ID
        axios
          .get(`${appUrl}/profile?id=${id}`)
          .then((response) => {
            setUser(response.data.user);
          })
          .catch((err) => {
            console.error("Error fetching user profile:", err); // Log detailed error
            setError("Failed to fetch user data.");
            navigate("/dashboard");
          });
      } catch (e) {
        console.error("Error parsing user data from localStorage:", e);
        setError("Failed to parse user data, Please log in again.");
        navigate("/signin");
      }
    } else {
      setError("No user data found. Please log in.");
      navigate("/signin");
    }
  }, [navigate]);

  const handleBack = () => {
    navigate("/dashboard"); // Adjust this route as needed
  };
  if (error) {
    return <p>{error}</p>;
  }
  if (!user) {
    return <p>No user data available, please log in.</p>;
  }
  return (
    <div className="profile-page">
    <button onClick={handleBack} >Back</button>
      <h2>User Profile</h2>
      <p>
        <strong>ID:</strong> {user.id}
      </p>
      <p>
        <strong>Username:</strong> {user.userName}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      
    </div>
  );
};

export default Profile;
