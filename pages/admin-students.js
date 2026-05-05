import React, { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
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
    <AdminLayout activePage="Manage Students">
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label style={{ fontWeight: 'bold' }}>Filter by Exam Type:</label>
        <select 
          value={examFilter} 
          onChange={(e) => setExamFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          <option value="All">All Students</option>
          <option value="JEE">JEE</option>
          <option value="NEET">NEET</option>
          <option value="NDA">NDA</option>
          <option value="UPSC">UPSC</option>
          <option value="Mock Test">Mock Test</option>
          <option value="Practice Test">Practice Test</option>
          <option value="Other">Other</option>
          <option value="Any">Not Specified (Any)</option>
        </select>
        <span style={{ color: '#666', fontSize: '14px' }}>
          Showing {filteredStudents.length} of {students.length} students
        </span>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Batch</th>
            <th>Exam Type</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.batch}</td>
                <td>{student.exam_type || 'Any'}</td>
                <td>
                  <button onClick={() => setEditStudent(student)}>Edit</button>
                  <button onClick={() => deleteStudent(student.id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">
                {examFilter === "All" ? "No students found" : `No students with exam type "${examFilter}"`}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {editStudent && (
        <div className={styles.card} style={{ marginTop: "20px" }}>
          <h3>Edit Student</h3>
          <input
            value={editStudent.name}
            onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })}
            placeholder="Name"
          />
          <input
            value={editStudent.email}
            onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })}
            placeholder="Email"
          />
          <input
            value={editStudent.batch}
            onChange={(e) => setEditStudent({ ...editStudent, batch: e.target.value })}
            placeholder="Batch"
          />
          <input
            value={editStudent.exam_type || ''}
            onChange={(e) => setEditStudent({ ...editStudent, exam_type: e.target.value })}
            placeholder="Exam Type"
          />
          <input
            value={editStudent.mobile_no || ''}
            onChange={(e) => setEditStudent({ ...editStudent, mobile_no: e.target.value })}
            placeholder="Mobile"
          />
          <div className={styles.row}>
            <button className={styles.btn} onClick={updateStudent}>Update</button>
            <button className={styles.btn} onClick={() => setEditStudent(null)}>Cancel</button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
