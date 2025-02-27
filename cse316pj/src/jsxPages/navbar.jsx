import React, {useContext, useEffect} from "react";
import '../cssPages/navbar.css'
import { ProfileContext } from "./profileContext";
import { Link, useNavigate } from "react-router-dom";



function Navbar(){
  const { profileImage, setProfileImage, loading} = useContext(ProfileContext);
  const navigate = useNavigate();

  const isAuthenticated = () => !!localStorage.getItem("accessToken");

  useEffect(() => {
    if (!isAuthenticated()) {
      setProfileImage("./user.png");
    }
  });

  const handleMenuClick = (path) => {
    if (isAuthenticated()) {
        navigate(path); 
    } else {
        alert("You must be logged in to access this page.");
    }
  };

  return(
    <nav>
      {/* Changed all <a href=> to <Link> */}
        <ul>
          
          <li className="home-button">
            <Link to="/homepage">
              <svg xmlns="http://www.w3.org/2000/svg" height="35" viewBox="0 -960 960 960" width="35" fill="white">
                <path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z" />
              </svg>
            </Link>
          </li>
          

          {/* codes for Facility List, Reservation, User menus on nav bar */}
          <div className="navCenter-menu">
            <li className="hideOnMobile">
              <Link to="/insertGrade" onClick={() => handleMenuClick('/insertGrade')}><p>Insert Grade</p></Link>
            </li>
            <li className="hideOnMobile">
              <Link to="/viewGrade" onClick={() => handleMenuClick('/viewGrade')}><p>View Grade</p></Link>
            </li>
            <li className="hideOnMobile">
              <Link to="/askProfessor" onClick={() => handleMenuClick('/askProfessor')}><p>Ask Professor</p></Link>
            </li>
            <li className="hideOnMobile">
            <Link to="/userInfo" className="user" onClick={() => handleMenuClick('/userInfo')}>
                <p>User Info</p>
              </Link>
            </li>
          </div>

          {/* Hamburger menu button appears */}
          
          <li className="menu-button" onClick={showHamburger}>
            <Link to = "#">
              <svg xmlns="http://www.w3.org/2000/svg" height="26" viewBox="0 -960 960 960" width="26" fill="#5f6368">
                <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
              </svg>
            </Link>
          </li>
          

          
          <li className="signin-nav hideOnMobile">
            {!loading && (
                        <img src={profileImage} alt="Profile" className="navbar-profile-image" />
                    )}
          </li> 
        </ul>

        {/* hamburger menu details */}
        <ul className="hamburger">
          <li>
            <Link to="/insertGrade">Insert Grade</Link>
          </li>
          <li>
            <Link to="/viewGrade" onClick={() => handleMenuClick('/viewGrade')}>View Grade</Link>
          </li>
          <li>
            <Link to="/askProfessor" onClick={() => handleMenuClick('/askProfessor')}>Ask Professor</Link>
          </li>
          <li>
            <Link to="/userInfo" onClick={() => handleMenuClick('/userInfo')}>User Information</Link>
          </li>
        </ul>
    </nav>
  );
}

function showHamburger(){
  const hamburger = document.querySelector('.hamburger');
  const bodyContent = document.querySelector('body');
  
  /* Pushing every contents down when Hamburger menu expanded */
  if (hamburger.style.display === "flex") {
      hamburger.style.display = "none";
      bodyContent.style.marginTop = "100px";
    } else {
      hamburger.style.display = "flex";
      bodyContent.style.marginTop = "250px";
    }
}

export default Navbar;