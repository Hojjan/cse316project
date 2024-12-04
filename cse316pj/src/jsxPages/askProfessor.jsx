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
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.error("No authentication token found");
          return;
        }
        const response = await axios.get('http://localhost:3001/api/questions', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });        
        setQuestionList(response.data);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          console.log("Access token expired. Refreshing token...");
          await handleRefreshToken();
          return fetchQuestions();
        }
        console.error('Error fetching questions:', error);
      }
    };
    const handleRefreshToken = async () => {
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("Refresh token not found");
        }
    
        const response = await axios.post('http://localhost:3001/api/token/refresh', {
          token: refreshToken,
        });
    
        const newAccessToken = response.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);
        console.log("Access token refreshed.");
      } catch (error) {
        console.error("Failed to refresh token:", error);
        alert("Session expired. Please sign in again.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = '/homepage';
      }
    };

    fetchQuestions();
  }, []);

  //Delete questions function
  const deleteQuestions = async (qid) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No authentication token found");
        return;
      }
      //delete request to a server
      //used question's id
      await axios.delete(`http://localhost:3001/api/questions/${qid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      //filter removed question from the list 
      setQuestionList((prevQuestionList) => 
        prevQuestionList.filter((question) => question.id !== qid
      ));
      alert("Question has been deleted!");
      window.location.reload();
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
          localStorage.setItem('accessToken', newAccessToken); 
  
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
  //question submission function
  const questionSubmission = async () => {
    if (newQuestion.trim() === '') {
      alert("Question empty");
      return; // empty list check
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('No authentication token found');
        return;
      }
      // Post a new question to the server
      const response = await axios.post('http://localhost:3001/api/questions', 
        { question: newQuestion },
        { 
          headers: {
          Authorization: `Bearer ${token}`,
          },
        }
      );

      //save new question to a question list
      setQuestionList((prev) => [...prev,
        {
          id: response.data.questionId,
          question_text: response.data.questionText,
          user_email: response.data.userEmail,
        },
      ]);
      alert("Quetion uploaded successfully");
      window.location.reload();
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
          localStorage.setItem('accessToken', newAccessToken); 
  
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
            {questionList.map((question) => (
              <li key={question.id}>
                <span>{question.question_text}</span>
                <button className="btn btn-outline-danger btn-sm"
                  style={{
                    width: "20px",
                    height: "20px",
                    display: "inline-flex",
                    padding: "0",
                    alignItems: "center",
                    marginLeft: "8px",
                    justifyContent: "center",
                  }}
                  onClick={() => deleteQuestions(question.id)}> 
                  &times;
                </button>
              </li>
            ))}
          </ul>)
        }
      </div>
    </div>
  );
};

export default AskProfessor;




