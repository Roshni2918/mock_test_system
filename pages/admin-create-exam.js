import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import styles from "../styles/Admin.module.css";

const initialQuestion = () => ({
  question_text: "",
  section: "",
  options: ["", "", "", ""],
  correctOption: 0,
});

export default function AdminCreateExam() {
  const [exam, setExam] = useState({
    name: "",
    type: "",
    batch: "",
    duration: "",
    scheduled_time: "",
  });
  const [questions, setQuestions] = useState(Array.from({ length: 5 }, initialQuestion));
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const updateExamField = (field, value) => {
    setExam((prev) => ({ ...prev, [field]: value }));
  };

  const updateQuestionField = (index, field, value) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const updateOptionField = (questionIndex, optionIndex, value) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[questionIndex] = {
        ...next[questionIndex],
        options: next[questionIndex].options.map((option, i) => (i === optionIndex ? value : option)),
      };
      return next;
    });
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, initialQuestion()]);
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!exam.name || !exam.type || !exam.batch || !exam.duration || !exam.scheduled_time) {
      alert("Please fill all exam fields.");
      return false;
    }

    if (questions.length === 0) {
      alert("Please add at least one question.");
      return false;
    }

    for (const [index, question] of questions.entries()) {
      if (!question.question_text.trim()) {
        alert(`Question ${index + 1} text is required.`);
        return false;
      }
      const filledOptions = question.options.filter((opt) => opt.trim());
      if (filledOptions.length !== 4) {
        alert(`Question ${index + 1} requires exactly 4 options.`);
        return false;
      }
    }

    return true;
  };

  const handleCreateExam = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/create-exam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...exam, questions }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Could not create exam.");
      }

      setMessage("Exam created successfully.");
      setExam({ name: "", type: "", batch: "", duration: "", scheduled_time: "" });
      setQuestions(Array.from({ length: 5 }, initialQuestion));

      if (window.reloadExams) {
        window.reloadExams();
      }
    } catch (error) {
      alert(error.message || "Error creating exam.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout activePage="Create Exam">
        <div className={styles.card}>
          <h3>Create Exam</h3>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Exam Name</label>
              <input className={styles.input} value={exam.name} onChange={(e) => updateExamField("name", e.target.value)} placeholder="Enter exam name" />
            </div>
            <div className={styles.formGroup}>
              <label>Exam Type</label>
              <select className={styles.select} value={exam.type} onChange={(e) => updateExamField("type", e.target.value)} required>
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
              <input className={styles.input} value={exam.batch} onChange={(e) => updateExamField("batch", e.target.value)} placeholder="e.g. JEE 2024" />
            </div>
            <div className={styles.formGroup}>
              <label>Duration (minutes)</label>
              <input className={styles.input} type="number" min="1" value={exam.duration} onChange={(e) => updateExamField("duration", e.target.value)} placeholder="60" />
            </div>
            <div className={`${styles.formGroup} ${styles.full}`}>
              <label>Scheduled Time</label>
              <input className={styles.input} type="datetime-local" value={exam.scheduled_time} onChange={(e) => updateExamField("scheduled_time", e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: "30px" }}>
            <h3 style={{ fontSize: "1.05rem", marginBottom: "16px" }}>Questions</h3>
            {questions.map((question, qi) => (
              <div key={qi} className={styles.questionBlock}>
                <div className={styles.questionHeader}>
                  <span className={styles.questionNumber}>Question {qi + 1}</span>
                  <button type="button" className={styles.btnDanger} onClick={() => removeQuestion(qi)} style={{ padding: "4px 12px", fontSize: "0.82rem" }}>
                    Remove
                  </button>
                </div>

                <div className={styles.formGroup} style={{ marginBottom: "12px" }}>
                  <label>Question Text</label>
                  <textarea className={styles.textarea} value={question.question_text} onChange={(e) => updateQuestionField(qi, "question_text", e.target.value)} placeholder="Enter the question" rows={2} />
                </div>

                <div className={styles.formGroup} style={{ marginBottom: "12px" }}>
                  <label>Section (optional)</label>
                  <input className={styles.input} value={question.section} onChange={(e) => updateQuestionField(qi, "section", e.target.value)} placeholder="e.g. Physics, Mathematics" />
                </div>

                {question.options.map((option, oi) => (
                  <div key={oi} className={styles.optionRow}>
                    <div className={styles.optionLetter}>{String.fromCharCode(65 + oi)}</div>
                    <input className={styles.input} value={option} onChange={(e) => updateOptionField(qi, oi, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + oi)}`} style={{ flex: 1 }} />
                    <label className={styles.radioLabel}>
                      <input type="radio" name={`correct-${qi}`} checked={question.correctOption === oi} onChange={() => updateQuestionField(qi, "correctOption", oi)} />
                      Correct
                    </label>
                  </div>
                ))}
              </div>
            ))}

            <button type="button" onClick={addQuestion} className={styles.btnSecondary} style={{ marginBottom: "20px" }}>
              + Add Question
            </button>
          </div>

          <button className={styles.btn} onClick={handleCreateExam} disabled={loading}>
            {loading ? "Creating Exam..." : "Create Exam"}
          </button>

          {message && <p className={styles.success} style={{ marginTop: "16px" }}>{message}</p>}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
