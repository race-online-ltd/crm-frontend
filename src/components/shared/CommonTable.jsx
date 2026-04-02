import React from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Typography, Box
} from '@mui/material';
import TableChartIcon from '@mui/icons-material/TableChart';

const CommonTable = ({ 
  title = "Table Title", 
  columns = [], 
  rows = [], 
  dynamicHeaderLabel = "", // মাঝের বড় হেডার লেবেল
  maxHeight = 600,
  footerName = "Grand Total",
  showFooter = true,
  stickyLeftColumn = "", // কোন আইডিটি বামে স্টিকি হবে (e.g., 'kamName')
  stickyRightColumns = [], // কোন আইডিগুলো ডানে স্টিকি হবে (Array of strings)
  columnWidths = {} // কাস্টম উইডথ (e.g., { kamName: 200 })
}) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // ডায়নামিক টোটাল ক্যালকুলেশন
  const calculateTotal = (columnId) => {
    const total = rows.reduce((sum, row) => {
      const val = row[columnId];
      if (typeof val === 'string') {
        const numeric = parseFloat(val.replace(/[%,৳,]/g, '')) || 0;
        return sum + numeric;
      }
      return sum + (Number(val) || 0);
    }, 0);
    return total;
  };

  // রাইট স্টিকি পজিশন ক্যালকুলেট করার ফাংশন
  const getStickyRightPos = (colId) => {
    const index = stickyRightColumns.indexOf(colId);
    if (index === -1) return 'auto';
    
    // বর্তমান কলামের ডানের কলামগুলোর উইডথ যোগফল
    let rightPos = 0;
    for (let i = index + 1; i < stickyRightColumns.length; i++) {
      rightPos += columnWidths[stickyRightColumns[i]] || 100;
    }
    return rightPos;
  };

  return (
    <Paper sx={{ width: '100%', borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
      {/* Table Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: '#fff' }}>
        <TableChartIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
          {title}
        </Typography>
      </Box>

      <TableContainer sx={{ maxHeight }}>
        <Table stickyHeader size="small" sx={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <TableHead>
            {/* ROW 1: Grouped Headers */}
            <TableRow>
              {stickyLeftColumn && (
                <TableCell 
                  rowSpan={2} 
                  sx={{ 
                    bgcolor: '#f8fafc', fontWeight: 700, border: '1px solid #e2e8f0', 
                    minWidth: columnWidths[stickyLeftColumn] || 150,
                    position: 'sticky', left: 0, zIndex: 30 
                  }}
                >
                  {columns.find(c => c.id === stickyLeftColumn)?.label || 'Name'}
                </TableCell>
              )}
              
              <TableCell align="center" colSpan={columns.filter(c => !stickyRightColumns.includes(c.id) && c.id !== stickyLeftColumn).length} 
                sx={{ bgcolor: '#eff6ff', color: '#1e40af', fontWeight: 700, border: '1px solid #e2e8f0' }}>
                {dynamicHeaderLabel}
              </TableCell>

              {stickyRightColumns.length > 0 && (
                <TableCell align="center" colSpan={stickyRightColumns.length} 
                  sx={{ bgcolor: '#f1f5f9', fontWeight: 700, border: '1px solid #e2e8f0', position: 'sticky', right: 0, zIndex: 30 }}>
                  SUMMARY TOTAL
                </TableCell>
              )}
            </TableRow>

            {/* ROW 2: Column Labels */}
            <TableRow>
              {columns.filter(c => c.id !== stickyLeftColumn).map((col) => {
                const rightPos = getStickyRightPos(col.id);
                const isStickyRight = rightPos !== 'auto';

                return (
                  <TableCell 
                    key={col.id} align="center" 
                    sx={{ 
                      bgcolor: isStickyRight ? '#f1f5f9' : '#f8fafc', 
                      fontWeight: 700, fontSize: '0.75rem', border: '1px solid #e2e8f0',
                      position: isStickyRight ? 'sticky' : 'static',
                      right: rightPos,
                      zIndex: isStickyRight ? 31 : 1,
                      minWidth: columnWidths[col.id] || 100
                    }}
                  >
                    {col.label}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, rowIndex) => (
                <TableRow key={rowIndex} hover>
                  {stickyLeftColumn && (
                    <TableCell sx={{ 
                      border: '1px solid #e2e8f0', bgcolor: '#fff', fontWeight: 600, color: '#475569',
                      position: 'sticky', left: 0, zIndex: 2 
                    }}>
                      {row[stickyLeftColumn]}
                    </TableCell>
                  )}
                  
                  {columns.filter(c => c.id !== stickyLeftColumn).map((col) => {
                    const rightPos = getStickyRightPos(col.id);
                    const isStickyRight = rightPos !== 'auto';

                    return (
                      <TableCell 
                        key={col.id} align="center" 
                        sx={{ 
                          border: '1px solid #e2e8f0', fontSize: '0.825rem',
                          bgcolor: isStickyRight ? '#f9fafb' : '#fff',
                          position: isStickyRight ? 'sticky' : 'static',
                          right: rightPos,
                          zIndex: isStickyRight ? 2 : 0
                        }}
                      >
                        {row[col.id] ?? '0'}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}

            {/* GRAND TOTAL FOOTER */}
            {showFooter && (
              <TableRow sx={{ position: 'sticky', bottom: 0, zIndex: 40 }}>
                {stickyLeftColumn && (
                  <TableCell sx={{ 
                    bgcolor: '#1e293b', color: '#fff', fontWeight: 700, border: '1px solid #334155',
                    position: 'sticky', left: 0, zIndex: 41 
                  }}>
                    {footerName}
                  </TableCell>
                )}
                {columns.filter(c => c.id !== stickyLeftColumn).map((col) => {
                  const rightPos = getStickyRightPos(col.id);
                  const isStickyRight = rightPos !== 'auto';
                  const totalValue = calculateTotal(col.id);

                  return (
                    <TableCell 
                      key={`total-${col.id}`} align="center" 
                      sx={{ 
                        bgcolor: isStickyRight ? '#0f172a' : '#1e293b', 
                        color: '#fff', fontWeight: 700, border: '1px solid #334155',
                        position: isStickyRight ? 'sticky' : 'static',
                        right: rightPos,
                        zIndex: 41
                      }}
                    >
                      {col.id.toLowerCase().includes('ach') ? `${totalValue.toFixed(1)}%` : totalValue.toLocaleString()}
                    </TableCell>
                  );
                })}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default CommonTable;