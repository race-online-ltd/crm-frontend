// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { fetchDevices, deleteDevice } from "../../api/deviceApi";
// import { usePermissions } from "../../context/PermissionContext";
// import { confirmAlert } from "react-confirm-alert"; // New import
// import "react-confirm-alert/src/react-confirm-alert.css"; // New import
// import * as XLSX from 'xlsx'; // New import
// import { saveAs } from 'file-saver'; // New import
// import CommonButton from "../../components/CommonButton";

// const DeviceListShow = () => {
//     const permissions = usePermissions();
//     const canDeleteDevice = permissions.includes("device-delete");
//     const canCreateDevice = permissions.includes("device-create");
//     const canEditDevice = permissions.includes("device-edit");

//     // State changes for pagination
//     const [allDevices, setAllDevices] = useState([]); // Stores all devices fetched
//     const [currentDevices, setCurrentDevices] = useState([]); // Devices for the current page
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     // Pagination state for client-side
//     const [currentPage, setCurrentPage] = useState(1);
//     const [devicesPerPage] = useState(10); // Number of devices to show per page
//     const [totalPages, setTotalPages] = useState(1);

//     useEffect(() => {
//         const loadAllDevices = async () => { // Renamed from loadDevices
//             try {
//                 setLoading(true); // Ensure loading is set
//                 setError(null); // Clear previous errors
//                 const data = await fetchDevices();

//                 if (Array.isArray(data)) {
//                     setAllDevices(data);
//                     setTotalPages(Math.ceil(data.length / devicesPerPage));
//                     setCurrentDevices(data.slice(0, devicesPerPage)); // Initialize current devices
//                 } else {
//                     setAllDevices([]);
//                     setTotalPages(1);
//                     setCurrentDevices([]);
//                     setError("Fetched data is not an array or is empty.");
//                 }
//                 setLoading(false);
//             } catch (err) {
//                 setError(err.message);
//                 setLoading(false);
//             }
//         };
//         loadAllDevices();
//     }, []);

//     // Effect to update currentDevices when currentPage or allDevices changes
//     useEffect(() => {
//         const indexOfLastDevice = currentPage * devicesPerPage;
//         const indexOfFirstDevice = indexOfLastDevice - devicesPerPage;
//         setCurrentDevices(allDevices.slice(indexOfFirstDevice, indexOfLastDevice));
//     }, [currentPage, allDevices, devicesPerPage]);

//     const handleDelete = (id) => { // Modified to use confirmAlert
//         confirmAlert({
//             title: "Confirm to delete",
//             message: "Are you sure you want to delete this device?",
//             buttons: [
//                 {
//                     label: "Yes",
//                     onClick: async () => {
//                         try {
//                             await deleteDevice(id);
//                             // Filter from allDevices and re-calculate pagination
//                             const updatedAllDevices = allDevices.filter(device => device.id !== id);
//                             setAllDevices(updatedAllDevices); // Update the source of truth
//                             setTotalPages(Math.ceil(updatedAllDevices.length / devicesPerPage));

//                             // If current page becomes empty after deletion, go to previous page
//                             const newTotalPages = Math.ceil(updatedAllDevices.length / devicesPerPage);
//                             if (currentPage > newTotalPages && currentPage > 1) {
//                                 setCurrentPage(newTotalPages);
//                             } else {
//                                 // Re-trigger useEffect to slice current page if not changing page number
//                                 // This ensures the current page updates correctly if an item is deleted from it
//                                 setCurrentDevices(updatedAllDevices.slice(
//                                     (currentPage - 1) * devicesPerPage,
//                                     currentPage * devicesPerPage
//                                 ));
//                             }

//                         } catch (err) {
//                             setError(err.message);
//                         }
//                     },
//                 },
//                 { label: "No" },
//             ],
//         });
//     };

//     // New function for pagination page change
//     const handlePageChange = (pageNumber) => {
//         setCurrentPage(pageNumber);
//     };

//     // New Export Functionality
//     const handleExport = () => {
//         // Prepare data for export
//         const dataToExport = allDevices.map((device, index) => ({
//             No: index + 1, // Sequential number
//             Name: device.name,
//             'Data Center': device.data_center?.name || 'N/A',
//             Location: device.location,
//             'Secret Key': device.secret_key || 'Not set',
//             'Control Topic': device.control_topic || 'Not set', // Added back
//             Status: device.status === 1 ? 'Active' : 'Inactive',
//         }));

//         // Create a worksheet
//         const ws = XLSX.utils.json_to_sheet(dataToExport);

//         // Create a workbook and add the worksheet
//         const wb = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(wb, ws, "Devices");

//         // Write the workbook to a buffer
//         const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

