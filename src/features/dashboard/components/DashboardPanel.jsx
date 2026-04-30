import { Box, Typography } from "@mui/material";

export default function DashboardPanel({ title, children, className = "" }) {
  return (
    <Box className={`crm-panel ${className}`}>
      {title && <Typography component="h2" className="crm-panel-title">{title}</Typography>}
      {children}
    </Box>
  );
}
