import Swal from "sweetalert2";

// success alert
export const showSuccessAlert = (message) => {
  Swal.fire({
    icon: "success",
    title: "Success",
    text: message,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });
};

// error alert
export const showErrorAlert = (message) => {
  Swal.fire({
    icon: "error", 
    title: "Error",
    text: message,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });
};

// warning alert
export const showWarningAlert = (message) => {
  Swal.fire({
    icon: "warning",
    title: "Warning",
    text: message,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });
};

// confirmation dialog
export const showConfirmationDialog = (message) => {
  return Swal.fire({
    title: "Are you sure?",
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
  });
};