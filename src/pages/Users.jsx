// // import React, { useState, useEffect } from "react";
// // import { useFormik } from "formik";
// // import * as Yup from "yup";
// // import { useNavigate } from "react-router-dom";
// // import CommonButton from "../components/CommonButton"; // import at the top of your file

// // import {
// //   fetchUsers,
// //   fetchUser,
// //   updateUser,
// //   deleteUser,
// // } from "../api/userApi";
// // import {
// //   fetchUserTypes,
// //   fetchUserRoles,
// //   fetchDepartments,
// // } from "../api/masterDataApi";

// // const Users = () => {
// //   const [users, setUsers] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState("");
// //   const [editMode, setEditMode] = useState(false);
// //   const [currentUserId, setCurrentUserId] = useState(null);
// //   const [masterData, setMasterData] = useState({
// //     userTypes: [],
// //     roles: [],
// //     departments: [],
// //   });
// //   const [pagination, setPagination] = useState({
// //     currentPage: 1,
// //     itemsPerPage: 8,
// //     totalItems: 0,
// //   });
// //   const navigate = useNavigate();

// //   // Fetch all data on component mount and page change
// //   useEffect(() => {
// //     const loadData = async () => {
// //       try {
// //         setLoading(true);
// //         const [usersData, userTypes, roles, departments] = await Promise.all([
// //           fetchUsers(),
// //           fetchUserTypes(),
// //           fetchUserRoles(),
// //           fetchDepartments(),
// //         ]);
        
// //         setUsers(usersData);
// //         setPagination(prev => ({
// //           ...prev,
// //           totalItems: usersData.length
// //         }));
// //         setMasterData({
// //           userTypes,
// //           roles,
// //           departments,
// //         });
// //       } catch (err) {
// //         setError("Failed to load data. Please try again.");
// //         console.error("Error loading data:", err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     loadData();
// //   }, [pagination.currentPage]);

// //   // Form validation schema
// //   const validationSchema = Yup.object({
// //     username: Yup.string()
// //       .required("Username is required")
// //       .max(100)
// //       .matches(/^[A-Za-z0-9_]+$/, "Only letters, numbers, and underscores"),
// //     fullname: Yup.string().required("Fullname is required").max(255),
// //     mobile: Yup.string()
// //       .required("Mobile number is required")
// //       .matches(/^[0-9]+$/, "Mobile must be numeric"),
// //     email: Yup.string().email("Invalid email").required("Email is required"),
// //     dept_id: Yup.number()
// //       .required("Department is required")
// //       .typeError("Select a department"),
// //     role_id: Yup.number()
// //       .required("Role is required")
// //       .typeError("Select a role"),
// //     user_type_id: Yup.number()
// //       .required("User type is required")
// //       .typeError("Select a user type"),
// //     status: Yup.boolean().required("Status is required"),
// //     is_email: Yup.boolean(),
// //     is_sms: Yup.boolean(),
// //   });

// //   // Formik setup
// //   const formik = useFormik({
// //     initialValues: {
// //       user_type_id: "",
// //       username: "",
// //       fullname: "",
// //       mobile: "",
// //       email: "",
// //       dept_id: "",
// //       role_id: "",
// //       status: true,
// //       is_email: false,
// //       is_sms: false,
// //     },
// //     validationSchema,
// //     onSubmit: async (values) => {
// //       try {
// //         if (editMode) {
// //           const updatedUser = await updateUser(currentUserId, values);
// //           setUsers(users.map(user => 
// //             user.id === currentUserId ? updatedUser.user : user
// //           ));
// //           alert("User updated successfully");
// //         }
// //         setEditMode(false);
// //         formik.resetForm();
// //       } catch (error) {
// //         console.error("Error saving user:", error);
// //         setError(error.response?.data?.message || "Failed to save user");
// //       }
// //     },
// //   });

// //   // Handle edit button click
// //   const handleEdit = async (id) => {
// //     try {
// //       const user = await fetchUser(id);
// //       setCurrentUserId(id);
// //       setEditMode(true);
      
// //       // Convert "1"/"0" strings to booleans for checkboxes
// //       const userData = {
// //         ...user,
// //         status: user.status === 1,
// //         is_email: user.is_email === "1",
// //         is_sms: user.is_sms === "1",
// //       };
      
// //       formik.setValues(userData);
// //       window.scrollTo(0, 0);
// //     } catch (error) {
// //       console.error("Error fetching user:", error);
// //       setError("Failed to load user data");
// //     }
// //   };

// //   // Handle delete button click
// //   const handleDelete = async (id) => {
// //     if (window.confirm("Are you sure you want to delete this user?")) {
// //       try {
// //         await deleteUser(id);
// //         setUsers(users.filter(user => user.id !== id));
// //         setPagination(prev => ({
// //           ...prev,
// //           totalItems: prev.totalItems - 1
// //         }));
// //         alert("User deleted successfully");
// //       } catch (error) {
// //         console.error("Error deleting user:", error);
// //         setError("Failed to delete user");
// //       }
// //     }
// //   };

// //   // Handle checkbox changes
// //   const handleCheckboxChange = (e) => {
// //     const { name, checked } = e.target;
// //     formik.setFieldValue(name, checked);
// //   };

// //   // Handle page change
// //   const handlePageChange = (pageNumber) => {
// //     setPagination(prev => ({
// //       ...prev,
// //       currentPage: pageNumber
// //     }));
// //   };

