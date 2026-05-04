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
    
    if (!exam.name.trim()) {
      newErrors.push("Exam name is required");
    }
    if (!exam.type.trim()) {
      newErrors.push("Exam type is required");
    }
    if (!exam.batch.trim()) {
      newErrors.push("Batch is required");
    }
    if (!exam.duration || exam.duration <= 0) {
      newErrors.push("Duration must be greater than 0");
    }
    if (!file) {
      newErrors.push("Please select a file to upload");
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleCreateExam = async () => {
    if (!validateForm()) {
      return;
    }

    setUploading(true);
    setMessage("Processing Word file...");

    try {
      const token = localStorage.getItem("token");
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("examFile", file);
      formData.append("name", exam.name);
      formData.append("type", exam.type);
      formData.append("batch", exam.batch);
      formData.append("duration", exam.duration);

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
        throw new Error('Invalid server response. Please check backend logs.');
      }
      
      if (!response.ok) {
        if (data && data.errors) {
          setErrors(data.errors);
        }
        throw new Error((data && data.message) || "Upload failed");
      }

      // Success
      setMessage(`✅ ${data?.message || 'Upload successful'}`);
      setWarnings(data?.warnings || []);
      
      // Reset form
      setExam({ name: "", type: "", batch: "", duration: "" });
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
      <AdminLayout activePage="Create Exam (Word)">
        <div className={styles.card} style={{ paddingBottom: "40px" }}>
          <h3>📄 Create Exam from Word File</h3>
          
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
              <strong>Expected content:</strong> parser supports varied layouts and works best when each question has 4 clear options
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
            <input
              value={exam.type}
              onChange={(e) => updateExamField("type", e.target.value)}
              placeholder="Exam Type (e.g., JEE, NDA, UPSC)"
              disabled={uploading}
            />
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

          {/* Create Button */}
          <button 
            className={styles.btn} 
            onClick={handleCreateExam}
            disabled={uploading}
            style={{ 
              marginTop: "20px", 
              padding: "12px 30px", 
              fontSize: "16px",
              backgroundColor: uploading ? "#6c757d" : "#007bff"
            }}
          >
            {uploading ? "⏳ Processing..." : "📤 Create Exam"}
          </button>

          {/* Help Section */}
          <div style={{ 
            marginTop: "30px", 
            padding: "15px", 
            backgroundColor: "#f8f9fa", 
            borderRadius: "4px",
            fontSize: "14px" 
          }}>
            <h4 style={{ marginBottom: "10px" }}>📋 Word File Format Guidelines:</h4>
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              <li>File upload is not blocked by strict format or size gates in the UI</li>
              <li>Questions can be numbered in common styles like <code>1.</code>, <code>1)</code>, or <code>Q1.</code></li>
              <li>Options should be marked as <code>A)</code>, <code>B)</code>, <code>C)</code>, <code>D)</code></li>
              <li>Correct answers work best when written as <code>Answer: X</code>, <code>Ans: X</code>, or in an answer-key block</li>
              <li>Images in Word documents will be automatically extracted</li>
              <li>Each question should have 4 clear options for best parsing</li>
              <li>Example format: <code>1. Question text A) Option 1 B) Option 2 C) Option 3 D) Option 4 Answer: A</code></li>
            </ul>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
