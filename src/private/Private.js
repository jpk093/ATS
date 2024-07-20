import React from 'react';
import { Navigate } from 'react-router-dom';

const Private =({children}) =>{
 const user=localStorage.getItem('user');
 return user?children:<Navigate to="/signin"/>;
}

export default Private;