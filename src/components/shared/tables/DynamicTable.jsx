import React, { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  Checkbox,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

export default function DynamicTable({ fields, rows }) {
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dense, setDense] = useState(false);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState(fields[0] ? `col0` : "");

  // Columns derived from fields
  const columns = useMemo(
    () => fields.map((field, idx) => ({ id: `col${idx}`, label: field, sortable: true })),
    [fields]
  );

  // Sorting helpers
  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
  };

  const getComparator = (order, orderBy) =>
    order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(rows.map((_, idx) => idx));
    } else {
      setSelected([]);
    }
  };

  const handleClick = (index) => {
    const selectedIndex = selected.indexOf(index);
    let newSelected = [];
    if (selectedIndex === -1) newSelected = newSelected.concat(selected, index);
    else if (selectedIndex === 0) newSelected = newSelected.concat(selected.slice(1));
    else if (selectedIndex === selected.length - 1) newSelected = newSelected.concat(selected.slice(0, -1));
    else if (selectedIndex > 0)
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Visible rows with sorting & paging
  const visibleRows = useMemo(
    () =>
      [...rows]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [rows, order, orderBy, page, rowsPerPage]
  );

  return (
    <Box>
      <Paper sx={{ width: "100%", mb: 2, borderRadius: 2, overflow: "hidden", border: "1px solid #e2e8f0" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2.5, backgroundColor: "#fff" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
            Dynamic Table
          </Typography>
        </Stack>
        <Divider />

        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader size={dense ? "small" : "medium"}>
            <TableHead sx={{ backgroundColor: "#f8fafc" }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < rows.length}
                    checked={rows.length > 0 && selected.length === rows.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    sortDirection={orderBy === col.id ? order : false}
                    sx={{ fontWeight: 700, color: "#475569", fontSize: "0.875rem" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, cursor: "pointer" }}
                      onClick={() => handleRequestSort(col.id)}
                    >
                      {col.label}
                    </Typography>
                  </TableCell>
                ))}
                <TableCell align="center" sx={{ fontWeight: 700, color: "#475569" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {visibleRows.map((row, idx) => {
                const rowIndex = page * rowsPerPage + idx;
                const isItemSelected = selected.includes(rowIndex);
                return (
                  <TableRow
                    hover
                    key={rowIndex}
                    selected={isItemSelected}
                    onClick={() => handleClick(rowIndex)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox color="primary" checked={isItemSelected} />
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell key={col.id} sx={{ color: "#64748b", fontSize: "0.875rem" }}>
                        {row[col.id]}
                      </TableCell>
                    ))}
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                            <EditIcon sx={{ color: "#94a3b8", fontSize: "1.2rem" }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                            <DeleteIcon sx={{ color: "#ef4444", fontSize: "1.2rem" }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider />

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ backgroundColor: "#fff" }}
        />
      </Paper>

      <FormControlLabel
        control={<Switch checked={dense} onChange={(e) => setDense(e.target.checked)} size="small" />}
        label={<Typography variant="body2" color="textSecondary">Dense padding</Typography>}
        sx={{ ml: 0.5 }}
      />
    </Box>
  );
}
