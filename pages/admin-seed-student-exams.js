import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import styles from "../styles/Admin.module.css";

export default function AdminSeedStudentExams() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const seedStudentExams = async () => {
    if (!window.confirm("⚠️ This will migrate ALL 12 student exam records from MySQL:\n\n" +
      "These are completed exam submissions with scores and answers.\n\n" +
      "Continue?")) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/seed-student-exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      setStatus(data);
      
      if (data.summary) {
        alert(`✅ STUDENT EXAMS MIGRATED!\n\n` +
          `Total MySQL Records: ${data.summary.totalInMySQL}\n` +
          `Inserted: ${data.summary.inserted}\n` +
          `Updated: ${data.summary.updated}`
        );
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout activePage="Migrate Student Exams">
        <div>
          <h2>📝 Migrate Student Exam Results</h2>
          
          <div className={styles.card} style={{ maxWidth: "800px", margin: "20px auto", background: "#fff3cd", border: "2px solid #ffc107" }}>
            <h3 style={{ color: "#856404" }}>⚠️ Student Exam Submissions Migration</h3>
            <p style={{ color: "#856404" }}>
              This will migrate ALL 12 student exam submission records from MySQL to MongoDB.
              These records contain scores, answers, and completion times.
            </p>
          </div>

          <div className={styles.card} style={{ maxWidth: "800px", margin: "20px auto" }}>
            <h3>📊 What Will Be Migrated:</h3>
            <table className={styles.table}>
              <tbody>
                <tr><td><strong>Total Records</strong></td><td>12 completed exam submissions</td></tr>
                <tr><td><strong>Includes</strong></td><td>Scores, answers, time taken, submission dates</td></tr>
                <tr><td><strong>Students</strong></td><td>Student IDs: 3, 62, 71, 97, 98, 114</td></tr>
                <tr><td><strong>Exams</strong></td><td>Exam IDs: 1, 6, 8, 16, 36, 45, 48, 67, 68, 69, 70, 80</td></tr>
              </tbody>
            </table>

            <button
              onClick={seedStudentExams}
              disabled={loading}
              className={styles.btn}
              style={{ 
                background: "#17a2b8", 
                width: "100%",
                padding: "20px",
                fontSize: "18px",
                marginTop: "20px"
              }}
            >
              {loading ? "⏳ Migrating Student Exams..." : "🚀 MIGRATE 12 STUDENT EXAMS"}
            </button>
          </div>

          {status && status.summary && (
            <div className={styles.card} style={{ maxWidth: "800px", margin: "20px auto", background: "#d4edda" }}>
              <h3 style={{ color: "#155724" }}>✅ STUDENT EXAMS MIGRATED!</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginTop: "15px" }}>
                <div style={{ textAlign: "center", padding: "10px", background: "#fff", borderRadius: "8px" }}>
                  <div style={{ fontSize: "32px", fontWeight: "bold", color: "#007bff" }}>{status.summary.totalInMySQL}</div>
                  <div style={{ fontSize: "12px" }}>MySQL Records</div>
                </div>
                <div style={{ textAlign: "center", padding: "10px", background: "#fff", borderRadius: "8px" }}>
                  <div style={{ fontSize: "32px", fontWeight: "bold", color: "#28a745" }}>{status.summary.inserted}</div>
                  <div style={{ fontSize: "12px" }}>Inserted</div>
                </div>
                <div style={{ textAlign: "center", padding: "10px", background: "#fff", borderRadius: "8px" }}>
                  <div style={{ fontSize: "32px", fontWeight: "bold", color: "#ffc107" }}>{status.summary.updated}</div>
                  <div style={{ fontSize: "12px" }}>Already Existed</div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.card} style={{ maxWidth: "800px", margin: "20px auto" }}>
            <h3>📋 Sample Data Preview:</h3>
            <table className={styles.table}>
              <thead>
                <tr><th>Student ID</th><th>Exam ID</th><th>Score</th><th>Status</th><th>Submitted</th></tr>
              </thead>
              <tbody>
                <tr><td>3</td><td>1</td><td>1</td><td>completed</td><td>2026-04-10</td></tr>
                <tr><td>62</td><td>36</td><td>10</td><td>completed</td><td>2026-04-14</td></tr>
                <tr><td>71</td><td>45</td><td>5</td><td>completed</td><td>2026-04-14</td></tr>
                <tr><td>97</td><td>67</td><td>2</td><td>completed</td><td>2026-04-27</td></tr>
                <tr><td>114</td><td>80</td><td>0</td><td>completed</td><td>2026-05-03</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
