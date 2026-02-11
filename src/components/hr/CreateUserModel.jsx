import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { showWarningAlert } from "../../utils/swal";

const nameRegex = /^[A-Za-z]+$/;

const initialForm = {
  id: null,
  first_name: "",
  last_name: "",
  email: "",
  role: "HR",
  password: "",
};

const validatePassword = (password) => {
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  if (/\s/.test(password)) {
    return "Password must not contain spaces.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter.";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must include at least one lowercase letter.";
  }

  if (!/\d/.test(password)) {
    return "Password must include at least one number.";
  }

  if (!/[^A-Za-z\d\s]/.test(password)) {
    return "Password must include at least one special character.";
  }

  return null;
};

const CreateUserModal = ({
  show,
  onHide,
  onCreate,
  loggedInUserRole,
  isEdit = false,
  userData = null,
}) => {
  const [formData, setFormData] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const roles = ["Admin", "HR"];

  useEffect(() => {
    if (isEdit && userData) {
      setFormData({
        ...userData,
        role: userData.role?.toUpperCase(),
        password: "",
      });
    } else if (show) {
      setFormData(initialForm);
      setShowPassword(false);
    }
  }, [isEdit, userData, show]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.first_name || !formData.email) {
      showWarningAlert("Please fill all required fields");
      return;
    }

    if (!nameRegex.test(formData.first_name.trim())) {
      showWarningAlert("First name must contain only letters");
      return;
    }

    // Last name validation
    if (formData.last_name && !nameRegex.test(formData.last_name.trim())) {
      showWarningAlert("Last name must contain only letters");
      return;
    }

    if (!isEdit) {
      if (!formData.password) {
        showWarningAlert("Please provide a password for the new user");
        return;
      }

      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        showWarningAlert(passwordError);
        return;
      }
    }
    onCreate(formData);
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i
            className={`bi ${isEdit ? "bi-pencil-square" : "bi-person-plus"
              } me-2`}
          />
          {isEdit ? "Edit User" : "Create New User"}
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
              />
            </div>

            <div className="col">
              <label className="form-label">Last Name</label>
              <input
                className="form-control"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">
              Email <span className="text-danger">*</span>
            </label>
            <input
              className="form-control"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Role *</label>
            <select
              className="form-select"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loggedInUserRole?.toLowerCase() !== "admin"}
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {!isEdit && (
            <div className="mb-3">
              <label className="form-label">
                Password <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <input
                  className="form-control"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i
                    className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                  ></i>
                </button>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {isEdit ? "Update User" : "Create User"}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default CreateUserModal;
