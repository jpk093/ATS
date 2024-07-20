import React, { useEffect } from 'react';
import "./home.css";
import { useNavigate } from 'react-router-dom';

const Home =() =>{
    const navigate=useNavigate();
    useEffect (() =>{
        //Check if user is already logged in 
        const token =localStorage.getItem("token");
        if(token){
            console.log("Token found, redirecting to /dashboard");
            navigate('/dashboard');
        }
    },[navigate]);
    const handleSignIn = () => {
        window.open("/signin", "_self");
      };
    
      const handleSignUp = () => {
          window.open('/signup', '_self')
      }
    return (
        <div className='home-page'>
            <h2>Welcome to the Home Page</h2>
            <div >
                <button className="page-styles" type="button" onClick={handleSignUp}>
                    Sign Up
                </button><br/>
                <button className="page-styles" type="button" onClick={handleSignIn}>
                    Sign In
                </button>
            </div>
        </div>
    )
}
export default Home;