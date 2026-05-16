import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import styles from "../styles/Admin.module.css";

export default function AdminUploadExam() {
  const [step, setStep] = useState("form"); // form | preview | done
  const [exam, setExam] = useState({
    name: "",
    type: "",
    batch: "",
    duration: "",
    scheduled_date: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parseResult, setParseResult] = useState(null);
  const [saveResult, setSaveResult] = useState(null);
  const [editingQ, setEditingQ] = useState(null);

  const updateExamField = (field, value) => {
    setExam((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
      setParseResult(null);
      setStep("form");
    }
  };

  const validateForm = () => {
    const errs = [];
    if (!exam.name.trim()) errs.push("Exam name is required");
    if (!exam.type.trim()) errs.push("Exam type is required");
    if (!exam.batch.trim()) errs.push("Batch is required");
    if (!exam.duration || exam.duration <= 0) errs.push("Duration must be greater than 0");
    if (!exam.scheduled_date) errs.push("Scheduled date & time are required");
    if (!file) errs.push("Please select a Word file");
    if (errs.length > 0) { setError(errs.join(". ")); return false; }
    return true;
  };

  const handleParse = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("examFile", file);

      const response = await fetch("/api/exams/parse-word", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to parse file");
      }
      if (data.totalQuestions === 0) {
        throw new Error("No questions found in the file. Check the format.");
      }
      setParseResult(data);
      setStep("preview");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      // Send pre-parsed questions (matches preview exactly, no re-parsing)
      const formData = new FormData();
      formData.append("name", exam.name);
      formData.append("type", exam.type);
      formData.append("batch", exam.batch);
      formData.append("duration", exam.duration);
      formData.append("scheduled_date", exam.scheduled_date);
      formData.append("questions", JSON.stringify(parseResult.sections));

      const response = await fetch("/api/exams/upload-word-exam", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      let json;
      try { json = await response.json(); } catch { json = {}; }

      if (!response.ok) {
        throw new Error(json.message || `Upload failed (${response.status})`);
      }

      setSaveResult(json);
      setStep("done");
      if (window.reloadExams) window.reloadExams();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setParseResult(null);
    setStep("form");
    setError("");
  };

  if (step === "done") {
    return (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout activePage="Upload Exam">
          <div className={styles.card} style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
            <h3>Exam Created Successfully!</h3>
            <p style={{ color: "#64748b", margin: "8px 0 20px" }}>
              {exam.name} — {saveResult?.total_questions || parseResult?.totalQuestions || 0} questions uploaded.
            </p>
            <button className={styles.btn} onClick={() => { setStep("form"); setSaveResult(null); setExam({ name: "", type: "", batch: "", duration: "", scheduled_date: "" }); setFile(null); setParseResult(null); }}>
              Upload Another Exam
            </button>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout activePage="Upload Exam">
        {step === "form" && (
          <div className={styles.card}>
            <h3>Upload Exam from Word File</h3>
            <p style={{ color: "#64748b", fontSize: "0.88rem", marginBottom: "20px" }}>
              Step 1: Fill exam details and upload the Word file. Step 2: Preview and confirm.
            </p>

            <div style={{ marginBottom: "24px", padding: "24px", border: "2px dashed #cbd5e1", borderRadius: "12px", background: "#f8fafc" }}>
              <h4 style={{ marginBottom: "12px", color: "#2563eb", fontWeight: 600, fontSize: "0.95rem" }}>Select Word File</h4>
              <input type="file" onChange={handleFileChange}
                className={styles.input} style={{ marginBottom: "12px" }}
                disabled={loading} accept=".doc,.docx" />
              {file ? (
                <div style={{ padding: "10px 14px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", fontSize: "0.85rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span><strong>{file.name}</strong> <small>({(file.size / 1024).toFixed(0)} KB)</small></span>
                  <button onClick={removeFile} className={styles.btnDanger} style={{ padding: "2px 10px", fontSize: "0.78rem" }} disabled={loading}>Remove</button>
                </div>
              ) : (
                <p style={{ fontSize: "0.82rem", color: "#94a3b8" }}>Supported: .doc, .docx</p>
              )}
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Exam Name</label>
                <input className={styles.input} value={exam.name} onChange={(e) => updateExamField("name", e.target.value)} placeholder="Enter exam name" disabled={loading} />
              </div>
              <div className={styles.formGroup}>
                <label>Exam Type</label>
                <select className={styles.select} value={exam.type} onChange={(e) => updateExamField("type", e.target.value)} disabled={loading} required>
                  <option value="">Select Type</option>
                  <option value="JEE">JEE</option>
                  <option value="NEET">NEET</option>
                  <option value="NDA">NDA</option>
                  <option value="UPSC">UPSC</option>
                  <option value="SSC">SSC</option>
                  <option value="Police Constable">Police Constable</option>
                  <option value="Mock Test">Mock Test</option>
                  <option value="Practice Test">Practice Test</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Batch</label>
                <input className={styles.input} value={exam.batch} onChange={(e) => updateExamField("batch", e.target.value)} placeholder="e.g. 2024" disabled={loading} />
              </div>
              <div className={styles.formGroup}>
                <label>Duration (minutes)</label>
                <input className={styles.input} type="number" min="1" value={exam.duration} onChange={(e) => updateExamField("duration", e.target.value)} placeholder="60" disabled={loading} />
              </div>
              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Scheduled Date & Time</label>
                <input className={styles.input} type="datetime-local" value={exam.scheduled_date} onChange={(e) => updateExamField("scheduled_date", e.target.value)} disabled={loading}
                  min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)} />
              </div>
            </div>

            {error && (
              <div style={{ marginTop: "16px", padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#dc2626", fontSize: "0.88rem" }}>
                {error}
              </div>
            )}

            <button className={styles.btn} onClick={handleParse} disabled={loading} style={{ marginTop: "20px", padding: "12px 30px", fontSize: "1rem" }}>
              {loading ? "Parsing file..." : "Parse & Preview Questions"}
            </button>
          </div>
        )}

        {step === "preview" && parseResult && (
          <div>
            <div className={styles.card} style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h3 style={{ margin: 0 }}>{exam.name}</h3>
                  <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "4px" }}>
                    {exam.type} · {exam.batch} · {exam.duration} min · {new Date(exam.scheduled_date).toLocaleString()}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#2563eb" }}>{parseResult.totalQuestions}</span>
                  <span style={{ color: "#64748b", fontSize: "0.85rem", display: "block" }}>questions parsed</span>
                </div>
              </div>
              {parseResult.hasOcr && (
                <p style={{ marginTop: "8px", fontSize: "0.82rem", color: "#b45309", background: "#fffbeb", padding: "6px 10px", borderRadius: "6px" }}>
                  ⓘ OCR was applied — some text may need review.
                </p>
              )}
            </div>

            <p style={{ fontSize: "0.88rem", color: "#64748b", marginBottom: "12px" }}>
              Review the parsed questions below. You can edit any question text, options, or correct answer before creating the exam.
            </p>

            {parseResult.sections.map((section, si) => (
              <div key={si} className={styles.card} style={{ marginBottom: "16px" }}>
                <h4 style={{ fontSize: "0.95rem", marginBottom: "12px", color: "#1e3a5f" }}>
                  {section.name} ({section.questions.length} questions)
                </h4>

                {section.questions.map((q, qi) => {
                  const isEditing = editingQ === `${si}-${qi}`;
                  return (
                    <div key={qi} className={styles.questionBlock} style={{ marginBottom: "10px" }}>
                      <div className={styles.questionHeader}>
                        <span className={styles.questionNumber}>Q{q.number}</span>
                        <button className={styles.btnSecondary} style={{ padding: "2px 10px", fontSize: "0.78rem" }}
                          onClick={() => setEditingQ(isEditing ? null : `${si}-${qi}`)}>
                          {isEditing ? "Done" : "Edit"}
                        </button>
                      </div>
                      <p style={{ fontSize: "0.9rem", marginBottom: "8px", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                        {q.text}
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                        {q.options.map((opt, oi) => (
                          <div key={oi} style={{
                            padding: "6px 10px", borderRadius: "6px", fontSize: "0.85rem",
                            border: q.answer === opt.letter ? "2px solid #16a34a" : "1px solid #e2e8f0",
                            background: q.answer === opt.letter ? "#f0fdf4" : "#fff",
                          }}>
                            <strong>{opt.letter}.</strong> {opt.text}
                            {q.answer === opt.letter && <span style={{ color: "#16a34a", marginLeft: "6px" }}>✓</span>}
                          </div>
                        ))}
                      </div>
                      {!q.answer && (
                        <p style={{ color: "#dc2626", fontSize: "0.78rem", marginTop: "4px" }}>⚠ No answer key found for this question</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
              <button className={styles.btn} onClick={handleCreateExam} disabled={loading} style={{ flex: 1, padding: "14px", fontSize: "1.05rem" }}>
                {loading ? "Creating exam..." : `Confirm & Create Exam (${parseResult.totalQuestions} questions)`}
              </button>
              <button className={styles.btnSecondary} onClick={() => setStep("form")} disabled={loading}>
                Back
              </button>
            </div>

            {error && (
              <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#dc2626", fontSize: "0.88rem", marginBottom: "16px" }}>
                {error}
              </div>
            )}
          </div>
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}
