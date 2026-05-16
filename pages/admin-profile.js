import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import styles from "../styles/Admin.module.css";

const initialAdmin = {
  name: "Mahesh Kulkarni",
  email: "admin@vijeetafoundation.com",
  mobile: "9876543210",
};

export default function AdminProfile() {
  const [profile, setProfile] = useState(initialAdmin);
  const [viewMode, setViewMode] = useState("view");
  const [passwordData, setPasswordData] = useState({ oldPass: "", newPass: "", confirmPass: "" });

  const handleSave = () => {
    if (!profile.name || !profile.email || !profile.mobile) {
      alert("Please fill all fields.");
      return;
    }
    alert("Profile Updated Successfully!");
    setViewMode("view");
  };

  const handlePasswordChange = () => {
    const { oldPass, newPass, confirmPass } = passwordData;
    if (!oldPass || !newPass || !confirmPass) {
      alert("Please fill all fields.");
      return;
    }
    if (newPass !== confirmPass) {
      alert("Password does not match.");
      return;
    }
    alert("Password Changed Successfully!");
    setPasswordData({ oldPass: "", newPass: "", confirmPass: "" });
    setViewMode("view");
  };

  return (
    <ProtectedRoute requiredRole="admin">
    <AdminLayout activePage="Profile">
      {viewMode === "view" && (
        <div>
          <div className={styles.card} style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3>{profile.name}</h3>
                <p style={{ color: "#64748b", fontSize: "0.88rem" }}>Vijeta Foundation</p>
              </div>
              <div style={{
                width: "56px", height: "56px", borderRadius: "50%",
                background: "#eff6ff", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "1.3rem", fontWeight: 700,
                color: "#2563eb"
              }}>
                {profile.name.split(" ").map(n => n[0]).join("")}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div className={styles.card}>
              <h3>Personal Details</h3>
              <div style={{ lineHeight: 2, fontSize: "0.9rem" }}>
                <p><strong>Name:</strong> {profile.name}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Mobile:</strong> {profile.mobile}</p>
              </div>
            </div>
            <div className={styles.card}>
              <h3>Academy Details</h3>
              <div style={{ lineHeight: 2, fontSize: "0.9rem" }}>
                <p><strong>Academy:</strong> Vijeeta Foundation</p>
                <p><strong>Branch:</strong> Main Branch</p>
                <p><strong>Address:</strong> Ashta</p>
              </div>
            </div>
          </div>

          <div className={styles.card} style={{ marginBottom: "20px" }}>
            <h3>Security</h3>
            <div style={{ lineHeight: 2, fontSize: "0.9rem" }}>
              <p><strong>Last Login:</strong> 25 July 2026</p>
              <p><strong>Status:</strong> <span className={`${styles.badge} ${styles.badgeSuccess}`}>Active</span></p>
              <p><strong>Password Changed:</strong> 20 July 2026</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className={styles.btn} onClick={() => setViewMode("edit")}>Edit Profile</button>
            <button className={styles.btnSecondary} onClick={() => setViewMode("password")}>Change Password</button>
          </div>
        </div>
      )}

      {viewMode === "edit" && (
        <div className={styles.card}>
          <h3>Edit Profile</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Name</label>
              <input className={styles.input} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Name" />
            </div>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input className={styles.input} value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="Email" />
            </div>
            <div className={styles.formGroup}>
              <label>Mobile</label>
              <input className={styles.input} value={profile.mobile} onChange={(e) => setProfile({ ...profile, mobile: e.target.value })} placeholder="Mobile" />
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button className={styles.btn} onClick={handleSave}>Update</button>
            <button className={styles.btnSecondary} onClick={() => setViewMode("view")}>Back</button>
          </div>
        </div>
      )}

      {viewMode === "password" && (
        <div className={styles.card}>
          <h3>Change Password</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Old Password</label>
              <input className={styles.input} type="password" value={passwordData.oldPass} onChange={(e) => setPasswordData({ ...passwordData, oldPass: e.target.value })} placeholder="Old password" />
            </div>
            <div className={styles.formGroup}>
              <label>New Password</label>
              <input className={styles.input} type="password" value={passwordData.newPass} onChange={(e) => setPasswordData({ ...passwordData, newPass: e.target.value })} placeholder="New password" />
            </div>
            <div className={styles.formGroup}>
              <label>Confirm Password</label>
              <input className={styles.input} type="password" value={passwordData.confirmPass} onChange={(e) => setPasswordData({ ...passwordData, confirmPass: e.target.value })} placeholder="Confirm password" />
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button className={styles.btn} onClick={handlePasswordChange}>Update Password</button>
            <button className={styles.btnSecondary} onClick={() => setViewMode("view")}>Back</button>
          </div>
        </div>
      )}
    </AdminLayout>
    </ProtectedRoute>
  );
}