// //   // Calculate pagination
// //   const indexOfLastItem = pagination.currentPage * pagination.itemsPerPage;
// //   const indexOfFirstItem = indexOfLastItem - pagination.itemsPerPage;
// //   const currentItems = users.slice(indexOfFirstItem, indexOfLastItem);
// //   const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);

// //   if (loading) {
// //     return <div className="text-center p-4">Loading...</div>;
// //   }

// //   return (
// //     <div className="container bg-white p-4">
// //       <div className="d-flex justify-content-between align-items-center mb-4">
// //         <h2 className="mb-0">User Management</h2>
        
        
// //         <CommonButton
// //   name="addUser"
// //   onClick={() => navigate("/admin/settings/userregister")}
// // />


// //       </div>

// //       {error && <div className="alert alert-danger">{error}</div>}

// //       {/* Edit Form (shown when in edit mode) */}
// //       {editMode && (
// //         <div className="card mb-4">
// //           <div className="card-header">
// //             <h3>Edit User</h3>
// //           </div>
// //           <div className="card-body">
// //             <form onSubmit={formik.handleSubmit}>
// //               <div className="row">
// //                 <div className="col-md-6 mb-3">
// //                   <label>Username</label>
// //                   <input
// //                     name="username"
// //                     type="text"
// //                     className="form-control"
// //                     {...formik.getFieldProps("username")}
// //                   />
// //                   {formik.touched.username && formik.errors.username && (
// //                     <div className="text-danger">{formik.errors.username}</div>
// //                   )}
// //                 </div>
// //                 <div className="col-md-6 mb-3">
// //                   <label>Full Name</label>
// //                   <input
// //                     name="fullname"
// //                     type="text"
// //                     className="form-control"
// //                     {...formik.getFieldProps("fullname")}
// //                   />
// //                   {formik.touched.fullname && formik.errors.fullname && (
// //                     <div className="text-danger">{formik.errors.fullname}</div>
// //                   )}
// //                 </div>
// //                 <div className="col-md-6 mb-3">
// //                   <label>Mobile</label>
// //                   <input
// //                     name="mobile"
// //                     type="text"
// //                     className="form-control"
// //                     {...formik.getFieldProps("mobile")}
// //                   />
// //                   {formik.touched.mobile && formik.errors.mobile && (
// //                     <div className="text-danger">{formik.errors.mobile}</div>
// //                   )}
// //                 </div>
// //                 <div className="col-md-6 mb-3">
// //                   <label>Email</label>
// //                   <input
// //                     name="email"
// //                     type="email"
// //                     className="form-control"
// //                     {...formik.getFieldProps("email")}
// //                   />
// //                   {formik.touched.email && formik.errors.email && (
// //                     <div className="text-danger">{formik.errors.email}</div>
// //                   )}
// //                 </div>
// //                 <div className="col-md-6 mb-3">
// //                   <label>Department</label>
// //                   <select
// //                     name="dept_id"
// //                     className="form-select"
// //                     {...formik.getFieldProps("dept_id")}
// //                   >
// //                     <option value="">Select Department</option>
// //                     {masterData.departments.map((dept) => (
// //                       <option key={dept.id} value={dept.id}>
// //                         {dept.name}
// //                       </option>
// //                     ))}
// //                   </select>
// //                   {formik.touched.dept_id && formik.errors.dept_id && (
// //                     <div className="text-danger">{formik.errors.dept_id}</div>
// //                   )}
// //                 </div>
// //                 <div className="col-md-6 mb-3">
// //                   <label>Role</label>
// //                   <select
// //                     name="role_id"
// //                     className="form-select"
// //                     {...formik.getFieldProps("role_id")}
// //                   >
// //                     <option value="">Select Role</option>
// //                     {masterData.roles.map((role) => (
// //                       <option key={role.id} value={role.id}>
// //                         {role.name}
// //                       </option>
// //                     ))}
// //                   </select>
// //                   {formik.touched.role_id && formik.errors.role_id && (
// //                     <div className="text-danger">{formik.errors.role_id}</div>
// //                   )}
// //                 </div>
// //                 <div className="col-md-6 mb-3">
// //                   <label>User Type</label>
// //                   <select
// //                     name="user_type_id"
// //                     className="form-select"
// //                     {...formik.getFieldProps("user_type_id")}
// //                   >
// //                     <option value="">Select User Type</option>
// //                     {masterData.userTypes.map((type) => (
// //                       <option key={type.id} value={type.id}>
// //                         {type.name}
// //                       </option>
// //                     ))}
// //                   </select>
// //                   {formik.touched.user_type_id && formik.errors.user_type_id && (
// //                     <div className="text-danger">{formik.errors.user_type_id}</div>
// //                   )}
// //                 </div>
// //                 <div className="col-md-6 mb-3">
// //                   <label>Status</label>
// //                   <select
// //                     name="status"
// //                     className="form-select"
// //                     {...formik.getFieldProps("status")}
// //                   >
// //                     <option value={true}>Active</option>
// //                     <option value={false}>Inactive</option>
// //                   </select>
// //                   {formik.touched.status && formik.errors.status && (
// //                     <div className="text-danger">{formik.errors.status}</div>
// //                   )}
// //                 </div>
// //                 <div className="col-md-6 mb-3">
// //                   <label>Notifications</label>
// //                   <div className="form-check">
// //                     <input
// //                       type="checkbox"
// //                       name="is_email"
// //                       id="is_email"
// //                       className="form-check-input"
// //                       checked={formik.values.is_email}
// //                       onChange={handleCheckboxChange}
// //                     />
// //                     <label htmlFor="is_email" className="form-check-label">
// //                       Email Notifications
// //                     </label>
// //                   </div>
// //                   <div className="form-check">
// //                     <input
// //                       type="checkbox"
// //                       name="is_sms"
// //                       id="is_sms"
// //                       className="form-check-input"
// //                       checked={formik.values.is_sms}
// //                       onChange={handleCheckboxChange}
// //                     />
// //                     <label htmlFor="is_sms" className="form-check-label">
// //                       SMS Notifications
// //                     </label>
// //                   </div>
// //                 </div>
// //               </div>
            
            
// //               {/* <div className="mt-3">

