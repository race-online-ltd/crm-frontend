import { Box, Typography } from "@mui/material";

export default function MetricCards({ metrics }) {
  return (
    <Box className="crm-metric-grid">
      {metrics.map((metric) => (
        <Box key={metric.label} className={`crm-metric-card tone-${metric.tone}`}>
          <Typography className="crm-metric-label">{metric.label}</Typography>
          <Typography className="crm-metric-value">{metric.value}</Typography>
        </Box>
      ))}
    </Box>
  );
}
