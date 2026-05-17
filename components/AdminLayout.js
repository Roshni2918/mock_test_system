import React from "react";
import { useRouter } from "next/router";
import Logo from "./Logo";
import styles from "../styles/Admin.module.css";

const actions = [
  { title: "Dashboard", route: "/admin-dashboard", icon: "📊" },
  { title: "Create Exam", route: "/admin-create-exam", icon: "📝" },
  { title: "Upload Exam", route: "/admin-upload-exam", icon: "📄" },
  { title: "Add Student", route: "/admin-add-student", icon: "👤" },
  { title: "Manage Students", route: "/admin-students", icon: "👥" },
  { title: "Exam Results", route: "/admin-results", icon: "📈" },
  { title: "Exam Settings", route: "/admin-settings", icon: "⚙️" },
  { title: "Profile", route: "/admin-profile", icon: "👨‍💼" },
];

export default function AdminLayout({ children, activePage }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <h2>Vijeta Foundation</h2>
          <small>Admin Panel</small>
        </div>

        <nav className={styles.sidebarNav}>
          {actions.map((action) => (
            <button
              key={action.title}
              className={`${styles.navItem} ${activePage === action.title ? styles.navItemActive : ""}`}
              onClick={() => router.push(action.route)}
            >
              <span className={styles.navIcon}>{action.icon}</span>
              {action.title}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <div className={styles.mainContent}>
        <header className={styles.topBar}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Logo size={36} admin />
            <h1 className={styles.pageTitle}>{activePage || "Dashboard"}</h1>
          </div>
          <div className={styles.adminProfile}>
            <span>Admin</span>
            <div className={styles.adminAvatar}>A</div>
          </div>
        </header>

        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