// //                 <button type="submit" className="btn btn-primary me-2">
// //                   Save Changes
// //                 </button>
// //                 <button
// //                   type="button"
// //                   className="btn btn-secondary"
// //                   onClick={() => {
// //                     setEditMode(false);
// //                     formik.resetForm();
// //                   }}
// //                 >
// //                   Cancel
// //                 </button>
// //               </div> */}


// //               {/*replacing below code by tahisn ---- */}
// // <div className="mt-3">
// //   <CommonButton type="submit" name="save" />
// //   <CommonButton
// //     type="button"
// //     name="cancel"
// //     onClick={() => {
// //       setEditMode(false);
// //       formik.resetForm();
// //     }}
// //   />
// // </div>


// //             </form>
// //           </div>
// //         </div>
// //       )}

// //       {/* Users Table */}
// //       <div className="table-responsive mb-3">
// //         <table className="table table-striped table-hover">
// //           <thead>
// //             <tr>
// //               <th>ID</th>
// //               <th>Username</th>
// //               <th>Full Name</th>
// //               <th>Email</th>
// //               <th>Mobile</th>
// //               <th>Department</th>
// //               <th>Role</th>
// //               <th>Status</th>
// //               <th>Actions</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {currentItems.map((user) => (
// //               <tr key={user.id}>
// //                 <td>{user.id}</td>
// //                 <td>{user.username}</td>
// //                 <td>{user.fullname}</td>
// //                 <td>{user.email}</td>
// //                 <td>{user.mobile}</td>
// //                 <td>
// //                   {masterData.departments.find(d => d.id === user.dept_id)?.name || user.dept_id}
// //                 </td>
// //                 <td>
// //                   {masterData.roles.find(r => r.id === user.role_id)?.name || user.role_id}
// //                 </td>
// //                 <td>
// //                   <span className={`badge ${user.status ? 'bg-success' : 'bg-secondary'}`}>
// //                     {user.status ? "Active" : "Inactive"}
// //                   </span>
// //                 </td>
// //                 <td>
// //                   <div className="d-flex gap-2">
// //                     <CommonButton name="edit" onClick={() => handleEdit(user.id)} />
// //                     <CommonButton name="delete" onClick={() => handleDelete(user.id)} />
  
// //                   </div>
// //               </td>
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       </div>

// //       {/* Pagination */}
// //       {pagination.totalItems > pagination.itemsPerPage && (
// //         <nav>
// //           <ul className="pagination justify-content-center">
// //             <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
// //               <button 
// //                 className="page-link" 
// //                 onClick={() => handlePageChange(pagination.currentPage - 1)}
// //               >
// //                 Previous
// //               </button>
// //             </li>
            
// //             {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
// //               <li 
// //                 key={number} 
// //                 className={`page-item ${pagination.currentPage === number ? 'active' : ''}`}
// //               >
// //                 <button 
// //                   className="page-link" 
// //                   onClick={() => handlePageChange(number)}
// //                 >
// //                   {number}
// //                 </button>
// //               </li>
// //             ))}
            
// //             <li className={`page-item ${pagination.currentPage === totalPages ? 'disabled' : ''}`}>
// //               <button 
// //                 className="page-link" 
// //                 onClick={() => handlePageChange(pagination.currentPage + 1)}
// //               >
// //                 Next
// //               </button>
// //             </li>
// //           </ul>
// //         </nav>
// //       )}
// //     </div>
// //   );
// // };

// import React, { useState, useEffect, useMemo } from "react";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import { useNavigate } from "react-router-dom";
// import { Edit, Trash2, Plus } from "lucide-react";

// // IMPORT THE NEW BUTTON AND ICON BUTTON COMPONENTS
// import Button from "../components/ui/Button"; // Standard Button component
// import DataTable from "../components/table/DataTable";

// import {
//   fetchUsers,
// // REMOVED: fetchUser, updateUser, deleteUser (no longer used in this example but kept in original)
// } from "../api/userApi";
// // REMOVED: fetchUserTypes, fetchUserRoles, fetchDepartments (no longer used in this example but kept in original)

// // ================================================================
// // 1. REVISED CSS for Icon Button and Layout Consistency
// //    - Removed card styles from .user-management-header and .user-list-card
// // ================================================================
// const iconButtonStyles = `
//     .data-table-btn-icon {
//         background: transparent;
//         border: none;
//         padding: 0.25rem;
//         cursor: pointer;
//         transition: background-color 0.15s ease-in-out;
//         outline: none;
//         box-shadow: none;
//         /* Ensure consistent look for icons */
//         display: inline-flex;
//         align-items: center;
//         justify-content: center;
//     }
//     .data-table-btn-icon:hover {
//         background-color: #e5e7eb; /* Slightly darker gray background on hover for distinction */
//         border-radius: 0.25rem;
//     }
//     .data-table-btn-icon:focus {
//         outline: 2px solid #6366f1; /* Custom focus ring for accessibility */
//         outline-offset: 2px;
//         box-shadow: none;
//     }
// `;

