import React, {useState, useEffect} from 'react';
import '../cssPages/insertGrade.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function InsertGrade(){
  const [assignments, setAssignments] = useState(['','','','']);
  const [midterm, setMidterm] = useState('');
  const [final, setFinal] = useState('');
  const [groupProject, setGroupProject] = useState('');
  const [attendance, setAttendance] = useState('');
  const [email, setEmail] = useState("");

  const maxValues = {
    assignments: [50, 50, 50, 75], // 각 assignment의 최대값
    midterm: 50,
    final: 75,
    groupProject: 125,
    attendance: 25,
  };


  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const token = localStorage.getItem("accessToken"); // 토큰 이름을 accessToken으로 변경
        if (!token) {
          console.error("No authentication token found.");
          return;
        }

        const response = await axios.get("http://localhost:3001/api/user/info", {
          headers: {
            Authorization: `Bearer ${token}`, // 헤더에 토큰 포함
          },
        });

        const userEmail = response.data.email; // 서버에서 받은 email 데이터
        setEmail(userEmail); // 이메일 상태로 설정
      } catch (error) {
        console.error("Error fetching user info:", error);
        alert("Failed to fetch user information.");
      }
    };

    fetchUserEmail();
  }, []);

  const validateInput = (value, maxValue) => {
    const numericValue = parseFloat(value || 0);
    return numericValue > maxValue ? maxValue : value;
  };

  const handleAssignmentChange = (index, value) => {
    const updatedAssignments = [...assignments];
    updatedAssignments[index] = validateInput(value, maxValues.assignments[index]);
    setAssignments(updatedAssignments);
  };
  const navigate = useNavigate();
  const handleConfirm = () => {
    if (assignments.some(assignment => assignment === '') ||
      midterm === '' ||
      final === '' ||
      groupProject === '' ) {
      alert("Please fill out all input fields before confirming.");
      return; // Stop further execution
    }

    const gradesData = {
      assignment1: assignments[0] || null,
      assignment2: assignments[1] || null,
      assignment3: assignments[2] || null,
      assignment4: assignments[3] || null,
      midterm,
      final,
      group_project: groupProject,
      attendance,
      email
    };
    
    axios.post('http://localhost:3001/api/mygrades', gradesData)
      .then((response) => {
        alert(response.data.message);
        
        navigate("/viewGrade");
      })
      .catch((error) => {
        console.error('Error saving grades:', error);
        if (error.response && error.response.data && error.response.data.error) {
          alert(error.response.data.error); // Display server error message
        } else {
          alert('Failed to save grades');
        }
      })
  };

  return (
    <div className='temp'>
      <div className='gradeWholeContainer'>
        <div className='assignments'>
          <div className='asmtGradeDist'>
            <p><strong>Your Grade </strong></p>
            <p><strong>Total Grade</strong></p>
          </div>
          {assignments.map((assignment, index) => (
            <div className='asmtContainer' key={index}>
              <p>Assignment {index + 1}:</p>
              <div className='asmtInput'>
                <input
                  type="text"
                  className="amstGrd"
                  value={assignment}
                  onChange={(e) => handleAssignmentChange(index, e.target.value)}
                />
                <p><strong>{`/ ${maxValues.assignments[index]}`}</strong></p>
              </div>
            </div>
          ))}
        </div>
        
        <div className='tests'>
          <div className='testGradeDist'>
            <p><strong>Your Grade</strong></p>
            <p><strong>Total Grade</strong></p>
          </div>

          <div className='testContainer'>
            <p>Midterm:</p>
            <div className='testInput'>
              <input type="text" className="testGrd" value={midterm} onChange={(e) => setMidterm(validateInput(e.target.value, maxValues.midterm))}/> 
              <p><strong>/ 50</strong></p>
            </div>
          </div>

          <div className='finalTestContainer'>
            <p>Final:</p>
            <div className='testInput'>
              <input type="text" className="testGrd" value={final} onChange={(e) => setFinal(validateInput(e.target.value, maxValues.final))}/> 
              <p><strong>/ 75</strong></p>
            </div>
          </div>

          <div className='gpContainer'>
            <p>Group Project:</p>
              <div className='testInput'>
                <input type="text" className="testGrd" value={groupProject} onChange={(e) => setGroupProject(validateInput(e.target.value, maxValues.groupProject))}/> 
                <p><strong>/ 125</strong></p>
              </div>
          </div>
        </div>

        <div className='groupProject'>
          <div className='attdGradeDist'>
            <p><strong>Absent Times</strong></p>
            <p><strong>Total Grade</strong></p>
          </div>

          <div className='attdContainer'>
            <p>Attendance:</p>
              <div className='testInput'>
                <input type="text" className="testGrd" value={attendance} onChange={(e) => setAttendance(validateInput(e.target.value, maxValues.attendance))}/>
                <p><strong>/ 25</strong></p>
              </div>
          </div>
        </div>

      </div>
      <button className='confirmBtn' onClick={handleConfirm}>Confirm</button>

    </div>
  );
};

export default InsertGrade;
