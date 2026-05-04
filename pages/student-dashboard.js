import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../components/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import styles from "../styles/Admin.module.css";

export default function StudentDashboard() {
  return (
    <ProtectedRoute requiredRole="student">
      <StudentDashboardContent />
    </ProtectedRoute>
  );
}

function StudentDashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  const parseResponseSafely = async (response) => {
    const responseText = await response.text();
    if (!responseText || !responseText.trim()) {
      throw new Error("Empty response from server");
    }
    const trimmed = responseText.trim();
    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
      throw new Error("Server returned non-JSON response. Please make sure backend is running on port 5000.");
    }
    return JSON.parse(trimmed);
  };

  useEffect(() => {
    if (!user) return;
    fetchExams();
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getTimeRemainingText = (scheduledTime) => {
    const diff = new Date(scheduledTime).getTime() - now;
    if (diff <= 0) return "00m";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  const isExamAccessible = (scheduledTime) => new Date(scheduledTime).getTime() <= now;

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("/api/exams/student", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to fetch exams");
      }
      setExams(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching exams", error);
      alert(error.message || "Error fetching exams");
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const startExam = (examId) => {
    router.push(`/exam?id=${examId}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Student Dashboard</h2>
        <button className={styles.btn} onClick={logout}>Logout</button>
      </div>

      <div className={styles.main}>
        <div className={styles.content}>
          <h3>Welcome, {user?.name}</h3>
          <div style={{ backgroundColor: "#e8f4fd", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
            <p><strong>Your Assigned Exam Type:</strong> {user?.exam_type || 'Not Assigned'}</p>
            <p><strong>Your Batch:</strong> {user?.batch || 'Not Assigned'}</p>
            <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
              You can only see exams that match your assigned exam type and batch.
            </p>
          </div>

          <h4>Available Exams</h4>
          {exams.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginTop: "20px" }}>
              {exams.map((exam) => (
                <div key={exam.id} className={styles.card}>
                  <h3>{exam.name}</h3>
                  <p>Type: {exam.type}</p>
                  <p>Batch: {exam.batch}</p>
                  <p>Duration: {exam.duration} minutes</p>
                  <p>Scheduled: {new Date(exam.scheduled_time).toLocaleString()}</p>
                  {!isExamAccessible(exam.scheduled_time) && (
                    <div style={{ backgroundColor: "#ff6b6b", color: "white", padding: "10px", borderRadius: "5px", marginBottom: "10px" }}>
                      <p><strong>⏰ Exam Not Yet Available</strong></p>
                      <p>Time remaining: {getTimeRemainingText(exam.scheduled_time)}</p>
                      <p>You can start this exam at: {new Date(exam.scheduled_time).toLocaleString()}</p>
                    </div>
                  )}
                  {isExamAccessible(exam.scheduled_time) && (
                    <button className={styles.btn} onClick={() => startExam(exam.id)}>Start Exam</button>
                  )}
                  {!isExamAccessible(exam.scheduled_time) && (
                    <button className={styles.btn} disabled style={{ backgroundColor: "#ccc", cursor: "not-allowed" }}>
                      Start Exam (Not Available)
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No exams available</p>
          )}

          <div style={{ marginTop: "40px", color: "#888" }}>
            <p><strong>Note:</strong> Exam results are only visible to administrators.</p>
          </div>
        </div>
      </div>
    </div>
  );
}