// // Helper styles to ensure the page container looks right (if not using Tailwind)
// const pageLayoutStyles = `
//     .user-management-container {
//         padding: 1.5rem; /* p-6 */
//         background-color: #f9fafb; /* gray-50 equivalent for background */
//     }

//     /* === REVISED: NO CARD STYLE FOR HEADER === */
//     .user-management-header {
//         background-color: transparent; /* No background */
//         padding: 0; /* Remove padding */
//         border-radius: 0; /* No border radius */
//         margin-bottom: 1.5rem;
//         display: flex;
//         justify-content: space-between;
//         align-items: center;
//         border-bottom: 1px solid #e5e7eb; /* Keep a separator line for the header */
//         padding-bottom: 1rem;
//     }

//     /* === REVISED: NO CARD STYLE FOR LIST/FORM CONTAINER === */
//     .user-list-card {
//         background-color: transparent; /* No background */
//         padding: 0; /* Remove padding */
//         border-radius: 0; /* No border radius */
//         box-shadow: none; /* No shadow */
//     }

//     /* Standard utility classes (kept for form/badge) */
//     .text-danger {
//         color: #ef4444; /* red-500 */
//         font-size: 0.875rem;
//         margin-top: 0.25rem;
//     }
//     .badge {
//         display: inline-block;
//         padding: 0.25em 0.4em;
//         font-size: 75%;
//         font-weight: 700;
//         line-height: 1;
//         text-align: center;
//         white-space: nowrap;
//         vertical-align: baseline;
//         border-radius: 0.25rem;
//         color: #fff;
//     }
//     .bg-success {
//         background-color: #10b981; /* emerald-500 */
//     }
//     .bg-secondary {
//         background-color: #6b7280; /* gray-500 */
//     }
// `;
// // ================================================================


// const Users = () => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [editMode, setEditMode] = useState(false);
//   const [currentUserId, setCurrentUserId] = useState(null);
//   const [masterData, setMasterData] = useState({
//     userTypes: [],
//     roles: [],
//     departments: [],
//   });

//   const navigate = useNavigate();

//   // --- Data Fetching Logic (using mock data as per original) ---
//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         setLoading(true);
//         const [usersData, userTypes, roles, departments] = await Promise.all([
//             fetchUsers(),
//             // Mock master data
//             Promise.resolve([{id: 1, name: 'Admin'}, {id: 2, name: 'User'}]),
//             Promise.resolve([{id: 1, name: 'Manager'}, {id: 2, name: 'Engineer'}]),
//             Promise.resolve([{id: 1, name: 'IT'}, {id: 2, name: 'Sales'}]),
//         ]);

//         setUsers(usersData);
//         setMasterData({
//           userTypes,
//           roles,
//           departments,
//         });
//       } catch (err) {
//         setError("Failed to load data. Please try again.");
//         console.error("Error loading data:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadData();
//   }, []);

//   // --- Formik & Validation Logic (Unchanged) ---
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
//     user_type_id: Yup.number()
//       .required("User type is required")
//       .typeError("Select a user type"),
//     status: Yup.boolean().required("Status is required"),
//     is_email: Yup.boolean(),
//     is_sms: Yup.boolean(),
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
//       status: true,
//       is_email: false,
//       is_sms: false,
//     },
//     validationSchema,
//     onSubmit: async (values) => {
//       try {
//         if (editMode) {
//           // Simulate API call delay
//           await new Promise(resolve => setTimeout(resolve, 500));
//           const updatedUser = { ...values, id: currentUserId };
//           setUsers(users.map(user =>
//             user.id === currentUserId ? updatedUser : user
//           ));
//           alert("User updated successfully");
//         }
//         setEditMode(false);
//         formik.resetForm();
//       } catch (error) {
//         console.error("Error saving user:", error);
//         setError(error.response?.data?.message || "Failed to save user");
//       }
//     },
//   });

//   // --- Action Handlers (Unchanged) ---
//   const handleEdit = async (id) => {
//     try {
//       const user = users.find(u => u.id === id) || {
//           id: id,
//           username: `user${id}`,
//           fullname: 'Loading...',
//           mobile: '000',
//           email: 'mock@example.com',
//           dept_id: 1,
//           role_id: 1,
//           user_type_id: 1,
//           status: '1',
//           is_email: '1',
//           is_sms: '0'
//       };

//       setCurrentUserId(id);
//       setEditMode(true);

//       const userData = {
//         ...user,
//         status: user.status === 1 || user.status === true || user.status === "1",
//         is_email: user.is_email === "1" || user.is_email === true,
//         is_sms: user.is_sms === "1" || user.is_sms === true,
//       };

//       formik.setValues(userData);
//       window.scrollTo(0, 0);
//     } catch (error) {
//       console.error("Error fetching user:", error);
//       setError("Failed to load user data");
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this user?")) {
//       try {
//         setUsers(users.filter(user => user.id !== id));
//         alert("User deleted successfully");
//       } catch (error) {
//         console.error("Error deleting user:", error);
//         setError("Failed to delete user");
//       }
//     }
//   };

//   const handleCheckboxChange = (e) => {
//     const { name, checked } = e.target;
//     formik.setFieldValue(name, checked);
//   };

