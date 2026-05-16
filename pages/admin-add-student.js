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
    if (rollNo || isGenerating) return;

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
      const token = localStorage.getItem('token');
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
      setGeneratedInfo({
        roll_no: data.roll_no,
        email: data.email
      });
      alert(`${data.message}\n\nGenerated Roll No: ${data.roll_no}\nGenerated Email: ${data.email}`);
      setForm({ name: "", batch: "", exam_type: "", year: "", mobile: "", password: "", confirm: "" });
      setRollNo("");
      setGeneratedEmail("");

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
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Student Name</label>
            <input className={styles.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
          </div>
          <div className={styles.formGroup}>
            <label>Batch</label>
            <input className={styles.input} value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} placeholder="e.g. 2024" />
          </div>
          <div className={styles.formGroup}>
            <label>Exam Type</label>
            <select className={styles.select} value={form.exam_type} onChange={(e) => setForm({ ...form, exam_type: e.target.value })} required>
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
            <label>Admission Year</label>
            <input className={styles.input} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="e.g. 2024" type="number" />
          </div>
          <div className={styles.formGroup}>
            <label>Mobile</label>
            <input className={styles.input} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="Mobile number" />
          </div>
          <div className={styles.formGroup}>
            <label>Roll No (click to auto-generate)</label>
            <input className={styles.input} value={rollNo} onClick={generateRollNo} readOnly placeholder="Click here to generate"
              style={{ backgroundColor: rollNo ? '#f0fdf4' : '#fffbeb', color: rollNo ? '#16a34a' : '#b45309', fontWeight: 700, cursor: 'pointer', borderColor: rollNo ? '#86efac' : '#fde68a' }}
            />
            {isGenerating && <span style={{ fontSize: '0.78rem', color: '#64748b' }}> Generating...</span>}
          </div>
          <div className={styles.formGroup}>
            <label>Auto-Generated Email</label>
            <input className={styles.input} value={generatedEmail || ''} readOnly placeholder="Will generate after roll no"
              style={{ backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: 700, borderColor: '#93c5fd' }}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Password</label>
            <input className={styles.input} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Set password" />
          </div>
          <div className={styles.formGroup}>
            <label>Confirm Password</label>
            <input className={styles.input} type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Confirm password" />
          </div>
        </div>

        {generatedInfo && (
          <div style={{ marginTop: "16px", padding: "14px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", fontSize: "0.88rem" }}>
            <p style={{ fontWeight: 700, color: "#16a34a", marginBottom: "6px" }}>Generated Successfully:</p>
            <p><strong>Roll No:</strong> {generatedInfo.roll_no}</p>
            <p><strong>Email:</strong> {generatedInfo.email}</p>
          </div>
        )}

        <button className={styles.btn} onClick={handleSubmit} style={{ marginTop: "20px" }}>Add Student</button>
      </div>
    </AdminLayout>
  );
}
