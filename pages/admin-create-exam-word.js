import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import styles from "../styles/Admin.module.css";

export default function AdminCreateExamWord() {
  const [exam, setExam] = useState({
    name: "",
    type: "",
    batch: "",
    duration: "",
    scheduled_date: "",
  });

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);

  const updateExamField = (field, value) => {
    setExam((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage("");
      setErrors([]);
      setWarnings([]);
    }
  };

  const validateForm = () => {
    const newErrors = [];
    if (!exam.name.trim()) newErrors.push("Exam name is required");
    if (!exam.type.trim()) newErrors.push("Exam type is required");
    if (!exam.batch.trim()) newErrors.push("Batch is required");
    if (!exam.duration || exam.duration <= 0) newErrors.push("Duration must be greater than 0");
    if (!exam.scheduled_date) newErrors.push("Scheduled date and time are required");
    if (!file) newErrors.push("Please select a Word file to upload");
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleCreateExam = async () => {
    if (!validateForm()) return;

    setUploading(true);
    setMessage("Processing Word file...");

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("examFile", file);
      formData.append("name", exam.name);
      formData.append("type", exam.type);
      formData.append("batch", exam.batch);
      formData.append("duration", exam.duration);
      formData.append("scheduled_date", exam.scheduled_date);

      const response = await fetch("/api/exams/upload-word-exam", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      let data;
      let responseText = "";
      try {
        responseText = await response.text();
        if (responseText === null || responseText === undefined || responseText.trim() === '') {
          throw new Error('Empty response from server');
        }
        const trimmedText = responseText.trim();
        if (trimmedText.startsWith('{') || trimmedText.startsWith('[')) {
          data = JSON.parse(trimmedText);
        } else {
          console.error('Non-JSON response:', responseText.substring(0, 200));
          throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`);
        }
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        throw new Error('Invalid server response. Please check backend logs.');
      }

      if (!response.ok) {
        if (data && data.errors) {
          setErrors(data.errors);
        }
        throw new Error((data && data.message) || "Upload failed");
      }

      setMessage(`Exam created successfully with ${data.total_questions || 0} questions.`);
      setWarnings(data?.warnings || []);
      setExam({ name: "", type: "", batch: "", duration: "", scheduled_date: "" });
      setFile(null);
      setErrors([]);

      if (window.reloadExams) {
        window.reloadExams();
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setMessage("");
    setErrors([]);
    setWarnings([]);
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout activePage="Upload Exam">
        <div className={styles.card}>
          <h3>Create Exam from Word File</h3>

          <div style={{ marginBottom: "24px", padding: "24px", border: "2px dashed #cbd5e1", borderRadius: "12px", background: "#f8fafc" }}>
            <h4 style={{ marginBottom: "12px", color: "#2563eb", fontWeight: 600, fontSize: "0.95rem" }}>Select Word File</h4>

            <input type="file" onChange={handleFileChange}
              className={styles.input} style={{ marginBottom: "12px", padding: "10px" }}
              disabled={uploading} />

            {file && (
              <div style={{ padding: "10px 14px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px", marginBottom: "8px", fontSize: "0.85rem" }}>
                <strong>Selected File:</strong> {file.name} <small>({(file.size / 1024 / 1024).toFixed(2)} MB)</small>
                <button onClick={removeFile} className={styles.btnDanger} style={{ marginLeft: "10px", padding: "2px 10px", fontSize: "0.78rem" }} disabled={uploading}>
                  Remove
                </button>
              </div>
            )}

            <div style={{ fontSize: "0.78rem", color: "#64748b", lineHeight: 1.6 }}>
              <strong>Expected content:</strong> parser supports varied layouts and works best when each question has 4 clear options.<br />
              <strong>Images:</strong> images in the document are extracted and processed via OCR automatically.
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Exam Name</label>
              <input className={styles.input} value={exam.name} onChange={(e) => updateExamField("name", e.target.value)} placeholder="Exam name" disabled={uploading} />
            </div>
            <div className={styles.formGroup}>
              <label>Exam Type</label>
              <input className={styles.input} value={exam.type} onChange={(e) => updateExamField("type", e.target.value)} placeholder="e.g. JEE, NDA, UPSC" disabled={uploading} />
            </div>
            <div className={styles.formGroup}>
              <label>Batch</label>
              <input className={styles.input} value={exam.batch} onChange={(e) => updateExamField("batch", e.target.value)} placeholder="e.g. 2024" disabled={uploading} />
            </div>
            <div className={styles.formGroup}>
              <label>Duration (minutes)</label>
              <input className={styles.input} type="number" min="1" value={exam.duration} onChange={(e) => updateExamField("duration", e.target.value)} placeholder="60" disabled={uploading} />
            </div>
            <div className={`${styles.formGroup} ${styles.full}`}>
              <label>Scheduled Date & Time</label>
              <input className={styles.input} type="datetime-local" value={exam.scheduled_date} onChange={(e) => updateExamField("scheduled_date", e.target.value)} disabled={uploading}
                min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)} />
            </div>
          </div>

          {message && (
            <div style={{ marginTop: "16px", padding: "10px 14px", borderRadius: "8px", fontWeight: 600, fontSize: "0.88rem",
              backgroundColor: message.startsWith("Error") ? "#fef2f2" : "#f0fdf4",
              color: message.startsWith("Error") ? "#dc2626" : "#16a34a",
              border: `1px solid ${message.startsWith("Error") ? "#fecaca" : "#86efac"}`
            }}>
              {message}
            </div>
          )}

          {errors.length > 0 && (
            <div style={{ marginTop: "10px", padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "0.85rem", color: "#991b1b" }}>
              <strong>Please fix these errors:</strong>
              <ul style={{ margin: "6px 0 0 20px" }}>
                {errors.map((error, i) => <li key={i}>{error}</li>)}
              </ul>
            </div>
          )}

          {warnings.length > 0 && (
            <div style={{ marginTop: "10px", padding: "10px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", fontSize: "0.85rem", color: "#92400e" }}>
              <strong>Warnings:</strong>
              <ul style={{ margin: "6px 0 0 20px" }}>
                {warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}

          <button className={styles.btn} onClick={handleCreateExam} disabled={uploading} style={{ marginTop: "20px", padding: "12px 30px", fontSize: "1rem" }}>
            {uploading ? "Processing..." : "Upload Exam"}
          </button>

          <div style={{ marginTop: "24px", padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.85rem" }}>
            <h4 style={{ marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem" }}>Word File Format Guidelines:</h4>
            <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: 1.8 }}>
              <li>Questions can be numbered like <code>1.</code>, <code>1)</code>, or <code>Q1.</code></li>
              <li>Options should be marked as <code>A)</code>, <code>B)</code>, <code>C)</code>, <code>D)</code></li>
              <li>Correct answers: <code>Answer: X</code>, <code>Ans: X</code>, or in an answer-key block</li>
              <li>Images in Word documents are automatically extracted via OCR</li>
              <li>Each question should have 4 clear options for best parsing</li>
              <li>Example: <code>1. Question text A) Option 1 B) Option 2 C) Option 3 D) Option 4 Answer: A</code></li>
            </ul>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
