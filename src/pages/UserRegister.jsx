

// import React, { useState, useEffect } from "react";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import { ArrowLeft } from 'lucide-react'; // Added lucide icon

// // 1. IMPORT THE NEW BUTTON COMPONENT
// import Button from "../components/ui/Button"; // Assuming you save the new component as Button.jsx
// // REMOVED: import CommonButton from "../components/CommonButton";

// import { registerUser } from "../api/userApi";
// import {
//   fetchUserTypes,
//   fetchUserRoles,
//   fetchDepartments,
// } from "../api/masterDataApi";

// import { usePermissions } from '../context/PermissionContext';


// // ================================================================
// // 1. CSS for Layout and UI/UX Match
// // NOTE: This CSS aims to replicate the spacing, typography, and borders
// // achieved by the Tailwind classes in the reference component.
// // Includes the new Button component's CSS for visual reference.
// // ================================================================

// // Inject Button Component's CSS for visual correctness
// const buttonStyles = `
// .btn {
//   /* daisyUI base emulation */
//   display: inline-flex;
//   align-items: center;
//   justify-content: center;
//   cursor: pointer;
//   padding: 0 1rem;
//   min-height: 3rem;
//   font-size: 0.875rem; /* text-sm */
//   line-height: 1.25rem;
//   border-radius: 0.5rem; /* rounded-lg */
//   border-width: 1px;
//   border-style: solid;
//   transition: all 0.2s ease-in-out;
//   text-decoration: none;
//   font-weight: 600; /* font-semibold */
// }

// /* Base colors - defined for custom classes */
// :root {
//   --btn-primary: #3b82f6; /* blue-500 */
//   --btn-secondary: #f97316; /* orange-500 */
//   --btn-success: #10b981; /* emerald-500 */
//   --btn-danger: #ef4444; /* red-500 */
//   --btn-warning: #facc15; /* yellow-400 */
//   --btn-info: #06b6d4; /* cyan-500 */
//   --btn-neutral: #6b7280; /* gray-500 */
//   --base-content: #1f2937; /* gray-800 */
//   --base-100: #ffffff;
//   --base-200: #f3f4f6; /* gray-100 */
//   --base-300: #e5e7eb; /* gray-200 */
// }

// /* Variants */
// .btn--primary {
//   background-color: var(--btn-primary);
//   border-color: var(--btn-primary);
//   color: white;
// }
// .btn--primary:hover {
//   background-color: #2563eb; /* blue-600 */
//   border-color: #2563eb;
// }

// .btn--secondary {
//   /* Using neutral/subtle color for the form's secondary action (Cancel) */
//   background-color: var(--base-200);
//   border-color: var(--base-300);
//   color: var(--base-content);
// }
// .btn--secondary:hover {
//   background-color: var(--base-300); 
//   border-color: var(--base-300);
// }

// .btn--ghost {
//   background-color: transparent;
//   border-color: transparent;
//   color: var(--base-content);
// }
// .btn--ghost:hover {
//   background-color: var(--base-200);
// }

// /* Disabled */
// .btn[disabled], [aria-disabled="true"] {
//   opacity: 0.7;
//   cursor: not-allowed;
//   pointer-events: none;
// }
// /* Loading Spinner */
// .loading-spinner {
//   border: 4px solid rgba(255, 255, 255, 0.3);
//   border-top-color: #fff;
//   border-radius: 50%;
//   width: 1rem;
//   height: 1rem;
//   animation: spin 1s ease-in-out infinite;
//   display: inline-block;
// }
// @keyframes spin {
//   to {
//     transform: rotate(360deg);
//   }
// }
// `;


// const formLayoutStyles = `
// .form-container {
//     width: 100%;
//     min-height: 100vh; /* Match the full height style of the reference */
//     padding: 24px; /* p-6 */
//     background-color: #fff;
// }

// /* Header Styling */
// .form-header {
//     margin-bottom: 40px; /* mb-10 */
//     padding-bottom: 24px; /* pb-6 */
//     border-bottom: 1px solid #e5e7eb; /* border-b border-gray-200 */
//     display: flex;
//     align-items: flex-start;
//     justify-content: space-between;
// }

