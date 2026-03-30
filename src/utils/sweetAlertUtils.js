import Swal from 'sweetalert2';

// Success Alert
export const showSuccessAlert = (title = 'Success', message = '', icon = 'success') => {
  return Swal.fire({
    icon: icon,
    title: title,
    text: message,
    confirmButtonColor: '#10b981',
    confirmButtonText: 'OK',
    allowOutsideClick: false,
    allowEscapeKey: true
  });
};

// Error Alert
export const showErrorAlert = (title = 'Error', message = 'Something went wrong', icon = 'error') => {
  return Swal.fire({
    icon: icon,
    title: title,
    text: message,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'OK',
    allowOutsideClick: false,
    allowEscapeKey: true
  });
};

// Warning Alert
export const showWarningAlert = (title = 'Warning', message = '') => {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: message,
    confirmButtonColor: '#f59e0b',
    confirmButtonText: 'OK',
    allowOutsideClick: false,
    allowEscapeKey: true
  });
};

// Info Alert
export const showInfoAlert = (title = 'Info', message = '') => {
  return Swal.fire({
    icon: 'info',
    title: title,
    text: message,
    confirmButtonColor: '#3b82f6',
    confirmButtonText: 'OK',
    allowOutsideClick: false,
    allowEscapeKey: true
  });
};

// Confirmation Dialog
export const showConfirmAlert = (title = 'Confirm', message = '', confirmButtonText = 'Yes', cancelButtonText = 'No') => {
  return Swal.fire({
    icon: 'question',
    title: title,
    text: message,
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280',
    confirmButtonText: confirmButtonText,
    cancelButtonText: cancelButtonText,
    allowOutsideClick: false,
    allowEscapeKey: true
  }).then((result) => result.isConfirmed);
};

// Delete Confirmation Dialog
export const showDeleteAlert = (itemName = 'this item') => {
  return Swal.fire({
    icon: 'warning',
    title: 'Delete Confirmation',
    text: `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    allowOutsideClick: false,
    allowEscapeKey: true
  }).then((result) => result.isConfirmed);
};

// Approval Confirmation Dialog
export const showApprovalAlert = (itemName = 'this request') => {
  return Swal.fire({
    icon: 'question',
    title: 'Approve Request',
    text: `Are you sure you want to approve ${itemName}?`,
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Approve',
    cancelButtonText: 'Cancel',
    allowOutsideClick: false,
    allowEscapeKey: true
  }).then((result) => result.isConfirmed);
};

// Rejection Confirmation Dialog
export const showRejectionAlert = (itemName = 'this request') => {
  return Swal.fire({
    icon: 'question',
    title: 'Reject Request',
    text: `Are you sure you want to reject ${itemName}?`,
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Reject',
    cancelButtonText: 'Cancel',
    allowOutsideClick: false,
    allowEscapeKey: true
  }).then((result) => result.isConfirmed);
};

// Loading Alert (for async operations)
export const showLoadingAlert = (title = 'Processing', message = 'Please wait...') => {
  return Swal.fire({
    icon: 'info',
    title: title,
    text: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

// Close Loading Alert
export const closeLoadingAlert = () => {
  Swal.close();
};

// Toast Notification (for quick notifications)
export const showToast = (message = '', type = 'info', position = 'top-end') => {
  const Toast = Swal.mixin({
    toast: true,
    position: position,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  Toast.fire({
    icon: type,
    title: message
  });
};

// Custom HTML Alert
export const showCustomAlert = (title = '', htmlContent = '', options = {}) => {
  return Swal.fire({
    title: title,
    html: htmlContent,
    confirmButtonColor: '#10b981',
    confirmButtonText: 'OK',
    allowOutsideClick: false,
    allowEscapeKey: true,
    ...options
  });
};

// Input Confirmation Dialog
export const showInputAlert = (title = 'Input Required', label = '', placeholder = '', required = false) => {
  return Swal.fire({
    title: title,
    input: 'textarea',
    inputLabel: label,
    inputPlaceholder: placeholder,
    inputAttributes: {
      'aria-label': label,
      required: required
    },
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Submit',
    cancelButtonText: 'Cancel',
    allowOutsideClick: false,
    allowEscapeKey: true,
    inputValidator: (value) => {
      if (required && !value) {
        return `${label} is required!`;
      }
    }
  });
};

// Confirm with Input (for remarks, reasons, etc.)
export const showConfirmWithRemarksAlert = (title = 'Confirm', message = '', label = 'Remarks', placeholder = 'Enter your remarks...') => {
  return Swal.fire({
    title: title,
    html: `<p style="margin-bottom: 15px;">${message}</p>`,
    input: 'textarea',
    inputLabel: label,
    inputPlaceholder: placeholder,
    inputAttributes: {
      'aria-label': label
    },
    showCancelButton: true,
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    allowOutsideClick: false,
    allowEscapeKey: true,
    preConfirm: (value) => {
      return value;
    }
  });
};
