// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   fetchThresholdValues,
//   fetchThresholdValue,
//   createThresholdValue,
//   updateThresholdValue,
//   deleteThresholdValue
// } from '../../api/thresholdValueApi';
// import { fetchSensorsByDevice } from '../../api/sensorListApi';
// import { fetchThresholdTypes } from '../../api/thresholdTypeApi';
// import { fetchDataCenters } from '../../api/settings/dataCenterApi';
// import { fetchDevicesByDataCenter } from '../../api/deviceApi';
// import { confirmAlert } from 'react-confirm-alert'; // Import confirmAlert
// import 'react-confirm-alert/src/react-confirm-alert.css'; // Import its CSS
// import * as XLSX from 'xlsx'; // Import xlsx library
// import { saveAs } from 'file-saver'; // Import file-saver library
// import CommonButton from '../../components/CommonButton'; // Adjust path as needed

// const ThresholdValues = () => {
//   const [allThresholdValues, setAllThresholdValues] = useState([]); // Stores all fetched threshold values
//   const [currentThresholdValues, setCurrentThresholdValues] = useState([]); // Values for the current page
//   const [dataCenters, setDataCenters] = useState([]);
//   const [devices, setDevices] = useState([]);
//   const [sensors, setSensors] = useState([]);
//   const [thresholdTypes, setThresholdTypes] = useState([]);
//   const [currentThreshold, setCurrentThreshold] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState({
//     data_center_id: '',
//     device_id: '',
//     sensor_id: '',
//     threshold_type_id: '',
//     threshold: '',
//     timestamp: new Date().toISOString()
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Client-side pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const [thresholdsPerPage] = useState(5); // Number of items to show per page
//   const [totalPages, setTotalPages] = useState(1);

//   useEffect(() => {
//     const loadInitialData = async () => {
//       try {
//         const [valuesResponse, centers, types] = await Promise.all([
//           fetchThresholdValues(),
//           fetchDataCenters(),
//           fetchThresholdTypes()
//         ]);

//         const fetchedValues = Array.isArray(valuesResponse) ? valuesResponse : [];
//         setAllThresholdValues(fetchedValues);
//         setTotalPages(Math.ceil(fetchedValues.length / thresholdsPerPage));
//         setCurrentThresholdValues(fetchedValues.slice(0, thresholdsPerPage)); // Set initial page values

//         setDataCenters(centers);
//         setThresholdTypes(types);
//         setLoading(false);

//         // If editing, load related devices and sensors
//         if (isEditing && currentThreshold) {
//           const deviceResponse = await fetchDevicesByDataCenter(currentThreshold.sensor?.device?.data_center_id);
//           setDevices(deviceResponse);

//           const allSensors = await fetchSensorsByDevice(currentThreshold.sensor?.device_id);
//           const filteredSensors = allSensors.filter(sensor => sensor.trigger_type_id === 1);
//           setSensors(filteredSensors);
//         }
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     loadInitialData();
//   }, [isEditing, currentThreshold]);

//   // Effect to update currentThresholdValues when currentPage or allThresholdValues changes
//   useEffect(() => {
//     const indexOfLastThreshold = currentPage * thresholdsPerPage;
//     const indexOfFirstThreshold = indexOfLastThreshold - thresholdsPerPage;
//     setCurrentThresholdValues(allThresholdValues.slice(indexOfFirstThreshold, indexOfLastThreshold));
//   }, [currentPage, allThresholdValues, thresholdsPerPage]);

//   const handleDataCenterChange = async (e) => {
//     const dataCenterId = e.target.value;
//     setFormData({
//       ...formData,
//       data_center_id: dataCenterId,
//       device_id: '',
//       sensor_id: ''
//     });

//     if (dataCenterId) {
//       try {
//         const devices = await fetchDevicesByDataCenter(dataCenterId);
//         setDevices(devices);
//         setSensors([]);
//       } catch (err) {
//         setError(err.message);
//       }
//     } else {
//       setDevices([]);
//       setSensors([]);
//     }
//   };