//   // --- DATATABLE COLUMN CONFIGURATION (Unchanged logic, just the style implementation) ---
//   const columns = useMemo(() => [
//     { key: "id", header: "ID" },
//     { key: "username", header: "Username" },
//     { key: "fullname", header: "Full Name" },
//     { key: "email", header: "Email" },
//     { key: "mobile", header: "Mobile" },
//     {
//       key: "dept_id",
//       header: "Department",
//       render: (dept_id) => {
//         return masterData.departments.find(d => d.id === dept_id)?.name || "N/A";
//       },
//     },
//     {
//       key: "role_id",
//       header: "Role",
//       render: (role_id) => {
//         return masterData.roles.find(r => r.id === role_id)?.name || "N/A";
//       },
//     },
//     {
//       key: "status",
//       header: "Status",
//       isSortable: false,
//       render: (status) => {
//         const isActive = status === 1 || status === true || status === "1";
//         return (
//           <span className={`badge ${isActive ? "bg-success" : "bg-secondary"}`}>
//             {isActive ? "Active" : "Inactive"}
//           </span>
//         );
//       },
//     },
//     {
//       key: "actions",
//       header: "Actions",
//       isSortable: false,
//       render: (v, user) => (
//         // The d-flex gap-2 justify-content-center is likely Bootstrap/utility classes
//         <div className="d-flex gap-2 justify-content-center">
//           {/* Using styled icon buttons */}
//           <button
//             className="data-table-btn-icon text-indigo-500 hover:text-indigo-700"
//             onClick={() => handleEdit(user.id)}
//             title="Edit User"
//           >
//             <Edit size={16} />
//           </button>
//           <button
//             className="data-table-btn-icon text-red-500 hover:text-red-700"
//             onClick={() => handleDelete(user.id)}
//             title="Delete User"
//           >
//             <Trash2 size={16} />
//           </button>
//         </div>
//       ),
//     },
//   ], [masterData.departments, masterData.roles, handleDelete]);
//   // --- END DATATABLE COLUMN CONFIGURATION ---


//   if (loading) {
//     return <div className="text-center p-4">Loading...</div>;
//   }

//   return (
//     // Inject the necessary CSS
//     <>
//       <style>{iconButtonStyles}</style>
//       <style>{pageLayoutStyles}</style>

//       <div className="user-management-container">

//         {/* Header Section (Now simple, non-card header) */}
//         <header className="user-management-header">
//             <h2 className="text-xl font-bold">User Management</h2>

//             {/* Using the styled Button component */}
//             <Button
//               intent="primary"
//               leftIcon={Plus}
//               onClick={() => navigate("/admin/settings/userregister")}
//             >
//               Add New User
//             </Button>
//         </header>

//         {error && <div className="alert alert-danger">{error}</div>}

