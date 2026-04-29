


// import React, { useEffect, useState, useContext } from "react";
// import DataTable from "../../components/table/DataTable";
// import { getUserDataCenters } from "../../api/settings/dataCenterApi";
// import { userContext } from '../../context/UserContext';
// import moment from "moment";
// import { fetchSensorTypeLists } from "../../api/sensorListApi";
// import { SensorLogReport } from "../../api/reportApi";


// const SensorLogRepor = () => {
//   const { user } = useContext(userContext);
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // 🔥 Pagination
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [totalRows, setTotalRows] = useState(0);

//   // 🔥 Filter States
//   const [filters, setFilters] = useState({
//     data_center_id: "",
//     sensor_type_list_id: "",
//     from_date: moment().subtract(7, 'days').format('YYYY-MM-DD'), // Default: last 7 days
//     to_date: moment().format('YYYY-MM-DD') // Default: today
//   });

//   // 🔥 Dropdown Data
//   const [datacenters, setDatacenters] = useState([]);
//   const [sensorTypes, setSensorTypes] = useState([]);

//   // 🔥 Fetch Datacenters
//   useEffect(() => {
//     const fetchDatacenters = async () => {
//       try {
//         const res = await getUserDataCenters(user?.id);
//         setDatacenters(res.data || []);
//         console.log("✅ Datacenters fetched:", res.data);
//       } catch (err) {
//         console.error("❌ Datacenter error:", err);
//       }
//     };

//     if (user?.id) {
//       fetchDatacenters();
//     }
//   }, [user?.id]);

//   // 🔥 Fetch Sensor Types
//   useEffect(() => {
//     const fetchSensorTypes = async () => {
//       try {
//         const res = await fetchSensorTypeLists();
//         setSensorTypes(res.data || []);
//         console.log("✅ Sensor types fetched:", res.data);
//       } catch (err) {
//         console.error("❌ Sensor types error:", err);
//       }
//     };

//     fetchSensorTypes();
//   }, []);

//   // 🔥 Fetch Table Data from Backend
//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       // Call backend API with proper parameter names
//       const res = await SensorLogReport({
//         from_date: filters.from_date,
//         to_date: filters.to_date,
//         data_center_id: filters.data_center_id || undefined,
//         sensor_type_list_id: filters.sensor_type_list_id || undefined,
//       });

//       console.log("✅ Sensor data fetched:", res.data);
//       setRows(res.data.data || []);
//       setTotalRows(res.data.count || 0);

//     } catch (err) {
//       console.error("❌ Error fetching sensor data:", err);
//       setRows([]);
//       setTotalRows(0);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔥 Fetch data when filters change
//   useEffect(() => {
//     // Validate date range before fetching
//     if (filters.from_date && filters.to_date && filters.from_date <= filters.to_date) {
//       setPage(1);
//       fetchData();
//     }
//   }, [filters.from_date, filters.to_date, filters.data_center_id, filters.sensor_type_list_id]);

//   // 🔥 Filter Change Handler
//   const handleFilterChange = (newFilters) => {
//     setPage(1);
//     setFilters((prev) => ({
//       ...prev,
//       ...newFilters
//     }));
//   };

//   // 🔥 Date Change Handler
//   const handleDateChange = (fieldName, value) => {
//     handleFilterChange({ [fieldName]: value });
//   };

//   // 🔥 Table Columns - Aligned with Backend Response
//   const columns = [
//     { key: "sensor_id", header: "Sensor ID" },
//     { key: "datacenter_name", header: "Data Center" },
//     { key: "sensor_name", header: "Sensor Name" },
//     { key: "value", header: "Value" },
//     { key: "status", header: "Status", 
//       render: (val) => (
//         <span style={{
//           color: val === "High" ? "red" : val === "Normal" ? "green" : "orange",
//           fontWeight: "bold"
//         }}>
//           {val}
//         </span>
//       )
//     },
//     { key: "sensor_type_name", header: "Sensor Type" },
//     { key: "location", header: "Location" },
//     { key: "created_at", header: "Date & Time",
//       render: (val) =>
//         val ? moment(val).format("DD MMM YYYY, hh:mm:ss A") : "-"
//     },
//   ];

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Sensor Log Report</h2>

//       <DataTable
//         title="Sensor Logs"
//         data={rows}
//         columns={columns}

//         isBackendPagination={false}
//         totalRows={totalRows}
//         page={page}
//         pageSize={pageSize}
//         setPage={setPage}
//         setPageSize={setPageSize}
//         onFilterChange={handleFilterChange}

//         searchable={true}
//         selection={false}
//         showId={false}
//         loading={loading}

//         // 🔥 Filter Component - Date, DataCenter, Sensor Type
//         filterComponent={
//           <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "center" }}>

