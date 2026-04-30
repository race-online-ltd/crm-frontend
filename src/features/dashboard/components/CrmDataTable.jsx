import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

const formatMoney = (value) => new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
}).format(value);

const formatValue = (value, type) => {
  if (type === "money") return formatMoney(value);
  if (type === "percent") return `${Number(value).toFixed(1)}%`;
  return value;
};

export default function CrmDataTable({ title, columns, rows, compact = false, className = "" }) {
  return (
    <Box className={`crm-table-panel ${className}`.trim()}>
      <Typography component="h2" className="crm-panel-title">{title}</Typography>
      <TableContainer className="crm-table-container">
        <Table size={compact ? "small" : "medium"} stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.key} align={column.align || "left"}>{column.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={row.id || row.entity || row.channel || row.kam || rowIndex}>
                {columns.map((column, columnIndex) => (
                  <TableCell
                    key={column.key}
                    align={column.align || (columnIndex === 0 ? "left" : "right")}
                    className={column.heat ? `heat-${column.heat}` : ""}
                  >
                    {formatValue(row[column.key], column.type)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
