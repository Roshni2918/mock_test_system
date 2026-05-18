import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import styles from "../styles/Admin.module.css";

export default function AdminResults() {
  const [allResults, setAllResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedExamType, setSelectedExamType] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [scoreFilter, setScoreFilter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedResultDetails, setSelectedResultDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const examTypes = ["JEE", "NEET", "NDA", "UPSC", "Mock Test", "Practice Test", "Other"];

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

  const scoreRanges = [
    { key: 'above40', label: 'Above 40', check: (s) => s >= 40 },
    { key: 'above30', label: 'Above 30', check: (s) => s >= 30 },
    { key: 'above20', label: 'Above 20', check: (s) => s >= 20 },
    { key: 'above10', label: 'Above 10', check: (s) => s >= 10 },
    { key: 'below10', label: 'Below 10', check: (s) => s <= 10 },
    { key: 'below5', label: 'Below 5', check: (s) => s <= 5 },
    { key: 'top10', label: 'Top 10 Students', isSpecial: true },
  ];

  const handleExamFilter = (e) => {
    setSelectedExam(e.target.value);
  };

  const handleExamTypeFilter = (e) => {
    setSelectedExamType(e.target.value);
  };

  const handleScoreFilter = (key) => {
    setScoreFilter(prev => prev === key ? null : key);
  };

  useEffect(() => {
    let filtered = allResults;
    if (selectedExam) {
      filtered = filtered.filter(r => r.exam_id && r.exam_id.toString() === selectedExam.toString());
    }
    if (selectedExamType) {
      filtered = filtered.filter(r => r.exam_type === selectedExamType);
    }
    if (scoreFilter) {
      if (scoreFilter === 'top10') {
        filtered = [...filtered].sort((a, b) => b.score - a.score).slice(0, 10);
      } else {
        const range = scoreRanges.find(r => r.key === scoreFilter);
        if (range) {
          filtered = filtered.filter(r => range.check(r.score));
        }
      }
    }
    setFilteredResults(filtered);
  }, [allResults, selectedExam, selectedExamType, scoreFilter]);

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

  if (loading) return <AdminLayout activePage="Exam Results"><div style={{ padding: "20px", color: "#94a3b8" }}>Loading...</div></AdminLayout>;

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout activePage="Exam Results">
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconBlue}`}>📊</div>
            <div className={styles.statInfo}>
              <h4>{filteredResults.length}</h4>
              <p>Total Submissions</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconGreen}`}>📈</div>
            <div className={styles.statInfo}>
              <h4>{stats.avg}</h4>
              <p>Average Score</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconYellow}`}>🏆</div>
            <div className={styles.statInfo}>
              <h4>{stats.highest}</h4>
              <p>Highest Score</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconRed}`}>📉</div>
            <div className={styles.statInfo}>
              <h4>{stats.lowest}</h4>
              <p>Lowest Score</p>
            </div>
          </div>
        </div>

        <div className={styles.card} style={{ marginBottom: "20px", display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#475569" }}>Exam:</label>
            <select className={styles.select} value={selectedExam} onChange={handleExamFilter} style={{ width: "auto", minWidth: "160px" }}>
              <option value="">All Exams</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.name} ({exam.batch})</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#475569" }}>Type:</label>
            <select className={styles.select} value={selectedExamType} onChange={handleExamTypeFilter} style={{ width: "auto", minWidth: "140px" }}>
              <option value="">All Types</option>
              {examTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <span style={{ color: "#64748b", fontSize: "0.85rem", marginLeft: "auto" }}>
            Showing {filteredResults.length} of {allResults.length} results
          </span>
        </div>

        <div className={styles.card} style={{ marginBottom: "20px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#475569" }}>Score:</span>
          {scoreRanges.map(range => {
            const count = range.isSpecial
              ? Math.min(10, allResults.length)
              : allResults.filter(r => range.check(r.score)).length;
            return (
              <button
                key={range.key}
                onClick={() => handleScoreFilter(range.key)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  border: scoreFilter === range.key ? "2px solid #2563eb" : "1px solid #dbe2ea",
                  background: scoreFilter === range.key ? "#eff6ff" : "#fff",
                  color: scoreFilter === range.key ? "#2563eb" : "#475569",
                  fontWeight: scoreFilter === range.key ? 700 : 500,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontFamily: "inherit"
                }}
              >
                {range.label}
                <span style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  background: scoreFilter === range.key ? "#dbeafe" : "#e2e8f0",
                  color: scoreFilter === range.key ? "#1d4ed8" : "#334155",
                  borderRadius: "999px",
                  padding: "1px 7px",
                }}>
                  {count}
                </span>
              </button>
            );
          })}
          {scoreFilter && (
            <button
              onClick={() => setScoreFilter(null)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                background: "#fff",
                color: "#64748b",
                fontSize: "0.82rem",
                cursor: "pointer",
                fontFamily: "inherit"
              }}
            >
              Clear
            </button>
          )}
        </div>

        {filteredResults.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Exam Name</th>
                  <th>Exam Type</th>
                  <th>Score</th>
                  <th>Neg. Mark</th>
                  <th>Time Taken</th>
                  <th>Tab Switches</th>
                  <th>Status</th>
                  <th>Submitted At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result) => (
                  <tr key={result.id}>
                    <td><strong>{result.student_name}</strong></td>
                    <td>{result.exam_name}</td>
                    <td>{result.exam_type ? <span className={`${styles.badge} ${styles.badgeInfo}`}>{result.exam_type}</span> : '—'}</td>
                    <td style={{ fontWeight: 700, color: result.score >= 5 ? "#16a34a" : "#dc2626" }}>{result.score}</td>
                    <td style={{ fontSize: "0.82rem", color: result.negative_marking ? "#dc2626" : "#94a3b8" }}>
                      {result.negative_marking ? `-${result.negative_marking}` : '—'}
                    </td>
                    <td>{Math.round(result.time_taken / 60)} min</td>
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
                      <span className={`${styles.badge} ${result.status === 'completed' ? styles.badgeSuccess : styles.badgeWarning}`}>
                        {result.status}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.82rem" }}>{result.submitted_at ? new Date(result.submitted_at).toLocaleString() : "—"}</td>
                    <td>
                      <button className={styles.btnSecondary} style={{ padding: "4px 12px", fontSize: "0.82rem" }}
                        onClick={() => fetchResultDetails(result.id)} disabled={detailsLoading}>
                        {detailsLoading ? "..." : "Details"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.card} style={{ textAlign: "center", color: "#94a3b8" }}>
            {selectedExam || selectedExamType ? (
              <div>
                <p>No results match your filters.</p>
                <button className={styles.btnSecondary} style={{ marginTop: "10px" }}
                  onClick={() => { setSelectedExam(""); setSelectedExamType(""); setFilteredResults(allResults); }}>
                  Clear Filters
                </button>
              </div>
            ) : "No results found"}
          </div>
        )}

        {selectedResultDetails && (
          <div className={styles.card} style={{ marginTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Submission Details</h3>
              <button className={styles.btnSecondary} style={{ padding: "4px 14px", fontSize: "0.82rem" }} onClick={() => setSelectedResultDetails(null)}>Close</button>
            </div>

            <div style={{ lineHeight: 1.8, fontSize: "0.9rem", marginBottom: "16px" }}>
              <p><strong>Student:</strong> {selectedResultDetails.result.student_name} ({selectedResultDetails.result.student_email})</p>
              <p><strong>Exam:</strong> {selectedResultDetails.result.exam_name} ({selectedResultDetails.result.exam_type} / {selectedResultDetails.result.exam_batch})</p>
              <p><strong>Score:</strong> {selectedResultDetails.result.score}</p>
              {selectedResultDetails.result.negative_marking ? (
                <p><strong>Negative Marking:</strong> <span style={{ color: '#dc2626' }}>-{selectedResultDetails.result.negative_marking} per wrong answer</span></p>
              ) : null}
              <p><strong>Tab Switches:</strong> <span style={{ color: selectedResultDetails.result.tab_switches >= 3 ? '#dc2626' : '#475569', fontWeight: 700 }}>{selectedResultDetails.result.tab_switches || 0}</span></p>
              <p><strong>Submitted At:</strong> {new Date(selectedResultDetails.result.submitted_at).toLocaleString()}</p>
            </div>

            <div className={styles.statsGrid} style={{ gridTemplateColumns: "repeat(5, 1fr)", marginBottom: "16px" }}>
              <div className={styles.statCard} style={{ justifyContent: "center", textAlign: "center" }}>
                <div className={styles.statInfo}>
                  <h4>{selectedResultDetails.summary.total_questions}</h4>
                  <p>Total</p>
                </div>
              </div>
              <div className={styles.statCard} style={{ justifyContent: "center", textAlign: "center" }}>
                <div className={styles.statInfo}>
                  <h4>{selectedResultDetails.summary.attempted_questions}</h4>
                  <p>Attempted</p>
                </div>
              </div>
              <div className={styles.statCard} style={{ justifyContent: "center", textAlign: "center" }}>
                <div className={styles.statInfo}>
                  <h4>{selectedResultDetails.summary.unattempted_questions}</h4>
                  <p>Unattempted</p>
                </div>
              </div>
              <div className={styles.statCard} style={{ justifyContent: "center", textAlign: "center" }}>
                <div className={styles.statInfo}>
                  <h4 style={{ color: "#16a34a" }}>{selectedResultDetails.summary.correct_answers}</h4>
                  <p>Correct</p>
                </div>
              </div>
              <div className={styles.statCard} style={{ justifyContent: "center", textAlign: "center" }}>
                <div className={styles.statInfo}>
                  <h4 style={{ color: "#dc2626" }}>{selectedResultDetails.summary.wrong_answers}</h4>
                  <p>Wrong</p>
                </div>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
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
                        <div style={{ display: "grid", gap: "4px" }}>
                          {(question.options || []).map((opt) => (
                            <div key={opt.id} style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "1px solid #e2e8f0",
                              backgroundColor: opt.is_correct ? "#f0fdf4" : opt.is_selected ? "#fef2f2" : "#f8fafc",
                              fontSize: "0.82rem"
                            }}>
                              <strong>{opt.label}.</strong> {opt.text}
                              {opt.is_selected ? " (Student)" : ""}
                              {opt.is_correct ? " (Correct)" : ""}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: question.is_attempted ? "#16a34a" : "#b45309" }}>
                        {question.is_attempted ? "Yes" : "No"}
                      </td>
                      <td style={{ fontWeight: 700 }}>{question.marks_obtained}</td>
                      <td>{question.selected_option_label ? `${question.selected_option_label}. ${question.selected_option_text}` : "—"}</td>
                      <td>{question.correct_option_label ? `${question.correct_option_label}. ${question.correct_option_text}` : "—"}</td>
                      <td style={{ fontWeight: 700, color: question.status === "correct" ? "#16a34a" : question.status === "wrong" ? "#dc2626" : "#b45309" }}>
                        {question.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}
