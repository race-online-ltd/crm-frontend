import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function TemporaryTable({ columns, data, setData }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    setRows(data || []);
  }, [data]);

  const handleDelete = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows);
    setData(updatedRows); // sync with parent
  };

  // Compute totals for numeric columns
  const totals = columns.map((col) => {
    if (col.type === "number") {
      return rows.reduce((sum, row) => sum + (Number(row[col.key]) || 0), 0);
    }
    return "";
  });

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.key}>{col.label}</TableCell>
            ))}
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((col) => (
                <TableCell key={col.key}>{row[col.key]}</TableCell>
              ))}
              <TableCell>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(rowIndex)}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
       {/* Total Row */}
<TableRow  sx={{
    backgroundColor: "#a8a8a8", // light gray background
    fontWeight: "bold",         // bold text
  }} >
  {columns.map((col, idx) => (
    <TableCell key={col.key}>
      {idx === 0 ? (
        <strong>Total</strong> // Total label in first column
      ) : col.type === "number" ? (
        <strong>{totals[idx]}</strong> // Numeric totals
      ) : (
        ""
      )}
    </TableCell>
  ))}
</TableRow>

        </TableBody>
      </Table>
    </TableContainer>
  );
}
