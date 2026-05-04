import React from "react";
import { useRouter } from "next/router";
import styles from "../styles/Admin.module.css";

const actions = [
  { title: "Dashboard", route: "/admin-dashboard" },
  { title: "Create Exam", route: "/admin-create-exam" },
  { title: "Upload Exam", route: "/admin-upload-exam" },
  { title: "Add Student", route: "/admin-add-student" },
  { title: "Manage Students", route: "/admin-students" },
  { title: "Exam Results", route: "/admin-results" },
  { title: "Exam Settings", route: "/admin-settings" },
  { title: "Profile", route: "/admin-profile" },
];

export default function AdminLayout({ children, activePage }) {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Admin Dashboard</h2>
        <div className={styles.profile}>
          <button 
            className={styles.logoutBtn}
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              router.push('/');
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.sidebar}>
          {actions.map((action) => (
            <p
              key={action.title}
              className={activePage === action.title ? styles.active : ""}
              onClick={() => router.push(action.route)}
            >
              {action.title}
            </p>
          ))}
        </div>

        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}