import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import styles from "../styles/Admin.module.css";

export default function AdminMigrateAll() {
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState({});

  const migrateData = async (type) => {
    setLoading({ ...loading, [type]: true });
    setStatus({ ...status, [type]: null });

    try {
      const endpoints = {
        users: "/api/seed-all-users",
        exams: "/api/seed-all-exams",
        questions: "/api/seed-all-questions",
        results: "/api/seed-student-exams"
      };

      const response = await fetch(endpoints[type], {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      const data = await response.json();
      setStatus({ ...status, [type]: { success: true, data } });
    } catch (error) {
      setStatus({ ...status, [type]: { success: false, error: error.message } });
    }
    setLoading({ ...loading, [type]: false });
  };

  const MigrationCard = ({ title, count, type, color, description }) => (
    <div className={styles.migrationCard} style={{ borderLeft: `4px solid ${color}` }}>
      <h3>{title}</h3>
      <p className={styles.count}>{count}</p>
      <p className={styles.description}>{description}</p>
      <button
        onClick={() => migrateData(type)}
        disabled={loading[type]}
        className={styles.migrateButton}
        style={{ backgroundColor: color }}
      >
        {loading[type] ? "⏳ Migrating..." : `🚀 Migrate ${count}`}
      </button>
      {status[type] && (
        <div className={status[type].success ? styles.success : styles.error}>
          {status[type].success ? (
            <>
              <p>✅ {type.toUpperCase()} MIGRATED!</p>
              <p>Total: {status[type].data?.total || status[type].data?.inserted || "Done"}</p>
            </>
          ) : (
            <p>❌ Error: {status[type].error}</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <div className={styles.migrateContainer}>
          <h1>🔄 Migrate All MySQL Data to MongoDB</h1>
          <p className={styles.subtitle}>Click each button to migrate data from MySQL to MongoDB Atlas</p>

          <div className={styles.migrationGrid}>
            <MigrationCard
              title="Users"
              count="82 Users"
              type="users"
              color="#e74c3c"
              description="Admins (2) + Students (80) with JEE, NEET, NDA, UPSC, SSC, Mock, Practice batches"
            />
            <MigrationCard
              title="Exams"
              count="78 Exams"
              type="exams"
              color="#e67e22"
              description="JEE, NEET, NDA, UPSC, SSC, Mock Tests, Practice Tests, Army Tests"
            />
            <MigrationCard
              title="Questions"
              count="100+ Questions"
              type="questions"
              color="#1abc9c"
              description="All questions with 4 options each - Physics, Chemistry, Math, GK, CS"
            />
            <MigrationCard
              title="Results"
              count="12 Results"
              type="results"
              color="#3498db"
              description="Completed student exam submissions with scores and answers"
            />
          </div>

          <div className={styles.sampleLogins}>
            <h3>👤 Sample Logins to Test After Migration:</h3>
            <table className={styles.loginTable}>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Password</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Admin</strong></td>
                  <td>admin@example.com</td>
                  <td>admin123</td>
                </tr>
                <tr>
                  <td><strong>Admin</strong></td>
                  <td>admin@test.com</td>
                  <td>admin123</td>
                </tr>
                <tr>
                  <td><strong>Student (JEE)</strong></td>
                  <td>studentJEE@test.com</td>
                  <td>student123</td>
                </tr>
                <tr>
                  <td><strong>Student (NEET)</strong></td>
                  <td>studentNEET@test.com</td>
                  <td>student123</td>
                </tr>
                <tr>
                  <td><strong>Student (UPSC)</strong></td>
                  <td>roshni@gmail.com</td>
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
