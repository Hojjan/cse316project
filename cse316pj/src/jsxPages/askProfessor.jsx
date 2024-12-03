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
        const response = await axios.get('http://localhost:3001/questions');
        setQuestions(response.data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, []);


  const questionSubmission = async () => {
    if (newQuestion.trim() === '') return; // empty list check

    try {
      // Post a new question to the server
      const response = await axios.post('http://localhost:3001/questions', {
        question: newQuestion,
      });

      //save new question to a question list
      setQuestionList([...questionList, response.data]);
      setNewQuestion(''); //initialize new question
    } catch (error) {
      console.error('Error submitting question:', error);
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




