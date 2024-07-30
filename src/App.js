import React from 'react';
import { BrowserRouter as Router,Route, Routes } from 'react-router-dom';
import Home from './home/Home'
import SignUp  from './signUp/SignUp'; 
import SignIn  from './signIn/SignIn';
import Dashboard from './dashboard/Dashboard';
import Profile from './profile/Profile';
// import './App.css';
import Attendance from './attendance/Attendance';
import Private from './private/Private';
import Jobs from './job/Jobs';
import Requisitions from './requisitions/Requisitions';
import Candidates from './candidates/Candidates';
import Submissions from './submission/Submissions';
import Interviews from './interview/Interviews';
import Employees from './employee/Employees';
import Assignments from './assignment/Assignments';

function App(){
    return(
        <Router>
            <Routes>
                <Route exact path="/" element={<Home />} />
                <Route exact path="/signup" element={<SignUp />} />
                <Route exact path="/signin" element={<SignIn />} />
                <Route exact path="/dashboard" element={<Private><Dashboard /></Private>} />
                <Route exact path="/profile" element={<Profile />} />
                <Route exact path="/attendance" element={<Private><Attendance/></Private>} />
                <Route exact path="/jobs" element={<Private><Jobs/></Private>} />
                <Route exact path="/requisitions" element={<Private><Requisitions/></Private>} />
                <Route exact path="/candidates" element={<Private><Candidates/></Private>} />
                <Route exact path="/submissions" element={<Private><Submissions/></Private>} />
                <Route exact path="/interviews" element={<Private><Interviews/></Private>} />
                <Route exact path="/employees" element={<Private><Employees/></Private>} />
                <Route exact path="/assignments" element={<Private><Assignments/></Private>} />
                
                {/* <Route path="/notification" component={Notification} />
                <Route path="/logout" component={Logout} /> */} 
            </Routes>
        </Router>
    )
}
export default App;