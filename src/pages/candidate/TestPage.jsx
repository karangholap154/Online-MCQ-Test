import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Clock, FileText, User, Wifi, Monitor, Camera, XCircle, Ban, UserCheck, AlertTriangle, PlayCircle, CheckCircle } from "lucide-react";
import logo from "../../assets/images/candorworkslogo.png";
import { showErrorAlert } from "../../utils/swal";
 
 
const TestPage = () => {
 const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();
  const { uuid } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const name = queryParams.get("name");
  const email = queryParams.get("email");
 
  const handleStartTest = () => {
     if (!isChecked) return;
     try {
       localStorage.removeItem("autosubmit");
     } catch {
       console.error("Could not access localStorage");
     }
     try {
       const params = new URLSearchParams({ name, email }).toString();
       navigate(`/test-screen/${uuid}?${params}`);
     } catch (err) {
        showErrorAlert(err.message ?? "Navigation failed. Please try again.");
     }
};

  return (
    <div className="d-flex flex-column min-vh-100 bg-light" style={{ fontSize: "0.9rem" }}>
      <nav className="navbar navbar-dark  shadow-sm">
        <div className="container-fluid">
          <div className="d-flex align-items-center">
                        <span className="bg-white p-1 d-inline-block me-2">
                          <img src={logo} alt="CandorWorks" style={{ height: 36, display: "block" }} />
                        </span>
                    </div>
          <span className="navbar-brand mb-0 text-dark" style={{ fontSize: "1.1rem" }}>
            <CheckCircle size={20} className="me-2" style={{ display: "inline" }} />
            Online Assessment Platform
          </span>
        </div>
      </nav>
 
 
      <div className="container-fluid py-4 flex-grow-1">
        <div className="row h-100">
          <div className="col-lg-3 mb-4 d-flex flex-column">
            <div className="card shadow-sm mb-4" style={{ minHeight: "180px" }}>
              <div className="card-header bg-primary text-white">
                <h6 className="mb-0">
                  <User size={16} className="me-2" style={{ display: "inline" }} />
                  Candidate Information
                </h6>
              </div>
              <div className="card-body d-flex flex-column justify-content-center">
                <div className="mb-3">
                  <strong className="text-muted d-block mb-1" style={{ fontSize: "0.85rem" }}>Name</strong>
                  <p className="mb-0">{name}</p>
                </div>
                <div className="mb-0">
                  <strong className="text-muted d-block mb-1" style={{ fontSize: "0.85rem" }}>Email</strong>
                  <p className="mb-0">{email}</p>
                </div>
              </div>
            </div>
            <div className="card shadow-sm flex-grow-1" style={{ minHeight: "220px" }}>
              <div className="card-header bg-success text-white">
                <h6 className="mb-0">
                  <CheckCircle size={16} className="me-2" style={{ display: "inline" }} />
                  System Readiness
                </h6>
              </div>
              <div className="card-body d-flex flex-column justify-content-around">
                <div className="d-flex align-items-center">
                  <Wifi size={24} className="text-success me-3" />
                  <div>
                    <strong>Internet</strong>
                    <p className="mb-0 text-success" style={{ fontSize: "0.85rem" }}>Stable</p>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <Monitor size={24} className="text-success me-3" />
                  <div>
                    <strong>Browser</strong>
                    <p className="mb-0 text-success" style={{ fontSize: "0.85rem" }}>Supported</p>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <Camera size={24} className="text-success me-3" />
                  <div>
                    <strong>Webcam</strong>
                    <p className="mb-0 text-success" style={{ fontSize: "0.85rem" }}>Ready</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6 mb-4 d-flex flex-column">
            <div className="card shadow-sm mb-4" style={{ minHeight: "180px" }}>
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">
                  <FileText size={16} className="me-2" style={{ display: "inline" }} />
                  Assessment Summary
                </h6>
              </div>
              <div className="card-body d-flex align-items-center">
                <div className="row w-100">
                  <div className="col-md-4 mb-2">
                    <strong className="text-muted d-block mb-1" style={{ fontSize: "0.85rem" }}>Test Name</strong>
                    <p className="mb-0">Aptitude & Logic Tech</p>
                  </div>
                  <div className="col-md-4 mb-2">
                    <strong className="text-muted d-block mb-1" style={{ fontSize: "0.85rem" }}>Duration</strong>
                    <p className="mb-0">
                      <Clock size={16} className="text-warning me-1" style={{ display: "inline" }} />
                      60 Mins
                    </p>
                  </div>
                  <div className="col-md-4">
                    <strong className="text-muted d-block mb-1" style={{ fontSize: "0.85rem" }}>Total Items</strong>
                    <p className="mb-0">
                      <FileText size={16} className="text-primary me-1" style={{ display: "inline" }} />
                      25+ Questions
                    </p>
                  </div>
                </div>
              </div>
            </div>
 
            <div className="card shadow-sm flex-grow-1" style={{ minHeight: "220px" }}>
              <div className="card-header bg-danger text-white">
                <h6 className="mb-0">
                  <AlertTriangle size={16} className="me-2" style={{ display: "inline" }} />
                  STRICT EXAMINATION RULES
                </h6>
              </div>
              <div className="card-body">
                <div className="row h-100">
                  <div className="col-md-6 mb-3">
                    <div className="d-flex">
                      <XCircle size={22} className="text-danger me-3" style={{ flexShrink: 0 }} />
                      <div>
                        <strong className="d-block mb-1" style={{ fontSize: "0.9rem" }}>No Tab Switching</strong>
                        <small className="text-muted">Browsing away will auto-submit.</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="d-flex">
                      <Camera size={22} className="text-danger me-3" style={{ flexShrink: 0 }} />
                      <div>
                        <strong className="d-block mb-1" style={{ fontSize: "0.9rem" }}>Proctoring Enabled</strong>
                        <small className="text-muted">No external monitors allowed.</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="d-flex">
                      <XCircle size={22} className="text-danger me-3" style={{ flexShrink: 0 }} />
                      <div>
                        <strong className="d-block mb-1" style={{ fontSize: "0.9rem" }}>Restricted Actions</strong>
                        <small className="text-muted">Copy and Paste disabled.</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="d-flex">
                      <Ban size={22} className="text-danger me-3" style={{ flexShrink: 0 }} />
                      <div>
                        <strong className="d-block mb-1" style={{ fontSize: "0.9rem" }}>No Devices</strong>
                        <small className="text-muted">Phones not allowed.</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="d-flex">
                      <Clock size={22} className="text-danger me-3" style={{ flexShrink: 0 }} />
                      <div>
                        <strong className="d-block mb-1" style={{ fontSize: "0.9rem" }}>Non-Stop Timer</strong>
                        <small className="text-muted">Clock runs continuously.</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="d-flex">
                      <UserCheck size={22} className="text-danger me-3" style={{ flexShrink: 0 }} />
                      <div>
                        <strong className="d-block mb-1" style={{ fontSize: "0.9rem" }}>Single Session</strong>
                        <small className="text-muted">Stable connection required.</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
 
          <div className="col-lg-3 mb-4 d-flex flex-column">
            <div className="card shadow-sm mb-4" style={{ minHeight: "180px" }}>
              <div className="card-header bg-warning text-dark">
                <h6 className="mb-0">
                  <CheckCircle size={16} className="me-2" style={{ display: "inline" }} />
                  Declaration
                </h6>
              </div>
              <div className="card-body d-flex flex-column justify-content-between">
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="declaration"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="declaration" style={{ fontSize: "0.9rem" }}>
                    <strong>I hereby declare that I am the authorized candidate and agree to follow all rules.</strong>
                  </label>
                </div>
                <div className="d-grid">
                  <button
                    className={`btn ${isChecked ? "btn-success" : "btn-secondary"}`}
                    onClick={handleStartTest}
                    disabled={!isChecked}
                  >
                    <PlayCircle size={16} className="me-2" style={{ display: "inline" }} />
                    Start Test
                  </button>
                </div>
              </div>
            </div>
            
            <div className="card shadow-sm flex-grow-1" style={{ minHeight: "220px" }}>
              <div className="card-header bg-secondary text-white">
                <h6 className="mb-0">
                  <AlertTriangle size={16} className="me-2" style={{ display: "inline" }} />
                  Important Notes
                </h6>
              </div>
              <div className="card-body d-flex flex-column justify-content-around">
                <div className="d-flex align-items-center mb-2">
                  <span
                    className="badge bg-primary me-2"
                    style={{ fontSize: "0.7rem", padding: "0.35rem", minWidth: "1.6rem", textAlign: "center", borderRadius: "0.35rem" }}
                  >
                    1
                  </span>
                  <small>Read all instructions carefully before starting</small>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <span
                    className="badge bg-primary me-2"
                    style={{ fontSize: "0.7rem", padding: "0.35rem", minWidth: "1.6rem", textAlign: "center", borderRadius: "0.35rem" }}
                  >
                    2
                  </span>
                  <small>Test cannot be paused once you begin</small>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <span
                    className="badge bg-primary me-2"
                    style={{ fontSize: "0.7rem", padding: "0.35rem", minWidth: "1.6rem", textAlign: "center", borderRadius: "0.35rem" }}
                  >
                    3
                  </span>
                  <small>Submit all answers before time expires</small>
                </div>
                <div className="d-flex align-items-center">
                  <span
                    className="badge bg-primary me-2"
                    style={{ fontSize: "0.7rem", padding: "0.35rem", minWidth: "1.6rem", textAlign: "center", borderRadius: "0.35rem" }}
                  >
                    4
                  </span>
                  <small>Contact support for any technical issues</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default TestPage;
 
 