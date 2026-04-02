// src/components/shared/ExportCSVButton.jsx
import React from "react";
import { Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PropTypes from "prop-types";

export default function ExportCSVButton({ columns, rows, filename, onClick, color }) {
  const handleExport = () => {
    if (onClick) return onClick(); // allow custom handler
    if (!rows || !rows.length) return;

    const header = columns.map((col) => col.label).join(",");
    const csvRows = rows.map((row) =>
      columns.map((col) => `"${row[col.id]}"`).join(",")
    );
    const csvContent = [header, ...csvRows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename || "table.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant="contained"
      startIcon={<DownloadIcon />}
      onClick={handleExport}
      sx={{
        backgroundColor: color || "#34A853", // default green
        color: "#fff",
        "&:hover": {
          backgroundColor: color ? color : "#2c8b46", // darker shade on hover
        },
      }}
    >
      Export CSV
    </Button>
  );
}

ExportCSVButton.propTypes = {
  columns: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
  filename: PropTypes.string,
  onClick: PropTypes.func,
  color: PropTypes.string, // custom color prop
};
