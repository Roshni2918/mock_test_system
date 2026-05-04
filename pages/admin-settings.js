import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import styles from "../styles/Admin.module.css";

export default function AdminSettings() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingExamId, setEditingExamId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    type: "",
    batch: "",
    duration: "",
    scheduled_time: ""
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/admin/exams", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setExams(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseResponseSafely = async (response) => {
    const responseText = await response.text();
    if (!responseText || !responseText.trim()) {
      throw new Error("Empty response from server");
    }
    const trimmed = responseText.trim();
    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
      throw new Error("Server returned non-JSON response. Please make sure backend is running on port 5000 and restarted.");
    }
    return JSON.parse(trimmed);
  };

  const toDateTimeLocalValue = (dateValue) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const startEdit = (exam) => {
    setMessage("");
    setEditingExamId(exam.id);
    setEditForm({
      name: exam.name || "",
      type: exam.type || "",
      batch: exam.batch || "",
      duration: exam.duration || "",
      scheduled_time: toDateTimeLocalValue(exam.scheduled_time)
    });
  };

  const cancelEdit = () => {
    setEditingExamId(null);
    setEditForm({
      name: "",
      type: "",
      batch: "",
      duration: "",
      scheduled_time: ""
    });
    setMessage("");
  };

  const saveEdit = async (examId) => {
    if (!editForm.name || !editForm.type || !editForm.batch || !editForm.duration || !editForm.scheduled_time) {
      setMessage("Please fill all fields before saving.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/admin/exams/${examId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editForm.name,
          type: editForm.type,
          batch: editForm.batch,
          duration: Number(editForm.duration),
          scheduled_time: editForm.scheduled_time
        })
      });

      const data = await parseResponseSafely(response);
      if (!response.ok) {
        setMessage(data.message || "Failed to update exam.");
        return;
      }

      await fetchExams();
      setEditingExamId(null);
      setMessage("Exam updated successfully.");
    } catch (error) {
      console.error("Error updating exam:", error);
      setMessage(error.message || "Failed to update exam.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout activePage="Exam Settings"><div>Loading...</div></AdminLayout>;

  return (
    <AdminLayout activePage="Exam Settings">
      <div className={styles.card}>
        <h3>Exam Settings</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Exam Name</th>
              <th>Type</th>
              <th>Batch</th>
              <th>Duration</th>
              <th>Scheduled Time</th>
              <th>Questions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(exams) && exams.map(exam => (
              <tr key={exam.id}>
                <td>
                  {editingExamId === exam.id ? (
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  ) : exam.name}
                </td>
                <td>
                  {editingExamId === exam.id ? (
                    <select
                      value={editForm.type}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    >
                      <option value="JEE">JEE</option>
                      <option value="NEET">NEET</option>
                    </select>
                  ) : exam.type}
                </td>
                <td>
                  {editingExamId === exam.id ? (
                    <input
                      value={editForm.batch}
                      onChange={(e) => setEditForm({ ...editForm, batch: e.target.value })}
                    />
                  ) : exam.batch}
                </td>
                <td>
                  {editingExamId === exam.id ? (
                    <input
                      type="number"
                      min="1"
                      value={editForm.duration}
                      onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                    />
                  ) : `${exam.duration} min`}
                </td>
                <td>
                  {editingExamId === exam.id ? (
                    <input
                      type="datetime-local"
                      value={editForm.scheduled_time}
                      onChange={(e) => setEditForm({ ...editForm, scheduled_time: e.target.value })}
                    />
                  ) : new Date(exam.scheduled_time).toLocaleString()}
                </td>
                <td>{exam.total_questions}</td>
                <td>
                  {editingExamId === exam.id ? (
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button className={styles.commonBtn} onClick={() => saveEdit(exam.id)} disabled={saving}>
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button className={styles.commonBtn} onClick={cancelEdit} disabled={saving}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button className={styles.commonBtn} onClick={() => startEdit(exam)}>
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {message && <p style={{ marginTop: "10px", color: message.includes("successfully") ? "green" : "red" }}>{message}</p>}
        {(!Array.isArray(exams) || exams.length === 0) && <p>No exams created yet.</p>}
      </div>
    </AdminLayout>
  );
}
