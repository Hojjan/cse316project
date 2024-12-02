import React, { useState } from "react";
import '../cssPages/signin.css'
import { Link } from "react-router-dom";
import axios from "axios";
import { hashutil } from "../hashutil/javascript/Hashutil";

function Signin(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    React.useEffect(() => {
        document.body.classList.add('page-white-bg');
        return () => {
            document.body.classList.remove('page-white-bg');
        };
    }, []);

    const handleSignin = () => {
        if (!email) {
            alert("Please enter your email.");
            return;
        }

        if (!password) {
            alert("Please enter your password.");
            return;
        }


        const hashedPassword = hashutil(email, password);
        const newAccount = {email: email, password: hashedPassword};


        axios.post('http://localhost:3001/api/user/signin', newAccount)
            .then((response) => {
                const { message, userId, accessToken, refreshToken } = response.data;
                alert(message);
                if (response.status === 200) { //If there is an error, sign out the account and limit the access
                    localStorage.setItem("userId", userId);
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken);
                    window.location.href = '/homepage'; // redirect to homepage
                }
            })
            .catch((error) => {
                if (error.response) {
                    alert(error.response.data.error);
                } else {
                    alert("An error occurred. Please try again.");
                }
            });
    };

    return(
        <div className="wholeSignIn">
            <p className="title">Sign in</p>
            <div className="containers">
                <div className="email-container">
                    <p>E-mail</p>
                    <input type="text" className="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                </div> 
                <div className="password-container">
                    <p>Password</p>
                    <input type="password" className="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                </div>
            </div>
            <div className="signButtons">
                <button className="signin-signin" onClick={handleSignin}>Sign in</button>
                <Link to="/signup">
                    <button className="signin-signup">Sign up</button>
                </Link>
            </div>
        </div>
    );
}

export default Signin;