import React, { useEffect, useState } from "react";
import axios from "axios";
import { appUrl } from "../signUp/SignUp";
import { useNavigate } from "react-router-dom";
import './Attendance.css';

const Attendance = () => {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [attendanceRecords,setAttendanceRecords]=useState([]);
  const [filterUserName,setFilterUserName]=useState("");
  const [dateTimestamps, setDateTimestamps] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const navigate = useNavigate();

  // Retrieve user information from localStorage
  useEffect(() => {
    const userStr=localStorage.getItem("user");
    if(userStr){
      try{
        const user=JSON.parse(userStr);
        setUserId(user.id);
        setUserName(user.userName);
      }catch(error){
        console.error("Error parsing user data from localStorage:",error);
      }
    }
    //Load isCheckedIn state from localStorage
    const checkInStatus=localStorage.getItem("isCheckedIn")
    setIsCheckedIn(checkInStatus ==="true");
  },[]);

  const handleBack = () => {
    navigate("/dashboard"); // Adjust this route as needed
  };
  const handleCheckIn = async () => {
    try {
      const response = await axios.post(`${appUrl}/checkin`, {
        userId: parseInt(userId), 
        userName,
      });
      console.log(response.data);
      setIsCheckedIn(true);
      localStorage.setItem("isCheckedIn", "true");
      alert(`User ${userName} checked in successfully!`);
    } catch (error) {
      console.error("Error during check-in:", error);
      alert(error.response?.data?.error || "Failed to check in.");
    }
  };
  const handleCheckOut = async () => {
    try {
      const response = await axios.post(`${appUrl}/checkout`, {
        userId,
      });
      console.log(response.data);
      setIsCheckedIn(false); // Update state to indicate the user is checked out
      localStorage.setItem("isCheckedIn", "false");
      alert(`User ${userName} checked out successfully!`);
    } catch (error) {
      console.error("Error during check-out:", error);
      alert(error.response?.data?.error || "Failed to check out.");
    }
  };

  //Fetch all attendance records
  const fetchAllRecords = async () =>{
    try{
      const response=await axios.get(`${appUrl}/Attendance`);
      setAttendanceRecords(response.data);
    }catch(error){
      console.error("Error fetching all attendance records:",error);
    }
  }
  // //Fetch attendance records by userName
  // const fetchRecordsByUserName = async () =>{
  //   try{
  //     const response=await axios.get(`${appUrl}/Attendance/${filterUserName}`);
  //     setAttendanceRecords(response.data);
  //   }catch(error){
  //     console.error('Error fetching records for user ${filterUserName}:',error);
  //   }
  // }
  // //Fetch attendance records by date
  // const fetchRecordsByDate= async () =>{
  //   try{
  //     const response=await axios.get(`${appUrl}/Attendance/bydate?startDate=${startDate} &endDate=${endDate}`
  //     );
  //     console.log(startDate);
  //     console.log(endDate);
  //     console.log(" Before Response data:", response.data); // Log the response data
  //     setDateTimestamps(response.data);
  //     console.log("Response data:", response.data); // Log the response data
  //   }catch(error){
  //     console.error("Error fetching data by date range:", error);
  //   }
  // }
  return (
    <div> 
       <button onClick={handleBack} className="back-button">Back</button>
      {/* <div> */}
        {isCheckedIn ? (
          <button onClick={handleCheckOut} className="check-button">Check Out</button>
        ) : (
          <button onClick={handleCheckIn} className="check-button">Check In</button>  
        )}
      {/* </div> */}
      <button onClick={fetchAllRecords} className="fetchAll-records">Fetch All Records</button>
      

      {/* <button onClick={fetchRecordsByUserName}>Fetch Records by UserName</button> */}

      {/* <button onClick={() => setShowDateFilter(!showDateFilter)} className="records-date">Records by Date</button> */}
      
      {attendanceRecords.length>0  && (
        <div>
          <h3>Attendance Records</h3>
          <table className="attendance-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Login Date</th>
                <th>Login Time</th>
                <th>logout Time</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record,index) =>(
                <tr key={index}>
                  <td>{record.userName}</td>
                  <td>{record.loginDate}</td>
                  <td>{record.loginTime}</td>
                  <td>{record.logoutTime || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDateFilter && (
        <div className="attendance-filters">
           <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
             id="startDate"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
             id="endDate"
          />
          <button onClick={fetchRecordsByDate} className="timestampdate-button">
            Search
          </button>
        </div>
      )}
      {/* {dateTimestamps.length>0 && (
         <div>
           <h3>Attendance Records by Date</h3>
          <table className="timestampdate-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>date</th>
                <th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {dateTimestamps.map((record,index) =>(
                <tr key={index}>
                  <td>{record.userName}</td>
                  <td>{record.date}</td>
                  <td>{record.totalHours}</td>
                </tr>
              ))}
            </tbody>
          </table>
         </div> 
      )} */}
    </div>    
  )
};
export default Attendance;
