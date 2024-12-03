import React, {useState} from 'react';
import '../cssPages/insertGrade.css';
import axios from 'axios';

function InsertGrade(){
  const [assignments, setAssignments] = useState([
    { id: 1, yourGrade: ''},
    { id: 2, yourGrade: ''},
    { id: 3, yourGrade: ''},
    { id: 4, yourGrade: ''},
  ]);
  const [midterm, setMidterm] = useState('');
  const [final, setFinal] = useState('');
  const [groupProject, setGroupProject] = useState('');
  const [attendance, setAttendance] = useState('');

  const addAssignment = () => {
    const newId = assignments.length + 1;
    setAssignments([
      ...assignments,
      { id: newId, yourGrade: ''},
    ]);
  };
  const removeAssignment = () => {
    if (assignments.length > 1) {
      setAssignments(assignments.slice(0, -1));
    }
  };

  const handleConfirm = () => {
    const gradesData = {
      assignment1: assignments[0]?.yourGrade || null,
      assignment2: assignments[1]?.yourGrade || null,
      assignment3: assignments[2]?.yourGrade || null,
      assignment4: assignments[3]?.yourGrade || null,
      midterm,
      final,
      group_project: groupProject,
      attendance,
    };

    axios.post('http://localhost:3001/api/grades', gradesData)
      .then((response) => {
        alert(response.data.message);
      })
      .catch((error) => {
        console.error('Error saving grades:', error);
        alert('Failed to save grades');
      });
  };

  return (
    <div className='temp'>
      <div className='gradeWholeContainer'>
        <div className='assignments'>
          <div className='asmtGradeDist'>
            <p><strong>Your Grade </strong></p>
            <p><strong>Total Grade</strong></p>
          </div>
          
          {assignments.map((asmt) => (
            <div className="asmtContainer" key={asmt.id}>
              <p>Assignment {asmt.id}:</p>
              <div className="asmtInput">
                <input
                  type="text"
                  className="asmtGrd"
                  value={asmt.yourGrade}
                  onChange={(e) => {
                    const updatedAssignments = assignments.map((assignment) =>
                      assignment.id === asmt.id
                        ? { ...assignment, yourGrade: e.target.value }
                        : assignment
                    );
                    setAssignments(updatedAssignments);
                  }}
                />
                <p><strong>{asmt.id === 1 ? "/ 225" : ""}</strong></p>
              </div>
            </div>
          ))}
          <div className='asmtIcons'>
            <img
              src={'/add.png'}
              alt={'add icon'}
              width={"40px"}
              style={{ cursor: "pointer" }}
              onClick={addAssignment}
            />

            <img
              src={'/remove.png'}
              alt={'subtract icon'}
              width={"40px"}
              style={{ cursor: "pointer" }}
              onClick={removeAssignment}
            />
            
          </div>
        </div>
        
        <div className='tests'>
          <div className='testGradeDist'>
            <p><strong>Your Grade</strong></p>
            <p><strong>Total Grade</strong></p>
          </div>

          <div className='testContainer'>
            <p>Midterm:</p>
            <div className='testInput'>
              <input type="text" className="testGrd" value={midterm} onChange={(e) => setMidterm(e.target.value)}/> 
              <p><strong>/ 50</strong></p>
            </div>
          </div>

          <div className='finalTestContainer'>
            <p>Final:</p>
            <div className='testInput'>
              <input type="text" className="testGrd" value={final} onChange={(e) => setFinal(e.target.value)}/> 
              <p><strong>/ 75</strong></p>
            </div>
          </div>

          <div className='gpContainer'>
            <p>Group Project:</p>
              <div className='testInput'>
                <input type="text" className="testGrd" value={groupProject} onChange={(e) => setGroupProject(e.target.value)}/> 
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
                <input type="text" className="testGrd" value={attendance} onChange={(e) => setAttendance(e.target.value)}/>
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
