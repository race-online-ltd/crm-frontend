// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { fetchSensorLists, deleteSensorList } from "../../api/sensorListApi";
// import { usePermissions } from "../../context/PermissionContext";
// import { confirmAlert } from "react-confirm-alert"; // Import confirmAlert
// import "react-confirm-alert/src/react-confirm-alert.css"; // Import its CSS
// import * as XLSX from "xlsx"; // Import xlsx library
// import { saveAs } from "file-saver"; // Import file-saver library
// import CommonButton from "../../components/CommonButton";

// const SensorList = () => {
//   const permissions = usePermissions();
//   const canDeleteSensor = permissions.includes("sensor-delete");
//   const canCreateSensor = permissions.includes("sensor-create");
//   const canEditSensor = permissions.includes("sensor-edit");

//   const [allSensors, setAllSensors] = useState([]); // Stores all fetched sensors
//   const [currentSensors, setCurrentSensors] = useState([]); // Sensors for the current page
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Client-side pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const [sensorsPerPage] = useState(10); // Number of sensors to show per page (can be adjusted)
//   const [totalPages, setTotalPages] = useState(1);

//   useEffect(() => {
//     loadAllSensors(); // Initial load of all sensors
//   }, []);

//   // Effect to update currentSensors whenever currentPage or allSensors changes
//   useEffect(() => {
//     const indexOfLastSensor = currentPage * sensorsPerPage;
//     const indexOfFirstSensor = indexOfLastSensor - sensorsPerPage;
//     setCurrentSensors(allSensors.slice(indexOfFirstSensor, indexOfLastSensor));
//   }, [currentPage, allSensors, sensorsPerPage]);

//   const loadAllSensors = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const data = await fetchSensorLists(); // Fetches all sensors

//       if (Array.isArray(data)) {
//         setAllSensors(data);
//         setTotalPages(Math.ceil(data.length / sensorsPerPage));
//         // Reset to first page when new data is loaded
//         setCurrentPage(1);
//         setCurrentSensors(data.slice(0, sensorsPerPage));
//       } else {
//         setAllSensors([]);
//         setCurrentSensors([]);
//         setTotalPages(1);
//         setError("Failed to load sensors: Unexpected data format.");
//       }
//     } catch (err) {
//       setError(err.message);
//       setLoading(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = (id) => {
//     confirmAlert({
//       title: "Confirm to delete",
//       message: "Are you sure you want to delete this sensor?",
//       buttons: [
//         {
//           label: "Yes",
//           onClick: async () => {
//             try {
//               await deleteSensorList(id);
//               // Filter from allSensors and update pagination
//               const updatedAllSensors = allSensors.filter(
//                 (sensor) => sensor.id !== id
//               );
//               setAllSensors(updatedAllSensors);

//               const newTotalPages = Math.ceil(
//                 updatedAllSensors.length / sensorsPerPage
//               );
//               setTotalPages(newTotalPages);

//               // Adjust current page if it's now beyond the new total pages or if the current page became empty
//               if (currentPage > newTotalPages && currentPage > 1) {
//                 setCurrentPage(newTotalPages);
//               } else if (
//                 currentSensors.length === 1 &&
//                 currentPage > 1 &&
//                 updatedAllSensors.length % sensorsPerPage === 0
//               ) {
//                 // If the last item on a page is deleted, and it was a full page, move to the previous page
//                 setCurrentPage((prev) => prev - 1);
//               }
//               // The useEffect for `currentSensors` will handle slicing the new `allSensors`
//             } catch (err) {
//               setError(err.message);
//             }
//           },
//         },
//         { label: "No" },
//       ],
//     });
//   };

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   // --- Export Functionality ---
//   const handleExport = () => {
//     // Prepare data for export
//     const dataToExport = allSensors.map((sensor, index) => ({
//       No: index + 1, // Sequential number
//       ID: sensor.id,
//       "Data Center": sensor.data_center?.name || "N/A",
//       Device: sensor.device?.name || "N/A",
//       "Sensor Type": sensor.sensor_type?.name || "N/A",
//       Location: sensor.location,
//       "Unique ID": sensor.unique_id,
//       Status: sensor.status ? "Active" : "Inactive",
//     }));

//     // Create a worksheet
//     const ws = XLSX.utils.json_to_sheet(dataToExport);

//     // Create a workbook and add the worksheet
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Sensors");

