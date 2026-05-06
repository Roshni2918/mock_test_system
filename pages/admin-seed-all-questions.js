import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import styles from "../styles/Admin.module.css";
// Deploy: All questions migration from MySQL

export default function AdminSeedAllQuestions() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Version 1.1 - Force rebuild
  const seedAllQuestions = async () => {
    if (!window.confirm("⚠️ This will migrate ALL questions from MySQL:\n\n" +
      "• ALL 100+ questions\n" +
      "• Physics, Chemistry, Math, GK, CS questions\n" +
      "• With 4 options each\n" +
      "• Hindi & English questions\n\n" +
      "This may take a few minutes. Continue?")) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/seed-all-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      setStatus(data);
      
      if (data.summary) {
        alert(`✅ ALL QUESTIONS MIGRATED!\n\n` +
          `Questions: ${data.summary.questionsInserted}\n` +
          `Options: ${data.summary.optionsInserted}\n` +
          `Exams Updated: ${data.summary.examsUpdated}`
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
      <AdminLayout activePage="Migrate All Questions">
        <div className={styles.container}>
          <h2>📝 Migrate ALL Questions from MySQL</h2>
          
          <div className={styles.card} style={{ maxWidth: "800px", margin: "20px auto", background: "#fff3cd", border: "2px solid #ffc107" }}>
            <h3 style={{ color: "#856404" }}>⚠️ Complete Questions Migration</h3>
            <p style={{ color: "#856404" }}>
              This will migrate ALL questions from your MySQL database to MongoDB.
              This includes 100+ questions with 4 options each.
            </p>
          </div>

          <div className={styles.card} style={{ maxWidth: "800px", margin: "20px auto" }}>
            <h3>📊 What Will Be Migrated:</h3>
            <table className={styles.table}>
              <tbody>
                <tr><td><strong>Total Questions</strong></td><td>100+ questions</td></tr>
                <tr><td><strong>Subjects</strong></td><td>Physics, Chemistry, Mathematics, GK, Computer Science</td></tr>
                <tr><td><strong>Languages</strong></td><td>English & Hindi</td></tr>
                <tr><td><strong>Options</strong></td><td>4 options per question with correct answers</td></tr>
                <tr><td><strong>Exams Covered</strong></td><td>All 80 exams</td></tr>
              </tbody>
            </table>

            <button
              onClick={seedAllQuestions}
              disabled={loading}
              className={styles.commonBtn}
              style={{ 
                background: "#20c997", 
                width: "100%",
                padding: "20px",
                fontSize: "18px",
                marginTop: "20px"
              }}
            >
              {loading ? "⏳ Migrating All Questions... (This may take a few minutes)" : "🚀 MIGRATE ALL QUESTIONS"}
            </button>
          </div>

          {status && status.summary && (
            <div className={styles.card} style={{ maxWidth: "800px", margin: "20px auto", background: "#d4edda" }}>
              <h3 style={{ color: "#155724" }}>✅ ALL QUESTIONS MIGRATED!</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginTop: "15px" }}>
                <div style={{ textAlign: "center", padding: "10px", background: "#fff", borderRadius: "8px" }}>
                  <div style={{ fontSize: "32px", fontWeight: "bold", color: "#007bff" }}>{status.summary.questionsInserted}</div>
                  <div style={{ fontSize: "12px" }}>Questions</div>
                </div>
                <div style={{ textAlign: "center", padding: "10px", background: "#fff", borderRadius: "8px" }}>
                  <div style={{ fontSize: "32px", fontWeight: "bold", color: "#28a745" }}>{status.summary.optionsInserted}</div>
                  <div style={{ fontSize: "12px" }}>Options</div>
                </div>
                <div style={{ textAlign: "center", padding: "10px", background: "#fff", borderRadius: "8px" }}>
                  <div style={{ fontSize: "32px", fontWeight: "bold", color: "#fd7e14" }}>{status.summary.examsUpdated}</div>
                  <div style={{ fontSize: "12px" }}>Exams Updated</div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.card} style={{ maxWidth: "800px", margin: "20px auto" }}>
            <h3>📋 Sample Questions Preview:</h3>
            <table className={styles.table}>
              <thead>
                <tr><th>Subject</th><th>Sample Question</th></tr>
              </thead>
              <tbody>
                <tr><td>Physics</td><td>What is the SI unit of force?</td></tr>
                <tr><td>Chemistry</td><td>What is the atomic number of Carbon?</td></tr>
                <tr><td>Mathematics</td><td>What is the derivative of x²?</td></tr>
                <tr><td>General Knowledge</td><td>Who is the current President of India?</td></tr>
                <tr><td>History</td><td>In which year did India gain independence?</td></tr>
                <tr><td>Geography</td><td>What is the capital of France?</td></tr>
                <tr><td>Computer Science</td><td>What does CPU stand for?</td></tr>
                <tr><td>Programming</td><td>What is Object Oriented Programming?</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
