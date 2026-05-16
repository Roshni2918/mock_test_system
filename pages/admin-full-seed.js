import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import styles from "../styles/Admin.module.css";

export default function AdminFullSeed() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentData, setCurrentData] = useState({ admin: 0, students: 0, exams: 0, results: 0 });

  useEffect(() => {
    checkDataStatus();
  }, []);

  const checkDataStatus = async () => {
    try {
      // use POST since GET returns 405
      const res = await fetch("/api/seed-full-database", { method: 'POST' });
      const data = await res.json();
      if (data.currentData) {
        setCurrentData(data.currentData);
      }
    } catch (error) {
      // ignore
    }
  };

  const seedDatabase = async () => {
    if (!window.confirm("⚠️ This will add ALL sample data to your database:\n\n" +
      "• 1 Admin\n" +
      "• 5 Exam Types\n" +
      "• 6 Subjects\n" +
      "• 13 Students\n" +
      "• 3 Exams with 7 Questions\n" +
      "• 4 Exam Results\n\n" +
      "Continue?")) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/seed-full-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      setStatus(data);
      
      if (data.summary) {
        alert(`✅ DATABASE SEEDED!\n\n` +
          `Admin: ${data.summary.admin}\n` +
          `Exam Types: ${data.summary.examTypes}\n` +
          `Students: ${data.summary.students}\n` +
          `Exams: ${data.summary.exams}\n` +
          `Questions: ${data.summary.questions}\n` +
          `Results: ${data.summary.results}`
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
      <AdminLayout activePage="Full Database Seed">
        <div>
          <h2>🗄️ Full Database Seed Tool</h2>
          
          <div className={styles.card} style={{ maxWidth: "800px", margin: "20px auto", background: "#fff3cd", border: "2px solid #ffc107" }}>
            <h3 style={{ color: "#856404" }}>⚠️ Complete MySQL-to-MongoDB Data Migration</h3>
            <p style={{ color: "#856404" }}>
              This tool adds ALL your MySQL database data to MongoDB Atlas:
            </p>
          </div>

          <div className={styles.card} style={{ maxWidth: "800px", margin: "20px auto" }}>
            <h3>📊 What Will Be Added:</h3>
            <table className={styles.table}>
              <tbody>
                <tr><td><strong>Admin</strong></td><td>Mahesh Kulkarni (mahesh.kulkarni@vijetafoundation.in)</td><td>1</td></tr>
                <tr><td><strong>Exam Types</strong></td><td>SSB, SSC, NDA, Police Constable, Other</td><td>5</td></tr>
                <tr><td><strong>Subjects</strong></td><td>Mathematics, Physics, Chemistry, Reasoning, English, GK</td><td>6</td></tr>
                <tr><td><strong>Students</strong></td><td>13 students (NDA, SSC, SSB, Police Constable batches)</td><td>13</td></tr>
                <tr><td><strong>Exams</strong></td><td>NDA Mock, SSC Mock, Police Constable Mock</td><td>3</td></tr>
                <tr><td><strong>Questions</strong></td><td>7 questions with 4 options each</td><td>7</td></tr>
                <tr><td><strong>Results</strong></td><td>4 completed exam results</td><td>4</td></tr>
              </tbody>
            </table>

            <button
              onClick={seedDatabase}
              disabled={loading}
              className={styles.btn}
              style={{ 
                background: "#28a745", 
                width: "100%",
                padding: "20px",
                fontSize: "18px",
                marginTop: "20px"
              }}
            >
              {loading ? "⏳ Seeding Database... (This may take 30 seconds)" : "🚀 SEED COMPLETE DATABASE"}
            </button>
          </div>

          {status && status.summary && (
            <div className={styles.card} style={{ maxWidth: "800px", margin: "20px auto", background: "#d4edda" }}>
              <h3 style={{ color: "#155724" }}>✅ DATABASE SEEDED SUCCESSFULLY!</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginTop: "15px" }}>
                <div style={{ textAlign: "center", padding: "10px", background: "#fff", borderRadius: "8px" }}>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "#007bff" }}>{status.summary.admin}</div>
                  <div style={{ fontSize: "12px" }}>Admin</div>
                </div>
                <div style={{ textAlign: "center", padding: "10px", background: "#fff", borderRadius: "8px" }}>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "#28a745" }}>{status.summary.examTypes}</div>
                  <div style={{ fontSize: "12px" }}>Exam Types</div>
                </div>
                <div style={{ textAlign: "center", padding: "10px", background: "#fff", borderRadius: "8px" }}>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "#ffc107" }}>{status.summary.students}</div>
                  <div style={{ fontSize: "12px" }}>Students</div>
                </div>
                <div style={{ textAlign: "center", padding: "10px", background: "#fff", borderRadius: "8px" }}>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "#17a2b8" }}>{status.summary.exams}</div>
                  <div style={{ fontSize: "12px" }}>Exams</div>
                </div>
                <div style={{ textAlign: "center", padding: "10px", background: "#fff", borderRadius: "8px" }}>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "#6f42c1" }}>{status.summary.questions}</div>
                  <div style={{ fontSize: "12px" }}>Questions</div>
                </div>
                <div style={{ textAlign: "center", padding: "10px", background: "#fff", borderRadius: "8px" }}>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "#dc3545" }}>{status.summary.results}</div>
                  <div style={{ fontSize: "12px" }}>Results</div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.card} style={{ maxWidth: "800px", margin: "20px auto" }}>
            <h3>👤 Admin Login</h3>
            <table className={styles.table}>
              <thead>
                <tr><th>Email</th><th>Password</th></tr>
              </thead>
              <tbody>
                <tr><td>mahesh.kulkarni@vijetafoundation.in</td><td>admin123</td></tr>
              </tbody>
            </table>

            <h3 style={{ marginTop: "20px" }}>👨‍🎓 Sample Student Logins</h3>
            <table className={styles.table}>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Password</th><th>Type</th></tr>
              </thead>
              <tbody>
                <tr><td>Shrutika More</td><td>shrutika.more@test.com</td><td>1234</td><td>NDA</td></tr>
                <tr><td>Roshni Pawar</td><td>roshni.pawar@test.com</td><td>1234</td><td>SSC</td></tr>
                <tr><td>Sakshi Nalawade</td><td>sakshi.nalawade@test.com</td><td>1234</td><td>SSB</td></tr>
                <tr><td>Ankit Patil</td><td>ankit.patil@test.com</td><td>1234</td><td>Police</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