//             {/* From Date */}
//             <div style={{ display: "flex", flexDirection: "column" }}>
//               <label style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "5px" }}>
//                 From Date
//               </label>
//               <input
//                 type="date"
//                 value={filters.from_date}
//                 onChange={(e) => handleDateChange('from_date', e.target.value)}
//                 style={{
//                   padding: "8px",
//                   borderRadius: "4px",
//                   border: "1px solid #ccc"
//                 }}
//               />
//             </div>

//             {/* To Date */}
//             <div style={{ display: "flex", flexDirection: "column" }}>
//               <label style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "5px" }}>
//                 To Date
//               </label>
//               <input
//                 type="date"
//                 value={filters.to_date}
//                 onChange={(e) => handleDateChange('to_date', e.target.value)}
//                 style={{
//                   padding: "8px",
//                   borderRadius: "4px",
//                   border: "1px solid #ccc"
//                 }}
//               />
//             </div>

//             {/* Data Center Filter */}
//             <div style={{ display: "flex", flexDirection: "column" }}>
//               <label style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "5px" }}>
//                 Data Center
//               </label>
//               <select
//                 value={filters.data_center_id}
//                 onChange={(e) =>
//                   handleFilterChange({ data_center_id: e.target.value })
//                 }
//                 style={{
//                   padding: "8px",
//                   borderRadius: "4px",
//                   border: "1px solid #ccc"
//                 }}
//               >
//                 <option value="">All Data Centers</option>
//                 {datacenters.map((dc) => (
//                   <option key={dc.id} value={dc.id}>
//                     {dc.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Sensor Type Filter */}
//             <div style={{ display: "flex", flexDirection: "column" }}>
//               <label style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "5px" }}>
//                 Sensor Type
//               </label>
//               <select
//                 value={filters.sensor_type_list_id}
//                 onChange={(e) =>
//                   handleFilterChange({ sensor_type_list_id: e.target.value })
//                 }
//                 style={{
//                   padding: "8px",
//                   borderRadius: "4px",
//                   border: "1px solid #ccc"
//                 }}
//               >
//                 <option value="">All Sensor Types</option>
//                 {sensorTypes.map((st) => (
//                   <option key={st.id} value={st.id}>
//                     {st.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//           </div>
//         }
//       />
//     </div>
//   );
// };

// export default SensorLogReport;



// import React, { useEffect, useState, useContext } from "react";
// import DataTable from "../../components/table/DataTable";
// import { getUserDataCenters } from "../../api/settings/dataCenterApi";
// import { userContext } from '../../context/UserContext';
// import moment from "moment";
// import { fetchSensorTypeLists } from "../../api/sensorListApi";
// import { SensorLogReport as fetchSensorLogReport } from "../../api/reportApi";

// const SensorLogReport = () => {
//   const { user } = useContext(userContext);
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [totalRows, setTotalRows] = useState(0);

//   const [filters, setFilters] = useState({
//     data_center_id: "",
//     sensor_type_list_id: "",
//     from_date: "",
//     to_date: ""
//   });

//   const [datacenters, setDatacenters] = useState([]);
//   const [sensorTypes, setSensorTypes] = useState([]);

//   // 🔥 Datacenters
//   useEffect(() => {
//     const fetchDatacenters = async () => {
//       try {
//         const res = await getUserDataCenters(user?.id);
//         setDatacenters(res.data || []);
//       } catch (err) {
//         console.error("❌ Datacenter error:", err);
//       }
//     };

//     if (user?.id) fetchDatacenters();
//   }, [user?.id]);

//   // 🔥 Sensor Types (FIXED HERE)
//   useEffect(() => {
//     const fetchSensorTypes = async () => {
//       try {
//         const res = await fetchSensorTypeLists();

//         console.log("Sensor Types Raw:", res);

//         // ✅ FIX: res itself is the array
//         setSensorTypes(res || []);

//       } catch (err) {
//         console.error("❌ Sensor types error:", err);
//       }
//     };

//     fetchSensorTypes();
//   }, []);

//   // 🔥 Fetch Table Data
//     const fetchData = async () => {
//     setLoading(true);
//     try {
//         const res = await fetchSensorLogReport({
//         from_date: filters.from_date,
//         to_date: filters.to_date,
//         data_center_id: filters.data_center_id || undefined,
//         sensor_type_list_id: filters.sensor_type_list_id || undefined,
//         });

//         console.log("API RESPONSE:", res);

//         // ✅ FIX HERE
//         setRows(res.data || []);
//         setTotalRows(res.count || 0);

