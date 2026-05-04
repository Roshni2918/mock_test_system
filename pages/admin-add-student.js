import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import styles from "../styles/Admin.module.css";

export default function AdminAddStudent() {
  const [form, setForm] = useState({
    name: "",
    batch: "",
    exam_type: "",
    year: "",
    mobile: "",
    password: "",
    confirm: "",
  });

  const [rollNo, setRollNo] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [generatedInfo, setGeneratedInfo] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRollNo = async () => {
    if (rollNo || isGenerating) return; // Already generated or generating
    
    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("/api/students/next-roll", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const generatedRoll = data.next_roll_no;
        setRollNo(generatedRoll);
        
        // Generate email immediately
        if (form.name) {
          const firstName = form.name.split(' ')[0].toLowerCase();
          const email = `${firstName}${generatedRoll}@vijeta.com`;
          setGeneratedEmail(email);
        }
      }
    } catch (error) {
      console.error("Error generating roll number:", error);
      alert("Failed to generate roll number. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    const { name, batch, exam_type, year, mobile, password, confirm } = form;
    if (!name || !batch || !exam_type || !password) {
      alert("Please fill all required fields.");
      return;
    }
    
    if (!rollNo) {
      alert("Please click on the Roll No field to generate roll number first.");
      return;
    }
    if (password !== confirm) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const token = localStorage.getItem('token'); // FIXED: Get auth token
      const response = await fetch("/api/students/add", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          student_name: name,
          batch_name: batch,
          exam_type: form.exam_type,
          admission_year: year,
          mobile_no: mobile,
          password_hash: password,
          city: "Ashta",
          state: "MH",
          college_name: "ADCET",
        }),
      });

      const responseText = await response.text();
      let data = {};
      try {
        data = responseText && responseText.trim() ? JSON.parse(responseText) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        const fallbackMessage = !token
          ? "Session expired. Please login again."
          : "Unable to add student.";
        throw new Error(data.message || data.error?.sqlMessage || fallbackMessage);
      }
      // Show the generated roll number and email
      setGeneratedInfo({
        roll_no: data.roll_no,
        email: data.email
      });
      alert(`${data.message}\n\nGenerated Roll No: ${data.roll_no}\nGenerated Email: ${data.email}`);
      setForm({ name: "", batch: "", exam_type: "", year: "", mobile: "", password: "", confirm: "" });
      setRollNo("");
      setGeneratedEmail("");
      
      // FIXED: Refresh the students list
      if (window.reloadStudents) {
        window.reloadStudents();
      }
    } catch (error) {
      alert(error.message || "Error adding student.");
    }
  };

  return (
    <AdminLayout activePage="Add Student">
      <div className={styles.card}>
        <h3>Student Registration</h3>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Student Name"
        />
        <input
          value={form.batch}
          onChange={(e) => setForm({ ...form, batch: e.target.value })}
          placeholder="Batch"
        />
        <select
          value={form.exam_type}
          onChange={(e) => setForm({ ...form, exam_type: e.target.value })}
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
          value={form.year}
          onChange={(e) => setForm({ ...form, year: e.target.value })}
          placeholder="Admission Year"
          type="number"
        />
        <input
          value={form.mobile}
          onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          placeholder="Mobile"
        />
        
        {/* Clickable Roll No Field - Auto generates on click */}
        <div style={{ marginTop: '15px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>
            Roll No (Click field to auto-generate):
          </label>
          <input
            value={rollNo}
            onClick={generateRollNo}
            readOnly
            placeholder="Click here to generate roll number"
            style={{ 
              backgroundColor: rollNo ? '#e8f5e9' : '#fff3cd', 
              color: rollNo ? '#2e7d32' : '#856404',
              fontWeight: 'bold',
              border: rollNo ? '2px solid #4caf50' : '2px solid #ffc107',
              cursor: 'pointer'
            }}
          />
          {isGenerating && <span style={{ fontSize: '12px', color: '#666' }}> Generating...</span>}
        </div>

        {/* Auto-generated Email Display */}
        {generatedEmail && (
          <div style={{ marginTop: '15px' }}>
            <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>
              Auto-Generated Email:
            </label>
            <input
              value={generatedEmail}
              readOnly
              style={{ 
                backgroundColor: '#e3f2fd', 
                color: '#1565c0',
                fontWeight: 'bold',
                border: '2px solid #2196f3'
              }}
            />
          </div>
        )}

        {/* Show Generated Info After Submission */}
        {generatedInfo && (
          <div style={{ 
            marginTop: '10px', 
            padding: '15px', 
            backgroundColor: '#d1ecf1', 
            borderRadius: '4px',
            border: '1px solid #17a2b8'
          }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#0c5460', fontWeight: 'bold' }}>
              Generated Successfully:
            </p>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#666' }}>Roll No: </span>
              <span style={{ fontSize: '13px', color: '#333', fontWeight: 'bold' }}>
                {generatedInfo.roll_no}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '13px', color: '#666' }}>Email: </span>
              <span style={{ fontSize: '13px', color: '#333', fontWeight: 'bold' }}>
                {generatedInfo.email}
              </span>
            </div>
          </div>
        )}
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Password"
        />
        <input
          type="password"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          placeholder="Confirm Password"
        />
        <button className={styles.btn} onClick={handleSubmit}>Add Student</button>
      </div>
    </AdminLayout>
  );
}
