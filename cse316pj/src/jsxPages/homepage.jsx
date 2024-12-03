import React, {useState, useEffect} from "react";
import '../cssPages/homepage.css';
import { Link } from "react-router-dom";
import axios from "axios";
import { hashutil } from "../hashutil/javascript/Hashutil";

function Home(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // 로그인 상태 확인
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    if (accessToken || refreshToken) {
      setIsAuthenticated(true);
      fetchUserInfo();
    }
  }, []);

  const fetchUserInfo = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get('http://localhost:3001/api/user/info', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setUserInfo(response.data); // 사용자 정보 저장
    } catch (error) {
      console.error(error);
      alert("Failed to fetch user information. Please sign in again.");
      setIsAuthenticated(false);
    }
  };

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
                setIsAuthenticated(true);
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

  const handleSignout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false); // 로그아웃 상태 변경
    setUserInfo(null);
    alert("Successfully signed out!");
  };

  return(
    <div className="homepage">
      <div className="homeWholeText">
        <div className="siteDesc">
          <p className="subtitle"><strong>Guess Grade:</strong></p> 
          <p>A web site for viewing grades of classmates, and calculating my temporary grades!</p>
        </div>
        <div>
          <p className="subtitle"><strong>About the course:</strong></p>
            <li>
              An introduction to systematic design, development and testing of software
              <p>systems, including even-driven and Web programming, information</p>
              <p>management, software design and development fundamentals.</p>
            </li>
            <li>
              The application of these sills to the construction of large robust programs.
            </li>
        </div>
      </div>
      <div className="homeLogin">
      <img className="ggLogo" src={'/webpageLogo.png'} alt={'webpage logo'} width={130}/>
        <p className="loginTitle"><strong>G</strong>uess <strong>G</strong>rade</p>
        {isAuthenticated ? (
          <div className="loggedInContent">
            {userInfo ? ( // userInfo가 null인지 확인
              <div className="userInfo">
                <p><strong>Username:</strong> {userInfo.username}</p>
                <p><strong>Email:</strong> {userInfo.email}</p>
                <p><strong>Year:</strong> {userInfo.year}</p>
              </div>
            ) : (
              <p>Loading user information...</p> // 데이터 로딩 중 메시지
            )}
            <p>Welcome back! You're logged in.</p>
            <button className="signout-button" onClick={handleSignout}>
              Sign out
            </button>
          </div>
        ) : (
          <div className="containers">
            <div className="homeEmail-container">
              <p>School ID:</p>
              <input
                type="text"
                className="homeEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="homePassword-container">
              <p>Password:</p>
              <input
                type="password"
                className="homePassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="signButtons">
              <button className="signin-signin" onClick={handleSignin}>
                Sign in
              </button>
              <Link to="/signup">
                <button className="signin-signup">Sign up</button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;