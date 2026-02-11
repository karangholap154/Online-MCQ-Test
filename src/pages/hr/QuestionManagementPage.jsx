import React, { useEffect, useState, useMemo, useCallback } from "react";
import QuestionCreateModal from "../../components/hr/QuestionCreateModel";
import DataTable from "react-data-table-component";
import { getAllQuestions, createQuestion, updateQuestion, deleteQuestion } from "../../api/question";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Search, X } from "lucide-react";
import { showConfirmationDialog, showErrorAlert, showSuccessAlert } from "../../utils/swal";
import { showErrorToast, showSuccessToast } from "../../utils/swalToast";

const RealDataTable = DataTable.default;

// Helper to parse options from JSON
const parseOptions = (options) => {
  if (!options) return [];
  if (typeof options === "string") {
    try {
      return Object.values(JSON.parse(options));
    } catch {
      return [];
    }
  }
  if (typeof options === "object" && !Array.isArray(options)) {
    return Object.values(options);
  }
  return options;
};

// Helper to format question type
const normalizeType = (type) => {
  if (!type) return "Single";
  const lower = type.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

const tableStyle = {
  headCells: {
    style: {
      fontWeight: "700",
      fontSize: "13px",
      textTransform: "uppercase",
      color: "var(--bs-gray-700)",
      backgroundColor: "var(--bs-gray-100)",
    },
  },
  rows: {
    style: {
      fontSize: "14px",
      minHeight: "70px",
      "&:hover": {
        backgroundColor: "var(--bs-light) !important",
        transition: "0.2s ease",
      },
    },
  },
};

const QuestionManagementPage = () => {
  // ===== STATE =====
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [showModel, setShowModel] = useState(false);
  const [mode, setMode] = useState("CREATE");
  const [editData, setEditData] = useState(null);

  // ===== ROLE BASED ACCESS CONTROL =====
  const currentUser = JSON.parse(localStorage.getItem("user")) || {};
  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  // ===== FETCH QUESTIONS =====
const transformQuestionData = (data) => {
  return data.map((q) => {
    const options = parseOptions(q.options_json);
    return {
      id: q.id,
      question: q.text,
      question_type: normalizeType(q.question_type),
      is_active: Boolean(q.is_active),
      answers: options.map((opt, idx) => ({
        id: idx,
        answer: opt,
        is_correct: q.correct_options?.includes(idx) || idx === q.correct_option,
      })),
    };
  });
};

const fetchQuestions = useCallback(async () => {
  setLoading(true);
  try {
    const res = await getAllQuestions({
      page: currentPage,
      page_size: perPage,
      search: debouncedSearch
    });

    const results = res?.data?.results;
    
    if (results?.status === "success" && Array.isArray(results.data)) {
      setQuestions(transformQuestionData(results.data));
      setTotalRows(res.data.count || 0);
    } else {
      setQuestions([]);
      setTotalRows(0);
    }
  } catch (error) {
    showErrorAlert("Failed to fetch questions.");
  } finally {
    setLoading(false);
  }
}, [currentPage, perPage, debouncedSearch]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // ===== SEARCH DEBOUNCE =====
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 600);
    return () => clearTimeout(timer);
  }, [search]);

  // ===== ACTION HANDLERS =====
  const handleSaveQuestion = async (formData) => {
    try {
      setLoading(true);
      const alphabet = "abcdefghijklmnopqrstuvwxyz";
      const formattedOptions = (formData.answers || []).map((ans, index) => ({
        [alphabet[index]]: ans.answer,
        correct: ans.is_correct,
      }));

      const apiPayload = {
        question: formData.question,
        question_type: normalizeType(formData.question_type),
        options: formattedOptions,
        is_active: true,
      };

      let res = mode === "CREATE"
        ? await createQuestion(apiPayload)
        : await updateQuestion(editData.id, apiPayload);

      if (res?.status === 200 || res?.status === 201) {
        showSuccessAlert(`Question ${mode === "CREATE" ? "created" : "updated"} successfully`);
        fetchQuestions();
        setShowModel(false);
      }
    } catch (error) {
      showErrorAlert("Failed to save question");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = useCallback((row) => {
    if (!isAdmin) return;
    const newStatus = !row.is_active;

    updateQuestion(row.id, { is_active: newStatus })
      .then(() => {
        setQuestions(prev => prev.map(q => q.id === row.id ? { ...q, is_active: newStatus } : q));
        showSuccessToast(`Status updated successfully`);
      })
      .catch(() => {
        showErrorToast("Failed to update status");
      });
  }, [isAdmin]);

  const handleDelete = useCallback((id) => {
    if (!isAdmin) return;

    showConfirmationDialog("This action cannot be undone!")
      .then((result) => {
        if (result.isConfirmed) return deleteQuestion(id);
      })
      .then((res) => {
        if (res) { // Only runs if deleteQuestion was actually called
          fetchQuestions();
          showSuccessAlert("Deleted successfully");
        }
      })
      .catch(() => showErrorAlert("Delete failed"));
  }, [isAdmin, fetchQuestions]);

  // ===== COLUMNS =====
  const columns = useMemo(() => [
    {
      name: "Sr.No",
      selector: (row, index) => (currentPage - 1) * perPage + index + 1,
      width: "80px",
      center: true,
    },
    {
      name: "Question Content",
      selector: (row) => row.question,
      sortable: true,
      wrap: true,
      grow: 3,
    },
    {
      name: "Type",
      center: true,
      width: "120px",
      cell: (row) => (
        <span className={`badge rounded-pill px-3 py-2 ${row.question_type === "Multiple" ? "bg-primary-subtle text-primary border border-primary-subtle" : "bg-info-subtle text-info border border-info-subtle"}`}>
          {row.question_type}
        </span>
      ),
    },
    {
      name: "Actions",
      width: "200px",
      center: true,
      cell: (row) => {
        const tooltipText = !isAdmin ? "Admin Access Only" : "";

        return (
          <div className="d-flex align-items-center justify-content-center gap-4">

            {/* Toggle Switch */}
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip>
                  {tooltipText || (row.is_active ? "Deactivate" : "Activate")}
                </Tooltip>
              }
            >
              <span className="d-inline-block">
                <label
                  className={`status-wrapper-label ${isAdmin ? "opacity-100" : "opacity-50 pe-none"}`}
                  style={{ cursor: isAdmin ? "pointer" : "not-allowed" }}
                >
                  <input
                    type="checkbox"
                    className="status-toggle"
                    checked={row.is_active}
                    onChange={() => toggleStatus(row)}
                    disabled={!isAdmin}
                  />
                  <span className="status-wrapper"></span>
                </label>
              </span>
            </OverlayTrigger>

            {/* Edit Button */}
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>{tooltipText || "Edit Question"}</Tooltip>}
            >
              <span className="d-inline-block">
                <button
                  className={`btn text-secondary border-0 p-0 ${!isAdmin ? "opacity-50" : ""}`}
                  onClick={() => {
                    setMode("EDIT");
                    setEditData(row);
                    setShowModel(true);
                  }}
                  disabled={!isAdmin}
                >
                  <i className="bi bi-pencil-square fs-5"></i>
                </button>
              </span>
            </OverlayTrigger>

            {/* Delete Button */}
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>{tooltipText || "Delete Question"}</Tooltip>}
            >
              <span className="d-inline-block">
                <button
                  className={`btn text-danger border-0 p-0 ${!isAdmin ? "opacity-50" : ""}`}
                  onClick={() => handleDelete(row.id)}
                  disabled={!isAdmin}
                >
                  <i className="bi bi-trash3 fs-5"></i>
                </button>
              </span>
            </OverlayTrigger>

          </div>
        );
      },

    },
  ], [currentPage, perPage, isAdmin, toggleStatus, handleDelete]);

  return (
    <div className="bg-light min-vh-100 p-3">
      <div className="container-fluid">
        <div className="card border-0 shadow-sm overflow-hidden">
          {/* HEADER */}
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0 fw-bold">Question Bank</h5>
              <small className="text-muted">Manage your assessment questions</small>
            </div>
            {/* Create button enabled for HR and Admin */}
            <button
              className="btn btn-primary d-flex align-items-center gap-2 px-4"
              onClick={() => { setMode("CREATE"); setEditData(null); setShowModel(true); }}
            >
              <i className="bi bi-plus-lg"></i>
              <span>Create Question</span>
            </button>
          </div>

          {/* SEARCH BAR */}
          <div className="card-body bg-white border-bottom py-2">
            <div className="input-group bg-light border-0 rounded">
              <span className="input-group-text bg-transparent border-0">
                <Search size={16} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control bg-transparent border-0 shadow-none"
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="btn border-0" onClick={() => setSearch("")}>
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* DATA TABLE */}
          <div className="card-body p-0">
            <RealDataTable
              columns={columns}
              data={questions}
              progressPending={loading}
              pagination
              paginationServer
              paginationTotalRows={totalRows}
              paginationDefaultPage={currentPage}
              paginationRowsPerPageOptions={[10, 15, 20, 25, 30, 50]}
              onChangePage={(page) => setCurrentPage(page)}
              onChangeRowsPerPage={(newSize) => { setPerPage(newSize); setCurrentPage(1); }}
              highlightOnHover
              customStyles={tableStyle}
            />
          </div>
        </div>
      </div>

      <QuestionCreateModal
        show={showModel}
        onHide={() => setShowModel(false)}
        onSave={handleSaveQuestion}
        mode={mode}
        editData={editData}
      />
    </div>
  );
};

export default QuestionManagementPage;