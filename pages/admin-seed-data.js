import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import styles from "../styles/Admin.module.css";

export default function AdminSeedData() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentData, setCurrentData] = useState({ students: 0, exams: 0, results: 0 });

  useEffect(() => {
    checkDataStatus();
  }, []);

  const checkDataStatus = async () => {
    try {
      const res = await fetch("/api/seed-data");
      const data = await res.json();
      if (data.currentData) {
        setCurrentData(data.currentData);
      }
    } catch (error) {
      console.error("Error checking data:", error);
    }
  };

  const seedDatabase = async () => {
    if (!window.confirm("This will add sample students, exams, and results to the database. Continue?")) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/seed-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      setStatus(data);
      
      if (data.summary) {
        alert(`✅ Database seeded successfully!\n\nStudents added: ${data.summary.studentsAdded}\nExams added: ${data.summary.examsAdded}\nResults added: ${data.summary.resultsAdded}`);
        checkDataStatus();
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout activePage="Seed Data">
        <div>
          <h2>Database Seed Tool 🌱</h2>
          
          <div className={styles.card} style={{ maxWidth: "600px", margin: "20px auto" }}>
            <h3>Current Database Status</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "20px" }}>
              <div style={{ textAlign: "center", padding: "15px", background: "#f8f9fa", borderRadius: "8px" }}>
                <div style={{ fontSize: "32px", fontWeight: "bold", color: "#007bff" }}>{currentData.students}</div>
                <div style={{ color: "#666" }}>Students</div>
              </div>
              <div style={{ textAlign: "center", padding: "15px", background: "#f8f9fa", borderRadius: "8px" }}>
                <div style={{ fontSize: "32px", fontWeight: "bold", color: "#28a745" }}>{currentData.exams}</div>
                <div style={{ color: "#666" }}>Exams</div>
              </div>
              <div style={{ textAlign: "center", padding: "15px", background: "#f8f9fa", borderRadius: "8px" }}>
                <div style={{ fontSize: "32px", fontWeight: "bold", color: "#ffc107" }}>{currentData.results}</div>
                <div style={{ color: "#666" }}>Results</div>
              </div>
            </div>

            <hr style={{ margin: "20px 0" }} />

            <h3>Add Sample Data</h3>
            <p style={{ color: "#666", marginBottom: "15px" }}>
              This will add the following sample data:
            </p>
            <ul style={{ color: "#666", marginBottom: "20px", paddingLeft: "20px" }}>
              <li><strong>10 Students</strong> (JEE, NEET, UPSC, NDA types)</li>
              <li><strong>5 Exams</strong> with 5 questions each</li>
              <li><strong>3 Sample Results</strong></li>
            </ul>

            <button
              onClick={seedDatabase}
              disabled={loading}
              className={styles.btn}
              style={{ 
                background: "#28a745", 
                width: "100%",
                padding: "15px",
                fontSize: "16px"
              }}
            >
              {loading ? "Adding Data..." : "🌱 Seed Database with Sample Data"}
            </button>
          </div>

          {status && status.summary && (
            <div className={styles.card} style={{ maxWidth: "600px", margin: "20px auto", background: "#d4edda" }}>
              <h3 style={{ color: "#155724" }}>✅ Data Added Successfully!</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginTop: "15px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold" }}>{status.summary.studentsAdded}</div>
                  <div style={{ fontSize: "12px" }}>Students</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold" }}>{status.summary.examsAdded}</div>
                  <div style={{ fontSize: "12px" }}>Exams</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold" }}>{status.summary.resultsAdded}</div>
                  <div style={{ fontSize: "12px" }}>Results</div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.card} style={{ maxWidth: "600px", margin: "20px auto" }}>
            <h3>Sample Student Login Credentials</h3>
            <table className={styles.table} style={{ fontSize: "14px" }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Password</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Roshni Pawar</td>
                  <td>roshni1001@vijeta.com</td>
                  <td>student123</td>
                </tr>
                <tr>
                  <td>Mangesh Sonawane</td>
                  <td>mangesh1002@vijeta.com</td>
                  <td>student123</td>
                </tr>
                <tr>
                  <td>Priya Sharma</td>
                  <td>priya1003@vijeta.com</td>
                  <td>student123</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
