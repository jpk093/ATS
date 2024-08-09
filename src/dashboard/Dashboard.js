import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';
import {appUrl} from '../signUp/SignUp';
import axios from 'axios';
const Dashboard = () =>{
    const handleLogout =async() =>{
        try{
            // console.log('Token before logout:', localStorage.getItem('token'));
            // console.log('User before logout:', localStorage.getItem('user'));
            const response =await axios.get(`${appUrl}/logout`);

            if(response.data.message ==="Logout successful."){
                //Clear session storage 
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // localStorage.removeItem('isCheckedIn');

                // console.log('Token after logout:', localStorage.getItem('token'));
                // console.log('User after logout:', localStorage.getItem('user'));
                //Redirect to login 
                window.location.replace('/signin');
            }else{
                console.error("Logout failed:",response.data.message);
            }
        }catch(error){
            console.error("Logout error:",error);
        }
    }
    return(
        <div className='dashboard-page'>
            <button onClick={handleLogout} className='logout-page'>Logout</button>  
            <h2>Dashboard</h2>
            <div className='dashboard-links'>
                <Link to="/profile">Profile</Link>
                {/* <Link to="/settings">Settings</Link> */}
                <Link to="/attendance">Attendance</Link>
                <Link to="/jobs">Jobs</Link>
                <Link to="/requisitions">Requisitions</Link>
                <Link to="/candidates">Candidates</Link>
                <Link to="/submissions">Submissions</Link>
                <Link to="/interviews">Interviews</Link>
                <Link to="/employees">Employees</Link>
                <Link to="/assignments">Assignments</Link>
                <Link to="/tasks">Tasks</Link>
                <Link to="/onboarding">Onboarding</Link>
                
                
            </div>
            <div className='dashboard-widgets'>
                <div className='widget'>
                    <h3>Recent Activity</h3>
                    <p>Some Recent Activity here ...</p>
                </div>
                <div className='widget'>
                    <h3>Statistics</h3>
                    <p>Some Statistics here ...</p>
                </div>
                <div className='widget'>
                    <h3>Notifications</h3>
                    <ul>
                        <li>New message from Jay</li>
                        <li>System update available</li>
                        <li>Reminder: Meeting at 3 PM</li>
                        <li>Your report is ready for download</li>
                    </ul>
                </div>
                
            </div>
        </div>
    )
}
export default Dashboard;