// .form-title-group h1 {
//     font-size: 30px; /* text-3xl */
//     font-weight: 800; /* font-extrabold */
//     color: #1f2937; /* text-gray-900 */
//     display: flex;
//     align-items: center;
// }

// .form-title-group p {
//     font-size: 14px; /* text-sm */
//     color: #6b7280; /* text-gray-500 */
//     margin-top: 4px;
//     margin-left: 40px; /* ml-10 to align with the title text */
// }

// /* Custom style for the ArrowLeft Button to align it with the text */
// .header-back-button {
//     color: #1f2937 !important; /* text-gray-900 for dark text */
//     font-size: 18px !important; /* text-lg */
//     font-weight: 600 !important; /* font-semibold */
//     margin-left: -16px; /* -ml-4 adjustment */
//     padding: 0 4px;
//     min-height: 30px;
//     line-height: 30px;
// }
// .header-back-button:hover {
//     background-color: transparent !important;
//     text-decoration: none;
// }


// /* Form Grid Layout */
// .form-grid {
//     display: grid;
//     grid-template-columns: 1fr;
//     gap: 24px 56px; /* gap-y-6 gap-x-14 */
// }

// @media (min-width: 768px) { /* md:grid-cols-2 */
//     .form-grid {
//         grid-template-columns: repeat(2, 1fr);
//     }
// }

// /* Input/Select styling for consistency */
// .form-group {
//     margin-bottom: 0 !important;
// }
// .form-control, .form-select {
//     /* Assuming bootstrap-like styles exist, just ensuring margin is 0 */
//     margin-bottom: 0 !important;
// }
// .text-danger {
//     color: var(--btn-danger);
//     font-size: 0.875rem; /* text-sm */
//     margin-top: 4px;
// }


// /* Actions Footer */
// .form-actions {
//     grid-column: 1 / -1; /* md:col-span-2 */
//     display: flex;
//     justify-content: flex-end; /* justify-end */
//     gap: 16px; /* gap-4 */
//     padding-top: 24px; /* pt-6 */
//     border-top: 1px solid #e5e7eb; /* border-t border-gray-200 */
//     margin-top: 24px; /* mt-6 */
// }
// `;
// // ================================================================


// // ================================================================
// // 2. Main Component - RegistrationForm
// // ================================================================
// const RegistrationForm = ({ onCancel }) => {
//   const permissions = usePermissions();
//   const canRegister = permissions.includes('register');

//   const [errorMessage, setErrorMessage] = useState("");
//   const [userTypes, setUserTypes] = useState([]);
//   const [roles, setRoles] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // Set up the mock onCancel function if it's not provided
//   const handleCancel = onCancel || (() => console.log("Cancel button clicked."));

//   useEffect(() => {
//     const fetchMasterData = async () => {
//       try {
//         setIsLoading(true);
//         const [userTypesData, rolesData, departmentsData] = await Promise.all([
//           fetchUserTypes(),
//           fetchUserRoles(),
//           fetchDepartments(),
//         ]);
//         setUserTypes(userTypesData);
//         setRoles(rolesData);
//         setDepartments(departmentsData);
//       } catch (error) {
//         console.error("Error fetching master data:", error);
//         setErrorMessage("Failed to load form data. Please refresh the page.");
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchMasterData();
//   }, []);

//   const validationSchema = Yup.object({
//     username: Yup.string()
//       .required("Username is required")
//       .max(100)
//       .matches(/^[A-Za-z0-9_]+$/, "Only letters, numbers, and underscores"),
//     fullname: Yup.string().required("Fullname is required").max(255),
//     mobile: Yup.string()
//       .required("Mobile number is required")
//       .matches(/^[0-9]+$/, "Mobile must be numeric"),
//     email: Yup.string().email("Invalid email").required("Email is required"),
//     dept_id: Yup.number()
//       .required("Department is required")
//       .typeError("Select a department"),
//     role_id: Yup.number()
//       .required("Role is required")
//       .typeError("Select a role"),
//     password: Yup.string()
//       .required("Password is required")
//       .min(6, "Minimum 6 characters"),
//     password_confirmation: Yup.string()
//       .required("Confirm your password")
//       .oneOf([Yup.ref("password")], "Passwords must match"),
//     user_type_id: Yup.number()
//       .required("User type is required")
//       .typeError("Select a user type"),
//   });

