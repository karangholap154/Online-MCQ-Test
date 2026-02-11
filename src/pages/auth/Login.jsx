import { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./login1.css";
import logo from "../../assets/images/candorworkslogo.png";
 
import globeVideo from "../../assets/images/1851190-uhd_3840_2160_25fps.mp4";
import { showSuccessToast } from "../../utils/swalToast";
import { showWarningAlert } from "../../utils/swal";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
 
const Login = () => {
  const { login } = useAuthContext();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showEmailTooltip, setShowEmailTooltip] = useState(false);
  const [showPasswordTooltip, setShowPasswordTooltip] = useState(false);
 
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
 
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    let hasError = false;
 
    if (!formData.email.trim()) {
      setEmailError("This field is required");
      setShowEmailTooltip(true);
      hasError = true;
    } else if (!validateEmail(formData.email)) {
      setEmailError("Enter a valid email");
      setShowEmailTooltip(true);
      hasError = true;
    } else {
      setEmailError("");
      setShowEmailTooltip(false);
    }
 
    if (!formData.password.trim()) {
      setPasswordError("This field is required");
      setShowPasswordTooltip(true);
      hasError = true;
    } else {
      setPasswordError("");
      setShowPasswordTooltip(false);
    }
 
    if (hasError) return;
 
    try {
      const res =await login(formData);
      showSuccessToast(res.data?.message ?? "Login Successful");
      window.location.href = "/hr";
    } catch (err) {
      showWarningAlert( err.response?.data?.errors?.detail ?? "Invalid Credentials...");
    }
  };
 
  return (
    <div className="login-page">
      <div className="blob blob-red"></div>
      <div className="blob blob-yellow"></div>
      <div className="blob blob-purple"></div>
 
      {/* Main Card */}
      <div className="login-container shadow-lg">
        {/* LEFT – VIDEO */}
        <div className="login-left">
          <video
            className="bg-video"
            src={globeVideo}
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="video-overlay"></div>
 
          <div className="left-content">
            <div className="shield-icon ">
              <i className="bi bi-shield-lock-fill"></i>
            </div>
              <h3>Online Test Management Portal.</h3>
            <p>
              Authorized users can sign in to access the CandorWorks platform
            </p>
           
          </div>
        </div>
 
        {/* RIGHT – LOGIN */}
        <div className="login-right minimal-login">
          {/* Shield / Icon */}
          <div className="logo-ring">
            <div className="logo-inner">
              <i className="bi bi-shield-lock-fill"></i>
            </div>
          </div>
    <br />
          {/* Brand */}
          <div className="text-center mb-4">
          <img src={logo} alt="CandorWorks" className="brand-title" />
          <p className="subtitle">Online Test Management Portal</p>
        </div>
 
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <OverlayTrigger
                show={showEmailTooltip && emailError}
                placement="top"
                overlay={
                  <Tooltip id="email-error-tooltip" className="error-tooltip">
                    {emailError}
                  </Tooltip>
                }
              >
                <input
                  type="text"
                  className={`form-control minimal-input ${emailError ? "is-invalid" : ""}`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, email: value });
                    if (value.trim() === "") {
                      setEmailError("");
                      setShowEmailTooltip(false);
                    } else if (!validateEmail(value)) {
                      setEmailError("Enter a valid email");
                      setShowEmailTooltip(false);
                    } else {
                      setEmailError("");
                      setShowEmailTooltip(false);
                    }
                  }}
                  onFocus={() => {
                    if (emailError) setShowEmailTooltip(true);
                  }}
                  onBlur={() => {
                    setShowEmailTooltip(false);
                  }}
                />
              </OverlayTrigger>
            </div>
 
            <div className="form-group mt-3">
              <label>Password</label>
              <OverlayTrigger
                show={showPasswordTooltip && passwordError}
                placement="top"
                overlay={
                  <Tooltip id="password-error-tooltip" className="error-tooltip">
                    {passwordError}
                  </Tooltip>
                }
              >
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`form-control minimal-input ${passwordError ? "is-invalid" : ""}`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, password: value });
                      if (value.trim() !== "") {
                        setPasswordError("");
                        setShowPasswordTooltip(false);
                      }
                    }}
                    onFocus={() => {
                      if (passwordError) setShowPasswordTooltip(true);
                    }}
                    onBlur={() => {
                      setShowPasswordTooltip(false);
                    }}
                  />
                  <span
                    className="eye"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i
                      className={`bi ${showPassword ? "bi-eye" : "bi-eye-slash"}`}
                    ></i>
                  </span>
                </div>
              </OverlayTrigger>
            </div>
 
            <button className="btn gradient-btn w-100 mt-4" type="submit">
              LOGIN<i className="bi bi-arrow-right ms-1"></i>
            </button>
          </form>
 
          <div className="footer-text">
            ©2026 CandorWorks. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default Login;
 