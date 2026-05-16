import React, { useState } from "react";
import styles from "../styles/Login.module.css";
import { useRouter } from "next/router";
import { useAuth } from "../components/AuthContext";

export default function StudentLogin() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [step, setStep] = useState("login");
  const [loading, setLoading] = useState(false);

  const parseResponseSafely = async (response) => {
    const responseText = await response.text();
    if (!responseText || !responseText.trim()) {
      throw new Error("Empty response from server");
    }
    const trimmed = responseText.trim();
    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
      throw new Error("Server returned non-JSON response. Please make sure backend is running on port 5000.");
    }
    return JSON.parse(trimmed);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      login(data.token);
      router.push("/student-dashboard");
    } catch (error) {
      alert(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.brand}>
          <div className={styles.logoIcon}>VF</div>
          <div className={styles.brandText}>
            <h1>Vijeta Foundation</h1>
            <p>Common Entrance Test — Online Mock Test System</p>
          </div>
        </div>
      </div>

      <div className={styles.loginBox}>
        <div className={styles.loginHeader}>
          <div className={styles.lockIcon}>👤</div>
          <h3>Student Login</h3>
          <p>Sign in to access your scheduled exams</p>
        </div>

        <div className={styles.inputGroup}>
          <label>Email Address</label>
          <input
            className={styles.input}
            type="email"
            placeholder="student@vijeta.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Password</label>
          <input
            className={styles.input}
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className={styles.button} onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <button className={styles.secondaryBtn} onClick={() => router.push("/")}>
          Back to Home
        </button>
      </div>
    </div>
  );
}
