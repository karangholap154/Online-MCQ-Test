import { useEffect, useState, useMemo, useCallback } from "react";
import DataTable from "react-data-table-component";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Search, FileSpreadsheet, FileText, Calendar, X } from "lucide-react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import "../../theme.css";
import CandidateProfileModal from "../../components/candidates/candidateProfileModel";
import { getTestResults } from "../../api/results";
import { showErrorAlert } from "../../utils/swal";

const RealDataTable = DataTable.default;

//Helpers
const isQualified = (score, total) => score >= total / 2;

const getPercentage = (score, total) =>
  total ? Math.round((score / total) * 100) : 0;

const CandidateResult = () => {
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  //Filter Status
  const [search, setSearch] = useState("");
  const [debounceSearch, setDebounceSearch] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  //UI Status
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  //Data States
  const [tableData, setTableData] = useState([]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  //Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceSearch(search);
      setCurrentPage(1);
    }, 800);
    return () => clearTimeout(timer);
  }, [search]);

  //Fetch Results
  const loadResults = useCallback(
    (page = 1, limit = 10, searchValue = "", date = "") => {
      setLoading(true);

      const params = {
        page,
        page_size: limit,
        ...(searchValue && { search: searchValue }),
        ...(date && { date_from: date, date_to: date }),
      };
      getTestResults(params)
        .then((res) => {
          const apiData = res?.data?.results?.data || [];

          const normalizedData = apiData.map((item) => {
            const fullName = item.candidate_name || "-";
            const [first_name, ...last] = fullName.split(" ");
            return {
              id: item.id,
              first_name,
              last_name: last.join(" "),
              email: item.candidate_email,
              score: item.score,
              total: item.total,
              submitted_at: item.submitted_at,
            };
          });

          setTableData(normalizedData);
          setTotalRows(res?.data?.count || 0);
        })
        .catch((error) => {
          showErrorAlert(
            error?.response?.data?.errors?.detail ??
              error?.response?.data?.message ??
              "Failed to fetch candidate results"
          );
        })
        .finally(() => setLoading(false));
    },
    []
  );

  //Triggers the fetch
  useEffect(() => {
    loadResults(currentPage, perPage, debounceSearch, selectedDate);
  }, [currentPage, perPage, debounceSearch, selectedDate, loadResults]);

  const handleViewCandidate = (row) => {
    setSelectedCandidate(row);
    setShowModal(true);
  };

  //React Data Table
  const columns = useMemo(
    () => [
      {
        name: "Sr.No",
        center: true,
        selector: (_, index) => (currentPage - 1) * perPage + index + 1,
      },
      {
        name: "Full Name",
        selector: (row) => `${row.first_name} ${row.last_name}`.trim() || "—",
        sortable: true,
      },
      {
        name: "Email",
        selector: (row) => row.email,
        sortable: true,
        cell: (row) => (
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip
                id={`tooltip-email-${row.id}`}
                className=" text-nowrap px-2"
              >
                {row.email}
              </Tooltip>
            }
          >
            <div className="text-truncate cursor-pointer">{row.email}</div>
          </OverlayTrigger>
        ),
      },
      {
        name: "Score Performance",
        sortable: true,
        selector: (row) => row.score,
        cell: (row) => (
          <div className="w-100 me-2">
            <div className="d-flex justify-content-between mb-1 small">
              <span>{getPercentage(row.score, row.total)}%</span>
              <span className="text-muted">
                ({row.score} / {row.total})
              </span>
            </div>
            <div className="progress vh-25" >
              <div
                className={`progress-bar ${
                  isQualified(row.score, row.total) ? "bg-success" : "bg-danger"
                }`}
                style={{ width: `${getPercentage(row.score, row.total)}%` }}
              ></div>
            </div>
          </div>
        ),
      },
      {
        name: "Status",
        center: true,
        cell: (row) =>
          isQualified(row.score, row.total) ? (
            <span className="badge bg-success px-3 py-2">Qualified</span>
          ) : (
            <span className="badge bg-danger px-3 py-2">Disqualified</span>
          ),
      },
      {
        id: "submitted_at_col",
        name: "Submitted At",
        selector: (row) => row.submitted_at,
        format: (row) =>
          row.submitted_at ? new Date(row.submitted_at).toLocaleString() : "—",
        sortable: true,
      },
      {
        name: "Actions",
        width: "100px",
        center: true,
        cell: (row) => (
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id={`tooltip-view-${row.id}`}>View Result</Tooltip>
            }
          >
            <button
              className="btn text-info border-0 fs-5"
              onClick={() => handleViewCandidate(row)}
            >
              <i className="bi bi-eye"></i>
            </button>
          </OverlayTrigger>
        ),
      },
    ],
    [currentPage, perPage]
  );

  //Export pdf/excel functions
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(wb, "Candidate_Results.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Examination Results Summary", 14, 15);
    const tableRows = tableData.map((r) => [
      `${r.first_name} ${r.last_name}`,
      r.email,
      `${r.score}/${r.total}`,
      isQualified(r.score, r.total) ? "Qualified" : "Disqualified",
      r.submitted_at ? new Date(r.submitted_at).toLocaleString() : "—",
    ]);
    autoTable(doc, {
      head: [["Name", "Email", "Score", "Status", "Submitted At"]],
      body: tableRows,
      startY: 25,
    });
    doc.save("Candidate_Results.pdf");
  };

  //Render
  return (
    <div className="p-1 bg-light">
      <div className="container-fluid">
        <div className="card border-0 shadow-sm rounded-3">
          <div className="row align-items-end mb-4 pt-3">
            <div className="col-md-6">
              <h5 className="fw-bold text-dark mb-1 ms-3">Candidate Results</h5>
            </div>
            <div className="col-md-6 text-md-end mt-3 mt-md-0">
              <div className="btn-group shadow-sm me-3">
                <button
                  className="btn btn-white border bg-white"
                  onClick={exportExcel}
                >
                  <FileSpreadsheet size={18} className="me-2 text-success" />{" "}
                  Excel
                </button>
                <button
                  className="btn btn-white border bg-white"
                  onClick={exportPDF}
                >
                  <FileText size={18} className="me-2 text-danger" /> PDF
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card border-0 shadow-sm overflow-hidden">
            <div className="card-header bg-white border-bottom py-3">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="input-group">
                    <span className="input-group-text  border-end-0">
                      <Search size={18} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name or email address..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                      <button
                        className="btn border border-start-0 text-muted"
                        onClick={() => setSearch("")}
                      >
                        <X size={17} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="d-flex gap-2 align-items-center">
                    <div className="input-group flex-grow-1">
                      <span className="input-group-text bg-light border-end-0">
                        <Calendar size={16} className="text-muted" />
                      </span>
                      <input
                        type="date"
                        className="form-control bg-light"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                    {selectedDate && (
                      <button
                        className="btn btn-light border"
                        onClick={() => setSelectedDate("")}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body p-0 table-responsive">
              <RealDataTable
                columns={columns}
                data={tableData}
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                onChangePage={handlePageChange}
                onChangeRowsPerPage={handlePerPageChange}
                progressPending={loading}
                highlightOnHover
                responsive
                customStyles={tableStyle}
              />
            </div>
          </div>
        </div>
      </div>

      <CandidateProfileModal
        show={showModal}
        onHide={() => setShowModal(false)}
        candidate={selectedCandidate}
      />
    </div>
  );
};

//table styles
const tableStyle = {
  headCells: {
    style: {
      backgroundColor: "#f8f9fa",
      fontWeight: "700",
      fontSize: "13px",
      textTransform: "uppercase",
    },
  },
  rows: {
    style: {
      fontSize: "14px",
      minHeight: "65px",
      borderBottomColor: "#f1f5f9",
      "&:hover": {
        backgroundColor: "#f8fafc",
      },
    },
  },
};

export default CandidateResult;