//         {/* Edit Form (Wrapper is now non-card) */}
//         {editMode && (
//           // IMPORTANT: Removed the `card mb-4` classes from this div,
//           // but kept the `user-list-card` for layout consistency, which is now non-card.
//           <div className="mb-4 user-list-card">
//             {/* REMOVED: <div className="card-header">... */}
//             <h3 className="mb-3">Edit User</h3> {/* Simple heading */}
//             {/* IMPORTANT: Removed the `card-body` class */}
//             <div className="p-4 bg-white rounded-lg shadow-sm mb-4">
//               <form onSubmit={formik.handleSubmit}>
//                 <div className="row">
//                   {/* ... (All form inputs remain here) ... */}
//                   <div className="col-md-6 mb-3">
//                     <label>Username</label>
//                     <input
//                       name="username"
//                       type="text"
//                       className="form-control"
//                       {...formik.getFieldProps("username")}
//                     />
//                     {formik.touched.username && formik.errors.username && (
//                       <div className="text-danger">{formik.errors.username}</div>
//                     )}
//                   </div>
//                   <div className="col-md-6 mb-3">
//                     <label>Full Name</label>
//                     <input
//                       name="fullname"
//                       type="text"
//                       className="form-control"
//                       {...formik.getFieldProps("fullname")}
//                     />
//                     {formik.touched.fullname && formik.errors.fullname && (
//                       <div className="text-danger">{formik.errors.fullname}</div>
//                     )}
//                   </div>
//                   <div className="col-md-6 mb-3">
//                     <label>Mobile</label>
//                     <input
//                       name="mobile"
//                       type="text"
//                       className="form-control"
//                       {...formik.getFieldProps("mobile")}
//                     />
//                     {formik.touched.mobile && formik.errors.mobile && (
//                       <div className="text-danger">{formik.errors.mobile}</div>
//                     )}
//                   </div>
//                   <div className="col-md-6 mb-3">
//                     <label>Email</label>
//                     <input
//                       name="email"
//                       type="email"
//                       className="form-control"
//                       {...formik.getFieldProps("email")}
//                     />
//                     {formik.touched.email && formik.errors.email && (
//                       <div className="text-danger">{formik.errors.email}</div>
//                     )}
//                   </div>
//                   <div className="col-md-6 mb-3">
//                     <label>Department</label>
//                     <select
//                       name="dept_id"
//                       className="form-select"
//                       {...formik.getFieldProps("dept_id")}
//                     >
//                       <option value="">Select Department</option>
//                       {masterData.departments.map((dept) => (
//                         <option key={dept.id} value={dept.id}>
//                           {dept.name}
//                         </option>
//                       ))}
//                     </select>
//                     {formik.touched.dept_id && formik.errors.dept_id && (
//                       <div className="text-danger">{formik.errors.dept_id}</div>
//                     )}
//                   </div>
//                   <div className="col-md-6 mb-3">
//                     <label>Role</label>
//                     <select
//                       name="role_id"
//                       className="form-select"
//                       {...formik.getFieldProps("role_id")}
//                     >
//                       <option value="">Select Role</option>
//                       {masterData.roles.map((role) => (
//                         <option key={role.id} value={role.id}>
//                           {role.name}
//                         </option>
//                       ))}
//                     </select>
//                     {formik.touched.role_id && formik.errors.role_id && (
//                       <div className="text-danger">{formik.errors.role_id}</div>
//                     )}
//                   </div>
//                   <div className="col-md-6 mb-3">
//                     <label>User Type</label>
//                     <select
//                       name="user_type_id"
//                       className="form-select"
//                       {...formik.getFieldProps("user_type_id")}
//                     >
//                       <option value="">Select User Type</option>
//                       {masterData.userTypes.map((type) => (
//                         <option key={type.id} value={type.id}>
//                           {type.name}
//                         </option>
//                       ))}
//                     </select>
//                     {formik.touched.user_type_id && formik.errors.user_type_id && (
//                       <div className="text-danger">{formik.errors.user_type_id}</div>
//                     )}
//                   </div>
//                   <div className="col-md-6 mb-3">
//                     <label>Status</label>
//                     <select
//                       name="status"
//                       className="form-select"
//                       value={formik.values.status ? "true" : "false"}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                     >
//                       <option value="true">Active</option>
//                       <option value="false">Inactive</option>
//                     </select>
//                     {formik.touched.status && formik.errors.status && (
//                       <div className="text-danger">{formik.errors.status}</div>
//                     )}
//                   </div>
//                   <div className="col-md-6 mb-3">
//                     <label>Notifications</label>
//                     <div className="form-check">
//                       <input
//                         type="checkbox"
//                         name="is_email"
//                         id="is_email"
//                         className="form-check-input"
//                         checked={formik.values.is_email}
//                         onChange={handleCheckboxChange}
//                       />
//                       <label htmlFor="is_email" className="form-check-label">
//                         Email Notifications
//                       </label>
//                     </div>
//                     <div className="form-check">
//                       <input
//                         type="checkbox"
//                         name="is_sms"
//                         id="is_sms"
//                         className="form-check-input"
//                         checked={formik.values.is_sms}
//                         onChange={handleCheckboxChange}
//                       />
//                       <label htmlFor="is_sms" className="form-check-label">
//                         SMS Notifications
//                       </label>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-3 d-flex gap-2">
//                   {/* Using the styled Button component for form actions */}
//                   <Button type="submit" intent="primary" disabled={formik.isSubmitting}>
//                     {formik.isSubmitting ? "Saving..." : "Save Changes"}
//                   </Button>
//                   <Button
//                     type="button"
//                     intent="secondary"
//                     onClick={() => {
//                       setEditMode(false);
//                       formik.resetForm();
//                     }}
//                   >
//                     Cancel
//                   </Button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}

//         {/* DataTable Component (Wrapper is now non-card) */}
//         {/* Added a light card to the DataTable wrapper itself to distinguish it from the page background, as tables often look better with some separation, but kept the wrapper `user-list-card` transparent. You can adjust the classes below. */}
//         <div className="user-list-card p-4 bg-white rounded-lg shadow-sm">
//             <DataTable
//               title="User List"
//               data={users}
//               columns={columns}
//               showId={true}
//               initialPageSize={8}
//               searchable={true}
//               selection={false}
//               isBackendPagination={false}
//             />
//         </div>
//       </div>
//     </>
//   );
// };

// export default Users;



import React, { useState, useEffect, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Plus } from "lucide-react";

// IMPORT THE NEW BUTTON AND ICON BUTTON COMPONENTS
import Button from "../components/ui/Button"; // Standard Button component
import DataTable from "../components/table/DataTable";

import {
  fetchUsers,
  updateUser,
  deleteUser,
// REMOVED: fetchUser, updateUser, deleteUser (no longer used in this example but kept in original)
} from "../api/userApi";
// FIXED: Import the actual API functions for master data
import {
  fetchUserTypes,
  fetchUserRoles,
  fetchDepartments,
} from "../api/masterDataApi";

// ================================================================
// 1. REVISED CSS for Icon Button and Layout Consistency
//    - Removed card styles from .user-management-header and .user-list-card
// ================================================================
const iconButtonStyles = `
    .data-table-btn-icon {
        background: transparent;
        border: none;
        padding: 0.25rem;
        cursor: pointer;
        transition: background-color 0.15s ease-in-out;
        outline: none;
        box-shadow: none;
        /* Ensure consistent look for icons */
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
    .data-table-btn-icon:hover {
        background-color: #e5e7eb; /* Slightly darker gray background on hover for distinction */
        border-radius: 0.25rem;
    }
    .data-table-btn-icon:focus {
        outline: 2px solid #6366f1; /* Custom focus ring for accessibility */
        outline-offset: 2px;
        box-shadow: none;
    }
`;

