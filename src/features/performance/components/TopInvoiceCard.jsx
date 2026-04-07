import React from 'react';
import { Paper, Typography } from '@mui/material';

export default function TopInvoiceCard({ items = [] }) {
  return (
    <Paper elevation={0} className="kam-performance-card kam-performance-card--invoice">
      <div className="kam-performance-card__header">
        <Typography variant="h6" className="kam-performance-card__title">
          Top Invoice
        </Typography>
        <Typography className="kam-performance-card__subtitle">
          Highest invoice values in the current period.
        </Typography>
      </div>

      <div className="kam-performance-list">
        {items.map((item) => (
          <div key={item.id} className="kam-performance-list__item">
            <div>
              <Typography className="kam-performance-list__title">{item.clientName}</Typography>
              <Typography className="kam-performance-list__meta">{item.month}</Typography>
            </div>
            <Typography className="kam-performance-list__value">{item.amount}</Typography>
          </div>
        ))}
      </div>
    </Paper>
  );
}
