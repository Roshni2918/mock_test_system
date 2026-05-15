import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../components/AuthContext";
import styles from "../styles/Exam.module.css";

export default function ExamPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { id: examId } = router.query;

  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null); // FIXED: Start as null
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [examStarted, setExamStarted] = useState(false); // FIXED: Add exam started flag
  const [reviewMap, setReviewMap] = useState({});
  const [loadError, setLoadError] = useState("");

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

  useEffect(() => {
    if (!router.isReady || !examId || !user) return;

    const loadExamData = async () => {
      setLoading(true);
      setLoadError("");

      const results = await Promise.allSettled([fetchExamDetails(), fetchQuestions()]);
      const hasFailure = results.some((r) => r.status === "rejected");
      if (hasFailure) {
        setLoadError("Unable to load exam data. Please check backend connection and try again.");
      }

      setLoading(false);
    };

    loadExamData();
  }, [router.isReady, examId, user]);

  // FIXED: Only start timer when exam is actually started
  useEffect(() => {
    if (!examStarted || !exam) return;

    if (timeLeft <= 0 && timeLeft !== null && !submitted) {
      handleSubmit();
      return;
    }

    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, submitted, examStarted]);

  const fetchExamDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/exams/${examId}/access`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to load exam details");
      }

      if (!data.accessible) {
        alert(`Exam not accessible. ${data.message}`);
        router.push('/student-dashboard');
        return;
      }

      setExam(data.exam);
    } catch (error) {
      console.error("Error fetching exam:", error);
      throw error;
    }
  };

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/exams/${examId}/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to load exam questions");
      }
      setQuestions(data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      throw error;
    }
  };

  const handleStartExam = () => {
    setExamStarted(true);
    const durationMins = parseInt(exam.duration, 10);
    // Add 1 second extra to ensure it evaluates > 0 properly on first tick avoiding premature fires due to 0 parsing.
    setTimeLeft(durationMins > 0 ? durationMins * 60 : 3600);
  };

  const formatTime = (t) => {
    if (t === null || t < 0) return "00:00";
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleOption = (questionId, optionId) => {
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const toggleReview = (questionId) => {
    setReviewMap((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const getQuestionStatus = (questionId) => {
    const isAnswered = Boolean(answers[questionId]);
    const isReview = Boolean(reviewMap[questionId]);

    if (isAnswered && isReview) return "answeredReview";
    if (isReview) return "review";
    if (isAnswered) return "answered";
    return "notAttempted";
  };

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);

    const totalTime = exam.duration * 60 - (timeLeft || 0);

    try {
      const token = localStorage.getItem('token');
      
      const submissionData = {
        examId: examId,
        answers: answers || {},
        time_taken: totalTime
      };
      
      console.log('Submitting exam with data:', submissionData);
      
      const response = await fetch(`/api/exams/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      });
      let data = {};
      try {
        data = await parseResponseSafely(response);
      } catch (parseError) {
        data = { message: "Server returned an invalid response while submitting exam." };
      }
      if (!response.ok) {
        throw new Error(data?.message || data?.error || `Server error: ${response.status}`);
      }
      alert('Exam submitted successfully!');
      router.push("/student-dashboard");
    } catch (error) {
      console.error("Error submitting exam:", error);
      alert(error.message || "Error submitting exam. Please try again.");
      setSubmitted(false);
    }
  };

  if (loading) return <div style={{ padding: "20px", fontSize: "18px" }}>Loading exam...</div>;
  if (loadError) return <div style={{ padding: "20px", color: "red" }}>{loadError}</div>;
  if (!exam) return <div style={{ padding: "20px", color: "red" }}>Failed to load exam</div>;
  if (!questions.length) return <div style={{ padding: "20px", color: "red" }}>No questions available</div>;

  // FIXED: Show Start Exam screen before exam begins
  if (!examStarted) {
    return (
      <div className={styles.startScreen}>
        <div className={styles.startCard}>
          <h1 className={styles.startTitle}>{exam.name}</h1>
          <p className={styles.startMeta}>
            Total Questions: {questions.length}
          </p>
          <p className={styles.startMeta}>
            Duration: {exam.duration} minutes
          </p>
          <p className={styles.startMeta}>
            Exam Type: {exam.type}
          </p>
          
          <p className={styles.startNote}>
            Click "Start Exam" to begin. You cannot undo this action.
          </p>

          <button
            onClick={handleStartExam}
            className={styles.startButton}
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQ];
  const answeredCount = Object.keys(answers).length;
  const reviewCount = Object.values(reviewMap).filter(Boolean).length;
  const notAttemptedCount = questions.length - answeredCount;
  const currentStatus = getQuestionStatus(currentQuestion.id);

  return (
    <div className={styles.examShell}>
      <div className={styles.examMain}>
        <div className={styles.mainHeader}>
          <div>
            <h2 className={styles.examTitle}>{exam.name}</h2>
            <p className={styles.examMeta}>Duration: {exam.duration} minutes | Total Questions: {questions.length}</p>
          </div>
          <div className={`${styles.timer} ${timeLeft < 300 ? styles.timerDanger : styles.timerSafe}`}>
            <span className={styles.timerLabel}>Time Left</span>
            <span className={styles.timerValue}>{formatTime(timeLeft)}</span>
          </div>
        </div>

        <p className={styles.progressText}>
          Question {currentQ + 1} of {questions.length} | Answered: {answeredCount}
        </p>

        <div className={styles.questionCard}>
          <div className={styles.questionHead}>
            <h3 className={styles.questionTitle}>{currentQuestion.question}</h3>
            <span className={`${styles.statusPill} ${styles[`status${currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}`]}`}>
              {currentStatus === "answeredReview" ? "Answered & Review" : currentStatus === "notAttempted" ? "Not Attempted" : currentStatus === "review" ? "Review" : "Answered"}
            </span>
          </div>
          
          {currentQuestion.image_path && (
            <div className={styles.questionImageWrap}>
              <img
                src={currentQuestion.image_path.startsWith('/') ? currentQuestion.image_path : `/${currentQuestion.image_path}`}
                alt="Question Image"
                className={styles.questionImage}
                onError={(e) => {
                  console.error('Image failed to load:', e);
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {currentQuestion.options.map((opt, idx) => (
            <div key={opt.id} className={styles.optionRow}>
              <label className={`${styles.optionLabel} ${answers[currentQuestion.id] === opt.id ? styles.optionSelected : ""}`}>
                <input
                  type="radio"
                  name={`q${currentQuestion.id}`}
                  checked={answers[currentQuestion.id] === opt.id}
                  onChange={() => handleOption(currentQuestion.id, opt.id)}
                  className={styles.optionInput}
                />
                <span>{String.fromCharCode(65 + idx)}) {opt.text}</span>
              </label>
            </div>
          ))}
        </div>

        <div className={styles.navRow}>
          <button
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className={styles.navButton}
          >
            Previous
          </button>

          <button
            onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
            disabled={currentQ === questions.length - 1}
            className={styles.navButton}
          >
            Next
          </button>
          <button
            onClick={() => toggleReview(currentQuestion.id)}
            className={`${styles.reviewButton} ${reviewMap[currentQuestion.id] ? styles.reviewActive : ""}`}
          >
            {reviewMap[currentQuestion.id] ? "Unmark Review" : "Mark for Review"}
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitted}
            className={styles.submitButton}
          >
            Submit Exam
          </button>
        </div>
      </div>

      <aside className={styles.navigator}>
        <h4 className={styles.navigatorTitle}>Question Palette</h4>
        <div className={styles.statsWrap}>
          <div className={styles.statBox}><span>{answeredCount}</span><small>Answered</small></div>
          <div className={styles.statBox}><span>{reviewCount}</span><small>Review</small></div>
          <div className={styles.statBox}><span>{notAttemptedCount}</span><small>Not Attempted</small></div>
        </div>

        <div className={styles.questionGrid}>
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentQ(i)}
              className={`${styles.qIndexButton} ${styles[`status${getQuestionStatus(q.id).charAt(0).toUpperCase() + getQuestionStatus(q.id).slice(1)}`]} ${currentQ === i ? styles.currentQuestion : ""}`}
              title={currentQ === i ? "Current Question" : getQuestionStatus(q.id)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className={styles.legend}>
          <p><span className={`${styles.legendDot} ${styles.statusAnswered}`}></span>Answered</p>
          <p><span className={`${styles.legendDot} ${styles.statusReview}`}></span>Review</p>
          <p><span className={`${styles.legendDot} ${styles.statusAnsweredReview}`}></span>Answered & Review</p>
          <p><span className={`${styles.legendDot} ${styles.statusNotAttempted}`}></span>Not Attempted</p>
        </div>
      </aside>

      {submitted && (
        <div className={styles.submissionOverlay}>
          <div className={styles.submissionCard}>
            <h2 className={styles.submittedTitle}>Exam Submitted</h2>
            <p className={styles.submittedText}>Your exam has been successfully submitted.</p>
            <p className={styles.submittedHint}>Redirecting...</p>
          </div>
        </div>
      )}
    </div>
  );
}
