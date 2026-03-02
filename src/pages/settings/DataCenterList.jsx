// import React, { useEffect, useState } from 'react';
// import { fetchDataCenters, deleteDataCenter } from '../../api/settings/dataCenterApi';
// import { useNavigate } from 'react-router-dom';
// import '../../assets/styles/DataCenterList.css';
// import { usePermissions } from '../../context/PermissionContext';
// import { confirmAlert } from 'react-confirm-alert'; // Import confirmAlert
// import 'react-confirm-alert/src/react-confirm-alert.css'; // Import its CSS
// import * as XLSX from 'xlsx'; // Import xlsx library
// import { saveAs } from 'file-saver'; // Import file-saver library
// import CommonButton from "../../components/CommonButton";

// const DataCenterList = () => {
//   const [allDataCenters, setAllDataCenters] = useState([]); // Stores all fetched data centers
//   const [currentDataCenters, setCurrentDataCenters] = useState([]); // Data centers for the current page
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   // Client-side pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const [dataCentersPerPage] = useState(10); // Number of data centers to show per page
//   const [totalPages, setTotalPages] = useState(1);
  
//   const permissions = usePermissions(); // Access permission context
//   const canDeleteDatacenter = permissions.includes('datacenter-delete');
//   const canCreateDatacenter = permissions.includes('datacenter-add');
//   const canEditDatacenter = permissions.includes('datacenter-edit');

//   useEffect(() => {
//     loadAllDataCenters(); // Call the function to load all data centers
//   }, []);

//   // Effect to update currentDataCenters whenever currentPage or allDataCenters changes
//   useEffect(() => {
//     const indexOfLastDC = currentPage * dataCentersPerPage;
//     const indexOfFirstDC = indexOfLastDC - dataCentersPerPage;
//     setCurrentDataCenters(allDataCenters.slice(indexOfFirstDC, indexOfLastDC));
//   }, [currentPage, allDataCenters, dataCentersPerPage]);

//   const loadAllDataCenters = async () => {
//     try {
//       setLoading(true);
//       setError('');
//       const response = await fetchDataCenters(); // Fetches all data centers

//       if (Array.isArray(response)) {
//         setAllDataCenters(response);
//         setTotalPages(Math.ceil(response.length / dataCentersPerPage));
//         // Set initial current data centers for the first page
//         setCurrentPage(1); // Reset to first page when data changes
//         setCurrentDataCenters(response.slice(0, dataCentersPerPage));
//       } else {
//         setAllDataCenters([]);
//         setCurrentDataCenters([]);
//         setTotalPages(1);
//         setError('Failed to load data centers: Unexpected data format.');
//       }
//     } catch (err) {
//       console.error('Failed to load data centers:', err);
//       setError('Failed to load data centers.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = (id) => {
//     confirmAlert({
//       title: 'Confirm to delete',
//       message: 'Are you sure you want to delete this data center?',
//       buttons: [
//         {
//           label: 'Yes',
//           onClick: async () => {
//             try {
//               await deleteDataCenter(id);
//               // Optimistically update the list on successful deletion
//               const updatedAllDataCenters = allDataCenters.filter(dc => dc.id !== id);
//               setAllDataCenters(updatedAllDataCenters);
              
//               const newTotalPages = Math.ceil(updatedAllDataCenters.length / dataCentersPerPage);
//               setTotalPages(newTotalPages);

//               // If current page becomes empty or exceeds new total pages, go to the last valid page
//               if (currentPage > newTotalPages && currentPage > 1) {
//                 setCurrentPage(newTotalPages);
//               } else if (currentDataCenters.length === 1 && currentPage > 1 && updatedAllDataCenters.length % dataCentersPerPage === 0) {
//                  // If the last item on a page is deleted, and it was a full page, move to the previous page
//                  setCurrentPage(prev => prev - 1);
//               }
//               // The useEffect for `currentDataCenters` will handle slicing the new `allDataCenters`
              
