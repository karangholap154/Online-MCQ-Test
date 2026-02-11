import { useState, useEffect, useCallback, useMemo } from "react";
import DataTable from "react-data-table-component";
import CreateUserModal from "../../components/hr/CreateUserModel.jsx";
import {
  getUsers,
  updateUser,
  createUser,
  updateStatus,
  deleteUser,
} from "../../api/hrUsers.js";
import "../../theme.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Search, UserRoundPlus, X } from "lucide-react";
import {
  showConfirmationDialog,
  showErrorAlert,
  showSuccessAlert,
  showWarningAlert,
} from "../../utils/swal.js";
import { showErrorToast, showSuccessToast } from "../../utils/swalToast.js";

const RealDataTable = DataTable.default;

const UserManagement = () => {
  // Table data Status
  const [users, setUsers] = useState([]);

  // Search Input Value Status
  const [search, setSearch] = useState("");

  //Debounced Search States to avoid the multiple api calls
  const [debouncedSearch, setDebouncedSearch] = useState("");

  //Global data loading states
  const [loading, setLoading] = useState(false);

  //ModalControls States
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  //   Current User role check
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || { role: "hr" };
    } catch {
      return { role: "hr" };
    }
  }, []);

  // role based access check
  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 1000);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch User (Api)
  const fetchUsers = useCallback(
    (page = currentPage, limit = perPage, searchText = debouncedSearch) => {
      setLoading(true);

      const params = {
        page,
        pageSize: limit,
        ...(searchText && { search: searchText }),
      };
      getUsers(params)
        .then((res) => {
          const list = res?.data?.data?.results ?? [];
          //normalizing the data for ui usage
          const normalized = list.map((u) => ({
            ...u,
            role: u.role?.toUpperCase(),
            is_active: Boolean(u.is_active),
          }));
          setUsers(normalized);
          setTotalRows(Number(res?.data?.data?.count ?? 0));
        })
        .catch((error) => {
          showErrorAlert(
            error.response?.data?.errors?.detail ??
              error.response?.data?.message ??
              "Failed to load users",
          );
        })
        .finally(() => setLoading(false));
    },
    [currentPage, perPage, debouncedSearch],
  );

  //Calls api when search or pagination changes
  useEffect(() => {
    fetchUsers(currentPage, perPage, debouncedSearch);
  }, [currentPage, perPage, debouncedSearch, fetchUsers]);

  //Edit User handler
  const handleEditClick = (user) => {
    if (!isAdmin) return;
    setSelectedUser(user);
    setIsEdit(true);
    setShowModal(true);
  };

  //  Create  Update User
  const handleCreateOrUpdateUser = (userData) => {
    setLoading(true);

    const payload = isEdit
      ? {
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          ...(isAdmin && { role: userData.role.toLowerCase() }),
        }
      : {
          ...userData,
          role: userData.role.toLowerCase(),
        };

    const apiCall = isEdit
      ? updateUser(userData.id, payload)
      : createUser(payload);

    apiCall
      .then((res) => {
        showSuccessAlert(res?.data?.message ?? "Operation successful");
        closeModal();
        fetchUsers(currentPage, perPage, debouncedSearch);
      })
      .catch((error) => {
        showWarningAlert(
          error.response?.data?.errors?.email?.[0] ??
            error.response?.data?.message ??
            "Something went wrong",
        );
      })
      .finally(() => setLoading(false));
  };
  //Close modal and reset states.
  const closeModal = () => {
    setShowModal(false);
    setIsEdit(false);
    setSelectedUser(null);
  };

  // Delete User
  const handleDeleteUser = (id) => {
    if (!isAdmin) return;

    showConfirmationDialog("This user will be permanently deleted!")
      .then((result) => {
        if (!result.isConfirmed) return;
        return deleteUser(id);
      })
      .then((res) => {
        if (!res) return;
        showSuccessAlert(res?.data?.message ?? "user deleted successfully");
        fetchUsers(currentPage, perPage, debouncedSearch);
      })
      .catch((error) => {
        showErrorAlert(
          error.response?.data?.errors?.detail ??
            error.response?.data?.message ??
            "Failed to delete user",
        );
      });
  };

  // Toggle Status
  const toggleStatus = (id, currentStatus) => {
    if (!isAdmin) return;

    const newStatus = !currentStatus;

    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, is_active: newStatus } : u)),
    );

    updateStatus(id, { is_active: newStatus })
      .then((res) => {
        showSuccessToast(
          res?.data?.message ??
            `User ${newStatus ? "activated" : "deactivated"} successfully`,
        );
      })
      .catch((error) => {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === id ? { ...u, is_active: currentStatus } : u,
          ),
        );

        showErrorToast(
          error.response?.data?.errors?.detail ??
            error.response?.data?.message ??
            "Status update failed",
        );
      });
  };

  // Table Columns
  const columns = useMemo(
    () => [
      {
        name: "Sr.No",
        selector: (_, i) => (currentPage - 1) * perPage + i + 1,
        width: "80px",
        center: true,
      },
      {
        name: "Full Name",
        selector: (row) =>
          `${row.first_name || ""} ${row.last_name || ""}`.trim(),
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
        name: "Role",
        center: true,
        cell: (row) => (
          <span className={`badge role-${row.role?.toLowerCase()} px-3`}>
            {row.role}
          </span>
        ),
      },
      {
        name: "Actions",
        center: true,
        ignoreRowClick: true,
        cell: (row) => {
          const isInactive = !row.is_active;

          const getTooltip = (type) => {
            if (!isAdmin) return "Admin Access Only";
            if (isInactive && type !== "toggle") return "Enable user first";
            if (type === "toggle")
              return row.is_active ? "Deactivate" : "Activate";
            return `${type} User`;
          };

          return (
            <div className="d-flex align-items-center gap-2">
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>{getTooltip("toggle")}</Tooltip>}
              >
                <label
                  className={`status-wrapper-label ${
                    !isAdmin ? "disabled-op" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    className="status-toggle"
                    checked={row.is_active}
                    onChange={() => toggleStatus(row.id, row.is_active)}
                    disabled={!isAdmin}
                  />
                  <span className="status-wrapper"></span>
                </label>
              </OverlayTrigger>

              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>{getTooltip("Edit")}</Tooltip>}
              >
                <span className="d-inline-block">
                  <button
                    className={`btn btn-sm border-0 ${
                      !isAdmin || isInactive ? "text-muted" : "text-primary"
                    }`}
                    onClick={() => handleEditClick(row)}
                    disabled={!isAdmin || isInactive}
                    style={{
                      pointerEvents: !isAdmin || isInactive ? "none" : "auto",
                    }}
                  >
                    <i className="bi bi-pencil-square fs-5" />
                  </button>
                </span>
              </OverlayTrigger>

              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>{getTooltip("Delete")}</Tooltip>}
              >
                <span className="d-inline-block">
                  <button
                    className={`btn btn-sm border-0 ${
                      !isAdmin || isInactive ? "text-muted" : "text-danger"
                    }`}
                    onClick={() => handleDeleteUser(row.id)}
                    disabled={!isAdmin || isInactive}
                  >
                    <i className="bi bi-trash fs-5" />
                  </button>
                </span>
              </OverlayTrigger>
            </div>
          );
        },
      },
    ],
    [currentPage, perPage, isAdmin],
  );

  return (
    <div className="p-4 bg-light min-vh-100">
      <div className="container-fluid border-bottom">
        <div className="card border-0 shadow-sm rounded-3">
          {/*   Search - Button */}
          <div className="card-header bg-white d-flex justify-content-between align-items-center py-3 gap-3">
            <h5 className="mb-0 fw-bold text-dark text-nowrap">
              User Management
            </h5>
            {/*   Search Bar  */}
            <div className="card-body bg-white  py-3">
            <div className="input-group w-50 border rounded-2 px-2">
              <span className="input-group-text bg-transparent border-0">
                <Search size={18} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-0 shadow-none"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="btn border-0 shadow-none text-muted"
                  onClick={() => setSearch("")}
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
 
            {/*  Create Button */}
            <button
              className="btn btn-primary d-flex align-items-center gap-2 text-nowrap"
              onClick={() => {
                setIsEdit(false);
                setSelectedUser(null);
                setShowModal(true);
              }}
            >
              <UserRoundPlus size={18} /> <span>Create HR</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="card-body p-0">
            <RealDataTable
              columns={columns}
              data={users}
              progressPending={loading}
              pagination
              paginationServer
              paginationTotalRows={totalRows}
              onChangePage={(page) => setCurrentPage(page)}
              onChangeRowsPerPage={(rowsPerPage) => setPerPage(rowsPerPage)}
              highlightOnHover
              customStyles={tableStyle}
            />
          </div>
        </div>
      </div>

      <CreateUserModal
        show={showModal}
        onHide={closeModal}
        onCreate={handleCreateOrUpdateUser}
        isEdit={isEdit}
        userData={selectedUser}
        loggedInUserRole={currentUser.role}
      />
    </div>
  );
};

const tableStyle = {
  headCells: {
    style: {
      backgroundColor: "#f8f9fa",
      fontWeight: "700",
      fontSize: "13px",
      color: "#495057",
      textTransform: "uppercase",
    },
  },
  rows: {
    style: {
      minHeight: "60px",
    },
  },
};

export default UserManagement;
