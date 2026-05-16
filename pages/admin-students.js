import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import styles from "../styles/Admin.module.css";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [editStudent, setEditStudent] = useState(null);
  const [examFilter, setExamFilter] = useState("All");

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (examFilter === "All") {
      setFilteredStudents(students);
    } else {
      setFilteredStudents(students.filter(s => s.exam_type === examFilter || (!s.exam_type && examFilter === "Any")));
    }
  }, [examFilter, students]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/students", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const responseText = await res.text();
      const data = responseText && responseText.trim() ? JSON.parse(responseText) : [];
      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch students");
      }
      setStudents(data);
    } catch (error) {
      console.error(error);
      alert(error.message || "Error fetching students.");
    }
  };

  const deleteStudent = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/students/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const responseText = await res.text();
      const data = responseText && responseText.trim() ? JSON.parse(responseText) : {};
      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete student");
      }
      alert(data.message);
      fetchStudents();
    } catch (error) {
      console.error(error);
      alert(error.message || "Error deleting student.");
    }
  };

  const updateStudent = async () => {
    if (!editStudent) return;
    const { name, batch, exam_type, mobile_no, email, id } = editStudent;
    if (!name || !batch || !email) {
      alert("All fields required.");
      return;
    }

    const payload = {
      student_name: name,
      batch_name: batch,
      exam_type,
      mobile_no,
      email,
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/students/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      const responseText = await res.text();
      const data = responseText && responseText.trim() ? JSON.parse(responseText) : {};
      if (!res.ok) {
        throw new Error(data?.message || "Failed to update student");
      }
      alert(data.message);
      setEditStudent(null);
      fetchStudents();
    } catch (error) {
      console.error(error);
      alert(error.message || "Error updating student.");
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout activePage="Manage Students">
        <div className={styles.card} style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <label style={{ fontWeight: 600, fontSize: "0.88rem", color: "#475569" }}>Filter by Exam Type:</label>
          <select className={styles.select} value={examFilter} onChange={(e) => setExamFilter(e.target.value)} style={{ width: "auto", minWidth: "160px" }}>
            <option value="All">All Students</option>
            <option value="JEE">JEE</option>
            <option value="NEET">NEET</option>
            <option value="NDA">NDA</option>
            <option value="UPSC">UPSC</option>
            <option value="Mock Test">Mock Test</option>
            <option value="Practice Test">Practice Test</option>
            <option value="Other">Other</option>
            <option value="Any">Not Specified</option>
          </select>
          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Showing {filteredStudents.length} of {students.length} students
          </span>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Batch</th>
                <th>Exam Type</th>
                <th>Mobile</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td><strong>{student.name}</strong></td>
                    <td>{student.email}</td>
                    <td>{student.batch || '—'}</td>
                    <td>{student.exam_type ? <span className={`${styles.badge} ${styles.badgeInfo}`}>{student.exam_type}</span> : '—'}</td>
                    <td>{student.mobile_no || '—'}</td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button className={styles.btnSecondary} style={{ padding: "4px 12px", fontSize: "0.82rem" }} onClick={() => setEditStudent(student)}>Edit</button>
                        <button className={styles.btnDanger} style={{ padding: "4px 12px", fontSize: "0.82rem" }} onClick={() => deleteStudent(student.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", color: "#94a3b8" }}>
                    {examFilter === "All" ? "No students found" : `No students with exam type "${examFilter}"`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {editStudent && (
          <div className={styles.card} style={{ marginTop: "20px" }}>
            <h3>Edit Student</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Name</label>
                <input className={styles.input} value={editStudent.name} onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })} placeholder="Name" />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input className={styles.input} value={editStudent.email} onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })} placeholder="Email" />
              </div>
              <div className={styles.formGroup}>
                <label>Batch</label>
                <input className={styles.input} value={editStudent.batch} onChange={(e) => setEditStudent({ ...editStudent, batch: e.target.value })} placeholder="Batch" />
              </div>
              <div className={styles.formGroup}>
                <label>Exam Type</label>
                <input className={styles.input} value={editStudent.exam_type || ''} onChange={(e) => setEditStudent({ ...editStudent, exam_type: e.target.value })} placeholder="Exam Type" />
              </div>
              <div className={styles.formGroup}>
                <label>Mobile</label>
                <input className={styles.input} value={editStudent.mobile_no || ''} onChange={(e) => setEditStudent({ ...editStudent, mobile_no: e.target.value })} placeholder="Mobile" />
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button className={styles.btn} onClick={updateStudent}>Update</button>
              <button className={styles.btnSecondary} onClick={() => setEditStudent(null)}>Cancel</button>
            </div>
          </div>
        )}
      </AdminLayout>
    </ProtectedRoute>
  );
}