//             } catch (err) {
//               console.error('Failed to delete data center:', err);
//               setError('Failed to delete data center.');
//             }
//           },
//         },
//         { label: 'No' },
//       ],
//     });
//   };

//   const handleEdit = (id) => {
//     navigate(`/admin/settings/datacenter/${id}`);
//   };

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   // --- Export Functionality ---
//   const handleExport = () => {
//     // Prepare data for export
//     const dataToExport = allDataCenters.map((dc, index) => ({
//       No: index + 1, // Sequential number
//       Name: dc.name,
//       Division: dc.division,
//       Address: dc.address,
//       'Email Notification': dc.email_notification ? 'Yes' : 'No',
//       'SMS Notification': dc.sms_notification ? 'Yes' : 'No',
//       'Owner Type': dc.owner_type?.name || dc.owner_type_id || 'N/A',
//       Status: dc.status ? 'Active' : 'Inactive',
//       'Created At': new Date(dc.created_at).toLocaleString(),
//     }));

//     // Create a worksheet
//     const ws = XLSX.utils.json_to_sheet(dataToExport);

//     // Create a workbook and add the worksheet
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "DataCenters");

//     // Write the workbook to a buffer
//     const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

//     // Save the file
//     try {
//       saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'data_center_list.xlsx');
//     } catch (e) {
//       console.error("Error saving file:", e);
//       setError("Failed to export Excel file.");
//     }
//   };
//   // --- End Export Functionality ---

//   return (
//     <div className="data-center-list-container">
//       <h2>Data Center List</h2>
//       <div className="d-flex justify-content-between align-items-center mb-3"> {/* Added div for spacing buttons */}
      
      
//        {canCreateDatacenter && (
//   <CommonButton
//     name="addNewDataCenter"
//     onClick={() => navigate('/admin/settings/datacenter')}
//   />
// )}

//         {/* Export Button */}
//        <CommonButton
//   name="export"
//   onClick={handleExport}
//   className="ms-2"
// />

//       </div>
                        
//       {loading ? (
//         <p>Loading...</p>
//       ) : error ? (
//         <p className="error-message">{error}</p>
//       ) : (
//         <> {/* Use a React Fragment to wrap table and pagination */}
//           <table className="data-center-table">
//             <thead>
//               <tr>
//                 <th>No</th> {/* Added index column */}
//                 <th>Name</th>
//                 <th>Division</th>
//                 <th>Address</th>
//                 <th>Email Notification</th>
//                 <th>SMS Notification</th>
//                 <th>Owner Type</th>
//                 <th>Status</th>
//                 <th>Created At</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentDataCenters.length > 0 ? (
//                 currentDataCenters.map((dc, index) => (
//                   <tr key={dc.id}>
//                     {/* Calculate sequential number for the current page */}
//                     <td>{(currentPage - 1) * dataCentersPerPage + index + 1}</td> 
//                     <td>{dc.name}</td>
//                     <td>{dc.division}</td>
//                     <td>{dc.address}</td>
//                     <td>{dc.email_notification ? 'Yes' : 'No'}</td>
//                     <td>{dc.sms_notification ? 'Yes' : 'No'}</td>
//                     <td>{dc.owner_type?.name || dc.owner_type_id || 'N/A'}</td>
//                     <td>{dc.status ? 'Active' : 'Inactive'}</td>
//                     <td>{new Date(dc.created_at).toLocaleString()}</td>
//                     <td>
//                       <div className="action-buttons">
//   {canEditDatacenter && (
//     <CommonButton
//       name="edit"
//       onClick={() => handleEdit(dc.id)}
//       className="me-2"
//     />
//   )}
//   {canDeleteDatacenter && (
//     <CommonButton
//       name="delete"
//       onClick={() => handleDelete(dc.id)}
//     />
//   )}
// </div>

//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="10" className="text-center">No data centers found.</td> {/* Adjusted colspan */}
//                 </tr>
//               )}
//             </tbody>
//           </table>

