import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import styles from "../styles/Admin.module.css";

export default function AdminDashboard() {
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("exams");

  useEffect(() => {
    window.reloadStudents = fetchStudents;
    window.reloadExams = fetchExams;
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchExams(), fetchStudents(), fetchResults()]).then(() => {
      setLoading(false);
    });
  }, []);

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("/api/admin/exams", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setExams(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching exams:", error);
      setExams([]);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("/api/students", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    }
  };

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("/api/admin/results", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching results:", error);
      setResults([]);
    }
  };

  const totalQuestions = exams.reduce((sum, e) => sum + (e.total_questions || 0), 0);

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout activePage="Dashboard">
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconBlue}`}>📝</div>
            <div className={styles.statInfo}>
              <h4>{exams.length}</h4>
              <p>Total Exams</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconGreen}`}>👥</div>
            <div className={styles.statInfo}>
              <h4>{students.length}</h4>
              <p>Students</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconYellow}`}>📊</div>
            <div className={styles.statInfo}>
              <h4>{results.length}</h4>
              <p>Submissions</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconRed}`}>❓</div>
            <div className={styles.statInfo}>
              <h4>{totalQuestions}</h4>
              <p>Total Questions</p>
            </div>
          </div>
        </div>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${activeTab === "exams" ? styles.tabActive : ""}`} onClick={() => setActiveTab("exams")}>
            Exams ({exams.length})
          </button>
          <button className={`${styles.tab} ${activeTab === "students" ? styles.tabActive : ""}`} onClick={() => setActiveTab("students")}>
            Students ({students.length})
          </button>
          <button className={`${styles.tab} ${activeTab === "results" ? styles.tabActive : ""}`} onClick={() => setActiveTab("results")}>
            Results ({results.length})
          </button>
        </div>

        {activeTab === "exams" && (
          <div className={styles.card}>
            <h3>Exams</h3>
            {loading ? (
              <p style={{ color: "#94a3b8" }}>Loading exams...</p>
            ) : exams.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>No exams created yet. <a href="/admin-create-exam">Create one</a></p>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Batch</th>
                      <th>Duration</th>
                      <th>Questions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map((exam) => (
                      <tr key={exam.id}>
                        <td>{exam.id}</td>
                        <td><strong>{exam.name}</strong></td>
                        <td><span className={`${styles.badge} ${styles.badgeInfo}`}>{exam.type}</span></td>
                        <td>{exam.batch}</td>
                        <td>{exam.duration} min</td>
                        <td>{exam.total_questions || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "students" && (
          <div className={styles.card}>
            <h3>Students</h3>
            {loading ? (
              <p style={{ color: "#94a3b8" }}>Loading students...</p>
            ) : students.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>No students registered yet. <a href="/admin-add-student">Add one</a></p>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Batch</th>
                      <th>Exam Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td>{student.id}</td>
                        <td><strong>{student.name}</strong></td>
                        <td>{student.email}</td>
                        <td>{student.batch || "—"}</td>
                        <td>{student.exam_type ? <span className={`${styles.badge} ${styles.badgeInfo}`}>{student.exam_type}</span> : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "results" && (
          <div className={styles.card}>
            <h3>Results</h3>
            {loading ? (
              <p style={{ color: "#94a3b8" }}>Loading results...</p>
            ) : results.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>No exam results yet.</p>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Exam</th>
                      <th>Score</th>
                      <th>Time Taken</th>
                      <th>Tab Switches</th>
                      <th>Status</th>
                      <th>Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result) => (
                      <tr key={result.id}>
                        <td><strong>{result.student_name}</strong></td>
                        <td>{result.exam_name}</td>
                        <td style={{ fontWeight: 700, color: "#16a34a" }}>{result.score}</td>
                        <td>{Math.floor((result.time_taken || 0) / 60)}m {(result.time_taken || 0) % 60}s</td>
                        <td>
                          {result.tab_switches > 0 ? (
                            <span style={{
                              color: result.tab_switches >= 3 ? '#dc2626' : '#ea580c',
                              fontWeight: 700,
                              fontSize: '0.85rem'
                            }}>
                              {result.tab_switches}
                              {result.tab_switches >= 3 && ' ⚠️'}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>0</span>
                          )}
                        </td>
                        <td>
                          <span className={`${styles.badge} ${result.status === "completed" ? styles.badgeSuccess : styles.badgeWarning}`}>
                            {result.status}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.82rem" }}>{result.submitted_at ? new Date(result.submitted_at).toLocaleString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}
