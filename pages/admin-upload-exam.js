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
    
    if (!exam.name.trim()) {
      errors.push("Exam name is required");
    }
    if (!exam.type.trim()) {
      errors.push("Exam type is required");
    }
    if (!exam.batch.trim()) {
      errors.push("Batch is required");
    }
    if (!exam.duration || exam.duration <= 0) {
      errors.push("Duration must be greater than 0");
    }
    if (!exam.scheduled_date) {
      errors.push("Exam date and time are required");
    }
    if (!file) {
      errors.push("Please select a file to upload");
    }
    
    setErrors(errors);
    return errors.length === 0;
  };

  const handleUpload = async () => {
    if (!validateForm()) {
      return;
    }

    setUploading(true);
    setMessage("Uploading and processing exam...");

    try {
      const token = localStorage.getItem("token");
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("examFile", file);
      formData.append("name", exam.name);
      formData.append("type", exam.type);
      formData.append("batch", exam.batch);
      formData.append("duration", exam.duration);
      formData.append("scheduled_date", exam.scheduled_date);

      const response = await fetch("http://localhost:5000/api/exams/upload-word-exam", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
        body: formData,
      });

      let data;
      let responseText = "";
      try {
        responseText = await response.text();
        
        // Check if responseText exists and is not empty
        if (responseText === null || responseText === undefined || responseText.trim() === '') {
          throw new Error('Empty or null response from server');
        }
        
        // Check if response is JSON
        const trimmedText = responseText.trim();
        if (trimmedText.startsWith('{') || trimmedText.startsWith('[')) {
          data = JSON.parse(trimmedText);
        } else {
          // If not JSON, log response and create error object
          console.error('Non-JSON response:', responseText.substring(0, 200));
          throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`);
        }
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        console.error('Response text:', responseText);
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
          // Format validation errors for display
          const formattedErrors = data.errors.map(error => 
            typeof error === 'string' ? error : error.message || 'Unknown error'
          );
          setErrors(formattedErrors);
        } else {
          setErrors([fallbackMessage]);
        }
        
        if (data && data.validationDetails) {
          // Add validation summary
          const summary = data.validationDetails;
          const summaryMessage = `Validation Summary: ${summary.totalErrors} errors, ${summary.totalWarnings} warnings, ${summary.sectionsFound} sections, ${summary.questionsFound} questions found.`;
          setErrors(prev => [summaryMessage, ...prev]);
        }

        setWarnings(Array.isArray(data?.warnings) ? data.warnings : []);
        setMessage(`❌ ${fallbackMessage}`);
        return;
      }

      // Success
      setMessage(`✅ ${data?.message || 'Upload successful'}`);
      setWarnings(data?.warnings || []);
      
      // Reset form
      setExam({ name: "", type: "", batch: "", duration: "", scheduled_date: "" });
      setFile(null);
      setErrors([]);
      
      // Refresh exam list in admin dashboard
      if (window.reloadExams) {
        window.reloadExams();
      }

    } catch (error) {
      console.error("Upload error:", error);
      setMessage(`❌ ${error.message}`);
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
        <div className={styles.card} style={{ paddingBottom: "40px" }}>
          <h3>📄 Upload Exam from Word File</h3>
          
          {/* File Upload Section */}
          <div style={{ marginBottom: "30px", padding: "20px", border: "2px dashed #ddd", borderRadius: "8px" }}>
            <h4 style={{ marginBottom: "15px", color: "#007bff" }}>📁 Select Word File</h4>
            
            <input
              type="file"
              onChange={handleFileChange}
              style={{ 
                marginBottom: "15px", 
                padding: "10px", 
                width: "100%", 
                border: "1px solid #ddd", 
                borderRadius: "4px" 
              }}
              disabled={uploading}
            />
            
            {file && (
              <div style={{ 
                padding: "10px", 
                backgroundColor: "#e8f5e8", 
                borderRadius: "4px", 
                marginBottom: "10px" 
              }}>
                <strong>📄 Selected File:</strong> {file.name}
                <br />
                <small>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</small>
                <button
                  onClick={removeFile}
                  style={{ 
                    marginLeft: "10px", 
                    padding: "2px 8px", 
                    backgroundColor: "#dc3545", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "3px", 
                    cursor: "pointer" 
                  }}
                  disabled={uploading}
                >
                  Remove
                </button>
              </div>
            )}
            
            <div style={{ fontSize: "12px", color: "#666" }}>
              <strong>Upload behavior:</strong> no fixed format/size restriction at upload stage<br />
              <strong>Question format:</strong> parser supports varied layouts and works best with 4 clear options per question<br />
              <strong>Answer format:</strong> answer key or inline answers are recommended for accurate scoring<br />
              <strong>Schedule:</strong> choose full date-time (display follows your locale)
            </div>
          </div>

          {/* Exam Details Section */}
          <div className={styles.formGrid}>
            <input
              value={exam.name}
              onChange={(e) => updateExamField("name", e.target.value)}
              placeholder="Exam Name"
              disabled={uploading}
            />
            <select
              value={exam.type}
              onChange={(e) => updateExamField("type", e.target.value)}
              disabled={uploading}
              required
            >
              <option value="">Select Exam Type</option>
              <option value="JEE">JEE</option>
              <option value="NEET">NEET</option>
              <option value="NDA">NDA</option>
              <option value="UPSC">UPSC</option>
              <option value="Mock Test">Mock Test</option>
              <option value="Practice Test">Practice Test</option>
              <option value="Other">Other</option>
            </select>
            <input
              value={exam.batch}
              onChange={(e) => updateExamField("batch", e.target.value)}
              placeholder="Batch (e.g., 2024, 2025)"
              disabled={uploading}
            />
            <input
              type="number"
              min="1"
              value={exam.duration}
              onChange={(e) => updateExamField("duration", e.target.value)}
              placeholder="Duration (minutes)"
              disabled={uploading}
            />
            <input
              type="datetime-local"
              value={exam.scheduled_date}
              onChange={(e) => updateExamField("scheduled_date", e.target.value)}
              disabled={uploading}
              min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
            />
          </div>

          {/* Messages Section */}
          {message && (
            <div style={{ 
              padding: "10px", 
              margin: "10px 0", 
              borderRadius: "4px",
              backgroundColor: message.includes("✅") ? "#d4edda" : "#f8d7da",
              color: message.includes("✅") ? "#155724" : "#721c24"
            }}>
              {message}
            </div>
          )}

          {/* Errors Section */}
          {errors.length > 0 && (
            <div style={{ 
              padding: "10px", 
              margin: "10px 0", 
              backgroundColor: "#f8d7da", 
              borderRadius: "4px",
              color: "#721c24" 
            }}>
              <strong>❌ Please fix these errors:</strong>
              <ul style={{ margin: "5px 0 0 20px" }}>
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings Section */}
          {warnings.length > 0 && (
            <div style={{ 
              padding: "10px", 
              margin: "10px 0", 
              backgroundColor: "#fff3cd", 
              borderRadius: "4px",
              color: "#856404" 
            }}>
              <strong>⚠️ Warnings:</strong>
              <ul style={{ margin: "5px 0 0 20px" }}>
                {warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Upload Button */}
          <button 
            className={styles.btn} 
            onClick={handleUpload}
            disabled={uploading}
            style={{ 
              marginTop: "20px", 
              padding: "12px 30px", 
              fontSize: "16px",
              backgroundColor: uploading ? "#6c757d" : "#007bff"
            }}
          >
            {uploading ? "⏳ Processing..." : "📤 Upload Exam"}
          </button>

          {/* Help Section */}
          <div style={{ 
            marginTop: "30px", 
            padding: "15px", 
            backgroundColor: "#f8f9fa", 
            borderRadius: "4px",
            fontSize: "14px" 
          }}>
            <h4 style={{ marginBottom: "10px" }}>📋 File Format Guidelines:</h4>
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
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
