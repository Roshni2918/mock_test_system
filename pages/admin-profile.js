import React, { useState } from "react";
import AdminLayout from "../components/AdminLayout";
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
    <AdminLayout activePage="Profile">
      {viewMode === "view" && (
        <div>
          <div className={styles.profileHeader}>
            <div>
              <h2>{profile.name}</h2>
              <p>Vijeta Foundation</p>
            </div>
            <div className={styles.profileRight}>
              <div className={styles.profileImg}></div>
            </div>
          </div>

          <div className={styles.topCard}>
            <div className={styles.profileGrid}>
              <div className={styles.profileBox}>
                <h3>Personal Details</h3>
                <p><b>Name:</b> {profile.name}</p>
                <p><b>Email:</b> {profile.email}</p>
                <p><b>Mobile:</b> {profile.mobile}</p>
              </div>
              <div className={styles.profileBox}>
                <h3>Academy Details</h3>
                <p><b>Academy:</b> Vijeeta Foundation</p>
                <p><b>Branch:</b> Main Branch</p>
                <p><b>Address:</b> Ashta</p>
              </div>
            </div>

            <div className={styles.securityBox}>
              <h3>Security</h3>
              <p><b>Last Login:</b> 25 July 2026</p>
              <p><b>Status:</b> <span className={styles.activeStatus}>Active</span></p>
              <p><b>Password Changed:</b> 20 July 2026</p>
            </div>

            <div className={styles.profileFooter}>
              <button className={styles.commonBtn} onClick={() => setViewMode("edit")}>Edit Profile</button>
              <button className={styles.commonBtn} onClick={() => setViewMode("password")}>Change Password</button>
            </div>
          </div>
        </div>
      )}

      {viewMode === "edit" && (
        <div className={styles.card}>
          <h3>Edit Profile</h3>
          <input
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Name"
          />
          <input
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            placeholder="Email"
          />
          <input
            value={profile.mobile}
            onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
            placeholder="Mobile"
          />
          <div className={styles.row}>
            <button className={styles.btn} onClick={handleSave}>Update</button>
            <button className={styles.btn} onClick={() => setViewMode("view")}>Back</button>
          </div>
        </div>
      )}

      {viewMode === "password" && (
        <div className={styles.card}>
          <h3>Change Password</h3>
          <input
            type="password"
            value={passwordData.oldPass}
            onChange={(e) => setPasswordData({ ...passwordData, oldPass: e.target.value })}
            placeholder="Old Password"
          />
          <input
            type="password"
            value={passwordData.newPass}
            onChange={(e) => setPasswordData({ ...passwordData, newPass: e.target.value })}
            placeholder="New Password"
          />
          <input
            type="password"
            value={passwordData.confirmPass}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPass: e.target.value })}
            placeholder="Confirm Password"
          />
          <div className={styles.row}>
            <button className={styles.btn} onClick={handlePasswordChange}>Update Password</button>
            <button className={styles.btn} onClick={() => setViewMode("view")}>Back</button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
