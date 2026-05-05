import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import styles from "../styles/Admin.module.css";

export default function AdminDashboard() {
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("exams"); // exams, students, results

  // Expose refresh function globally for add-student page
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

  // FIXED: Fetch exams from backend
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

  // FIXED: Fetch students from backend
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

  // FIXED: Fetch results from backend
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

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout activePage="Dashboard">
        <div style={{ padding: "20px" }}>
          <h2>📊 Admin Dashboard</h2>
          
          {/* TAB NAVIGATION */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "2px solid #ddd" }}>
            <button
              onClick={() => setActiveTab("exams")}
              style={{
                padding: "10px 20px",
                background: activeTab === "exams" ? "#007bff" : "#f0f0f0",
                color: activeTab === "exams" ? "white" : "#333",
                border: "none",
                borderRadius: "5px 5px 0 0",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              📝 Exams ({exams.length})
            </button>
            <button
              onClick={() => setActiveTab("students")}
              style={{
                padding: "10px 20px",
                background: activeTab === "students" ? "#007bff" : "#f0f0f0",
                color: activeTab === "students" ? "white" : "#333",
                border: "none",
                borderRadius: "5px 5px 0 0",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              👥 Students ({students.length})
            </button>
            <button
              onClick={() => setActiveTab("results")}
              style={{
                padding: "10px 20px",
                background: activeTab === "results" ? "#007bff" : "#f0f0f0",
                color: activeTab === "results" ? "white" : "#333",
                border: "none",
                borderRadius: "5px 5px 0 0",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              📊 Results ({results.length})
            </button>
          </div>

          {/* EXAMS TAB */}
          {activeTab === "exams" && (
            <div>
              <h3>📝 Available Exams</h3>
              {loading ? (
                <p>Loading exams...</p>
              ) : exams.length === 0 ? (
                <p style={{ color: "#999" }}>No exams created yet. <a href="/admin-create-exam">Create one</a></p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
                  <thead>
                    <tr style={{ background: "#f0f0f0", borderBottom: "2px solid #ddd" }}>
                      <th style={{ padding: "10px", textAlign: "left" }}>ID</th>
                      <th style={{ padding: "10px", textAlign: "left" }}>Name</th>
                      <th style={{ padding: "10px", textAlign: "left" }}>Type</th>
                      <th style={{ padding: "10px", textAlign: "left" }}>Batch</th>
                      <th style={{ padding: "10px", textAlign: "center" }}>Duration</th>
                      <th style={{ padding: "10px", textAlign: "center" }}>Questions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map((exam) => (
                      <tr key={exam.id} style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "10px" }}>{exam.id}</td>
                        <td style={{ padding: "10px" }}><strong>{exam.name}</strong></td>
                        <td style={{ padding: "10px" }}>{exam.type}</td>
                        <td style={{ padding: "10px" }}>{exam.batch}</td>
                        <td style={{ padding: "10px", textAlign: "center" }}>{exam.duration} min</td>
                        <td style={{ padding: "10px", textAlign: "center" }}>{exam.total_questions || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* STUDENTS TAB */}
          {activeTab === "students" && (
            <div>
              <h3>👥 Registered Students</h3>
              {loading ? (
                <p>Loading students...</p>
              ) : students.length === 0 ? (
                <p style={{ color: "#999" }}>No students registered yet. <a href="/admin-add-student">Add one</a></p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
                  <thead>
                    <tr style={{ background: "#f0f0f0", borderBottom: "2px solid #ddd" }}>
                      <th style={{ padding: "10px", textAlign: "left" }}>ID</th>
                      <th style={{ padding: "10px", textAlign: "left" }}>Name</th>
                      <th style={{ padding: "10px", textAlign: "left" }}>Email</th>
                      <th style={{ padding: "10px", textAlign: "left" }}>Batch</th>
                                          </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "10px" }}>{student.id}</td>
                        <td style={{ padding: "10px" }}><strong>{student.name}</strong></td>
                        <td style={{ padding: "10px" }}>{student.email}</td>
                        <td style={{ padding: "10px" }}>{student.batch || "N/A"}</td>
                                              </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* RESULTS TAB */}
          {activeTab === "results" && (
            <div>
              <h3>📊 Exam Results</h3>
              {loading ? (
                <p>Loading results...</p>
              ) : results.length === 0 ? (
                <p style={{ color: "#999" }}>No exam results yet.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "15px" }}>
                  <thead>
                    <tr style={{ background: "#f0f0f0", borderBottom: "2px solid #ddd" }}>
                      <th style={{ padding: "10px", textAlign: "left" }}>Student</th>
                      <th style={{ padding: "10px", textAlign: "left" }}>Exam</th>
                      <th style={{ padding: "10px", textAlign: "center" }}>Score</th>
                      <th style={{ padding: "10px", textAlign: "center" }}>Time Taken</th>
                      <th style={{ padding: "10px", textAlign: "center" }}>Status</th>
                      <th style={{ padding: "10px", textAlign: "left" }}>Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result) => (
                      <tr key={result.id} style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "10px" }}><strong>{result.student_name}</strong></td>
                        <td style={{ padding: "10px" }}>{result.exam_name}</td>
                        <td style={{ padding: "10px", textAlign: "center", fontWeight: "bold", color: "#28a745" }}>
                          {result.score}
                        </td>
                        <td style={{ padding: "10px", textAlign: "center" }}>
                          {Math.floor((result.time_taken || 0) / 60)}m {(result.time_taken || 0) % 60}s
                        </td>
                        <td style={{ padding: "10px", textAlign: "center" }}>
                          <span style={{
                            padding: "5px 10px",
                            background: result.status === "completed" ? "#28a745" : "#ffc107",
                            color: "white",
                            borderRadius: "3px",
                            fontSize: "12px"
                          }}>
                            {result.status}
                          </span>
                        </td>
                        <td style={{ padding: "10px", fontSize: "12px" }}>
                          {result.submitted_at ? new Date(result.submitted_at).toLocaleString() : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}

