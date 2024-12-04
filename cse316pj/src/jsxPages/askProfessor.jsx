import '../cssPages/askProfessor.css';
import { useEffect, useState } from 'react';
import Navbar from './navbar';
import axios from 'axios';

const AskProfessor = () => {
  const [questionList, setQuestionList] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const professorInfo = {
    name: 'Professor John Doe',
    email: 'johndoe@example.com',
    office: 'Room 415, Building A',
    officeHour: 'Monday TuesDay Wednesday 3-5 PM',
    image: '../../public/user.png',
  };

  useEffect(() => {
    // Fetch questions from the server
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No authentication token found");
          return;
        }
        const response = await axios.get('http://localhost:3001/api/questions');
        setQuestionList([...questionList, response.data]);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, []);


  const questionSubmission = async () => {
    if (newQuestion.trim() === '') {
      alert("Question empty");
      return; // empty list check
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('No authentication token found');
        return;
      }
      // Post a new question to the server
      const response = await axios.post('http://localhost:3001/api/questions', {
        question: newQuestion,
      });

      //save new question to a question list
      alert(response.data);
      setNewQuestion(''); //initialize new question
    } catch (error) {
      console.error('Error submitting question:', error);
      if (error.response && error.response.status === 401) {
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            alert('Session expired. Please sign in again.');
            return;
          }
  
          const refreshResponse = await axios.post('http://localhost:3001/api/token/refresh', {
            token: refreshToken,
          });
  
          const newAccessToken = refreshResponse.data.accessToken;
          localStorage.setItem('authToken', newAccessToken); 
  
          await questionSubmission();
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          alert('Session expired. Please sign in again.');
        }
      } else {
        alert('An error occurred while submitting your question.');
      }
    }
  };

  return (
    <div className="ask-professor-page">
      <Navbar />
      <h1>Ask Professor</h1>

      {/* Professor Info Card */}
      <div className="professor-card">
        <img src={professorInfo.image} alt="Professor" className="professor-image" />
        <h2>{professorInfo.name}</h2>
        <p>Email: {professorInfo.email} </p>
        <p>Office: {professorInfo.office}</p>
        <p>Office Hour: {professorInfo.officeHour}</p>
      </div>

      {/* Input and submit new question*/}
      <div className="ask-input">
        <textarea
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Enter your question here..."
        />
        <button onClick={questionSubmission}>Submit</button>
      </div>

      {/*Display Question-list*/}
      <div className="question-list">
        <h3>Questions:</h3>
        {questionList.length === 0 ? 
          (<p>No questions yet. Ask the professor!</p>)
          : 
          (<ul>
            {questionList.map((question, index) => (
              <li key={index}>{question}</li>
            ))}
          </ul>)
        }
      </div>
    </div>
  );
};

export default AskProfessor;




