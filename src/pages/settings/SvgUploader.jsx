// import React, { useEffect, useState } from 'react';
// import { fetchDataCenters, uploadSvg } from '../../api/settings/dataCenterApi';
// import CommonButton from "../../components/CommonButton";

// const SvgUploader = () => {
//   const [dataCenters, setDataCenters] = useState([]);
//   const [selectedId, setSelectedId] = useState('');
//   const [svgFile, setSvgFile] = useState(null);

//   useEffect(() => {
//     fetchDataCenters()
//       .then(setDataCenters)
//       .catch(console.error);
//   }, []);

//   const handleFileChange = (e) => {
//     setSvgFile(e.target.files[0]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!selectedId || !svgFile) {
//       alert('Please select a data center and an SVG file.');
//       return;
//     }

//     try {
//       await uploadSvg(selectedId, svgFile);
//       alert('SVG uploaded successfully.');
//       setSvgFile(null);
//       setSelectedId('');
//     } catch (error) {
//       alert('Upload failed: ' + error.message);
//       console.error(error);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <div>
//         <label>
//           Select Data Center:
//           <select
//             value={selectedId}
//             onChange={(e) => setSelectedId(e.target.value)}
//             required
//           >
//             <option value="">-- Select --</option>
//             {dataCenters.map(dc => (
//               <option key={dc.id} value={dc.id}>
//                 {dc.name}
//               </option>
//             ))}
//           </select>
//         </label>
//       </div>
//       <br />
//       <div>
//         <label>
//           Upload SVG:
//           <input
//             type="file"
//             accept=".svg"
//             onChange={handleFileChange}
//             required
//           />
//         </label>
//       </div>
//       <br />
//       <CommonButton name="upload" />

//     </form>
//   );
// };

// export default SvgUploader;
import React, { useEffect, useState } from 'react';
import { Upload, AlertTriangle, CheckCircle, Server } from 'lucide-react';
import { fetchDataCenters, uploadSvg } from '../../api/settings/dataCenterApi';
import CommonButton from '../../components/CommonButton';

// ================================================
// STYLES - MODERN UI KIT STYLE (ADJUSTED FOR NON-CARD LAYOUT)
// ================================================
const styles = {
  // Layout
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '3rem 4rem',
    boxSizing: 'border-box',
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
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontWeight: 500,
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

  // Form Wrapper (Non-Card) - Now just a container for content
  formWrapper: {
    padding: '0',
    backgroundColor: 'transparent',
    maxWidth: '800px', // Increased max-width for better use of space
    margin: '0 auto', // Center the content
  },

  // Form elements (inline styles)
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
  fileInputContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px dashed #d1d5db',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    backgroundColor: '#fff', // White background inside the dashed border
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    minHeight: '150px',
    position: 'relative', // Necessary for absolute positioning of hidden input
  },
  fileInputText: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '8px',
  },
};

