import React from "react";
import { Navigate } from "react-router-dom";

function isAuthenticated() {
    const accesstoken = localStorage.getItem('accessToken');
    const refreshtoken = localStorage.getItem('accessToken');
    return !!accesstoken || !!refreshtoken; // 토큰이 존재하면 true, 없으면 false
}

function ProtectedRoute({ children }) {
    return isAuthenticated() ? children : <Navigate to="/homepage" />;
}

export default ProtectedRoute;
