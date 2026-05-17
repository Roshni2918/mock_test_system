import React from "react";
import { useRouter } from "next/router";
import Logo from "../components/Logo";
import styles from "../styles/Login.module.css";

export default function Home() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.brand}>
          <Logo size={42} />
          <div className={styles.brandText}>
            <h1>Vijeta Foundation</h1>
          </div>
        </div>
        <div className={styles.headerRight}></div>
      </div>

      <div className={styles.hero}>
        <h2>Welcome to CET Mock Test Portal</h2>
        <p>Select your login type to access the examination dashboard</p>
      </div>

      <div className={styles.cardContainer}>
        <div className={styles.selectCard} onClick={() => router.push("/admin-login")}>
          <div className={styles.icon}>🔐</div>
          <h3>Admin Login</h3>
          <p>Create and manage exams, add students, view results and analytics</p>
        </div>

        <div className={styles.selectCard} onClick={() => router.push("/student-login")}>
          <div className={styles.icon}>👤</div>
          <h3>Student Login</h3>
          <p>Take scheduled exams, view your performance and track progress</p>
        </div>
      </div>

      <div className={styles.footer}>
        &copy; {new Date().getFullYear()} Vijeta Foundation. All rights reserved.
      </div>
    </div>
  );
}