//         // Save the file
//         try {
//             saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'device_list.xlsx');
//         } catch (e) {
//             console.error("Error saving file:", e);
//             setError("Failed to export Excel file.");
//         }
//     };

//     if (loading) return <div>Loading...</div>;
//     if (error) return <div>Error: {error}</div>;

//     return (
//         <div className="container">
//             <h2>Device List</h2>
//             {/* Flex container for buttons */}
//             <div className="d-flex justify-content-between align-items-center mb-3">
//                 {canCreateDevice && (
//                     <Link
//                         to="/admin/settings/devices-create"
//                         className="btn btn-primary text-white me-2"
//                     >
//                         Add New Device
//                     </Link>
//                 )}
//                 {/* Export Button */}
//                 <button className="btn btn-success" onClick={handleExport}>
//                     Export
//                 </button>
//             </div>

//             <table className="table table-striped">
//                 <thead>
//                     <tr>
//                         <th>No</th> {/* New column */}
//                         <th>Name</th>
//                         <th>Data Center</th>
//                         <th>Location</th>
//                         <th>Secret Key</th> {/* Renamed from Received Topic */}
//                         <th>Control Topic</th> {/* Restored column */}
//                         <th>Status</th>
//                         <th>Actions</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {currentDevices.length > 0 ? (
//                         currentDevices.map((device, index) => (
//                             <tr key={device.id}>
//                                 <td>
//                                     {(currentPage - 1) * devicesPerPage + index + 1}
//                                 </td>
//                                 <td>{device.name}</td>
//                                 <td>{device.data_center?.name || "N/A"}</td>
//                                 <td>{device.location}</td>
//                                 <td>{device.secret_key || "Not set"}</td>
//                                 <td>{device.control_topic || "Not set"}</td> {/* Restored cell */}
//                                 <td>
//                                     <span
//                                         className={`badge ${
//                                             device.status === 1
//                                                 ? "bg-success"
//                                                 : "bg-secondary"
//                                         }`}
//                                     >
//                                         {device.status === 1
//                                             ? "Active"
//                                             : "Inactive"}
//                                     </span>
//                                 </td>




// {/* pls check here for gap issue !!!!!!!!!!!!!!!! */}


//                                 <td>
//                                     <div className="d-flex g-2">
//   {canEditDevice && (
//     <Link
//       to={`/admin/settings/devices-edit/${device.id}`}
//       style={{ textDecoration: 'none' }}
//     >
//       <CommonButton name="edit" />
//     </Link>
//   )}
//   {canDeleteDevice && (
//     <CommonButton
//       name="delete"
//       onClick={() => handleDelete(device.id)}
//     />
//   )}
//   </div>
// </td>



//                             </tr>
//                         ))
//                     ) : (
//                         <tr>
//                             <td colSpan="8" className="text-center"> {/* Increased colspan */}
//                                 No devices found.
//                             </td>
//                         </tr>
//                     )}
//                 </tbody>
//             </table>

//             {/* Pagination Controls */}
//             {totalPages > 1 && (
//                 <nav>
//                     <ul className="pagination justify-content-center">
//                         {[...Array(totalPages)].map((_, i) => (
//                             <li
//                                 key={i}
//                                 className={`page-item ${
//                                     currentPage === i + 1
//                                         ? "active"
//                                         : ""
//                                 }`}
//                             >
//                                 <button
//                                     className="page-link"
//                                     onClick={() => handlePageChange(i + 1)}
//                                 >
//                                     {i + 1}
//                                 </button>
//                             </li>
//                         ))}
//                     </ul>
//                 </nav>
//             )}
//         </div>
//     );
// };

// export default DeviceListShow;
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // Use useNavigate instead of Link for Add button
import { fetchDevices, deleteDevice } from "../../api/deviceApi";
import { usePermissions } from "../../context/PermissionContext";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Edit, Trash2, Plus, Download } from 'lucide-react';

// NEW COMPONENTS IMPORT
import Button from "../../components/ui/Button"; // Standard Button component
import DataTable from "../../components/table/DataTable"; // DataTable component