//   const formik = useFormik({
//     initialValues: {
//       user_type_id: "",
//       username: "",
//       fullname: "",
//       mobile: "",
//       email: "",
//       dept_id: "",
//       role_id: "",
//       password: "",
//       password_confirmation: "",
//       is_email: "0",
//       is_sms: "0",
//     },
//     validationSchema,
//     onSubmit: async (values) => {
//       try {
//         console.log("Submitting values:", values);
//         // Simulate API call delay for loading state visibility
//         await new Promise(resolve => setTimeout(resolve, 1000)); 
//         const response = { message: "User Registered Successfully!" } // await registerUser(values); 
//         if (response.message) {
//           alert(response.message);
//           formik.resetForm();
//         }
//       } catch (error) {
//         console.error("Registration failed:", error);
//         setErrorMessage("Failed to register. Try again.");
//       }
//     },
//   });

//   const handleCheckboxChange = (e) => {
//     const { name, checked } = e.target;
//     const newValue = checked ? "1" : "0";
//     formik.setFieldValue(name, newValue);
//     formik.setFieldTouched(name, true, false);
//   };

//   if (isLoading) {
//     return <div className="text-center p-4">Loading...</div>;
//   }

//   return (
//     <>
//       {/* Inject the CSS for the layout and the Button component */}
//       <style>{buttonStyles}</style>
//       <style>{formLayoutStyles}</style>

//       <div className="form-container">
//         {/* ================================================================
//             HEADER SECTION (Uses new Button component)
//             ================================================================ */}
//         <header className="form-header">
//           <div className="form-title-group">
//             <h1>
//               <Button
//                 type="button"
//                 variant="ghost" // Use the ghost variant for the back button
//                 leftIcon={ArrowLeft}
//                 onClick={handleCancel}
//                 className="header-back-button" // Custom class for final alignment
//                 aria-label="Back to list"
//               >
                
//               </Button>
//               User Registration
//             </h1>
//             <p>Register a new system user and set their initial access details.</p>
//           </div>
//         </header>

//         {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

//         {/* ================================================================
//             FORMIK FORM (Grid Layout)
//             ================================================================ */}
//         <form onSubmit={formik.handleSubmit}>
//           <div className="form-grid">
//             {/* Field Groups (Using the new form-group wrapper for correct spacing) */}
            
//             <div className="form-group">
//               <input name="username" type="text" placeholder="Username" className="form-control" {...formik.getFieldProps("username")} />
//               {formik.touched.username && formik.errors.username && (<div className="text-danger">{formik.errors.username}</div>)}
//             </div>
            
//             <div className="form-group">
//               <input name="fullname" type="text" placeholder="Full Name" className="form-control" {...formik.getFieldProps("fullname")} />
//               {formik.touched.fullname && formik.errors.fullname && (<div className="text-danger">{formik.errors.fullname}</div>)}
//             </div>
            
//             <div className="form-group">
//               <input name="mobile" type="text" placeholder="Mobile" className="form-control" {...formik.getFieldProps("mobile")} />
//               {formik.touched.mobile && formik.errors.mobile && (<div className="text-danger">{formik.errors.mobile}</div>)}
//             </div>
            
//             <div className="form-group">
//               <input name="email" type="email" placeholder="Email" className="form-control" {...formik.getFieldProps("email")} />
//               {formik.touched.email && formik.errors.email && (<div className="text-danger">{formik.errors.email}</div>)}
//             </div>
            
//             <div className="form-group">
//               <select name="dept_id" className="form-select" {...formik.getFieldProps("dept_id")}>
//                 <option value="">Select Department</option>
//                 {departments.map((dept) => (<option key={dept.id} value={dept.id}>{dept.name}</option>))}
//               </select>
//               {formik.touched.dept_id && formik.errors.dept_id && (<div className="text-danger">{formik.errors.dept_id}</div>)}
//             </div>
            
