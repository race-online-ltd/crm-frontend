import React from 'react';
import { Paper, Typography } from '@mui/material';

export default function TopPerformersCard({ items = [] }) {
  return (
    <Paper elevation={0} className="kam-performance-card kam-performance-card--performers">
      <div className="kam-performance-card__header">
        <Typography variant="h6" className="kam-performance-card__title">
          Top Performers
        </Typography>
        <Typography className="kam-performance-card__subtitle">
          KAMs driving the strongest revenue performance.
        </Typography>
      </div>

      <div className="kam-performance-list">
        {items.map((item, index) => (
          <div key={item.id} className="kam-performance-list__item">
            <div className="kam-performance-list__performer">
              <div className="kam-performance-list__rank">{index + 1}</div>
              <div>
                <Typography className="kam-performance-list__title">{item.kamName}</Typography>
                <Typography className="kam-performance-list__meta">Growth {item.growth}</Typography>
              </div>
            </div>
            <Typography className="kam-performance-list__value">{item.revenue}</Typography>
          </div>
        ))}
      </div>
    </Paper>
  );
}
