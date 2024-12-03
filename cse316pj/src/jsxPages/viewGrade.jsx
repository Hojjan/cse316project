import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import Navbar from "./navbar";
import "../cssPages/viewGrade.css";

const ViewGrade = () => {
  const [assignments, setAssignments] = useState();
  const [midterm, setMidterm] = useState();
  const [final, setFinal] = useState();
  const [gp, setGps] = useState();
  const [attendance, setAttendance] = useState();
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
    const fetchGrades = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No authentication token found");
          return;
        }

        // Fetch individual assignment grades
        const assignmentRes = await axios.get("http://localhost:3001/grades/assignments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAssignments(assignmentRes.data);

        // Fetch individual midterm scores
        const midtermRes = await axios.get("http://localhost:3001/grades/midterm", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMidterm(midtermRes.data);

        const finalRes = await axios.get("http://localhost:3001/grades/final", {
            headers: { Authorization: `Bearer ${token}` },
        });
        setFinal(finalRes.data);

        // Fetch individual group project scores
        const gpRes = await axios.get("http://localhost:3001/grades/final", {
            headers: { Authorization: `Bearer ${token}` },
        });
        setGps(gpRes.data);

        // Fetch individual attendance scores
        const attendanceRes = await axios.get("http://localhost:3001/grades/attendance", {
            headers: { Authorization: `Bearer ${token}` },
        });
        setAttendance(attendanceRes.data);

        // Calculate final score and grade
        assignments, midterm, final, gp, attendance
        calculateFinalGrade(
            assignmentRes.data, 
            midtermRes.data, 
            finalRes.data, 
            gpRes.data, 
            attendanceRes.data);

        // Fetch all users' grades
        const allGradesRes = await axios.get("http://localhost:3001/grades/all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { assignments: allAssign, midterm: allMidterm, final: allFinal } = allGradesRes.data;
        setAllGrades({
          assignments: allAssign,
          midterm: allMidterm,
          final: allFinal,
        });

        // Calculate standard deviation
        setAssignmentStdDev(calculateStdDev(allAssign));
        setTestStdDev(calculateStdDev(allMidterm.concat(allFinal))); // Midterm & Final
      } catch (error) {
        console.error("Error fetching grades:", error);
      }
    };

    fetchGrades();
  }, []);

  const calculateFinalGrade = (assignments, midterm, final, gp, attendance) => {
    const total = assignments + midterm + final + gp + attendance;
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

  const calculateStdDev = (grades) => {
    if (!grades.length) return 0;

    const mean = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
    const variance = grades.reduce((sum, grade) => sum + Math.pow(grade - mean, 2), 0) / grades.length;
    return Math.sqrt(variance);
  };

  return (
    <div className="view-grade-page">
      <Navbar />
      <h1>View Grades</h1>
      <p></p>
      {/* Assignment Scores Card */}
      <div className="grade-card">
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
        />
      </div>
      <p></p>
      {/* Test Scores Card */}
      <div className="grade-card">
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
        />
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