//   const handleDeviceChange = async (e) => {
//     const deviceId = e.target.value;
//     setFormData({
//       ...formData,
//       device_id: deviceId,
//       sensor_id: ''
//     });

//     if (deviceId) {
//       try {
//         const allSensors = await fetchSensorsByDevice(deviceId);
//         const filteredSensors = allSensors.filter(sensor => sensor.trigger_type_id === 1);
//         setSensors(filteredSensors);
//       } catch (err) {
//         setError(err.message);
//       }
//     } else {
//       setSensors([]);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (isEditing && currentThreshold) {
//         await updateThresholdValue(currentThreshold.id, formData);
//       } else {
//         await createThresholdValue(formData);
//       }
//       // Re-fetch all values to update the master list and trigger re-pagination
//       const updatedValues = await fetchThresholdValues();
//       setAllThresholdValues(updatedValues);
//       setTotalPages(Math.ceil(updatedValues.length / thresholdsPerPage));
//       setCurrentPage(1); // Go to first page after add/update

//       resetForm();
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   const handleEdit = async (id) => {
//     try {
//       const threshold = await fetchThresholdValue(id);
//       setCurrentThreshold(threshold);
//       setFormData({
//         data_center_id: threshold.sensor?.device?.data_center_id || '',
//         device_id: threshold.sensor?.device_id || '',
//         sensor_id: threshold.sensor_id,
//         threshold_type_id: threshold.threshold_type_id,
//         threshold: threshold.threshold,
//         timestamp: threshold.timestamp || new Date().toISOString()
//       });
//       setIsEditing(true);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   const handleDelete = (id) => {
//     confirmAlert({
//       title: 'Confirm to delete',
//       message: 'Are you sure you want to delete this threshold value?',
//       buttons: [
//         {
//           label: 'Yes',
//           onClick: async () => {
//             try {
//               await deleteThresholdValue(id);
//               // Filter from allThresholdValues and update pagination
//               const updatedAllThresholdValues = allThresholdValues.filter(value => value.id !== id);
//               setAllThresholdValues(updatedAllThresholdValues);

//               const newTotalPages = Math.ceil(updatedAllThresholdValues.length / thresholdsPerPage);
//               setTotalPages(newTotalPages);

//               // Adjust current page if needed after deletion
//               if (currentPage > newTotalPages && currentPage > 1) {
//                 setCurrentPage(newTotalPages);
//               } else if (currentThresholdValues.length === 1 && currentPage > 1 && updatedAllThresholdValues.length % thresholdsPerPage === 0) {
//                  // If the last item on a page is deleted, and it was a full page, move to the previous page
//                  setCurrentPage(prev => prev - 1);
//               }
//               // The useEffect for `currentThresholdValues` will handle slicing the new `allThresholdValues`
//             } catch (err) {
//               setError(err.message);
//             }
//           },
//         },
//         { label: 'No' },
//       ],
//     });
//   };

//   const resetForm = () => {
//     setFormData({
//       data_center_id: '',
//       device_id: '',
//       sensor_id: '',
//       threshold_type_id: '',
//       threshold: '',
//       timestamp: new Date().toISOString()
//     });
//     setIsEditing(false);
//     setCurrentThreshold(null);
//   };

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   // --- Export Functionality ---
//   const handleExport = () => {
//     // Prepare data for export
//     const dataToExport = allThresholdValues.map((value, index) => ({
//       No: index + 1, // Sequential number
//       'Data Center': value.sensor?.data_center?.name || 'N/A',
//       Device: value.sensor?.device?.name || 'N/A',
//       Sensor: value.sensor?.name || `Sensor ${value.sensor_id}`,
//       'Sensor Type': value.sensor?.sensor_type?.name || 'N/A',
//       'Threshold Type': value.threshold_type?.name || `Type ${value.threshold_type_id}`,
//       Value: value.threshold,
//       Timestamp: new Date(value.timestamp).toLocaleString(), // Format timestamp nicely
//     }));

//     // Create a worksheet
//     const ws = XLSX.utils.json_to_sheet(dataToExport);

//     // Create a workbook and add the worksheet
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "ThresholdValues");

