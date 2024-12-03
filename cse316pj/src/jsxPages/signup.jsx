import React, { useState } from "react";
import '../cssPages/signup.css'
import axios from "axios";
import { hashutil } from "../hashutil/javascript/Hashutil";


function Signup(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [checkpw, setCheckpw] = useState('');
    const [username, setUsername] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [agree, setAgree] = useState(false);
    const [showModal, setShowModal] = useState(false);

    React.useEffect(() => {
        document.body.classList.add('page-white-bg');
        return () => {
            document.body.classList.remove('page-white-bg');
        };
    }, []);

    const handleSignup = () => {
        if (!agree) {
            alert("Agreement to the FERPA rules is required to sign up!");
            return;
        }
        if (!email) {
            alert("Email is not entered.");
            return;
        }

        if (!password || !checkpw) {
            alert("Password or confirm password is not entered.");
            return;
        }
        
        if (!username) {
            alert("Username is not entered.");
            return;
        }

        if (password !== checkpw) {
            alert("Confirm password is not the same with password.");
            return;
        }

        const hashedPassword = hashutil(email, password);
        const newAccount = {email: email, password: hashedPassword, username: username}

        axios.post('http://localhost:3001/api/user/signup', newAccount)
            .then((response) => {
                const {message} = response.data;
                alert(message);
                setEmail("");
                setPassword("");
                setCheckpw("");
                setUsername("");
                setAgree(false);
            })
            .catch((error) => {
                if (error.response) {
                    console.error("Error response:", error.response);
                    alert(`Error: ${error.response.data.error}`);
                } else {
                    console.error("Error:", error);
                    alert("An error occurred. Please try again.");
                }
            });

    };

    return(
        <div className="wholeSignUp">
            <p className="title">Sign up</p>
            <div className="signUp-container">
                <div className="email-container">
                    <p>E-mail</p>
                    <input type="text" className="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                </div> 
                <div className="password-container">
                    <p>Password</p>
                    <input type="password" className="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                </div>
                <div className="passwordCheck-container">
                    <p>Password Check</p>
                    <input type="password" className="password-check" value={checkpw} onChange={(e) => setCheckpw(e.target.value)}/>
                </div>
                <div className="username-container">
                    <p>User Name</p>
                    <input type="text" className="username" value={username} onChange={(e) => setUsername(e.target.value)}/>
                </div>
                <div className="dropdown-container">
                    <p>Academic Year</p>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="dropdown">
                        <option value="">-- Select Year --</option>
                        <option value="Freshman">Freshman</option>
                        <option value="Sophomore">Sophomore</option>
                        <option value="Junior">Junior</option>
                        <option value="Senior">Senior</option>
                    </select>
                </div>
            </div>
            {/* FERPA Rules Agreement */}
            <div className="agreement-section">
                <button onClick={() => setShowModal(true)} className="view-ferparules">
                    FERPA Rules Agreement
                </button>
                <div className="form-check">
                    <input
                        type="checkbox"
                        id="agree"
                        className="form-check-input"
                        checked={agree}
                        onChange={() => setAgree(!agree)}
                    />
                    <label htmlFor="agree" className="form-check-label ms-3">
                        By checking this box, I agree to the FERPA Rules
                    </label>
                </div>
            </div>
            <div className="signButton">
                <button className="signup-signup" onClick={handleSignup}>Sign up</button>
            </div>
            {/* Modal for FERPA RULES */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>FERPA Rules</h2>
                        <p>
                        The Family Educational Rights and Privacy Act (FERPA) is a federal law 
                        that affords parents the right to have access to their children’s education records, 
                        the right to seek to have the records amended, and the right to have some control 
                        over the disclosure of personally identifiable information from the education records. 
                        When a student turns 18 years old, or enters a postsecondary institution at any age, the rights 
                        under FERPA transfer from the parents to the student (“eligible student”). 
                        The FERPA statute is found at 20 U.S.C. § 1232g and the FERPA regulations are found at 34 CFR Part 99. 
                        By agreeing, you acknowledge that you understand your rights and responsibilities under FERPA.
                        </p>
                        <button className="close-modal" onClick={() => setShowModal(false)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Signup;