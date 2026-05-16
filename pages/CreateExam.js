import React, { useState } from "react";

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

      const response = await fetch("/api/admin/create-exam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: examName,
          type: examType,
          duration,
          total_questions: parseInt(questions),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setFeedback("Exam created successfully!");
      setExamName("");
      setHour("");
      setMinute("");
      setQuestions("");
      setExamType("");
    } catch (error) {
      alert(error.message || "Error creating exam");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>Create Exam</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <input type="text" value={examName} onChange={(e) => setExamName(e.target.value)}
          placeholder="Exam Name"
          style={{ padding: "10px", border: "1.5px solid #e2e8f0", borderRadius: "8px" }} />

        <div style={{ display: "flex", gap: "10px" }}>
          <input type="number" value={hour} onChange={(e) => setHour(e.target.value)}
            placeholder="Hours" min="0"
            style={{ flex: 1, padding: "10px", border: "1.5px solid #e2e8f0", borderRadius: "8px" }} />
          <input type="number" value={minute} onChange={(e) => setMinute(e.target.value)}
            placeholder="Minutes" min="0" max="59"
            style={{ flex: 1, padding: "10px", border: "1.5px solid #e2e8f0", borderRadius: "8px" }} />
        </div>

        <input type="number" value={questions} onChange={(e) => setQuestions(e.target.value)}
          placeholder="Total Questions" min="1"
          style={{ padding: "10px", border: "1.5px solid #e2e8f0", borderRadius: "8px" }} />

        <select value={examType} onChange={(e) => setExamType(e.target.value)}
          style={{ padding: "10px", border: "1.5px solid #e2e8f0", borderRadius: "8px" }}>
          <option value="">Select Exam Type</option>
          <option value="NDA">NDA</option>
          <option value="NEET">NEET</option>
          <option value="JEE">JEE</option>
        </select>

        <button onClick={handleSubmit}
          style={{ padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>
          Create Exam
        </button>

        {feedback && <p style={{ color: "#16a34a", fontWeight: 600 }}>{feedback}</p>}
      </div>
    </div>
  );
}
