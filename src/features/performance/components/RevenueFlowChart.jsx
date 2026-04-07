import React from 'react';
import { Typography } from '@mui/material';
import LineChart from '../../../components/shared/charts/LineChart';

export default function RevenueFlowChart({ data = [] }) {
  return (
    <div className="kam-performance-chart">
      <div className="kam-performance-card__header">
        <Typography variant="h6" className="kam-performance-card__title">
          Total Revenue Flow
        </Typography>
        <Typography className="kam-performance-card__subtitle">
          Monthly revenue trend for KAM performance tracking.
        </Typography>
      </div>

      <LineChart
        title=""
        data={data}
        xKey="month"
        height={320}
        lines={[
          { dataKey: 'revenue', name: 'Revenue', color: '#2563eb' },
        ]}
      />
    </div>
  );
}