//           {/* Pagination Controls - Similar Styling */}
//           {totalPages > 1 && ( // Only show pagination if there's more than 1 page
//             <nav className="mt-3"> {/* Add a top margin for spacing */}
//               <ul className="pagination justify-content-center">
//                 {[...Array(totalPages)].map((_, i) => (
//                   <li
//                     key={i}
//                     className={`page-item ${
//                       currentPage === i + 1
//                         ? "active"
//                         : ""
//                     }`}
//                   >
//                     <button
//                       className="page-link"
//                       onClick={() => handlePageChange(i + 1)}
//                     >
//                       {i + 1}
//                     </button>
//                   </li>
//                 ))}
//               </ul>
//             </nav>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default DataCenterList;
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { fetchDataCenters, deleteDataCenter } from '../../api/settings/dataCenterApi';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../context/PermissionContext';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Edit, Trash2, Plus, Download } from 'lucide-react'; // New icons for actions/export

// NEW COMPONENTS IMPORT
import Button from "../../components/ui/Button"; // Standard Button component
import DataTable from "../../components/table/DataTable"; // DataTable component

// ================================================================
// 1. CSS for Icon Button and Layout Consistency (Copied from previous example)
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
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
    .data-table-btn-icon:hover {
        background-color: #e5e7eb; /* Light gray background on hover */
        border-radius: 0.25rem;
    }
    .data-table-btn-icon:focus {
        outline: 2px solid #6366f1; /* Custom focus ring for accessibility */
        outline-offset: 2px;
        box-shadow: none;
    }
`;

// Helper styles for the non-card layout
const pageLayoutStyles = `
    .data-center-list-container {
        padding: 1.5rem; /* p-6 */
        background-color: #f9fafb; /* gray-50 equivalent for background */
    }

    /* REVISED: NO CARD STYLE FOR HEADER */
    .data-center-header {
        background-color: transparent; 
        padding: 0; 
        border-radius: 0; 
        margin-bottom: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #e5e7eb; 
        padding-bottom: 1rem;
    }

    /* Styles for badges within the table */
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


