import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import styles from "../styles/Admin.module.css";

export default function AdminSeedAllUsers() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const seedAllUsers = async () => {
    if (!window.confirm("⚠️ This will add ALL 82 users from your local MySQL database:\n\n" +
      "• 2 Admins\n" +
      "• 80 Students\n\n" +
      "Continue?")) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/seed-all-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      setStatus(data);
      
      if (data.summary) {
        alert(`✅ ALL USERS MIGRATED!\n\n` +
          `Total: ${data.summary.totalUsers}\n` +
          `Admins: ${data.summary.admins}\n` +
          `Students: ${data.summary.students}`
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
      <AdminLayout activePage="Migrate All Users">
        <div>
          <h2>🔄 Migrate ALL MySQL Users to MongoDB</h2>
          
          <div className={styles.card} style={{ maxWidth: "800px", margin: "20px auto", background: "#fff3cd", border: "2px solid #ffc107" }}>
            <h3 style={{ color: "#856404" }}>⚠️ Complete User Migration</h3>
            <p style={{ color: "#856404" }}>
              This will migrate ALL 82 users from your local MySQL database to MongoDB Atlas.
            </p>
          </div>

          <div className={styles.card} style={{ maxWidth: "800px", margin: "20px auto" }}>
            <h3>📊 What Will Be Migrated:</h3>
            <table className={styles.table}>
              <tbody>
                <tr><td><strong>Total Users</strong></td><td>82 users</td></tr>
                <tr><td><strong>Admins</strong></td><td>admin@example.com, admin@test.com</td></tr>
                <tr><td><strong>Students</strong></td><td>80 students (JEE, NEET, NDA, SSC, UPSC, Mock, Practice Test)</td></tr>
              </tbody>
            </table>

            <button
              onClick={seedAllUsers}
              disabled={loading}
              className={styles.btn}
              style={{ 
                background: "#dc3545", 
                width: "100%",
                padding: "20px",
                fontSize: "18px",
                marginTop: "20px"
              }}
            >
              {loading ? "⏳ Migrating 82 Users... (This may take 60 seconds)" : "🚀 MIGRATE ALL 82 USERS"}
            </button>
          </div>

          {status && status.summary && (
            <div className={styles.card} style={{ maxWidth: "800px", margin: "20px auto", background: "#d4edda" }}>
              <h3 style={{ color: "#155724" }}>✅ ALL USERS MIGRATED!</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px", marginTop: "15px" }}>
                <div style={{ textAlign: "center", padding: "10px", background: "#fff", borderRadius: "8px" }}>
                  <div style={{ fontSize: "32px", fontWeight: "bold", color: "#007bff" }}>{status.summary.totalUsers}</div>
                  <div style={{ fontSize: "12px" }}>Total Users</div>
                </div>
                <div style={{ textAlign: "center", padding: "10px", background: "#fff", borderRadius: "8px" }}>
                  <div style={{ fontSize: "32px", fontWeight: "bold", color: "#28a745" }}>{status.summary.admins}</div>
                  <div style={{ fontSize: "12px" }}>Admins</div>
                </div>
                <div style={{ textAlign: "center", padding: "10px", background: "#fff", borderRadius: "8px" }}>
                  <div style={{ fontSize: "32px", fontWeight: "bold", color: "#ffc107" }}>{status.summary.students}</div>
                  <div style={{ fontSize: "12px" }}>Students</div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.card} style={{ maxWidth: "800px", margin: "20px auto" }}>
            <h3>👤 Sample Logins to Test:</h3>
            <table className={styles.table}>
              <thead>
                <tr><th>Role</th><th>Email</th><th>Password</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>Admin</strong></td><td>admin@example.com</td><td>admin123</td></tr>
                <tr><td><strong>Admin</strong></td><td>admin@test.com</td><td>admin123</td></tr>
                <tr><td>Student (JEE)</td><td>studentJEE@test.com</td><td>student123</td></tr>
                <tr><td>Student (NEET)</td><td>studentNEET@test.com</td><td>student123</td></tr>
                <tr><td>Student (NDA)</td><td>studentNDA@test.com</td><td>student123</td></tr>
                <tr><td>Student (UPSC)</td><td>roshni@gmail.com</td><td>student123</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
