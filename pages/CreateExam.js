import React, { useState } from "react";
import styles from "../styles/Admin.module.css";

export default function CreateExam() {
  const [examName, setExamName] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [questions, setQuestions] = useState("");
  const [examType, setExamType] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async () => {
    if (!examName || !hour || !minute || !questions || !examType) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const duration = parseInt(hour) * 60 + parseInt(minute);
      const token = localStorage.getItem('token');
      
      // Fixed: Send correct field names matching backend API
      const response = await fetch("/api/exams/add", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: examName,
          type: examType,
          batch: "2024", // Default batch, can be made dynamic
          duration: duration,
          scheduled_time: new Date().toISOString()
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create exam");
      }

      setFeedback("Exam created successfully! ID: " + data.exam_id);
      setExamName("");
      setHour("");
      setMinute("");
      setQuestions("");
      setExamType("");
      
      // Refresh exam list after creation
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(err.message || "Error creating exam");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Create Exam</h2>
      </div>

      <div className={styles.card} style={{ maxWidth: "600px", margin: "20px auto" }}>
        <h3>Exam Details</h3>

        <input
          type="text"
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
          placeholder="Exam Name"
          className={styles.input}
        />

        <div className={styles.row} style={{ gap: "10px" }}>
          <input
            type="number"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            placeholder="Hour"
            className={styles.input}
            min="0"
          />
          <input
            type="number"
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            placeholder="Minutes"
            className={styles.input}
            min="0"
            max="59"
          />
        </div>

        <input
          type="number"
          value={questions}
          onChange={(e) => setQuestions(e.target.value)}
          placeholder="Total Questions"
          className={styles.input}
          min="1"
        />

        <select
          value={examType}
          onChange={(e) => setExamType(e.target.value)}
          className={styles.input}
        >
          <option value="">Select Exam Type</option>
          <option value="NDA">NDA</option>
          <option value="NEET">NEET</option>
          <option value="JEE">JEE</option>
        </select>

        <button className={styles.btn} onClick={handleSubmit}>
          Create Exam
        </button>

        {feedback && <p style={{ marginTop: "15px", color: "green" }}>{feedback}</p>}
      </div>
    </div>
  );
}



























