import React from "react";
import '../cssPages/homepage.css';
import { Link } from "react-router-dom";

function Home(){
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
              An introuction to systematic design, development and testing of software
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
          <div className="containers">
              <div className="email-container">
                  <p>School ID:</p>
                  <input type="text" className="email"  />  
              </div> 
              <div className="password-container">
                  <p>Password:</p>
                  <input type="password" className="password" />
              </div>
          </div>
          <div className="signButtons">
              <button className="signin-signin">Sign in</button>
              <Link to="/signup">
                  <button className="signin-signup">Sign up</button>
              </Link>
          </div>
      </div>
    </div>
  );
}

export default Home;