import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import styles from "../styles/Admin.module.css";

export default function AdminUploadExam() {
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
    const errors = [];
    if (!exam.name.trim()) errors.push("Exam name is required");
    if (!exam.type.trim()) errors.push("Exam type is required");
    if (!exam.batch.trim()) errors.push("Batch is required");
    if (!exam.duration || exam.duration <= 0) errors.push("Duration must be greater than 0");
    if (!exam.scheduled_date) errors.push("Exam date and time are required");
    if (!file) errors.push("Please select a file to upload");
    setErrors(errors);
    return errors.length === 0;
  };

  const handleUpload = async () => {
    if (!validateForm()) return;

    setUploading(true);
    setMessage("Uploading and processing exam...");

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
          throw new Error('Empty or null response from server');
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
        const looksLikeHtml = responseText && responseText.trim().startsWith('<!DOCTYPE');
        if (looksLikeHtml) {
          throw new Error('Server returned HTML instead of JSON. Please make sure backend API is running on port 5000.');
        }
        throw new Error('Invalid server response. Please check backend logs.');
      }

      if (!response.ok) {
        console.error('Backend error response:', { status: response.status, data });
        const fallbackMessage = data?.message || data?.error || `Upload failed with status ${response.status}`;

        if (data && data.errors && Array.isArray(data.errors)) {
          const formattedErrors = data.errors.map(error =>
            typeof error === 'string' ? error : error.message || 'Unknown error'
          );
          setErrors(formattedErrors);
        } else {
          setErrors([fallbackMessage]);
        }

        if (data && data.validationDetails) {
          const summary = data.validationDetails;
          setErrors(prev => [`Validation: ${summary.totalErrors} errors, ${summary.totalWarnings} warnings, ${summary.sectionsFound} sections, ${summary.questionsFound} questions found.`, ...prev]);
        }

        setWarnings(Array.isArray(data?.warnings) ? data.warnings : []);
        setMessage(`Upload failed: ${fallbackMessage}`);
        return;
      }

      setMessage(`Upload successful: ${data?.message || 'Exam created'}`);
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
          <h3>Upload Exam from Word File</h3>

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
              <strong>Upload behavior:</strong> no fixed format/size restriction at upload stage.<br />
              <strong>Question format:</strong> parser supports varied layouts and works best with 4 clear options per question.<br />
              <strong>Answer format:</strong> answer key or inline answers are recommended for accurate scoring.<br />
              <strong>Schedule:</strong> choose full date-time (display follows your locale).
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Exam Name</label>
              <input className={styles.input} value={exam.name} onChange={(e) => updateExamField("name", e.target.value)} placeholder="Exam name" disabled={uploading} />
            </div>
            <div className={styles.formGroup}>
              <label>Exam Type</label>
              <select className={styles.select} value={exam.type} onChange={(e) => updateExamField("type", e.target.value)} disabled={uploading} required>
                <option value="">Select Exam Type</option>
                <option value="JEE">JEE</option>
                <option value="NEET">NEET</option>
                <option value="NDA">NDA</option>
                <option value="UPSC">UPSC</option>
                <option value="Mock Test">Mock Test</option>
                <option value="Practice Test">Practice Test</option>
                <option value="Other">Other</option>
              </select>
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
              backgroundColor: message.includes("successful") ? "#f0fdf4" : "#fef2f2",
              color: message.includes("successful") ? "#16a34a" : "#dc2626",
              border: `1px solid ${message.includes("successful") ? "#86efac" : "#fecaca"}`
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

          <button className={styles.btn} onClick={handleUpload} disabled={uploading} style={{ marginTop: "20px", padding: "12px 30px", fontSize: "1rem" }}>
            {uploading ? "Processing..." : "Upload Exam"}
          </button>

          <div style={{ marginTop: "24px", padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.85rem" }}>
            <h4 style={{ marginBottom: "8px", fontWeight: 600, fontSize: "0.9rem" }}>File Format Guidelines:</h4>
            <ul style={{ margin: 0, paddingLeft: "20px", lineHeight: 1.8 }}>
              <li>File upload is not blocked by strict format or size gates in the UI</li>
              <li>Questions can be numbered like <code>1.</code>, <code>1)</code>, <code>Q1.</code> or similar</li>
              <li>Options should still be clear as <code>A)</code>, <code>B)</code>, <code>C)</code>, <code>D)</code></li>
              <li>Answers can be provided inline like <code>Answer: A</code> or in an answer-key block</li>
              <li>If answers are missing, upload can still succeed but scoring may be incomplete</li>
            </ul>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
