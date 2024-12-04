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
  const [finalScore, setFinalScore] = useState(0);
  const [letterGrade, setLetterGrade] = useState("N/A");
  const [assignmentStdDev, setAssignmentStdDev] = useState(0);
  const [testStdDev, setTestStdDev] = useState(0);
  const [allGrades, setAllGrades] = useState({
    assignments: [],
    midterm: [],
    final: [],
    gp: [],
    attendance: [],
  });

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

        const excludedEmail = {email}; // 제외할 이메일
        const filteredGradesRes = await axios.get(
          `http://localhost:3001/api/grades/filter-email?email=${excludedEmail}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        const filteredGrades = filteredGradesRes.data;
  
      } catch (error) {
        alert("Failed to fetch grades.");
        console.error("Error fetching grades:", error);
      }

    };

    fetchGrades();
  }, []);

  const calculateFinalGrade = (assignments, midterm, final, gp, attendance) => {
    const total = assignments + midterm + final + gp + attendance; //assignments 4개로 따로 분리해서 더하기. 이대로 하면 오류 남
    const average = total / 5;

    // Assign final score to avg
    setFinalScore(average);

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
                data: [assignmentStdDev],
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
        <h2>Test Scores</h2>
        <Bar
          data={{
            labels: ["Standard Deviation"],
            datasets: [
              {
                label: "Test Std Dev",
                data: [testStdDev],
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
                text: "Test Standard Deviation",
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
      </div>

      {/* Final Score and Letter Grade */}
      <p></p>
      <div className="final-grade">
        <h3>Final Score: {finalScore}</h3>
        <h3>Letter Grade: {letterGrade}</h3>
      </div>
    </div>
  );
};

export default ViewGrade;
