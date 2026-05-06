import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import styles from "../styles/Admin.module.css";
// Deploy: All 78 exams migration from MySQL

export default function AdminSeedAllExams() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Version 1.1 - Force rebuild
  const seedAllExams = async () => {
    if (!window.confirm("⚠️ This will migrate ALL 78 exams from MySQL:\n\n" +
      "• JEE Exams\n" +
      "• NEET Exams\n" +
      "• NDA Exams\n" +
      "• UPSC Exams\n" +
      "• Mock Tests & Practice Tests\n\n" +
      "Continue?")) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/seed-all-exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      setStatus(data);
      
      if (data.summary) {
        alert(`✅ ALL EXAMS MIGRATED!\n\n` +
          `Total: ${data.summary.totalMySQL}\n` +
          `New: ${data.summary.inserted}\n` +
          `Existing: ${data.summary.updated}`
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
      <AdminLayout activePage="Migrate All Exams">
        <div className={styles.container}>
          <h2>📝 Migrate ALL 78 Exams from MySQL</h2>
          
          <div className={styles.card} style={{ maxWidth: "800px", margin: "20px auto", background: "#fff3cd", border: "2px solid #ffc107" }}>
            <h3 style={{ color: "#856404" }}>⚠️ Complete Exams Migration</h3>
            <p style={{ color: "#856404" }}>
              This will migrate ALL 78 exams from your MySQL database to MongoDB.
            </p>
          </div>

          <div className={styles.card} style={{ maxWidth: "800px", margin: "20px auto" }}>
            <h3>📊 Exam Types:</h3>
            <table className={styles.table}>
              <tbody>
                <tr><td><strong>JEE</strong></td><td>~25 exams</td></tr>
                <tr><td><strong>NEET</strong></td><td>~20 exams</td></tr>
                <tr><td><strong>NDA</strong></td><td>~10 exams</td></tr>
                <tr><td><strong>UPSC</strong></td><td>~5 exams</td></tr>
                <tr><td><strong>Mock Test</strong></td><td>~5 exams</td></tr>
                <tr><td><strong>Practice Test</strong></td><td>~3 exams</td></tr>
                <tr><td><strong>Others</strong></td><td>Army Test, SSC, etc.</td></tr>
                <tr><td><strong>TOTAL</strong></td><td>78 exams</td></tr>
              </tbody>
            </table>

            <button
              onClick={seedAllExams}
              disabled={loading}
              className={styles.commonBtn}
              style={{ 
                background: "#fd7e14", 
                width: "100%",
                padding: "20px",
                fontSize: "18px",
                marginTop: "20px"
              }}
            >
              {loading ? "⏳ Migrating 78 Exams..." : "🚀 MIGRATE ALL 78 EXAMS"}
            </button>
          </div>

          {status && status.summary && (
            <div className={styles.card} style={{ maxWidth: "800px", margin: "20px auto", background: "#d4edda" }}>
              <h3 style={{ color: "#155724" }}>✅ EXAMS MIGRATED!</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginTop: "15px" }}>
                <div style={{ textAlign: "center", padding: "10px", background: "#fff", borderRadius: "8px" }}>
                  <div style={{ fontSize: "32px", fontWeight: "bold", color: "#007bff" }}>{status.summary.totalMySQL}</div>
                  <div style={{ fontSize: "12px" }}>Total MySQL</div>
                </div>
                <div style={{ textAlign: "center", padding: "10px", background: "#fff", borderRadius: "8px" }}>
                  <div style={{ fontSize: "32px", fontWeight: "bold", color: "#28a745" }}>{status.summary.inserted}</div>
                  <div style={{ fontSize: "12px" }}>New</div>
                </div>
                <div style={{ textAlign: "center", padding: "10px", background: "#fff", borderRadius: "8px" }}>
                  <div style={{ fontSize: "32px", fontWeight: "bold", color: "#6c757d" }}>{status.summary.updated}</div>
                  <div style={{ fontSize: "12px" }}>Already Existed</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
