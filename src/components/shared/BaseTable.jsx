import * as React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Paper,
  Checkbox,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  Typography,
  Stack,
  Divider,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExportCSVButton from "./ExportCSVButton";
import FilterButton from "./FilterButton";
import OrbitLoader from "./OrbitLoader";

// ------------------------ Sorting Helpers ------------------------
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// ------------------------ Table Head ------------------------
function BaseTableHead({
  columns,
  order,
  orderBy,
  numSelected,
  rowCount,
  onSelectAllClick,
  onRequestSort,
  hasAction,
}) {
  const createSortHandler = (property) => (event) => onRequestSort(event, property);

  return (
    <TableHead sx={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "#f8fafc" }}>
      <TableRow>
        {columns.some((col) => col.selectable) && (
          <TableCell padding="checkbox" sx={{ backgroundColor: "#f8fafc" }}>
            <Checkbox
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
            />
          </TableCell>
        )}
        {columns.map((column) => (
          <TableCell
            key={column.id}
            align={column.numeric ? "right" : "left"}
            padding={column.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === column.id ? order : false}
            sx={{ 
              backgroundColor: "#f8fafc", 
              fontWeight: 700, 
              color: "#475569",
              fontSize: "0.875rem"
            }}
          >
            {column.sortable ? (
              <TableSortLabel
                active={orderBy === column.id}
                direction={orderBy === column.id ? order : "asc"}
                onClick={createSortHandler(column.id)}
              >
                {column.label}
                {orderBy === column.id && (
                  <Box component="span" sx={visuallyHidden}>
                    {order === "desc" ? "sorted descending" : "sorted ascending"}
                  </Box>
                )}
              </TableSortLabel>
            ) : (
              column.label
            )}
          </TableCell>
        ))}
        {hasAction && (
          <TableCell align="center" sx={{ backgroundColor: "#f8fafc", fontWeight: 700, color: "#475569" }}>
            Actions
          </TableCell>
        )}
      </TableRow>
    </TableHead>
  );
}

// ------------------------ Reusable BaseTable ------------------------
export default function BaseTable({
  columns,
  rows,
  title,
  selectable = true,
  hasAction = true,
  onEditRow,
  onDeleteRow,
  onFilter,
  onExport,
  showToolbar = true,
  showExportButton = true,
  showFilterButton = true,
  showDenseToggle = true,
  toolbarContent = null,
  showEditAction = true,
  showDeleteAction = true,
  emptyMessage = "No data found",
  loading = false,
  loadingContent = null,
}) {
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState(columns[0]?.id || "");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(rows.map((r) => r.id));
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    if (!selectable) return;
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) newSelected = newSelected.concat(selected, id);
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

  const visibleRows = React.useMemo(
    () =>
      [...rows]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, rows]
  );

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Paper 
        sx={{ 
          width: "100%", 
          mb: 2, 
          borderRadius: "12px", 
          overflow: "hidden", 
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e2e8f0"
        }}
      >
        {showToolbar && (
          <>
            <Stack 
              direction="row" 
              justifyContent="space-between" 
              alignItems="center" 
              sx={{ p: 2.5, backgroundColor: "#fff" }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
                {title}
              </Typography>
              {toolbarContent || (
                <Stack direction="row" spacing={1.5}>
                  {showExportButton && (
                    <ExportCSVButton columns={columns} rows={rows} filename={`${title}.csv`} onClick={onExport} />
                  )}
                  {showFilterButton && onFilter && <FilterButton onClick={onFilter} />}
                </Stack>
              )}
            </Stack>

            <Divider />
          </>
        )}

        {/* Table Content with Sticky Header */}
        <TableContainer sx={{ maxHeight: 440 }}> {/* আপনি আপনার প্রয়োজন মতো হাইট সেট করতে পারেন */}
          <Table stickyHeader sx={{ minWidth: 750 }} size={dense ? "small" : "medium"}>
            <BaseTableHead
              columns={columns.map((col) => ({ ...col, selectable }))}
              order={order}
              orderBy={orderBy}
              numSelected={selected.length}
              rowCount={rows.length}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              hasAction={hasAction}
            />
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (selectable ? 1 : 0) + (hasAction ? 1 : 0)}
                    align="center"
                    sx={{ py: 3, px: 2, bgcolor: "#fff" }}
                  >
                    {loadingContent || (
                      <OrbitLoader title={`Loading ${title}`} minHeight={220} />
                    )}
                  </TableCell>
                </TableRow>
              ) : visibleRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (selectable ? 1 : 0) + (hasAction ? 1 : 0)}
                    align="center"
                    sx={{ py: 7, color: "#94a3b8", fontSize: "0.875rem" }}
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : visibleRows.map((row) => {
                const isItemSelected = selected.includes(row.id);
                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ cursor: selectable ? "pointer" : "default" }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox color="primary" checked={isItemSelected} />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.numeric ? "right" : "left"}
                        sx={{ color: "#64748b", fontSize: "0.875rem" }}
                      >
                        {row[column.id]}
                      </TableCell>
                    ))}
                    {hasAction && (
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          {showEditAction && (
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEditRow?.(row); }}>
                                <EditIcon sx={{ color: "#94a3b8", fontSize: "1.2rem" }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {showDeleteAction && (
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDeleteRow?.(row); }}>
                                <DeleteIcon sx={{ color: "#ef4444", fontSize: "1.2rem" }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider />

        {/* Pagination Section */}
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

      {showDenseToggle && (
        <FormControlLabel
          control={<Switch checked={dense} onChange={(e) => setDense(e.target.checked)} size="small" />}
          label={<Typography variant="body2" color="textSecondary">Dense padding</Typography>}
          sx={{ ml: 0.5 }}
        />
      )}
    </Box>
  );
}

BaseTable.propTypes = {
  columns: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  selectable: PropTypes.bool,
  hasAction: PropTypes.bool,
  onEditRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
  onFilter: PropTypes.func,
  onExport: PropTypes.func,
  showToolbar: PropTypes.bool,
  showExportButton: PropTypes.bool,
  showFilterButton: PropTypes.bool,
  showDenseToggle: PropTypes.bool,
  emptyMessage: PropTypes.string,
  loading: PropTypes.bool,
  loadingContent: PropTypes.node,
  toolbarContent: PropTypes.node,
  showEditAction: PropTypes.bool,
  showDeleteAction: PropTypes.bool,
};