// Helper styles to ensure the page container looks right (if not using Tailwind)
const pageLayoutStyles = `
    .user-management-container {
        padding: 1.5rem; /* p-6 */
        background-color: #f9fafb; /* gray-50 equivalent for background */
    }

    /* === REVISED: NO CARD STYLE FOR HEADER === */
    .user-management-header {
        background-color: transparent; /* No background */
        padding: 0; /* Remove padding */
        border-radius: 0; /* No border radius */
        margin-bottom: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #e5e7eb; /* Keep a separator line for the header */
        padding-bottom: 1rem;
    }

    /* === REVISED: NO CARD STYLE FOR LIST/FORM CONTAINER === */
    .user-list-card {
        background-color: transparent; /* No background */
        padding: 0; /* Remove padding */
        border-radius: 0; /* No border radius */
        box-shadow: none; /* No shadow */
    }

    /* Standard utility classes (kept for form/badge) */
    .text-danger {
        color: #ef4444; /* red-500 */
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }
    .badge {
        display: inline-block;
        padding: 0.25em 0.4em;
        font-size: 75%;
        font-weight: 700;
        line-height: 1;
        text-align: center;
        white-space: nowrap;
        vertical-align: baseline;
        border-radius: 0.25rem;
        color: #fff;
    }
    .bg-success {
        background-color: #10b981; /* emerald-500 */
    }
    .bg-secondary {
        background-color: #6b7280; /* gray-500 */
    }
`;
// ================================================================


