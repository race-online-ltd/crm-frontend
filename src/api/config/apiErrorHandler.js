import { tokenService } from "./tokenService";

/**
 * Centralized API Error Handler
 */
export const handleApiError = (error) => {
  // Network error (no response from server)
  if (!error.response) {
    return {
      status: 0,
      message: "Network error. Please check your internet connection.",
      errors: null,
    };
  }

  const { status, data } = error.response;

  switch (status) {
    case 401:
      // Unauthorized → token expired / invalid
      tokenService.removeAccessToken();

      return {
        status,
        message: "Your session has expired. Please login again.",
        errors: null,
      };

    case 403:
      return {
        status,
        message: "You do not have permission to access this resource.",
        errors: null,
      };

    case 404:
      return {
        status,
        message: "Requested resource was not found.",
        errors: null,
      };

    case 405:
      return {
        status,
        message: "Method not allowed for this endpoint.",
        errors: null,
      };

    case 408:
      return {
        status,
        message: "Request timeout. Please try again.",
        errors: null,
      };

    case 422:
      return {
        status,
        message: data?.message || "Validation failed.",
        errors: data?.errors || null, // important for forms
      };

    case 500:
      return {
        status,
        message: "Internal server error. Please try later.",
        errors: null,
      };

    case 502:
      return {
        status,
        message: "Bad gateway. Server is unreachable.",
        errors: null,
      };

    case 503:
      return {
        status,
        message: "Service unavailable. Try again shortly.",
        errors: null,
      };

    case 504:
      return {
        status,
        message: "Gateway timeout. Server took too long to respond.",
        errors: null,
      };

    default:
      return {
        status,
        message: data?.message || "Unexpected error occurred.",
        errors: null,
      };
  }
};
