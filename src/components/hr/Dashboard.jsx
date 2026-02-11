import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getCandidates } from "../../api/CandidateApi";
import { getTestResults } from "../../api/results";
import { getUsers } from "../../api/hrUsers";
import { showErrorAlert } from "../../utils/swal";

const StatCard = memo(({ title, value, icon, iconBg, iconT, loading }) => (
  <Card className="border-0 shadow-sm h-100">
    <Card.Body className="p-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className={`rounded-2 p-2 ps-3 pe-3 ${iconBg} d-flex align-items-center justify-content-center`}>
          <i className={`bi ${icon} fs-6 text-white`}></i>
        </div>
        <Card.Subtitle className="text-muted mb-0 text-uppercase fw-semibold">
          {title}
        </Card.Subtitle>
      </div>
      <h3 className={`fw-bold mb-0 fs-3 ${iconT}`}>
        {loading ? <Spinner animation="border" size="sm" /> : value}
      </h3>
    </Card.Body>
  </Card>
));

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    candidates: 0,
    tests: 0,
    hrUsers: 0
  });

  const currentDate = useMemo(() => 
    new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [candidatesRes, resultsRes, usersRes] = await Promise.all([
        getCandidates(),
        getTestResults(),
        getUsers({ is_active: true })
      ]);

      setStats({
        candidates: candidatesRes?.data?.data?.count ?? 0,
        tests: resultsRes?.data?.count ?? 0,
        hrUsers: usersRes?.data?.data?.count ?? 0
      });
    } catch (error) {
      showErrorAlert(
        error.response?.data?.message ??
        error.message ??
        "Failed to fetch dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="bg-white min-vh-75">
      <Container fluid className="py-4 px-4">
        <div className="mb-4 d-flex justify-content-between align-items-center">
          <div>
            <h4 className="fw-bold mb-1 text-dark">Admin Dashboard</h4>
            <p className="text-muted mb-0 fs-6">
              {user ? `Welcome back, ${user.first_name}!` : "Welcome back!"}
            </p>
          </div>
          <div className="bg-light rounded-2 px-3 py-2 fs-6">
            <i className="bi bi-calendar3 me-2 text-muted"></i>
            <span className="fw-semibold text-dark">{currentDate}</span>
          </div>
        </div>

        <Row className="g-3 mb-4">
          <Col lg={4} md={6}>
            <StatCard
              title="Total Candidates"
              value={stats.candidates}
              loading={loading}
              icon="bi-people-fill"
              iconBg="bg-primary"
              iconT="text-primary"
            />
          </Col>
          <Col lg={4} md={6}>
            <StatCard
              title="Completed Tests"
              value={stats.tests}
              loading={loading}
              icon="bi-check-circle-fill"
              iconBg="bg-success"
              iconT="text-success"
            />
          </Col>
          <Col lg={4} md={6}>
            <StatCard
              title="Active HR Users"
              value={stats.hrUsers}
              loading={loading}
              icon="bi-person-badge-fill"
              iconBg="bg-info"
              iconT="text-info"
            />
          </Col>
        </Row>

        <Row className="g-3 mb-4">
          <Col xs={12}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-3">
                <h6 className="fw-bold mb-3 fs-6">
                  <i className="bi bi-lightning-charge-fill text-warning me-2 fs-5"></i>
                  Quick Actions
                </h6>
                <Row className="g-2">
                  <Col lg={3} md={6}>
                    <Button variant="outline-primary" size="sm" className="w-100 py-2 fs-6" onClick={() => navigate("/hr/candidates")}>
                      <i className="bi bi-person-plus-fill me-2"></i> Add Candidate
                    </Button>
                  </Col>
                  <Col lg={3} md={6}>
                    <Button variant="outline-success" size="sm" className="w-100 py-2 fs-6" onClick={() => navigate("/hr/results")}>
                      <i className="bi bi-file-earmark-text-fill me-2"></i> View Results
                    </Button>
                  </Col>
                  <Col lg={3} md={6}>
                    <Button variant="outline-info" size="sm" className="w-100 py-2 fs-6" onClick={() => navigate("/hr/users")}>
                      <i className="bi bi-link-45deg me-2"></i> User Management
                    </Button>
                  </Col>
                  <Col lg={3} md={6}>
                    <Button variant="outline-warning" size="sm" className="w-100 py-2 fs-6" onClick={() => navigate("/hr/questions")}>
                      <i className="bi bi-gear-fill me-2"></i> Manage Questions
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-3">
          <Col lg={6}>
            <Card className="border-0 shadow-sm h-100 bg-primary text-white">
              <Card.Body className="p-3">
                <div className="d-flex align-items-center mb-3">
                  <div className="rounded-2 p-2 bg-white bg-opacity-25 d-flex align-items-center justify-content-center w-h-40">
                    <i className="bi bi-person-lines-fill fs-5"></i>
                  </div>
                  <h5 className="fw-bold mb-0 ms-3 fs-5">Candidate Management</h5>
                </div>
                <p className="mb-3 opacity-90 fs-6">
                  Comprehensive candidate lifecycle management with test link generation, result tracking, profile updates, and detailed journey monitoring capabilities.
                </p>
                <div className="mb-3">
                  <Row className="g-2">
                    <Col xs={6}>
                      <div className="bg-white bg-opacity-25 rounded-2 p-2 text-center small">
                        <i className="bi bi-person-check-fill d-block mb-1 fs-6"></i>
                        <small className="d-block fw-semibold">Add Records</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="bg-white bg-opacity-25 rounded-2 p-2 text-center small">
                        <i className="bi bi-link-45deg d-block mb-1 fs-6"></i>
                        <small className="d-block fw-semibold small">Test Links</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="bg-white bg-opacity-25 rounded-2 p-2 text-center small">
                        <i className="bi bi-arrow-clockwise d-block mb-1 fs-6"></i>
                        <small className="d-block fw-semibold">Reset Results</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="bg-white bg-opacity-25 rounded-2 p-2 text-center small">
                        <i className="bi bi-graph-up d-block mb-1 fs-6"></i>
                        <small className="d-block fw-semibold">Track Journey</small>
                      </div>
                    </Col>
                  </Row>
                </div>
                <Button variant="light" size="sm" className="w-100 fw-semibold" onClick={() => navigate("/hr/candidates")}>
                  Access Candidate Module
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card className="border-0 shadow-sm h-100 bg-info text-white">
              <Card.Body className="p-3">
                <div className="d-flex align-items-center mb-3">
                  <div className="rounded-2 p-2 bg-white bg-opacity-25 d-flex align-items-center justify-content-center w-h-40">
                    <i className="bi bi-bar-chart-line-fill fs-5"></i>
                  </div>
                  <h5 className="fw-bold mb-0 ms-3 fs-5">Test & Analytics</h5>
                </div>
                <p className="mb-3 opacity-90 fs-6">
                  Real-time test monitoring dashboard with completion tracking, comprehensive result analysis, and advanced evaluation progress metrics.
                </p>
                <div className="mb-3">
                  <Row className="g-2">
                    <Col xs={6}>
                      <div className="bg-white bg-opacity-25 rounded-2 p-2 text-center small">
                        <i className="bi bi-speedometer2 d-block mb-1 fs-6"></i>
                        <small className="d-block fw-semibold">Monitor Tests</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="bg-white bg-opacity-25 rounded-2 p-2 text-center small">
                        <i className="bi bi-check2-circle d-block mb-1 fs-6"></i>
                        <small className="d-block fw-semibold">Track Progress</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="bg-white bg-opacity-25 rounded-2 p-2 text-center small">
                        <i className="bi bi-clipboard-data d-block mb-1 fs-6"></i>
                        <small className="d-block fw-semibold">View Results</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="bg-white bg-opacity-25 rounded-2 p-2 text-center small">
                        <i className="bi bi-pie-chart-fill d-block mb-1 fs-6"></i>
                        <small className="d-block fw-semibold">Analyze Data</small>
                      </div>
                    </Col>
                  </Row>
                </div>
                <Button variant="light" size="sm" className="w-100 fw-semibold" onClick={() => navigate("/hr/results")}>
                  Access Test Analytics
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;