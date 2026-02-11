import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../../assets/images/candorworkslogo.png";
import { showErrorAlert } from "../../utils/swal";
import apiClient from "../../services/apiClient";

const TestScreen = () => {
  const location = useLocation();
  const testData = location.state?.testData;

  // User info variables
  const userName = testData?.candidate_name ?? "Guest";
  const userEmail = testData?.candidate_email ?? "";

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { uuid } = useParams();
   

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1800);
  const [totalTime, setTotalTime] = useState(1800);

  const navigate = useNavigate();
  const hasSubmittedRef = useRef(false);
  const [pendingRestore, setPendingRestore] = useState(null);

  const answersRef = useRef({});
  const questionsRef = useRef([]);

  const handleCopy = (e) => {
    e.preventDefault();
    const customMessage = "Cheating is not allowed!";

    if (e.clipboardData) {
      e.clipboardData.setData("text/plain", customMessage);
    } else {
      navigator.clipboard.writeText(customMessage);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("submittedTest") == uuid) {
      navigate("/thank-you", { replace: true });
      return;
    }

    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.error("Failed to enter fullscreen:", err);
      }
    };
    enterFullscreen();
  }, []);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  const getOptionsArray = (optionsJson) => {
    if (!optionsJson) return [];
    if (Array.isArray(optionsJson)) return optionsJson;
    if (typeof optionsJson === "object") return Object.values(optionsJson);
    return [];
  };

  useEffect(() => {
    if (!testData) {
      setError("Invalid or expired test link.");
      setLoading(false);
      return;
    }

    const formattedQuestions = testData.questions.map((q) => ({
      id: q.id,
      question: q.text,
      options: getOptionsArray(q.options_json),
    }));

    setQuestions(formattedQuestions);

    if (testData.duration_minutes) {
      const seconds = testData.duration_minutes * 60;
      setTimeLeft(seconds);
      setTotalTime(seconds);
    }

    setLoading(false);
  }, []);

  const preparePayload = (answersOverride = null) => {
    const currentAnswers = answersOverride || answersRef.current || {};
    const currentQuestions = questionsRef.current;

    const formattedAnswers = Object.entries(currentAnswers)
      .map(([qIdx, optIdx]) => {
        const question = currentQuestions[qIdx];
        if (!question) return null;
        return {
          question_id: question.id,
          selected_option: Number(optIdx),
        };
      })
      .filter((item) => item !== null);

    return { answers: formattedAnswers };
  };

  // ---HANDLE SUBMIT  ---
  const handleSubmit = async (autoSubmit = false, answersOverride = null) => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    const payload = preparePayload(answersOverride);

    try {
      localStorage.removeItem("autosubmit");
      await apiClient.post(`/tests/test/submit/${uuid}/`, payload);
      if (!autoSubmit) {
        navigate("/thank-you", { replace: true });
        return;
      }

      Swal.fire({
        icon: "warning",
        title: "Test Submitted",
        text: "Test auto-submitted due to rule violation (Tab Switch/Refresh/Timeout). Result has been recorded.",
        confirmButtonText: "OK",
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/thank-you", { replace: true });
        }
      });
    } catch (err) {
      if (autoSubmit) {
        navigate("/thank-you", { replace: true });
      } else {
        hasSubmittedRef.current = false;
        showErrorAlert(
          err.response?.data?.message ?? "Submission Failed. Please try again.",
        );
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.key === "r") || e.key === "F5") {
        e.preventDefault();
        handleSubmit(true);
        const payload = preparePayload();
        const blob = new Blob([JSON.stringify(payload)], {
          type: "application/json",
        });
        navigator.sendBeacon(
          `${import.meta.env.VITE_API_BASE_URL}/tests/test/submit/${uuid}/`,
          new Blob([JSON.stringify(preparePayload())], {
            type: "application/json",
          }),
        );
      }
    };
    const handleVisibilityChange = () => {
      if (document.hidden && !hasSubmittedRef.current) {
        Swal.fire({
          icon: "warning",
          title: "Tab Switch Detected",
          text: "Due to tab switch, the test will be auto-submitted.",
          confirmButtonText: "OK",
          allowOutsideClick: false,
        }).then(() => {
          handleSubmit(true);
        });
      }
    };
    const handleBeforeUnload = () => {
      if (!hasSubmittedRef.current) {
        try {
          localStorage.setItem(
            "autosubmit",
            JSON.stringify({
              answers: answersRef.current,
              timestamp: Date.now(),
            }),
          );
        } catch {
          console.error("Failed to save autosubmit data to localStorage.");
        }

        if (questionsRef.current.length > 0) {
          navigator.sendBeacon(
            `${import.meta.env.VITE_API_BASE_URL}/tests/test/submit/${uuid}/`,
            new Blob([JSON.stringify(preparePayload())], {
              type: "application/json",
            }),
          );
        }
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !hasSubmittedRef.current) {
        Swal.fire({
          icon: "warning",
          title: "Fullscreen Exited",
          text: "Due to exiting fullscreen, the test will be auto-submitted.",
          confirmButtonText: "OK",
          allowOutsideClick: false,
        }).then(() => {
          handleSubmit(true);
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [uuid]);

  useEffect(() => {
    try {
      const pending = localStorage.getItem("autosubmit");
      if (pending && !hasSubmittedRef.current) {
        const data = JSON.parse(pending);

        Swal.fire({
          icon: "warning",
          title: "Reload Detected",
          text: "Due to reload, the test will be auto-submitted.",
          confirmButtonText: "OK",
          allowOutsideClick: false,
        }).then(() => {
          setPendingRestore(data);
        });
      }
    } catch (err) {
      console.error("Error detecting reload:", err);
    }
  }, []);

  useEffect(() => {
    if (questions.length > 0 && pendingRestore && !hasSubmittedRef.current) {
      setAnswers(pendingRestore.answers || {});
      handleSubmit(true, pendingRestore.answers);
      setPendingRestore(null);
    }
  }, [questions, pendingRestore, navigate]);

  useEffect(() => {
    if (loading || error) return;
    if (timeLeft === 0) {
      handleSubmit(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, error]);

  const handleAnswerSelect = (optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
  };

  const nextQuestion = () => {
    if (answers[currentIndex] === undefined) {
      Swal.fire({
        icon: "info",
        title: "Question Unanswered",
        text: "Please select an answer before proceeding.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const prevQuestion = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const onManualSubmit = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You are about to submit your test.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Submit Test!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleSubmit(false);
      }
    });
  };

  const formatTime = (t) =>
    `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, "0")}`;

  const answeredCount = useMemo(
    () => Object.keys(answers).filter((k) => answers[k] !== undefined).length,
    [answers],
  );

  const progressPercent =
    questions.length > 0
      ? Math.round((answeredCount / questions.length) * 100)
      : 0;
  const timePercent =
    totalTime > 0 ? Math.round(((totalTime - timeLeft) / totalTime) * 100) : 0;

  if (loading)
    return (
      <div className="row vh-100 justify-content-center align-items-center">
        <h3>Loading Test...</h3>
      </div>
    );

  if (error)
    return (
      <div className="row vh-100 flex-column justify-content-center align-items-center text-danger">
        <h3>{error}</h3>
        <button
          className="btn btn-outline-dark mt-3"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );

  if (questions.length === 0)
    return (
      <div className="row vh-100 justify-content-center align-items-center">
        <h3>No questions found.</h3>
      </div>
    );

  const currentQuestion = questions[currentIndex];

  return (
    <div
      className="vh-100 d-flex flex-column bg-light overflow-hidden"
      onCopy={handleCopy}
    >
      <nav className="navbar navbar-expand-lg navbar-dark flex-shrink-0 bg-white">
        <div className="container h-100">
          <div className="row align-items-center justify-content-between w-100">
            {/* Left */}
            <div className="col-auto">
              <span className="bg-white p-1 d-inline-block me-2">
                <img
                  src={logo}
                  alt="CandorWorks"
                  className="d-block"
                  style={{ height: "36px" }}
                />
              </span>
            </div>

            {/* Center */}
            <div className="col d-none d-md-block position-absolute start-50 translate-middle-x text-center">
              <span className="fw-semibold text-dark fs-5">Aptitude Test</span>
            </div>

            {/* Right */}
            <div className="col-auto">
              <div className="row align-items-center gx-3">
                <div className="col-auto d-none d-md-block text-end me-2">
                  <span className="fw-bold text-dark small mb-0 d-block">
                    {userName}
                  </span>
                  <span className="text-muted small d-block">{userEmail}</span>
                </div>

                <div className="col-auto">
                  <button
                    className="btn btn-dark btn-sm px-2 py-1"
                    onClick={() => handleSubmit(false)}
                  >
                    <i className="bi bi-send-check me-1"></i>
                    <span className="d-none d-sm-inline">Submit Test</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div
        className="offcanvas offcanvas-end"
        tabIndex="-1"
        id="questionNavigator"
        aria-labelledby="questionNavigatorLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="questionNavigatorLabel">
            Question Navigator
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <div className="list-group">
            {questions.map((q, idx) => {
              const answered = answers[idx] !== undefined;
              return (
                <button
                  key={q.id}
                  type="button"
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${idx === currentIndex ? "active" : ""}`}
                  onClick={() => setCurrentIndex(idx)}
                  data-bs-dismiss="offcanvas"
                >
                  <div className="text-start">
                    <small className="text-muted">Q{idx + 1}</small>
                    <div className="fw-semibold text-truncate">
                      {q.question}
                    </div>
                  </div>
                  <span
                    className={`badge rounded-pill ${answered ? "bg-success" : "bg-secondary"}`}
                  >
                    {answered ? (
                      <>
                        <i className="bi bi-check-circle me-1"></i>Answered
                      </>
                    ) : (
                      <>
                        <i className="bi bi-dot me-1"></i>Pending
                      </>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="container flex-grow-1 py-2 py-md-3 overflow-auto vh-100">
        <div className="row g-2 mb-2 mb-md-3">
          <div className="col-12 col-lg-7">
            <div className="card border-0 bg-white shadow-sm">
              <div className="card-body p-2 p-md-3">
                <div className="row justify-content-between align-items-center gy-2">
                  {/* Left badges */}
                  <div className="col-12 col-md-auto">
                    <div className="row align-items-center gy-2">
                      <div className="col-auto">
                        <span className="badge bg-info text-dark px-2 py-1 fs-6">
                          <i className="bi bi-question-circle me-1"></i>Q{" "}
                          {currentIndex + 1}/{questions.length}
                        </span>
                      </div>

                      <div className="col-auto">
                        <span className="badge bg-success px-2 py-1 small">
                          <i className="bi bi-check2-all me-1"></i>
                          {answeredCount} answered
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="col-12 col-md">
                    <div className="ms-0 ms-md-3 mt-2 mt-md-0">
                      <div className="text-muted mb-1 small">Progress</div>
                      <div className="progress">
                        <div
                          className="progress-bar bg-primary"
                          style={{ width: `${progressPercent}%` }}
                        >
                          <small>{progressPercent}%</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-5">
            <div className="card border-0 bg-white shadow-sm">
              <div className="card-body p-2 p-md-3">
                <div className="row align-items-center justify-content-between gy-2">
                  {/* Left */}
                  <div className="col-12 col-md-auto">
                    <span className="fw-semibold small">
                      <i className="bi bi-hourglass-split me-1"></i>Time
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="col-12 col-md">
                    <div className="mx-2">
                      <div className="progress">
                        <div
                          className="progress-bar bg-danger"
                          style={{ width: `${timePercent}%` }}
                        >
                          <small className="fw-bold">{timePercent}%</small>
                        </div>
                      </div>

                      <div className="mt-2 small text-muted">
                        Used: {timePercent}% • Remaining: {formatTime(timeLeft)}
                      </div>
                    </div>
                  </div>

                  {/* Right  */}
                  <div className="col-12 col-md-auto text-md-end">
                    <span className="badge bg-danger px-2 py-1">
                      <i className="bi bi-clock me-1"></i>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-body p-3">
                {/* Question Header */}
                <h6 className="mb-3">
                  <div className="row align-items-start gy-2">
                    <div className="col-auto">
                      <span className="badge bg-primary text-white small">
                        Q. {currentIndex + 1}
                      </span>
                    </div>

                    <div className="col">
                      <span className="lh-sm">{currentQuestion.question}</span>
                    </div>
                  </div>
                </h6>

                {/* Options */}
                <div className="mt-3">
                  {currentQuestion.options.map((option, index) => {
                    const isChecked = answers[currentIndex] === index;

                    return (
                      <div
                        className={`form-check mb-2 p-2 border rounded ${isChecked ? "bg-light border-primary" : ""}`}
                        key={index}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleAnswerSelect(index)}
                      >
                        <div className="row align-items-start">
                          <div className="col-auto">
                            <input
                              className="form-check-input mt-1 ms-2"
                              type="radio"
                              name={`answer-${currentQuestion.id}`}
                              id={`option-${currentQuestion.id}-${index}`}
                              checked={isChecked}
                              onChange={() => handleAnswerSelect(index)}
                            />
                          </div>

                          <div className="col">
                            <label
                              className="form-check-label w-100 ms-2 small"
                              htmlFor={`option-${currentQuestion.id}-${index}`}
                            >
                              {option}
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="row justify-content-between mt-3 mb-2 gy-2">
              {/* Left  */}
              <div className="col-auto">
                <button
                  className="btn btn-outline-secondary btn-sm align-items-center"
                  disabled={currentIndex === 0}
                  onClick={prevQuestion}
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  <span className="d-none d-sm-inline">Previous</span>
                </button>
              </div>

              {/* Right  */}
              <div className="col-auto">
                <div className="row gx-2">
                  <div className="col-auto">
                    {currentIndex < questions.length - 1 ? (
                      <button
                        className="btn btn-outline-primary btn-sm align-items-center"
                        onClick={nextQuestion}
                      >
                        <span className="d-none d-sm-inline">Next</span>
                        <i className="bi bi-arrow-right ms-1"></i>
                      </button>
                    ) : (
                      <button
                        className="btn btn-success btn-sm align-items-center"
                        onClick={onManualSubmit}
                      >
                        <i className="bi bi-send-check me-1"></i>
                        <span className="d-none d-sm-inline">Submit</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-danger bg-opacity-10 border-top mt-auto border-danger">
        <div className="container py-3 d-flex flex-wrap justify-content-center align-items-center gap-3">
          <div className="fw-semibold text-danger d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill"></i>
            Important Notice
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-danger">
              <i className="bi bi-clock me-1"></i>
              Auto-submit on timeout
            </span>
            <span className="badge bg-danger">
              <i className="bi bi-exclamation-triangle me-1"></i>
              Auto-submit on tab switch/reload
            </span>
            <span className="badge bg-danger">
              <i className="bi bi-fullscreen-exit me-1"></i>
              Auto-submit on fullscreen exit
            </span>
            <span className="badge bg-danger">
              <i className="bi bi-x-circle me-1"></i>
              After clicking Next, you can’t go back.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TestScreen;
