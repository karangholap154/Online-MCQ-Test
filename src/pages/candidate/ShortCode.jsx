import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { validateShortcode } from "../../api/CandidateApi.js";
import { showErrorAlert } from "../../utils/swal.js";
import { CircleCheckBig, TriangleAlert, Pin } from "lucide-react";
import logo from "../../assets/images/candorworkslogo.png";


export default function ShortCode() {
  const navigate = useNavigate();
  const CODE_LENGTH = 8;

  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const submittedRef = useRef(false);
  const inputsRef = useRef([]);

  const filledLength = code.filter((c) => c !== "").length;

  const handleChange = (index, rawValue) => {
    const value = rawValue.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError("");

    if (value && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (index) => {
    if (!code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, CODE_LENGTH);

    const newCode = Array(CODE_LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      newCode[i] = char;
    });

    setCode(newCode);
    setError("");

    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || submittedRef.current) return;

    if (filledLength !== CODE_LENGTH) {
      setError(`Please enter a valid ${CODE_LENGTH}-character code`);
      return;
    }

    if (!agreedToTerms) {
      setError("Please agree to the declaration before proceeding");
      return;
    }

    submittedRef.current = true;
    setLoading(true);

    try {
      const shortcode = code.join("");
      const res = await validateShortcode(shortcode);

      const testData = res?.data?.data;
      const { candidate_name, candidate_email } = testData;

      setError("");

      navigate(`/test-screen/${shortcode}`, {
        state: {
          testData,
          candidate: {
            name: candidate_name,
            email: candidate_email,
          },
        },
      });
    } catch (error) {
      submittedRef.current = false;
      showErrorAlert(error.response?.data?.errors ?? "Invalid shortcode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-vh-100 d-flex align-items-center justify-content-center p-2 p-md-3 bg-gradient-custom">
        <div className="container-xxl" >
          <div className="row justify-content-center g-0">
            <div className="col-12">
              <div className="card shadow-lg border-0 rounded-4">
                <div className="card-body p-3 p-md-4">
                  {/* Header */}
                  <div className="text-center mb-3">
                    <h4 className="fw-bold mb-1 heading-clamp">
                      Online Assessment Portal
                    </h4>
                    <p className="text-muted mb-0 small">
                      Enter your 8-character access code to begin
                    </p>
                  </div>

                  {/* Two Column Layout */}
                  <div className="row g-3">
                    {/* Left Column */}
                    <div className="col-lg-7">
                      <div className="bg-light rounded-3 p-2 p-md-3 mb-3">
                        <h6 className="fw-bold mb-2 small">
                          Assessment Summary
                        </h6>
                        <div className="row g-2">
                          <div className="col-4">
                            <div className="d-flex flex-column">
                              <span className="text-muted font-xs">
                                Test Name
                              </span>
                              <span className="fw-semibold small">
                                Aptitude & Logic
                              </span>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="d-flex flex-column">
                              <span className="text-muted font-xs">
                                Duration
                              </span>
                              <span className="fw-semibold small">60 Mins</span>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="d-flex flex-column">
                              <span className="text-muted font-xs">
                                Questions
                              </span>
                              <span className="fw-semibold small">25+</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-success bg-opacity-10 rounded-3 p-2 p-md-3 mb-3">
                        <h6 className="fw-bold mb-2 small">System Readiness</h6>
                        <div className="row g-2 ">
                          {["Internet", "Browser", "Webcam"].map((item) => (
                            <div key={item} className="col-4">
                              <div className=" gap-3">
                                <CircleCheckBig
                                  size={16}
                                  className="text-success"
                                />
                                <span className="small">{item}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border border-danger border-2 rounded-3 p-2 p-md-3 mb-3">
                        <h6 className="fw-bold text-danger mb-2 small">
                          <TriangleAlert color="#e5ff00" /> Examination Rules
                        </h6>
                        <div className="row g-2 small">
                          {[
                            { title: "No Tab Switching", desc: "Auto-submit" },
                            { title: "Proctoring On", desc: "Monitored" },
                            { title: "No Copy/Paste", desc: "Restricted" },
                            { title: "No Devices", desc: "Phones blocked" },
                            { title: "Non-Stop Timer", desc: "Continuous" },
                            { title: "Single Session", desc: "No refresh" },
                          ].map((rule, idx) => (
                            <div className="col-6 col-md-4" key={idx}>
                              <div className="d-inline-flex gap-1 align-items-start">
                                <span className="text-danger small">•</span>
                                <div className="lh-sm">
                                  <strong className="d-block font-sm">
                                    {rule.title}
                                  </strong>
                                  <span className="text-muted font-xs">
                                    {rule.desc}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-warning bg-opacity-10 rounded-3 p-2 p-md-3">
                        <h6 className="fw-bold mb-2 small">
                          <Pin color="#f50000" /> Important Notes
                        </h6>
                        <ul className="mb-0 ps-3 small lh-base">
                          <li className="mb-1">
                            Read instructions carefully before starting
                          </li>
                          <li className="mb-1">
                            Test cannot be paused once begun
                          </li>
                          <li className="mb-1">
                            Submit all answers before time expires
                          </li>
                          <li className="mb-0">
                            Contact support for technical issues
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="col-lg-5">
                      <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                          <img
                            src={logo}
                            alt="CANDORWORKS Logo"
                            className="d-block mx-auto w-50 object-fit-contain"
                          />
                          <hr className="w-50 mx-auto" />
                          <p className="fs-5 fw-semibold text-center">
                            Enter Access Code
                          </p>

                          <div className="d-flex  flex-nowrap justify-content-center gap-1 gap-md-2 mb-2">
                            {code.map((val, index) => (
                              <input
                                key={index}
                                ref={(el) => (inputsRef.current[index] = el)}
                                type="text"
                                className={`form-control fw-semibold text-center otp-input p-0 ${
                                  error ? "is-invalid" : ""
                                }`}
                                value={val}
                                maxLength={1}
                                disabled={loading}
                                autoComplete="off"
                                onChange={(e) =>
                                  handleChange(index, e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Backspace")
                                    handleBackspace(index);
                                  if (e.key === "Enter") e.preventDefault();
                                }}
                                onPaste={handlePaste}
                              />
                            ))}
                          </div>

                          {error && (
                            <div
                              className="alert alert-danger py-1 mb-2 text-center"
                              role="alert"
                            >
                              <small className="font-sm">{error}</small>
                            </div>
                          )}

                          <div className="text-center mb-2">
                            <span
                              className={`font-md ${
                                filledLength === CODE_LENGTH
                                  ? "text-success fw-semibold"
                                  : "text-muted"
                              }`}
                            >
                              {filledLength}/{CODE_LENGTH} characters entered
                            </span>
                          </div>
                        </div>

                        {/* Declaration */}
                        <div className="bg-light rounded-3 p-2 p-md-3 mb-3">
                          <h6 className="fw-bold mb-2 small">Declaration</h6>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="agreeTerms"
                              checked={agreedToTerms}
                              onChange={(e) => {
                                setAgreedToTerms(e.target.checked);
                                setError("");
                              }}
                              disabled={loading}
                            />
                            <label
                              className="form-check-label small text-secondary"
                              htmlFor="agreeTerms"
                            >
                              I hereby declare that I am the authorized
                              candidate and agree to follow all rules.
                            </label>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          className="btn btn-gradient-primary w-100 fw-bold py-2 py-md-3"
                          disabled={
                            loading ||
                            filledLength !== CODE_LENGTH ||
                            !agreedToTerms
                          }
                        >
                          {loading ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Verifying...
                            </>
                          ) : (
                            "Start Assessment"
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