//             <div className="form-group">
//               <select name="role_id" className="form-select" {...formik.getFieldProps("role_id")}>
//                 <option value="">Select Role</option>
//                 {roles.map((role) => (<option key={role.id} value={role.id}>{role.name}</option>))}
//               </select>
//               {formik.touched.role_id && formik.errors.role_id && (<div className="text-danger">{formik.errors.role_id}</div>)}
//             </div>
            
//             <div className="form-group">
//               <input name="password" type="password" placeholder="Password" className="form-control" {...formik.getFieldProps("password")} />
//               {formik.touched.password && formik.errors.password && (<div className="text-danger">{formik.errors.password}</div>)}
//             </div>
            
//             <div className="form-group">
//               <input name="password_confirmation" type="password" placeholder="Confirm Password" className="form-control" {...formik.getFieldProps("password_confirmation")} />
//               {formik.touched.password_confirmation && formik.errors.password_confirmation && (<div className="text-danger">{formik.errors.password_confirmation}</div>)}
//             </div>
            
//             <div className="form-group">
//               <select name="user_type_id" className="form-select" {...formik.getFieldProps("user_type_id")}>
//                 <option value="">Select User Type</option>
//                 {userTypes.map((type) => (<option key={type.id} value={type.id}>{type.name}</option>))}
//               </select>
//               {formik.touched.user_type_id && formik.errors.user_type_id && (<div className="text-danger">{formik.errors.user_type_id}</div>)}
//             </div>
            
//             <div className="form-group">
//               <label className="form-label">Notifications</label>
//               <div className="form-check">
//                 <input type="checkbox" name="is_email" id="is_email" className="form-check-input" checked={formik.values.is_email === "1"} onChange={handleCheckboxChange} />
//                 <label htmlFor="is_email" className="form-check-label">Email Notifications</label>
//               </div>
//               <div className="form-check">
//                 <input type="checkbox" name="is_sms" id="is_sms" className="form-check-input" checked={formik.values.is_sms === "1"} onChange={handleCheckboxChange} />
//                 <label htmlFor="is_sms" className="form-check-label">SMS Notifications</label>
//               </div>
//             </div>
//           </div>

//           {/* ================================================================
//               ACTIONS FOOTER (Uses new Button component)
//               ================================================================ */}
//           <div className="form-actions">
//             {/* <Button
//               type="button"
//               intent="secondary" // Maps to btn--secondary (a neutral, less prominent style)
//               onClick={handleCancel}
//             >
//               Cancel
//             </Button> */}
//             {canRegister && (
//               <Button
//                 type="submit"
//                 intent="primary" // Maps to btn--primary (the main action color)
//                 loading={formik.isSubmitting}
//                 loadingText="Registering..."
//                 disabled={formik.isSubmitting || !formik.isValid}
//               >
//                 Register
//               </Button>
//             )}
//           </div>
//         </form>
//       </div>
//     </>
//   );
// };

// export default RegistrationForm;




// export default RegistrationForm;

import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ArrowLeft } from 'lucide-react'; // Added lucide icon

// 1. IMPORT THE NEW BUTTON COMPONENT
import Button from "../components/ui/Button"; // Assuming you save the new component as Button.jsx
// REMOVED: import CommonButton from "../components/CommonButton";

import { registerUser } from "../api/userApi";
import {
  fetchUserTypes,
  fetchUserRoles,
  fetchDepartments,
} from "../api/masterDataApi";

import { usePermissions } from '../context/PermissionContext';


// ================================================================
// 1. CSS for Layout and UI/UX Match
// NOTE: This CSS aims to replicate the spacing, typography, and borders
// achieved by the Tailwind classes in the reference component.
// Includes the new Button component's CSS for visual reference.
// ================================================================

