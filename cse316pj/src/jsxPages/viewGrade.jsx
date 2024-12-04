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
  const [assignments, setAssignments] = useState();
  const [midterm, setMidterm] = useState(0);
  const [final, setFinal] = useState(0);
  const [gp, setGps] = useState(0);
  const [attendance, setAttendance] = useState(0);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [finalScores, setFinalScores] = useState([]);
  const [finalHistogramData, setFinalHistogramData] = useState([]);
  const [letterGrade, setLetterGrade] = useState("N/A");

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

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.error("No access token found");
          return;
        }

        const response = await axios.get("http://localhost:3001/api/grades/all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data;

        setAssignments([data.assignment1, data.assignment2, data.assignment3, data.assignment4]);
        setMidterm(data.midterm);
        setFinal(data.final);
        setGps(data.group_project);
        setAttendance(data.attendance);

      
        // Calculate final score and grade
        calculateFinalGrade(assignments, midterm, final, gp, attendance);

        const excludedEmail = email; // 제외할 이메일
        const filteredGradesRes = await axios.get(
          `http://localhost:3001/api/grades/filter-email?email=${excludedEmail}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        setFilteredGrades(filteredGradesRes.data);

        const scores = filteredGrades.map(row => row[5]); // Assuming 'final' is the 6th column (index 5)
        setFinalScores(scores);
        const histogram = Array(8).fill(0); // 8 bins: 0-10, 10-20, ..., 70-75
        scores.forEach(score => {
          if (score <= 70) {
            const binIndex = Math.floor(score / 10);
            histogram[binIndex]++;
          } else if (score <= 75) {
            histogram[7]++; // Last bin for scores between 70-75
          }
        });

        setFinalHistogramData(histogram);
      } catch (error) {
        alert("Failed to fetch grades.");
        console.error("Error fetching grades:", error);
      }

    };
    if (email) {
      fetchGrades();
    }
    
  }, [email]);

  const calculateFinalGrade = (assignments, midterm, final, gp, attendance) => {
    const total = assignments + midterm + final + gp + attendance; //assignments 4개로 따로 분리해서 더하기. 이대로 하면 오류 남
    const average = total / 5;

    // Assign final score to avg
    setFinalScores(average);

    // Assign letter grade based on average
    if(average >= 90) setLetterGrade('A');
    else if (average >= 80) setLetterGrade('B');
    else if (average >= 70) setLetterGrade('C');
    else if (average >= 60) setLetterGrade('D');
    else setLetterGrade('F');
      
  };


  return (
    <div className="view-grade-page">
      <Navbar />
        <div className="charts-only">
        {/* Assignment Scores Card */}
        <div className="grade-card" style={{ width: '500px', height: '400px' }}>
          <h2>Assignment Scores</h2>
          <Bar
            data={{
              labels: ["Standard Deviation"],
              datasets: [
                {
                  label: "Assignment Std Dev",
                  data: [],
                  backgroundColor: "rgba(75, 192, 192, 0.6)",
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: true, // 범례 표시
                  position: "top",
                },
                title: {
                  display: true,
                  text: "Assignment Standard Deviation",
                },
              },
              scales: {
                x: {
                  type: "category", // X축을 category로 설정
                },
                y: {
                  beginAtZero: true, // Y축 0부터 시작
                },
              },
            }}
          />
        </div>
        <p></p>
        {/* Test Scores Card */}
        <div className="grade-card" style={{ width: '500px', height: '400px' }}>
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
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: true, // 범례 표시
                  position: "top",
                },
                title: {
                  display: true,
                  text: "Final Test Scores Distribution",
                },
              },
              scales: {
                x: {
                  type: "category", // X축을 category로 설정
                },
                y: {
                  beginAtZero: true, // Y축 0부터 시작
                  title: {
                    display: true,
                    text: "Number of Students",
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ViewGrade;
