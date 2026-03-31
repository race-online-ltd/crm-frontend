import React, { useEffect, useState,useContext } from "react";
import DataTable from "../../components/table/DataTable";
import { alarmLogs } from "../../api/alarmApi";
import { getUserDataCenters } from "../../api/settings/dataCenterApi";
import { userContext } from '../../context/UserContext';
import moment from "moment";


const AlarmReport = () => {
  const { user } = useContext(userContext);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const [filters, setFilters] = useState({
    datacenter: "",
    status: ""
  });

  // 🔥 ONLY datacenter
  const [datacenters, setDatacenters] = useState([]);

  // 🔥 fetch datacenter
  useEffect(() => {
    const fetchDatacenters = async () => {
      try {
        const res = await getUserDataCenters(user?.id)

        setDatacenters(res.data || []);
        console.log("✅ Datacenters fetched:", res.data);

      } catch (err) {
        console.error("❌ Datacenter error:", err);
      }
    };

    fetchDatacenters();
  }, []);

  // 🔥 fetch table data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await alarmLogs({
        page,
        per_page: pageSize,
        ...filters
      });

      setRows(res.data.data);
      setTotalRows(res.data.total);

    } catch (err) {
      console.error("❌ Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, filters]);

  // 🔥 filter handler
  const handleFilterChange = (newFilters) => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      ...newFilters
    }));
  };

  const columns = [
    { key: "datacenter_name", header: "Datacenter" },
    { key: "sensor_type", header: "Sensor Type" },
    { key: "sensor_name", header: "Sensor" },
    { key: "alarm_value", header: "Value" },
    { key: "alarm_raised_at", header: "Alarm Raised At" 
       ,render: (val) =>
      val ? moment(val).format("DD MMM YYYY, hh:mm:ss A") : "-"
  
    },
    { key: "location", header: "Location" },
    { key: "acknowledge_status", header: "Status"
      ,render: (val) => (
    <span style={{
      color: val === "Acknowledged" ? "green" : "red",
      fontWeight: "bold"
    }}>
      {val}
    </span>
  )
    },
    { key: "acknowledge_by", header: "Acknowledge By" },
     { key: "description", header: "Comment" },
    { key: "acknowledge_at", header: "Acknowledge Time" 
      , render: (value) => value ? moment(value).format("DD MMM YYYY, hh:mm:ss A") : "-"
    },
  ];

  return (
    <div>
      <h2>Alarm Report</h2>

      <DataTable
        title="Alarm Logs"
        data={rows}
        columns={columns}

        isBackendPagination={true}
        totalRows={totalRows}
        page={page}
        pageSize={pageSize}
        setPage={setPage}
        setPageSize={setPageSize}
        onFilterChange={handleFilterChange}

        searchable={true}
        selection={false}
        showId={true}

        // 🔥 ONLY DATACENTER FILTER
        filterComponent={
          <div style={{ display: "flex", gap: "10px" }}>

            {/* Datacenter */}
            <select
              value={filters.datacenter}
              onChange={(e) =>
                handleFilterChange({ datacenter: e.target.value })
              }
            >
              <option value="">All Data Centers</option>
              {datacenters.map((dc) => (
                <option key={dc.id} value={dc.id}>
                  {dc.name}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={filters.status}
              onChange={(e) =>
                handleFilterChange({ status: e.target.value })
              }
            >
              <option value="">All Status</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="Not Acknowledged">Not Acknowledged</option>
            </select>

          </div>
        }
      />
    </div>
  );
};

export default AlarmReport;