//     // Write the workbook to a buffer
//     const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

//     // Save the file
//     try {
//       saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'threshold_values.xlsx');
//     } catch (e) {
//       console.error("Error saving file:", e);
//       setError("Failed to export Excel file.");
//     }
//   };
//   // --- End Export Functionality ---

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//   <div className="container mt-4">
//     <div className="row">
     

//       {/* 2nd Section: Threshold List */}
      
//       <div className="col-12">
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <h2>Threshold Values List</h2>
//           <button className="btn btn-success" onClick={handleExport}>
//             Export
//           </button>
//         </div>
//         {/* <div className="table-responsive">
//           <table className="table table-striped table-hover">
//            */}
//            <div style={{ overflowX: 'auto', width: '100%' }}>
//   <table className="table table-striped table-hover" style={{ minWidth: '800px' }}>

//             <thead className="table-dark">
//               <tr>
//                 <th>No</th>
//                 <th>Data_Center</th>
//                 <th>Device</th>
//                 <th>Sensor</th>
//                 <th>Sensor_Type</th>
//                 <th>Threshold_Type</th>
//                 <th>Value</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentThresholdValues.length > 0 ? (
//                 currentThresholdValues.map((value, index) => (
//                   <tr key={value.id}>
//                     <td>{(currentPage - 1) * thresholdsPerPage + index + 1}</td>
//                     <td>{value.sensor?.data_center?.name || 'N/A'}</td>
//                     <td>{value.sensor?.device?.name || 'N/A'}</td>
//                     <td>{value.sensor?.name || `Sensor ${value.sensor_id}`}</td>
//                     <td>{value.sensor?.sensor_type?.name || 'N/A'}</td>
//                     <td>{value.threshold_type?.name || `Type ${value.threshold_type_id}`}</td>
//                     <td>{value.threshold}</td>
//                     <td>
//                       <div className="d-flex gap-2">
//                         <CommonButton name="edit" onClick={() => handleEdit(value.id)} />
//                         <CommonButton name="delete" onClick={() => handleDelete(value.id)} />
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="8" className="text-center">
//                     No threshold values found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <nav className="mt-3">
//             <ul className="pagination justify-content-center">
//               {[...Array(totalPages)].map((_, i) => (
//                 <li
//                   key={i}
//                   className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
//                 >
//                   <button
//                     className="page-link"
//                     onClick={() => handlePageChange(i + 1)}
//                   >
//                     {i + 1}
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           </nav>
//         )}
//       </div>



//  {/* 1st Section: Threshold Form */}
//       <div className="col-12 mb-4">
//         <h2>{isEditing ? 'Edit Threshold Value' : 'Add New Threshold Value'}</h2>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-3">
//             <label className="form-label">Data Center</label>
//             <select
//               className="form-select"
//               name="data_center_id"
//               value={formData.data_center_id}
//               onChange={handleDataCenterChange}
//               required
//             >
//               <option value="">Select Data Center</option>
//               {dataCenters.map((center) => (
//                 <option key={center.id} value={center.id}>
//                   {center.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="mb-3">
//             <label className="form-label">Device</label>
//             <select
//               className="form-select"
//               name="device_id"
//               value={formData.device_id}
//               onChange={handleDeviceChange}
//               required
//               disabled={!formData.data_center_id}
//             >
//               <option value="">Select Device</option>
//               {devices.map((device) => (
//                 <option key={device.id} value={device.id}>
//                   {device.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="mb-3">
//             <label className="form-label">Select Sensor (Trigger Type = Threshold)</label>
//             <select
//               className="form-select"
//               name="sensor_id"
//               value={formData.sensor_id}
//               onChange={handleInputChange}
//               required
//               disabled={!formData.device_id || sensors.length === 0}
//             >
//               <option value="">
//                 {!formData.device_id
//                   ? 'Select device first'
//                   : sensors.length === 0
//                   ? 'No sensors with trigger type = Threshold available'
//                   : 'Select Sensor'}
//               </option>
//               {sensors.map((sensor) => (
//                 <option key={sensor.id} value={sensor.id}>
//                   {sensor.name || `Sensor ${sensor.id}`}
//                 </option>
//               ))}
//             </select>
//             {formData.device_id && sensors.length === 0 && (
//               <div className="text-danger small">
//                 No sensors with trigger type = Threshold found for this device
//               </div>
//             )}
//           </div>

