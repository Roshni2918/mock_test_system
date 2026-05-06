import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import styles from "../styles/Admin.module.css";

export default function AdminSeedQuestions() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const seedQuestions = async () => {
    if (!window.confirm("⚠️ This will migrate sample questions from MySQL:\n\n" +
      "• 50+ sample questions\n" +
      "• Physics, Chemistry, Math, GK questions\n" +
      "• With 4 options each\n\n" +
      "Continue?")) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/seed-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      setStatus(data);
      
      if (data.summary) {
        alert(`✅ QUESTIONS MIGRATED!\n\n` +
          `Questions: ${data.summary.questionsInserted}\n` +
          `Options: ${data.summary.optionsInserted}`
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
      <AdminLayout activePage="Migrate Questions">
        <div className={styles.container}>
          <h2>📝 Migrate Sample Questions from MySQL</h2>
          
          <div className={styles.card} style={{ maxWidth: "800px", margin: "20px auto", background: "#fff3cd", border: "2px solid #ffc107" }}>
            <h3 style={{ color: "#856404" }}>⚠️ Questions Migration</h3>
            <p style={{ color: "#856404" }}>
              This will migrate sample questions from your MySQL database to MongoDB.
              Includes Physics, Chemistry, Mathematics, and General Knowledge questions.
            </p>
          </div>

          <div className={styles.card} style={{ maxWidth: "800px", margin: "20px auto" }}>
            <h3>📊 What Will Be Migrated:</h3>
            <table className={styles.table}>
              <tbody>
                <tr><td><strong>Total Questions</strong></td><td>50+ sample questions</td></tr>
                <tr><td><strong>Subjects</strong></td><td>Physics, Chemistry, Mathematics, General Knowledge</td></tr>
                <tr><td><strong>Options</strong></td><td>4 options per question with correct answers</td></tr>
                <tr><td><strong>Exams Covered</strong></td><td>Exams 1, 2, 3, 4, 8, 9, 10, 11, 68, 69, 70, 80</td></tr>
              </tbody>
            </table>

            <button
              onClick={seedQuestions}
              disabled={loading}
              className={styles.commonBtn}
              style={{ 
                background: "#6f42c1", 
                width: "100%",
                padding: "20px",
                fontSize: "18px",
                marginTop: "20px"
              }}
            >
              {loading ? "⏳ Migrating Questions..." : "🚀 MIGRATE SAMPLE QUESTIONS"}
            </button>
          </div>

          {status && status.summary && (
            <div className={styles.card} style={{ maxWidth: "800px", margin: "20px auto", background: "#d4edda" }}>
              <h3 style={{ color: "#155724" }}>✅ QUESTIONS MIGRATED!</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "15px", marginTop: "15px" }}>
                <div style={{ textAlign: "center", padding: "10px", background: "#fff", borderRadius: "8px" }}>
                  <div style={{ fontSize: "32px", fontWeight: "bold", color: "#007bff" }}>{status.summary.questionsInserted}</div>
                  <div style={{ fontSize: "12px" }}>Questions</div>
                </div>
                <div style={{ textAlign: "center", padding: "10px", background: "#fff", borderRadius: "8px" }}>
                  <div style={{ fontSize: "32px", fontWeight: "bold", color: "#28a745" }}>{status.summary.optionsInserted}</div>
                  <div style={{ fontSize: "12px" }}>Options</div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.card} style={{ maxWidth: "800px", margin: "20px auto" }}>
            <h3>📋 Sample Questions Preview:</h3>
            <table className={styles.table}>
              <thead>
                <tr><th>Subject</th><th>Question</th></tr>
              </thead>
              <tbody>
                <tr><td>Mathematics</td><td>What is 2 + 2?</td></tr>
                <tr><td>Physics</td><td>What is the SI unit of force?</td></tr>
                <tr><td>Chemistry</td><td>What is the atomic number of Carbon?</td></tr>
                <tr><td>Physics</td><td>What is the speed of light?</td></tr>
                <tr><td>Chemistry</td><td>What is the pH of pure water at 25°C?</td></tr>
                <tr><td>General Knowledge</td><td>Who is the current President of India?</td></tr>
                <tr><td>History</td><td>In which year did India gain independence?</td></tr>
                <tr><td>Geography</td><td>What is the capital of France?</td></tr>
                <tr><td>Mathematics</td><td>What is 15% of 200?</td></tr>
                <tr><td>Mathematics</td><td>What is the derivative of x²?</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