const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [masterData, setMasterData] = useState({
    userTypes: [],
    roles: [],
    departments: [],
  });

  const navigate = useNavigate();

  // --- Data Fetching Logic (FIXED: Now calls actual APIs) ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // FIXED: Call actual API functions instead of returning mock data
        const [usersData, userTypesData, rolesData, departmentsData] = await Promise.all([
            fetchUsers(),
            fetchUserTypes(),      // ← FIXED: Actual API call
            fetchUserRoles(),       // ← FIXED: Actual API call
            fetchDepartments(),     // ← FIXED: Actual API call
        ]);

        setUsers(usersData);
        setMasterData({
          userTypes: userTypesData,
          roles: rolesData,
          departments: departmentsData,
        });
      } catch (err) {
        setError("Failed to load data. Please try again.");
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- Formik & Validation Logic (Unchanged) ---
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
    user_type_id: Yup.number()
      .required("User type is required")
      .typeError("Select a user type"),
    status: Yup.boolean().required("Status is required"),
    is_email: Yup.boolean(),
    is_sms: Yup.boolean(),
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
      status: true,
      is_email: false,
      is_sms: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (editMode) {
          // FIXED: Call actual updateUser API instead of just updating local state
          const response = await updateUser(currentUserId, values);
          
          // Update local state after successful API call
          setUsers(users.map(user =>
            user.id === currentUserId ? { ...values, id: currentUserId } : user
          ));
          alert(response.message || "User updated successfully");
        }
        setEditMode(false);
        formik.resetForm();
      } catch (error) {
        console.error("Error saving user:", error);
        setError(error.response?.data?.message || "Failed to save user");
      }
    },
  });

  // --- Action Handlers (FIXED: Properly fetch user data from list or API) ---
  const handleEdit = async (id) => {
    try {
      // Find user in the current list first
      let user = users.find(u => u.id === id);
      
      // If not found, fetch from API (optional - depends on your API)
      if (!user) {
        // If you have a fetchUser(id) function, uncomment this:
        // user = await fetchUser(id);
        // Otherwise, show an error
        setError("User not found");
        return;
      }

      setCurrentUserId(id);
      setEditMode(true);

      // Convert boolean values for form compatibility
      const userData = {
        ...user,
        dept_id: user.dept_id ? parseInt(user.dept_id) : "",
        role_id: user.role_id ? parseInt(user.role_id) : "",
        user_type_id: user.user_type_id ? parseInt(user.user_type_id) : "",
        status: user.status === 1 || user.status === true || user.status === "1",
        is_email: user.is_email === "1" || user.is_email === true,
        is_sms: user.is_sms === "1" || user.is_sms === true,
      };

      formik.setValues(userData);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error fetching user:", error);
      setError("Failed to load user data");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        // FIXED: Call actual deleteUser API
        await deleteUser(id);
        setUsers(users.filter(user => user.id !== id));
        alert("User deleted successfully");
      } catch (error) {
        console.error("Error deleting user:", error);
        setError(error.response?.data?.message || "Failed to delete user");
      }
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    formik.setFieldValue(name, checked);
  };

  // --- DATATABLE COLUMN CONFIGURATION (Unchanged logic, just the style implementation) ---
  const columns = useMemo(() => [
    { key: "id", header: "ID" },
    { key: "username", header: "Username" },
    { key: "fullname", header: "Full Name" },
    { key: "email", header: "Email" },
    { key: "mobile", header: "Mobile" },
    {
      key: "dept_id",
      header: "Department",
      render: (dept_id) => {
        return masterData.departments.find(d => d.id === dept_id)?.name || "N/A";
      },
    },
    {
      key: "role_id",
      header: "Role",
      render: (role_id) => {
        return masterData.roles.find(r => r.id === role_id)?.name || "N/A";
      },
    },
    {
      key: "status",
      header: "Status",
      isSortable: false,
      render: (status) => {
        const isActive = status === 1 || status === true || status === "1";
        return (
          <span className={`badge ${isActive ? "bg-success" : "bg-secondary"}`}>
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      isSortable: false,
      render: (v, user) => (
        // The d-flex gap-2 justify-content-center is likely Bootstrap/utility classes
        <div className="d-flex gap-2 justify-content-center">
          {/* Using styled icon buttons */}
          <button
            className="data-table-btn-icon text-indigo-500 hover:text-indigo-700"
            onClick={() => handleEdit(user.id)}
            title="Edit User"
          >
            <Edit size={16} />
          </button>
          <button
            className="data-table-btn-icon text-red-500 hover:text-red-700"
            onClick={() => handleDelete(user.id)}
            title="Delete User"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ], [masterData.departments, masterData.roles, handleDelete]);
  // --- END DATATABLE COLUMN CONFIGURATION ---


  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    // Inject the necessary CSS
    <>
      <style>{iconButtonStyles}</style>
      <style>{pageLayoutStyles}</style>

      <div className="user-management-container">

        {/* Header Section (Now simple, non-card header) */}
        <header className="user-management-header">
            <h2 className="text-xl font-bold">User Management</h2>

            {/* Using the styled Button component */}
            <Button
              intent="primary"
              leftIcon={Plus}
              onClick={() => navigate("/admin/settings/userregister")}
            >
              Add New User
            </Button>
        </header>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* Edit Form (Wrapper is now non-card) */}
        {editMode && (
          // IMPORTANT: Removed the `card mb-4` classes from this div,
          // but kept the `user-list-card` for layout consistency, which is now non-card.
          <div className="mb-4 user-list-card">
            {/* REMOVED: <div className="card-header">... */}
            <h3 className="mb-3">Edit User</h3> {/* Simple heading */}
            {/* IMPORTANT: Removed the `card-body` class */}
            <div className="p-4 bg-white rounded-lg shadow-sm mb-4">
              <form onSubmit={formik.handleSubmit}>
                <div className="row">
                  {/* ... (All form inputs remain here) ... */}
                  <div className="col-md-6 mb-3">
                    <label>Username</label>
                    <input
                      name="username"
                      type="text"
                      className="form-control"
                      {...formik.getFieldProps("username")}
                    />
                    {formik.touched.username && formik.errors.username && (
                      <div className="text-danger">{formik.errors.username}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Full Name</label>
                    <input
                      name="fullname"
                      type="text"
                      className="form-control"
                      {...formik.getFieldProps("fullname")}
                    />
                    {formik.touched.fullname && formik.errors.fullname && (
                      <div className="text-danger">{formik.errors.fullname}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Mobile</label>
                    <input
                      name="mobile"
                      type="text"
                      className="form-control"
                      {...formik.getFieldProps("mobile")}
                    />
                    {formik.touched.mobile && formik.errors.mobile && (
                      <div className="text-danger">{formik.errors.mobile}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Email</label>
                    <input
                      name="email"
                      type="email"
                      className="form-control"
                      {...formik.getFieldProps("email")}
                    />
                    {formik.touched.email && formik.errors.email && (
                      <div className="text-danger">{formik.errors.email}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Department</label>
                    <select
                      name="dept_id"
                      className="form-select"
                      {...formik.getFieldProps("dept_id")}
                    >
                      <option value="">Select Department</option>
                      {masterData.departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    {formik.touched.dept_id && formik.errors.dept_id && (
                      <div className="text-danger">{formik.errors.dept_id}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Role</label>
                    <select
                      name="role_id"
                      className="form-select"
                      {...formik.getFieldProps("role_id")}
                    >
                      <option value="">Select Role</option>
                      {masterData.roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    {formik.touched.role_id && formik.errors.role_id && (
                      <div className="text-danger">{formik.errors.role_id}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>User Type</label>
                    <select
                      name="user_type_id"
                      className="form-select"
                      {...formik.getFieldProps("user_type_id")}
                    >
                      <option value="">Select User Type</option>
                      {masterData.userTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    {formik.touched.user_type_id && formik.errors.user_type_id && (
                      <div className="text-danger">{formik.errors.user_type_id}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Status</label>
                    <select
                      name="status"
                      className="form-select"
                      value={formik.values.status ? "true" : "false"}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                    {formik.touched.status && formik.errors.status && (
                      <div className="text-danger">{formik.errors.status}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Notifications</label>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="is_email"
                        id="is_email"
                        className="form-check-input"
                        checked={formik.values.is_email}
                        onChange={handleCheckboxChange}
                      />
                      <label htmlFor="is_email" className="form-check-label">
                        Email Notifications
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="is_sms"
                        id="is_sms"
                        className="form-check-input"
                        checked={formik.values.is_sms}
                        onChange={handleCheckboxChange}
                      />
                      <label htmlFor="is_sms" className="form-check-label">
                        SMS Notifications
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-3 d-flex gap-2">
                  {/* Using the styled Button component for form actions */}
                  <Button 
                    type="submit" 
                    intent="primary" 
                    loading={formik.isSubmitting}
                    loadingText="Saving..."
                    disabled={formik.isSubmitting}
                  >
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    intent="secondary"
                    onClick={() => {
                      setEditMode(false);
                      formik.resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DataTable Component (Wrapper is now non-card) */}
        {/* Added a light card to the DataTable wrapper itself to distinguish it from the page background, as tables often look better with some separation, but kept the wrapper `user-list-card` transparent. You can adjust the classes below. */}
        <div className="user-list-card p-4 bg-white rounded-lg shadow-sm">
            <DataTable
              title="User List"
              data={users}
              columns={columns}
              showId={true}
              initialPageSize={8}
              searchable={true}
              selection={false}
              isBackendPagination={false}
            />
        </div>
      </div>
    </>
  );
};

export default Users;