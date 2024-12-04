import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale, // "category" 스케일
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import Navbar from "./navbar";
import "../cssPages/viewGrade.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ViewGrade = () => {
  const [email, setEmail] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [midterm, setMidterm] = useState(0);
  const [final, setFinal] = useState(0);
  const [gp, setGps] = useState(0);
  const [attendance, setAttendance] = useState(0);
  const [finalHistogramData, setFinalHistogramData] = useState([]);
  const [midtermHistogramData, setMidtermHistogramData] = useState([]);
  const [gpHistogramData, setGpHistogramData] = useState([]);
  const [assignmentsHistogramData, setAssignmentsHistogramData] = useState([]);
  const [letterGrade, setLetterGrade] = useState("N/A");
  const [finalScoreIn100, setFinalScoreIn100] = useState(0);
  const [finalScores, setFinalScores] = useState(0);

  useEffect(() => { //user email 불러오기
    const fetchUserEmail = async () => {
      try {
        const token = await getAccessToken();
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
  });

  useEffect(() => { //불러온 이메일로 user의 성적 불러오기
    const fetchGrades = async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          console.error("No access token found");
          return;
        }

        const response = await axios.post("http://localhost:3001/api/grades/all",
          { email }, // 요청 본문에 email 추가
          {
            headers: { Authorization: `Bearer ${token}` }, // 인증 토큰 포함
          }
        );

        const data = response.data;

        const assignmentGrades = [data.assignment1, data.assignment2, data.assignment3, data.assignment4];
        console.log("Assignment Grades: ", assignmentGrades);

        setAssignments(assignmentGrades); //assignments 변수에 배열 할당
        setMidterm(data.midterm); 
        setFinal(data.final);
        setGps(data.group_project);
        setAttendance(data.attendance); //user의 모든 성적을 받음

      
        if (assignmentGrades.every((grade) => grade !== undefined)) { //이거는 user의 letter grade를 계산하기 위함
          calculateFinalGrade(assignmentGrades, midterm, final, gp, attendance);
        } else {
          console.warn("Incomplete assignment grades:", assignmentGrades);
        }
    
//여기서부터는 user와 다른 학생들의 성적을 비교하여 그래프로 나타내기 위한 코드 부분

        const excludedEmail = email; // 제외할 이메일
        //console.log(email);
        const filteredGradesRes = await axios.get( //user의 이메일을 제외하고 나머지 학생들의 성적 불러오기
          `http://localhost:3001/api/grades/filter-email?email=${excludedEmail}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        calculateFinalHistogram(filteredGradesRes.data, 'final', setFinalHistogramData);
        calculateMtHistogram(filteredGradesRes.data, 'midterm', setMidtermHistogramData);
        calculateGpHistogram(filteredGradesRes.data, 'group_project', setGpHistogramData);
        calculateAsmtHistogram(filteredGradesRes.data, 'assignment1','assignment2',
                                'assignment3','assignment4', setAssignmentsHistogramData);
        
      } catch (error) {
        console.error("Error fetching grades:", error);
      }

    };
    if (email) {
      fetchGrades();
    }
    
  }, [email]);



  const getAccessToken = async () => {
    let token = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (!token) {
        throw new Error("Access token not found or expired.");
      }

      // Verify token validity
      const tokenPayload = JSON.parse(atob(token.split(".")[1]));
      if (Date.now() >= tokenPayload.exp * 1000) {
        throw new Error("Access token expired.");
      }

      return token;
    } catch (err) {
      console.warn(err.message);

      // Use refresh token to get a new access token
      if (refreshToken) {
        try {
          const response = await axios.post("http://localhost:3001/api/token/refresh", {
            token: refreshToken,
          });

          const newAccessToken = response.data.accessToken;
          localStorage.setItem("accessToken", newAccessToken);

          return newAccessToken;
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
          alert("Session expired. Please log in again.");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/homepage";
        }
      } else {
        alert("No refresh token available. Please log in again.");
        window.location.href = "/homepage";
      }
    }
    return null;
  };

  const calculateFinalHistogram = (data, key, setHistogram) => {
    const scores = data.map(row => row[key]);
    const histogram = Array(8).fill(0); // 8 bins: 0-10, 10-20, ..., 70-75
    scores.forEach(score => {
      if (score <= 70) {
        const binIndex = Math.floor(score / 10);
        histogram[binIndex]++;
      } else if (score <= 75) {
        histogram[7]++; // Last bin for scores between 70-75
      }
    });
    setHistogram(histogram);
  };

  const calculateMtHistogram = (data, key, setHistogram) => {
    const scores = data.map(row => row[key]);
    const histogram = Array(5).fill(0); // 5 bins: 0-10, 10-20, ..., 40-50
    scores.forEach(score => {
      if (score <= 50) {
        const binIndex = Math.floor(score / 10);
        histogram[binIndex]++;
      }
    });
    setHistogram(histogram);
  };

  const calculateGpHistogram = (data, key, setHistogram) => {
    const scores = data.map(row => row[key]);
    const histogram = Array(5).fill(0);
    scores.forEach(score => {
      if (score <= 125) {
        const binIndex = Math.floor(score / 25);
        histogram[binIndex]++;
      }
    });
    setHistogram(histogram);
  };
  const calculateAsmtHistogram = (data, key1, key2, key3, key4, setHistogram) => {
    const scores1 = data.map(row => row[key1]); //모든 사용자의 ass1
    const scores2 = data.map(row => row[key2]); //모든 사용자의 ass2
    const scores3 = data.map(row => row[key3]);
    const scores4 = data.map(row => row[key4]);
    const totalScores = scores1.map((_, index) => 
      (parseFloat(scores1[index] || 0) + 
       parseFloat(scores2[index] || 0) + 
       parseFloat(scores3[index] || 0) + 
       parseFloat(scores4[index] || 0))
    );
    console.log("total asmt scores: ", totalScores);
    
    const histogram = Array(5).fill(0); // 5 bins: 0-25, 25-50, ...., 200-225
    totalScores.forEach(score => {
        if (score <= 225) {
          const binIndex = Math.floor(score / 25);
          histogram[binIndex]++;
        }
      });
      setHistogram(histogram);
  };
  

  useEffect(() => {
    if (assignments.length > 0) {
      console.log("Assignments updated: ", assignments);
      calculateFinalGrade(assignments, midterm, final, gp, attendance);
    }
  }, [assignments]);

  const calculateFinalGrade = (assignments, midterm, final, gp, attendance) => {
    if (!assignments || assignments.length < 4) {
      console.error("Assignments array is incomplete:", assignments);
      return;
    }
    console.log("assignments", assignments); 

    const totalAsmt = assignments.reduce((sums, score) => {
      const parsedScore = parseFloat(score);
      if (isNaN(parsedScore)) {
        console.warn(`Invalid number detected: "${score}"`);
        return sums; // 무시
      }
      return sums + parsedScore;
    }, 0);

    const parsedMidterm = parseFloat(midterm);
    const parsedFinal = parseFloat(final);
    const parsedGp = parseFloat(gp);
    const parsedAt = parseFloat(attendance);

    
    const total = totalAsmt + parsedMidterm + parsedFinal + parsedGp - (parsedAt * 0.25);
    
    const finalScore = total;
    setFinalScores(finalScore);

    const finalScorePercentage = finalScore / 500 * 100;
    setFinalScoreIn100(finalScorePercentage);


    if(finalScore >= 465) setLetterGrade('A');
    else if (finalScore >= 450) setLetterGrade('A-');
    else if (finalScore >= 435) setLetterGrade('B+');
    else if (finalScore >= 415) setLetterGrade('B');
    else if (finalScore >= 400) setLetterGrade('B-');
    else if (finalScore >= 385) setLetterGrade('C+');
    else if (finalScore >= 365) setLetterGrade('C');
    else if (finalScore >= 350) setLetterGrade('C-');
    else if (finalScore >= 335) setLetterGrade('D+');
    else setLetterGrade('D');
      
  };


  return (
    <div className="view-grade-page">
      <Navbar />
        <div className="charts-only">

        {/* Final Exam Histogram */}
        <div className="grade-card" style={{ width: '450px', height: '350px' }}>
          <h2>Final Exam</h2>
          <Bar
            data={{
              labels: ["0-10", "10-20", "20-30", "30-40", "40-50", "50-60", "60-70", "70-75"],
              datasets: [
                {
                  label: "Number of Students",
                  data: finalHistogramData,
                  backgroundColor: "rgba(153, 102, 255, 0.6)",
                },
              ],
            }}
          />
        </div>



        {/* Midterm Histogram */}
        <div className="grade-card" style={{ width: '450px', height: '350px' }}>
          <h2>Midterm Exam</h2>
          <Bar
            data={{
              labels: ["0-10", "10-20", "20-30", "30-40", "40-50"],
              datasets: [
                {
                  label: "Number of Students",
                  data: midtermHistogramData,
                  backgroundColor: "rgba(75, 192, 192, 0.6)",
                },
              ],
            }}
          />
        </div>

        {/* Group Project Histogram */}
        <div className="grade-card" style={{ width: '450px', height: '350px' }}>
          <h2>Group Project</h2>
          <Bar
            data={{
              labels: ["0-25", "25-50", "50-75", "75-100", "100-125"],
              datasets: [
                {
                  label: "Number of Students",
                  data: gpHistogramData,
                  backgroundColor: "rgba(255, 159, 64, 0.6)",
                },
              ],
            }}
          />
        </div>

        {/* Assignment Histogram */}
        <div className="grade-card" style={{ width: '450px', height: '350px' }}>
          <h2>Assignments</h2>
          <Bar
            data={{
              labels: ["0-25", "25-50", "50-75", "75-100", "100-125", "125-150", "150-175", "175-200", "200-225"],
              datasets: [
                {
                  label: "Total Assignment Scores",
                  data: assignmentsHistogramData, // 계산된 히스토그램 데이터
                  backgroundColor: "rgba(75, 192, 192, 0.6)",
                },
              ],
            }}
          />

        </div>


       {/* Anticipated Grade Section */}
       <div className="grade-summary">
          <h2>Your Grade Summary</h2>
          <p>
            <strong>Anticipated Letter Grade:</strong> {letterGrade}
          </p>
          <p>
            <strong>Final Score:</strong> {finalScores.toFixed(2)}
          </p>
          <p>
            <strong>Final Score in Percentage:</strong> {finalScoreIn100.toFixed(2)}%
          </p>
        </div>

      </div>
    </div>
  );
};

export default ViewGrade;
