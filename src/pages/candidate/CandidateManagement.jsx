import { useState, useEffect, useMemo, useCallback } from "react";
import DataTable from "react-data-table-component";
import CandidateCreateModal from "../../components/candidates/CandidateCreateModal.jsx";
import TestGenLink from "../../components/candidates/TestGenLink.jsx";
import {
  getCandidates,
  UpdateCandidate,
  generateTestLink,
  createCandidate,
  deleteCandidate,
} from "../../api/CandidateApi.js";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Search, UserRoundPlus, X } from "lucide-react";
import { showErrorToast, showSuccessToast } from "../../utils/swalToast.js";
import { showConfirmationDialog, showErrorAlert, showSuccessAlert, showWarningAlert } from "../../utils/swal.js";
import "../../theme.css";

const RealDataTable = DataTable.default;

const CandidateManagement = () => {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Fetch Candidates with detailed error reporting
  const fetchCandidates = useCallback((page, pageSize, query) => {
    setLoading(true);

    const params = {
      page: page,
      page_size: pageSize,
      ...(query && { search: query })
    };

    getCandidates(params)
      .then((res) => {
        const data = res?.data?.data?.results;
        setCandidates(data);
        setTotalRows(res?.data?.data?.count);
      })
      .catch((error) => {
        showErrorAlert(
          error.response?.data?.errors?.detail ?? 
          "Failed to fetch candidates"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchCandidates(currentPage, perPage, debouncedSearch);
  }, [currentPage, perPage, debouncedSearch, fetchCandidates]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 1000);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const toggleStatus = (id, currentStatus) => {
    UpdateCandidate(id, { is_active: !currentStatus })
      .then((res) => {
        setCandidates((prev) =>
          prev.map((c) => (c.id === id ? { ...c, is_active: !currentStatus } : c))
        );
        showSuccessToast(res?.data?.message ?? "Status updated successfully");
      })
      .catch((error) => {
        showErrorToast(
          error.response?.data?.errors?.detail ?? 
          "Failed to update status"
        );
      });
  };

  const generateLink = (row) => {

    generateTestLink({ candidate_email: row.email })
      .then((res) => {
        const shortcode = res?.data?.data?.test_link;
        setGeneratedLink(shortcode);
        setShowGenerateModal(true);
      })
      .catch((error) => {
        showErrorAlert(
          error.response?.data?.errors?.detail ??
          "Failed to generate shortcode"
        );
      });
  };

  const handleDelete = (id, isActive) => {
    if (!isActive) return;

    showConfirmationDialog("This user will be permanently deleted!")
      .then((result) => {
        if (!result.isConfirmed) return;
        return deleteCandidate(id);
      })
      .then((res) => {
        if (res) {
          setCandidates((prev) => prev.filter((c) => c.id !== id));
          showSuccessAlert(res?.data?.message ?? "User deleted successfully");
        }
      })
      .catch((error) => {
        showErrorAlert(
          error.response?.data?.errors?.detail ?? 
          "Delete failed"
        );
      });
  };

  const handleCreateOrUpdateCandidate = (formData) => {
    const action = isEdit 
      ? UpdateCandidate(formData.id, formData) 
      : createCandidate(formData);

    action
      .then((res) => {
        showSuccessAlert(res?.data?.message ?? `Candidate ${isEdit ? 'updated' : 'created'} successfully`);
        setIsModalOpen(false);
        setIsEdit(false);
        setSelectedCandidate(null);
        fetchCandidates(currentPage, perPage, debouncedSearch);
      })
      .catch((error) => {
        showErrorAlert(
          error.response?.data?.errors?.email ?? error.response?.data?.errors?.phone_number ?? "Operation failed"
        )
      });
  };

  const columns = useMemo(() => [
    {
      name: "Sr.No",
      selector: (row, index) => (currentPage - 1) * perPage + index + 1,
      center: true,
      width: "80px",
    },
    {
      name: "Full Name",
      selector: (row) => `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() || "—",
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      cell: (row) => (
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip className="px-2" id={`tooltip-email-${row.id}`}>{row.email}</Tooltip>}
        >
          <div
            className="text-truncate"
          >
            {row.email}
          </div>
        </OverlayTrigger>
      ),
    },
    {
      name: "Mobile No",
      selector: (row) => row.phone_number ?? "—",
      center: true,
    },
    {
      name: "Attempts",
      selector: (row) => row.attempts ?? 0,
      center: true,
    },
    {
      name: "Actions",
      center: true,
      cell: (row) => {
        const disabled = !row.is_active;
        const disabledTooltip = <Tooltip>Activate candidate to perform actions</Tooltip>;
        return (
          <div className="row justify-content-center align-items-center g-3">
          {/* Switch */}
          <div className="col-auto">
            <div className="form-check form-switch">
              <input
                className={`custom-switch form-check-input cursor-pointer ${
                  row.is_active ? "bg-success border-success" : "bg-danger border-danger"
                }`}
                type="checkbox"
                role="switch"
                checked={row.is_active}
                onChange={() => toggleStatus(row.id, row.is_active)}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="col-auto">
            <div className="row g-3">
              <div className="col-auto">
                <OverlayTrigger overlay={disabled ? disabledTooltip : <Tooltip>Generate Code</Tooltip>}>
                  <span>
                    <button
                      className="btn btn-link text-success p-1"
                      disabled={disabled}
                      onClick={() => generateLink(row)}
                    >
                      <i className="bi bi-link-45deg fs-4"></i>
                    </button>
                  </span>
                </OverlayTrigger>
              </div>

              <div className="col-auto">
                <OverlayTrigger overlay={disabled ? disabledTooltip : <Tooltip>Edit</Tooltip>}>
                  <span>
                    <button
                      className="btn btn-link text-secondary p-1"
                      disabled={disabled}
                      onClick={() => {
                        setSelectedCandidate(row);
                        setIsEdit(true);
                        setIsModalOpen(true);
                      }}
                    >
                      <i className="bi bi-pencil-square fs-5"></i>
                    </button>
                  </span>
                </OverlayTrigger>
              </div>

              <div className="col-auto">
                <OverlayTrigger overlay={disabled ? disabledTooltip : <Tooltip>Delete</Tooltip>}>
                  <span>
                    <button
                      className="btn btn-link text-danger p-1"
                      disabled={disabled}
                      onClick={() => handleDelete(row.id, row.is_active)}
                    >
                      <i className="bi bi-trash fs-5"></i>
                    </button>
                  </span>
                </OverlayTrigger>
              </div>
            </div>
          </div>
        </div>
        );
      },
    }
  ], [currentPage, perPage]);

  const tableStyle = {
    headCells: {
      style: {
        backgroundColor: "#f8f9fa",
        fontWeight: "700",
        fontSize: "14px",
        textTransform: "uppercase",
      },
    },
  };

  return (
    <div className="p-1 bg-light">
      <div className="container-fluid">
        <div className="card shadow-sm border-0 rounded-3">
          <div className="card-header bg-white border-bottom py-3">
            <div className="row align-items-center">
              <div className="col">
                <h5 className="fw-bold mb-0">Candidate Management</h5>
              </div>

              <div className="col-auto">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setIsEdit(false);
                    setSelectedCandidate(null);
                    setIsModalOpen(true);
                  }}
                >
                  <UserRoundPlus size={18} className="me-2" />
                  Add Candidate
                </button>
              </div>
            </div>
          </div>

          <div className="card-header bg-white border-bottom py-3">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <Search size={18} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0 border-end-0"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="btn btn-light border border-start-0" onClick={() => setSearch("")}>
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="card-body p-0">
            <RealDataTable
              columns={columns}
              data={candidates}
              pagination
              paginationServer
              paginationTotalRows={totalRows}
              progressPending={loading}
              onChangePage={(page) => setCurrentPage(page)}
              onChangeRowsPerPage={(newPerPage) => {
                setPerPage(newPerPage);
                setCurrentPage(1);
              }}
              highlightOnHover
              customStyles={tableStyle}
            />
          </div>
        </div>

        <CandidateCreateModal
          show={isModalOpen}
          onHide={() => setIsModalOpen(false)}
          onCreate={handleCreateOrUpdateCandidate}
          isEdit={isEdit}
          candidateData={selectedCandidate}
        />

        <TestGenLink
          show={showGenerateModal}
          onHide={() => setShowGenerateModal(false)}
          link={generatedLink}
        />
      </div>
    </div>
  );
};

export default CandidateManagement;