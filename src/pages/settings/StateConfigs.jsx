// export default StateConfigs;
import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Download } from 'lucide-react';
import {
  fetchStateConfigs,
  fetchStateConfig,
  createStateConfig,
  updateStateConfig,
  deleteStateConfig,
} from '../../api/stateConfigApi';
import { fetchSensorsByDevice, fetchSensorTypeLists } from '../../api/sensorListApi';
import { fetchDataCenters } from '../../api/settings/dataCenterApi';
import { fetchDevicesByDataCenter } from '../../api/deviceApi';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
// import CommonButton from "../../components/CommonButton"; // Functionality replaced by custom buttons

// ================================================
// STYLES - MODERN UI KIT STYLE
// ================================================
const styles = {
  // Layout
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '3rem 4rem',
    boxSizing: 'border-box',
  },
  contentWrapper: {
    width: '100%',
  },
  headerSection: {
    marginBottom: '2rem',
    textAlign: 'left',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e5e7eb',
  },
  heading: {
    fontSize: '2rem',
    fontWeight: 600,
    color: '#111827',
    marginBottom: '0.25rem',
    letterSpacing: '-0.02em',
  },
  description: {
    fontSize: '1rem',
    color: '#6b7280',
    lineHeight: 1.5,
  },

  // Alerts
  alert: {
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  alertError: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fecaca',
  },
  alertSuccess: {
    backgroundColor: '#f0fdf4',
    color: '#047857',
    border: '1px solid #bbf7d0',
  },

  // Form Group Block (Used for both Form and List container)
  formGroupBlock: {
    padding: '32px',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
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

const StateConfigs = () => {
  const [allStateConfigs, setAllStateConfigs] = useState([]);
  const [currentStateConfigs, setCurrentStateConfigs] = useState([]);
  const [dataCenters, setDataCenters] = useState([]);
  const [devices, setDevices] = useState([]);
  const [sensorTypeOptions,setSensorTypeOptions] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    data_center_id: '',
    device_id: '',
    sensor_type: '',
    sensor_id: '',
    path:'',
    value: '',
    name: '',
    attache_sound: '',
    url: '',
    color: '#ffffff',
    enable_sound: true,
    enable_blink: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // Added success state

  // Client-side pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [configsPerPage] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  // Helper function to fetch dependent data when editing
  const fetchDependentData = async (config) => {
    try {
      const dataCenterId = config.sensor?.device?.data_center_id;
      const deviceId = config.sensor?.device_id;
      const sensorTypeId = config.sensor?.sensor_type_list_id;

      if (dataCenterId) {
        const deviceResponse = await fetchDevicesByDataCenter(dataCenterId);
        setDevices(deviceResponse);
      }
      if (deviceId && sensorTypeId) {
        const triggerSensors = await fetchSensorsByDevice(deviceId,sensorTypeId);
        setSensors(triggerSensors);
        
      }
    } catch (err) {
      console.error('Error fetching dependent data for edit:', err);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [configsResponse, centers,sensorTypeRes] = await Promise.all([
          fetchStateConfigs(),
          fetchDataCenters(),
          fetchSensorTypeLists(),
        ]);

        const fetchedConfigs = Array.isArray(configsResponse) ? configsResponse : [];
        setAllStateConfigs(fetchedConfigs);
        setTotalPages(Math.ceil(fetchedConfigs.length / configsPerPage));

        setDataCenters(centers);
        setSensorTypeOptions(sensorTypeRes);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load initial data.');
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Effect to load dependent data when starting an edit
  useEffect(() => {
    if (isEditing && currentConfig) {
      fetchDependentData(currentConfig);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, currentConfig]);

  // Effect to update currentStateConfigs when currentPage or allStateConfigs changes
  useEffect(() => {
    const indexOfLastConfig = currentPage * configsPerPage;
    const indexOfFirstConfig = indexOfLastConfig - configsPerPage;
    setCurrentStateConfigs(allStateConfigs.slice(indexOfFirstConfig, indexOfLastConfig));
  }, [currentPage, allStateConfigs, configsPerPage]);

  const handleDataCenterChange = async (e) => {
    const dataCenterId = e.target.value;
    setFormData({
      ...formData,
      data_center_id: dataCenterId,
      device_id: '',
      sensor_id: '',
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

  // const handleDeviceChange = async (e) => {
  //   const deviceId = e.target.value;
  //   console.log('console.log: ',e);
  //   setFormData({
  //     ...formData,
  //     device_id: deviceId,
  //     sensor_id: '',
  //   });

  //   setSensors([]);

  //   if (deviceId) {
  //     try {
  //       const allSensors = await fetchSensorsByDevice(deviceId);
  //       // FUNCTIONALITY REMAINS: Filter by trigger_type_id = 2 (State)
  //       const filteredSensors = allSensors.filter((sensor) => sensor.trigger_type_id === 2);
  //       setSensors(filteredSensors);
  //     } catch (err) {
  //       setError(err.message || 'Failed to fetch sensors.');
  //     }
  //   }
  // };

  const handleDeviceChange = (e) => {
  const deviceId = e.target.value;

  setFormData((prev) => ({
    ...prev,
    device_id: deviceId,
    sensor_id: '',
  }));

  setSensors([]);
};

  const handleSensorTypeChange = async (e) => {
  const sensorTypeId = e.target.value;

  setFormData((prev) => ({
    ...prev,
    sensor_type: sensorTypeId,
    sensor_id: '',
  }));


  if (!formData.device_id || !sensorTypeId) return;

  try {
    const triggerSensors = await fetchSensorsByDevice(
      formData.device_id,
      sensorTypeId
    );


    setSensors(triggerSensors);
  } catch (err) {
    setError(err.message || 'Failed to fetch sensors.');
  }
};

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const message = isEditing
        ? 'State configuration updated successfully!'
        : 'State configuration created successfully!';

      // convert checkbox booleans to 1/0 for backend
      const payload = {
        ...formData,
        enable_sound: formData.enable_sound ? 1 : 0,
        enable_blink: formData.enable_blink ? 1 : 0,
      };

      if (isEditing && currentConfig) {
        await updateStateConfig(currentConfig.id, payload);
      } else {
        await createStateConfig(payload);
      }

      const updatedConfigs = await fetchStateConfigs();
      setAllStateConfigs(updatedConfigs);
      setTotalPages(Math.ceil(updatedConfigs.length / configsPerPage));
      setCurrentPage(1);

      resetForm();
      setSuccess(message);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || `Failed to ${isEditing ? 'update' : 'create'} configuration.`);
    }
  };

  const handleEdit = async (id) => {
    try {
      const config = await fetchStateConfig(id);
      setCurrentConfig(config);
      setFormData({
        data_center_id: config.sensor?.device?.data_center_id || '',
        device_id: config.sensor?.device_id || '',
        sensor_type: config.sensor?.sensor_type_list_id || '',
        sensor_id: config?.sensor_id,
        path: config.path,
        value: config.value,
        name: config.name,
        attache_sound: config.attache_sound || '',
        url: config.url || '',
        color: config.color || '#ffffff',
        // booleans from numeric values
        enable_sound: config.enable_sound !== 0,
        enable_blink: config.enable_blink !== 0,
      });
      setIsEditing(true);
      setError(null);

      // Reload devices and sensors specifically for the form on edit
      await fetchDependentData(config);
    } catch (err) {
      setError(err.message || 'Failed to fetch configuration for editing.');
    }
  };

  const handleDelete = (id) => {
    confirmAlert({
      title: 'Confirm Deletion',
      message: 'Are you sure you want to delete this state configuration?',
      buttons: [
        {
          label: 'Yes, Delete',
          onClick: async () => {
            try {
              await deleteStateConfig(id);
              const updatedAllStateConfigs = allStateConfigs.filter((config) => config.id !== id);
              setAllStateConfigs(updatedAllStateConfigs);

              const newTotalPages = Math.ceil(updatedAllStateConfigs.length / configsPerPage);
              setTotalPages(newTotalPages);

              if (currentPage > newTotalPages && currentPage > 1) {
                setCurrentPage(newTotalPages);
              } else if (
                currentStateConfigs.length === 1 &&
                currentPage > 1 &&
                updatedAllStateConfigs.length % configsPerPage === 0
              ) {
                setCurrentPage((prev) => prev - 1);
              }
              setSuccess('State configuration deleted successfully!');
              setTimeout(() => setSuccess(null), 3000);
            } catch (err) {
              setError(err.message || 'Failed to delete state configuration.');
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
      sensor_type:'',
      sensor_id: '',
      path:'',
      value: '',
      name: '',
      attache_sound: '',
      url: '',
      color: '#ffffff',
      // reset toggles to default checked
      enable_sound: true,
      enable_blink: true,
    });
    setIsEditing(false);
    setCurrentConfig(null);
    setDevices([]);
    setSensors([]);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // --- Export Functionality (Functionality kept identical)---
  const handleExport = () => {
    // Prepare data for export
    const dataToExport = allStateConfigs.map((config, index) => ({
      No: index + 1,
      'Data Center': config.sensor?.device?.data_center?.name || 'N/A',
      Device: config.sensor?.device?.name || 'N/A',
      Sensor: config.sensor?.name || `Sensor ${config.sensor_id}`,
      'Sensor Type': config.sensor?.sensor_type?.name || 'N/A',
      Value: config.value,
      Name: config.name,
      'Attached Sound': config.attache_sound || 'N/A',
      URL: config.url || 'N/A',
      'Enable Sound': config.enable_sound ? 1 : 0,
      'Enable Blink': config.enable_blink ? 1 : 0,
      Color: config.color || '#ffffff',
    }));

    // Create a worksheet
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'StateConfigs');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // Save the file
    try {
      saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'state_configurations.xlsx');
    } catch (e) {
      console.error('Error saving file:', e);
      setError('Failed to export Excel file.');
    }
  };
  // --- End Export Functionality ---

  if (loading)
    return (
      <div
        style={{
          ...styles.pageContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ color: '#6b7280' }}>Loading...</div>
      </div>
    );

    // console.log('config data:', currentStateConfigs);
    console.log('formdata: ',formData);
    // console.log('sensor list: ', sensors);


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

          /* Custom Color Input for Form */
          .color-input-group {
            display: flex;
            align-items: center;
          }
          .color-input-group input[type="color"] {
            width: 44px; /* Fixed width for color picker */
            height: 44px;
            padding: 0;
            margin-right: 8px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            cursor: pointer;
          }
          .color-input-group input[type="text"] {
            flex-grow: 1;
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid #d1d5db;
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
          {/* Header Section (Full-width) */}
          <header style={styles.headerSection}>
            <h1 style={styles.heading}>State Configurations</h1>
            <p style={styles.description}>
              Define states (name, color, sound) corresponding to specific sensor values for
              State-type sensors.
            </p>
          </header>

          {/* Alerts positioned before the grid */}
          {error && (
            <div style={{ ...styles.alert, ...styles.alertError }}>
              <svg
                style={{ width: '20px', height: '20px' }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-12a1 1 0 102 0V7a1 1 0 10-2 0V6zm0 4a1 1 0 102 0v4a1 1 0 10-2 0v-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>Error: {error}</span>
            </div>
          )}
          {success && (
            <div style={{ ...styles.alert, ...styles.alertSuccess }}>
              <svg
                style={{ width: '20px', height: '20px' }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{success}</span>
            </div>
          )}

          {/* TWO-COLUMN CONTENT GRID */}
          <div className="grid-container">
            {/* 1st Section: State Config Form (Left Column) */}
            <div style={styles.formGroupBlock}>
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#111827',
                  marginBottom: '24px',
                }}
              >
                {isEditing ? 'Edit State Configuration' : 'Add New State Configuration'}
              </h2>

              <form
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                {/* Data Center */}
                <div>
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

                    {/* Sensor Types */}
                    <div>
                  <select
                    id="sensor_type"
                    className="input-style"
                    style={styles.inputStyle}
                    name="sensor_type"
                    value={formData.sensor_type}
                    onChange={handleSensorTypeChange}
                    required
                    disabled={!formData.device_id}
                >
                  <option value="">Select Sensor Type</option>
                  {sensorTypeOptions.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name || `Type ${type.id}`}
                    </option>
                  ))}
                </select>
                {sensorTypeOptions.length === 0 && (
                  <div className="text-danger small">No sensor types available</div>
                )}
              </div>
                {/* Sensor (Trigger Type State) */}
                <div>
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
                        ? 'No sensors with trigger type State available'
                        : 'Select Sensor'}
                    </option>
                    {sensors.map((sensor) => (
                      <option key={sensor.id} value={sensor.id}>
                        {sensor.name || `Sensor ${sensor.id}`}
                      </option>
                    ))}
                  </select>
                  {formData.device_id && sensors.length === 0 && (
                    <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                      No sensors with trigger type State found for this device
                    </div>
                  )}
                </div>

                {(formData.sensor_type == 3 || (isEditing && formData.sensor_type == 3)) && (
                <div>

                  <input
                    id="path"
                    type="text"
                    className="input-style"
                    style={styles.inputStyle}
                    name="path"
                    value={formData.path}
                    onChange={handleInputChange}
                    required
                    placeholder=' Path ID (SLD)'
                  />
                </div>
                )}
                
                <div>
                  <input
                    id="value"
                    type="number"
                    className="input-style"
                    style={styles.inputStyle}
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    required
                    placeholder='Enter value'
                  />
                </div>

                {/* Name */}
                <div>
                  <input
                    id="name"
                    type="text"
                    className="input-style"
                    style={styles.inputStyle}
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder='Enter name'
                  />
                </div>

                {/* Enable Sound checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    id="enable_sound"
                    type="checkbox"
                    name="enable_sound"
                    checked={formData.enable_sound}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="enable_sound" style={{ fontSize: '14px', color: '#374151' }}>
                    Enable Sound
                  </label>
                </div>

                {/* Enable Blink checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    id="enable_blink"
                    type="checkbox"
                    name="enable_blink"
                    checked={formData.enable_blink}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="enable_blink" style={{ fontSize: '14px', color: '#374151' }}>
                    Enable Blink
                  </label>
                </div>

                {/* Attached Sound */}
                {/* <div>
                  <label htmlFor="attache_sound" style={styles.labelStyle}>
                    Attached Sound
                  </label>
                  <input
                    id="attache_sound"
                    type="text"
                    className="input-style"
                    style={styles.inputStyle}
                    name="attache_sound"
                    value={formData.attache_sound}
                    onChange={handleInputChange}
                    placeholder="Sound file path or URL"
                  />
                </div> */}

                {/* URL */}
                {/* <div>
                  <label htmlFor="url" style={styles.labelStyle}>URL</label>
                  <input
                    id="url"
                    type="text"
                    className="input-style"
                    style={styles.inputStyle}
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    placeholder="Optional URL"
                  />
                </div> */}

                {/* Color */}
                <div>
                  <label htmlFor="color" style={styles.labelStyle}>
                    Color
                  </label>
                  <div className="color-input-group">
                    <input
                      type="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      title="Choose a color"
                    />
                    <input
                      type="text"
                      className="input-style"
                      value={formData.color}
                      onChange={handleInputChange}
                      name="color"
                      style={{ padding: '12px 16px' }}
                    />
                  </div>
                </div>

                {/* Form Actions (Buttons) */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '8px' }}
                >
                  <button type="submit" className="btn-primary-style" style={{ flexGrow: 1 }}>
                    {isEditing ? 'Update' : 'Save'}
                  </button>
                  {isEditing && (
                    <button type="button" className="btn-secondary-style" onClick={resetForm}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* 2nd Section: State Config List (Right Column) */}
            <div style={{ ...styles.formGroupBlock, padding: 0, overflow: 'hidden' }}>
              <div
                style={{
                  padding: '24px',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>
                  State Configurations List
                </h2>
                <button
                  className="btn-secondary-style"
                  onClick={handleExport}
                  style={{ padding: '8px 12px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Download style={{ width: '16px', height: '16px' }} />
                    Export
                  </div>
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <tr>
                      <th
                        style={{
                          padding: '12px 24px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        No
                      </th>
                      <th
                        style={{
                          padding: '12px 24px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Data Center
                      </th>
                      <th
                        style={{
                          padding: '12px 24px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Sensor Type
                      </th>
                      <th
                        style={{
                          padding: '12px 24px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Sensor
                      </th>
                      <th
                        style={{
                          padding: '12px 24px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Path (SLD)
                      </th>
                      <th
                        style={{
                          padding: '12px 24px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Value
                      </th>
                      <th
                        style={{
                          padding: '12px 24px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Name
                      </th>
                      <th
                        style={{
                          padding: '12px 24px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Color
                      </th>
                      <th
                        style={{
                          padding: '12px 24px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Sound?
                      </th>
                      <th
                        style={{
                          padding: '12px 24px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Blink?
                      </th>
                      <th
                        style={{
                          padding: '12px 24px',
                          textAlign: 'right',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody style={{ borderTop: '1px solid #e5e7eb' }}>
                    {currentStateConfigs.length > 0 ? (
                      currentStateConfigs.map((config, index) => (
                        <tr
                          key={config.id}
                          className="list-row"
                          style={{
                            borderBottom: '1px solid #e5e7eb',
                            transition: 'background-color 150ms ease-in-out',
                          }}
                        >
                          {/* <td style={{ padding: '16px 24px', fontSize: '14px', color: '#374151' }}>
                            {(currentPage - 1) * configsPerPage + index + 1}
                          </td> */}
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#374151' }}>
                            {config.id}
                          </td>
                          {/* Data Center path from the original table: config.sensor?.device?.data_center?.name */}
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#374151' }}>
                            {config.sensor?.device?.data_center?.name || 'N/A'}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#374151' }}>
                            {config.sensor?.sensor_type?.name ||'--'}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#374151' }}>
                            {config.sensor?.name || `Sensor ${config.sensor_id}`}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#374151' }}>
                            {config.path }
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#374151' }}>
                            {config.value}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#374151' }}>
                            {config.name}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#374151' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  backgroundColor: config.color,
                                  border: '1px solid #d1d5db',
                                  borderRadius: '4px',
                                }}
                              ></div>
                              <span style={{ color: '#6b7280' }}>{config.color}</span>
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#374151' }}>
                            {config.sound === 1 ? 'Yes' : 'No'}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '14px', color: '#374151' }}>
                            {config.blink === 1 ? 'Yes' : 'No'}
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: '8px',
                              }}
                            >
                              <button
                                onClick={() => handleEdit(config.id)}
                                className="list-action-btn edit-btn"
                                style={{ color: '#2563eb' }}
                                title="Edit"
                              >
                                <Edit2 style={{ width: '16px', height: '16px' }} />
                              </button>
                              <button
                                onClick={() => handleDelete(config.id)}
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
                        <td
                          colSpan="11"
                          style={{ padding: '16px 24px', textAlign: 'center', color: '#6b7280' }}
                        >
                          No state configurations found.
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
                      <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                        <button className="page-link-style" onClick={() => handlePageChange(i + 1)}>
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

export default StateConfigs;