// Inject Button Component's CSS for visual correctness
const buttonStyles = `
.btn {
  /* daisyUI base emulation */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0 1rem;
  min-height: 3rem;
  font-size: 0.875rem; /* text-sm */
  line-height: 1.25rem;
  border-radius: 0.5rem; /* rounded-lg */
  border-width: 1px;
  border-style: solid;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
  font-weight: 600; /* font-semibold */
}

/* Base colors - defined for custom classes */
:root {
  --btn-primary: #3b82f6; /* blue-500 */
  --btn-secondary: #f97316; /* orange-500 */
  --btn-success: #10b981; /* emerald-500 */
  --btn-danger: #ef4444; /* red-500 */
  --btn-warning: #facc15; /* yellow-400 */
  --btn-info: #06b6d4; /* cyan-500 */
  --btn-neutral: #6b7280; /* gray-500 */
  --base-content: #1f2937; /* gray-800 */
  --base-100: #ffffff;
  --base-200: #f3f4f6; /* gray-100 */
  --base-300: #e5e7eb; /* gray-200 */
}

/* Variants */
.btn--primary {
  background-color: var(--btn-primary);
  border-color: var(--btn-primary);
  color: white;
}
.btn--primary:hover {
  background-color: #2563eb; /* blue-600 */
  border-color: #2563eb;
}

.btn--secondary {
  /* Using neutral/subtle color for the form's secondary action (Cancel) */
  background-color: var(--base-200);
  border-color: var(--base-300);
  color: var(--base-content);
}
.btn--secondary:hover {
  background-color: var(--base-300); 
  border-color: var(--base-300);
}

.btn--ghost {
  background-color: transparent;
  border-color: transparent;
  color: var(--base-content);
}
.btn--ghost:hover {
  background-color: var(--base-200);
}

/* Disabled */
.btn[disabled], [aria-disabled="true"] {
  opacity: 0.7;
  cursor: not-allowed;
  pointer-events: none;
}
/* Loading Spinner */
.loading-spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  animation: spin 1s ease-in-out infinite;
  display: inline-block;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
`;


const formLayoutStyles = `
.form-container {
    width: 100%;
    min-height: 100vh; /* Match the full height style of the reference */
    padding: 24px; /* p-6 */
    background-color: #fff;
}

/* Header Styling */
.form-header {
    margin-bottom: 40px; /* mb-10 */
    padding-bottom: 24px; /* pb-6 */
    border-bottom: 1px solid #e5e7eb; /* border-b border-gray-200 */
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
}

.form-title-group h1 {
    font-size: 30px; /* text-3xl */
    font-weight: 800; /* font-extrabold */
    color: #1f2937; /* text-gray-900 */
    display: flex;
    align-items: center;
}

.form-title-group p {
    font-size: 14px; /* text-sm */
    color: #6b7280; /* text-gray-500 */
    margin-top: 4px;
    margin-left: 40px; /* ml-10 to align with the title text */
}

/* Custom style for the ArrowLeft Button to align it with the text */
.header-back-button {
    color: #1f2937 !important; /* text-gray-900 for dark text */
    font-size: 18px !important; /* text-lg */
    font-weight: 600 !important; /* font-semibold */
    margin-left: -16px; /* -ml-4 adjustment */
    padding: 0 4px;
    min-height: 30px;
    line-height: 30px;
}
.header-back-button:hover {
    background-color: transparent !important;
    text-decoration: none;
}


/* Form Grid Layout */
.form-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px 56px; /* gap-y-6 gap-x-14 */
}

@media (min-width: 768px) { /* md:grid-cols-2 */
    .form-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Input/Select styling for consistency */
.form-group {
    margin-bottom: 0 !important;
}
.form-control, .form-select {
    /* Assuming bootstrap-like styles exist, just ensuring margin is 0 */
    margin-bottom: 0 !important;
}
.text-danger {
    color: var(--btn-danger);
    font-size: 0.875rem; /* text-sm */
    margin-top: 4px;
}


/* Actions Footer */
.form-actions {
    grid-column: 1 / -1; /* md:col-span-2 */
    display: flex;
    justify-content: flex-end; /* justify-end */
    gap: 16px; /* gap-4 */
    padding-top: 24px; /* pt-6 */
    border-top: 1px solid #e5e7eb; /* border-t border-gray-200 */
    margin-top: 24px; /* mt-6 */
}
`;
// ================================================================


