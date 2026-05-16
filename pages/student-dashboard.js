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
    <div className={styles.layout} style={{ minHeight: "100vh", flexDirection: "column" }}>
      <header className={styles.topBar}>
        <h1 className={styles.pageTitle}>Student Dashboard</h1>
        <div className={styles.adminProfile}>
          <span>{user?.name || "Student"}</span>
          <button className={styles.btnSecondary} onClick={logout} style={{ padding: "6px 14px", fontSize: "0.82rem" }}>
            Logout
          </button>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.statsGrid} style={{ marginBottom: "20px" }}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconBlue}`}>📋</div>
            <div className={styles.statInfo}>
              <h4>{exams.length}</h4>
              <p>Available Exams</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconGreen}`}>👤</div>
            <div className={styles.statInfo}>
              <h4>{user?.name || "—"}</h4>
              <p>{user?.batch || "Student"}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconYellow}`}>📁</div>
            <div className={styles.statInfo}>
              <h4>{user?.exam_type || "N/A"}</h4>
              <p>Exam Type</p>
            </div>
          </div>
        </div>

        <div className={styles.card} style={{ marginBottom: "16px", background: "#eff6ff", borderColor: "#93c5fd" }}>
          <p style={{ fontSize: "0.88rem", color: "#1e40af" }}>
            <strong>Note:</strong> Exam results are only visible to administrators. You can only see exams matching your assigned exam type ({user?.exam_type || "N/A"}) and batch ({user?.batch || "N/A"}).
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Available Exams</h3>
          {loading && <span style={{ color: "#64748b", fontSize: "0.85rem" }}>Loading...</span>}
        </div>

        {loading ? (
          <div className={styles.card} style={{ textAlign: "center", color: "#94a3b8" }}>
            Loading exams...
          </div>
        ) : exams.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
            {exams.map((exam) => (
              <div key={exam.id} className={styles.card} style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ marginBottom: "12px" }}>
                  <h4 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "4px" }}>{exam.name}</h4>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span className={`${styles.badge} ${styles.badgeInfo}`}>{exam.type}</span>
                    <span className={`${styles.badge} ${styles.badgeWarning}`}>{exam.batch}</span>
                  </div>
                </div>
                <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "12px", flex: 1 }}>
                  <p>Duration: {exam.duration} minutes</p>
                  <p>Scheduled: {new Date(exam.scheduled_time).toLocaleString()}</p>
                </div>
                {!isExamAccessible(exam.scheduled_time) ? (
                  <div>
                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px", marginBottom: "10px", fontSize: "0.82rem", color: "#991b1b" }}>
                      <strong>Not Yet Available</strong><br />
                      Starts in: {getTimeRemainingText(exam.scheduled_time)}
                    </div>
                    <button className={styles.btn} disabled style={{ opacity: 0.5, cursor: "not-allowed", width: "100%" }}>
                      Locked
                    </button>
                  </div>
                ) : (
                  <button className={styles.btn} onClick={() => startExam(exam.id)} style={{ width: "100%" }}>
                    Start Exam
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.card} style={{ textAlign: "center", color: "#94a3b8" }}>
            No exams available for your batch and exam type.
          </div>
        )}
      </main>
    </div>
  );
}