const DataCenterList = () => {
  const [dataCenters, setDataCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const permissions = usePermissions();
  const canDeleteDatacenter = permissions.includes('datacenter-delete');
  const canCreateDatacenter = permissions.includes('datacenter-add');
  const canEditDatacenter = permissions.includes('datacenter-edit');
  const canExportDatacenter = permissions.includes('datacenter-export'); // Assuming a permission for export

  // --- Data Loading Logic ---
  useEffect(() => {
    loadDataCenters();
  }, []);

  const loadDataCenters = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchDataCenters();

      if (Array.isArray(response)) {
        setDataCenters(response);
      } else {
        setDataCenters([]);
        setError('Failed to load data centers: Unexpected data format.');
      }
    } catch (err) {
      console.error('Failed to load data centers:', err);
      setError('Failed to load data centers.');
    } finally {
      setLoading(false);
    }
  };
  
  // --- Action Handlers (Wrapped in useCallback for Memoization) ---

  const handleDelete = useCallback((id) => {
    confirmAlert({
      title: 'Confirm to delete',
      message: 'Are you sure you want to delete this data center?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await deleteDataCenter(id);
              // Update state to remove the deleted item
              setDataCenters(prevDCs => prevDCs.filter(dc => dc.id !== id));
            } catch (err) {
              console.error('Failed to delete data center:', err);
              setError('Failed to delete data center.');
            }
          },
        },
        { label: 'No' },
      ],
    });
  }, []); // Empty dependency array means this function is created once

  const handleEdit = useCallback((id) => {
    navigate(`/admin/settings/datacenter/${id}`);
  }, [navigate]);

  // --- Export Functionality (Identical Logic) ---
  const handleExport = () => {
    const dataToExport = dataCenters.map((dc, index) => ({
      No: index + 1,
      Name: dc.name,
      Division: dc.division,
      Address: dc.address,
      'Email Notification': dc.email_notification ? 'Yes' : 'No',
      'SMS Notification': dc.sms_notification ? 'Yes' : 'No',
      'Owner Type': dc.owner_type?.name || dc.owner_type_id || 'N/A',
      Status: dc.status ? 'Active' : 'Inactive',
      'Created At': new Date(dc.created_at).toLocaleString(),
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DataCenters");
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    try {
      saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'data_center_list.xlsx');
    } catch (e) {
      console.error("Error saving file:", e);
      setError("Failed to export Excel file.");
    }
  };
  // --- End Export Functionality ---
  
  // --- DATATABLE COLUMN CONFIGURATION (useMemo for stability) ---
  const columns = useMemo(() => [
    // DataTable automatically handles the "No" column if `showId` is true, but we'll manually configure more readable columns
    { key: "id", header: "ID" }, 
    { key: "name", header: "Name" },
    { key: "division", header: "Division" },
    { key: "address", header: "Address" },
    { 
        key: "email_notification", 
        header: "Email Notify",
        render: (value) => value ? 'Yes' : 'No',
    },
    { 
        key: "sms_notification", 
        header: "SMS Notify",
        render: (value) => value ? 'Yes' : 'No',
    },
    { 
        key: "owner_type", 
        header: "Owner Type",
        render: (owner_type, row) => owner_type?.name || row.owner_type_id || 'N/A',
    },
    {
      key: "status",
      header: "Status",
      isSortable: false,
      render: (status) => {
        const isActive = status === true || status === 1;
        return (
          <span className={`badge ${isActive ? "bg-success" : "bg-secondary"}`}>
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
        key: "created_at",
        header: "Created At",
        render: (value) => new Date(value).toLocaleString(),
    },
    {
      key: "actions",
      header: "Actions",
      isSortable: false,
      render: (v, row) => (
        <div className="d-flex gap-2 justify-content-center">
          {canEditDatacenter && (
            <button 
              className="data-table-btn-icon text-indigo-500 hover:text-indigo-700" 
              onClick={() => handleEdit(row.id)} 
              title="Edit Data Center"
            >
              <Edit size={16} />
            </button>
          )}
          {canDeleteDatacenter && (
            <button 
              className="data-table-btn-icon text-red-500 hover:text-red-700" 
              onClick={() => handleDelete(row.id)} 
              title="Delete Data Center"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ], [canEditDatacenter, canDeleteDatacenter, handleEdit, handleDelete]);
  // --- END DATATABLE COLUMN CONFIGURATION ---


  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    // Inject the necessary CSS
    <>
      <style>{iconButtonStyles}</style>
      <style>{pageLayoutStyles}</style>

      <div className="data-center-list-container">

        {/* Header Section (Non-card look) */}
        <header className="data-center-header">
            <h2 className="text-xl font-bold">Data Center List</h2>

            <div className="d-flex gap-2">
                {/* Add New Button */}
                {canCreateDatacenter && (
                    <Button
                        intent="primary"
                        leftIcon={Plus}
                        onClick={() => navigate('/admin/settings/datacenter')}
                    >
                        Add New
                    </Button>
                )}
                {/* Export Button */}
                {canExportDatacenter && (
                    <Button
                        intent="secondary"
                        leftIcon={Download}
                        onClick={handleExport}
                    >
                        Export
                    </Button>
                )}
            </div>
        </header>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* DataTable Component (Wrapped in a light card for visual clarity) */}
        <div className="p-4 bg-white rounded-lg shadow-sm">
            <DataTable
              title="Data Center Records" // Title can be used internally by DataTable
              data={dataCenters} 
              columns={columns} 
              showId={false} // Display a sequential ID column
              initialPageSize={10} // Keep 10 per page
              searchable={true} 
              selection={false}
              isBackendPagination={false} // Client-side handling
              // No need for manual pagination controls, DataTable handles them
            />
        </div>
      </div>
    </>
  );
};

export default DataCenterList;