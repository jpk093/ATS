import React,{useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './signup.css';
// Local
const appUrl = "http://localhost:3001";

const SignUp = ()=>{
    const [userName,setUserName]=useState('');
    const [password,setPassword]=useState('');
    const [email,setEmail]=useState('');
    const [message,setMessage]=useState('');
    const navigate = useNavigate();

    const handleCancel = async () => {
        window.open("/", "_self");
      };
    const handleSignUp=async() =>{
        try{
            const response=await axios.post(`${appUrl}/signup`,{
                userName,
                password,
                email,
            });
            console.log(response.data);

            // Check if the signup was successful
            if (response.data.message === "User successfully signed up!") {
                const token=response.data.token;
                const{id,userName,email}=response.data.user;
                
                //Store token and user information in session storage
                localStorage.setItem('token',token);
                localStorage.setItem('user',JSON.stringify({id,userName,email}));
                console.log("User successfully signed up!:", response.data);
                // Set success message
                setMessage("User successfully signed up!");
                navigate('/dashboard')
            }
        }catch(error){
            if(error.response){
                setMessage(error.response.data.message);
            }else{
                setMessage("An error occurred,Please try again later.");
            }
        }
    }
    return(
        <div className="signup-page">
            <h2>Sign Up</h2>
            <form  className="signup-form">
                <div>
                    <label>UserName:</label>
                    <input  
                        type="text"
                        placeholder="userName"
                        className="input-in-btn-con"
                        value={userName}
                        onChange={(e) =>setUserName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input  
                        type="email"
                        placeholder="email"
                        className="input-in-btn-con"
                        value={email}
                        onChange={(e) =>setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input  
                        type="password"
                        placeholder="password"
                        className="input-in-btn-con"
                        value={password}
                        onChange={(e) =>setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className='button-group'>
                    <button className="signup-btn-styles" type="button" onClick={handleSignUp} >Sign Up</button>
                    <button className="cancle-btn-styles" type="button" onClick={handleCancel}>Cancel</button>
                </div>
                {message && <p>{message}</p>}
            </form>
            
        </div>
    )
}

// export default {SignUp,appUrl};
export { appUrl, SignUp as default };