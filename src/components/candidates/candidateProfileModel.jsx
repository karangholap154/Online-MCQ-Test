import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const CandidateProfileModal = ({ show, onHide, candidate }) => {
  if (!candidate) return null;

  const fullName = `${candidate.first_name} ${candidate.last_name}`;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Candidate Profile</Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center">
        <div
          className="mx-auto mb-3 d-flex align-items-center justify-content-center"
          style={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            background: "#f1f3f5",
            fontSize: 28,
            fontWeight: 600,
            color: "#0d6efd",
          }}
        >
          {candidate.first_name.charAt(0)}
        </div>

        <h5 className="mb-1">{fullName}</h5>
        <p className="text-muted">{candidate.email}</p>

        <hr />

        <div className="row">
          <div className="col">
            <div className="fw-bold text-secondary">SCORE</div>
            <div className="fs-5">
              {candidate.score} / {candidate.total}
            </div>
          </div>

          <div className="col border-start">
            <div className="fw-bold text-secondary">RESULT</div>
            <div
              className={`fs-5 fw-bold ${candidate.score >= candidate.total / 2
                ? "text-success"
                : "text-danger"
                }`}
            >
              {candidate.score >= candidate.total / 2
                ? "QUALIFIED"
                : "FAILED"}
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="justify-content-center">
        <Button variant="dark" className="rounded-pill px-4" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CandidateProfileModal;