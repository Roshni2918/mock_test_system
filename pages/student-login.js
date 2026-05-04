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

      if (data.user.role !== 'student') {
        throw new Error("Invalid credentials");
      }

      login(data.token);
      const assignedBatch = data?.user?.batch || "";
      setBatches(assignedBatch ? [assignedBatch] : []);
      setSelectedBatch(assignedBatch);
      setStep("batch");
    } catch (error) {
      alert(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSelect = () => {
    if (!selectedBatch) {
      alert("Please select a batch");
      return;
    }

    // Store selected batch in localStorage
    localStorage.setItem('selectedBatch', selectedBatch);
    
    // We already authenticated and stored the token.
    router.push("/student-dashboard");
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2>Vijeta Foundation</h2>
        <div className={styles.profile}></div>
      </div>

      {/* Login Box */}
      <div className={styles.loginBox}>
        {step === "login" ? (
          <>
            <h3>Student Login</h3>

            <input
              className={styles.input}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className={styles.input}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className={styles.button} onClick={handleLogin} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </>
        ) : (
          <>
            <h3>Select Your Batch</h3>
            {batches.map((batch) => (
              <div key={batch}>
                <input
                  type="radio"
                  id={batch}
                  name="batch"
                  value={batch}
                  checked={selectedBatch === batch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                />
                <label htmlFor={batch}>{batch}</label>
              </div>
            ))}

            <button className={styles.button} onClick={handleBatchSelect}>
              Continue
            </button>
          </>
        )}
      </div>
    </div>
  );
}
