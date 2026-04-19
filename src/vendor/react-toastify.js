import React from 'react';
import { Toaster, toast as sonnerToast } from 'sonner';

function toast(message, options) {
  return sonnerToast(message, options);
}

toast.success = (message, options) => sonnerToast.success(message, options);
toast.error = (message, options) => sonnerToast.error(message, options);
toast.info = (message, options) => sonnerToast.info(message, options);
toast.warning = (message, options) => sonnerToast.warning(message, options);
toast.dismiss = (id) => sonnerToast.dismiss(id);
toast.loading = (message, options) => sonnerToast.loading(message, options);

export function ToastContainer({ position = 'top-right', ...props }) {
  return React.createElement(Toaster, {
    position,
    richColors: true,
    closeButton: true,
    expand: true,
    duration: props.autoClose ?? 3000,
    ...props,
  });
}

export { toast };

export default toast;
