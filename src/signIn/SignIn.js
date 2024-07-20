import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SignIn.css'; // Import the CSS file
import { appUrl } from '../signUp/SignUp';


const SignIn =() =>{
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSignIn=async() =>{
        try{
            const response=await axios.post(`${appUrl}/signin`,{
                email,
                password
            })
            if(response.data.message ==="Sign In successfully!"){
                const token= response.data.token;
                const{id,userName,email}= response.data.user;
                
                console.log("Token received:",token);
                console.log("User info received:",{id,userName,email});

                //Check if token is undefined before storing
                
                //Store token and user information in session storage
                localStorage.setItem('token',token);
                localStorage.setItem('user',JSON.stringify({id,userName,email}));
                
                console.log("Sign In successfully!:",response.data);
                setMessage("Sign In successfully!");
                navigate('/dashboard')
                
            }else{
                setMessage('Sign In failed,Please check your email and password.');
            }
        }catch(error){
            if(error.response){
                setMessage(error.response.data.message);
            }else{
                setMessage("An Error occured,Please try again later.");
            }
        }
    }
    const handleCancel = async () => {
        window.open("/", "_self");
      };
    return(
        <div classname='signin-page'>
            <h2>Sign In</h2>
            <form>
                <div className='form-group'>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className='form-group'>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className='button-group'>
                    <button type="button" onClick={handleSignIn}>Sign In</button>
                    <button type="button" onClick={handleCancel}>Cancel</button>
                </div>
                {message && <p>{message}</p>}
            </form>
        </div>
    )
}
export default SignIn;