// ================================================================
// 2. Main Component - RegistrationForm
// ================================================================
const RegistrationForm = ({ onCancel }) => {
  const permissions = usePermissions();
  const canRegister = permissions.includes('register');

  const [errorMessage, setErrorMessage] = useState("");
  const [userTypes, setUserTypes] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Set up the mock onCancel function if it's not provided
  const handleCancel = onCancel || (() => console.log("Cancel button clicked."));

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setIsLoading(true);
        const [userTypesData, rolesData, departmentsData] = await Promise.all([
          fetchUserTypes(),
          fetchUserRoles(),
          fetchDepartments(),
        ]);
        setUserTypes(userTypesData);
        setRoles(rolesData);
        setDepartments(departmentsData);
      } catch (error) {
        console.error("Error fetching master data:", error);
        setErrorMessage("Failed to load form data. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMasterData();
  }, []);

  const validationSchema = Yup.object({
    username: Yup.string()
      .required("Username is required")
      .max(100)
      .matches(/^[A-Za-z0-9_]+$/, "Only letters, numbers, and underscores"),
    fullname: Yup.string().required("Fullname is required").max(255),
    mobile: Yup.string()
      .required("Mobile number is required")
      .matches(/^[0-9]+$/, "Mobile must be numeric"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    dept_id: Yup.number()
      .required("Department is required")
      .typeError("Select a department"),
    role_id: Yup.number()
      .required("Role is required")
      .typeError("Select a role"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Minimum 6 characters"),
    password_confirmation: Yup.string()
      .required("Confirm your password")
      .oneOf([Yup.ref("password")], "Passwords must match"),
    user_type_id: Yup.number()
      .required("User type is required")
      .typeError("Select a user type"),
  });

  const formik = useFormik({
    initialValues: {
      user_type_id: "",
      username: "",
      fullname: "",
      mobile: "",
      email: "",
      dept_id: "",
      role_id: "",
      password: "",
      password_confirmation: "",
      is_email: "0",
      is_sms: "0",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        console.log("Submitting values:", values);
        // FIXED: Actually call the API instead of mocking it
        const response = await registerUser(values);
        if (response.message) {
          alert(response.message);
          formik.resetForm();
          // Optional: Call onCancel to navigate back after successful registration
          if (onCancel) {
            onCancel();
          }
        }
      } catch (error) {
        console.error("Registration failed:", error);
        setErrorMessage(error.response?.data?.message || "Failed to register. Try again.");
      }
    },
  });

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    const newValue = checked ? "1" : "0";
    formik.setFieldValue(name, newValue);
    formik.setFieldTouched(name, true, false);
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <>
      {/* Inject the CSS for the layout and the Button component */}
      <style>{buttonStyles}</style>
      <style>{formLayoutStyles}</style>

      <div className="form-container">
        {/* ================================================================
            HEADER SECTION (Uses new Button component)
            ================================================================ */}
        <header className="form-header">
          <div className="form-title-group">
            <h1>
              <Button
                type="button"
                variant="ghost" // Use the ghost variant for the back button
                leftIcon={ArrowLeft}
                onClick={handleCancel}
                className="header-back-button" // Custom class for final alignment
                aria-label="Back to list"
              >
                
              </Button>
              User Registration
            </h1>
            <p>Register a new system user and set their initial access details.</p>
          </div>
        </header>

        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

        {/* ================================================================
            FORMIK FORM (Grid Layout)
            ================================================================ */}
        <form onSubmit={formik.handleSubmit}>
          <div className="form-grid">
            {/* Field Groups (Using the new form-group wrapper for correct spacing) */}
            
            <div className="form-group">
              <input name="username" type="text" placeholder="Username" className="form-control" {...formik.getFieldProps("username")} />
              {formik.touched.username && formik.errors.username && (<div className="text-danger">{formik.errors.username}</div>)}
            </div>
            
            <div className="form-group">
              <input name="fullname" type="text" placeholder="Full Name" className="form-control" {...formik.getFieldProps("fullname")} />
              {formik.touched.fullname && formik.errors.fullname && (<div className="text-danger">{formik.errors.fullname}</div>)}
            </div>
            
            <div className="form-group">
              <input name="mobile" type="text" placeholder="Mobile" className="form-control" {...formik.getFieldProps("mobile")} />
              {formik.touched.mobile && formik.errors.mobile && (<div className="text-danger">{formik.errors.mobile}</div>)}
            </div>
            
            <div className="form-group">
              <input name="email" type="email" placeholder="Email" className="form-control" {...formik.getFieldProps("email")} />
              {formik.touched.email && formik.errors.email && (<div className="text-danger">{formik.errors.email}</div>)}
            </div>
            
            <div className="form-group">
              <select name="dept_id" className="form-select" {...formik.getFieldProps("dept_id")}>
                <option value="">Select Department</option>
                {departments.map((dept) => (<option key={dept.id} value={dept.id}>{dept.name}</option>))}
              </select>
              {formik.touched.dept_id && formik.errors.dept_id && (<div className="text-danger">{formik.errors.dept_id}</div>)}
            </div>
            
            <div className="form-group">
              <select name="role_id" className="form-select" {...formik.getFieldProps("role_id")}>
                <option value="">Select Role</option>
                {roles.map((role) => (<option key={role.id} value={role.id}>{role.name}</option>))}
              </select>
              {formik.touched.role_id && formik.errors.role_id && (<div className="text-danger">{formik.errors.role_id}</div>)}
            </div>
            
            <div className="form-group">
              <input name="password" type="password" placeholder="Password" className="form-control" {...formik.getFieldProps("password")} />
              {formik.touched.password && formik.errors.password && (<div className="text-danger">{formik.errors.password}</div>)}
            </div>
            
            <div className="form-group">
              <input name="password_confirmation" type="password" placeholder="Confirm Password" className="form-control" {...formik.getFieldProps("password_confirmation")} />
              {formik.touched.password_confirmation && formik.errors.password_confirmation && (<div className="text-danger">{formik.errors.password_confirmation}</div>)}
            </div>
            
            <div className="form-group">
              <select name="user_type_id" className="form-select" {...formik.getFieldProps("user_type_id")}>
                <option value="">Select User Type</option>
                {userTypes.map((type) => (<option key={type.id} value={type.id}>{type.name}</option>))}
              </select>
              {formik.touched.user_type_id && formik.errors.user_type_id && (<div className="text-danger">{formik.errors.user_type_id}</div>)}
            </div>
            
            <div className="form-group">
              <label className="form-label">Notifications</label>
              <div className="form-check">
                <input type="checkbox" name="is_email" id="is_email" className="form-check-input" checked={formik.values.is_email === "1"} onChange={handleCheckboxChange} />
                <label htmlFor="is_email" className="form-check-label">Email Notifications</label>
              </div>
              <div className="form-check">
                <input type="checkbox" name="is_sms" id="is_sms" className="form-check-input" checked={formik.values.is_sms === "1"} onChange={handleCheckboxChange} />
                <label htmlFor="is_sms" className="form-check-label">SMS Notifications</label>
              </div>
            </div>
          </div>

          {/* ================================================================
              ACTIONS FOOTER (Uses new Button component)
              ================================================================ */}
          <div className="form-actions">
            {/* <Button
              type="button"
              intent="secondary" // Maps to btn--secondary (a neutral, less prominent style)
              onClick={handleCancel}
            >
              Cancel
            </Button> */}
            {canRegister && (
              <Button
                type="submit"
                intent="primary" // Maps to btn--primary (the main action color)
                loading={formik.isSubmitting}
                loadingText="Registering..."
                disabled={formik.isSubmitting || !formik.isValid}
              >
                Register
              </Button>
            )}
          </div>
        </form>
      </div>
    </>
  );
};

export default RegistrationForm;