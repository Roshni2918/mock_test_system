import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import styles from "../styles/Admin.module.css";

export default function AdminResults() {
  const [allResults, setAllResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResultDetails, setSelectedResultDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchAllResults();
    fetchExams();
  }, []);

  const parseResponseSafely = async (response) => {
    const responseText = await response.text();
    if (!responseText || !responseText.trim()) {
      throw new Error("Empty response from server");
    }
    const trimmed = responseText.trim();
    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
      throw new Error("Server returned non-JSON response. Please make sure backend is running on port 5000 and restarted after latest changes.");
    }
    return JSON.parse(trimmed);
  };

  const fetchAllResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch("/api/admin/results", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await parseResponseSafely(res);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch results");
      }
      setAllResults(data);
      setFilteredResults(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching results:", error);
      alert("Error fetching results");
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch("/api/admin/exams", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await parseResponseSafely(res);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch exams");
      }
      setExams(data);
    } catch (error) {
      console.error("Error fetching exams:", error);
    }
  };

  const handleExamFilter = (e) => {
    const examId = e.target.value;
    setSelectedExam(examId);

    if (examId) {
      setFilteredResults(allResults.filter(r => r.exam_id === parseInt(examId)));
    } else {
      setFilteredResults(allResults);
    }
  };

  const calculateStats = () => {
    if (filteredResults.length === 0) return { avg: 0, highest: 0, lowest: 0 };
    const scores = filteredResults.map(r => r.score);
    const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    return { avg, highest, lowest };
  };

  const stats = calculateStats();

  const fetchResultDetails = async (resultId) => {
    setDetailsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/results/${resultId}/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await parseResponseSafely(res);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch result details");
      }
      setSelectedResultDetails(data);
    } catch (error) {
      console.error("Error fetching result details:", error);
      alert(error.message || "Failed to fetch result details");
    } finally {
      setDetailsLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout activePage="Exam Results">
        <div>
          <h3>Exam Results Dashboard</h3>

        {/* FILTER */}
        <div className={styles.card} style={{ marginBottom: "20px" }}>
          <label>
            Filter by Exam:{" "}
            <select value={selectedExam} onChange={handleExamFilter}>
              <option value="">All Exams</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {exam.name} ({exam.batch})
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* STATISTICS */}
        {filteredResults.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "20px" }}>
            <div className={styles.card} style={{ textAlign: "center" }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#666" }}>Total Submissions</h4>
              <div style={{ fontSize: "28px", fontWeight: "bold", color: "#007bff" }}>
                {filteredResults.length}
              </div>
            </div>
            <div className={styles.card} style={{ textAlign: "center" }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#666" }}>Average Score</h4>
              <div style={{ fontSize: "28px", fontWeight: "bold", color: "#28a745" }}>
                {stats.avg}
              </div>
            </div>
            <div className={styles.card} style={{ textAlign: "center" }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#666" }}>Highest Score</h4>
              <div style={{ fontSize: "28px", fontWeight: "bold", color: "#17a2b8" }}>
                {stats.highest}
              </div>
            </div>
            <div className={styles.card} style={{ textAlign: "center" }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#666" }}>Lowest Score</h4>
              <div style={{ fontSize: "28px", fontWeight: "bold", color: "#ffc107" }}>
                {stats.lowest}
              </div>
            </div>
          </div>
        )}

        {/* RESULTS TABLE */}
        {filteredResults.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Exam Name</th>
                <th>Score</th>
                <th>Time Taken (min)</th>
                <th>Status</th>
                <th>Submitted At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result) => (
                <tr key={result.id}>
                  <td>{result.student_name}</td>
                  <td>{result.exam_name}</td>
                  <td style={{ fontWeight: "bold", color: result.score >= 5 ? "#28a745" : "#dc3545" }}>
                    {result.score}
                  </td>
                  <td>{Math.round(result.time_taken / 60)}</td>
                  <td>
                    <span style={{
                      padding: "5px 10px",
                      borderRadius: "4px",
                      background: result.status === 'completed' ? "#d4edda" : "#fff3cd",
                      color: result.status === 'completed' ? "#155724" : "#856404"
                    }}>
                      {result.status}
                    </span>
                  </td>
                  <td>{new Date(result.submitted_at).toLocaleString()}</td>
                  <td>
                    <button
                      className={styles.commonBtn}
                      onClick={() => fetchResultDetails(result.id)}
                      disabled={detailsLoading}
                    >
                      {detailsLoading ? "Loading..." : "View Details"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            No results found
          </div>
        )}

        {selectedResultDetails && (
          <div className={styles.card} style={{ marginTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h4 style={{ margin: 0 }}>Submission Details</h4>
              <button className={styles.commonBtn} onClick={() => setSelectedResultDetails(null)}>Close</button>
            </div>

            <div style={{ marginTop: "12px", lineHeight: 1.7 }}>
              <div><strong>Student:</strong> {selectedResultDetails.result.student_name} ({selectedResultDetails.result.student_email})</div>
              <div><strong>Exam:</strong> {selectedResultDetails.result.exam_name} ({selectedResultDetails.result.exam_type} - {selectedResultDetails.result.exam_batch})</div>
              <div><strong>Score:</strong> {selectedResultDetails.result.score}</div>
              <div><strong>Submitted At:</strong> {new Date(selectedResultDetails.result.submitted_at).toLocaleString()}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(120px, 1fr))", gap: "10px", marginTop: "14px" }}>
              <div className={styles.topCard} style={{ marginTop: 0, textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "#666" }}>Total</div>
                <div style={{ fontWeight: 700 }}>{selectedResultDetails.summary.total_questions}</div>
              </div>
              <div className={styles.topCard} style={{ marginTop: 0, textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "#666" }}>Attempted</div>
                <div style={{ fontWeight: 700 }}>{selectedResultDetails.summary.attempted_questions}</div>
              </div>
              <div className={styles.topCard} style={{ marginTop: 0, textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "#666" }}>Unattempted</div>
                <div style={{ fontWeight: 700 }}>{selectedResultDetails.summary.unattempted_questions}</div>
              </div>
              <div className={styles.topCard} style={{ marginTop: 0, textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "#666" }}>Correct</div>
                <div style={{ fontWeight: 700, color: "#28a745" }}>{selectedResultDetails.summary.correct_answers}</div>
              </div>
              <div className={styles.topCard} style={{ marginTop: 0, textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "#666" }}>Wrong</div>
                <div style={{ fontWeight: 700, color: "#dc3545" }}>{selectedResultDetails.summary.wrong_answers}</div>
              </div>
            </div>

            <table className={styles.table} style={{ marginTop: "14px" }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Question</th>
                  <th>All Options</th>
                  <th>Attempted</th>
                  <th>Marks</th>
                  <th>Student Answer</th>
                  <th>Correct Answer</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {selectedResultDetails.questions.map((question, index) => (
                  <tr key={question.question_id}>
                    <td>{index + 1}</td>
                    <td style={{ textAlign: "left" }}>{question.question_text}</td>
                    <td style={{ textAlign: "left" }}>
                      <div style={{ display: "grid", gap: "6px" }}>
                        {(question.options || []).map((opt) => (
                          <div
                            key={opt.id}
                            style={{
                              padding: "6px 8px",
                              borderRadius: "6px",
                              border: "1px solid #e1e8f0",
                              backgroundColor: opt.is_correct
                                ? "#eaf8ef"
                                : opt.is_selected
                                  ? "#fff1f0"
                                  : "#f8fbff",
                              color: "#1f2937"
                            }}
                          >
                            <strong>{opt.label}.</strong> {opt.text}
                            {opt.is_selected ? " (Student)" : ""}
                            {opt.is_correct ? " (Correct)" : ""}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: question.is_attempted ? "#0f9d73" : "#856404" }}>
                      {question.is_attempted ? "Yes" : "No"}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {question.marks_obtained}
                    </td>
                    <td style={{ textAlign: "left" }}>
                      {question.selected_option_label
                        ? `${question.selected_option_label}. ${question.selected_option_text}`
                        : "Not attempted"}
                    </td>
                    <td style={{ textAlign: "left" }}>
                      {question.correct_option_label
                        ? `${question.correct_option_label}. ${question.correct_option_text}`
                        : "N/A"}
                    </td>
                    <td style={{
                      fontWeight: 700,
                      color: question.status === "correct"
                        ? "#28a745"
                        : question.status === "wrong"
                          ? "#dc3545"
                          : "#856404"
                    }}>
                      {question.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  </ProtectedRoute>
  );
}