//     // Write the workbook to a buffer
//     const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

//     // Save the file
//     try {
//       saveAs(
//         new Blob([wbout], { type: "application/octet-stream" }),
//         "sensor_list.xlsx"
//       );
//     } catch (e) {
//       console.error("Error saving file:", e);
//       setError("Failed to export Excel file.");
//     }
//   };
//   // --- End Export Functionality ---

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div className='container'>
//       <div className='d-flex justify-content-between align-items-center mb-4'>
//         <h1>Sensor List</h1>
//         <div>
//           {" "}
//           {/* Group buttons in a div for layout */}
//           {canCreateSensor && (
//             <Link to='/admin/settings/sensor-lists/create'>
//               <CommonButton name='createSensor' />
//             </Link>
//           )}
//           <CommonButton name='export' onClick={handleExport} />
//         </div>
//       </div>

//       <table className='table table-striped'>
//         <thead>
//           <tr>
//             <th>No</th> {/* Added index column */}
//             <th>ID</th>
//             <th>Data Center</th>
//             <th>Device</th>
//             <th>Sensor_Type</th>
//             <th>Sensor Name</th>
//             <th>Location</th>
//             <th>Unique ID</th>
//             <th>Status</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {currentSensors.length > 0 ? (
//             currentSensors.map((sensor, index) => (
//               <tr key={sensor.id}>
//                 {/* Calculate sequential number for the current page */}
//                 <td>{(currentPage - 1) * sensorsPerPage + index + 1}</td>
//                 <td>{sensor.id}</td>
//                 <td>{sensor?.data_center?.name || "N/A"}</td>
//                 <td>{sensor?.device?.name || "N/A"}</td>
//                 <td>{sensor?.sensor_type?.name || "N/A"}</td>
//                 <td>{sensor.sensor_name || "N/A"}</td>

//                 <td>{sensor.location}</td>
//                 <td>{sensor.unique_id}</td>
//                 <td>
//                   <span
//                     className={`badge ${
//                       sensor.status ? "bg-success" : "bg-secondary"
//                     }`}>
//                     {sensor.status ? "Active" : "Inactive"}
//                   </span>
//                 </td>

//                 <td>
//                   <div className='d-flex gap-2'>
//                     {canEditSensor && (
//                       <Link to={`/admin/settings/sensor-edit/${sensor.id}`}>
//                         <CommonButton name='edit' />
//                       </Link>
//                     )}
//                     {canDeleteSensor && (
//                       <CommonButton
//                         name='delete'
//                         onClick={() => handleDelete(sensor.id)}
//                       />
//                     )}
//                   </div>
//                 </td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan='9' className='text-center'>
//                 {" "}
//                 {/* Adjusted colspan */}
//                 No sensors found.
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//       {/* Pagination Controls - Similar Styling */}
//       {totalPages > 1 && ( // Only show pagination if there's more than 1 page
//         <nav className='mt-3'>
//           <ul className='pagination justify-content-center'>
//             {[...Array(totalPages)].map((_, i) => (
//               <li
//                 key={i}
//                 className={`page-item ${
//                   currentPage === i + 1 ? "active" : ""
//                 }`}>
//                 <button
//                   className='page-link'
//                   onClick={() => handlePageChange(i + 1)}>
//                   {i + 1}
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </nav>
//       )}
//     </div>
//   );
// };