//           <div className="mb-3">
//             <label className="form-label">Threshold Type</label>
//             <select
//               className="form-select"
//               name="threshold_type_id"
//               value={formData.threshold_type_id}
//               onChange={handleInputChange}
//               required
//             >
//               <option value="">Select Threshold Type</option>
//               {thresholdTypes.map((type) => (
//                 <option key={type.id} value={type.id}>
//                   {type.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="mb-3">
//             <label className="form-label">Threshold Value</label>
//             <input
//               type="number"
//               className="form-control"
//               name="threshold"
//               value={formData.threshold}
//               onChange={handleInputChange}
//               required
//               step="0.01"
//             />
//           </div>

//           <button type="submit" className="btn btn-primary">
//             {isEditing ? 'Update' : 'Save'}
//           </button>
//           {isEditing && (
//             <button
//               type="button"
//               className="btn btn-secondary ms-2"
//               onClick={resetForm}
//             >
//               Cancel
//             </button>
//           )}
//         </form>
//       </div>


//     </div>
//   </div>
// );

// };

// export default ThresholdValues;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Download } from 'lucide-react'; 
import {
  fetchThresholdValues,
  fetchThresholdValue,
  createThresholdValue,
  updateThresholdValue,
  deleteThresholdValue
} from '../../api/thresholdValueApi';
import { fetchSensorsByDevice } from '../../api/sensorListApi';
import { fetchThresholdTypes } from '../../api/thresholdTypeApi';
import { fetchDataCenters } from '../../api/settings/dataCenterApi';
import { fetchDevicesByDataCenter } from '../../api/deviceApi';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
// import CommonButton from '../../components/CommonButton'; // Removed as per style guide

// ================================================
// STYLES - REPLICATED FOR TWO-COLUMN GRID
// ================================================
const styles = {
  // Layout
  pageContainer: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    padding: "3rem 4rem",
    boxSizing: 'border-box',
  },
  contentWrapper: {
    width: "100%",
  },
  headerSection: {
    marginBottom: "2rem",
    textAlign: 'left',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e5e7eb',
  },
  heading: {
    fontSize: "2rem",
    fontWeight: 600,
    color: "#111827",
    marginBottom: "0.25rem",
    letterSpacing: '-0.02em',
  },
  description: {
    fontSize: "1rem",
    color: "#6b7280",
    lineHeight: 1.5,
  },

  // Alerts
  alert: {
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    fontSize: "0.9rem",
    marginBottom: "1.5rem",
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  alertError: {
    backgroundColor: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
  },
  alertSuccess: {
    backgroundColor: "#f0fdf4",
    color: "#047857",
    border: "1px solid #bbf7d0",
  },

  // Form Group Block (Used for both Form and List container)
  formGroupBlock: {
    padding: "32px",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "0.5rem",
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  },
  
  // Form elements (inline styles for dynamic parts)
  inputStyle: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    color: '#111827',
    transition: 'all 150ms ease-in-out',
    boxSizing: 'border-box',
    appearance: 'none',
  },
  labelStyle: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#111827',
    marginBottom: '8px',
  },
};