// ================================================================
// 1. CSS for Icon Button and Layout Consistency (Consistent with previous files)
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
    .device-list-container {
        padding: 1.5rem; /* p-6 */
        background-color: #f9fafb; /* gray-50 equivalent for background */
    }

    /* REVISED: NO CARD STYLE FOR HEADER */
    .device-list-header {
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


const DeviceListShow = () => {
    const permissions = usePermissions();
    const canDeleteDevice = permissions.includes("device-delete");
    const canCreateDevice = permissions.includes("device-create");
    const canEditDevice = permissions.includes("device-edit");
    const canExportDevice = permissions.includes("device-export"); // Assuming an export permission

    const [devices, setDevices] = useState([]); // Stores all devices fetched
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // --- Data Loading Logic ---
    useEffect(() => {
        const loadAllDevices = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchDevices();

                if (Array.isArray(data)) {
                    setDevices(data);
                } else {
                    setDevices([]);
                    setError("Fetched data is not an array or is empty.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadAllDevices();
    }, []);

    // --- Action Handlers (Wrapped in useCallback) ---
    
    // Note: DataTable handles filtering/pagination, so we only need to manage the source state (`devices`)
    const handleDelete = useCallback((id) => {
        confirmAlert({
            title: "Confirm to delete",
            message: "Are you sure you want to delete this device?",
            buttons: [
                {
                    label: "Yes",
                    onClick: async () => {
                        try {
                            await deleteDevice(id);
                            // Update state to remove the deleted item
                            setDevices(prevDevices => prevDevices.filter(device => device.id !== id));
                        } catch (err) {
                            console.error('Failed to delete device:', err);
                            setError("Failed to delete device.");
                        }
                    },
                },
                { label: "No" },
            ],
        });
    }, []); // Empty dependency array means this function is created once

    const handleEdit = useCallback((id) => {
        navigate(`/admin/settings/devices-edit/${id}`);
    }, [navigate]);


    // --- Export Functionality (Identical Logic) ---
    const handleExport = () => {
        const dataToExport = devices.map((device, index) => ({
            No: index + 1,
            Name: device.name,
            'Data Center': device.data_center?.name || 'N/A',
            Location: device.location,
            'Secret Key': device.secret_key || 'Not set',
            'Control Topic': device.control_topic || 'Not set',
            Status: device.status === 1 ? 'Active' : 'Inactive',
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Devices");
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

        try {
            saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'device_list.xlsx');
        } catch (e) {
            console.error("Error saving file:", e);
            setError("Failed to export Excel file.");
        }
    };
    // --- End Export Functionality ---

    // --- DATATABLE COLUMN CONFIGURATION (useMemo for stability) ---
    const columns = useMemo(() => [
        // DataTable handles the "No" column via showId={true}
        { key: "id", header: "Device ID" },
        { key: "name", header: "Name" },
        { 
            key: "data_center", 
            header: "Data Center",
            render: (data_center) => data_center?.name || "N/A",
        },
        { key: "location", header: "Location" },
        { 
            key: "secret_key", 
            header: "Secret Key",
            render: (value) => value || "Not set",
        },
        { 
            key: "control_topic", 
            header: "Control Topic",
            render: (value) => value || "Not set",
        },
        {
            key: "status",
            header: "Status",
            isSortable: false,
            render: (status) => {
                const isActive = status === 1;
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
            render: (v, row) => (
                // Use consistent styling for action buttons
                <div className="d-flex gap-2 justify-content-center">
                    {canEditDevice && (
                        <button 
                            className="data-table-btn-icon text-indigo-500 hover:text-indigo-700" 
                            onClick={() => handleEdit(row.id)} 
                            title="Edit Device"
                        >
                            <Edit size={16} />
                        </button>
                    )}
                    {canDeleteDevice && (
                        <button 
                            className="data-table-btn-icon text-red-500 hover:text-red-700" 
                            onClick={() => handleDelete(row.id)} 
                            title="Delete Device"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            ),
        },
    ], [canEditDevice, canDeleteDevice, handleEdit, handleDelete]);
    // --- END DATATABLE COLUMN CONFIGURATION ---


    if (loading) {
      return <div className="text-center p-4">Loading...</div>;
    }
    
    return (
        // Inject the necessary CSS
        <>
            <style>{iconButtonStyles}</style>
            <style>{pageLayoutStyles}</style>

            <div className="device-list-container">

                {/* Header Section (Non-card look) */}
                <header className="device-list-header">
                    <h2 className="text-xl font-bold">Device List</h2>

                    <div className="d-flex gap-2">
                        {/* Add New Button */}
                        {canCreateDevice && (
                            <Button
                                intent="primary"
                                leftIcon={Plus}
                                onClick={() => navigate('/admin/settings/devices-create')}
                            >
                                Add New Device
                            </Button>
                        )}
                        {/* Export Button */}
                        {canExportDevice && (
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
                        title="Device Records" 
                        data={devices} 
                        columns={columns} 
                        showId={true} // Display sequential ID
                        initialPageSize={10} 
                        searchable={true} 
                        selection={false}
                        isBackendPagination={false} // Client-side handling
                    />
                </div>
            </div>
        </>
    );
};

export default DeviceListShow;