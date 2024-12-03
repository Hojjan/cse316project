import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import '../cssPages/App.css'


import { ProfileProvider } from './profileContext';
import Navbar from './navbar';
import Home from './homepage';
import InsertGrade from "./insertGrade";
import Reservation from './reservation';
import Userinfo from './userInfo';
import ReservationHistory from './reservationHistory'; 
import Signin from './signin';
import Signup from './signup';

import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <ProfileProvider>
      <Router>
        <Navbar />
        {/* Used Route to apply navigation bar in every pages in common 
        path value is for additional info on the right side of server address*/}
        <Routes>
          <Route path="/" element={<Navigate to="/homepage" replace />} /> 
          <Route path="/homepage" element={<Home />} />
          <Route path="/insertGrade" element={<InsertGrade />} />
          <Route path="/viewGrade" element={<ProtectedRoute><ViewGrade /></ProtectedRoute>} />
          <Route path="/userInfo" element={<ProtectedRoute><Userinfo /></ProtectedRoute>} />
          <Route path="/reservationHistory" element={<ProtectedRoute><ReservationHistory /></ProtectedRoute>} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          
        </Routes>

      </Router>
    </ProfileProvider>
  );
}



export default App;