const ThresholdValues = () => {
  const [allThresholdValues, setAllThresholdValues] = useState([]);
  const [currentThresholdValues, setCurrentThresholdValues] = useState([]);
  const [dataCenters, setDataCenters] = useState([]);
  const [devices, setDevices] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [thresholdTypes, setThresholdTypes] = useState([]);
  const [currentThreshold, setCurrentThreshold] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    data_center_id: '',
    device_id: '',
    sensor_id: '',
    threshold_type_id: '',
    threshold: '',
    timestamp: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Client-side pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [thresholdsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // Helper function to fetch dependent data (devices and sensors) when editing
  const fetchDependentData = async (threshold) => {
    try {
      // Use the path from the form initialization in the original code
      const dataCenterId = threshold.sensor?.device?.data_center_id;
      const deviceId = threshold.sensor?.device_id;

      if (dataCenterId) {
        const deviceResponse = await fetchDevicesByDataCenter(dataCenterId);
        setDevices(deviceResponse);
      }
      if (deviceId) {
        const allSensors = await fetchSensorsByDevice(deviceId);
        const filteredSensors = allSensors.filter(sensor => sensor.trigger_type_id === 1);
        setSensors(filteredSensors);
      }
    } catch (err) {
      console.error("Error fetching dependent data for edit:", err);
    }
  };


  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [valuesResponse, centers, types] = await Promise.all([
          fetchThresholdValues(),
          fetchDataCenters(),
          fetchThresholdTypes()
        ]);

        const fetchedValues = Array.isArray(valuesResponse) ? valuesResponse : [];
        setAllThresholdValues(fetchedValues);
        setTotalPages(Math.ceil(fetchedValues.length / thresholdsPerPage));
        
        setDataCenters(centers);
        setThresholdTypes(types);
        setLoading(false);

      } catch (err) {
        setError(err.message || "Failed to load initial data.");
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Effect to update currentThresholdValues when currentPage or allThresholdValues changes
  useEffect(() => {
    const indexOfLastThreshold = currentPage * thresholdsPerPage;
    const indexOfFirstThreshold = indexOfLastThreshold - thresholdsPerPage;
    setCurrentThresholdValues(allThresholdValues.slice(indexOfFirstThreshold, indexOfLastThreshold));
  }, [currentPage, allThresholdValues, thresholdsPerPage]);


  // Effect to load dependent data when starting an edit
  useEffect(() => {
    if (isEditing && currentThreshold) {
      fetchDependentData(currentThreshold);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, currentThreshold]);


  const handleDataCenterChange = async (e) => {
    const dataCenterId = e.target.value;
    setFormData({
      ...formData,
      data_center_id: dataCenterId,
      device_id: '',
      sensor_id: ''
    });

    setDevices([]);
    setSensors([]);

    if (dataCenterId) {
      try {
        const devices = await fetchDevicesByDataCenter(dataCenterId);
        setDevices(devices);
      } catch (err) {
        setError(err.message || 'Failed to fetch devices.');
      }
    }
  };

  const handleDeviceChange = async (e) => {
    const deviceId = e.target.value;
    setFormData({
      ...formData,
      device_id: deviceId,
      sensor_id: ''
    });

    setSensors([]);

    if (deviceId) {
      try {
        const allSensors = await fetchSensorsByDevice(deviceId);
        const filteredSensors = allSensors.filter(sensor => sensor.trigger_type_id === 1);
        setSensors(filteredSensors);
      } catch (err) {
        setError(err.message || 'Failed to fetch sensors.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const message = isEditing ? 'Threshold value updated successfully!' : 'Threshold value created successfully!';

      if (isEditing && currentThreshold) {
        await updateThresholdValue(currentThreshold.id, formData);
      } else {
        await createThresholdValue(formData);
      }
      
      const updatedValues = await fetchThresholdValues();
      setAllThresholdValues(updatedValues);
      setTotalPages(Math.ceil(updatedValues.length / thresholdsPerPage));
      setCurrentPage(1); 

      resetForm();
      setSuccess(message);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || `Failed to ${isEditing ? 'update' : 'create'} threshold value.`);
    }
  };

  const handleEdit = async (id) => {
    try {
      const threshold = await fetchThresholdValue(id);
      setCurrentThreshold(threshold);
      setFormData({
        data_center_id: threshold.sensor?.device?.data_center_id || '',
        device_id: threshold.sensor?.device_id || '',
        sensor_id: threshold.sensor_id,
        threshold_type_id: threshold.threshold_type_id,
        threshold: threshold.threshold,
        timestamp: threshold.timestamp || new Date().toISOString()
      });
      setIsEditing(true);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch threshold for editing.');
    }
  };

  const handleDelete = (id) => {
    confirmAlert({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this threshold value? This cannot be undone.',
      buttons: [
        {
          label: 'Yes, Delete',
          onClick: async () => {
            try {
              await deleteThresholdValue(id);
              const updatedAllThresholdValues = allThresholdValues.filter(value => value.id !== id);
              setAllThresholdValues(updatedAllThresholdValues);

              const newTotalPages = Math.ceil(updatedAllThresholdValues.length / thresholdsPerPage);
              setTotalPages(newTotalPages);

              if (currentPage > newTotalPages && currentPage > 1) {
                setCurrentPage(newTotalPages);
              } else if (currentThresholdValues.length === 1 && currentPage > 1 && updatedAllThresholdValues.length % thresholdsPerPage === 0) {
                 setCurrentPage(prev => prev - 1);
              }
              setSuccess("Threshold value deleted successfully!");
              setTimeout(() => setSuccess(null), 3000);
            } catch (err) {
              setError(err.message || 'Failed to delete threshold value.');
            }
          },
        },
        { label: 'No' },
      ],
    });
  };

  const resetForm = () => {
    setFormData({
      data_center_id: '',
      device_id: '',
      sensor_id: '',
      threshold_type_id: '',
      threshold: '',
      timestamp: new Date().toISOString()
    });
    setIsEditing(false);
    setCurrentThreshold(null);
    setDevices([]);
    setSensors([]);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // --- Export Functionality (Uses the path from original export)---
  const handleExport = () => {
    const dataToExport = allThresholdValues.map((value, index) => ({
      No: index + 1,
      // Original Export path
      'Data Center': value.sensor?.device?.data_center?.name || 'N/A', 
      Device: value.sensor?.device?.name || 'N/A',
      Sensor: value.sensor?.name || `Sensor ${value.sensor_id}`,
      'Sensor Type': value.sensor?.sensor_type?.name || 'N/A',
      'Threshold Type': value.threshold_type?.name || `Type ${value.threshold_type_id}`,
      Value: value.threshold,
      Timestamp: new Date(value.timestamp).toLocaleString(),
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ThresholdValues");
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    try {
      saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'threshold_values.xlsx');
    } catch (e) {
      console.error("Error saving file:", e);
      setError("Failed to export Excel file.");
    }
  };
  // --- End Export Functionality ---

  if (loading) return (
    <div style={{ ...styles.pageContainer, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#6b7280' }}>Loading...</div>
    </div>
  );

  return (
    <>
      {/* CSS Styles for the Component */}
      <style>
        {`
          /* Two-Column Grid */
          .grid-container {
            display: grid;
            grid-template-columns: 1fr;
            gap: 24px;
          }
          @media (min-width: 1024px) {
            .grid-container {
              grid-template-columns: 1fr 2fr; /* Make list column wider than form */
            }
          }

          /* Input/Select Focus State */
          .input-style:focus {
            outline: none;
            border-color: transparent;
            box-shadow: 0 0 0 2px #fff, 0 0 0 4px #3b82f6; 
          }

          /* Primary Button Styles */
          .btn-primary-style {
            padding: 12px 24px; 
            background-color: #2563eb; 
            color: #fff;
            font-size: 14px; 
            font-weight: 500; 
            border-radius: 8px;
            border: none;
            cursor: pointer;
            transition: all 150ms ease-in-out;
          }
          .btn-primary-style:hover {
            background-color: #1d4ed8; 
          }
          .btn-primary-style:focus {
            outline: none;
            box-shadow: 0 0 0 2px #fff, 0 0 0 4px #3b82f6; 
          }
          .btn-primary-style:disabled {
            background-color: #d1d5db; 
            cursor: not-allowed;
            color: #6b7280; 
          }

          /* Secondary Button Styles */
          .btn-secondary-style {
            padding: 12px 24px;
            background-color: #fff;
            color: #374151; 
            font-size: 14px;
            font-weight: 500;
            border-radius: 8px;
            border: 1px solid #d1d5db;
            cursor: pointer;
            transition: all 150ms ease-in-out;
          }
          .btn-secondary-style:hover {
            background-color: #f9fafb; 
          }
          .btn-secondary-style:focus {
            outline: none;
            box-shadow: 0 0 0 2px #fff, 0 0 0 4px #d1d5db; 
          }

          /* List Row/Action Hover States */
          .list-row:hover {
            background-color: #f9fafb;
          }
          
          .list-action-btn {
            padding: 8px; 
            border-radius: 8px; 
            transition: all 150ms ease-in-out;
            border: none;
            background: none;
            cursor: pointer;
          }

          .edit-btn:hover {
            background-color: #eff6ff;
          }
          .delete-btn:hover {
            background-color: #fee2e2;
          }

          /* Pagination styles */
          .pagination-container {
            display: flex;
            justify-content: center;
            margin-top: 1.5rem;
            padding-bottom: 1rem;
          }
          .page-item {
            list-style: none;
          }
          .page-link-style {
            display: block;
            padding: 8px 12px;
            margin: 0 4px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            background-color: #fff;
            color: #374151;
            text-decoration: none;
            cursor: pointer;
            transition: background-color 0.15s;
          }
          .page-link-style:hover {
            background-color: #f3f4f6;
          }
          .page-item.active .page-link-style {
            background-color: #2563eb;
            color: #fff;
            border-color: #2563eb;
          }
        `}
      </style>

      <div style={styles.pageContainer}>
        <div style={styles.contentWrapper}>
          
          {/* Header Section (Unboxed, DcOwnerMapping style) */}
          <header style={styles.headerSection}>
            <h1 style={styles.heading}>Threshold Values</h1>
            <p style={styles.description}>
              Manage threshold limits for individual sensors.
            </p>
          </header>

          {/* Alerts positioned before the grid */}
          {error && (
            <div style={{ ...styles.alert, ...styles.alertError }}>
              <svg style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-12a1 1 0 102 0V7a1 1 0 10-2 0V6zm0 4a1 1 0 102 0v4a1 1 0 10-2 0v-4z" clipRule="evenodd" /></svg>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>Error: {error}</span>
            </div>
          )}
          {success && (
            <div style={{ ...styles.alert, ...styles.alertSuccess }}>
              <svg style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{success}</span>
            </div>
          )}

          {/* TWO-COLUMN CONTENT GRID */}
          <div className="grid-container">

            {/* 1st Section: Threshold Form (Left Column) */}
            <div style={styles.formGroupBlock}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>
                {isEditing ? 'Edit Threshold Value' : 'Add New Threshold Value'}
              </h2>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Data Center */}
                <div>
                  <label htmlFor="data_center_id" style={styles.labelStyle}>Data Center</label>
                  <select
                    id="data_center_id"
                    className="input-style"
                    style={styles.inputStyle}
                    name="data_center_id"
                    value={formData.data_center_id}
                    onChange={handleDataCenterChange}
                    required
                  >
                    <option value="">Select Data Center</option>
                    {dataCenters.map((center) => (
                      <option key={center.id} value={center.id}>
                        {center.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Device */}
                <div>
                  <label htmlFor="device_id" style={styles.labelStyle}>Device</label>
                  <select
                    id="device_id"
                    className="input-style"
                    style={styles.inputStyle}
                    name="device_id"
                    value={formData.device_id}
                    onChange={handleDeviceChange}
                    required
                    disabled={!formData.data_center_id}
                  >
                    <option value="">Select Device</option>
                    {devices.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sensor */}
                <div>
                  <label htmlFor="sensor_id" style={styles.labelStyle}>Select Sensor (Trigger Type = Threshold)</label>
                  <select
                    id="sensor_id"
                    className="input-style"
                    style={styles.inputStyle}
                    name="sensor_id"
                    value={formData.sensor_id}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.device_id || sensors.length === 0}
                  >
                    <option value="">
                      {!formData.device_id
                        ? 'Select device first'
                        : sensors.length === 0
                        ? 'No sensors with trigger type = Threshold available'
                        : 'Select Sensor'}
                    </option>
                    {sensors.map((sensor) => (
                      <option key={sensor.id} value={sensor.id}>
                        {sensor.name || `Sensor ${sensor.id}`}
                      </option>
                    ))}
                  </select>
                  {formData.device_id && sensors.length === 0 && (
                    <div style={{color: '#dc2626', fontSize: '12px', marginTop: '4px'}}>
                      No sensors with trigger type = Threshold found for this device
                    </div>
                  )}
                </div>

                {/* Threshold Type */}
                <div>
                  <label htmlFor="threshold_type_id" style={styles.labelStyle}>Threshold Type</label>
                  <select
                    id="threshold_type_id"
                    className="input-style"
                    style={styles.inputStyle}
                    name="threshold_type_id"
                    value={formData.threshold_type_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Threshold Type</option>
                    {thresholdTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Threshold Value */}
                <div>
                  <label htmlFor="threshold" style={styles.labelStyle}>Threshold Value</label>
                  <input
                    id="threshold"
                    type="number"
                    className="input-style"
                    style={styles.inputStyle}
                    name="threshold"
                    value={formData.threshold}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                  />
                </div>

                {/* Form Actions (Buttons) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '8px' }}>
                  <button type="submit" className="btn-primary-style" style={{ flexGrow: 1 }}>
                    {isEditing ? 'Update' : 'Save'}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      className="btn-secondary-style"
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* 2nd Section: Threshold List (Right Column) */}
            <div style={{...styles.formGroupBlock, padding: 0, overflow: 'hidden'}}>
              <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>
                  Threshold Values List
                </h2>
                <button 
                  className="btn-secondary-style" 
                  onClick={handleExport}
                  style={{padding: '8px 12px'}} 
                >
                  <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                    <Download style={{width: '16px', height: '16px'}}/>
                    Export
                  </div>
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <tr>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        No
                      </th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Data Center
                      </th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Sensor
                      </th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Threshold Type
                      </th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Value
                      </th>
                      <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody style={{ borderTop: '1px solid #e5e7eb' }}>
                    {currentThresholdValues.length > 0 ? (
                      currentThresholdValues.map((value, index) => (
                        <tr key={value.id} className="list-row" style={{ borderBottom: '1px solid #e5e7eb', transition: 'background-color 150ms ease-in-out' }}>
                          {/* <td style={{ padding: '16px 24px', fontSize: '14px', color: '#374151' }}>{(currentPage - 1) * thresholdsPerPage + index + 1}</td> */}
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#374151' }}>{value.id}</td>
                          {/* CORRECTED: Using the data path from the original HTML rendering logic */}
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#374151' }}>{value.sensor?.data_center?.name || 'N/A'}</td>
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#374151' }}>{value.sensor?.name || `Sensor ${value.sensor_id}`}</td>
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#374151' }}>{value.threshold_type?.name || `Type ${value.threshold_type_id}`}</td>
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#374151' }}>{value.threshold}</td>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                              <button
                                onClick={() => handleEdit(value.id)}
                                className="list-action-btn edit-btn"
                                style={{ color: '#2563eb' }}
                                title="Edit"
                              >
                                <Edit2 style={{ width: '16px', height: '16px' }} />
                              </button>
                              <button
                                onClick={() => handleDelete(value.id)}
                                className="list-action-btn delete-btn"
                                style={{ color: '#dc2626' }}
                                title="Delete"
                              >
                                <Trash2 style={{ width: '16px', height: '16px' }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ padding: '16px 24px', textAlign: 'center', color: '#6b7280' }}>
                          No threshold values found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="pagination-container">
                  <ul style={{ display: 'flex', padding: 0, margin: 0 }}>
                    {[...Array(totalPages)].map((_, i) => (
                      <li
                        key={i}
                        className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
                      >
                        <button
                          className="page-link-style"
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
};

export default ThresholdValues;