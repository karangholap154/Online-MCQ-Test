import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { showWarningAlert } from "../../utils/swal";

const nameRegex = /^[A-Za-z]+$/;
const phoneRegex = /^[0-9]{10}$/;

const initialForm = {
  id: null,
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
};


const CandidateCreateModal = ({
  show,
  onHide,
  onCreate,
  isEdit = false,
  candidateData = null,
}) => {
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (show) {
      if (isEdit && candidateData) {
        setFormData({
          id: candidateData.id,
          first_name: candidateData.first_name ?? "",
          last_name: candidateData.last_name ?? "",
          email: candidateData.email ?? "",
          phone_number: candidateData.phone_number ?? ""
        })
      } else {
        setFormData(initialForm);
      }
    }
  }, [show, isEdit, candidateData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.email || !formData.phone_number) {
      showWarningAlert("Please fill all required fields");
      return;
    }

    if (!nameRegex.test(formData.first_name.trim())) {
      showWarningAlert("First name should contain only alphabets");
      return;
    }

    if (formData.last_name && !nameRegex.test(formData.last_name.trim())) {
      showWarningAlert("Last name should contain only alphabets");
      return;
    }

    if (!phoneRegex.test(formData.phone_number)) {
      showWarningAlert("Phone number must be exactly 10 digits");
      return;
    }

    const payload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone_number: formData.phone_number,
    };

    if (isEdit) {
      payload.id = formData.id;
    }

    onCreate(payload);
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <i
            className={`bi ${isEdit ? "bi-pencil-square" : "bi-person-plus"
              } me-2`}
          ></i>
          {isEdit ? "Edit Candidate" : "Add New Candidate"}
        </Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="row mb-3">
            <div className="col">
              <label className="form-label">
                First Name <span className="text-danger">*</span>
              </label>
              <input
                className="form-control"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Enter the first name"
              />
            </div>

            <div className="col">
              <label className="form-label">Last Name</label>
              <input
                className="form-control"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter the last name"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">
              Email <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter the email"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">
              Mobile No : <span className="text-danger">*</span>
            </label>
            <input
              type="tel"
              className="form-control"
              name="phone_number"
              value={formData.phone_number}
              onChange={(e) => {
                const mobileReg = /^[0-9\b]+$/;
                if (e.target.value === "" || mobileReg.test(e.target.value)) {
                  handleChange(e);
                }
              }}
              placeholder="Enter the mobile number"
              maxLength={10}
              minLength={10}
            />
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {isEdit ? "Update Candidate" : "Add Candidate"}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default CandidateCreateModal;