// export default SensorList;
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // Use useNavigate instead of Link
import { fetchSensorLists, deleteSensorList } from "../../api/sensorListApi";
import { usePermissions } from "../../context/PermissionContext";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
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
    .sensor-list-container {
        padding: 1.5rem; /* p-6 */
        background-color: #f9fafb; /* gray-50 equivalent for background */
    }

    /* REVISED: NO CARD STYLE FOR HEADER */
    .sensor-list-header {
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


const SensorList = () => {
    const permissions = usePermissions();
    const canDeleteSensor = permissions.includes("sensor-delete");
    const canCreateSensor = permissions.includes("sensor-create");
    const canEditSensor = permissions.includes("sensor-edit");
    const canExportSensor = permissions.includes("sensor-export"); // Assuming an export permission

    const [sensors, setSensors] = useState([]); // Renamed from allSensors for clarity with DataTable
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // --- Data Loading Logic ---
    useEffect(() => {
        loadAllSensors();
    }, []);

    const loadAllSensors = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchSensorLists(); // Fetches all sensors

            if (Array.isArray(data)) {
                setSensors(data);
            } else {
                setSensors([]);
                setError("Failed to load sensors: Unexpected data format.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Action Handlers (Wrapped in useCallback) ---
    const handleDelete = useCallback((id) => {
        confirmAlert({
            title: "Confirm to delete",
            message: "Are you sure you want to delete this sensor?",
            buttons: [
                {
                    label: "Yes",
                    onClick: async () => {
                        try {
                            await deleteSensorList(id);
                            // Update state to remove the deleted item
                            setSensors(prevSensors => prevSensors.filter((sensor) => sensor.id !== id));
                        } catch (err) {
                            console.error('Failed to delete sensor:', err);
                            setError("Failed to delete sensor.");
                        }
                    },
                },
                { label: "No" },
            ],
        });
    }, []);

    const handleEdit = useCallback((id) => {
        navigate(`/admin/settings/sensor-edit/${id}`);
    }, [navigate]);

    // --- Export Functionality (Identical Logic) ---
    const handleExport = () => {
        const dataToExport = sensors.map((sensor, index) => ({
            No: index + 1,
            ID: sensor.id,
            "Data Center": sensor.data_center?.name || "N/A",
            Device: sensor.device?.name || "N/A",
            "Sensor Type": sensor.sensor_type?.name || "N/A",
            "Sensor Name": sensor.sensor_name || "N/A",
            Location: sensor.location,
            "Unique ID": sensor.unique_id,
            Status: sensor.status ? "Active" : "Inactive",
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sensors");
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

        try {
            saveAs(
                new Blob([wbout], { type: "application/octet-stream" }),
                "sensor_list.xlsx"
            );
        } catch (e) {
            console.error("Error saving file:", e);
            setError("Failed to export Excel file.");
        }
    };
    // --- End Export Functionality ---

    // --- DATATABLE COLUMN CONFIGURATION (useMemo for stability) ---
    const columns = useMemo(() => [
        // DataTable handles the "No" column via showId={true}, but we explicitly map the ID for the table
        { key: "id", header: "ID" },
        { 
            key: "data_center", 
            header: "Data Center",
            render: (data_center) => data_center?.name || "N/A",
        },
        { 
            key: "device", 
            header: "Device",
            render: (device) => device?.name || "N/A",
        },
        { 
            key: "sensor_type", 
            header: "Sensor Type",
            render: (sensor_type) => sensor_type?.name || "N/A",
        },
        { key: "sensor_name", header: "Sensor Name" },
        { key: "location", header: "Location" },
        { key: "unique_id", header: "Unique ID" },
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
            key: "actions",
            header: "Actions",
            isSortable: false,
            render: (v, row) => (
                // Use consistent styling for action buttons
                <div className="d-flex gap-2 justify-content-center">
                    {canEditSensor && (
                        <button 
                            className="data-table-btn-icon text-indigo-500 hover:text-indigo-700" 
                            onClick={() => handleEdit(row.id)} 
                            title="Edit Sensor"
                        >
                            <Edit size={16} />
                        </button>
                    )}
                    {canDeleteSensor && (
                        <button 
                            className="data-table-btn-icon text-red-500 hover:text-red-700" 
                            onClick={() => handleDelete(row.id)} 
                            title="Delete Sensor"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            ),
        },
    ], [canEditSensor, canDeleteSensor, handleEdit, handleDelete]);
    // --- END DATATABLE COLUMN CONFIGURATION ---

    if (loading) {
        return <div className="text-center p-4">Loading...</div>;
    }

    return (
        // Inject the necessary CSS
        <>
            <style>{iconButtonStyles}</style>
            <style>{pageLayoutStyles}</style>

            <div className="sensor-list-container">

                {/* Header Section (Non-card look) */}
                <header className="sensor-list-header">
                    <h2 className="text-xl font-bold">Sensor List</h2>

                    <div className="d-flex gap-2">
                        {/* Add New Button */}
                        {canCreateSensor && (
                            <Button
                                intent="primary"
                                leftIcon={Plus}
                                onClick={() => navigate('/admin/settings/sensor-lists/create')}
                            >
                                Add New Sensor
                            </Button>
                        )}
                        {/* Export Button */}
                        {canExportSensor && (
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
                        title="Sensor Records"
                        data={sensors}
                        columns={columns}
                        showId={false} // Display sequential ID column
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

export default SensorList;