//     } catch (err) {
//         console.error("❌ Error fetching sensor data:", err);
//         setRows([]);
//         setTotalRows(0);
//     } finally {
//         setLoading(false);
//     }
//     };

//   // 🔥 Submit
//   const handleSubmit = () => {
//     if (!filters.from_date || !filters.to_date) {
//       alert("From Date and To Date are required");
//       return;
//     }

//     if (filters.from_date > filters.to_date) {
//       alert("From Date cannot be greater than To Date");
//       return;
//     }

//     setPage(1);
//     fetchData();
//   };

//   const handleFilterChange = (newFilters) => {
//     setFilters((prev) => ({
//       ...prev,
//       ...newFilters
//     }));
//   };

//   const handleDateChange = (fieldName, value) => {
//     handleFilterChange({ [fieldName]: value });
//   };

//   const columns = [
//     { key: "sensor_id", header: "Sensor ID" },
//     { key: "datacenter_name", header: "Data Center" },
//     { key: "sensor_name", header: "Sensor Name" },
//     { key: "value", header: "Value" },
//     {
//       key: "status",
//       header: "Status",
//       render: (val) => (
//         <span style={{
//           color: val === "High" ? "red" : val === "Normal" ? "green" : "orange",
//           fontWeight: "bold"
//         }}>
//           {val}
//         </span>
//       )
//     },
//     { key: "sensor_type_name", header: "Sensor Type" },
//     { key: "location", header: "Location" },
//     {
//       key: "created_at",
//       header: "Date & Time",
//       render: (val) =>
//         val ? moment(val).format("DD MMM YYYY, hh:mm:ss A") : "-"
//     },
//   ];

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Sensor Log Report</h2>

//       <DataTable
//         title="Sensor Logs"
//         data={rows}
//         columns={columns}
//         isBackendPagination={false}
//         totalRows={totalRows}
//         page={page}
//         pageSize={pageSize}
//         setPage={setPage}
//         setPageSize={setPageSize}
//         searchable={true}
//         selection={false}
//         showId={false}
//         loading={loading}

//         filterComponent={
//           <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "center" }}>

//             {/* From Date */}
//             <div style={{ display: "flex", flexDirection: "column" }}>
//               <label style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "5px" }}>
//                 From Date
//               </label>
//               <input
//                 type="date"
//                 value={filters.from_date}
//                 onChange={(e) => handleDateChange('from_date', e.target.value)}
//                 style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
//               />
//             </div>

//             {/* To Date */}
//             <div style={{ display: "flex", flexDirection: "column" }}>
//               <label style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "5px" }}>
//                 To Date
//               </label>
//               <input
//                 type="date"
//                 value={filters.to_date}
//                 onChange={(e) => handleDateChange('to_date', e.target.value)}
//                 style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
//               />
//             </div>

//             {/* Data Center */}
//             <div style={{ display: "flex", flexDirection: "column" }}>
//               <select
//                 value={filters.data_center_id}
//                 onChange={(e) =>
//                   handleFilterChange({ data_center_id: e.target.value })
//                 }
//                 style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
//               >
//                 <option value="">All Data Centers</option>
//                 {datacenters.map((dc) => (
//                   <option key={dc.id} value={dc.id}>{dc.name}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Sensor Type */}
//             <div style={{ display: "flex", flexDirection: "column" }}>
//               <select
//                 value={filters.sensor_type_list_id}
//                 onChange={(e) =>
//                   handleFilterChange({ sensor_type_list_id: e.target.value })
//                 }
//                 style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
//               >
//                 <option value="">All Sensor Types</option>
//                 {sensorTypes.map((st) => (
//                   <option key={st.id} value={st.id}>{st.name}</option>
//                 ))}
//               </select>
//             </div>

//             {/* Submit */}
//             <div style={{ display: "flex", alignItems: "flex-end" }}>
//               <button
//                 onClick={handleSubmit}
//                 style={{
//                   padding: "8px 16px",
//                   borderRadius: "4px",
//                   border: "none",
//                   backgroundColor: "#2a67eb",
//                   color: "#fff",
//                   cursor: "pointer",
//                   fontWeight: "bold"
//                 }}
//               >
//                 Submit
//               </button>
//             </div>

//           </div>
//         }
//       />
//     </div>
//   );
// };

// export default SensorLogReport;



import React, { useEffect, useState, useContext } from "react";
import DataTable from "../../components/table/DataTable";
import { getUserDataCenters } from "../../api/settings/dataCenterApi";
import { userContext } from '../../context/UserContext';
import moment from "moment";
import { fetchSensorTypeLists } from "../../api/sensorListApi";
import { SensorLogReport as fetchSensorLogReport } from "../../api/reportApi";