const SvgUploader = () => {
  const [dataCenters, setDataCenters] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [svgFile, setSvgFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({
    success: null,
    error: null,
    isSubmitting: false,
  });
  const [isLoadingDCs, setIsLoadingDCs] = useState(true);

  // --- Data Center Fetching ---
  useEffect(() => {
    setIsLoadingDCs(true);
    fetchDataCenters()
      .then((result) => {
        setDataCenters(result);
        setIsLoadingDCs(false);
      })
      .catch((err) => {
        setUploadStatus((prev) => ({
          ...prev,
          error: 'Failed to load data centers: ' + err.message,
        }));
        setIsLoadingDCs(false);
      });
  }, []);

  // --- File Change Handler (Identical functionality) ---
  const handleFileChange = (e) => {
    // Clear status when a new file is selected
    setUploadStatus({ success: null, error: null, isSubmitting: false });
    const file = e.target.files[0];

    // Validate file type
    if (file && file.type !== 'image/svg+xml') {
      setUploadStatus({
        success: null,
        error: 'Invalid file type. Please upload an SVG file (.svg).',
        isSubmitting: false,
      });
      setSvgFile(null);
      e.target.value = null;
      return;
    }
    setSvgFile(file);
  };

  // --- Submission Handler (Identical functionality) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadStatus({ success: null, error: null, isSubmitting: true });

    if (!selectedId || !svgFile) {
      setUploadStatus({
        success: null,
        error: 'Please select a data center and an SVG file.',
        isSubmitting: false,
      });
      return;
    }

    try {
      await uploadSvg(selectedId, svgFile);

      setUploadStatus({ success: 'SVG uploaded successfully.', error: null, isSubmitting: false });

      setSvgFile(null);
      setSelectedId('');
      document.getElementById('svg-file-input').value = null;
    } catch (error) {
      setUploadStatus({
        success: null,
        error: 'Upload failed: ' + (error.message || 'An unexpected error occurred.'),
        isSubmitting: false,
      });
      console.error(error);
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Header Section */}
      <header style={styles.headerSection}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* <Server style={{ width: '30px', height: '30px', color: '#3b82f6' }} /> */}
          <div>
            <h1 style={styles.heading}>Data Center SVG Map Uploader</h1>
            <p style={styles.description}>
              Select a data center and upload an SVG file to set or update its visual floor map.
            </p>
          </div>
        </div>
      </header>

      {/* Alerts */}
      {uploadStatus.error && (
        <div style={styles.alert}>
          <AlertTriangle style={{ width: '20px', height: '20px' }} />
          <span>**Error:** {uploadStatus.error}</span>
        </div>
      )}
      {uploadStatus.success && (
        <div style={{ ...styles.alert, ...styles.alertSuccess }}>
          <CheckCircle style={{ width: '20px', height: '20px' }} />
          <span>{uploadStatus.success}</span>
        </div>
      )}

      {/* Form Wrapper (Non-Card) */}
      <div style={styles.formWrapper}>
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '30px', padding: '20px 0' }}
        >
          {/* Data Center Selection */}
          <div
            style={{
              padding: '20px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}
          >
            <label htmlFor="data_center_select" style={styles.labelStyle}>
              Select Data Center
            </label>
            <select
              id="data_center_select"
              style={styles.inputStyle}
              value={selectedId}
              // FIX: This change handler only updates state, preventing submission
              onChange={(e) => setSelectedId(e.target.value)}
              required
              disabled={isLoadingDCs || dataCenters.length === 0 || uploadStatus.isSubmitting}
            >
              <option value="">
                {isLoadingDCs
                  ? 'Loading Data Centers...'
                  : dataCenters.length === 0
                    ? 'No Data Centers Found'
                    : '-- Select Data Center --'}
              </option>
              {dataCenters.map((dc) => (
                <option key={dc.id} value={dc.id}>
                  {dc.name}
                </option>
              ))}
            </select>
          </div>

          {/* SVG File Upload */}
          <div
            style={{
              padding: '20px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}
          >
            <label htmlFor="svg-file-input" style={styles.labelStyle}>
              Upload SVG File (.svg)
            </label>

            <div
              style={styles.fileInputContainer}
              // Drag and drop is supported here
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileChange({ target: { files: e.dataTransfer.files } });
              }}
            >
              <Upload style={{ width: '28px', height: '28px', color: '#6b7280' }} />
              <p style={styles.fileInputText}>
                {svgFile ? (
                  <span style={{ color: '#3b82f6', fontWeight: 600 }}>
                    File Selected: {svgFile.name}
                  </span>
                ) : (
                  'Drag and drop an SVG here, or click to browse.'
                )}
              </p>
              <input
                id="svg-file-input"
                type="file"
                accept=".svg"
                onChange={handleFileChange}
                required
                // Hide the actual input and let the div handle the click/drop target
                style={{
                  opacity: 0,
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer',
                }}
                disabled={uploadStatus.isSubmitting}
              />
            </div>
          </div>

          {/* Submit Button */}

          {/* <CommonButton 
              name={uploadStatus.isSubmitting ? "Uploading..." : "Upload"} 
              type="submit" // FIX: Ensure this button is the submit action
              disabled={!selectedId || !svgFile || uploadStatus.isSubmitting}
            /> */}
          {/* Submit Button */}
          <div style={{ marginTop: '10px', alignSelf: 'flex-start' }}>
            <button className="btn btn-primary" type="submit">
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SvgUploader;
