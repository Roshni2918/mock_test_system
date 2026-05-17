import React, { useState } from "react";
import { useRouter } from "next/router";
import Logo from "../components/Logo";
import styles from "../styles/Login.module.css";

export default function Instruction() {
  const [agree, setAgree] = useState(false);
  const router = useRouter();

  const startExam = () => {
    if (agree) {
      router.push("/exam?time=1800");
    } else {
      alert("Please accept instructions");
    }
  };

  return (
    <div>
      <div className={styles.topBar}>
        <div className={styles.brand}>
          <Logo size={42} />
          <div className={styles.brandText}>
            <h1>Vijeta Foundation</h1>
          </div>
        </div>
      </div>

      <div className={styles.loginBox}>
        <div className={styles.loginHeader}>
          <div className={styles.lockIcon}>📋</div>
          <h3>Exam Instructions</h3>
          <p>Please read all instructions carefully before starting</p>
        </div>

        <div style={{ marginBottom: "20px", fontSize: "0.88rem", lineHeight: 1.8 }}>
          <p><strong>1.</strong> The exam consists of multiple choice questions.</p>
          <p><strong>2.</strong> Each question has four options, out of which only one is correct.</p>
          <p><strong>3.</strong> You can navigate between questions using the Previous and Next buttons.</p>
          <p><strong>4.</strong> You can mark questions for review and revisit them later.</p>
          <p><strong>5.</strong> The exam will be automatically submitted when the timer ends.</p>
          <p><strong>6.</strong> Do not refresh the page or press the back button during the exam.</p>
          <p><strong>7.</strong> Ensure you have a stable internet connection.</p>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", cursor: "pointer", fontSize: "0.9rem" }}>
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            style={{ width: "18px", height: "18px" }}
          />
          I have read and understand all the instructions
        </label>

        <button
          className={styles.button}
          onClick={startExam}
          disabled={!agree}
        >
          Start Exam
        </button>
      </div>
    </div>
  );
}
