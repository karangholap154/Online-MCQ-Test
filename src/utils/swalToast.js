import Swal from "sweetalert2";

// success toast mixin
const successToast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
}); 

export const showSuccessToast = (message) => {
  successToast.fire({
    icon: "success",
    title: message,
  });
};

export const showErrorToast = (message) => {
  successToast.fire({
    icon: "error",
    title: message,
  });
};