// 🔥 Excel
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const SensorLogReport = () => {
  const { user } = useContext(userContext);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalRows, setTotalRows] = useState(0);

  const [filters, setFilters] = useState({
    data_center_id: "",
    sensor_type_list_id: "",
    from_date: "",
    to_date: ""
  });

  const [datacenters, setDatacenters] = useState([]);
  const [sensorTypes, setSensorTypes] = useState([]);

  // 🔥 Datacenters
  useEffect(() => {
    if (user?.id) {
      getUserDataCenters(user.id)
        .then(res => setDatacenters(res.data || []))
        .catch(err => console.error(err));
    }
  }, [user?.id]);

  // 🔥 Sensor Types
  useEffect(() => {
    fetchSensorTypeLists()
      .then(res => setSensorTypes(res || []))
      .catch(err => console.error(err));
  }, []);

  // 🔥 Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetchSensorLogReport({
        from_date: filters.from_date,
        to_date: filters.to_date,
        data_center_id: filters.data_center_id || undefined,
        sensor_type_list_id: filters.sensor_type_list_id || undefined,
      });

      setRows(res.data || []);
      setTotalRows(res.count || 0);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Submit
  const handleSubmit = () => {
    if (!filters.from_date || !filters.to_date) {
      alert("Date is required");
      return;
    }
    fetchData();
  };

  // 🔥 Export Excel
  const handleExport = () => {
    if (!rows.length) {
      alert("No data to export");
      return;
    }

    const exportData = rows.map(row => ({
      "Sensor ID": row.sensor_id,
      "Data Center": row.datacenter_name,
      "Sensor Name": row.sensor_name,
      "Value": row.value,
      "Status": row.status,
      "Sensor Type": row.sensor_type_name,
      "Location": row.location,
      "Date Time": moment(row.created_at).format("DD MMM YYYY, hh:mm:ss A")
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sensor Logs");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });

    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, `sensor_logs_${Date.now()}.xlsx`);
  };

  const columns = [
    { key: "sensor_id", header: "Sensor ID" },
    { key: "datacenter_name", header: "Data Center" },
    { key: "sensor_name", header: "Sensor Name" },
    { key: "value", header: "Value" },
    {
      key: "status",
      header: "Status",
      render: (val) => (
        <span style={{
          color: val === "High" ? "red" : val === "Normal" ? "green" : "orange",
          fontWeight: "bold"
        }}>
          {val}
        </span>
      )
    },
    { key: "sensor_type_name", header: "Sensor Type" },
    { key: "location", header: "Location" },
    {
      key: "created_at",
      header: "Date & Time",
      render: (val) =>
        val ? moment(val).format("DD MMM YYYY, hh:mm:ss A") : "-"
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Sensor Log Report</h2>

      <DataTable
        title="Sensor Logs"
        data={rows}
        columns={columns}
        totalRows={totalRows}
        page={page}
        pageSize={pageSize}
        setPage={setPage}
        setPageSize={setPageSize}
        loading={loading}

        filterComponent={
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "15px",
            width: "100%"
          }}>

            {/* LEFT SIDE */}
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>

              <div>
                <label style={labelStyle}>From Date</label>
                <input type="date"
                  value={filters.from_date}
                  onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>To Date</label>
                <input type="date"
                  value={filters.to_date}
                  onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Data Center</label>
                <select
                  value={filters.data_center_id}
                  onChange={(e) => setFilters({ ...filters, data_center_id: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">All</option>
                  {datacenters.map(dc => (
                    <option key={dc.id} value={dc.id}>{dc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Sensor Type</label>
                <select
                  value={filters.sensor_type_list_id}
                  onChange={(e) => setFilters({ ...filters, sensor_type_list_id: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">All</option>
                  {sensorTypes.map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* RIGHT SIDE BUTTONS */}
            <div style={{ display: "flex", gap: "10px" }}>

              <button onClick={handleSubmit} style={btnPrimary}>
                Submit
              </button>

              <button onClick={handleExport} style={btnSecondary}>
                Export Excel
              </button>

            </div>
          </div>
        }
      />
    </div>
  );
};

// 🔥 Styles
const labelStyle = {
  fontSize: "12px",
  fontWeight: "bold",
  marginBottom: "5px",
  display: "block"
};

const inputStyle = {
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  minWidth: "150px"
};

const btnPrimary = {
  padding: "8px 16px",
  borderRadius: "4px",
  border: "none",
  backgroundColor: "#2a67eb",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold"
};

const btnSecondary = {
  padding: "8px 16px",
  borderRadius: "4px",
  border: "1px solid #2a67eb",
  backgroundColor: "#fff",
  color: "#2a67eb",
  cursor: "pointer",
  fontWeight: "bold"
};

export default SensorLogReport;