import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { KAM_PERFORMANCE_TABLE_COLUMNS } from '../constants/kamPerformanceData';
import OrbitLoader from '../../../components/shared/OrbitLoader';
import useInitialTableLoading from '../../../components/shared/useInitialTableLoading';

export default function KamPerformanceTable({ rows = [] }) {
  const isLoading = useInitialTableLoading();
  return (
    <Paper elevation={0} className="kam-performance-card kam-performance-card--overview">
      <div className="kam-performance-card__header">
        <Typography variant="h6" className="kam-performance-card__title">
          Performance Overview
        </Typography>
        <Typography className="kam-performance-card__subtitle">
          Review the current performance snapshot of all KAMs.
        </Typography>
      </div>

      <TableContainer className="kam-performance-table">
        {isLoading ? (
          <OrbitLoader title="Loading performance overview" minHeight={220} />
        ) : (
          <Table>
          <TableHead>
            <TableRow>
              {KAM_PERFORMANCE_TABLE_COLUMNS.map((column) => (
                <TableCell key={column.key} className="kam-performance-table__head">
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                {KAM_PERFORMANCE_TABLE_COLUMNS.map((column) => (
                  <TableCell key={column.key} className="kam-performance-table__cell">
                    {row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          </Table>
        )}
      </TableContainer>
    </Paper>
  );
}
